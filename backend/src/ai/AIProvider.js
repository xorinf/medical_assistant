// AIProvider.js
// -----------------------------------------------------------------------------
// Decides whether to use the real AI provider (OpenAI) or the deterministic
// fallback, based on the AI_PROVIDER env variable.
//
// Both branches return the SAME shape, so callers don't have to branch:
//   summarize():  { summary, model, fallback }
//   explain():    { explanation, model, fallback, disclaimer? }
// -----------------------------------------------------------------------------

import { fallbackSummarize, fallbackExplain } from './AIFallback.js';

// Cached OpenAI client so we only construct it once per process.
let openaiClient = null;

// getOpenAI: lazily build the OpenAI client if (a) AI_PROVIDER=openai and
// (b) an OPENAI_API_KEY exists. Returns null if either is missing.
async function getOpenAI() {
  if (openaiClient) {
    return openaiClient;
  }
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }
  const openaiModule = await import('openai');
  const OpenAI = openaiModule.default;
  openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openaiClient;
}

// summarize: returns { summary, model, fallback }.
export async function summarize(input) {
  const provider = process.env.AI_PROVIDER;

  if (provider === 'openai') {
    const client = await getOpenAI();
    if (client) {
      const prompt = buildSummaryPrompt(input);
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You are a clinical scribe. Produce a structured SOAP summary for clinician review. Do not invent data.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.2,
      });
      const summaryText = completion.choices[0].message.content.trim();
      return { summary: summaryText, model: 'gpt-4o-mini' };
    }
  }

  // Default: deterministic fallback (no API key needed).
  const fallbackResult = fallbackSummarize(input);
  return { summary: fallbackResult.summary, model: 'fallback', fallback: true };
}

// explain: returns { explanation, fallback, disclaimer? }.
export async function explain(input) {
  const provider = process.env.AI_PROVIDER;

  if (provider === 'openai') {
    const client = await getOpenAI();
    if (client) {
      const completion = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content:
              'You explain prescriptions in plain English (8th-grade reading level). Never diagnose, never suggest changing dose or stopping medication. Always recommend contacting the prescriber for questions.',
          },
          { role: 'user', content: JSON.stringify(input) },
        ],
        temperature: 0.2,
      });
      const explanationText = completion.choices[0].message.content.trim();
      return { explanation: explanationText, model: 'gpt-4o-mini' };
    }
  }

  const fallbackResult = fallbackExplain(input);
  return {
    explanation: fallbackResult.explanation,
    fallback: true,
    disclaimer:
      "This is a plain-language explanation of your doctor's instructions. It is not medical advice and does not replace your doctor. If anything is unclear or your symptoms change, contact your clinic.",
  };
}

// buildSummaryPrompt: turn the SOAP fields into one text prompt for the model.
function buildSummaryPrompt(input) {
  const subjective = input && input.subjective ? input.subjective : '';
  const objective = input && input.objective ? input.objective : '';
  const assessment = input && input.assessment ? input.assessment : '';
  const plan = input && input.plan ? input.plan : '';
  const diagnosis = input && input.diagnosis ? input.diagnosis : [];

  let diagnosisLine = '';
  if (diagnosis.length > 0) {
    diagnosisLine = 'Differential: ' + diagnosis.join(', ');
  }

  return [
    'S: ' + (subjective || '—'),
    'O: ' + (objective || '—'),
    'A: ' + (assessment || '') + (diagnosisLine ? ' ' + diagnosisLine : ''),
    'P: ' + (plan || '—'),
    '',
    'Return a concise clinical summary (<= 120 words) suitable for clinician review. Use bullet points.',
  ].join('\n');
}
