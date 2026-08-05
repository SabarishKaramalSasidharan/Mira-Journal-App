import { useCallback, useEffect, useRef, useState } from 'react'

// Minimal typings for the Web Speech API (not in lib.dom by default).
interface SpeechRecognitionErrorEventLike {
  error: string
  message?: string
}
interface SpeechRecognitionEventLike {
  resultIndex: number
  results: {
    length: number
    [i: number]: { 0: { transcript: string }; isFinal: boolean }
  }
}
interface SpeechRecognitionLike {
  lang: string
  continuous: boolean
  interimResults: boolean
  start: () => void
  stop: () => void
  abort: () => void
  onresult: ((e: SpeechRecognitionEventLike) => void) | null
  onend: (() => void) | null
  onerror: ((e: SpeechRecognitionErrorEventLike) => void) | null
}

type SpeechRecognitionCtor = new () => SpeechRecognitionLike

function getCtor(): SpeechRecognitionCtor | null {
  if (typeof window === 'undefined') return null
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionCtor
    webkitSpeechRecognition?: SpeechRecognitionCtor
  }
  return w.SpeechRecognition || w.webkitSpeechRecognition || null
}

// Turn the browser's terse error codes into something a person can act on.
function messageForError(code: string): string {
  switch (code) {
    case 'not-allowed':
    case 'service-not-allowed':
      return 'Microphone access is blocked. Allow it in your browser settings to use voice input.'
    case 'no-speech':
      return "Didn't catch that — tap the mic and try again."
    case 'audio-capture':
      return 'No microphone found. Check that one is connected.'
    case 'network':
      return 'Voice input needs a network connection right now.'
    case 'aborted':
      return '' // user- or code-initiated stop; not worth surfacing
    default:
      return 'Voice input stopped unexpectedly. Try again.'
  }
}

export function useSpeech(onFinal: (text: string) => void) {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [error, setError] = useState<string | null>(null)
  // Detect support once, synchronously, without constructing an instance.
  const [supported] = useState(() => getCtor() !== null)

  // A single recognition instance, created lazily and reused across toggles.
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  // The user's *intent* to listen. Lets an automatic `onend` (Chrome ends the
  // session after a pause) transparently resume instead of dying silently.
  const wantRef = useRef(false)
  const onFinalRef = useRef(onFinal)
  onFinalRef.current = onFinal

  const ensure = useCallback((): SpeechRecognitionLike | null => {
    if (recRef.current) return recRef.current
    const Ctor = getCtor()
    if (!Ctor) return null
    const rec = new Ctor()
    rec.lang = 'en-US'
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = (e) => {
      let final = ''
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) final += r[0].transcript
        else live += r[0].transcript
      }
      if (final) onFinalRef.current(final)
      setInterim(live)
    }

    rec.onerror = (e) => {
      // A genuine error ends the session for good — never auto-restart, or we'd
      // loop forever on e.g. `not-allowed`.
      wantRef.current = false
      const msg = messageForError(e?.error ?? '')
      if (msg) setError(msg)
      setListening(false)
      setInterim('')
    }

    rec.onend = () => {
      setInterim('')
      // Keep going if the user hasn't tapped stop — Chrome frequently ends the
      // session on its own after a short silence even with `continuous = true`.
      if (wantRef.current) {
        try {
          rec.start()
          return
        } catch {
          wantRef.current = false
        }
      }
      setListening(false)
    }

    recRef.current = rec
    return rec
  }, [])

  // Stop cleanly if the component unmounts mid-session.
  useEffect(
    () => () => {
      wantRef.current = false
      recRef.current?.abort()
    },
    [],
  )

  const toggle = useCallback(() => {
    const rec = ensure()
    if (!rec) {
      setError("Voice input isn't supported in this browser. Try Chrome or Edge.")
      return
    }
    // Use the intent ref (not React state) so this is never a stale decision.
    if (wantRef.current) {
      wantRef.current = false
      rec.stop()
      setListening(false)
      setInterim('')
      return
    }
    setError(null)
    wantRef.current = true
    try {
      rec.start()
      setListening(true)
    } catch {
      // InvalidStateError: it was already running — just reflect that.
      setListening(true)
    }
  }, [ensure])

  return { listening, interim, supported, error, toggle }
}
