"use client";
import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Box,
  Container,
  Typography,
  Button,
  TextField,
  Modal,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  Card,
  CardContent,
  Divider,
  IconButton,
  InputAdornment,
  Paper,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
} from "@mui/material";
import { styled } from "@mui/system";
import ClearIcon from "@mui/icons-material/Clear";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import KitchenIcon from "@mui/icons-material/Kitchen";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import { firestore } from "@/firebase";
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";
import { differenceInDays, parseISO } from "date-fns";

const StyledPaper = styled(Paper)({
  padding: "24px",
  margin: "16px 0",
  backgroundColor: "#f8f8f8",
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
});

const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const ModalContent = styled(Box)({
  backgroundColor: "#ffffff",
  borderRadius: 8,
  boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
  padding: "32px",
  width: 400,
});

const PantryItem = styled(ListItem, {
  shouldForwardProp: (prop) => prop !== "expired",
})(({ expired }) => ({
  backgroundColor: expired ? "#ffcccb" : "#ffffff",
  borderRadius: 8,
  marginBottom: "16px",
  boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
}));

const unitOptions = [
  "g",
  "kg",
  "lbs",
  "oz", // Weight
  "gal",
  "ml",
  "L",
  "cups",
  "tbsp",
  "tsp",
  "fl oz", // Volume
  "pcs",
  "packs",
  "cans",
  "jars",
  "bottles", // Count
  "slices",
  "servings",
  "loaves",
  "sticks",
  "bars",
];

