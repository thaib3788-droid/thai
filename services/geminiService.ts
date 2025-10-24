
import { GoogleGenAI } from "@google/genai";

let ai: GoogleGenAI | null = null;

const getAI = () => {
  if (!ai) {
    if (!process.env.API_KEY) {
        throw new Error("API key not found. Please set the API_KEY environment variable.");
    }
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};


/**
 * Analyzes a video using a text prompt and a series of base64 encoded frames.
 * @param prompt The text prompt for the analysis.
 * @param frames An array of base64 encoded video frames.
 * @returns The text response from the Gemini API.
 */
export const analyzeVideo = async (prompt: string, frames: string[]): Promise<string> => {
  const gemini = getAI();
  
  const imageParts = frames.map(frame => ({
    inlineData: {
      mimeType: 'image/jpeg',
      data: frame,
    },
  }));

  const textPart = {
    text: prompt
  };

  try {
    const response = await gemini.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: { parts: [textPart, ...imageParts] },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get a response from the AI. Check the console for more details.");
  }
};
