import { useRef, useState } from 'react'
import { Check, Download, Upload, X } from 'lucide-react'
import type { Entry } from '../types'
import type { LLMSettings, Provider } from '../lib/llm'
import { PROVIDER_PRESETS, llmFollowUp, saveSettings } from '../lib/llm'
import type { ThemeMode } from '../lib/theme'
import { resolveIsDark } from '../lib/theme'
import { PALETTES, applyPalette, loadPalette, savePalette } from '../lib/palette'
import {
  clearLock,
  exportBackup,
  importBackup,
  makeLock,
  saveLock,
  verifyPin,
  type LockConfig,
} from '../lib/storage'
import Button from './Button'

interface Props {
  initial: LLMSettings
  themeMode: ThemeMode
  onThemeChange: (m: ThemeMode) => void
  onClose: () => void
  onSaved: (s: LLMSettings) => void
  entries: Entry[]
  lock: LockConfig | null
  onLockChange: (l: LockConfig | null) => void
  onImported: (entries: Entry[]) => void
}

type LockMode = 'idle' | 'set' | 'change' | 'remove'

const isValidPin = (p: string) => /^\d{4,6}$/.test(p)

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

export default function Settings({
  initial,
  themeMode,
  onThemeChange,
  onClose,
  onSaved,
  lock,
  onLockChange,
  onImported,
}: Props) {
  const [s, setS] = useState<LLMSettings>(initial)
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)

  // Theme presets
  const [paletteId, setPaletteId] = useState<string>(() => loadPalette())

  const selectPalette = (id: string) => {
    savePalette(id)
    applyPalette(id, resolveIsDark(themeMode))
    setPaletteId(id)
  }

  // Backup
  const fileRef = useRef<HTMLInputElement>(null)
  const [backupMsg, setBackupMsg] = useState<{ ok: boolean; text: string } | null>(null)

  const doExport = async () => {
    try {
      const data = await exportBackup()
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      const d = new Date()
      a.href = url
      a.download = `mira-backup-${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}.json`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
      const n = data.entries.length
      setBackupMsg({ ok: true, text: `Exported ${n} ${n === 1 ? 'entry' : 'entries'}.` })
    } catch (err) {
      setBackupMsg({ ok: false, text: `Export failed: ${(err as Error).message}` })
    }
  }

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // allow re-picking the same file later
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      const res = await importBackup(parsed)
      onImported(res.entries)
      setBackupMsg({
        ok: true,
        text: `Imported — ${res.added} added, ${res.updated} updated (${res.total} total).`,
      })
    } catch (err) {
      setBackupMsg({ ok: false, text: `Import failed: ${(err as Error).message}` })
    }
  }

  // App lock
  const [lockMode, setLockMode] = useState<LockMode>('idle')
  const [pinA, setPinA] = useState('')
  const [pinB, setPinB] = useState('')
  const [curPin, setCurPin] = useState('')
  const [lockMsg, setLockMsg] = useState<string | null>(null)

  const resetLock = () => {
    setLockMode('idle')
    setPinA('')
    setPinB('')
    setCurPin('')
    setLockMsg(null)
  }

  const submitSetOrChange = async () => {
    if (lockMode === 'change') {
      if (!lock || !(await verifyPin(curPin, lock))) {
        setLockMsg('Current PIN is incorrect.')
        return
      }
    }
    if (!isValidPin(pinA)) {
      setLockMsg('PIN must be 4–6 digits.')
      return
    }
    if (pinA !== pinB) {
      setLockMsg('PINs don’t match.')
      return
    }
    const cfg = await makeLock(pinA)
    await saveLock(cfg)
    onLockChange(cfg)
    resetLock()
  }

  const submitRemove = async () => {
    if (!lock || !(await verifyPin(curPin, lock))) {
      setLockMsg('Current PIN is incorrect.')
      return
    }
    await clearLock()
    onLockChange(null)
    resetLock()
  }

  const setProvider = (provider: Provider) => {
    if (provider === 'local') {
      setS({ provider, apiKey: '', model: '', baseUrl: '' })
    } else {
      const p = PROVIDER_PRESETS[provider]
      setS((prev) => ({
        provider,
        apiKey: prev.provider === provider ? prev.apiKey : '',
        model: p.model,
        baseUrl: p.baseUrl,
      }))
    }
    setTestMsg(null)
  }

  const save = () => {
    saveSettings(s)
    onSaved(s)
    onClose()
  }

  const test = async () => {
    setTesting(true)
    setTestMsg(null)
    try {
      const q = await llmFollowUp(s, [{ role: 'you', text: 'I had a long but good day.' }])
      setTestMsg(`✓ Connected — Mira said: “${q.slice(0, 80)}”`)
    } catch (err) {
      setTestMsg(`✗ ${(err as Error).message}. Check the key/model, or use Offline.`)
    } finally {
      setTesting(false)
    }
  }

  const preset = s.provider !== 'local' ? PROVIDER_PRESETS[s.provider] : null

  return (
    <div className="absolute inset-0 z-20 flex flex-col bg-bg">
      <header className="flex items-center justify-between px-5 pt-[max(1rem,env(safe-area-inset-top))]">
        <h2 className="pt-3 font-display text-2xl font-semibold text-content">Settings</h2>
        <button
          onClick={onClose}
          className="grid h-9 w-9 place-items-center rounded-full bg-surface text-content shadow-sm transition active:scale-90"
          aria-label="Close settings"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>

      <div className="no-scrollbar flex-1 space-y-6 overflow-y-auto px-5 py-6">
        {/* Appearance */}
        <section>
          <h3 className="mb-2 font-display text-sm font-semibold text-content">Appearance</h3>
          <div className="flex gap-1.5 rounded-lg bg-surface-2 p-1.5">
            {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onThemeChange(m)}
                aria-pressed={themeMode === m}
                className={`flex-1 rounded-md py-2 text-sm font-semibold capitalize transition ${
                  themeMode === m ? 'bg-surface text-accent-text shadow-sm' : 'text-soft'
                }`}
              >
                {m === 'light' ? 'Light' : m === 'dark' ? 'Dark' : 'Auto'}
              </button>
            ))}
          </div>

          {/* Color themes (presets) */}
          <div className="mt-4">
            <span className="mb-2 block text-xs font-semibold text-mute">Color theme</span>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Color theme">
              {PALETTES.map((p) => {
                const active = paletteId === p.id
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    onClick={() => selectPalette(p.id)}
                    className={`relative flex flex-col items-center gap-1.5 rounded-2xl p-2.5 shadow-sm transition active:scale-95 ${
                      active ? 'bg-accent-soft ring-2 ring-accent' : 'bg-surface'
                    }`}
                  >
                    <span
                      className="grid h-8 w-8 place-items-center rounded-full ring-1 ring-black/10"
                      style={{ background: p.swatch }}
                    >
                      {active && <Check size={16} strokeWidth={3} color="#ffffff" aria-hidden="true" />}
                    </span>
                    <span className="text-[11px] font-semibold text-content">{p.name}</span>
                    {active && <span className="sr-only"> (selected)</span>}
                  </button>
                )
              })}
            </div>
          </div>
        </section>

        {/* Conversation engine */}
        <section>
          <h3 className="mb-1 font-display text-sm font-semibold text-content">Conversation engine</h3>
          <p className="mb-3 text-xs font-medium text-mute">
            Mira works offline for free. For richer conversations, connect a free LLM —
            your key stays on this device.
          </p>

          <div className="space-y-2">
            <Option
              active={s.provider === 'local'}
              onClick={() => setProvider('local')}
              title="Offline (no setup)"
              subtitle="Fast rule-based engine. Private. Zero config."
            />
            <Option
              active={s.provider === 'gemini'}
              onClick={() => setProvider('gemini')}
              title={PROVIDER_PRESETS.gemini.label}
              subtitle={PROVIDER_PRESETS.gemini.hint}
            />
            <Option
              active={s.provider === 'openai'}
              onClick={() => setProvider('openai')}
              title={PROVIDER_PRESETS.openai.label}
              subtitle={PROVIDER_PRESETS.openai.hint}
            />
          </div>
        </section>

        {preset && (
          <section className="space-y-3">
            <Field label="Model">
              <input
                value={s.model}
                onChange={(e) => setS({ ...s, model: e.target.value })}
                className="input"
                placeholder={preset.model}
              />
            </Field>

            {s.provider === 'openai' && (
              <Field label="Base URL">
                <input
                  value={s.baseUrl}
                  onChange={(e) => setS({ ...s, baseUrl: e.target.value })}
                  className="input"
                  placeholder={preset.baseUrl}
                />
              </Field>
            )}

            <Field label="API key">
              <input
                value={s.apiKey}
                onChange={(e) => setS({ ...s, apiKey: e.target.value })}
                type="password"
                className="input"
                placeholder="paste your free key"
              />
            </Field>

            <div className="flex items-center gap-3">
              <a
                href={preset.keyUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-accent-text underline"
              >
                Get a free key →
              </a>
              <Button variant="neutral" size="sm" onClick={test} disabled={testing}>
                {testing ? 'Testing…' : 'Test connection'}
              </Button>
            </div>

            {testMsg && (
              <p className={`text-xs font-semibold ${testMsg.startsWith('✓') ? 'text-mood-good' : 'text-flame'}`}>
                {testMsg}
              </p>
            )}

            <p className="pt-1 text-[11px] font-medium leading-relaxed text-mute">
              Prototype note: keys are stored in your browser and calls go straight to the provider.
              In production, proxy these through a backend so keys are never exposed.
            </p>
          </section>
        )}

        {/* App lock */}
        <section>
          <h3 className="mb-1 font-display text-sm font-semibold text-content">App lock</h3>
          <p className="mb-3 text-xs font-medium text-mute">
            Protect your journal with a PIN on launch. Stored hashed on this device — a privacy
            gate, not full encryption.
          </p>

          {lockMode === 'idle' ? (
            <div className="flex items-center justify-between rounded-2xl bg-surface p-3 shadow-sm">
              <span className="text-sm font-semibold text-content">
                {lock ? 'PIN lock is on' : 'PIN lock is off'}
              </span>
              {lock ? (
                <div className="flex gap-2">
                  <Button variant="neutral" size="sm" onClick={() => setLockMode('change')}>
                    Change
                  </Button>
                  <Button variant="neutral" size="sm" onClick={() => setLockMode('remove')}>
                    Remove
                  </Button>
                </div>
              ) : (
                <Button size="sm" onClick={() => setLockMode('set')}>
                  Set PIN
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3 rounded-2xl bg-surface p-3 shadow-sm">
              {(lockMode === 'change' || lockMode === 'remove') && (
                <PinField
                  label="Current PIN"
                  value={curPin}
                  onChange={setCurPin}
                  autoFocus
                />
              )}
              {lockMode !== 'remove' && (
                <>
                  <PinField
                    label={lockMode === 'change' ? 'New PIN (4–6 digits)' : 'PIN (4–6 digits)'}
                    value={pinA}
                    onChange={setPinA}
                    autoFocus={lockMode === 'set'}
                  />
                  <PinField label="Confirm PIN" value={pinB} onChange={setPinB} />
                </>
              )}

              {lockMsg && <p className="text-xs font-semibold text-flame">{lockMsg}</p>}

              <div className="flex gap-2 pt-1">
                {lockMode === 'remove' ? (
                  <Button variant="neutral" size="sm" className="flex-1" onClick={submitRemove}>
                    Remove lock
                  </Button>
                ) : (
                  <Button size="sm" className="flex-1" onClick={submitSetOrChange}>
                    {lockMode === 'change' ? 'Update PIN' : 'Turn on lock'}
                  </Button>
                )}
                <Button variant="ghost" size="sm" onClick={resetLock}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Backup */}
        <section>
          <h3 className="mb-1 font-display text-sm font-semibold text-content">Backup</h3>
          <p className="mb-3 text-xs font-medium text-mute">
            Export your journal to a file, or restore from one. Everything stays on your device.
          </p>
          <div className="flex gap-2">
            <Button variant="neutral" size="sm" className="flex-1" onClick={doExport}>
              <span className="inline-flex items-center justify-center gap-1.5">
                <Download size={15} aria-hidden="true" /> Export
              </span>
            </Button>
            <Button
              variant="neutral"
              size="sm"
              className="flex-1"
              onClick={() => fileRef.current?.click()}
            >
              <span className="inline-flex items-center justify-center gap-1.5">
                <Upload size={15} aria-hidden="true" /> Import
              </span>
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              tabIndex={-1}
              aria-hidden="true"
              onChange={onPickFile}
            />
          </div>
          {backupMsg && (
            <p
              className={`mt-2 text-xs font-semibold ${
                backupMsg.ok ? 'text-mood-good' : 'text-flame'
              }`}
            >
              {backupMsg.text}
            </p>
          )}
        </section>
      </div>

      <div className="border-t border-border px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <Button size="lg" onClick={save}>
          Save
        </Button>
      </div>

      <style>{`
        .input {
          width: 100%;
          border-radius: var(--radius-md);
          background: var(--surface-2);
          padding: 0.65rem 0.9rem;
          font-size: 14px;
          font-weight: 600;
          color: var(--content);
          outline: none;
        }
        .input:focus { box-shadow: 0 0 0 2px color-mix(in srgb, var(--accent) 50%, transparent); }
        .input::placeholder { color: color-mix(in srgb, var(--content-mute) 70%, transparent); font-weight: 500; }
      `}</style>
    </div>
  )
}

function Option({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean
  onClick: () => void
  title: string
  subtitle: string
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full rounded-2xl p-3 text-left shadow-sm transition active:scale-[0.99] ${
        active ? 'bg-accent-soft ring-2 ring-accent' : 'bg-surface'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`grid h-4 w-4 place-items-center rounded-full border-2 ${
            active ? 'border-accent' : 'border-mute/50'
          }`}
        >
          {active && <span className="h-2 w-2 rounded-full bg-accent" />}
        </span>
        <span className="text-sm font-semibold text-content">{title}</span>
      </div>
      <p className="mt-1 pl-6 text-xs font-medium text-mute">{subtitle}</p>
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-mute">{label}</span>
      {children}
    </label>
  )
}

function PinField({
  label,
  value,
  onChange,
  autoFocus,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  autoFocus?: boolean
}) {
  return (
    <Field label={label}>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/\D/g, '').slice(0, 6))}
        type="password"
        inputMode="numeric"
        autoComplete="off"
        autoFocus={autoFocus}
        className="input tracking-[0.4em]"
        placeholder="••••"
        aria-label={label}
      />
    </Field>
  )
}
