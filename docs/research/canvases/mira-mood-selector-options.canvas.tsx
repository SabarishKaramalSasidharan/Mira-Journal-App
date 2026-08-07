import {
  Callout,
  Card,
  CardBody,
  CardHeader,
  Code,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useHostTheme,
} from "cursor/canvas";
import { useState, type CSSProperties, type ReactNode } from "react";

/* ============================================================
   Mira — mood-selector design exploration (canvas only)
   EXPLORATION ONLY. No app source is modified. Brand tokens below
   are faithful reproductions of src/index.css so the mockups look
   like the real product. Every glyph is original SVG (no emoji,
   no Pixar art).
   ============================================================ */

// Faithful Mira LIGHT-theme brand tokens (src/index.css :root).
const MIRA = {
  bg: "#eef4f2",
  surface: "#ffffff",
  surface2: "#f2f7f5",
  content: "#10221f",
  contentSoft: "#3f524e",
  contentMute: "#556764",
  border: "#dbe6e2",
  accent: "#10c4a9",
  accentStrong: "#0ba593",
  accentSoft: "#dcf6f1",
  accentText: "#0a6d61",
  onAccent: "#ffffff",
  gold: "#ffc53d",
  face: "#0b3b36", // mascot ink
  // weather / valence gradient (rough → great)
  moodRough: "#6c7bf0",
  moodLow: "#63a4f4",
  moodOkay: "#10c4a9",
  moodGood: "#4ecb71",
  moodGreat: "#ffc53d",
};

const MOOD_COLORS = [MIRA.moodRough, MIRA.moodLow, MIRA.moodOkay, MIRA.moodGood, MIRA.moodGreat];
const SCALE_LABELS = ["Rough", "Low", "Okay", "Good", "Great"];

/* ---------------- SVG glyph primitives (all original) ---------------- */

// Weather metaphor — the CURRENT shipped selector, drawn as SVG instead of
// emoji so it renders crisply and sits in the same visual language as the
// other concepts. rough(0) → great(4).
function WeatherGlyph({ level, size = 40 }: { level: number; size?: number }) {
  const s = size;
  const cloud = (fill: string, cy = 60) => (
    <path
      d={`M30 ${cy} a15 15 0 0 1 3 -29 a20 20 0 0 1 38 5 a13 13 0 0 1 -4 24 Z`}
      fill={fill}
    />
  );
  return (
    <svg width={s} height={s} viewBox="0 0 100 100" aria-hidden>
      {level === 0 && (
        <>
          {cloud("#8d97b8")}
          {[38, 52, 66].map((x) => (
            <line key={x} x1={x} y1={70} x2={x - 6} y2={84} stroke={MIRA.moodRough} strokeWidth={4} strokeLinecap="round" />
          ))}
        </>
      )}
      {level === 1 && cloud("#9db6d8")}
      {level === 2 && (
        <>
          <circle cx={64} cy={40} r={16} fill={MIRA.moodOkay} />
          {cloud("#c3d3cf", 64)}
        </>
      )}
      {level === 3 && (
        <>
          <circle cx={40} cy={42} r={17} fill={MIRA.moodGood} />
          {[[40, 15], [63, 24], [21, 30], [67, 47]].map(([x, y], i) => (
            <line key={i} x1={x} y1={y} x2={40 + (x - 40) * 1.35} y2={42 + (y - 42) * 1.35} stroke={MIRA.moodGood} strokeWidth={3.5} strokeLinecap="round" />
          ))}
          <path d="M52 70 a13 13 0 0 1 3 -25 a17 17 0 0 1 26 4 Z" fill="#d6e6cf" opacity={0.95} />
        </>
      )}
      {level === 4 && (
        <>
          <circle cx={50} cy={50} r={20} fill={MIRA.moodGreat} />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i / 8) * Math.PI * 2;
            return (
              <line
                key={i}
                x1={50 + Math.cos(a) * 26}
                y1={50 + Math.sin(a) * 26}
                x2={50 + Math.cos(a) * 36}
                y2={50 + Math.sin(a) * 36}
                stroke={MIRA.moodGreat}
                strokeWidth={4}
                strokeLinecap="round"
              />
            );
          })}
        </>
      )}
    </svg>
  );
}

// Mira mascot — reflection droplet, reused SVG body with a 5-step expression
// ladder (frown → big grin). Solid teal fill (flat, no gradient).
function MascotDrop({ level, size = 44 }: { level: number; size?: number }) {
  const ink = MIRA.face;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <path d="M50 8 C74 30 86 46 86 62 A36 36 0 1 1 14 62 C14 46 26 30 50 8 Z" fill={MIRA.accent} />
      <ellipse cx={32} cy={66} rx={6} ry={4} fill="#ffffff" opacity={0.25} />
      <ellipse cx={68} cy={66} rx={6} ry={4} fill="#ffffff" opacity={0.25} />
      {/* eyes */}
      {level <= 1 ? (
        <>
          <path d="M34 57 q6 -4 12 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
          <path d="M54 57 q6 -4 12 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : level === 2 ? (
        <>
          <path d="M34 56 q6 6 12 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
          <path d="M54 56 q6 6 12 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : level === 3 ? (
        <>
          <circle cx={39} cy={56} r={6} fill={ink} />
          <circle cx={61} cy={56} r={6} fill={ink} />
          <circle cx={41} cy={54} r={2} fill="#fff" />
          <circle cx={63} cy={54} r={2} fill="#fff" />
        </>
      ) : (
        <>
          <path d="M33 55 q7 8 14 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
          <path d="M53 55 q7 8 14 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
        </>
      )}
      {/* mouth */}
      {level === 0 ? (
        <path d="M43 74 q7 -4 14 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      ) : level === 1 ? (
        <path d="M43 73 q7 -1 14 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      ) : level === 2 ? (
        <path d="M43 71 q7 4 14 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      ) : level === 3 ? (
        <path d="M42 70 q8 8 16 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      ) : (
        <path d="M39 69 Q50 84 61 69 Z" fill={ink} stroke={ink} strokeWidth={2} strokeLinejoin="round" />
      )}
      <path d="M40 22 q-10 8 -10 20" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
    </svg>
  );
}

// Classic round mood face, valence-tinted rough → great.
function ClassicFace({ level, size = 40 }: { level: number; size?: number }) {
  const fill = MOOD_COLORS[level];
  const ink = "#22302c";
  // mouth control-point offset: negative = frown, positive = smile
  const m = [-8, -3, 0, 6, 12][level];
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <circle cx={50} cy={50} r={40} fill={fill} />
      <circle cx={38} cy={44} r={5} fill={ink} />
      <circle cx={62} cy={44} r={5} fill={ink} />
      {level === 2 ? (
        <line x1={38} y1={66} x2={62} y2={66} stroke={ink} strokeWidth={5} strokeLinecap="round" />
      ) : (
        <path d={`M36 ${64 - (m < 0 ? m : 0)} q14 ${m * 1.6} 28 0`} fill="none" stroke={ink} strokeWidth={5} strokeLinecap="round" />
      )}
    </svg>
  );
}

