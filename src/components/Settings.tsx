import { useState } from 'react'
import { Check, X } from 'lucide-react'
import type { LLMSettings, Provider } from '../lib/llm'
import { PROVIDER_PRESETS, llmFollowUp, saveSettings } from '../lib/llm'
import { resolveIsDark, type ThemeMode } from '../lib/theme'
import { PALETTES, applyPalette, loadPalette, savePalette } from '../lib/palette'
import Button from './Button'

interface Props {
  initial: LLMSettings
  themeMode: ThemeMode
  onThemeChange: (m: ThemeMode) => void
  onClose: () => void
  onSaved: (s: LLMSettings) => void
}

export default function Settings({ initial, themeMode, onThemeChange, onClose, onSaved }: Props) {
  const [s, setS] = useState<LLMSettings>(initial)
  const [testing, setTesting] = useState(false)
  const [testMsg, setTestMsg] = useState<string | null>(null)
  const [palette, setPalette] = useState(() => loadPalette())

  const pickPalette = (id: string) => {
    setPalette(id)
    savePalette(id)
    applyPalette(id, resolveIsDark(themeMode))
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
        <h2 className="pt-3 font-display text-2xl font-bold text-content">Settings</h2>
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
          <h3 className="mb-2 font-display text-sm font-bold text-content">Appearance</h3>
          <div className="flex gap-1.5 rounded-lg bg-surface-2 p-1.5">
            {(['light', 'dark', 'system'] as ThemeMode[]).map((m) => (
              <button
                key={m}
                onClick={() => onThemeChange(m)}
                aria-pressed={themeMode === m}
                className={`flex-1 rounded-md py-2 text-sm font-bold capitalize transition ${
                  themeMode === m ? 'bg-surface text-accent-text shadow-sm' : 'text-soft'
                }`}
              >
                {m === 'light' ? 'Light' : m === 'dark' ? 'Dark' : 'Auto'}
              </button>
            ))}
          </div>

          <p className="mb-2 mt-4 text-xs font-bold text-soft">Color</p>
          <div className="grid grid-cols-6 gap-2">
            {PALETTES.map((p) => {
              const active = palette === p.id
              return (
                <button
                  key={p.id}
                  onClick={() => pickPalette(p.id)}
                  aria-label={`${p.name} color theme`}
                  aria-pressed={active}
                  title={p.name}
                  className="grid aspect-square place-items-center rounded-full transition active:scale-90"
                  style={{
                    background: p.swatch,
                    boxShadow: active
                      ? '0 0 0 3px var(--surface), 0 0 0 5px ' + p.swatch
                      : '0 2px 0 0 rgba(0,0,0,0.12)',
                  }}
                >
                  {active && <Check size={16} color="#ffffff" strokeWidth={3} aria-hidden="true" />}
                </button>
              )
            })}
          </div>
        </section>

        {/* Conversation engine */}
        <section>
          <h3 className="mb-1 font-display text-sm font-bold text-content">Conversation engine</h3>
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
                className="text-xs font-bold text-accent-text underline"
              >
                Get a free key →
              </a>
              <Button variant="neutral" size="sm" onClick={test} disabled={testing}>
                {testing ? 'Testing…' : 'Test connection'}
              </Button>
            </div>

            {testMsg && (
              <p className={`text-xs font-bold ${testMsg.startsWith('✓') ? 'text-mood-good' : 'text-flame'}`}>
                {testMsg}
              </p>
            )}

            <p className="pt-1 text-[11px] font-medium leading-relaxed text-mute">
              Prototype note: keys are stored in your browser and calls go straight to the provider.
              In production, proxy these through a backend so keys are never exposed.
            </p>
          </section>
        )}
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
        <span className="text-sm font-bold text-content">{title}</span>
      </div>
      <p className="mt-1 pl-6 text-xs font-medium text-mute">{subtitle}</p>
    </button>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-mute">{label}</span>
      {children}
    </label>
  )
}
