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
import { useState, type ReactNode } from "react";

/* ============================================================
   Mira — emotion face / "smiley" ART-STYLE exploration (canvas only)
   EXPLORATION ONLY. Nothing under src/ is touched.

   The user picked the Hybrid mood selector (a 1–5 mascot ladder + an
   optional named-emotion tag) but felt the emotion glyphs looked too
   basic and asked for "better emotion or smiley." This canvas renders
   FOUR upgraded, premium face styles across one shared sample set so a
   direction can be chosen before we implement.

   All art is ORIGINAL SVG (no emoji fonts, no Pixar IP). Brand tokens
   mirror src/index.css; the droplet mirrors src/components/Mascot.tsx.

   NOTE ON GRADIENTS/SHADOWS: the canvas CHROME (cards, callouts, table,
   headings) stays flat + token-driven per the canvas design rules. The
   gradients, highlights and drop-shadows live ONLY inside the SVG face
   art and the fixed Mira product panel — that premium finish is the
   whole point of this exploration and is product art, not chrome slop.
   ============================================================ */

// Faithful Mira LIGHT-theme brand tokens (src/index.css :root).
const MIRA = {
  bg: "#eef4f2",
  surface: "#ffffff",
  surface2: "#f2f7f5",
  content: "#10221f",
  contentMute: "#556764",
  border: "#dbe6e2",
  accent: "#10c4a9",
  accentStrong: "#0ba593",
  accentSoft: "#dcf6f1",
  accentText: "#0a6d61",
  onAccent: "#ffffff",
  face: "#0b3b36", // mascot ink
};

const FRED = "'Fredoka', ui-sans-serif, system-ui, sans-serif";
const NUN = "'Nunito', ui-sans-serif, system-ui, -apple-system, sans-serif";

// Shared sample sets — every style is rendered across the SAME emotions
// and the SAME 1–5 valence ladder, so they're directly comparable.
const EMO: { key: string; label: string; color: string }[] = [
  { key: "joy", label: "Joy", color: "#f2a51c" }, // gold
  { key: "calm", label: "Calm", color: "#10c4a9" }, // brand teal anchor
  { key: "sad", label: "Sad", color: "#4f8cf0" }, // blue
  { key: "anxious", label: "Anxious", color: "#ef8a3c" }, // orange
  { key: "love", label: "Love", color: "#e05780" }, // rose
];
// weather / valence gradient (rough → great) — matches the shipped scale.
const MOOD_COLORS = ["#6c7bf0", "#63a4f4", "#10c4a9", "#4ecb71", "#ffc53d"];
const SCALE_LABELS = ["Rough", "Low", "Okay", "Good", "Great"];

/* ---------------- tiny color math (for tints/shades) ---------------- */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function toHex(n: number): string {
  const s = Math.max(0, Math.min(255, Math.round(n))).toString(16);
  return s.length === 1 ? "0" + s : s;
}
function mix(hex: string, target: string, amt: number): string {
  const [r, g, b] = hexToRgb(hex);
  const [tr, tg, tb] = hexToRgb(target);
  return `#${toHex(r + (tr - r) * amt)}${toHex(g + (tg - g) * amt)}${toHex(b + (tb - b) * amt)}`;
}
const lighten = (h: string, a: number) => mix(h, "#ffffff", a);
const darken = (h: string, a: number) => mix(h, "#000000", a);

/* ---------------- expression system (shared across styles) ---------------- */
type StyleId = "mascot" | "glossy" | "flat" | "doodle";
type EyeType = "open" | "happy" | "closed" | "wide" | "droopy";
type MouthType = "grin" | "smile" | "smallSmile" | "neutral" | "smallFrown" | "frown" | "wavy";
type BrowType = "none" | "worried" | "raised";
interface Expr {
  eyes: EyeType;
  mouth: MouthType;
  brow: BrowType;
  tear: boolean;
  blush: boolean;
  heart: boolean;
}

// One resolver maps BOTH the named emotions and the ladder levels (l0–l4)
// to an expression — this is why any style drops onto both the tag set
// and the 1–5 ladder with zero extra art.
function resolve(key: string): Expr {
  const base: Expr = { eyes: "open", mouth: "neutral", brow: "none", tear: false, blush: false, heart: false };
  switch (key) {
    case "joy":
      return { ...base, eyes: "happy", mouth: "grin", blush: true };
    case "calm":
      return { ...base, eyes: "closed", mouth: "smallSmile" };
    case "sad":
      return { ...base, eyes: "droopy", brow: "worried", mouth: "frown", tear: true };
    case "anxious":
      return { ...base, eyes: "wide", brow: "raised", mouth: "wavy" };
    case "love":
      return { ...base, eyes: "happy", mouth: "smile", blush: true, heart: true };
    case "l0":
      return { ...base, eyes: "droopy", mouth: "frown" };
    case "l1":
      return { ...base, eyes: "open", mouth: "smallFrown" };
    case "l2":
      return { ...base, eyes: "open", mouth: "neutral" };
    case "l3":
      return { ...base, eyes: "open", mouth: "smile" };
    case "l4":
      return { ...base, eyes: "happy", mouth: "grin", blush: true };
    default:
      return base;
  }
}