// Inside Out–INSPIRED emotion face (ORIGINAL art, not Pixar IP). A colored
// rounded blob with a simple expressive face per named emotion.
type Emotion = { key: string; label: string; color: string; ink: string };
const EMOTIONS: Emotion[] = [
  { key: "joy", label: "Joy", color: "#ffc53d", ink: "#7a5600" },
  { key: "sad", label: "Sad", color: "#63a4f4", ink: "#123a63" },
  { key: "angry", label: "Angry", color: "#e5484d", ink: "#5a0f12" },
  { key: "anxious", label: "Anxious", color: "#8b7cf0", ink: "#2e2470" },
  { key: "calm", label: "Calm", color: "#10c4a9", ink: "#0a4f46" },
];
function EmotionFace({ e, size = 46 }: { e: Emotion; size?: number }) {
  const { color, ink, key } = e;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <path d="M50 6 C80 6 92 28 92 54 C92 82 74 94 50 94 C26 94 8 82 8 54 C8 28 20 6 50 6 Z" fill={color} />
      {/* eyebrows convey emotion */}
      {key === "angry" && (
        <>
          <line x1={30} y1={38} x2={44} y2={44} stroke={ink} strokeWidth={4} strokeLinecap="round" />
          <line x1={70} y1={38} x2={56} y2={44} stroke={ink} strokeWidth={4} strokeLinecap="round" />
        </>
      )}
      {key === "anxious" && (
        <>
          <line x1={30} y1={42} x2={44} y2={38} stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
          <line x1={70} y1={42} x2={56} y2={38} stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
        </>
      )}
      {/* eyes */}
      {key === "joy" ? (
        <>
          <path d="M30 50 q7 -8 14 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
          <path d="M56 50 q7 -8 14 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : (
        <>
          <circle cx={37} cy={52} r={5} fill={ink} />
          <circle cx={63} cy={52} r={5} fill={ink} />
        </>
      )}
      {/* mouth */}
      {key === "joy" && <path d="M34 66 q16 16 32 0 Z" fill={ink} />}
      {key === "sad" && <path d="M36 74 q14 -12 28 0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />}
      {key === "angry" && <path d="M36 72 q14 -8 28 0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />}
      {key === "anxious" && <path d="M38 72 q6 -5 12 0 q6 5 12 0" fill="none" stroke={ink} strokeWidth={3.5} strokeLinecap="round" />}
      {key === "calm" && <path d="M38 70 q12 6 24 0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />}
      {key === "sad" && <circle cx={30} cy={64} r={4} fill="#bfe0ff" />}
    </svg>
  );
}

// Abstract mood orb — flat solid disc (mood-as-color, no face).
function Orb({ color, size = 44 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <circle cx={50} cy={50} r={42} fill={color} />
      <circle cx={38} cy={36} r={12} fill="#ffffff" opacity={0.18} />
    </svg>
  );
}

/* ---------------- Expanded emotion set (Options 8 & 9) ---------------- */

// Two-tier grouped model (How We Feel / Apple State of Mind / Plutchik).
// Six core families → optional specific children. Colors are chosen to
// resolve the movie palette's collisions with Mira's brand (see color note):
// Calm stays brand-teal; Envy is green (not the film's teal); Ennui is indigo
// (distinct from Sad's blue). Every emotion always ships with a LABEL, so
// nothing is encoded by color alone (color-blind safe).
type WheelChild = { label: string; color: string };
type WheelFamily = { key: string; label: string; color: string; ink: string; children: WheelChild[] };
const FAMILIES: WheelFamily[] = [
  {
    key: "joy", label: "Joy", color: "#e6a417", ink: "#5a3e00",
    children: [
      { label: "Hope", color: "#4fb286" },
      { label: "Gratitude", color: "#d9962a" },
      { label: "Excitement", color: "#f2a51c" },
    ],
  },
  {
    key: "love", label: "Love", color: "#e05780", ink: "#5e132f",
    children: [
      { label: "Affection", color: "#e678a0" },
      { label: "Nostalgia", color: "#c76a86" },
    ],
  },
  {
    key: "calm", label: "Calm", color: "#10c4a9", ink: "#083f39",
    children: [
      { label: "Content", color: "#2bc0a6" },
      { label: "Relieved", color: "#57d3bf" },
    ],
  },
  {
    key: "sad", label: "Sad", color: "#4f8cf0", ink: "#122f5c",
    children: [
      { label: "Low", color: "#6f9ff2" },
      { label: "Lonely", color: "#5b7fd6" },
      { label: "Guilt", color: "#8a5a8f" },
      { label: "Empty", color: "#8092b0" },
      { label: "Ennui / Bored", color: "#6366f1" },
    ],
  },
  {
    key: "anger", label: "Anger", color: "#e5484d", ink: "#5a0f12",
    children: [
      { label: "Frustration", color: "#ea6a52" },
      { label: "Envy", color: "#5aa02c" },
    ],
  },
  {
    key: "fear", label: "Fear", color: "#8b7cf0", ink: "#2c2170",
    children: [
      { label: "Anxiety", color: "#ef8a3c" },
      { label: "Embarrassment", color: "#f06fb0" },
    ],
  },
];

// The specific named emotions the user asked about, with resolved colors.
const EMO_SYSTEM: { label: string; color: string; note: string }[] = [
  { label: "Calm", color: "#10c4a9", note: "Brand teal — kept as the steady anchor" },
  { label: "Envy", color: "#5aa02c", note: "Green/lime — moved off the film's teal" },
  { label: "Anxiety", color: "#ef8a3c", note: "Orange — high-arousal fear" },
  { label: "Embarrassment", color: "#f06fb0", note: "Pink" },
  { label: "Ennui / Bored", color: "#6366f1", note: "Indigo — distinct from Sad's blue" },
  { label: "Sad", color: "#4f8cf0", note: "Blue" },
  { label: "Love", color: "#e05780", note: "Rose — warmer than Anger's red" },
  { label: "Hope", color: "#4fb286", note: "Soft green — a lift within Joy" },
  { label: "Guilt", color: "#8a5a8f", note: "Muted plum" },
  { label: "Anger", color: "#e5484d", note: "Red" },
  { label: "Fear", color: "#8b7cf0", note: "Purple" },
  { label: "Joy", color: "#e6a417", note: "Gold — warm optimism" },
];

// Core-family glyph — original rounded blob wearing a family expression.
function CoreGlyph({ fkey, color, ink, size = 40 }: { fkey: string; color: string; ink: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <path d="M50 6 C80 6 92 28 92 54 C92 82 74 94 50 94 C26 94 8 82 8 54 C8 28 20 6 50 6 Z" fill={color} />
      {fkey === "anger" && (
        <>
          <line x1={30} y1={38} x2={44} y2={44} stroke={ink} strokeWidth={4} strokeLinecap="round" />
          <line x1={70} y1={38} x2={56} y2={44} stroke={ink} strokeWidth={4} strokeLinecap="round" />
        </>
      )}
      {fkey === "fear" && (
        <>
          <line x1={30} y1={40} x2={44} y2={36} stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
          <line x1={70} y1={40} x2={56} y2={36} stroke={ink} strokeWidth={3.5} strokeLinecap="round" />
        </>
      )}
      {fkey === "joy" ? (
        <>
          <path d="M30 50 q7 -8 14 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
          <path d="M56 50 q7 -8 14 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : fkey === "calm" ? (
        <>
          <path d="M31 52 q6 6 13 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
          <path d="M56 52 q6 6 13 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
        </>
      ) : fkey === "fear" ? (
        <>
          <circle cx={37} cy={54} r={6} fill="none" stroke={ink} strokeWidth={3.5} />
          <circle cx={63} cy={54} r={6} fill="none" stroke={ink} strokeWidth={3.5} />
          <circle cx={37} cy={54} r={2.5} fill={ink} />
          <circle cx={63} cy={54} r={2.5} fill={ink} />
        </>
      ) : (
        <>
          <circle cx={37} cy={52} r={5} fill={ink} />
          <circle cx={63} cy={52} r={5} fill={ink} />
        </>
      )}
      {fkey === "love" && (
        <>
          <circle cx={28} cy={66} r={6} fill="#ffffff" opacity={0.3} />
          <circle cx={72} cy={66} r={6} fill="#ffffff" opacity={0.3} />
        </>
      )}
      {fkey === "joy" && <path d="M34 66 q16 16 32 0 Z" fill={ink} />}
      {fkey === "love" && <path d="M38 68 q12 8 24 0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />}
      {fkey === "calm" && <path d="M39 70 q11 5 22 0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />}
      {fkey === "sad" && <path d="M37 76 q13 -12 26 0" fill="none" stroke={ink} strokeWidth={4.5} strokeLinecap="round" />}
      {fkey === "anger" && <line x1={38} y1={72} x2={62} y2={72} stroke={ink} strokeWidth={4.5} strokeLinecap="round" />}
      {fkey === "fear" && <ellipse cx={50} cy={74} rx={7} ry={9} fill={ink} />}
      {fkey === "sad" && <circle cx={31} cy={66} r={3.5} fill="#dcefff" />}
    </svg>
  );
}

// Legend proving the resolved colors are distinguishable (each pairs a
// swatch with a text label — never color alone).
function ColorLegend() {
  const t = useHostTheme();
  return (
    <Grid columns={3} gap={10}>
      {EMO_SYSTEM.map((e) => (
        <div key={e.label}>
          <Row gap={8} align="center">
            <span style={{ width: 20, height: 20, borderRadius: 6, background: e.color, border: `1px solid ${t.stroke.secondary}`, flex: "0 0 auto" }} />
            <Stack gap={0}>
              <Text as="span" size="small" weight="semibold">{e.label}</Text>
              <Text as="span" size="small" tone="tertiary">{e.note}</Text>
            </Stack>
          </Row>
        </div>
      ))}
    </Grid>
  );
}

// Option 8 — interactive grouped two-tier picker.
function GroupedWheelMockup() {
  const [fam, setFam] = useState("sad");
  const [child, setChild] = useState<string | null>("Low");
  const active = FAMILIES.find((f) => f.key === fam) ?? FAMILIES[0];
  return (
    <MiraPanel prompt="How are you feeling?">
      <Stack gap={12}>
        <span style={{ fontFamily: "'Nunito', ui-sans-serif, system-ui, sans-serif", fontSize: 12, fontWeight: 700, color: MIRA.contentMute }}>
          Tap a feeling — one tap is enough
        </span>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {FAMILIES.map((f) => {
            const selected = fam === f.key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => { setFam(f.key); setChild(null); }}
                aria-label={f.label}
                aria-pressed={selected}
                style={{
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  gap: 5, padding: "10px 6px", borderRadius: 16, cursor: "pointer",
                  background: selected ? MIRA.accentSoft : MIRA.surface2,
                  border: `2px solid ${selected ? MIRA.accent : "transparent"}`,
                  transition: "all 0.12s ease",
                }}
              >
                <CoreGlyph fkey={f.key} color={f.color} ink={f.ink} size={34} />
                <span style={{ fontFamily: "'Nunito', ui-sans-serif, system-ui, sans-serif", fontSize: 12, fontWeight: 700, color: selected ? MIRA.accentText : MIRA.contentMute }}>
                  {f.label}
                </span>
              </button>
            );
          })}
        </div>
        <div style={{ background: MIRA.surface2, borderRadius: 14, padding: "10px 12px" }}>
          <div style={{ fontFamily: "'Nunito', ui-sans-serif, system-ui, sans-serif", fontSize: 11, fontWeight: 700, color: MIRA.contentMute, marginBottom: 8 }}>
            {active.label} — be more specific? (optional)
          </div>
          <Row gap={6} wrap>
            {active.children.map((c) => {
              const sel = child === c.label;
              return (
                <button
                  key={c.label}
                  type="button"
                  onClick={() => setChild(sel ? null : c.label)}
                  aria-label={c.label}
                  aria-pressed={sel}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 10px", borderRadius: 999, cursor: "pointer",
                    background: sel ? MIRA.accentSoft : MIRA.surface,
                    border: `2px solid ${sel ? MIRA.accent : MIRA.border}`,
                    transition: "all 0.12s ease",
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: c.color, flex: "0 0 auto" }} />
                  <span style={{ fontFamily: "'Nunito', ui-sans-serif, system-ui, sans-serif", fontSize: 12, fontWeight: 700, color: sel ? MIRA.accentText : MIRA.content }}>
                    {c.label}
                  </span>
                </button>
              );
            })}
          </Row>
        </div>
        <div style={{ fontFamily: "'Fredoka', ui-sans-serif, system-ui, sans-serif", fontSize: 13, fontWeight: 500, color: MIRA.accentText }}>
          Logged: {active.label}{child ? ` · ${child}` : ""}
        </div>
      </Stack>
    </MiraPanel>
  );
}

