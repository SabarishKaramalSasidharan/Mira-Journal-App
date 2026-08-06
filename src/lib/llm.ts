import type { Turn } from '../types'

/**
 * LLM provider layer.
 *
 * Supports free options out of the box:
 *  - 'gemini'  — Google Gemini free tier (gemini-2.0-flash). Works from browser.
 *  - 'openai'  — any OpenAI-compatible endpoint: Groq (free), OpenRouter, Ollama (local).
 *  - 'local'   — no LLM; the offline rule-based engine in ai.ts is used.
 *
 * The key is stored only in the browser (localStorage). For production you'd
 * proxy these calls through your own backend so the key is never exposed.
 */
export type Provider = 'local' | 'gemini' | 'openai'

export interface LLMSettings {
  provider: Provider
  apiKey: string
  model: string
  baseUrl: string // used by 'openai' compatible providers
}

const KEY = 'mira.llm.v1'

export const PROVIDER_PRESETS: Record<
  Exclude<Provider, 'local'>,
  { label: string; model: string; baseUrl: string; keyUrl: string; hint: string }
> = {
  gemini: {
    label: 'Google Gemini (free tier)',
    model: 'gemini-2.0-flash',
    baseUrl: '',
    keyUrl: 'https://aistudio.google.com/app/apikey',
    hint: 'Free API key from Google AI Studio. Best default.',
  },
  openai: {
    label: 'Groq / OpenRouter / Ollama (OpenAI-compatible)',
    model: 'llama-3.3-70b-versatile',
    baseUrl: 'https://api.groq.com/openai/v1',
    keyUrl: 'https://console.groq.com/keys',
    hint: 'Groq is free & fast. For Ollama use http://localhost:11434/v1 and any key.',
  },
}

export function loadSettings(): LLMSettings {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) return JSON.parse(raw) as LLMSettings
  } catch {
    /* ignore */
  }
  return { provider: 'local', apiKey: '', model: '', baseUrl: '' }
}

export function saveSettings(s: LLMSettings) {
  localStorage.setItem(KEY, JSON.stringify(s))
}

export function isConfigured(s: LLMSettings): boolean {
  if (s.provider === 'local') return false
  if (s.provider === 'openai' && s.baseUrl.includes('localhost')) return !!s.model // Ollama needs no key
  return !!s.apiKey && !!s.model
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

async function callGemini(
  s: LLMSettings,
  system: string,
  messages: ChatMessage[],
  maxTokens: number,
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${s.model}:generateContent?key=${encodeURIComponent(
    s.apiKey,
  )}`
  const contents = messages.map((m) => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }))
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: system }] },
      contents,
      generationConfig: { temperature: 0.9, maxOutputTokens: maxTokens },
    }),
  })
  if (!res.ok) throw new Error(`Gemini ${res.status}`)
  const data = await res.json()
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini: empty response')
  return text.trim()
}

async function callOpenAICompatible(
  s: LLMSettings,
  system: string,
  messages: ChatMessage[],
  maxTokens: number,
): Promise<string> {
  const base = s.baseUrl.replace(/\/$/, '')
  const res = await fetch(`${base}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${s.apiKey || 'ollama'}`,
    },
    body: JSON.stringify({
      model: s.model,
      temperature: 0.9,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  })
  if (!res.ok) throw new Error(`LLM ${res.status}`)
  const data = await res.json()
  const text = data?.choices?.[0]?.message?.content
  if (!text) throw new Error('LLM: empty response')
  return text.trim()
}

async function chat(
  s: LLMSettings,
  system: string,
  messages: ChatMessage[],
  maxTokens = 120,
): Promise<string> {
  if (s.provider === 'gemini') return callGemini(s, system, messages, maxTokens)
  if (s.provider === 'openai') return callOpenAICompatible(s, system, messages, maxTokens)
  throw new Error('No LLM provider configured')
}

// ---------- Prompts the app uses ----------

const MIRA_SYSTEM = `You are Mira — a warm, easygoing friend the person is journaling with. Not a therapist, not a coach, not a bot.

Your reply is usually ONE short, natural response: a light reflection back, or a single simple question — whatever a good friend would actually say next.

How you sound:
- Casual and human. Talk the way a kind friend texts — plain words, contractions, a little warmth or personality. Short.
- Meet their energy. If they're up, be genuinely happy for them; if they're down, be gentle and unhurried. Never chirpy at the wrong moment.
- Reflect their OWN words and specifics back instead of generic prompts. React to what they actually said before nudging further.
- Vary how you open every time. Don't fall into a formula.

Hard limits:
- Keep it under ~25 words. One thought.
- Don't stack multiple questions. Often a warm reflection with no question at all is better.
- No advice, no pep-talk clichés, no "hold space" / "sit with that" therapy-speak, no lists, no emoji spam.
- Never diagnose or sound clinical.
- Output only your reply — no labels, no quotes.`

export async function llmFollowUp(
  s: LLMSettings,
  turns: Turn[],
  context?: string,
): Promise<string> {
  const messages: ChatMessage[] = turns.map((t) => ({
    role: t.role === 'you' ? 'user' : 'assistant',
    content: t.text,
  }))
  const system = context ? `${MIRA_SYSTEM}\n\nContext: ${context}` : MIRA_SYSTEM
  return chat(s, system, messages)
}

const NOTE_SYSTEM = `You turn a short journaling conversation into a "journal note" — a first-person diary entry the person can reread later.

Write it AS the person (use "I"), in their voice: warm, plain, natural. 2–5 short sentences.

Capture what actually happened and how they felt, drawn from what THEY said. This is their diary, not a transcript:
- Never include Mira's questions or quote the back-and-forth.
- Don't mention "Mira", "the conversation", or "you asked".
- No advice, no analysis, no therapy-speak, no headers or bullet points.
- If the day is past, write in past tense.

Output only the note.`

export async function llmJournalNote(
  s: LLMSettings,
  turns: Turn[],
  context?: string,
): Promise<string> {
  const transcript = turns
    .filter((t) => t.text.trim())
    .map((t) => `${t.role === 'you' ? 'Me' : 'Mira'}: ${t.text}`)
    .join('\n')
  const system = context ? `${NOTE_SYSTEM}\n\nContext: ${context}` : NOTE_SYSTEM
  const messages: ChatMessage[] = [
    {
      role: 'user',
      content: `Here's my journaling conversation. Write my journal note in first person:\n\n${transcript}`,
    },
  ]
  return chat(s, system, messages, 240)
}

const REFLECT_SYSTEM = `You are Mira, a journaling companion writing a weekly reflection.
Given a person's journal excerpts, write ONE warm, specific insight (max 2 sentences)
that reflects a pattern back to them — like a mirror. No advice, no lists, no preamble.
Refer to what actually recurs in their entries.`

export async function llmWeeklyInsight(s: LLMSettings, excerpts: string[]): Promise<string> {
  const joined = excerpts.slice(0, 20).map((e, i) => `${i + 1}. ${e}`).join('\n')
  const messages: ChatMessage[] = [
    { role: 'user', content: `Here are my journal excerpts from this week:\n${joined}` },
  ]
  return chat(s, REFLECT_SYSTEM, messages)
}
