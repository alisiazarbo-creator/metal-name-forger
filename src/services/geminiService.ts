import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface DemoSongResult {
  title: string;
  lyrics: string;
  structure: string;
}

export async function generateDemoSong(bandName: string, genre: string): Promise<DemoSongResult | null> {
  const prompt = `Generate a demo song for a ${genre} band named "${bandName}". 
  Provide a brutal song title, a few verses/chorus of lyrics, and a brief description of the song structure (e.g., "Fast tremolo picking intro, slow crushing breakdown").`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING, description: "The song title" },
          lyrics: { type: Type.STRING, description: "The song lyrics" },
          structure: { type: Type.STRING, description: "Description of the song structure" },
        },
        required: ["title", "lyrics", "structure"],
      },
    },
  });

  try {
    return JSON.parse(response.text || "null");
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    return null;
  }
}
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