// Shared facial-feature primitives. Fixed geometry (eyes ~y47, mouth ~y66)
// so the same feeling sits in the same place in every style.
function renderEyes(type: EyeType, ink: string, opt?: { sw?: number; highlight?: boolean; sclera?: string }): ReactNode {
  const sw = opt?.sw ?? 4;
  switch (type) {
    case "happy":
      return (
        <>
          <path d="M31 47 q6 6 12 0" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />
          <path d="M57 47 q6 6 12 0" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />
        </>
      );
    case "closed":
      return (
        <>
          <path d="M32 47 q5 4.5 10 0" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />
          <path d="M58 47 q5 4.5 10 0" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />
        </>
      );
    case "wide":
      return (
        <>
          <circle cx={37} cy={47} r={6.5} fill={opt?.sclera ?? "#ffffff"} stroke={ink} strokeWidth={2.4} />
          <circle cx={63} cy={47} r={6.5} fill={opt?.sclera ?? "#ffffff"} stroke={ink} strokeWidth={2.4} />
          <circle cx={37} cy={48} r={2.8} fill={ink} />
          <circle cx={63} cy={48} r={2.8} fill={ink} />
        </>
      );
    case "droopy":
      return (
        <>
          <path d="M31 49 q6 -5 12 0" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />
          <path d="M57 49 q6 -5 12 0" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />
        </>
      );
    default: // open
      return (
        <>
          <circle cx={37} cy={47} r={5.5} fill={ink} />
          <circle cx={63} cy={47} r={5.5} fill={ink} />
          {opt?.highlight && (
            <>
              <circle cx={38.8} cy={45.2} r={1.7} fill="#ffffff" />
              <circle cx={64.8} cy={45.2} r={1.7} fill="#ffffff" />
            </>
          )}
        </>
      );
  }
}

function renderMouth(type: MouthType, ink: string, sw = 4.5): ReactNode {
  switch (type) {
    case "grin":
      return <path d="M35 62 Q50 81 65 62 Z" fill={ink} />;
    case "smile":
      return <path d="M37 63 q13 12 26 0" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />;
    case "smallSmile":
      return <path d="M40 65 q10 7 20 0" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />;
    case "neutral":
      return <line x1={40} y1={67} x2={60} y2={67} stroke={ink} strokeWidth={sw} strokeLinecap="round" />;
    case "smallFrown":
      return <path d="M40 69 q10 -4 20 0" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />;
    case "frown":
      return <path d="M38 72 q12 -11 24 0" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />;
    case "wavy":
      return <path d="M38 68 q5 -6 10 0 q5 6 10 0" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />;
  }
}

function renderBrow(type: BrowType, ink: string, sw = 3.6): ReactNode {
  if (type === "worried")
    return (
      <>
        <path d="M30 41 L44 37" stroke={ink} strokeWidth={sw} strokeLinecap="round" />
        <path d="M70 41 L56 37" stroke={ink} strokeWidth={sw} strokeLinecap="round" />
      </>
    );
  if (type === "raised")
    return (
      <>
        <path d="M30 39 q7 -3.5 14 0" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />
        <path d="M56 39 q7 -3.5 14 0" fill="none" stroke={ink} strokeWidth={sw} strokeLinecap="round" />
      </>
    );
  return null;
}

/* ---------------- Style 1 — Mira mascot-droplet faces ---------------- */
// The brand water-drop IS the emotion. Teal identity kept; a subtle
// emotion-tinted radial glow + soft gradient + mirror-shine give premium
// depth. Mirrors src/components/Mascot.tsx geometry.
function DropletFace({ moodKey, color, size }: { moodKey: string; color: string; size: number }) {
  const e = resolve(moodKey);
  const ink = MIRA.face;
  const body = `md-body-${moodKey}`;
  const glow = `md-glow-${moodKey}`;
  const drop = "M50 8 C74 30 86 46 86 62 A36 36 0 1 1 14 62 C14 46 26 30 50 8 Z";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <linearGradient id={body} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={MIRA.accent} />
          <stop offset="100%" stopColor={MIRA.accentStrong} />
        </linearGradient>
        <radialGradient id={glow} cx="50%" cy="28%" r="72%">
          <stop offset="0%" stopColor={color} stopOpacity={0.55} />
          <stop offset="70%" stopColor={color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <path d={drop} fill={`url(#${body})`} />
      <path d={drop} fill={`url(#${glow})`} />
      {e.blush && (
        <>
          <ellipse cx={30} cy={64} rx={6} ry={3.6} fill="#ffffff" opacity={0.3} />
          <ellipse cx={70} cy={64} rx={6} ry={3.6} fill="#ffffff" opacity={0.3} />
        </>
      )}
      {renderBrow(e.brow, ink)}
      {renderEyes(e.eyes, ink, { highlight: true })}
      {renderMouth(e.mouth, ink)}
      {e.tear && <path d="M30 54 q-3 5 0 8 q3 -3 0 -8 Z" fill="#bfe0ff" />}
      {e.heart && (
        <path
          d="M75 24 c-1.6 -2.6 -6 -1 -6 2.4 c0 2.6 3.2 4.4 6 6.6 c2.8 -2.2 6 -4 6 -6.6 c0 -3.4 -4.4 -5 -6 -2.4 Z"
          fill={color}
        />
      )}
      {/* the "mirror" shine — Mira's signature highlight */}
      <path d="M40 22 q-10 8 -10 20" fill="none" stroke="#ffffff" strokeWidth={5} strokeLinecap="round" opacity={0.7} />
    </svg>
  );
}

