// LLM-Abstraktion — Gemini-only Implementation
// Nutzt @google/genai für alle LLM-Operationen

import { GoogleGenAI, Type } from "@google/genai";
import type { ZodSchema } from "zod";

// ─── Modell-Auswahl ───────────────────────────────────────────────────────────

type ModelPurpose = "analysis" | "generation" | "outreach" | "fast";

const DEFAULT_MODEL = "gemini-2.5-flash-lite";

function getModelName(purpose: ModelPurpose): string {
  const modelMap: Record<ModelPurpose, string> = {
    analysis: process.env.GEMINI_MODEL_ANALYSIS || DEFAULT_MODEL,
    generation: process.env.GEMINI_MODEL_GENERATION || DEFAULT_MODEL,
    outreach: process.env.GEMINI_MODEL_OUTREACH || DEFAULT_MODEL,
    fast: process.env.GEMINI_MODEL_FAST || DEFAULT_MODEL,
  };
  return modelMap[purpose] || DEFAULT_MODEL;
}

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY not set");
  }
  return new GoogleGenAI({ apiKey });
}

// ─── Zod-Schema zu Gemini-Schema Konvertierung ────────────────────────────────

function zodToGeminiSchema(zodSchema: ZodSchema<any>): any {
  // Einfache Konvertierung für häufige Zod-Typen
  const schema = (zodSchema as any)._def;
  
  if (schema.typeName === "ZodObject") {
    const properties: Record<string, any> = {};
    const required: string[] = [];
    
    for (const [key, value] of Object.entries(schema.shape())) {
      properties[key] = convertZodType(value as any);
      if (!(value as any).isOptional?.()) {
        required.push(key);
      }
    }
    
    return {
      type: Type.OBJECT,
      properties,
      required,
    };
  }
  
  return convertZodType(zodSchema);
}

function convertZodType(zodType: any): any {
  const def = zodType._def;
  
  switch (def.typeName) {
    case "ZodString":
      return { type: Type.STRING };
    case "ZodNumber":
      return { type: Type.NUMBER };
    case "ZodBoolean":
      return { type: Type.BOOLEAN };
    case "ZodArray":
      return {
        type: Type.ARRAY,
        items: convertZodType(def.type),
      };
    case "ZodObject": {
      const properties: Record<string, any> = {};
      const required: string[] = [];
      
      for (const [key, value] of Object.entries(def.shape())) {
        properties[key] = convertZodType(value as any);
        if (!(value as any).isOptional?.()) {
          required.push(key);
        }
      }
      
      return {
        type: Type.OBJECT,
        properties,
        required,
      };
    }
    case "ZodEnum":
      return {
        type: Type.STRING,
        enum: def.values,
      };
    case "ZodOptional":
      return convertZodType(def.innerType);
    case "ZodNullable":
      return convertZodType(def.innerType);
    default:
      return { type: Type.STRING };
  }
}

// ─── Basis-Textgenerierung ────────────────────────────────────────────────────

export async function generateLLMText(
  purpose: ModelPurpose,
  systemPrompt: string,
  userPrompt: string,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<{ text: string; model: string; promptTokens: number; completionTokens: number }> {
  const client = getClient();
  const modelName = getModelName(purpose);

  const result = await client.models.generateContent({
    model: modelName,
    contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
    config: {
      temperature: options?.temperature ?? 0.3,
      maxOutputTokens: options?.maxTokens ?? 4096,
    },
  });

  const text = result.text || "";
  const usage = result.usageMetadata;

  return {
    text,
    model: modelName,
    promptTokens: usage?.promptTokenCount || 0,
    completionTokens: usage?.candidatesTokenCount || 0,
  };
}

// ─── Strukturierte JSON-Ausgabe ───────────────────────────────────────────────

export async function generateLLMObject<T>(
  purpose: ModelPurpose,
  systemPrompt: string,
  userPrompt: string,
  schema: ZodSchema<T>,
  options?: {
    maxTokens?: number;
    temperature?: number;
  }
): Promise<{ object: T; model: string }> {
  const client = getClient();
  const modelName = getModelName(purpose);

  const geminiSchema = zodToGeminiSchema(schema);

  const result = await client.models.generateContent({
    model: modelName,
    contents: [{ role: "user", parts: [{ text: `${systemPrompt}\n\n${userPrompt}` }] }],
    config: {
      temperature: options?.temperature ?? 0.2,
      maxOutputTokens: options?.maxTokens ?? 4096,
      responseSchema: geminiSchema,
      responseMimeType: "application/json",
    },
  });

  const text = result.text || "";
  
  // JSON parsen
  let parsed: any;
  try {
    parsed = JSON.parse(text);
  } catch (e) {
    // Versuche JSON aus Markdown-Codeblock zu extrahieren
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match) {
      parsed = JSON.parse(match[1]);
    } else {
      throw new Error(`Failed to parse JSON response: ${text.substring(0, 200)}`);
    }
  }

  return {
    object: parsed as T,
    model: modelName,
  };
}

// ─── Modell-Info ──────────────────────────────────────────────────────────────

export function getCurrentModelInfo(): Record<ModelPurpose, string> {
  return {
    analysis: process.env.GEMINI_MODEL_ANALYSIS || DEFAULT_MODEL,
    generation: process.env.GEMINI_MODEL_GENERATION || DEFAULT_MODEL,
    outreach: process.env.GEMINI_MODEL_OUTREACH || DEFAULT_MODEL,
    fast: process.env.GEMINI_MODEL_FAST || DEFAULT_MODEL,
  };
}
