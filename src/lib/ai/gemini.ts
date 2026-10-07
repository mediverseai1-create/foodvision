import 'server-only';
import { GoogleGenAI } from '@google/genai';
import { z } from 'zod';

export const MODEL = process.env.GEMINI_MODEL || 'gemini-3.8-flash';
const MODEL_CHAIN = [...new Set([MODEL, 'gemini-3.7-flash', 'gemini-3.6-flash', 'gemini-3.1-flash-lite'])];
export const geminiConfigured = () => Boolean(process.env.GEMINI_API_KEY);

let client: GoogleGenAI | null = null;
function ai() {
  if (!process.env.GEMINI_API_KEY) throw new AiError('not_configured', 'GEMINI_API_KEY is not configured on the server.');
  return (client ??= new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }));
}

export class AiError extends Error {
  constructor(public code: 'not_configured' | 'no_credits' | 'invalid_output' | 'upstream', message: string) {
    super(message);
  }
}

export type Part = { text: string } | { inlineData: { mimeType: string; data: string } };

/** The guardrail every agent inherits. */
export const SAFETY_PREAMBLE = `You are part of FoodVision AI, a decision-support system for qualified food-quality professionals.
Rules you must follow:
- Separate OBSERVED EVIDENCE (what is directly visible/recorded) from INTERPRETATION (what it might mean).
- Never claim an image or record proves pathogens, toxins, chemical contamination, allergens, microbiological contamination, regulatory/HACCP compliance, or food fraud. State that additional testing or qualified human review is required when evidence is insufficient.
- Use qualified language: "associated with", "correlated with", "possible contributor", "requires investigation". Never present a hypothesis as a confirmed root cause.
- Never declare a batch unsafe, and never announce a recall; those decisions belong to authorised humans.
- If the data is insufficient, say so plainly instead of inventing patterns, numbers, or findings.
- Respond with JSON only, matching the requested schema.`;

export async function generateStructured<S extends z.ZodTypeAny>(opts: {
  schema: S;
  jsonSchema: Record<string, unknown>;
  system: string;
  parts: Part[];
}): Promise<{ data: z.infer<S>; usage: { input: number; output: number } }> {
  const call = (model: string) =>
    ai().models.generateContent({
      model,
      contents: [{ role: 'user', parts: opts.parts }],
      config: {
        systemInstruction: `${SAFETY_PREAMBLE}\n\n${opts.system}`,
        responseMimeType: 'application/json',
        responseJsonSchema: opts.jsonSchema,
        temperature: 0.2,
        httpOptions: { timeout: 45_000 },
      },
    });
  /** Tries the configured model, then fallbacks, when Gemini is overloaded/unavailable. */
  const run = async () => {
    let last = 'Gemini request failed';
    for (const model of MODEL_CHAIN) {
      for (let retry = 0; retry < 2; retry++) {
        try {
          return await call(model);
        } catch (e) {
          last = e instanceof Error ? e.message : last;
          const transient = /503|429|UNAVAILABLE|high demand|overloaded|timed? ?out|abort|fetch failed/i.test(last);
          if (!transient) throw new AiError('upstream', last.slice(0, 300));
          await new Promise((r) => setTimeout(r, 800 * (retry + 1)));
        }
      }
    }
    throw new AiError('upstream', `The AI service is temporarily overloaded. Please try again shortly. (${last.slice(0, 160)})`);
  };

  let lastErr = 'unknown';
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await run();
    try {
      const parsed = opts.schema.safeParse(JSON.parse(res.text ?? ''));
      if (parsed.success) {
        return {
          data: parsed.data,
          usage: { input: res.usageMetadata?.promptTokenCount ?? 0, output: res.usageMetadata?.candidatesTokenCount ?? 0 },
        };
      }
      lastErr = parsed.error.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
    } catch (e) {
      lastErr = e instanceof Error ? e.message : 'unparseable output';
    }
  }
  throw new AiError('invalid_output', `Model output failed validation: ${lastErr}`);
}
