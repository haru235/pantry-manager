"use client";
// Import necessary dependencies
import React, { useState, useEffect } from "react";
import { styled, createTheme, ThemeProvider } from "@mui/material/styles";
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
  IconButton,
  Grid,
  CircularProgress,
  Chip,
  AppBar,
  Toolbar,
  CssBaseline,
  InputAdornment,
  Paper,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Kitchen as KitchenIcon,
  RestaurantMenu as RestaurantMenuIcon,
  ShoppingCart as ShoppingCartIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";
import { firestore } from "@/firebase";
import axios from "axios";

// Create a custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: "#2196f3", // Blue
    },
    secondary: {
      main: "#ff9800", // Orange
    },
    background: {
      default: "#f5f5f5",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
        },
      },
    },
  },
});

// Styled components
const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
  },
}));

const StyledModal = styled(Modal)({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
});

const ModalContent = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  borderRadius: 8,
  boxShadow: theme.shadows[5],
  padding: theme.spacing(4),
  width: 400,
}));

const StyledFooter = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: theme.palette.primary.contrastText,
  padding: theme.spacing(3, 0),
  marginTop: "auto",
}));

const Footer = ({ name }) => {
  return (
    <StyledFooter component="footer">
      <Container maxWidth="lg">
        <Typography variant="body1" align="center">
          © {new Date().getFullYear()} {name}. All rights reserved.
        </Typography>
      </Container>
    </StyledFooter>
  );
};