/* ---------------- Style 2 — Glossy 3D-style smileys ---------------- */
// Apple / Fluent-emoji-inspired tactile faces: radial-gradient volume,
// a glossy top highlight, and a soft drop shadow. Original art.
function GlossyFace({ moodKey, color, size }: { moodKey: string; color: string; size: number }) {
  const e = resolve(moodKey);
  const light = lighten(color, 0.5);
  const dark = darken(color, 0.28);
  const ink = darken(color, 0.55);
  const rid = `gl-${moodKey}`;
  const fid = `glf-${moodKey}`;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <defs>
        <radialGradient id={rid} cx="38%" cy="30%" r="78%">
          <stop offset="0%" stopColor={light} />
          <stop offset="55%" stopColor={color} />
          <stop offset="100%" stopColor={dark} />
        </radialGradient>
        <filter id={fid} x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor={dark} floodOpacity="0.45" />
        </filter>
      </defs>
      <circle cx={50} cy={50} r={40} fill={`url(#${rid})`} filter={`url(#${fid})`} />
      {/* glossy specular highlight */}
      <ellipse cx={40} cy={30} rx={20} ry={12} fill="#ffffff" opacity={0.35} />
      <ellipse cx={63} cy={26} rx={5} ry={3} fill="#ffffff" opacity={0.5} />
      {e.blush && (
        <>
          <ellipse cx={29} cy={62} rx={6.5} ry={4} fill={light} opacity={0.75} />
          <ellipse cx={71} cy={62} rx={6.5} ry={4} fill={light} opacity={0.75} />
        </>
      )}
      {renderBrow(e.brow, ink)}
      {renderEyes(e.eyes, ink, { highlight: true, sclera: "#ffffff" })}
      {renderMouth(e.mouth, ink)}
      {e.tear && <path d="M30 54 q-3 5 0 8 q3 -3 0 -8 Z" fill="#bfe0ff" />}
      {e.heart && (
        <path
          d="M75 24 c-1.6 -2.6 -6 -1 -6 2.4 c0 2.6 3.2 4.4 6 6.6 c2.8 -2.2 6 -4 6 -6.6 c0 -3.4 -4.4 -5 -6 -2.4 Z"
          fill={darken(color, 0.15)}
        />
      )}
    </svg>
  );
}

/* ---------------- Style 3 — Soft flat / minimalist faces ---------------- */
// Clean two-tone: a pale accent disc + a single accent ink for features.
// Calm, modern, razor-legible — no gradient, no shadow.
function FlatFace({ moodKey, color, size }: { moodKey: string; color: string; size: number }) {
  const e = resolve(moodKey);
  const disc = lighten(color, 0.72);
  const ink = darken(color, 0.14);
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <circle cx={50} cy={50} r={40} fill={disc} />
      {e.blush && (
        <>
          <ellipse cx={29} cy={62} rx={6} ry={3.6} fill={lighten(color, 0.4)} />
          <ellipse cx={71} cy={62} rx={6} ry={3.6} fill={lighten(color, 0.4)} />
        </>
      )}
      {renderBrow(e.brow, ink, 3.4)}
      {renderEyes(e.eyes, ink, { sclera: disc })}
      {renderMouth(e.mouth, ink)}
      {e.tear && <circle cx={31} cy={58} r={3} fill={darken("#4f8cf0", 0.05)} />}
      {e.heart && (
        <path
          d="M75 24 c-1.6 -2.6 -6 -1 -6 2.4 c0 2.6 3.2 4.4 6 6.6 c2.8 -2.2 6 -4 6 -6.6 c0 -3.4 -4.4 -5 -6 -2.4 Z"
          fill={ink}
        />
      )}
    </svg>
  );
}

