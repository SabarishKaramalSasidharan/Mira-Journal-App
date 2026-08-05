# Mira — think out loud

A journaling app built around one idea: **journaling dies at the blank page.**
Mira removes the blank page and the friction of starting, so time-to-first-word
is under 5 seconds.

The wedge: **conversational capture + AI reflection.**
Instead of a blank cursor, Mira asks you one smart question and you just reply —
like texting a friend. Then it reflects your week back to you (the "mirror"),
which is the real retention hook.

## What's in the prototype

- **Write** — Opens *directly into the input*, keyboard up, with a smart daily
  prompt (varies by time of day). Type or **speak** (Web Speech API). Mira asks
  context-aware follow-ups. Autosaves; no title, no save button, no filing.
- **Journal** — A clean timeline of entries with mood, an auto-summary, and
  auto-extracted themes.
- **Reflect** — A weekly "mirror": mood trend, recurring themes, and a
  pattern-spotting insight (e.g. "Tuesdays look consistently harder for you").
- **Streak** — Rewards *showing up*, not word count.

Mobile-first, rendered in a phone-shaped shell so it feels like an app on
desktop too. Data is stored locally (localStorage) — no backend needed to try it.

## Run it

```bash
npm install
npm run dev
```

Then open the printed local URL (default http://localhost:5173).

## Use a real LLM (free options)

Mira works offline for free (rule-based engine). To get richer, more natural
conversations, open **Settings** (⚙️ in the header) and connect a free provider:

- **Google Gemini** — free tier, `gemini-2.0-flash`. Get a key at
  https://aistudio.google.com/app/apikey. Best default.
- **Groq** — free & very fast (OpenAI-compatible). Base URL
  `https://api.groq.com/openai/v1`, key at https://console.groq.com/keys.
- **Ollama** — 100% local & private. Base URL `http://localhost:11434/v1`, any key.
- **OpenRouter** — also OpenAI-compatible.

Keys are stored only in your browser and calls go straight to the provider.
**For production, proxy these through a backend** so keys are never exposed
(the provider layer lives in `src/lib/llm.ts`).

## Mobile / PWA

This is an installable PWA (via `vite-plugin-pwa`): add to home screen on
iOS/Android and it runs standalone and offline. App icons are generated from
`public/icon.svg` — run `node scripts/gen-icons.mjs` after changing it.

Next step to reach the app stores: wrap this web app with **Capacitor** (fastest,
reuses this exact codebase) or rebuild the shell in **Expo/React Native**.

## Stack

React + TypeScript + Vite + Tailwind CSS v4 + vite-plugin-pwa.

## Structure

```
src/
  App.tsx                 # shell: header, streak, settings, bottom nav, routing
  types.ts                # Entry / Turn / Mood
  lib/
    ai.ts                 # prompts, follow-ups, themes, weekly reflection, chart data
    llm.ts                # LLM provider layer (Gemini / OpenAI-compatible)
    storage.ts            # localStorage + streak
    useSpeech.ts          # voice input (Web Speech API)
  components/
    Capture.tsx           # the fast conversational capture loop
    Timeline.tsx          # journal list
    Reflection.tsx        # weekly "mirror" + charts
    Charts.tsx            # SVG mood trend + theme bars (no chart deps)
    Settings.tsx          # pick LLM provider + paste free key
scripts/
  gen-icons.mjs           # regenerate PWA PNG icons from public/icon.svg
```
