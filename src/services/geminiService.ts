import { GoogleGenAI, Type, Modality } from "@google/genai";

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

export async function generateBandLogo(bandName: string, genre: string): Promise<string | null> {
  // Use a fresh instance for models requiring user API key
  const userAi = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });
  
  const prompt = `A brutal, symmetrical, and illegible heavy metal band logo for a ${genre} band named "${bandName}". 
  The logo should be black and white, with sharp, thorny, and organic shapes. High contrast, professional graphic design.`;

  const response = await userAi.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [{ text: prompt }],
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function generateDemoMusic(bandName: string, genre: string): Promise<{ audioUrl: string; lyrics: string } | null> {
  // Use a fresh instance for models requiring user API key
  const userAi = new GoogleGenAI({ apiKey: process.env.API_KEY || process.env.GEMINI_API_KEY });

  const response = await userAi.models.generateContentStream({
    model: "lyria-3-clip-preview",
    contents: `Generate a 30-second ${genre} metal track for a band named "${bandName}". Brutal, heavy, and aggressive.`,
    config: {
      responseModalities: [Modality.AUDIO],
    }
  });

  let audioBase64 = "";
  let lyrics = "";
  let mimeType = "audio/wav";

  for await (const chunk of response) {
    const parts = chunk.candidates?.[0]?.content?.parts;
    if (!parts) continue;
    for (const part of parts) {
      if (part.inlineData?.data) {
        if (!audioBase64 && part.inlineData.mimeType) {
          mimeType = part.inlineData.mimeType;
        }
        audioBase64 += part.inlineData.data;
      }
      if (part.text && !lyrics) {
        lyrics = part.text;
      }
    }
  }

  if (!audioBase64) return null;

  const binary = atob(audioBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const blob = new Blob([bytes], { type: mimeType });
  return {
    audioUrl: URL.createObjectURL(blob),
    lyrics
  };
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