/* ---------------- Style 4 — Playful hand-drawn / Duolingo-style ---------------- */
// A slightly wobbly inked character: bold outline, a little sprout, big
// eyes with highlights, rosy cheeks. Maximum personality.
function doodleEyes(type: EyeType, ink: string): ReactNode {
  if (type === "happy" || type === "closed")
    return (
      <>
        <path d="M30 47 q7 7 14 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
        <path d="M56 47 q7 7 14 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      </>
    );
  if (type === "droopy")
    return (
      <>
        <path d="M30 49 q7 -5 14 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
        <path d="M56 49 q7 -5 14 0" fill="none" stroke={ink} strokeWidth={4} strokeLinecap="round" />
      </>
    );
  const r = type === "wide" ? 8.5 : 7.5;
  return (
    <>
      <circle cx={37} cy={46} r={r} fill="#ffffff" stroke={ink} strokeWidth={2} />
      <circle cx={63} cy={46} r={r} fill="#ffffff" stroke={ink} strokeWidth={2} />
      <circle cx={38} cy={47} r={3.6} fill={ink} />
      <circle cx={64} cy={47} r={3.6} fill={ink} />
      <circle cx={39.6} cy={45} r={1.4} fill="#ffffff" />
      <circle cx={65.6} cy={45} r={1.4} fill="#ffffff" />
    </>
  );
}
function DoodleFace({ moodKey, color, size }: { moodKey: string; color: string; size: number }) {
  const e = resolve(moodKey);
  const ink = "#2a231d";
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      {/* sprout — a bit of character on top */}
      <path
        d="M50 14 q3 -9 10 -10 q-2 8 -10 10"
        fill={darken(color, 0.18)}
        stroke={ink}
        strokeWidth={2.4}
        strokeLinejoin="round"
      />
      {/* wobbly body blob with a bold hand-drawn outline */}
      <path
        d="M50 16 C74 16 88 34 86 56 C84 78 68 91 50 91 C32 91 16 78 14 56 C12 34 26 16 50 16 Z"
        fill={color}
        stroke={ink}
        strokeWidth={3.6}
        strokeLinejoin="round"
      />
      <ellipse cx={30} cy={63} rx={6.5} ry={4.2} fill="#ff9ba6" opacity={0.8} />
      <ellipse cx={70} cy={63} rx={6.5} ry={4.2} fill="#ff9ba6" opacity={0.8} />
      {renderBrow(e.brow, ink, 3.8)}
      {doodleEyes(e.eyes, ink)}
      {renderMouth(e.mouth, ink, 4.8)}
      {e.tear && <path d="M28 55 q-3 5 0 8 q3 -3 0 -8 Z" fill="#8fc3f5" stroke={ink} strokeWidth={1} />}
      {e.heart && (
        <path
          d="M77 24 c-1.8 -2.8 -6.6 -1 -6.6 2.6 c0 2.8 3.6 4.8 6.6 7.2 c3 -2.4 6.6 -4.4 6.6 -7.2 c0 -3.6 -4.8 -5.4 -6.6 -2.6 Z"
          fill="#ff6f91"
          stroke={ink}
          strokeWidth={1.4}
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

// Dispatcher — picks the style renderer.
function Face({ style, moodKey, color, size }: { style: StyleId; moodKey: string; color: string; size: number }) {
  if (style === "mascot") return <DropletFace moodKey={moodKey} color={color} size={size} />;
  if (style === "glossy") return <GlossyFace moodKey={moodKey} color={color} size={size} />;
  if (style === "flat") return <FlatFace moodKey={moodKey} color={color} size={size} />;
  return <DoodleFace moodKey={moodKey} color={color} size={size} />;
}

/* ---------------- Layout helpers (faithful Mira product surface) ---------------- */
function MiraPanel({ prompt, children }: { prompt: string; children: ReactNode }) {
  return (
    <div style={{ background: MIRA.bg, border: `1px solid ${MIRA.border}`, borderRadius: 24, padding: 18 }}>
      <div style={{ background: MIRA.surface, borderRadius: 20, padding: 16, border: `1px solid ${MIRA.border}` }}>
        <div style={{ fontFamily: FRED, fontSize: 16, fontWeight: 500, color: MIRA.content, marginBottom: 14, letterSpacing: "-0.01em" }}>
          {prompt}
        </div>
        {children}
      </div>
    </div>
  );
}

function StepLabel({ children }: { children: ReactNode }) {
  return (
    <div style={{ fontFamily: NUN, fontSize: 11, fontWeight: 700, color: MIRA.contentMute, marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.04em" }}>
      {children}
    </div>
  );
}

function MiraChip({
  selected,
  onClick,
  ariaLabel,
  children,
}: {
  key?: string | number;
  selected: boolean;
  onClick: () => void;
  ariaLabel: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={selected}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        padding: "10px 6px",
        borderRadius: 16,
        cursor: "pointer",
        background: selected ? MIRA.accentSoft : MIRA.surface2,
        border: `2px solid ${selected ? MIRA.accent : "transparent"}`,
        transition: "background 0.12s ease, border-color 0.12s ease",
        flex: "1 1 0",
        minWidth: 0,
      }}
    >
      {children}
      <span style={{ fontFamily: NUN, fontSize: 12, fontWeight: 700, color: selected ? MIRA.accentText : MIRA.contentMute }}>
        {ariaLabel}
      </span>
    </button>
  );
}

// The interactive mockup for one style: the 1–5 ladder, the emotion tags,
// and a 24px legibility proof — all in that style.
function StyleMockup({ style }: { style: StyleId }) {
  const [emo, setEmo] = useState("calm");
  const [lvl, setLvl] = useState(3);
  return (
    <MiraPanel prompt="How are you feeling?">
      <Stack gap={14}>
        <div>
          <StepLabel>Rate your day · 1–5 ladder</StepLabel>
          <Row gap={6} justify="space-between">
            {SCALE_LABELS.map((label, i) => (
              <MiraChip key={i} selected={lvl === i} onClick={() => setLvl(i)} ariaLabel={label}>
                <Face style={style} moodKey={`l${i}`} color={MOOD_COLORS[i]} size={38} />
              </MiraChip>
            ))}
          </Row>
        </div>
        <div style={{ height: 1, background: MIRA.border }} />
        <div>
          <StepLabel>Emotion tags · selector size</StepLabel>
          <Row gap={6} justify="space-between">
            {EMO.map((e) => (
              <MiraChip key={e.key} selected={emo === e.key} onClick={() => setEmo(e.key)} ariaLabel={e.label}>
                <Face style={style} moodKey={e.key} color={e.color} size={44} />
              </MiraChip>
            ))}
          </Row>
        </div>
        <div style={{ height: 1, background: MIRA.border }} />
        <div>
          <StepLabel>Legibility at 24px</StepLabel>
          <Row gap={16} align="center">
            {EMO.map((e) => (
              <div key={e.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                <Face style={style} moodKey={e.key} color={e.color} size={24} />
                <span style={{ fontFamily: NUN, fontSize: 10, fontWeight: 700, color: MIRA.contentMute }}>{e.label}</span>
              </div>
            ))}
          </Row>
        </div>
      </Stack>
    </MiraPanel>
  );
}

/* ---------------- Analysis primitives ---------------- */
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

function Consideration({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Row gap={8} align="start">
      <Text as="span" size="small" weight="semibold" style={{ width: 118, flex: "0 0 auto" }}>{label}</Text>
      <Text as="span" size="small" tone="secondary">{children}</Text>
    </Row>
  );
}

interface StyleSpec {
  id: StyleId;
  n: number;
  title: string;
  finish: string;
  recommended?: boolean;
  desc: string;
  pros: string[];
  cons: string[];
  brand: string;
  express: string;
  legible: string;
  scale: string;
  a11y: string;
}

function StyleBlock({ s }: { s: StyleSpec }) {
  const t = useHostTheme();
  return (
    <Stack gap={12}>
      <Row gap={10} align="center" wrap>
        <span
          style={{
            width: 24, height: 24, borderRadius: 12, background: t.fill.tertiary, color: t.text.secondary,
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flex: "0 0 auto",
          }}
        >
          {s.n}
        </span>
        <H3>{s.title}</H3>
        <span
          style={{
            fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999,
            color: t.text.secondary, background: t.fill.secondary, border: `1px solid ${t.stroke.secondary}`,
          }}
        >
          {s.finish}
        </span>
        {s.recommended && (
          <span
            style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 999, color: t.text.onAccent, background: t.accent.primary }}
          >
            Top pick
          </span>
        )}
      </Row>
      <Text tone="tertiary" size="small">{s.desc}</Text>
      <Grid columns="minmax(0, 400px) 1fr" gap={20} align="start">
        <StyleMockup style={s.id} />
        <Stack gap={14}>
          <ProsCons pros={s.pros} cons={s.cons} />
          <Divider />
          <Stack gap={7}>
            <Consideration label="Brand fit">{s.brand}</Consideration>
            <Consideration label="Expressiveness">{s.express}</Consideration>
            <Consideration label="Legible @ small">{s.legible}</Consideration>
            <Consideration label="Scale → ~15">{s.scale}</Consideration>
            <Consideration label="Accessibility">{s.a11y}</Consideration>
          </Stack>
        </Stack>
      </Grid>
    </Stack>
  );
}

const STYLES: StyleSpec[] = [
  {
    id: "mascot",
    n: 1,
    title: "Mira mascot-droplet faces",
    finish: "Soft gradient + shine",
    recommended: true,
    desc:
      "Mira's water-drop IS the emotion — one identity, a distinct expression per feeling, plus a subtle emotion-tinted glow and the signature mirror-shine for premium depth. A clear step up from the flat blobs.",
    pros: [
      "Maximally on-brand — the mascot literally becomes the mood",
      "Gradient + shine reads as premium, not flat",
      "One character = instantly recognizable as Mira",
      "Expression differs by shape (brow/eye/mouth), not only color",
    ],
    cons: [
      "Teal body repeats — 15 tags lean on the accent glow to separate",
      "A touch more art tuning per expression",
      "Less of the round-'smiley' silhouette the user mentioned",
    ],
    brand: "Highest — nothing here can be mistaken for a generic tracker.",
    express: "High — carried by expression; the color glow is a secondary cue.",
    legible: "Strong — bold dark ink on teal survives 24px.",
    scale: "Good — reuse one body, swap expression + glow tint for ~15.",
    a11y: "Shape-led and always labeled; the teal body relies on the label to split same-valence feelings.",
  },
  {
    id: "glossy",
    n: 2,
    title: "Glossy 3D-style smileys",
    finish: "Radial gradient + drop shadow",
    desc:
      "Apple / Fluent-emoji-inspired tactile faces — radial-gradient volume, a glossy top highlight and a soft drop shadow. Exactly the familiar, premium 'smiley' feel the user asked about (original art, not real emoji).",
    pros: [
      "The most familiar 'smiley' — the tactile feel requested",
      "Gradient volume + highlight feels genuinely premium",
      "Per-emotion color is vivid and memorable",
      "Great at selector size",
    ],
    cons: [
      "Least brand-distinct — reads close to system emoji",
      "Gradients + shadow are heavier / less calm than Mira's flat UI",
      "Most art effort to keep 15 gradients on-model",
      "Shine can muddy the smallest sizes",
    ],
    brand: "Low — familiar, but not ownable by Mira.",
    express: "High — rich color plus a full face.",
    legible: "Good at 44px; softens a little by 24px.",
    scale: "Heavy — each new emotion needs careful gradient + shadow art.",
    a11y: "Color-forward — pair the label + shape and watch contrast on the light highlights.",
  },
  {
    id: "flat",
    n: 3,
    title: "Soft flat / minimalist faces",
    finish: "Two-tone · flat",
    desc:
      "Clean two-tone faces — a pale accent disc and a single accent ink. Calm, modern and razor-legible at any size, and the closest match to Mira's flat, token-based interface.",
    pros: [
      "Calmest + most modern — matches Mira's flat UI",
      "Razor-sharp legibility at every size",
      "Cheapest to scale to 15+ (two tones, swap paths)",
      "No gradient / shadow slop",
    ],
    cons: [
      "Least tactile 'wow' factor",
      "Not very distinctive on its own",
      "Can feel a little plain beside the glossy set",
    ],
    brand: "Neutral — clean, but not uniquely Mira.",
    express: "Medium — feeling is carried purely by line-work.",
    legible: "Best in class — crisp down to 24px and below.",
    scale: "Best — trivial and cheap to add new emotions.",
    a11y: "Strong — high shape contrast; pair with the always-present label.",
  },
  {
    id: "doodle",
    n: 4,
    title: "Playful hand-drawn characters",
    finish: "Inked outline + character",
    desc:
      "Slightly wobbly inked characters — bold outline, a little sprout, big highlighted eyes and rosy cheeks. The most personality and warmth, in a friendly Duolingo-adjacent spirit.",
    pros: [
      "Most personality + warmth — friendly companion energy",
      "Big eyes make the emotion read clearly",
      "A distinctive character system of its own",
      "Fun — encourages a daily check-in habit",
    ],
    cons: [
      "Playful tone can feel childish for heavier feelings",
      "Heavier line art to keep on-model across 15",
      "Busiest / least minimal of the four",
      "Slower to draw and localize",
    ],
    brand: "Medium — a character system, though not the droplet itself.",
    express: "Highest — big exaggerated features amplify feeling.",
    legible: "Good — the outline holds at 24px; fine detail softens.",
    scale: "Medium-heavy — each character needs individual care.",
    a11y: "Strong shape cues + label; keep an eye on busy detail at tiny sizes.",
  },
];

/* ---------------- Accessibility proof ---------------- */
// Shows the recommended style in full color AND desaturated, next to
// labels — proving each feeling survives without color (shape + label).
function A11yProof() {
  const t = useHostTheme();
  return (
    <Card>
      <CardHeader trailing={<Text as="span" size="small" tone="tertiary">color + face + label</Text>}>
        Never color alone — the grayscale test
      </CardHeader>
      <CardBody>
        <Stack gap={14}>
          <Text size="small" tone="secondary">
            Every glyph ships with a visible text label, and each feeling is drawn with a{" "}
            <Text as="span" weight="semibold">distinct shape</Text> (brow, eye and mouth), not just a hue. Desaturated to
            simulate color-blindness, the mascot set still reads: brows-up + wavy mouth = Anxious, droop + tear = Sad.
          </Text>
          <Grid columns={2} gap={16} align="start">
            <Stack gap={8}>
              <Text size="small" weight="semibold">In brand color</Text>
              <Row gap={12}>
                {EMO.map((e) => (
                  <div key={e.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <Face style="mascot" moodKey={e.key} color={e.color} size={40} />
                    <span style={{ fontFamily: NUN, fontSize: 11, fontWeight: 700, color: MIRA.contentMute }}>{e.label}</span>
                  </div>
                ))}
              </Row>
            </Stack>
            <Stack gap={8}>
              <Text size="small" weight="semibold">Desaturated (shape still separates)</Text>
              <Row gap={12}>
                {EMO.map((e) => (
                  <div key={e.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ filter: "grayscale(1)" }}>
                      <Face style="mascot" moodKey={e.key} color={e.color} size={40} />
                    </div>
                    <span style={{ fontFamily: NUN, fontSize: 11, fontWeight: 700, color: MIRA.contentMute }}>{e.label}</span>
                  </div>
                ))}
              </Row>
            </Stack>
          </Grid>
          <div style={{ height: 1, background: t.stroke.tertiary }} />
          <Row gap={8} wrap>
            {EMO.map((e) => (
              <span
                key={e.key}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 10px", borderRadius: 999,
                  background: MIRA.surface2, border: `2px solid ${MIRA.border}`,
                }}
              >
                <Face style="flat" moodKey={e.key} color={e.color} size={20} />
                <span style={{ fontFamily: NUN, fontSize: 12, fontWeight: 700, color: MIRA.content }}>{e.label}</span>
              </span>
            ))}
          </Row>
          <Text size="small" tone="tertiary">
            A real chip always pairs the face with its word — so Anxious (orange) and Joy (gold), or Sad (blue) and any
            neighbour, are disambiguated by the label, never the hue.
          </Text>
        </Stack>
      </CardBody>
    </Card>
  );
}