export default function Home() {
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [expirationDate, setExpirationDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");
  const [recipe, setRecipe] = useState("");
  const [generating, setGenerating] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const handleConfirmOpen = () => {
    setConfirmOpen(true);
  };

  const handleConfirmClose = () => {
    setConfirmOpen(false);
  };

  const handleDeleteExpiredItems = () => {
    deleteExpiredItems();
    setConfirmOpen(false);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
    setItemName("");
    setQuantity(1);
    setUnit("pcs");
    setExpirationDate("");
    setError("");
  };

  const updatePantry = async () => {
    const snapshot = query(collection(firestore, "pantry"));
    const docs = await getDocs(snapshot);
    const pantryList = [];
    docs.forEach((doc) => {
      pantryList.push({ id: doc.id, ...doc.data() });
    });
    console.log(pantryList);
    setPantry(pantryList);
  };

  useEffect(() => {
    updatePantry();
  }, []);

  const filteredPantry = useMemo(() => {
    return pantry.filter((item) =>
      item.name.includes(searchText.toLowerCase())
    );
  }, [pantry, searchText]);

  const addOrUpdateItem = async (itemName, quantity, unit, expirationDate) => {
    const collectionRef = collection(firestore, "pantry");
    const docRef = editingItem
      ? doc(collectionRef, editingItem.id)
      : doc(collectionRef);
    await setDoc(
      docRef,
      {
        name: itemName.toLowerCase(),
        quantity: quantity,
        unit: unit,
        expirationDate: expirationDate,
      },
      { merge: true }
    );
    await updatePantry();
  };

  const handleEditOpen = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setExpirationDate(item.expirationDate || "");
    setOpen(true);
  };

  const deleteItem = async (id) => {
    const docRef = doc(firestore, "pantry", id);
    await deleteDoc(docRef);
    await updatePantry();
  };

  const handleAddOrUpdateItem = () => {
    if (!itemName.trim()) {
      setError("Item name is required.");
      return;
    }
    if (quantity <= 0) {
      setError("Quantity must be greater than 0.");
      return;
    }
    setError("");
    addOrUpdateItem(itemName, quantity, unit, expirationDate);
    handleClose();
  };

  const deleteExpiredItems = () => {
    const expiredItems = pantry.filter(
      (item) => calculateDaysUntilExpiration(item.expirationDate) === "Expired"
    );
    expiredItems.forEach((item) => deleteItem(item.id));
  };

  const fetchRecipeRecommendations = async (ingredients) => {
    try {
      const response = await axios.post("/api/recipes", { ingredients });
      const responseData = response.data;

      // Log the raw response for debugging
      console.log("Raw response:", responseData);

      // Check if the response is already a JSON object
      if (typeof responseData === "object" && responseData !== null) {
        return responseData;
      }

      // If it's a string, try to parse it as JSON
      if (typeof responseData === "string") {
        try {
          return JSON.parse(responseData);
        } catch (parseError) {
          console.error("Error parsing JSON:", parseError);
          throw new Error("Invalid response format");
        }
      }

      throw new Error("Unexpected response format");
    } catch (error) {
      console.error("Error fetching recipe recommendations:", error);
      throw new Error("Failed to fetch recipe recommendations");
    }
  };

  const fetchRecipe = async () => {
    setGenerating(true);
    const ingredientList = pantry.map(
      (item) => `${item.name} (${item.quantity} ${item.unit})`
    );
    fetchRecipeRecommendations(ingredientList, String(recipe.title))
      .then((recipes) => {
        setRecipe(recipes);
        setGenerating(false);
      })
      .catch((error) => {
        console.error("Failed to fetch recipes:", error);
        setGenerating(false);
      });
  };

  // Function to calculate days until expiration
  const calculateDaysUntilExpiration = (expirationDate) => {
    const today = new Date();
    const expiration = parseISO(expirationDate);
    const expiresIn = differenceInDays(expiration, today) + 1;
    if (expiresIn > 0) return `Expires in ${expiresIn} days`;
    return "Expired";
  };

  return (
    <Container maxWidth="xl">
      <Grid container spacing={4}>
        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h4" gutterBottom>
              <KitchenIcon sx={{ mr: 1 }} />
              Pantry Management
            </Typography>
            <Box display="flex" mb={2}>
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpen}
                sx={{ mr: 2 }}
              >
                Add New Item
              </Button>
              <TextField
                fullWidth
                variant="outlined"
                label="Search"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                InputProps={{
                  endAdornment: searchText && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setSearchText("")}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>
            <List>
              {filteredPantry.map(
                ({ id, name, quantity, unit, expirationDate }) => {
                  const expiration = expirationDate
                    ? calculateDaysUntilExpiration(expirationDate)
                    : "N/A";
                  return (
                    <PantryItem key={id} expired={expiration === "Expired"}>
                      <Grid container alignItems="center" spacing={2}>
                        <Grid item xs={12} sm={3}>
                          <Typography variant="subtitle1">
                            {name.charAt(0).toUpperCase() + name.slice(1)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body1">
                            {quantity} {unit}
                          </Typography>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Typography variant="body2" color="textSecondary">
                            {expiration}
                          </Typography>
                        </Grid>
                        <Grid item xs={12} sm={3}>
                          <Box display="flex" justifyContent="flex-end">
                            <IconButton
                              onClick={() =>
                                handleEditOpen({
                                  id,
                                  name,
                                  quantity,
                                  unit,
                                  expirationDate,
                                })
                              }
                              color="primary"
                              size="small"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              onClick={() => deleteItem(id)}
                              color="error"
                              size="small"
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Box>
                        </Grid>
                      </Grid>
                    </PantryItem>
                  );
                }
              )}
            </List>
            <Button
              variant="contained"
              color="warning"
              onClick={handleConfirmOpen}
              sx={{ mt: 2 }}
            >
              Delete Expired Items
            </Button>
            <Dialog
              open={confirmOpen}
              onClose={handleConfirmClose}
              aria-labelledby="confirm-dialog-title"
              aria-describedby="confirm-dialog-description"
            >
              <DialogTitle id="confirm-dialog-title">
                Confirm Deletion
              </DialogTitle>
              <DialogContent>
                <DialogContentText id="confirm-dialog-description">
                  Are you sure you want to delete all expired items?
                </DialogContentText>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleConfirmClose} color="primary">
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteExpiredItems}
                  color="secondary"
                  autoFocus
                >
                  Confirm
                </Button>
              </DialogActions>
            </Dialog>
          </StyledPaper>
        </Grid>

        <Grid item xs={12} md={6}>
          <StyledPaper elevation={3}>
            <Typography variant="h4" gutterBottom>
              <RestaurantMenuIcon sx={{ mr: 1 }} />
              Recipe Suggestions
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              onClick={fetchRecipe}
              disabled={generating}
              sx={{ mb: 3 }}
            >
              {generating ? (
                <CircularProgress
                  size={24}
                  sx={{ color: "white", marginX: "12px" }}
                />
              ) : recipe ? (
                "Regenerate Recipe"
              ) : (
                "Get Recipe Recommendation"
              )}
            </Button>
            {error && (
              <Typography color="error" sx={{ mt: 2 }}>
                {error}
              </Typography>
            )}
            {recipe && (
              <Card>
                <CardContent>
                  <Typography variant="h5" gutterBottom>
                    {String(recipe.title)}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Serving Size: {String(recipe.servingSize)}
                  </Typography>
                  <Typography variant="h6" gutterBottom>
                    Ingredients
                  </Typography>
                  <List>
                    {recipe.ingredientsNeeded.map((ingredient, index) => (
                      <ListItem key={index}>
                        <Typography variant="body1">
                          {String(ingredient)}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="h6" gutterBottom>
                    Instructions
                  </Typography>
                  <List>
                    {recipe.instructions.map((instruction, index) => (
                      <ListItem key={index}>
                        <Typography variant="body1">
                          {`${index + 1}. ${String(instruction)}`}
                        </Typography>
                      </ListItem>
                    ))}
                  </List>
                </CardContent>
              </Card>
            )}
          </StyledPaper>
        </Grid>
      </Grid>

      <StyledModal open={open} onClose={handleClose}>
        <ModalContent>
          <Typography variant="h6" component="h2" gutterBottom>
            {editingItem ? "Update item" : "Add item"}
          </Typography>
          <TextField
            fullWidth
            label="Item"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            error={!itemName.trim()}
            helperText={!itemName.trim() ? "Item name is required." : ""}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            error={quantity < 0}
            helperText={quantity <= 0 ? "Quantity must be greater than 0." : ""}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Unit</InputLabel>
            <Select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              label="Unit"
            >
              {unitOptions.map((unitOption) => (
                <MenuItem key={unitOption} value={unitOption}>
                  {unitOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            fullWidth
            label="Expiration Date"
            type="date"
            value={expirationDate}
            onChange={(e) => setExpirationDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleAddOrUpdateItem}
            disabled={!itemName.trim() || quantity <= 0}
          >
            {editingItem ? "Save" : "Add Item"}
          </Button>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
        </ModalContent>
      </StyledModal>
    </Container>
  );
}
