import { Configuration, OpenAIApi } from "openai";
import { buildPrompt } from './prompt.js';

//  Update to the newest model if you like!
const model_nm = "gpt-4-turbo-preview";

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

  try {
    const instructions = buildPrompt(txt, elements);
    
    const response = await openai.createChatCompletion({
      model: model_nm,
      temperature: 0.75,
      messages: [{role: "system", content: instructions}, {role: "user", content: ''}], 
    }, { timeout: 60000 });

    const response_text = response.data.choices[0].message.content.trim();

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