/* ---------------- Comparison table ---------------- */
type MRow = {
  style: string;
  finish: string;
  brand: string;
  smiley: string;
  express: string;
  legible: string;
  scale: string;
  verdict: string;
  pick: "primary" | "runner" | "no";
};
const MATRIX: MRow[] = [
  { style: "Mira droplet", finish: "Gradient + shine", brand: "Highest", smiley: "Medium", express: "High", legible: "Strong", scale: "Good", verdict: "Top pick", pick: "primary" },
  { style: "Glossy 3D", finish: "Radial + shadow", brand: "Low", smiley: "Highest", express: "High", legible: "Good", scale: "Heavy", verdict: "Runner-up (smiley feel)", pick: "runner" },
  { style: "Soft flat", finish: "Two-tone", brand: "Neutral", smiley: "Medium", express: "Medium", legible: "Best", scale: "Best", verdict: "Best for scale + a11y", pick: "no" },
  { style: "Doodle", finish: "Inked character", brand: "Medium", smiley: "Medium", express: "Highest", legible: "Good", scale: "Medium", verdict: "If personality-first", pick: "no" },
];

function VerdictCell({ row }: { row: MRow }) {
  const t = useHostTheme();
  if (row.pick === "primary")
    return <Text as="span" size="small" weight="semibold" style={{ color: t.accent.primary }}>{row.verdict}</Text>;
  if (row.pick === "runner")
    return <Text as="span" size="small" tone="secondary">{row.verdict}</Text>;
  return <Text as="span" size="small" tone="tertiary">{row.verdict}</Text>;
}

