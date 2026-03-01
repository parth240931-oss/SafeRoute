
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { RouteOption, TravelMode, UserProfile } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateRoutes = async (
  origin: string,
  destination: string,
  mode: TravelMode,
  profile: UserProfile
): Promise<RouteOption[]> => {
  const isMetro = mode === 'metro';
  const modeSpecificContext = isMetro 
    ? "For Metro routes, focus on station safety, platform lighting, presence of transit police/staff, and elevator/escalator status for accessibility."
    : `Focus on ${mode} safety, including street lighting and crowd density.`;

  const prompt = `
    Generate 3 distinct ${mode} route options from "${origin}" to "${destination}".
    User Profile:
    - Gender: ${profile.gender}
    - Safety Priority: ${profile.safetyPriority}%
    - Mobility Needs: ${profile.mobilityNeeds}

    Tailor the safety scores and tags to the user's gender.

    ${modeSpecificContext}

    Each route should have:
    - name: A descriptive name
    - distance: approximate distance
    - duration: approximate duration
    - comfortScore: 0-100
    - comfortBreakdown: {safety, lighting, crowd, accessibility}
    - type: 'Safest', 'Balanced', 'Fastest'
    - tags: string[]
    - landmarks: string[]
  `;

  try {
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
              id: { type: Type.STRING },
              name: { type: Type.STRING },
              distance: { type: Type.STRING },
              duration: { type: Type.STRING },
              comfortScore: { type: Type.NUMBER },
              comfortBreakdown: {
                type: Type.OBJECT,
                properties: {
                  safety: { type: Type.NUMBER },
                  lighting: { type: Type.NUMBER },
                  crowd: { type: Type.NUMBER },
                  accessibility: { type: Type.NUMBER },
                },
              },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              landmarks: { type: Type.ARRAY, items: { type: Type.STRING } },
              type: { type: Type.STRING },
            },
          },
        },
      },
    });

    const routes = JSON.parse(response.text || "[]");
    return routes.map((r: any) => ({
      ...r,
      id: Math.random().toString(36).substr(2, 9),
    }));
  } catch (error) {
    console.error("Error generating routes:", error);
    return [
      {
        id: "mock-1",
        name: "Standard Safety Corridor",
        distance: "1.2 km",
        duration: "15 min",
        comfortScore: 85,
        comfortBreakdown: { safety: 85, lighting: 90, crowd: 80, accessibility: 90 },
        tags: ["Well lit", "Police nearby"],
        landmarks: ["Public Library"],
        type: "Safest",
      },
    ];
  }
};

export const getNearestPoliceStation = async (lat: number, lng: number): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Find the address of the nearest police station to the coordinates ${lat}, ${lng}. Return ONLY the address.`,
    });
    return response.text || "Unknown Station (Search GPS for help)";
  } catch (error) {
    return "Local Station - Follow Main Road";
  }
};

export const getSafetyInsights = async (area: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Provide 3 short, actionable safety tips for a traveler in the area: ${area}.`,
    });
    return response.text || "Stay alert and prefer well-lit main streets.";
  } catch (error) {
    return "Local insights are currently unavailable.";
  }
};

export const generateVoiceGuidance = async (text: string, voiceName: string = 'Kore'): Promise<string | undefined> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: `Speak in a calm, protective, and helpful tone for someone walking alone: ${text}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });
    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("TTS Error:", error);
    return undefined;
  }
};
