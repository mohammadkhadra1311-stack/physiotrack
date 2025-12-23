
import { GoogleGenAI, Type } from "@google/genai";
import { SymptomReport } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function suggestTreatmentPlan(patientCondition: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Suggest a basic physiotherapy exercise plan for a patient with: ${patientCondition}. Return exactly three specific exercises.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              description: { type: Type.STRING },
              reps: { type: Type.STRING },
              sets: { type: Type.STRING },
              targetArea: { type: Type.STRING }
            },
            required: ["name", "description", "reps", "sets", "targetArea"]
          }
        }
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini suggestion failed:", error);
    return null;
  }
}

export async function analyzeSymptoms(report: SymptomReport) {
  try {
    const prompt = `
      Act as a senior physiotherapist. Analyze the following patient symptom report:
      - Location: ${report.painLocation}
      - Pain Level: ${report.painLevel}/10
      - Duration: ${report.duration}
      - Aggravating Factors: ${report.aggravatingFactors}
      - Description: ${report.description}
      
      Provide a concise clinical summary including:
      1. Potential Preliminary Diagnosis
      2. Red Flags to watch for
      3. Primary clinical focus for next session
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    return response.text;
  } catch (error) {
    console.error("AI Analysis failed:", error);
    return "AI analysis unavailable at this time.";
  }
}
