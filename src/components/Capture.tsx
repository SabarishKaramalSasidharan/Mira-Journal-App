import { useEffect, useRef, useState } from 'react'
import {
  ArrowUp,
  Calendar,
  Check,
  ChevronLeft,
  ChevronUp,
  ChevronRight,
  Lock,
  Mic,
  MicOff,
  Square,
  Trash2,
} from 'lucide-react'
import type { Entry, Mood, Turn } from '../types'
import { MOODS } from '../types'
import { dayContext, getEmotionFollowUp, getFollowUp, getMoodOpener, openingPrompt, extractThemes, summarize } from '../lib/ai'
import { useSpeech } from '../lib/useSpeech'
import Mascot from './Mascot'
import { MoodFace, EmotionFace } from './MoodFace'
import { EmotionPicker } from './EmotionPicker'
import { getEmotion } from '../lib/emotions'
import { moodToExpression, type MascotMood } from '../lib/mascotMood'
import type { SelectorStyle } from '../lib/selectorStyle'
import DatePicker from './DatePicker'
import '../styles/voice.css'

// Gesture thresholds for the WhatsApp-style voice interaction (px).
const CANCEL_DX = 90 // drag left past this to discard
const LOCK_DY = 64 // drag up past this to go hands-free

function fmtElapsed(ms: number): string {
  const total = Math.floor(ms / 1000)
  const m = Math.floor(total / 60)
  const s = total % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

// Static bar heights (%) for the animated recording waveform.
const WAVE_BARS = [38, 62, 30, 82, 52, 94, 44, 70, 34, 88, 50, 76, 40, 90, 58, 32, 68, 46]

interface Props {
  /** Persists the in-progress entry silently as the conversation grows. */
  onAutoSave: (entry: Entry) => void
  /** Finalizes the entry and triggers the success moment. */
  onFinish: (entry: Entry) => void
  /** Which mood selector to render: the new Hybrid "faces" or classic "weather". */
  selectorStyle: SelectorStyle
}

const DAY = 86400000
const startOfDay = (d: Date) => {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
const addDays = (d: Date, n: number) => startOfDay(new Date(d.getTime() + n * DAY))
const sameDay = (a: Date, b: Date) => startOfDay(a).getTime() === startOfDay(b).getTime()

function dateLabel(d: Date): string {
  const today = startOfDay(new Date())
  if (sameDay(d, today)) return 'Today'
  if (sameDay(d, addDays(today, -1))) return 'Yesterday'
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: d.getFullYear() !== today.getFullYear() ? 'numeric' : undefined,
  })
}

