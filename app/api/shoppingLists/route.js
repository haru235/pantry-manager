import { OpenAI } from "openai";

/**
 * Generate a shopping list based on pantry items.
 * @param {Array} pantryItems - List of current pantry items.
 * @returns {Promise<Object>} - Shopping list data.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_PROJ,
  project: "proj_5LdDnxCupEvSk761eCpPCSbD",
  organization: "org-RRe34wgTZPCxCUYzSaDpqI1V",
});

export async function POST(req) {
  const { pantryItems, budget } = await req.json();

  try {
    const prompt = `
    Based on these pantry items: ${pantryItems.join(", ")}, 
    generate a shopping list with a budget of ${budget} to make a healthy meal in following format: 
    {
      "items": [
        {
          "item": str, 
          "quantity": num, 
          "unit": str
        }
      ]
    } 
    Units should match one of the following: "g", "kg", "lbs", "oz", "ml", "L", "tsp", "tbsp", "fl oz", "cups", "pints", "quarts", "gallons", "pcs", "packs", "cans", "bottles", "jars", "boxes"`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: prompt }],
      response_format: {type: "json_object"}
    });

    const shoppingList = JSON.parse(response.choices[0].message.content.trim());

    return new Response(JSON.stringify(shoppingList), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Detailed error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
