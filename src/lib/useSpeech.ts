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
      return "Didn't catch that — hold the mic and try again."
    case 'audio-capture':
      return 'No microphone found. Check that one is connected.'
    case 'network':
      return 'Voice input needs a network connection right now.'
    case 'aborted':
      return '' // user- or code-initiated stop (e.g. slide-to-cancel); not worth surfacing
    default:
      return 'Voice input stopped unexpectedly. Try again.'
  }
}

type EndMode = 'idle' | 'commit' | 'cancel'

export interface UseSpeech {
  /** True when the Web Speech API exists in this browser (may still be flaky on iOS). */
  supported: boolean
  /** Actively capturing audio right now. */
  listening: boolean
  /** Live, not-yet-finalized words for the current utterance. */
  interim: string
  /** Finalized words accumulated during this recording session (for a live preview). */
  transcript: string
  /** Human-readable error, surfaced for permission/no-speech/interruptions. */
  error: string | null
  /** Milliseconds elapsed in the current recording (ticks while listening). */
  elapsedMs: number
  /** Begin a recording session. */
  start: () => void
  /** Stop and commit: fires the onCommit callback with everything transcribed. */
  stop: () => void
  /** Stop and discard: nothing is committed (slide-to-cancel). */
  cancel: () => void
  /** Keyboard-friendly fallback: start if idle, otherwise stop & commit. */
  toggle: () => void
  /** Dismiss the current error message. */
  clearError: () => void
}

/**
 * Speech-to-text tuned for a WhatsApp-style voice interaction:
 * press-and-hold to record, release to commit, or cancel to discard.
 *
 * Unlike a naive implementation, finalized words are buffered internally and
 * only handed to `onCommit` when the user *stops* — so `cancel()` can throw the
 * whole utterance away, and the caller decides when text lands in the draft.
 */
export function useSpeech(onCommit: (text: string) => void): UseSpeech {
  const [listening, setListening] = useState(false)
  const [interim, setInterim] = useState('')
  const [transcript, setTranscript] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [elapsedMs, setElapsedMs] = useState(0)
  // Detect support once, synchronously, without constructing an instance.
  const [supported] = useState(() => getCtor() !== null)

  // A single recognition instance, created lazily and reused across sessions.
  const recRef = useRef<SpeechRecognitionLike | null>(null)
  // The user's *intent* to keep listening. Lets an automatic `onend` (Chrome
  // ends the session after a pause) transparently resume instead of dying.
  const wantRef = useRef(false)
  // How the *current* session should resolve once it truly ends.
  const modeRef = useRef<EndMode>('idle')
  // Buffered finalized + interim text for the active session.
  const finalRef = useRef('')
  const interimRef = useRef('')
  const onCommitRef = useRef(onCommit)
  onCommitRef.current = onCommit

  const timerRef = useRef<number | null>(null)
  const startAtRef = useRef(0)

  const stopTimer = useCallback(() => {
    if (timerRef.current != null) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
  }, [])

  const startTimer = useCallback(() => {
    stopTimer()
    startAtRef.current = Date.now()
    setElapsedMs(0)
    timerRef.current = window.setInterval(() => {
      setElapsedMs(Date.now() - startAtRef.current)
    }, 200)
  }, [stopTimer])

  const resetBuffers = useCallback(() => {
    finalRef.current = ''
    interimRef.current = ''
    setInterim('')
    setTranscript('')
  }, [])

  const ensure = useCallback((): SpeechRecognitionLike | null => {
    if (recRef.current) return recRef.current
    const Ctor = getCtor()
    if (!Ctor) return null
    const rec = new Ctor()
    rec.lang = 'en-US'
    rec.continuous = true
    rec.interimResults = true

    rec.onresult = (e) => {
      let live = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const r = e.results[i]
        if (r.isFinal) finalRef.current += r[0].transcript
        else live += r[0].transcript
      }
      interimRef.current = live
      setInterim(live)
      setTranscript(finalRef.current)
    }

    rec.onerror = (e) => {
      // A genuine error ends the session for good — never auto-restart, or we'd
      // loop forever on e.g. `not-allowed`.
      wantRef.current = false
      modeRef.current = 'idle'
      const msg = messageForError(e?.error ?? '')
      if (msg) setError(msg)
      // On error we discard: partial audio after a failure isn't trustworthy.
      resetBuffers()
      setListening(false)
      stopTimer()
    }

    rec.onend = () => {
      // Chrome frequently ends the session on its own after a short silence even
      // with `continuous = true`. If the user still wants to record, resume.
      if (wantRef.current) {
        try {
          rec.start()
          return
        } catch {
          wantRef.current = false
        }
      }
      const mode = modeRef.current
      modeRef.current = 'idle'
      // Fold any trailing interim into the committed text (covers abrupt stops
      // where the last words never got a `isFinal` event).
      const full = `${finalRef.current} ${interimRef.current}`.trim()
      resetBuffers()
      setListening(false)
      stopTimer()
      if (mode === 'commit' && full) onCommitRef.current(full)
    }

    recRef.current = rec
    return rec
  }, [resetBuffers, stopTimer])

  // Stop cleanly if the component unmounts mid-session.
  useEffect(
    () => () => {
      wantRef.current = false
      modeRef.current = 'idle'
      stopTimer()
      recRef.current?.abort()
    },
    [stopTimer],
  )

  const start = useCallback(() => {
    const rec = ensure()
    if (!rec) {
      setError("Voice input isn't supported in this browser. Try Chrome or Edge.")
      return
    }
    if (wantRef.current) return // already recording
    setError(null)
    resetBuffers()
    modeRef.current = 'idle'
    wantRef.current = true
    try {
      rec.start()
    } catch {
      // InvalidStateError: it was already running — just reflect that.
    }
    setListening(true)
    startTimer()
  }, [ensure, resetBuffers, startTimer])

  const stop = useCallback(() => {
    if (!wantRef.current) return
    modeRef.current = 'commit'
    wantRef.current = false
    try {
      recRef.current?.stop()
    } catch {
      /* not running */
    }
  }, [])

  const cancel = useCallback(() => {
    modeRef.current = 'cancel'
    wantRef.current = false
    resetBuffers()
    try {
      recRef.current?.abort()
    } catch {
      /* not running */
    }
    setListening(false)
    stopTimer()
  }, [resetBuffers, stopTimer])

  const toggle = useCallback(() => {
    if (wantRef.current) stop()
    else start()
  }, [start, stop])

  const clearError = useCallback(() => setError(null), [])

  return {
    supported,
    listening,
    interim,
    transcript,
    error,
    elapsedMs,
    start,
    stop,
    cancel,
    toggle,
    clearError,
  }
}