// Option 9 — Hybrid: ordered 1–5 opener + optional categorical emotion tag.
const HYBRID_TAGS: { label: string; color: string }[] = [
  { label: "Content", color: "#2bc0a6" },
  { label: "Hopeful", color: "#4fb286" },
  { label: "Grateful", color: "#d9962a" },
  { label: "Anxious", color: "#ef8a3c" },
  { label: "Lonely", color: "#5b7fd6" },
  { label: "Frustrated", color: "#ea6a52" },
];

function HybridMockup() {
  const [level, setLevel] = useState(3);
  const [tag, setTag] = useState<string | null>("Content");
  const stepLabel: CSSProperties = {
    fontFamily: "'Nunito', ui-sans-serif, system-ui, sans-serif",
    fontSize: 11,
    fontWeight: 700,
    color: MIRA.contentMute,
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
  };
  return (
    <MiraPanel prompt="How are you feeling? Tap to begin.">
      <Stack gap={12}>
        <div>
          <div style={stepLabel}>1 · Rate your day</div>
          <Row gap={6} justify="space-between">
            {SCALE_LABELS.map((label, i) => (
              <MiraChip key={i} column selected={level === i} onClick={() => setLevel(i)} ariaLabel={label}>
                <MascotDrop level={i} size={34} />
              </MiraChip>
            ))}
          </Row>
        </div>
        <div style={{ height: 1, background: MIRA.border }} />
        <div>
          <div style={stepLabel}>2 · Add a feeling (optional)</div>
          <Row gap={6} wrap>
            {HYBRID_TAGS.map((tg) => {
              const sel = tag === tg.label;
              return (
                <button
                  key={tg.label}
                  type="button"
                  onClick={() => setTag(sel ? null : tg.label)}
                  aria-label={tg.label}
                  aria-pressed={sel}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "6px 10px", borderRadius: 999, cursor: "pointer",
                    background: sel ? MIRA.accentSoft : MIRA.surface2,
                    border: `2px solid ${sel ? MIRA.accent : MIRA.border}`,
                    transition: "all 0.12s ease",
                  }}
                >
                  <span style={{ width: 10, height: 10, borderRadius: 5, background: tg.color, flex: "0 0 auto" }} />
                  <span style={{ fontFamily: "'Nunito', ui-sans-serif, system-ui, sans-serif", fontSize: 12, fontWeight: 700, color: sel ? MIRA.accentText : MIRA.content }}>
                    {tg.label}
                  </span>
                </button>
              );
            })}
          </Row>
        </div>
        <div style={{ background: MIRA.accentSoft, borderRadius: 12, padding: "10px 12px" }}>
          <div style={{ fontFamily: "'Fredoka', ui-sans-serif, system-ui, sans-serif", fontSize: 13, color: MIRA.content }}>
            <span style={{ fontWeight: 500 }}>Logged: </span>
            <span style={{ fontWeight: 700, color: MIRA.accentText }}>{SCALE_LABELS[level]}</span>
            {tag && <span style={{ fontWeight: 500 }}> · feels </span>}
            {tag && <span style={{ fontWeight: 700, color: MIRA.accentText }}>{tag}</span>}
          </div>
          <div style={{ fontFamily: "'Nunito', ui-sans-serif, system-ui, sans-serif", fontSize: 11, color: MIRA.contentMute, marginTop: 4 }}>
            Score → mood-trend chart · tag → “what you felt” breakdown
          </div>
        </div>
      </Stack>
    </MiraPanel>
  );
}

