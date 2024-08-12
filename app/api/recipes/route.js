import { OpenAI } from "openai";

/**
 * Fetch recipe recommendations based on ingredients.
 * @param {Array} ingredients - List of ingredients.
 * @returns {Promise<Object>} - Recipe data.
 */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY_PROJ,
  project: "proj_5LdDnxCupEvSk761eCpPCSbD",
  organization: 'org-RRe34wgTZPCxCUYzSaDpqI1V'
});

export async function POST(req) {
  const { ingredients, prev } = await req.json();
  console.log(prev)

  try {
    let prompt = `
    Following are pantry items: ${ingredients.join(', ')}. 
    Give me a recipe suggestion in following format: 
    {
      "title": str,
      "servingSize": str,
      "prepTime": str,
      "cookTime": str,
      "ingredientsNeeded": ["item1", "item2" (with amount needed for this recipe)],
      "instructions": ["step1". "step2"]
    }`;
    if (prev) 
      prompt += `Something other than ${prev}`
    console.log(prompt);
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: prompt }
      ],
      response_format: {type: 'json_object'}
    });

    return new Response(JSON.stringify(response.choices[0].message.content.trim()), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Detailed error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}