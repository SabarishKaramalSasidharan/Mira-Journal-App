import { useEffect, useRef, useState } from 'react'
import { ArrowUp, Calendar, Check, ChevronLeft, ChevronRight, Mic } from 'lucide-react'
import type { Entry, Mood, Turn } from '../types'
import { MOODS } from '../types'
import { dayContext, getFollowUp, getMoodOpener, openingPrompt, extractThemes, summarize } from '../lib/ai'
import { useSpeech } from '../lib/useSpeech'
import Mascot from './Mascot'
import { moodToExpression, type MascotMood } from '../lib/mascotMood'
import DatePicker from './DatePicker'

interface Props {
  /** Persists the in-progress entry silently as the conversation grows. */
  onAutoSave: (entry: Entry) => void
  /** Finalizes the entry and triggers the success moment. */
  onFinish: (entry: Entry) => void
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

export default function Capture({ onAutoSave, onFinish }: Props) {
  const [prompt] = useState(openingPrompt)
  const [turns, setTurns] = useState<Turn[]>([{ role: 'mira', text: prompt }])
  const [draft, setDraft] = useState('')
  const [mood, setMood] = useState<Mood | null>(null)
  const [moodOpened, setMoodOpened] = useState(false)
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
    setMoodOpened(false)
    setThinking(false)
    // …and drop this entry's identity so the new date persists as its own entry.
    entryId.current = null
    createdAt.current = null
    if (taRef.current) taRef.current.style.height = 'auto'
  }

  const { listening, interim, supported, error: speechError, toggle } = useSpeech((finalText) =>
    setDraft((d) => (d ? d + ' ' : '') + finalText.trim()),
  )

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
  const buildEntry = (currTurns: Turn[], currMood: Mood | null): Entry | null => {
    const textTurns = currTurns.filter((t) => t.role === 'you' && t.kind !== 'mood')
    const youText = textTurns.map((t) => t.text).join(' ')
    if (!youText && !currMood) return null
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
      turns: currTurns,
      themes: extractThemes(youText),
      summary: youText ? summarize(currTurns) : `Checked in — feeling ${moodLabel ?? 'okay'}`,
    }
  }

  // Auto-save whenever the conversation changes — nothing is ever lost.
  useEffect(() => {
    const entry = buildEntry(turns, mood)
    if (entry) {
      autoSaveRef.current(entry)
      setSaved(true)
      setSavedTick((n) => n + 1) // re-triggers the little "saved" pulse
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [turns, mood])

  const finish = () => {
    const entry = buildEntry(turns, mood)
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

      {/* Quick mood log — one tap logs a mood, then this row collapses away.
          One entry = one mood, so we don't stack multiple moods per conversation. */}
      {!moodOpened && (
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
      )}

      {/* Composer */}
      <div className="px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        {listening && (
          <div className="mb-2 px-2 text-sm font-semibold text-accent-text">
            <span className="mr-2 inline-block h-2 w-2 animate-pulse rounded-full bg-flame align-middle" />
            listening… {interim && <span className="font-medium text-mute">{interim}</span>}
          </div>
        )}
        {speechError && (
          <div role="alert" className="mb-2 px-2 text-sm font-semibold text-flame">
            {speechError}
          </div>
        )}
        <div className="flex items-end gap-2">
          <button
            onClick={toggle}
            aria-label={
              !supported
                ? 'Voice input not supported in this browser'
                : listening
                  ? 'Stop voice input'
                  : 'Start voice input'
            }
            aria-pressed={supported ? listening : undefined}
            title={supported ? undefined : "Voice input isn't supported in this browser"}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-border transition active:scale-90"
            style={{
              background: listening ? 'var(--flame)' : 'var(--surface)',
              color: listening ? '#ffffff' : 'var(--content-soft)',
              boxShadow: '0 3px 0 0 rgba(0,0,0,0.10)',
              opacity: supported ? 1 : 0.5,
            }}
          >
            <Mic size={20} aria-hidden="true" />
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
            placeholder="Just start talking or typing…"
            className="max-h-40 flex-1 resize-none rounded-lg border border-border bg-surface px-4 py-3 text-[15px] font-medium leading-relaxed text-content shadow-sm outline-none placeholder:text-mute focus-within:ring-2 focus-within:ring-accent/60 focus:ring-2 focus:ring-accent/60"
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