/* ---------------- Layout helpers ---------------- */

// A faithful little "Mira app card" the mockups sit inside — fixed light
// surface so it reads as the real product, not the canvas chrome.
function MiraPanel({ prompt, children }: { prompt: string; children: ReactNode }) {
  return (
    <div
      style={{
        background: MIRA.bg,
        border: `1px solid ${MIRA.border}`,
        borderRadius: 24,
        padding: 20,
      }}
    >
      <div style={{ background: MIRA.surface, borderRadius: 20, padding: 18, border: `1px solid ${MIRA.border}` }}>
        <div
          style={{
            fontFamily: "'Fredoka', ui-sans-serif, system-ui, sans-serif",
            fontSize: 16,
            fontWeight: 500,
            color: MIRA.content,
            marginBottom: 16,
            letterSpacing: "-0.01em",
          }}
        >
          {prompt}
        </div>
        {children}
      </div>
    </div>
  );
}

// A tappable option chip inside a Mira mockup (brand styling, selected state).
function MiraChip({
  selected,
  onClick,
  ariaLabel,
  children,
  column,
}: {
  key?: string | number;
  selected: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
  column?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={selected}
      style={{
        display: "flex",
        flexDirection: column ? "column" : "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: column ? "10px 8px" : "8px 12px",
        borderRadius: 16,
        cursor: "pointer",
        background: selected ? MIRA.accentSoft : MIRA.surface2,
        border: `2px solid ${selected ? MIRA.accent : "transparent"}`,
        transition: "background 0.12s ease, border-color 0.12s ease",
        flex: column ? "1 1 0" : "0 0 auto",
        minWidth: 0,
      }}
    >
      {children}
      <span
        style={{
          fontFamily: "'Nunito', ui-sans-serif, system-ui, sans-serif",
          fontSize: 12,
          fontWeight: 700,
          color: selected ? MIRA.accentText : MIRA.contentMute,
        }}
      >
        {ariaLabel}
      </span>
    </button>
  );
}

// Pros / cons two-column block.
function ProsCons({ pros, cons }: { pros: string[]; cons: string[] }) {
  const t = useHostTheme();
  const list = (items: string[], color: string, sign: string) => (
    <Stack gap={5}>
      {items.map((it, i) => (
        <div key={i}>
          <Row gap={8} align="start">
            <span style={{ color, fontWeight: 700, fontSize: 13, lineHeight: "18px", flex: "0 0 auto" }}>{sign}</span>
            <Text size="small" tone="secondary">{it}</Text>
          </Row>
        </div>
      ))}
    </Stack>
  );
  return (
    <Grid columns={2} gap={16}>
      <Stack gap={6}>
        <Text size="small" weight="semibold" style={{ color: t.category.green }}>Pros</Text>
        {list(pros, t.category.green, "+")}
      </Stack>
      <Stack gap={6}>
        <Text size="small" weight="semibold" style={{ color: t.category.red }}>Cons</Text>
        {list(cons, t.category.red, "–")}
      </Stack>
    </Grid>
  );
}

// SCALE vs CATEGORICAL (vs HYBRID) tag — the headline decision axis.
function KindTag({ kind }: { kind: "scale" | "categorical" | "hybrid" }) {
  const t = useHostTheme();
  const color = kind === "scale" ? t.category.green : kind === "hybrid" ? t.accent.primary : t.category.orange;
  const label =
    kind === "scale" ? "Ordered scale (1–5)" : kind === "hybrid" ? "Scale + emotion tag" : "Categorical (unordered)";
  return (
    <Row gap={6} align="center">
      <span style={{ width: 8, height: 8, borderRadius: 4, background: color, flex: "0 0 auto" }} />
      <Text as="span" size="small" weight="semibold" style={{ color }}>{label}</Text>
    </Row>
  );
}

// A labeled consideration line.
function Consideration({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Row gap={8} align="start">
      <Text as="span" size="small" weight="semibold" style={{ width: 96, flex: "0 0 auto" }}>{label}</Text>
      <Text as="span" size="small" tone="secondary">{children}</Text>
    </Row>
  );
}

type Effort = "Low" | "Medium" | "High";

// One option = mockup (left) + analysis (right).
function OptionBlock({
  n,
  title,
  tagline,
  badge,
  kind,
  mockup,
  pros,
  cons,
  scaleNote,
  a11y,
  brand,
  effort,
}: {
  n: number;
  title: string;
  tagline: string;
  badge?: { text: string; tone: "keep" | "note" };
  kind: "scale" | "categorical" | "hybrid";
  mockup: ReactNode;
  pros: string[];
  cons: string[];
  scaleNote: string;
  a11y: string;
  brand: string;
  effort: Effort;
}) {
  const t = useHostTheme();
  const effortColor = effort === "Low" ? t.category.green : effort === "Medium" ? t.category.yellow : t.category.red;
  return (
    <Stack gap={12}>
      <Row gap={10} align="center" wrap>
        <span
          style={{
            width: 24,
            height: 24,
            borderRadius: 12,
            background: t.fill.tertiary,
            color: t.text.secondary,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            flex: "0 0 auto",
          }}
        >
          {n}
        </span>
        <H3>{title}</H3>
        {badge && (
          <span
            style={{
              fontSize: 11,
              fontWeight: 700,
              padding: "2px 8px",
              borderRadius: 999,
              color: badge.tone === "keep" ? t.text.onAccent : t.text.secondary,
              background: badge.tone === "keep" ? t.accent.primary : t.fill.secondary,
              border: badge.tone === "keep" ? "none" : `1px solid ${t.stroke.secondary}`,
            }}
          >
            {badge.text}
          </span>
        )}
      </Row>
      <Text tone="tertiary" size="small">{tagline}</Text>
      <Grid columns="minmax(0, 380px) 1fr" gap={20} align="start">
        {mockup}
        <Stack gap={14}>
          <ProsCons pros={pros} cons={cons} />
          <Divider />
          <Stack gap={7}>
            <Row gap={8} align="center">
              <Text as="span" size="small" weight="semibold" style={{ width: 96, flex: "0 0 auto" }}>Chart fit</Text>
              <KindTag kind={kind} />
            </Row>
            <Consideration label="">{scaleNote}</Consideration>
            <Consideration label="Accessibility">{a11y}</Consideration>
            <Consideration label="Brand fit">{brand}</Consideration>
            <Row gap={8} align="center">
              <Text as="span" size="small" weight="semibold" style={{ width: 96, flex: "0 0 auto" }}>Effort</Text>
              <Row gap={6} align="center">
                <span style={{ width: 8, height: 8, borderRadius: 4, background: effortColor }} />
                <Text as="span" size="small" tone="secondary">{effort}</Text>
              </Row>
            </Row>
          </Stack>
        </Stack>
      </Grid>
    </Stack>
  );
}

