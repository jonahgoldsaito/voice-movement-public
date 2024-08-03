import { Configuration, OpenAIApi } from "openai";
import { buildPrompt } from './prompt.js';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured",
      }
    });
    return;
  }

  const txt = req.body.txt;
  const elements = req.body.elements;

  console.log("elements", elements);

  try {
    const instructions = buildPrompt(txt, elements);
    
    //console.log("instructions", instructions);
    console.log("instructions", instructions);
    console.log("_+_+_+_+_+_+_+_+_+_+_+_+_+");

    console.log("elements", elements);

    const response = await openai.createChatCompletion({
      //model: "gpt-3.5-turbo-0125",
      //model: "gpt-4",
      model: "gpt-4-turbo-preview",
      temperature: 0.75,
      messages: [{role: "system", content: instructions}, {role: "user", content: ''}], 
    }, { timeout: 60000 });

    const response_text = response.data.choices[0].message.content.trim();
    console.log("txt", txt)
    console.log("response_text", response_text);

    res.status(200).json({ result: response_text, prompt: instructions });
  } catch(error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}