// Main component
export default function Home() {
  // State declarations
  const [pantry, setPantry] = useState([]);
  const [open, setOpen] = useState(false);
  const [itemName, setItemName] = useState("");
  const [unit, setUnit] = useState("pcs");
  const [expirationDate, setExpirationDate] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [searchText, setSearchText] = useState("");
  const [error, setError] = useState("");
  const [recipe, setRecipe] = useState({ title: "" });
  const [shoppingList, setShoppingList] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [isShoppingItem, setIsShoppingItem] = useState(false);
  const [shoppingBudget, setShoppingBudget] = useState("100");

  // Effect to fetch pantry items on component mount
  useEffect(() => {
    updatePantry();
  }, []);

  // Function to fetch and update pantry items
  const updatePantry = async () => {
    const snapshot = query(collection(firestore, "pantry"));
    const docs = await getDocs(snapshot);
    const pantryList = docs.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setPantry(pantryList);
  };

  const handleShoppingItemClick = (item) => {
    setEditingItem(null);
    setItemName(item.item);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setExpirationDate("");
    setIsShoppingItem(true);
    setOpen(true);
  };

  // Function to add or update an item in the pantry
  const addOrUpdateItem = async (itemName, quantity, unit, expirationDate) => {
    const collectionRef = collection(firestore, "pantry");
    const docRef = editingItem
      ? doc(collectionRef, editingItem.id)
      : doc(collectionRef);
    await setDoc(
      docRef,
      {
        name: itemName.toLowerCase(),
        quantity,
        unit,
        expirationDate,
      },
      { merge: true }
    );
    await updatePantry();

    if (isShoppingItem) {
      setShoppingList((prevList) => ({
        ...prevList,
        items: prevList.items.filter(
          (item) => item.item.toLowerCase() !== itemName.toLowerCase()
        ),
      }));
      setIsShoppingItem(false);
    }

    handleClose();
  };

  // Function to delete an item from the pantry
  const deleteItem = async (id) => {
    const docRef = doc(firestore, "pantry", id);
    await deleteDoc(docRef);
    await updatePantry();
  };

  // Function to generate a recipe recommendation
  const generateRecipe = async () => {
    setGenerating(true);
    const ingredientList = pantry.map(
      (item) => `${item.name} (${item.quantity} ${item.unit})`
    );
    try {
      const response = await axios.post("/api/recipes", {
        ingredients: ingredientList,
        prev: recipe.title,
      });
      const recipeData = JSON.parse(response.data);
      setRecipe(recipeData);
    } catch (error) {
      console.error("Failed to fetch recipes:", error);
      setError("Failed to generate recipe. Please try again.");
      setRecipe(null);
    }
    setGenerating(false);
  };

  // Function to generate a shopping list
  const generateShoppingList = async () => {
    setGenerating(true);
    const pantryItems = pantry.map(
      (item) => `${item.name} (${item.quantity} ${item.unit})`
    );
    try {
      const response = await axios.post("/api/shoppingLists", {
        pantryItems,
        budget: shoppingBudget ? parseFloat(shoppingBudget) : undefined,
      });
      setShoppingList(response.data);
    } catch (error) {
      console.error("Failed to generate shopping list:", error);
      setError("Failed to generate shopping list. Please try again.");
      setShoppingList([]);
    }
    setGenerating(false);
  };

  // Modal control functions
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setEditingItem(null);
    setItemName("");
    setQuantity(1);
    setUnit("pcs");
    setExpirationDate("");
    setError("");
    setIsShoppingItem(false);
  };

  // Function to open edit modal
  const handleEditOpen = (item) => {
    setEditingItem(item);
    setItemName(item.name);
    setQuantity(item.quantity);
    setUnit(item.unit);
    setExpirationDate(item.expirationDate || "");
    setOpen(true);
  };

  // Main render
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}
      >
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static" color="primary">
            <Toolbar>
              <Typography
                variant="h6"
                component="div"
                sx={{ flexGrow: 1 }}
                textAlign={"center"}
              >
                Welcome to PantryAI
              </Typography>
            </Toolbar>
          </AppBar>
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            {/* Instructions Section */}
            <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom>
                <InfoIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                How to Use PantryAI
              </Typography>
              <Typography variant="body1" paragraph>
                1. Manage Your Pantry: Add, edit, or remove items in your pantry
                using the "Pantry Items" section.
              </Typography>
              <Typography variant="body1" paragraph>
                2. Get Recipe Suggestions: Click "Get Recipe" to receive a
                recipe suggestion based on your pantry items.
              </Typography>
              <Typography variant="body1" paragraph>
                3. Generate Shopping List: Set a budget and click "Get Shopping
                List" to generate a list of items to buy.
              </Typography>
              <Typography variant="body1">
                4. Add to Pantry: Click the "+" icon on shopping list items to
                quickly add them to your pantry.
              </Typography>
            </Paper>

            <Grid container spacing={4}>
              {/* Pantry Management Section */}
              <Grid item xs={12} md={6} sx={{ maxHeight: 700 }}>
                <StyledCard>
                  <CardContent
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="h5" gutterBottom>
                      <KitchenIcon sx={{ mr: 1, verticalAlign: "middle" }} />
                      Pantry Items
                    </Typography>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label="Search Items"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      sx={{ mb: 2 }}
                    />
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={handleOpen}
                      sx={{ mb: 2 }}
                    >
                      Add Item
                    </Button>
                    <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
                      <List>
                        {pantry
                          .filter((item) =>
                            item.name.includes(searchText.toLowerCase())
                          )
                          .map((item) => (
                            <ListItem
                              key={item.id}
                              secondaryAction={
                                <>
                                  <IconButton
                                    edge="end"
                                    aria-label="edit"
                                    onClick={() => handleEditOpen(item)}
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    edge="end"
                                    aria-label="delete"
                                    onClick={() => deleteItem(item.id)}
                                  >
                                    <DeleteIcon />
                                  </IconButton>
                                </>
                              }
                            >
                              <Box>
                                <Typography variant="subtitle1">
                                  {item.name.charAt(0).toUpperCase() +
                                    item.name.slice(1)}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  {item.quantity} {item.unit} | Expires:{" "}
                                  {item.expirationDate || "N/A"}
                                </Typography>
                              </Box>
                            </ListItem>
                          ))}
                      </List>
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>

              {/* Recipe Suggestion Section */}
              <Grid item xs={12} md={6} sx={{ maxHeight: 700 }}>
                <StyledCard>
                  <CardContent
                    sx={{
                      height: "100%",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <Typography variant="h5" gutterBottom>
                      <RestaurantMenuIcon
                        sx={{ mr: 1, verticalAlign: "middle" }}
                      />
                      Recipe Suggestion
                    </Typography>
                    <Button
                      variant="contained"
                      color="secondary"
                      onClick={generateRecipe}
                      disabled={generating}
                      sx={{ mb: 2 }}
                    >
                      {generating ? (
                        <CircularProgress size={24} />
                      ) : (
                        "Get Recipe"
                      )}
                    </Button>
                    <Box sx={{ flexGrow: 1, overflow: "auto" }}>
                      {recipe.title != "" && (
                        <Box>
                          <Typography variant="h6">{recipe.title}</Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mb: 1 }}
                          >
                            Prep: {recipe.prepTime} | Cook: {recipe.cookTime} |
                            Serves: {recipe.servingSize}
                          </Typography>
                          <Typography variant="subtitle1">
                            Ingredients:
                          </Typography>
                          <List>
                            {recipe.ingredientsNeeded.map(
                              (ingredient, index) => (
                                <ListItem key={index}>
                                  <Chip label={ingredient} />
                                </ListItem>
                              )
                            )}
                          </List>
                          <Typography variant="subtitle1">
                            Instructions:
                          </Typography>
                          <List>
                            {recipe.instructions.map((instruction, index) => (
                              <ListItem key={index}>
                                <Typography variant="body2">{`${
                                  index + 1
                                }. ${instruction}`}</Typography>
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </StyledCard>
              </Grid>

              {/* Shopping List Section */}
              <Grid item xs={12} spacing={4}>
                <StyledCard>
                  <CardContent>
                    <Typography variant="h5" gutterBottom>
                      <ShoppingCartIcon
                        sx={{ mr: 1, verticalAlign: "middle" }}
                      />
                      Shopping List
                    </Typography>
                    <Grid
                      container
                      spacing={2}
                      alignItems="center"
                      sx={{ mb: 2 }}
                    >
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField
                          fullWidth
                          label="Budget"
                          type="number"
                          value={shoppingBudget}
                          onChange={(e) => setShoppingBudget(e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <InputAdornment position="start">
                                $
                              </InputAdornment>
                            ),
                          }}
                          sx={{
                            height: "56px",
                            "& .MuiInputBase-root": { height: "56px" },
                          }}
                        />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Button
                          fullWidth
                          variant="contained"
                          color="secondary"
                          onClick={generateShoppingList}
                          disabled={generating}
                          sx={{ height: "56px" }}
                        >
                          {generating ? (
                            <CircularProgress size={24} />
                          ) : (
                            "Get Shopping List"
                          )}
                        </Button>
                      </Grid>
                    </Grid>
                    {shoppingList && (
                      <Grid container spacing={2}>
                        {shoppingList.items.map((item, index) => (
                          <Grid item xs={6} sm={4} md={3} key={index}>
                            <Chip
                              label={
                                item.item +
                                " (" +
                                item.quantity +
                                " " +
                                item.unit +
                                ")"
                              }
                              onDelete={() => handleShoppingItemClick(item)}
                              deleteIcon={<AddIcon />}
                              sx={{
                                width: "100%",
                                justifyContent: "space-between",
                              }}
                            />
                          </Grid>
                        ))}
                      </Grid>
                    )}
                  </CardContent>
                </StyledCard>
              </Grid>
            </Grid>
          </Container>

          {/* Add/Edit Item Modal */}
          <StyledModal open={open} onClose={handleClose}>
            <ModalContent>
              <Typography variant="h6" component="h2" gutterBottom>
                {editingItem
                  ? "Edit Item"
                  : isShoppingItem
                  ? "Add to Pantry"
                  : "Add New Item"}
              </Typography>
              <TextField
                fullWidth
                label="Item Name"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Quantity"
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                sx={{ mb: 2 }}
              />
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Unit</InputLabel>
                <Select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  label="Unit"
                >
                  {[
                    "g",
                    "kg",
                    "lbs",
                    "oz",
                    "ml",
                    "L",
                    "tsp",
                    "tbsp",
                    "fl oz",
                    "cups",
                    "pints",
                    "quarts",
                    "gallons",
                    "pcs",
                    "packs",
                    "cans",
                    "bottles",
                    "jars",
                    "boxes",
                  ].map((u) => (
                    <MenuItem key={u} value={u}>
                      {u}
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
                onClick={() =>
                  addOrUpdateItem(itemName, quantity, unit, expirationDate)
                }
                disabled={!itemName.trim() || quantity <= 0}
              >
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
            </ModalContent>
          </StyledModal>
        </Box>
        <Box height="25px"></Box>
        <Footer name="Haru Sakai" />
      </Box>
    </ThemeProvider>
  );
}