/* ---------------- Interactive mockups ---------------- */

function WeatherMockup() {
  const [sel, setSel] = useState(3);
  return (
    <MiraPanel prompt="How are you feeling? Tap to begin.">
      <Row gap={8} justify="space-between">
        {SCALE_LABELS.map((label, i) => (
          <MiraChip key={i} column selected={sel === i} onClick={() => setSel(i)} ariaLabel={label}>
            <WeatherGlyph level={i} size={38} />
          </MiraChip>
        ))}
      </Row>
    </MiraPanel>
  );
}

function EmotionMockup() {
  const [sel, setSel] = useState("calm");
  return (
    <MiraPanel prompt="Which feeling is loudest right now?">
      <Row gap={8} justify="space-between">
        {EMOTIONS.map((e) => (
          <MiraChip key={e.key} column selected={sel === e.key} onClick={() => setSel(e.key)} ariaLabel={e.label}>
            <EmotionFace e={e} size={42} />
          </MiraChip>
        ))}
      </Row>
    </MiraPanel>
  );
}

function MascotMockup() {
  const [sel, setSel] = useState(3);
  return (
    <MiraPanel prompt="How are you feeling? Tap to begin.">
      <Row gap={8} justify="space-between">
        {SCALE_LABELS.map((label, i) => (
          <MiraChip key={i} column selected={sel === i} onClick={() => setSel(i)} ariaLabel={label}>
            <MascotDrop level={i} size={42} />
          </MiraChip>
        ))}
      </Row>
    </MiraPanel>
  );
}

function ClassicMockup() {
  const [sel, setSel] = useState(3);
  return (
    <MiraPanel prompt="How are you feeling? Tap to begin.">
      <Row gap={8} justify="space-between">
        {SCALE_LABELS.map((label, i) => (
          <MiraChip key={i} column selected={sel === i} onClick={() => setSel(i)} ariaLabel={label}>
            <ClassicFace level={i} size={40} />
          </MiraChip>
        ))}
      </Row>
    </MiraPanel>
  );
}

function OrbMockup() {
  const [sel, setSel] = useState(3);
  return (
    <MiraPanel prompt="How are you feeling? Tap to begin.">
      <Row gap={8} justify="space-between">
        {SCALE_LABELS.map((label, i) => (
          <MiraChip key={i} column selected={sel === i} onClick={() => setSel(i)} ariaLabel={label}>
            <Orb color={MOOD_COLORS[i]} size={42} />
          </MiraChip>
        ))}
      </Row>
    </MiraPanel>
  );
}

function WordMockup() {
  const [sel, setSel] = useState(3);
  return (
    <MiraPanel prompt="How are you feeling? Tap to begin.">
      <Row gap={8} wrap>
        {SCALE_LABELS.map((label, i) => {
          const selected = sel === i;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSel(i)}
              aria-pressed={selected}
              style={{
                padding: "10px 18px",
                borderRadius: 999,
                cursor: "pointer",
                fontFamily: "'Fredoka', ui-sans-serif, system-ui, sans-serif",
                fontSize: 15,
                fontWeight: 500,
                color: selected ? MIRA.onAccent : MIRA.content,
                background: selected ? MIRA.accent : MIRA.surface2,
                border: `2px solid ${selected ? MIRA.accent : MIRA.border}`,
                transition: "all 0.12s ease",
              }}
            >
              {label}
            </button>
          );
        })}
      </Row>
    </MiraPanel>
  );
}

// Slider concept + a note on the 2-axis alternative.
function SliderMockup() {
  const [sel, setSel] = useState(3);
  const pct = (sel / 4) * 100;
  return (
    <MiraPanel prompt="Slide to where today lands.">
      <Stack gap={14}>
        <div style={{ position: "relative", height: 44 }}>
          <div
            style={{
              position: "absolute",
              top: 19,
              left: 0,
              right: 0,
              height: 6,
              borderRadius: 999,
              background: MIRA.surface2,
              border: `1px solid ${MIRA.border}`,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: 19,
              left: 0,
              width: `${pct}%`,
              height: 6,
              borderRadius: 999,
              background: MOOD_COLORS[sel],
            }}
          />
          {SCALE_LABELS.map((label, i) => {
            const left = (i / 4) * 100;
            const selected = sel === i;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setSel(i)}
                aria-label={label}
                aria-pressed={selected}
                style={{
                  position: "absolute",
                  top: selected ? 8 : 14,
                  left: `calc(${left}% - ${selected ? 14 : 8}px)`,
                  width: selected ? 28 : 16,
                  height: selected ? 28 : 16,
                  borderRadius: 999,
                  cursor: "pointer",
                  padding: 0,
                  background: selected ? MOOD_COLORS[i] : MIRA.surface,
                  border: `2px solid ${selected ? MOOD_COLORS[i] : MIRA.border}`,
                  transition: "all 0.12s ease",
                }}
              />
            );
          })}
        </div>
        <Row justify="space-between">
          <span style={{ fontSize: 12, fontWeight: 700, color: MIRA.contentMute }}>Rough</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: MIRA.accentText }}>{SCALE_LABELS[sel]}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: MIRA.contentMute }}>Great</span>
        </Row>
      </Stack>
    </MiraPanel>
  );
}

/* ---------------- Comparison table + recommendation ---------------- */

type Row6 = {
  option: string;
  kind: "scale" | "categorical" | "hybrid";
  speed: string;
  a11y: string;
  brand: string;
  rework: string;
  express: string;
  pick: "primary" | "secondary" | "no";
};
const MATRIX: Row6[] = [
  { option: "Weather scale (current)", kind: "scale", speed: "1 tap", a11y: "Labeled + shape", brand: "Owned", rework: "None", express: "Low", pick: "secondary" },
  { option: "Emotion faces (IO-inspired)", kind: "categorical", speed: "1 tap", a11y: "Labeled", brand: "Derivative", rework: "New view", express: "Medium", pick: "no" },
  { option: "Mira mascot expressions", kind: "scale", speed: "1 tap", a11y: "Labeled + shape", brand: "Most on-brand", rework: "None", express: "Low", pick: "secondary" },
  { option: "Classic 5-face scale", kind: "scale", speed: "1 tap", a11y: "Add labels", brand: "Generic", rework: "None", express: "Low", pick: "no" },
  { option: "Abstract color orbs", kind: "scale", speed: "1 tap", a11y: "Color-only risk", brand: "Ambiguous", rework: "None", express: "Low", pick: "no" },
  { option: "Word chips", kind: "scale", speed: "1 tap", a11y: "Best — text", brand: "Plain", rework: "None", express: "Low", pick: "secondary" },
  { option: "Mood slider", kind: "scale", speed: "1 drag", a11y: "Needs ARIA", brand: "Neutral", rework: "Snap to 5", express: "Low", pick: "no" },
  { option: "Grouped two-tier wheel", kind: "categorical", speed: "1–2 taps", a11y: "Labeled + grouped", brand: "Strong", rework: "New view", express: "High", pick: "secondary" },
  { option: "Hybrid: 1–5 + emotion tag", kind: "hybrid", speed: "1 tap (+opt)", a11y: "Labeled + shape", brand: "Distinct (mascot)", rework: "None", express: "High", pick: "primary" },
];