/* ---------------- Page ---------------- */
export default function MiraEmotionGlyphStyles() {
  const t = useHostTheme();
  return (
    <Stack gap={22} style={{ padding: 24, maxWidth: 1080 }}>
      <Stack gap={4}>
        <H1>Mira emotion faces — art-style directions</H1>
        <Text tone="tertiary" size="small">
          Exploration only · no app source changed · brand tokens mirror <Code>src/index.css</Code>, the droplet mirrors{" "}
          <Code>src/components/Mascot.tsx</Code> · all art is original SVG (no emoji fonts, no Pixar). Four styles, each
          rendered across the same emotions (Joy · Calm · Sad · Anxious · Love) and the same 1–5 valence ladder.
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="4" label="Face styles rendered" />
        <Stat value="Droplet" label="Top pick: Mira mascot faces" tone="success" />
        <Stat value="5 + 5" label="Emotions + 1–5 ladder, per style" />
        <Stat value="24px" label="Legibility proven at small size" />
      </Grid>

      <Callout tone="success" title="Recommendation up front — go with the Mira mascot-droplet faces">
        It's the one look <Text as="span" weight="semibold">no competitor can copy</Text>, it still reads as a friendly
        smiley, and the new soft-gradient depth + mirror-shine are a clear <Text as="span" italic>premium jump</Text>{" "}
        from the flat blobs. Because expression is driven by shape, the exact same style drops onto{" "}
        <Text as="span" weight="semibold">both</Text> the 1–5 ladder (level → expression) and the emotion tags
        (feeling → expression + a subtle color glow). Pick the{" "}
        <Text as="span" weight="semibold">glossy 3D</Text> set instead only if you want the maximally-familiar smiley
        feel over brand ownership.
      </Callout>

      <Callout tone="neutral" title="Why these faces have gradients/shadows but the rest of the canvas doesn't">
        The premium finish (gradient, highlight, drop-shadow) lives <Text as="span" weight="semibold">only inside the
        SVG face art and the Mira product panel</Text> — that polish is the deliverable. The surrounding canvas
        (cards, callouts, table) stays deliberately flat and token-driven.
      </Callout>

      {STYLES.map((s, i) => (
        <div key={s.id}>
          <StyleBlock s={s} />
          {i < STYLES.length - 1 && <div style={{ height: 20 }} />}
          {i < STYLES.length - 1 && <Divider />}
        </div>
      ))}

      <Divider />

      <Stack gap={8}>
        <H2>Accessibility — face + label, never color alone</H2>
        <Text tone="secondary" size="small">
          The user asked that nothing rely on color alone. Each feeling is a distinct <Text as="span" weight="semibold">shape</Text>{" "}
          and always carries a <Text as="span" weight="semibold">text label</Text>, so the set is color-blind safe.
        </Text>
        <A11yProof />
      </Stack>

      <Stack gap={8}>
        <H2>All four, side by side</H2>
        <Text tone="secondary" size="small">
          Brand distinctiveness pulls toward the droplet; the familiar "smiley" feel pulls toward glossy. The droplet is
          the only row that stays distinctly Mira while still reading as a friendly face.
        </Text>
        <Table
          headers={["Style", "Finish", "Brand fit", "Smiley feel", "Expressive", "Legible @24", "Scale → 15", "Verdict"]}
          columnAlign={["left", "left", "left", "left", "left", "left", "left", "left"]}
          rowTone={MATRIX.map((r) => (r.pick === "primary" ? "success" : undefined))}
          rows={MATRIX.map((r) => [
            <Text as="span" weight="semibold">{r.style}</Text>,
            <Text as="span" size="small" tone="secondary">{r.finish}</Text>,
            <Text as="span" size="small" tone="secondary">{r.brand}</Text>,
            <Text as="span" size="small" tone="secondary">{r.smiley}</Text>,
            <Text as="span" size="small" tone="secondary">{r.express}</Text>,
            <Text as="span" size="small" tone="secondary">{r.legible}</Text>,
            <Text as="span" size="small" tone="secondary">{r.scale}</Text>,
            <VerdictCell row={r} />,
          ])}
        />
      </Stack>

      <Stack gap={12}>
        <H2>Recommendation</H2>
        <Grid columns={2} gap={16} align="stretch">
          <Card>
            <CardHeader trailing={<Text as="span" size="small" style={{ color: t.accent.primary }}>Primary</Text>}>
              Ship the Mira mascot-droplet faces
            </CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text>
                  <Text as="span" weight="semibold">One identity, one system.</Text> The droplet already carries the
                  brand; giving it a soft gradient, an emotion-tinted glow and the mirror-shine turns the flat blobs into
                  something that looks premium and unmistakably Mira — while still reading as a warm, friendly smiley.
                </Text>
                <Divider />
                <Text>
                  <Text as="span" weight="semibold">It fits the Hybrid selector exactly.</Text> The same renderer maps a
                  ladder level to an expression for the <Text as="span" weight="semibold">1–5 opener</Text>, and a named
                  feeling to an expression + color glow for the <Text as="span" weight="semibold">emotion tag</Text> set —
                  so both layers share one consistent look and one code path.
                </Text>
                <Divider />
                <Text>
                  <Text as="span" weight="semibold">Pairing note.</Text> If the full ~15-emotion tag grid ever needs
                  stronger color separation, render those <Text as="span" italic>same expressions</Text> in the flat
                  two-tone style — color does the sorting while the shape stays identical, keeping everything on-model.
                </Text>
              </Stack>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>The honest counter</CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text tone="secondary">
                  <Text as="span" weight="semibold">Glossy 3D</Text> is the safest bet if the goal is purely the
                  familiar, tactile "smiley" the user pictured — but it trades away brand ownership and is the heaviest
                  to keep on-model across 15 emotions.
                </Text>
                <Text tone="secondary">
                  <Text as="span" weight="semibold">Soft flat</Text> is the pragmatic pick if scale and accessibility
                  win over delight — cheapest to grow, sharpest at small sizes, calmest against Mira's UI.
                </Text>
                <Text tone="secondary">
                  <Text as="span" weight="semibold">Doodle</Text> only if we want a personality-forward mascot world —
                  charming, but busier and a touch childish for heavier feelings.
                </Text>
                <Divider />
                <Text tone="secondary">
                  If the droplet's teal-on-teal repetition worries you across a big tag grid, the mascot + flat pairing
                  above resolves it without introducing a second visual language.
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </Grid>
        <Callout tone="success" title="Decision in one line">
          Go <Text as="span" weight="semibold">Mira mascot-droplet faces</Text> — premium, distinctly Mira, still a
          friendly smiley, and one shape-driven system that serves both the 1–5 ladder and the emotion tags. Glossy 3D
          is the runner-up if maximal smiley familiarity beats brand distinctiveness.
        </Callout>
      </Stack>
    </Stack>
  );
}