export default function Capture({ onAutoSave, onFinish, selectorStyle }: Props) {
  const [prompt] = useState(openingPrompt)
  const [turns, setTurns] = useState<Turn[]>([{ role: 'mira', text: prompt }])
  const [draft, setDraft] = useState('')
  const [mood, setMood] = useState<Mood | null>(null)
  // Optional categorical emotion tag (Hybrid selector, step 2). Independent of
  // the 1–5 `mood` score, so it never affects the trend chart.
  const [emotion, setEmotion] = useState<string | null>(null)
  const [moodOpened, setMoodOpened] = useState(false)
  // One feeling per conversation: once picked, the "Add a feeling?" block
  // collapses (mirrors `moodOpened` hiding the 1–5 ladder after a valence tap).
  const [emotionOpened, setEmotionOpened] = useState(false)
  const [thinking, setThinking] = useState(false)
  const [selectedDate, setSelectedDate] = useState(() => startOfDay(new Date()))

  const [pickerOpen, setPickerOpen] = useState(false)
  // Surfaces the silent auto-save so people know it's safe to leave.
  const [saved, setSaved] = useState(false)
  const [savedTick, setSavedTick] = useState(0)

  const taRef = useRef<HTMLTextAreaElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  // Stable identity for this entry so auto-saves update in place instead of piling up.
  const entryId = useRef<string | null>(null)
  const createdAt = useRef<number | null>(null)
  // Keep the latest onAutoSave without retriggering the persist effect.
  const autoSaveRef = useRef(onAutoSave)
  autoSaveRef.current = onAutoSave

  const isToday = sameDay(selectedDate, new Date())

  const greetingFor = (d: Date) =>
    sameDay(d, new Date())
      ? prompt
      : `Journaling for ${dateLabel(d)}. What do you want to capture from that day?`

  // Changing the date always starts a brand-new conversation for that day.
  // Prior turns are already auto-saved (each turn persists), so nothing is lost —
  // we simply begin a separate entry on the newly selected date.
  const changeDate = (d: Date) => {
    const next = startOfDay(d)
    if (next.getTime() > startOfDay(new Date()).getTime()) return // no future
    setSelectedDate(next)
    // Fresh conversation: reset visible state back to a clean opening prompt…
    setTurns([{ role: 'mira', text: greetingFor(next) }])
    setDraft('')
    setMood(null)
    setEmotion(null)
    setMoodOpened(false)
    setEmotionOpened(false)
    setThinking(false)
    // …and drop this entry's identity so the new date persists as its own entry.
    entryId.current = null
    createdAt.current = null
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  const {
    listening,
    interim,
    transcript,
    supported,
    error: speechError,
    elapsedMs,
    start: startVoice,
    stop: stopVoice,
    cancel: cancelVoice,
    clearError: clearSpeechError,
  } = useSpeech((finalText) => {
    const clean = finalText.trim()
    if (clean) setDraft((d) => (d ? d + ' ' : '') + clean)
  })

  // WhatsApp-style recording gesture state.
  const [locked, setLocked] = useState(false) // hands-free mode (released finger / keyboard)
  const [pressing, setPressing] = useState(false) // finger currently held on the mic
  const [cancelArmed, setCancelArmed] = useState(false) // dragged far enough left to discard
  const [dragX, setDragX] = useState(0)
  const pressingRef = useRef(false)
  const cancelArmedRef = useRef(false)
  const startPtRef = useRef({ x: 0, y: 0 })

  // Any of these means the composer is swapped for the recording bar.
  const recActive = pressing || locked || listening

  const resetGesture = () => {
    pressingRef.current = false
    cancelArmedRef.current = false
    setPressing(false)
    setCancelArmed(false)
    setDragX(0)
  }

  const beginHold = (e: React.PointerEvent) => {
    if (!supported || recActive) return
    e.preventDefault()
    try {
      ;(e.currentTarget as HTMLElement).setPointerCapture?.(e.pointerId)
    } catch {
      /* ignore */
    }
    startPtRef.current = { x: e.clientX, y: e.clientY }
    pressingRef.current = true
    cancelArmedRef.current = false
    setPressing(true)
    setLocked(false)
    setCancelArmed(false)
    setDragX(0)
    startVoice()
  }

  const moveHold = (e: React.PointerEvent) => {
    if (!pressingRef.current) return
    const dx = e.clientX - startPtRef.current.x
    const dy = e.clientY - startPtRef.current.y
    // Slide up past the threshold → lock into hands-free mode.
    if (dy < -LOCK_DY) {
      pressingRef.current = false
      cancelArmedRef.current = false
      setPressing(false)
      setCancelArmed(false)
      setDragX(0)
      setLocked(true)
      try {
        ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
      } catch {
        /* ignore */
      }
      return
    }
    setDragX(Math.min(0, dx))
    const armed = dx < -CANCEL_DX
    cancelArmedRef.current = armed
    setCancelArmed(armed)
  }

  const endHold = (e: React.PointerEvent) => {
    if (!pressingRef.current) return
    try {
      ;(e.currentTarget as HTMLElement).releasePointerCapture?.(e.pointerId)
    } catch {
      /* ignore */
    }
    const discard = cancelArmedRef.current
    resetGesture()
    if (discard) cancelVoice()
    else stopVoice()
  }

  // Keyboard fallback: press-hold isn't keyboard-operable, so Enter/Space
  // toggles a locked (hands-free) recording that a Stop button can end.
  const onMicKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return
    e.preventDefault()
    if (!supported) return
    if (recActive) {
      setLocked(false)
      stopVoice()
    } else {
      setLocked(true)
      startVoice()
    }
  }

  const stopLocked = () => {
    setLocked(false)
    stopVoice()
  }
  const cancelLocked = () => {
    setLocked(false)
    cancelVoice()
  }

  // Live preview of what's being transcribed (final so far + current interim).
  const livePreview = [transcript, interim].filter(Boolean).join(' ').trim()

  // Keyboard focus management: when we lock (e.g. via keyboard), move focus to
  // the Stop button; when recording ends, hand focus back to the mic.
  const micBtnRef = useRef<HTMLButtonElement>(null)
  const stopBtnRef = useRef<HTMLButtonElement>(null)
  const wasRecordingRef = useRef(false)

  useEffect(() => {
    if (locked) stopBtnRef.current?.focus()
  }, [locked])

  useEffect(() => {
    if (recActive) {
      wasRecordingRef.current = true
    } else if (wasRecordingRef.current) {
      wasRecordingRef.current = false
      micBtnRef.current?.focus()
    }
  }, [recActive])

  // Intentionally NOT auto-focusing the composer on mount / tab arrival: doing
  // so pops the iOS keyboard before people have seen the page (mascot, mood
  // chips, intro). The textarea only takes focus when the user taps it, or
  // after they send a message and are clearly mid-conversation (see send()).

  // Keep the composer sized to its content even when text arrives via voice
  // (which sets state directly and bypasses the textarea's onChange auto-grow).
  useEffect(() => {
    const el = taRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }, [draft])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [turns, thinking])

  const autoGrow = (el: HTMLTextAreaElement) => {
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 160) + 'px'
  }

  const hasWritten = turns.some((t) => t.role === 'you')

  const selectMood = async (m: Mood) => {
    if (moodOpened) return // one mood per conversation; the row is hidden after this
    const meta = MOODS.find((x) => x.key === m)!
    setMood(m)
    setMoodOpened(true)
    // The tapped mood shows up in the chat as your message…
    setTurns((t) => [...t, { role: 'you', kind: 'mood', text: `${meta.emoji} Feeling ${meta.label.toLowerCase()}` }])
    // …then Mira follows up.
    setThinking(true)
    const q = await getMoodOpener(m, dayContext(selectedDate))
    setThinking(false)
    setTurns((t) => [...t, { role: 'mira', text: q }])
    // No focus here: tapping a mood shouldn't force the keyboard open. People
    // can read Mira's reply first, then tap the box when they're ready to type.
  }

  // Optional emotion tag (step 2 of the Hybrid selector). Mirrors the valence
  // pick: one feeling per conversation, so choosing collapses the picker and
  // posts a USER chat bubble (droplet face + label). It then triggers an
  // emotion-specific Mira follow-up, reusing the same typing-indicator + async
  // append pattern as send()/selectMood. The auto-save effect persists `emotion`.
  const selectEmotion = async (id: string | null) => {
    // One feeling per conversation; ignore clears; don't fire mid-typing so we
    // can't stack onto (or race with) the valence opener still being composed.
    if (emotionOpened || !id || thinking) return
    const meta = getEmotion(id)
    if (!meta) return
    setEmotion(id)
    setEmotionOpened(true)
    // The tapped feeling shows up as your message…
    const next: Turn[] = [...turns, { role: 'you', kind: 'emotion', emotion: id, text: meta.label }]
    setTurns(next)
    // …then Mira follows up, tailored to that emotion.
    setThinking(true)
    const q = await getEmotionFollowUp(id, { turns: next, mood, dayContext: dayContext(selectedDate) })
    setThinking(false)
    setTurns((t) => [...t, { role: 'mira', text: q }])
    // No focus grab — let people read Mira's reply before the keyboard opens.
  }

  const send = async () => {
    const text = draft.trim()
    if (!text || thinking) return
    const next: Turn[] = [...turns, { role: 'you', text }]
    setTurns(next)
    setDraft('')
    if (taRef.current) taRef.current.style.height = 'auto'
    setThinking(true)
    const q = await getFollowUp(next, mood, dayContext(selectedDate))
    setThinking(false)
    setTurns((t) => [...t, { role: 'mira', text: q }])
    taRef.current?.focus()
  }

  // Build the entry from the current turns/mood, reusing a stable id + timestamp
  // so repeated auto-saves overwrite the same record. Returns null when there's
  // nothing worth saving yet (no mood and no written text).
  const buildEntry = (currTurns: Turn[], currMood: Mood | null, currEmotion: string | null): Entry | null => {
    const textTurns = currTurns.filter(
      (t) => t.role === 'you' && t.kind !== 'mood' && t.kind !== 'emotion',
    )
    const youText = textTurns.map((t) => t.text).join(' ')
    if (!youText && !currMood) return null
    // The emotion bubble is a live conversational affordance only; `emotion`
    // below is the persisted source of truth, so keep these transient turns out
    // of the saved transcript (mirrors how mood turns are handled downstream).
    const savedTurns = currTurns.filter((t) => t.kind !== 'emotion')
    if (!entryId.current) {
      entryId.current = crypto.randomUUID()
      // Save under the selected date, keeping the current time-of-day for ordering.
      const now = new Date()
      const stamp = new Date(selectedDate)
      stamp.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), 0)
      createdAt.current = stamp.getTime()
    }
    const moodLabel = currMood ? MOODS.find((m) => m.key === currMood)?.label.toLowerCase() : null
    return {
      id: entryId.current,
      createdAt: createdAt.current!,
      mood: currMood,
      turns: savedTurns,
      themes: extractThemes(youText),
      summary: youText ? summarize(savedTurns) : `Checked in — feeling ${moodLabel ?? 'okay'}`,
      // Optional tag — omitted entirely when unset so untagged entries stay clean.
      ...(currEmotion ? { emotion: currEmotion } : {}),
    }
  }

  // Auto-save whenever the conversation changes — nothing is ever lost.
  useEffect(() => {
    const entry = buildEntry(turns, mood, emotion)
    if (entry) {
      autoSaveRef.current(entry)
      setSaved(true)
      setSavedTick((n) => n + 1) // re-triggers the little "saved" pulse
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turns, mood, emotion])

  const finish = () => {
    const entry = buildEntry(turns, mood, emotion)
    if (!entry) return
    onFinish(entry)
  }

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault()
      send()
    }
  }

  // When the composer is empty but there's something to keep, the send button
  // becomes a clear "Finish" — same thumb position, no top-corner hunt.
  const finishMode = !draft.trim() && (hasWritten || !!mood)

  // Once a mood is logged, Mira empathetically mirrors it; before that she's her
  // default cheerful self. (The typing indicator stays "thinking" on its own.)
  const miraExpression: MascotMood = mood ? moodToExpression(mood) : 'happy'

  const selectedLabel = mood ? MOODS.find((m) => m.key === mood)?.label : null
  const moodLabel = !moodOpened && !hasWritten
    ? 'How are you feeling? Tap to begin'
    : selectedLabel
      ? `Feeling ${selectedLabel.toLowerCase()}`
      : 'Mood'

  return (
    <div className="flex h-full flex-col">
      {/* Date bar */}
      <div className="relative flex items-center justify-center gap-1 px-5 pb-1 pt-2">
        <button
          onClick={() => changeDate(addDays(selectedDate, -1))}
          aria-label="Previous day"
          className="grid h-8 w-8 place-items-center rounded-full text-soft transition hover:bg-surface-2 active:scale-90"
        >
          <ChevronLeft size={18} aria-hidden="true" />
        </button>

        <div className="relative">
          <button
            onClick={() => setPickerOpen((o) => !o)}
            aria-haspopup="dialog"
            aria-expanded={pickerOpen}
            className="flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1.5 text-sm font-semibold text-content transition active:scale-95"
            aria-label={`Journaling for ${dateLabel(selectedDate)}. Tap to pick a date.`}
          >
            <Calendar size={15} aria-hidden="true" />
            {dateLabel(selectedDate)}
          </button>
          {pickerOpen && (
            <DatePicker
              value={selectedDate}
              max={new Date()}
              onSelect={(d) => {
                changeDate(d)
                setPickerOpen(false)
              }}
              onClose={() => setPickerOpen(false)}
            />
          )}
        </div>

        <button
          onClick={() => changeDate(addDays(selectedDate, 1))}
          disabled={isToday}
          aria-label="Next day"
          className="grid h-8 w-8 place-items-center rounded-full text-soft transition hover:bg-surface-2 active:scale-90 disabled:opacity-30"
        >
          <ChevronRight size={18} aria-hidden="true" />
        </button>

        {/* Quiet reassurance that the conversation is being kept automatically. */}
        {saved && (
          <span
            key={savedTick}
            role="status"
            aria-live="polite"
            className="animate-fade-up absolute right-4 flex items-center gap-1 text-xs font-semibold text-mute"
          >
            <Check size={13} aria-hidden="true" /> Auto-saved
          </span>
        )}
      </div>

      {/* Conversation */}
      <div ref={scrollRef} className="no-scrollbar flex-1 space-y-4 overflow-y-auto px-5 pb-6 pt-3">
        {turns.map((t, i) => (
          <Bubble key={i} turn={t} miraMood={miraExpression} />
        ))}
        {thinking && <Typing />}
      </div>

      {/* Mood selector. In "faces" (Hybrid) mode this is a two-step flow: the
          1–5 mascot ladder first, then an optional emotion tag. In "weather"
          mode it's the classic one-tap emoji scale. One entry = one valence, so
          the ladder collapses after a tap (same behavior in both styles). */}
      {selectorStyle === 'faces' ? (
        // Hidden entirely once both steps are done (valence picked + feeling
        // chosen or skipped by finishing) so no empty padding lingers.
        (!moodOpened || !emotionOpened) && (
          <div className="px-4 pt-1">
            {!moodOpened ? (
              /* Step 1 — 1–5 mascot ladder */
              <>
                <div className="mb-1.5 px-1">
                  <span
                    className={`animate-rise text-xs font-semibold ${!hasWritten ? 'text-accent-text' : 'text-soft'}`}
                  >
                    {moodLabel}
                  </span>
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {MOODS.map((m, i) => (
                    <button
                      key={m.key}
                      onClick={() => selectMood(m.key)}
                      className="animate-rise flex flex-col items-center gap-1 rounded-2xl px-1 py-2 ring-1 ring-border transition-all active:scale-90"
                      style={{ background: 'var(--surface-2)', animationDelay: `${i * 40}ms` }}
                      title={m.label}
                      aria-label={`${m.label} — rate your day ${i + 1} of 5`}
                    >
                      <MoodFace mood={m.key} size={34} decorative className={!hasWritten ? '' : 'opacity-70'} />
                      <span
                        className={`text-[11px] font-semibold ${!hasWritten ? 'text-content' : 'text-mute'}`}
                      >
                        {m.label}
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              /* Step 2 — optional emotion tag (skippable). Collapses after a
                 pick, one feeling per conversation. */
              <div className="animate-rise">
                <div className="mb-1.5 px-1">
                  <span className="text-xs font-semibold text-soft">Add a feeling? (optional)</span>
                </div>
                <EmotionPicker value={emotion} onChange={selectEmotion} />
              </div>
            )}
          </div>
        )
      ) : (
        !moodOpened && (
          <div className="px-4 pt-1">
            <div className="mb-1.5 px-1">
              <span
                className={`animate-rise text-xs font-semibold ${!hasWritten ? 'text-accent-text' : 'text-soft'}`}
              >
                {moodLabel}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {MOODS.map((m, i) => (
                <button
                  key={m.key}
                  onClick={() => selectMood(m.key)}
                  className="animate-rise grid h-12 place-items-center rounded-2xl text-2xl ring-1 ring-border transition-all active:scale-90"
                  style={{ background: 'var(--surface-2)', animationDelay: `${i * 40}ms` }}
                  title={m.label}
                  aria-label={m.label}
                >
                  <span className={!hasWritten ? '' : 'opacity-60'}>{m.emoji}</span>
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {/* Composer */}
      <div className="relative px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        {speechError && (
          <div
            role="alert"
            className="mb-2 flex items-start justify-between gap-3 px-2 text-sm font-semibold text-flame"
          >
            <span className="min-w-0">{speechError}</span>
            <button
              onClick={clearSpeechError}
              className="shrink-0 text-xs font-semibold text-mute underline underline-offset-2 transition active:scale-95"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Base composer row. Kept mounted (even while recording) so the held
            mic button retains pointer capture through the whole gesture. */}
        <div aria-hidden={recActive || undefined} className={recActive ? 'opacity-0' : ''}>
          {!supported && (
            <p className="mb-2 px-2 text-xs font-medium text-mute">
              Voice input isn&apos;t available in this browser — you can still type. Try Chrome or Edge for the mic.
            </p>
          )}
          <div className="flex items-end gap-2">
            <button
              ref={micBtnRef}
              type="button"
              onPointerDown={beginHold}
              onPointerMove={moveHold}
              onPointerUp={endHold}
              onPointerCancel={endHold}
              onKeyDown={onMicKey}
              disabled={!supported}
              aria-label={
                supported
                  ? 'Record voice. Hold to talk; slide up to lock, slide left to cancel. Press Enter or Space to toggle recording.'
                  : "Voice input isn't supported in this browser"
              }
              title={supported ? 'Hold to talk' : "Voice input isn't supported in this browser"}
              className="grid h-11 w-11 shrink-0 touch-none select-none place-items-center rounded-lg border border-border transition active:scale-90 disabled:cursor-not-allowed"
              style={{
                background: 'var(--surface)',
                color: 'var(--content-soft)',
                boxShadow: '0 3px 0 0 rgba(0,0,0,0.10)',
                opacity: supported ? 1 : 0.5,
              }}
            >
              {supported ? (
                <Mic size={20} aria-hidden="true" />
              ) : (
                <MicOff size={20} aria-hidden="true" />
              )}
            </button>
            <textarea
              ref={taRef}
              value={draft}
              onChange={(e) => {
                setDraft(e.target.value)
                autoGrow(e.target)
              }}
              onKeyDown={onKey}
              rows={1}
              aria-label="Write your journal entry"
              placeholder="Write or hold the mic…"
              className="max-h-40 min-h-[2.875rem] flex-1 resize-none rounded-lg border border-border bg-surface px-4 py-3 text-[15px] font-medium leading-relaxed text-content shadow-sm outline-none placeholder:overflow-hidden placeholder:whitespace-nowrap placeholder:text-ellipsis placeholder:text-mute focus-within:ring-2 focus-within:ring-accent/60 focus:ring-2 focus:ring-accent/60"
            />
            {finishMode ? (
              <button
                onClick={finish}
                aria-label="Finish entry"
                className="btn3d flex h-11 shrink-0 items-center gap-1.5 rounded-lg bg-accent px-4 text-sm font-semibold text-on-accent"
                style={{ boxShadow: '0 4px 0 0 var(--accent-strong)' }}
              >
                <Check size={18} aria-hidden="true" /> Finish
              </button>
            ) : (
              <button
                onClick={send}
                disabled={!draft.trim() || thinking}
                aria-label="Send"
                className="btn3d grid h-11 w-11 shrink-0 place-items-center rounded-lg bg-accent text-on-accent disabled:opacity-40 disabled:active:translate-y-0"
                style={{ boxShadow: '0 4px 0 0 var(--accent-strong)' }}
              >
                <ArrowUp size={20} aria-hidden="true" />
              </button>
            )}
          </div>
        </div>

        {/* Recording overlay — sits on top of the (still-mounted) base row. */}
        {recActive && (
          <div className="voice-rec-enter absolute inset-0 flex flex-col justify-end bg-bg px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
            {/* Screen-reader status */}
            <div className="sr-only" role="status" aria-live="polite">
              {cancelArmed
                ? 'Release to cancel recording.'
                : locked
                  ? 'Recording locked, hands-free.'
                  : 'Recording.'}{' '}
              {livePreview}
            </div>

            {/* Slide-up-to-lock hint (only while actively holding) */}
            {pressing && !locked && (
              <div className="mb-2 flex justify-center">
                <div
                  className={`voice-lock-hint flex flex-col items-center gap-0.5 rounded-full bg-surface-2 px-2.5 py-2 text-mute shadow-sm transition-opacity ${
                    cancelArmed ? 'opacity-20' : ''
                  }`}
                >
                  <Lock size={14} aria-hidden="true" />
                  <ChevronUp size={12} aria-hidden="true" />
                </div>
              </div>
            )}

            {/* Live transcription preview */}
            {livePreview && (
              <div className="mb-2 max-h-16 overflow-y-auto px-2 text-sm font-medium leading-relaxed text-soft">
                {transcript}
                {interim && <span className="text-mute"> {interim}</span>}
              </div>
            )}

            {/* The recording bar */}
            <div
              className="flex items-center gap-3 rounded-lg border border-border bg-surface px-4 py-3 shadow-sm"
              style={{
                transform: dragX ? `translateX(${Math.max(dragX, -48)}px)` : undefined,
              }}
            >
              {cancelArmed ? (
                <Trash2 size={20} className="shrink-0 text-flame" aria-hidden="true" />
              ) : (
                <span className="voice-dot h-3 w-3 shrink-0 rounded-full bg-flame" aria-hidden="true" />
              )}
              <span
                className="shrink-0 text-sm font-semibold tabular-nums text-content"
                aria-hidden="true"
              >
                {fmtElapsed(elapsedMs)}
              </span>

              {/* Waveform */}
              <div
                className={`flex h-6 flex-1 items-center justify-center gap-[3px] overflow-hidden ${
                  cancelArmed ? 'text-flame' : 'text-accent'
                }`}
                aria-hidden="true"
              >
                {WAVE_BARS.map((h, i) => (
                  <span
                    key={i}
                    className="voice-bar"
                    style={{ height: `${h}%`, animationDelay: `${i * 70}ms` }}
                  />
                ))}
              </div>

              {locked ? (
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    onClick={cancelLocked}
                    aria-label="Cancel recording"
                    className="grid h-9 w-9 place-items-center rounded-full text-flame transition active:scale-90"
                  >
                    <Trash2 size={18} aria-hidden="true" />
                  </button>
                  <button
                    ref={stopBtnRef}
                    onClick={stopLocked}
                    aria-label="Stop and save recording"
                    className="btn3d grid h-9 w-9 place-items-center rounded-full bg-accent text-on-accent"
                    style={{ boxShadow: '0 3px 0 0 var(--accent-strong)' }}
                  >
                    <Square size={15} fill="currentColor" aria-hidden="true" />
                  </button>
                </div>
              ) : (
                <span
                  className={`voice-cancel-hint flex shrink-0 items-center gap-1 text-sm font-semibold ${
                    cancelArmed ? 'text-flame' : 'text-mute'
                  }`}
                  aria-hidden="true"
                >
                  <ChevronLeft size={16} aria-hidden="true" />
                  {cancelArmed ? 'Release to cancel' : 'Slide to cancel'}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Bubble({ turn, miraMood }: { turn: Turn; miraMood: MascotMood }) {
  const isMira = turn.role === 'mira'

  if (turn.kind === 'mood') {
    return (
      <div className="flex animate-pop justify-end">
        <div className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-on-accent shadow-sm">
          {turn.text}
        </div>
      </div>
    )
  }

  // Optional feeling tag posted as a user bubble — same right-aligned accent
  // pill as the mood turn, with the droplet face on a light chip so the teal
  // body stays legible, plus the always-visible text label.
  if (turn.kind === 'emotion') {
    return (
      <div className="flex animate-pop justify-end">
        <div className="flex items-center gap-1.5 rounded-full bg-accent py-1.5 pl-1.5 pr-4 text-sm font-semibold text-on-accent shadow-sm">
          <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-accent-soft">
            <EmotionFace emotion={turn.emotion ?? ''} size={22} decorative />
          </span>
          {turn.text}
        </div>
      </div>
    )
  }

  return (
    <div className={`flex animate-fade-up items-end gap-2 ${isMira ? 'justify-start' : 'justify-end'}`}>
      {isMira && (
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft">
          <Mascot size={26} mood={miraMood} decorative />
        </div>
      )}
      <div
        className={`max-w-[80%] px-4 py-3 text-[15px] font-medium leading-relaxed shadow-sm ${
          isMira
            ? 'rounded-2xl rounded-bl-md bg-surface text-content'
            : 'rounded-2xl rounded-br-md bg-accent text-on-accent'
        }`}
      >
        {turn.text}
      </div>
    </div>
  )
}

function Typing() {
  return (
    <div className="flex animate-fade-up items-end gap-2" role="status" aria-label="Mira is typing">
      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-accent-soft">
        <Mascot size={26} mood="thinking" decorative />
      </div>
      <div className="flex gap-1 rounded-2xl rounded-bl-md bg-surface px-4 py-4 shadow-sm" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="h-2 w-2 animate-bounce rounded-full bg-mute/70"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  )
}
