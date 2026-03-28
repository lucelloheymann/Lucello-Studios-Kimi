// LLM-Abstraktion — austauschbar zwischen OpenAI, Anthropic, Ollama
// Nutzt Vercel AI SDK als einheitliche Schnittstelle

import { generateText, generateObject } from "ai";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import type { LanguageModelV1 } from "ai";
import type { ZodSchema } from "zod";

// ─── Modell-Auswahl ───────────────────────────────────────────────────────────

type ModelPurpose = "analysis" | "generation" | "outreach" | "fast";

function getModel(purpose: ModelPurpose): LanguageModelV1 {
  const provider = process.env.LLM_PROVIDER || "openai";

  const modelNames: Record<string, Record<ModelPurpose, string>> = {
    openai: {
      analysis: process.env.LLM_MODEL_ANALYSIS || "gpt-4o",
      generation: process.env.LLM_MODEL_GENERATION || "gpt-4o",
      outreach: process.env.LLM_MODEL_OUTREACH || "gpt-4o-mini",
      fast: "gpt-4o-mini",
    },
    anthropic: {
      analysis: "claude-opus-4-6",
      generation: "claude-opus-4-6",
      outreach: "claude-sonnet-4-6",
      fast: "claude-haiku-4-5-20251001",
    },
  };

  const modelName = modelNames[provider]?.[purpose] ?? "gpt-4o-mini";

  if (provider === "anthropic") {
    return anthropic(modelName);
  }
  return openai(modelName);
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
  const model = getModel(purpose);

  const result = await generateText({
    model,
    system: systemPrompt,
    prompt: userPrompt,
    maxTokens: options?.maxTokens ?? 4096,
    temperature: options?.temperature ?? 0.3,
  });

  return {
    text: result.text,
    model: result.response.modelId,
    promptTokens: result.usage.promptTokens,
    completionTokens: result.usage.completionTokens,
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
  const model = getModel(purpose);

  const result = await generateObject({
    model,
    system: systemPrompt,
    prompt: userPrompt,
    schema,
    maxTokens: options?.maxTokens ?? 4096,
    temperature: options?.temperature ?? 0.2,
  });

  return {
    object: result.object as T,
    model: result.response.modelId,
  };
}

// ─── Modell-Info ──────────────────────────────────────────────────────────────

export function getCurrentModelInfo(): Record<ModelPurpose, string> {
  const provider = process.env.LLM_PROVIDER || "openai";
  return {
    analysis: provider === "anthropic" ? "claude-opus-4-6" : (process.env.LLM_MODEL_ANALYSIS || "gpt-4o"),
    generation: provider === "anthropic" ? "claude-opus-4-6" : (process.env.LLM_MODEL_GENERATION || "gpt-4o"),
    outreach: provider === "anthropic" ? "claude-sonnet-4-6" : (process.env.LLM_MODEL_OUTREACH || "gpt-4o-mini"),
    fast: provider === "anthropic" ? "claude-haiku-4-5-20251001" : "gpt-4o-mini",
  };
}
