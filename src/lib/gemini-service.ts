import { GoogleGenAI, Type } from "@google/genai";
import { AnalyticsData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeDriverFrame(base64Image: string) {
  const prompt = `Analyze this dashboard camera frame for driver behavior and safety. 
  1. Identify the driver (if known, or describe features if unknown).
  2. Detect if they are holding/using a mobile phone.
  3. Detect if they are wearing a seatbelt.
  4. Analyze emotion (Calm, Stressed, Angry, Fatigued).
  5. Analyze posture (Good, Slouched, Tilted).
  6. Provide a concise safety reasoning snippet.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Image
          }
        },
        { text: prompt }
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            identity: { type: Type.STRING, description: "Name or ID of recognized driver" },
            phoneDetected: { type: Type.BOOLEAN },
            seatbeltOn: { type: Type.BOOLEAN },
            emotion: { type: Type.STRING },
            posture: { type: Type.STRING, description: "good, slouched, or tilted" },
            isNight: { type: Type.BOOLEAN, description: "True if low lighting or night conditions" },
            reasoning: { type: Type.STRING, description: "1 sentence logic for detected state" }
          },
          required: ["identity", "phoneDetected", "seatbeltOn", "emotion", "posture", "reasoning"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Vision AI error:", error);
    return null;
  }
}

export async function getCoDriverAdvice(context: {
  riskScore: number;
  status: string;
  history: string[];
  weather?: string;
  traffic?: string;
  location?: string;
  language: string;
}) {
  const prompt = `
    You are "DriveSentinel-X", a world-class AI co-driver. 
    Current Situation:
    - Driver Status: ${context.status}
    - Risk Score: ${context.riskScore}/100
    - Recent Alerts: ${context.history.join(', ') || 'None'}
    - External Context: ${context.weather || 'Unknown'}, ${context.traffic || 'Unknown'}
    - Location: ${context.location || 'Unknown'}

    Provide a concise, supportive, and actionable co-driver thought or advice (1-2 sentences) in ${context.language}.
    If the risk is high (>70), suggest a specific action like stopping for coffee or stretching.
    Be human-like and empathetic.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }] // For grounding in real-world facts/weather if needed
      }
    });
    return response.text;
  } catch (error) {
    console.error("Co-driver error:", error);
    return "Stay focused on the road. I'm monitoring your safety.";
  }
}

export async function analyzeBehaviorPatterns(history: AnalyticsData[]) {
  if (history.length < 5) return ["Establishing baseline behavior..."];

  const prompt = `Analyze this list of driver session snapshots for patterns and generate 2-3 concise safety insights. 
  Snapshots: ${JSON.stringify(history.slice(-20))}
  
  Focus on:
  - Typical fatigue timing (if risk score increases over time).
  - Common distractions (like phone usage).
  - Emotional trends.
  
  Return a JSON array of strings.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    return JSON.parse(response.text || '[]');
  } catch (error) {
    console.error("Pattern analysis error:", error);
    return [];
  }
}

export async function speakAdvice(text: string, lang: string = 'en') {
  if (!('speechSynthesis' in window)) return;
  
  // Cancel previous speech
  window.speechSynthesis.cancel();
  
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Map internal lang to speech lang
  const langMap: { [key: string]: string } = {
    'en': 'en-US',
    'hi': 'hi-IN',
    'mr': 'hi-IN' // Marathi support is sometimes limited, fallback to Hindi if needed, or mr-IN
  };
  
  utterance.lang = langMap[lang] || 'en-US';
  
  // Find a nice voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.startsWith(utterance.lang.split('-')[0])) || voices[0];
  if (preferredVoice) utterance.voice = preferredVoice;
  
  utterance.pitch = 1.0;
  utterance.rate = 1.0;
  window.speechSynthesis.speak(utterance);
}

export async function getLocalIntelligence(lat: number, lon: number) {
  const prompt = `Based on coordinates ${lat}, ${lon}, what is the current weather condition and are there any popular rest stops or coffee shops nearby? Return as JSON: { "weather": string, "nearbyPlaces": string[] }`;
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        responseMimeType: "application/json"
      }
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Local Intel error:", error);
    return { weather: "Clear", nearbyPlaces: [] };
  }
}
