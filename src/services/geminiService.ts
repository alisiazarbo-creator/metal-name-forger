import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface BandNameResult {
  name: string;
  description: string;
  genre: string;
}

export async function generateMetalBandNames(count: number = 5, subgenre?: string): Promise<BandNameResult[]> {
  const prompt = `Generate ${count} unique and brutal metal band names${subgenre ? ` in the ${subgenre} subgenre` : ''}. 
  For each name, provide a brief description of their "sound" or "vibe".`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: "The band name" },
            description: { type: Type.STRING, description: "Brief description of the band's vibe" },
            genre: { type: Type.STRING, description: "The specific subgenre" },
          },
          required: ["name", "description", "genre"],
        },
      },
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return [];
  }
}