function PickCell({ pick }: { pick: Row6["pick"] }) {
  const t = useHostTheme();
  if (pick === "primary")
    return <Text as="span" size="small" weight="semibold" style={{ color: t.accent.primary }}>Recommended</Text>;
  if (pick === "secondary")
    return <Text as="span" size="small" tone="secondary">Keep / pair</Text>;
  return <Text as="span" size="small" tone="quaternary">—</Text>;
}

export default function MiraMoodSelectorOptions() {
  const t = useHostTheme();
  return (
    <Stack gap={22} style={{ padding: 24, maxWidth: 1060 }}>
      <Stack gap={4}>
        <H1>Mira mood selector — concept comparison</H1>
        <Text tone="tertiary" size="small">
          Exploration only · no app source changed · brand tokens mirror <Code>src/index.css</Code>,
          scale mirrors <Code>MOOD_SCORE</Code> (rough=1 … great=5) · glyphs are original SVG (no emoji, no Pixar art)
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="9" label="Concepts compared" />
        <Stat value="Hybrid" label="Recommended: 1–5 + emotion tag" tone="success" />
        <Stat value="Keep" label="Weather baseline stays live for A/B" />
        <Stat value="6 → 20+" label="Emotions via grouped two-tier wheel" />
      </Grid>

      <Callout tone="success" title="Revised recommendation, up front — go Hybrid">
        Ship the <Text as="span" weight="semibold">Hybrid (Option 9)</Text>: keep the one-tap{" "}
        <Text as="span" weight="semibold">ordered 1–5 opener</Text> (as the Mira mascot expressions, with word-chip
        labels) so the mood-trend chart keeps working <Text as="span" italic>untouched</Text> — then let users{" "}
        <Text as="span" weight="semibold">optionally attach a specific emotion</Text> as a categorical tag. You get
        speed <Text as="span" italic>and</Text> charts <Text as="span" italic>and</Text> rich feelings, with no
        either/or. Use the <Text as="span" weight="semibold">grouped two-tier wheel (Option 8)</Text> as the model
        for that tag layer, and keep the weather scale live to A/B — so the change stays low-risk and reversible.
      </Callout>

      <Callout tone="warning" title="The one decision that changes everything: SCALE vs CATEGORICAL">
        Today’s selector is an <Text as="span" weight="semibold">ordered 5-point valence scale</Text> — the Reflect
        tab averages those 1–5 scores into a line chart over time. Any <Text as="span" weight="semibold">scale</Text>{" "}
        concept (weather, mascot, faces, orbs, chips, slider) is a drop-in: the chart is untouched. A{" "}
        <Text as="span" weight="semibold">categorical</Text> concept (the Inside Out–inspired emotions) captures
        richer feeling but has <Text as="span" italic>no inherent order</Text> — you can’t average “Angry” and “Joy.”
        Choosing it means rebuilding Reflect around frequency (stacked bars / an emotion wheel), not a trend line.{" "}
        <Text as="span" weight="semibold">The Hybrid (Option 9) sidesteps this entirely</Text> — an ordered score for
        the trend line plus an optional emotion tag for a separate breakdown.
      </Callout>

      {/* ---------- 1. BASELINE ---------- */}
      <OptionBlock
        n={1}
        title="Weather scale"
        badge={{ text: "Current — keep", tone: "keep" }}
        tagline="The shipped baseline, reproduced faithfully as the visual anchor: rain-cloud → cloudy → sun-behind-cloud → sun-with-cloud → full sun."
        kind="scale"
        mockup={<WeatherMockup />}
        pros={[
          "Already shipped, loved, and understood",
          "Ordered gradient reads as a scale at a glance",
          "Metaphor is calm and non-clinical — fits journaling",
          "Icon shapes differ, not just color",
        ]}
        cons={[
          "Weather ≠ mood for some (a sunny day can feel rough)",
          "Not uniquely Mira — weather moods are common",
          "Five weather states blur at small sizes",
        ]}
        scaleNote="Preserves the 1–5 scale exactly — this is what the Reflect chart already consumes."
        a11y="Each chip is labeled; the icons carry shape as well as color, so it survives color-blindness."
        brand="Distinctive and already owned by Mira, though weather metaphors aren’t rare."
        effort="Low"
      />
      <Divider />

      {/* ---------- 2. EMOTION FACES ---------- */}
      <OptionBlock
        n={2}
        title="Emotion faces — Inside Out–inspired"
        badge={{ text: "inspired by — original art, not Pixar IP", tone: "note" }}
        tagline="A categorical set of named emotions, each with a signature color and an original expressive face. Emotion-color language: Joy=yellow, Sad=blue, Angry=red, Anxious=purple, Calm=teal (aligned to the brand)."
        kind="categorical"
        mockup={<EmotionMockup />}
        pros={[
          "Names the feeling — more expressive than a 1–5 rating",
          "Color language is intuitive and memorable",
          "Teal ‘Calm’ ties the happy path to the brand accent",
          "Great for nuanced prompts and richer reflections",
        ]}
        cons={[
          "Categorical — breaks the ordered mood-trend chart",
          "Risks reading as derivative of a famous franchise",
          "Five emotions is a lossy map of real feeling",
          "Most design + engineering effort of any option",
        ]}
        scaleNote="CATEGORICAL — no natural order, so Reflect would need a new visualization (emotion frequency / wheel), not a trend line."
        a11y="Every emotion is labeled, but leans on color as primary cue — pair with the name and distinct face shapes."
        brand="Bold and expressive, but the Inside Out association can feel borrowed rather than owned."
        effort="High"
      />
      <Divider />

      {/* ---------- 3. MASCOT ---------- */}
      <OptionBlock
        n={3}
        title="Mira mascot expressions"
        tagline="The reflection droplet wears five expressions as the scale — the selector literally becomes the mascot. Most on-brand of every concept."
        kind="scale"
        mockup={<MascotMockup />}
        pros={[
          "Maximally on-brand — reuses the mascot identity",
          "Warm and empathetic; the character ‘feels with you’",
          "Stays an ordered 1–5 scale (chart untouched)",
          "Faces differ by shape, not just color",
        ]}
        cons={[
          "Five droplet faces must stay clearly distinguishable",
          "One character repeated can read as less varied",
          "Slightly more art polish than plain faces",
        ]}
        scaleNote="Preserves the 1–5 scale — a drop-in for the current chart, zero analytics rework."
        a11y="Labeled chips; expressions differ by mouth/eye shape so they don’t depend on color alone."
        brand="The strongest differentiator — no competitor owns a mood scale embodied by its mascot."
        effort="Medium"
      />
      <Divider />

      {/* ---------- 4. CLASSIC FACES ---------- */}
      <OptionBlock
        n={4}
        title="Classic 5-face scale"
        tagline="A clean gradient of simple round faces, frown → grin, tinted along the valence palette. Familiar and instantly readable."
        kind="scale"
        mockup={<ClassicMockup />}
        pros={[
          "Universally understood — zero learning curve",
          "Fast to read and fast to build",
          "Valence tint reinforces the ordered scale",
        ]}
        cons={[
          "Generic — looks like every other mood tracker",
          "No brand personality or differentiation",
          "Smiley faces can feel clinical / survey-like",
        ]}
        scaleNote="Preserves the 1–5 scale — drop-in for the chart."
        a11y="Familiar and shape-based, but add text labels to clear AA (color tint shouldn’t be the only cue)."
        brand="Safe and legible, but does nothing to distinguish Mira."
        effort="Low"
      />
      <Divider />

      {/* ---------- 5. ORBS ---------- */}
      <OptionBlock
        n={5}
        title="Abstract color orbs"
        tagline="Minimal, premium color discs — mood-as-color, no faces. Quiet and modern (production could add a soft gradient sheen)."
        kind="scale"
        mockup={<OrbMockup />}
        pros={[
          "Premium, minimal, calm aesthetic",
          "Language-agnostic; no facial expression to misread",
          "Color gradient still encodes an ordered scale",
        ]}
        cons={[
          "Meaning isn’t obvious without labels — what does teal mean?",
          "Color-only encoding is an accessibility risk",
          "Can feel cold / abstract for an emotional moment",
        ]}
        scaleNote="Preserves the 1–5 scale via the color gradient — drop-in for the chart."
        a11y="Weakest as-is: relies on color alone. Requires visible labels + strong screen-reader text to be viable."
        brand="Looks premium but generic — abstract blobs don’t say ‘Mira.’"
        effort="Low"
      />
      <Divider />

      {/* ---------- 6. WORD CHIPS ---------- */}
      <OptionBlock
        n={6}
        title="Word chips"
        tagline="Text-only pills — Rough / Low / Okay / Good / Great. Language-first, unambiguous, and the most accessible option."
        kind="scale"
        mockup={<WordMockup />}
        pros={[
          "Zero ambiguity — the label IS the meaning",
          "Most accessible: real text, screen-reader native",
          "Trivial to build and localize",
          "Left-to-right order reads as a scale",
        ]}
        cons={[
          "Plainest option — little visual delight",
          "No brand personality on its own",
          "Text-heavy for a quick tap-to-begin moment",
        ]}
        scaleNote="Preserves the 1–5 scale — drop-in for the chart."
        a11y="Best in class — real labels, high contrast, no color dependence. Ideal accessibility fallback."
        brand="Clean but generic; better as a companion to a visual selector than the whole identity."
        effort="Low"
      />
      <Divider />

      {/* ---------- 7. SLIDER ---------- */}
      <OptionBlock
        n={7}
        title="Mood slider (+ 2-axis note)"
        tagline="A single continuous track from Rough → Great. Feels tactile and fast; see the trade-off with a valence × energy grid below."
        kind="scale"
        mockup={<SliderMockup />}
        pros={[
          "Tactile, playful, quick to set",
          "Continuous input → finer-grained trend data",
          "Naturally an ordered scale",
        ]}
        cons={[
          "Continuous precision is false — mood isn’t that exact",
          "Fiddly on touch; harder for motor/low-vision users",
          "Needs discrete snap points to map back to 1–5",
        ]}
        scaleNote="Preserves (even extends) the scale, but snap it to 5 stops to stay compatible with the current chart."
        a11y="Sliders need careful keyboard support + ARIA value text; discrete labeled stops (shown) mitigate this."
        brand="Neutral — a slider is a mechanic, not an identity."
        effort="Medium"
      />

      <Callout tone="info" title="Sidebar: the 2-axis (valence × energy) grid">
        A richer alternative places mood on two axes — pleasant↔unpleasant × low↔high energy (the “How We Feel”
        model). It captures that “calm-good” and “excited-good” differ, and yields a 2-D emotion map. But it’s{" "}
        <Text as="span" weight="semibold">categorical-ish</Text> and heavier: it replaces the simple tap and would
        need a quadrant-based Reflect view. Powerful for a future “deep check-in,” overkill for the one-tap opener.
      </Callout>

      <Divider />

      <Stack gap={4}>
        <H2>Scaling to many more emotions</H2>
        <Text tone="secondary" size="small">
          The user proposed a much richer set (Anxiety, Envy, Ennui, Embarrassment, Love, Hope, Guilt, …). Five flat
          chips don’t scale — but a grouped, two-tier model does, and a hybrid lets it coexist with the 1–5 chart.
        </Text>
      </Stack>

      {/* ---------- 8. GROUPED TWO-TIER WHEEL ---------- */}
      <OptionBlock
        n={8}
        title="Grouped two-tier emotion picker"
        tagline="The proven way to support many emotions (How We Feel / Apple State of Mind / Plutchik): a small fast tier of 6 core families, plus an optional ‘be more specific’ tier. Try tapping a family — Sad and Fear expand to show Low, Lonely, Guilt, Ennui, Anxiety, Embarrassment, etc."
        kind="categorical"
        mockup={<GroupedWheelMockup />}
        pros={[
          "Scales gracefully from 6 families to 20+ specifics",
          "Capture stays one-tap; granularity is opt-in",
          "Grouping teaches the emotion vocabulary",
          "Every item is color + face/dot + label",
        ]}
        cons={[
          "Two tiers add a step vs. a single scale",
          "Categorical — no ordered score for a trend line",
          "More content to design, localize, and maintain",
          "Choosing among many can add small friction",
        ]}
        scaleNote="CATEGORICAL — great expressiveness, but on its own it replaces the trend line with a frequency/wheel view. This is why it works best as the tag layer inside the Hybrid, not the sole selector."
        a11y="Strong: families + children always carry text labels and distinct shapes/dots, never color alone. Two tiers need clear focus order and grouping semantics."
        brand="On-brand and modern; the original blob glyphs keep it distinctly Mira rather than a generic wheel."
        effort="High"
      />

      {/* ---------- COLOR SYSTEM NOTE ---------- */}
      <Stack gap={8}>
        <H3>The emotion color system — collisions resolved</H3>
        <Text tone="secondary" size="small">
          The movie palette clashes with Mira’s brand, so we retune it. In the film <Text as="span" weight="semibold">Envy is teal</Text>,
          which collides with both the brand accent and Calm — so <Text as="span" weight="semibold">Envy becomes green/lime</Text> and{" "}
          <Text as="span" weight="semibold">Calm stays brand teal</Text>. <Text as="span" weight="semibold">Anxiety</Text> is orange,{" "}
          <Text as="span" weight="semibold">Embarrassment</Text> pink, and <Text as="span" weight="semibold">Ennui</Text> indigo
          (kept clearly apart from Sad’s blue). Love is rose, Hope a soft green, Guilt a muted plum.
        </Text>
        <Card>
          <CardHeader trailing={<Text as="span" size="small" tone="tertiary">light + dark safe</Text>}>
            Resolved palette
          </CardHeader>
          <CardBody>
            <ColorLegend />
          </CardBody>
        </Card>
        <Callout tone="neutral" title="Why this is accessible">
          Every emotion pairs a <Text as="span" weight="semibold">color + a face/dot + a text label</Text>, and each
          hue is chosen to hold WCAG AA contrast against both the light (<Code>#eef4f2</Code>) and dark
          (<Code>#0d1514</Code>) surfaces as a graphical object, with dark/light ink on the glyph. Because meaning is
          never carried by color alone, the set is <Text as="span" weight="semibold">color-blind safe</Text> — the
          label always disambiguates neighbors like Anxiety (orange) vs. Frustration, or Ennui (indigo) vs. Sad (blue).
        </Callout>
      </Stack>

      {/* ---------- DEPRESSION / WELLBEING / REBELLION ---------- */}
      <Grid columns={2} gap={16} align="stretch">
        <Callout tone="danger" title="Don’t ship “Depression” as a mood">
          Depression is a <Text as="span" weight="semibold">clinical condition, not a momentary feeling</Text>.
          Letting people label days “Depression” invites self-diagnosis and carries real duty-of-care weight for a
          consumer app. Use everyday words for the low end instead — <Text as="span" weight="semibold">Low, Down,
          Empty, Numb</Text> — which capture the feeling without medicalizing it.
        </Callout>
        <Callout tone="info" title="Recommend: a quiet wellbeing safety net">
          If someone logs <Text as="span" weight="semibold">very low moods repeatedly</Text>, Mira should gently and
          non-judgmentally surface support resources (a calm check-in, crisis/helpline links). Presented here as a{" "}
          <Text as="span" weight="semibold">product + ethics recommendation</Text>, not something to build now — but
          it’s the responsible companion to richer negative-emotion tracking.
        </Callout>
      </Grid>
      <Callout tone="neutral" title="Parked: “Rebellion”">
        Rebellion reads as an <Text as="span" weight="semibold">attitude/state, not a core emotion</Text> — niche and
        hard to place on either a valence scale or the family wheel. Park it: at most an optional entry buried deep in
        the expanded list, never in the core set.
      </Callout>

      <Divider />

      {/* ---------- 9. HYBRID (TOP RECOMMENDATION) ---------- */}
      <OptionBlock
        n={9}
        title="Hybrid — 1–5 scale + optional emotion tag"
        badge={{ text: "Recommended", tone: "keep" }}
        tagline="The resolution to the whole tension: a fast ordered opener that keeps the chart, plus an optional named-emotion tag that adds the richness. Tap a mascot level, then (optionally) attach a feeling."
        kind="hybrid"
        mockup={<HybridMockup />}
        pros={[
          "Keeps the one-tap ordered 1–5 → chart works untouched",
          "Optional tag adds categorical richness on demand",
          "Best of both: valence trend AND ‘what you felt’ breakdown",
          "Brand-distinct via the mascot; low-risk (weather stays live)",
        ]}
        cons={[
          "The optional second step must feel truly optional",
          "Two data shapes to store (score + tag) and surface in Reflect",
          "Tag taxonomy still needs the grouped wheel’s design work",
        ]}
        scaleNote="HYBRID — the ordered score feeds the existing mood-trend line with zero rework; the tag is stored alongside as categorical data for a separate breakdown. No forced choice between speed/charts and expressiveness."
        a11y="Inherits the mascot scale’s labeled, shape-based chips; the tag layer uses the color-blind-safe labeled set. The optional step keeps the fast path fully keyboard/screen-reader friendly."
        brand="Distinctly Mira through the mascot, while quietly matching the depth of emotion-first competitors."
        effort="Medium"
      />

      {/* ---------- COMPARISON MATRIX ---------- */}
      <Stack gap={8}>
        <H2>All nine, side by side</H2>
        <Text tone="secondary" size="small">
          “Chart fit” and “Chart rework” are the decisive axes: <Text as="span" weight="semibold">scale</Text> and{" "}
          <Text as="span" weight="semibold">hybrid</Text> are drop-ins for today’s trend line;{" "}
          <Text as="span" weight="semibold">categorical</Text> needs a new Reflect view. The Hybrid is the only row
          that scores well on <Text as="span" italic>every</Text> axis at once.
        </Text>
        <Table
          headers={["Concept", "Chart fit", "Speed", "Accessibility", "Brand fit", "Chart rework", "Expressive", "Verdict"]}
          columnAlign={["left", "left", "left", "left", "left", "left", "left", "left"]}
          rowTone={MATRIX.map((r) => (r.pick === "primary" ? "success" : undefined))}
          rows={MATRIX.map((r) => [
            <Text as="span" weight="semibold">{r.option}</Text>,
            <KindTag kind={r.kind} />,
            <Text as="span" size="small" tone="secondary">{r.speed}</Text>,
            <Text as="span" size="small" tone="secondary">{r.a11y}</Text>,
            <Text as="span" size="small" tone="secondary">{r.brand}</Text>,
            <Text as="span" size="small" tone="secondary">{r.rework}</Text>,
            <Text as="span" size="small" tone="secondary">{r.express}</Text>,
            <PickCell pick={r.pick} />,
          ])}
        />
      </Stack>

      {/* ---------- RECOMMENDATION ---------- */}
      <Stack gap={12}>
        <H2>Revised recommendation</H2>
        <Grid columns={2} gap={16} align="stretch">
          <Card>
            <CardHeader trailing={<Text as="span" size="small" style={{ color: t.accent.primary }}>Primary</Text>}>
              Ship the Hybrid: 1–5 opener + optional emotion tag
            </CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text>
                  <Text as="span" weight="semibold">It ends the either/or.</Text> The ordered opener (Mira mascot
                  expressions + word-chip labels) keeps capture to one tap and feeds the existing 1–5 mood-trend chart
                  with <Text as="span" italic>zero rework</Text>. The optional tag adds the rich, named emotions the
                  user is after — stored as categorical data for a separate “what you felt” breakdown in Reflect.
                </Text>
                <Divider />
                <Text>
                  <Text as="span" weight="semibold">Use the grouped two-tier wheel as the tag layer.</Text> Six
                  families, ~2–3 children each (scaling to 20+), on the collision-resolved, color-blind-safe palette —
                  so granularity is available on demand without slowing the everyday check-in.
                </Text>
                <Divider />
                <Text>
                  <Text as="span" weight="semibold">Keep the weather scale live</Text> and A/B the mascot opener
                  against it. Because the baseline stays, this is low-risk and reversible: measure completion and
                  retention, then promote the winner. Word chips remain the accessibility-first labeling on every path.
                </Text>
              </Stack>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Why not a richer set on its own (and the honest counter)</CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text tone="secondary">
                  <Text as="span" weight="semibold">A pure emotion picker (Options 2 &amp; 8)</Text> is the most
                  expressive, but going fully categorical breaks the trend line and adds friction to the daily tap.
                  Folding it into the Hybrid as an <Text as="span" italic>optional</Text> layer keeps its upside
                  without the cost.
                </Text>
                <Text tone="secondary">
                  <Text as="span" weight="semibold">Classic faces / orbs / slider</Text> stay also-rans — generic or
                  accessibility-risky without buying distinctiveness.
                </Text>
                <Divider />
                <Text tone="secondary">
                  <Text as="span" weight="semibold">The counter-argument:</Text> the Hybrid is more to build and its
                  second step must feel genuinely optional or it taxes the fast path. If the mascot opener doesn’t beat
                  weather in the A/B, shipping just the scale (weather or mascot) is still a fine outcome — the tag can
                  follow later. Keeping the baseline is what makes every step here reversible.
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </Grid>
        <Callout tone="success" title="Decision in one line">
          Go <Text as="span" weight="semibold">Hybrid</Text>: an ordered 1–5 mascot opener (keeps speed + the chart)
          with an <Text as="span" weight="semibold">optional emotion tag</Text> from the grouped, color-blind-safe
          wheel (adds granularity). Distinctive via the mascot, safe for analytics, kind by design (no “Depression”
          label, a wellbeing net for repeated lows) — and easy to A/B since the weather scale stays live.
        </Callout>
      </Stack>
    </Stack>
  );
}
