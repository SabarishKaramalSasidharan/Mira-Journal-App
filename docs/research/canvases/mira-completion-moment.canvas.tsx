import {
  Callout,
  Card,
  CardBody,
  CardHeader,
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

type Mark = "y" | "p" | "n";

// Mira's actual product accent (from palette.ts). Hex here is DATA — a faithful
// reproduction of the product's light theme inside the phone mocks, not decoration.
const TEAL = "#0e9e8c";
const TEAL_STRONG = "#0b8072";
const TEAL_SOFT = "#d7f3ee";
const PAPER = "#ffffff";
const PAPER_2 = "#f4f6f6";
const INK = "#111827";
const INK_SOFT = "#4b5563";
const INK_MUTE = "#9aa3ad";

function Level({ v, yes = "Yes" }: { v: Mark; yes?: string }) {
  const t = useHostTheme();
  if (v === "y")
    return (
      <Text as="span" weight="semibold" style={{ color: t.accent.primary }}>
        {yes}
      </Text>
    );
  if (v === "p")
    return (
      <Text as="span" tone="secondary">
        Partial
      </Text>
    );
  return (
    <Text as="span" tone="quaternary">
      —
    </Text>
  );
}

// Effort / impact / risk rating rendered as a labeled dot so the table scans fast.
function Rating({ level, label }: { level: "low" | "med" | "high"; label: string }) {
  const t = useHostTheme();
  const color =
    level === "high" ? t.accent.primary : level === "med" ? t.text.secondary : t.text.quaternary;
  return (
    <Row gap={6} align="center">
      <span style={{ width: 7, height: 7, borderRadius: 4, background: color, display: "inline-block" }} />
      <Text as="span" tone={level === "high" ? "primary" : "secondary"}>
        {label}
      </Text>
    </Row>
  );
}

// A small teal reflection droplet — a flat stand-in for the Mira mascot inside the mocks.
function Droplet({ size = 40, mood = "calm" }: { size?: number; mood?: "joy" | "calm" }) {
  const eyeY = 56;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" aria-hidden="true">
      <path d="M50 8 C74 30 86 46 86 62 A36 36 0 1 1 14 62 C14 46 26 30 50 8 Z" fill={TEAL} />
      {mood === "joy" ? (
        <>
          <path d="M33 55 q7 8 14 0" fill="none" stroke="#0b3b36" strokeWidth="4" strokeLinecap="round" />
          <path d="M53 55 q7 8 14 0" fill="none" stroke="#0b3b36" strokeWidth="4" strokeLinecap="round" />
          <path d="M39 69 Q50 84 61 69 Z" fill="#0b3b36" />
        </>
      ) : (
        <>
          <path d={`M34 ${eyeY} q6 6 12 0`} fill="none" stroke="#0b3b36" strokeWidth="4" strokeLinecap="round" />
          <path d={`M54 ${eyeY} q6 6 12 0`} fill="none" stroke="#0b3b36" strokeWidth="4" strokeLinecap="round" />
          <path d="M42 70 q8 6 16 0" fill="none" stroke="#0b3b36" strokeWidth="4" strokeLinecap="round" />
        </>
      )}
      <path d="M40 22 q-10 8 -10 20" fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function ThemeChip({ label }: { label: string }) {
  return (
    <span
      style={{
        background: TEAL_SOFT,
        color: TEAL_STRONG,
        borderRadius: 999,
        padding: "3px 10px",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

// Phone-sized surface reproducing Mira's light theme. Fixed light bg is a faithful
// product reproduction (data), matching the sibling brand-color canvas convention.
function Phone({
  tag,
  tagTone,
  body,
}: {
  tag: string;
  tagTone: "muted" | "accent";
  body: ReturnType<typeof Stack>;
}) {
  const t = useHostTheme();
  return (
    <Stack gap={8}>
      <Row gap={8} align="center">
        <span
          style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 0.3,
            textTransform: "uppercase",
            color: tagTone === "accent" ? t.accent.primary : t.text.tertiary,
          }}
        >
          {tag}
        </span>
      </Row>
      <div
        style={{
          width: "100%",
          maxWidth: 300,
          height: 470,
          borderRadius: 26,
          border: `1px solid ${t.stroke.primary}`,
          background: PAPER,
          overflow: "hidden",
          position: "relative",
        }}
      >
        {body}
      </div>
    </Stack>
  );
}

// The conversation faintly visible behind the close moment.
function ChatBackdrop({ dimmed }: { dimmed: boolean }) {
  return (
    <div style={{ position: "absolute", inset: 0, padding: 16, opacity: dimmed ? 0.35 : 0.6 }}>
      <div style={{ height: 26, width: 120, borderRadius: 999, background: PAPER_2, margin: "0 auto 16px" }} />
      <div style={{ height: 44, width: "72%", borderRadius: 14, background: PAPER_2, marginBottom: 10 }} />
      <div style={{ height: 44, width: "60%", borderRadius: 14, background: TEAL_SOFT, marginLeft: "auto", marginBottom: 10 }} />
      <div style={{ height: 60, width: "78%", borderRadius: 14, background: PAPER_2, marginBottom: 10 }} />
      <div style={{ height: 44, width: "52%", borderRadius: 14, background: TEAL_SOFT, marginLeft: "auto" }} />
    </div>
  );
}

const CONFETTI = ["#0e9e8c", "#e8c34a", "#e8804a", "#5bb98c", "#e2688a"];

export default function MiraCompletionMoment() {
  const t = useHostTheme();

  return (
    <Stack gap={22} style={{ padding: 24, maxWidth: 1060 }}>
      <Stack gap={4}>
        <H1>Mira’s completion moment — reflect back, don’t applaud</H1>
        <Text tone="tertiary" size="small">
          The screen after “Finish”. Sources: NN/g & Laws of UX (peak–end rule), Nir Eyal / Hooked &
          Skinner (variable reward), Deci &amp; Ryan / Lepper (overjustification), Duolingo teardown +
          m-learning review (celebration &amp; notification fatigue), Stoic, Reflectly, Finch, Apple Journal ·
          compiled Aug 2026
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="Reframe" label="Verdict on the “Saved!” modal" tone="warning" />
        <Stat value="Reflect-back" label="Recommended default close" />
        <Stat value="Milestones only" label="When confetti fires" tone="success" />
        <Stat value="Already saved" label="Why the modal feels redundant" />
      </Grid>

      <Callout tone="success" title="The recommendation, up front">
        Stop celebrating every finish. Since the entry is <Text as="span" weight="semibold">already auto-saved</Text>,
        replace the full-screen “Saved!” modal with a calm, non-blocking{" "}
        <Text as="span" weight="semibold">reflect-back close</Text>: Mira mirrors the one-line AI summary and
        themes of what the user just wrote (“Here’s what stood out…”), with a quiet streak line and a{" "}
        <Text as="span" weight="semibold">Done</Text> primary. Reserve confetti and the big streak strip for
        genuine milestones (first entry, streak milestone, personal best, weekly goal). This turns the ending
        into <Text as="span" italic>value</Text> instead of a pat on the back — an intrinsic reward that fits
        the mirror brand and dodges celebration fatigue.
      </Callout>

      {/* ---- DIAGNOSIS ---- */}
      <Stack gap={8}>
        <H2>Why the current moment underwhelms</H2>
        <Text tone="secondary" size="small">
          The overlay in <Text as="span" weight="semibold">SuccessMoment.tsx</Text>: a scrim + centered card with
          mascot, a big “Saved”, “Another moment captured.”, a streak pill, a 7-day strip, “Write another” /
          “See journal”, and a confetti burst on <Text as="span" italic>every</Text> finish.
        </Text>
        <Table
          headers={["Problem", "Why it lands flat", "Principle it breaks"]}
          columnAlign={["left", "left", "left"]}
          rows={[
            [
              <Text as="span" weight="semibold">Full-screen modal for an already-saved entry</Text>,
              <Text as="span" tone="secondary">The composer literally shows “Auto-saved”. A blocking scrim that shouts “Saved!” celebrates work already done — redundant and interruptive.</Text>,
              <Text as="span" tone="tertiary" size="small">Feedback should match the weight of the event</Text>,
            ],
            [
              <Text as="span" weight="semibold">“Saved / Another moment captured”</Text>,
              <Text as="span" tone="secondary">Generic and system-centric. It describes storage, not the person. Nothing about it is about what they just wrote.</Text>,
              <Text as="span" tone="tertiary" size="small">Endings should feel human &amp; specific</Text>,
            ],
            [
              <Text as="span" weight="semibold">Confetti on every finish</Text>,
              <Text as="span" tone="secondary">A predictable reward every single time desensitizes fast — the same nerve hit too often. Duolingo is the cautionary tale here.</Text>,
              <Text as="span" tone="tertiary" size="small">Variable reward &gt; predictable reward</Text>,
            ],
            [
              <Text as="span" weight="semibold">Reward is extrinsic (confetti + streak)</Text>,
              <Text as="span" tone="secondary">It rewards the <Text as="span" italic>act of finishing</Text>, not the reflection. For an activity people already find meaningful, piling on extrinsic praise can crowd out the intrinsic “why”.</Text>,
              <Text as="span" tone="tertiary" size="small">Overjustification effect</Text>,
            ],
            [
              <Text as="span" weight="semibold">“Write another” as the loud primary</Text>,
              <Text as="span" tone="secondary">After pouring something out, almost nobody wants to immediately start again. The loudest button points at the least-likely action.</Text>,
              <Text as="span" tone="tertiary" size="small">CTA hierarchy should match intent</Text>,
            ],
            [
              <Text as="span" weight="semibold">Modal a11y gaps</Text>,
              <Text as="span" tone="secondary"><Text as="span" weight="semibold">role="dialog"</Text> but no <Text as="span" weight="semibold">aria-modal</Text>, no focus trap or focus-return, and confetti/pop ignore <Text as="span" weight="semibold">prefers-reduced-motion</Text>.</Text>,
              <Text as="span" tone="tertiary" size="small">WCAG 2.4.3 focus order · 2.3.3 motion</Text>,
            ],
          ]}
        />
      </Stack>

      {/* ---- COMPETITOR MATRIX ---- */}
      <Stack gap={8}>
        <H2>How the best apps handle the completion / closure moment</H2>
        <Text tone="secondary" size="small">
          Highlighted rows are the models Mira should borrow from — a reflected insight or a gentle,
          variable reward, not a confetti cannon.
        </Text>
        <Table
          headers={["App", "The completion moment", "Reward type", "Intensity", "Lesson for Mira"]}
          columnAlign={["left", "left", "left", "left", "left"]}
          rowTone={["warning", "success", "success", "success", undefined, undefined, undefined, "success"]}
          rows={[
            [
              <Text as="span" weight="semibold">Duolingo</Text>,
              <Text as="span" tone="secondary">Lesson-complete: XP tally, streak bump, gems/chests, animation + sound — every lesson.</Text>,
              <Text as="span" tone="secondary">Extrinsic (points, streak)</Text>,
              <Text as="span">Loud, constant</Text>,
              <Text as="span" tone="secondary">The over-celebration to avoid; widely criticized for fatigue.</Text>,
            ],
            [
              <Text as="span" weight="semibold">Stoic</Text>,
              <Text as="span" tone="secondary">Post-entry: short affirming note on positive moods; on-device AI reflections/insight drawn from what you wrote.</Text>,
              <Text as="span" tone="secondary">Intrinsic (insight)</Text>,
              <Text as="span">Quiet</Text>,
              <Text as="span" tone="secondary">Closest model — surface an insight from the entry itself.</Text>,
            ],
            [
              <Text as="span" weight="semibold">Reflectly</Text>,
              <Text as="span" tone="secondary">Ends an entry with an affirmation / positive quote + logged mood, in a friendly character voice.</Text>,
              <Text as="span" tone="secondary">Intrinsic + light extrinsic</Text>,
              <Text as="span">Gentle</Text>,
              <Text as="span" tone="secondary">Affirmation-as-closure; keep it warm, not saccharine.</Text>,
            ],
            [
              <Text as="span" weight="semibold">Finch</Text>,
              <Text as="span" tone="secondary">Self-care → energy toward the pet’s <Text as="span" italic>later</Text> adventure; partial progress counts; never punishes a miss.</Text>,
              <Text as="span" tone="secondary">Extrinsic but delayed &amp; variable</Text>,
              <Text as="span">Gentle, event-based</Text>,
              <Text as="span" tone="secondary">Anti-nag, non-punitive tone; reward can arrive later.</Text>,
            ],
            [
              <Text as="span" weight="semibold">Apple Journal</Text>,
              <Text as="span" tone="secondary">Save is near-silent; returns to the timeline. Streak lives as a subtle, opt-in element.</Text>,
              <Text as="span" tone="secondary">Intrinsic (the artifact)</Text>,
              <Text as="span">Minimal</Text>,
              <Text as="span" tone="secondary">A calm close is legitimate — Apple proves quiet works.</Text>,
            ],
            [
              <Text as="span" weight="semibold">Headspace / Calm</Text>,
              <Text as="span" tone="secondary">Session-complete summary: “you meditated X min”, run-streak, sometimes a reflective quote.</Text>,
              <Text as="span" tone="secondary">Extrinsic + summary</Text>,
              <Text as="span">Medium, restrained</Text>,
              <Text as="span" tone="secondary">Summarize what just happened; keep the tone calm.</Text>,
            ],
            [
              <Text as="span" weight="semibold">Daylio</Text>,
              <Text as="span" tone="secondary">Mood logged → back to calendar/stats; occasional achievement or goal badge.</Text>,
              <Text as="span" tone="secondary">Light extrinsic</Text>,
              <Text as="span">Low</Text>,
              <Text as="span" tone="secondary">Let the growing record be the payoff, not a popup.</Text>,
            ],
            [
              <Text as="span" weight="semibold">Mira — recommended</Text>,
              <Text as="span" tone="secondary">Reflect-back close (summary + themes + quiet streak); milestone-gated celebration.</Text>,
              <Text as="span" tone="secondary">Intrinsic first, variable extrinsic for milestones</Text>,
              <Text as="span">Quiet by default</Text>,
              <Text as="span" tone="secondary">Mirror what you heard; celebrate only when it’s earned.</Text>,
            ],
          ]}
        />
      </Stack>

      {/* ---- OPTIONS ---- */}
      <Stack gap={8}>
        <H2>The options, with trade-offs</H2>
        <Table
          headers={["Option", "What it is", "Why it’s better", "Effort", "Impact", "Risk"]}
          columnAlign={["left", "left", "left", "left", "left", "left"]}
          rowTone={[undefined, "success", "success", undefined, "success", "success"]}
          rows={[
            [
              <Text as="span" weight="semibold">A · Calmer inline close</Text>,
              <Text as="span" tone="secondary">Drop the modal; dismiss the composer with a brief non-blocking toast (“Kept.”).</Text>,
              <Text as="span" tone="secondary">Honest about auto-save; zero interruption; fast.</Text>,
              <Rating level="low" label="Low" />,
              <Rating level="med" label="Medium" />,
              <Text as="span" tone="secondary">Loses the “peak” — no memorable high point.</Text>,
            ],
            [
              <Text as="span" weight="semibold">B · Intrinsic reflect-back</Text>,
              <Text as="span" tone="secondary">Show the AI one-line summary + theme chips as Mira mirroring the entry back.</Text>,
              <Text as="span" tone="secondary">Turns closure into <Text as="span" italic>value</Text>; reinforces the mirror brand; intrinsic reward.</Text>,
              <Rating level="med" label="Medium" />,
              <Rating level="high" label="High" />,
              <Text as="span" tone="secondary">Summary quality — a weak echo feels hollow.</Text>,
            ],
            [
              <Text as="span" weight="semibold">C · Right-sized celebration</Text>,
              <Text as="span" tone="secondary">Reserve confetti + streak strip for milestones; quiet close otherwise.</Text>,
              <Text as="span" tone="secondary">Variable reward keeps the peak meaningful; kills fatigue.</Text>,
              <Rating level="low" label="Low–med" />,
              <Rating level="high" label="High" />,
              <Text as="span" tone="secondary">Must define milestones so it never feels random.</Text>,
            ],
            [
              <Text as="span" weight="semibold">D · Warmer copy</Text>,
              <Text as="span" tone="secondary">Replace “Another moment captured.” with human, mood-aware lines.</Text>,
              <Text as="span" tone="secondary">Specific &amp; human endings are what get remembered.</Text>,
              <Rating level="low" label="Low" />,
              <Rating level="med" label="Medium" />,
              <Text as="span" tone="secondary">Overwritten copy can read as fake cheer.</Text>,
            ],
            [
              <Text as="span" weight="semibold">E · CTA rethink</Text>,
              <Text as="span" tone="secondary">Make <Text as="span" weight="semibold">Done</Text> the primary; demote “Write another”.</Text>,
              <Text as="span" tone="secondary">The loud button finally matches the likely intent.</Text>,
              <Rating level="low" label="Low" />,
              <Rating level="med" label="Medium" />,
              <Text as="span" tone="secondary">Minor — could slightly reduce multi-entry sessions.</Text>,
            ],
            [
              <Text as="span" weight="semibold">F · Mood-aware mascot</Text>,
              <Text as="span" tone="secondary">Mira wears an expression matched to the logged mood, not always “joy”.</Text>,
              <Text as="span" tone="secondary">Empathy after a rough entry; earned, not performative.</Text>,
              <Rating level="low" label="Low–med" />,
              <Rating level="med" label="Medium" />,
              <Text as="span" tone="secondary">Needs care so “down” never feels bleak.</Text>,
            ],
          ]}
        />
        <Text tone="tertiary" size="small">
          The recommendation is the <Text as="span" weight="semibold">combination B + C + D + E + F</Text> — a
          reflect-back close by default, celebration gated to milestones.
        </Text>
      </Stack>

      {/* ---- BEFORE / AFTER MOCK ---- */}
      <Stack gap={10}>
        <H2>Before → after</H2>
        <Text tone="secondary" size="small">
          Faithful reproductions of Mira’s light theme. Left: today’s blocking modal + confetti. Right: the
          recommended non-blocking reflect-back close for an ordinary finish.
        </Text>
        <Grid columns="1fr 1fr" gap={20} align="start">
          {/* BEFORE */}
          <Phone
            tag="Before · every finish"
            tagTone="muted"
            body={
              <>
            <ChatBackdrop dimmed />
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.40)" }} />
            {/* confetti */}
            {CONFETTI.concat(CONFETTI).map((c, i) => (
              <span
                key={i}
                style={{
                  position: "absolute",
                  top: 8 + (i % 4) * 7,
                  left: `${8 + i * 8}%`,
                  width: 7,
                  height: 4,
                  background: c,
                  borderRadius: 1,
                }}
              />
            ))}
            <div
              style={{
                position: "absolute",
                left: 18,
                right: 18,
                top: 74,
                background: PAPER,
                borderRadius: 22,
                padding: 18,
                textAlign: "center",
              }}
            >
              <div style={{ width: 60, height: 60, borderRadius: 999, background: TEAL_SOFT, margin: "0 auto 10px", display: "grid", placeItems: "center" }}>
                <Droplet size={46} mood="joy" />
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: INK }}>Saved</div>
              <div style={{ fontSize: 13, fontWeight: 500, color: INK_SOFT, marginTop: 2 }}>Another moment captured.</div>
              <div style={{ display: "inline-flex", gap: 6, alignItems: "center", background: PAPER_2, borderRadius: 999, padding: "5px 12px", marginTop: 12 }}>
                <span style={{ color: "#e8804a", fontWeight: 800 }}>▲</span>
                <span style={{ fontSize: 13, fontWeight: 800, color: INK }}>2 days in a row</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 14 }}>
                {["T", "F", "S", "S", "M", "T", "W"].map((d, i) => (
                  <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ width: 22, height: 22, borderRadius: 999, background: i >= 5 ? TEAL : PAPER_2, color: i >= 5 ? "#fff" : INK_MUTE, fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center" }}>
                      {i >= 5 ? "✓" : ""}
                    </span>
                    <span style={{ fontSize: 9, fontWeight: 800, color: INK_MUTE }}>{d}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: TEAL, color: "#fff", borderRadius: 12, padding: "11px 0", fontSize: 14, fontWeight: 800, marginTop: 16 }}>Write another</div>
              <div style={{ color: INK_SOFT, fontSize: 13, fontWeight: 700, marginTop: 10 }}>See journal</div>
            </div>
              </>
            }
          />

          {/* AFTER */}
          <Phone
            tag="After · ordinary finish"
            tagTone="accent"
            body={
              <>
            <ChatBackdrop dimmed={false} />
            {/* non-blocking bottom sheet, no dark scrim */}
            <div
              style={{
                position: "absolute",
                left: 0,
                right: 0,
                bottom: 0,
                background: PAPER,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                borderTop: `1px solid ${t.stroke.secondary}`,
                padding: 18,
              }}
            >
              <div style={{ width: 34, height: 4, borderRadius: 999, background: PAPER_2, margin: "0 auto 14px" }} />
              <Row gap={10} align="center">
                <div style={{ width: 40, height: 40, borderRadius: 999, background: TEAL_SOFT, display: "grid", placeItems: "center", flex: "0 0 auto" }}>
                  <Droplet size={30} mood="calm" />
                </div>
                <span style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.4, textTransform: "uppercase", color: TEAL_STRONG }}>Mira heard</span>
              </Row>
              <div style={{ fontSize: 16, fontWeight: 700, color: INK, lineHeight: 1.35, marginTop: 12 }}>
                “A hard day with your manager — but you said the thing you needed to say.”
              </div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 12 }}>
                <ThemeChip label="work" />
                <ThemeChip label="manager" />
                <ThemeChip label="speaking up" />
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: INK_SOFT, marginTop: 12 }}>That took something. Rest easy tonight.</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 10 }}>
                <span style={{ color: "#e8804a", fontWeight: 800, fontSize: 12 }}>▲</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: INK_MUTE }}>Day 3 · kept</span>
              </div>
              <div style={{ background: TEAL, color: "#fff", borderRadius: 12, padding: "11px 0", fontSize: 14, fontWeight: 800, marginTop: 16, textAlign: "center" }}>Done</div>
              <div style={{ color: INK_SOFT, fontSize: 13, fontWeight: 700, marginTop: 10, textAlign: "center" }}>See in journal</div>
            </div>
              </>
            }
          />
        </Grid>
        <Callout tone="neutral" title="…and the milestone variant (the earned peak)">
          On a milestone finish the same sheet grows into a moment worth having: confetti returns, the mascot
          beams in <Text as="span" weight="semibold">joy</Text>, the 7-day strip + flame pill appear, and the
          headline names the achievement (“7 days in a row.”). The reflect-back summary stays underneath, so
          even the celebration carries meaning. Everything else in the day stays quiet — that contrast is what
          makes the peak land.
        </Callout>
      </Stack>

      {/* ---- WHEN TO CELEBRATE ---- */}
      <Stack gap={8}>
        <H2>When to celebrate vs. stay quiet</H2>
        <Text tone="secondary" size="small">
          The rule that makes the reward variable. Data available at finish today: <Text as="span" weight="semibold">extended</Text>,{" "}
          <Text as="span" weight="semibold">firstEver</Text>, <Text as="span" weight="semibold">streakStats</Text>, and the entry’s{" "}
          <Text as="span" weight="semibold">summary</Text> / <Text as="span" weight="semibold">themes</Text> / <Text as="span" weight="semibold">mood</Text>.
        </Text>
        <Table
          headers={["Trigger", "Treatment", "Confetti", "Streak strip"]}
          columnAlign={["left", "left", "center", "center"]}
          rowTone={["success", "success", "success", "success", undefined, undefined]}
          rows={[
            [
              <Text as="span" weight="semibold">First-ever entry (firstEver)</Text>,
              <Text as="span" tone="secondary">Full celebration — “Your first entry.”</Text>,
              <Level v="y" />,
              <Level v="n" yes="Yes" />,
            ],
            [
              <Text as="span" weight="semibold">Streak hits a milestone (3, 7, 14, 30, 60, 100…)</Text>,
              <Text as="span" tone="secondary">Full celebration — name the number.</Text>,
              <Level v="y" />,
              <Level v="y" />,
            ],
            [
              <Text as="span" weight="semibold">New personal best (current &gt; best)</Text>,
              <Text as="span" tone="secondary">Gentle celebration — “New best — 12 days.”</Text>,
              <Level v="p" yes="Soft" />,
              <Level v="y" />,
            ],
            [
              <Text as="span" weight="semibold">Weekly goal met (e.g. 5 entries this week)</Text>,
              <Text as="span" tone="secondary">Gentle celebration — “You hit your week.”</Text>,
              <Level v="p" yes="Soft" />,
              <Level v="y" />,
            ],
            [
              <Text as="span" weight="semibold">Ordinary finish (incl. a normal streak +1)</Text>,
              <Text as="span" tone="secondary">Quiet reflect-back close + small “Day N” line.</Text>,
              <Level v="n" />,
              <Level v="n" />,
            ],
            [
              <Text as="span" weight="semibold">prefers-reduced-motion</Text>,
              <Text as="span" tone="secondary">Any celebration swaps confetti/pop for a single calm fade.</Text>,
              <Level v="n" />,
              <Level v="p" yes="Static" />,
            ],
          ]}
        />
      </Stack>

      {/* ---- RECOMMENDED DESIGN DETAIL ---- */}
      <Stack gap={12}>
        <H2>The recommended design, concretely</H2>
        <Grid columns={2} gap={16} align="stretch">
          <Card>
            <CardHeader trailing={<Text as="span" size="small" style={{ color: t.accent.primary }}>Default</Text>}>
              Reflect-back close (non-blocking)
            </CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text>
                  A bottom sheet over the composer — <Text as="span" weight="semibold">no dark scrim</Text>, so
                  it never feels like an interruption to already-saved work.
                </Text>
                <Divider />
                <Text tone="secondary">
                  <Text as="span" weight="semibold">Layout, top → bottom:</Text> mood-aware mascot + eyebrow
                  “Mira heard” → the AI summary as a short quote → up to 3 theme chips → one mood-aware line →
                  a small “Day N · kept” → primary <Text as="span" weight="semibold">Done</Text> → ghost
                  <Text as="span" weight="semibold"> See in journal</Text>.
                </Text>
                <Divider />
                <Text tone="secondary">
                  <Text as="span" weight="semibold">Behavior:</Text> slides up, stays until dismissed (no
                  auto-timeout that a screen-reader/motor user could miss). “Done” returns to a calm write
                  screen; the loud “Write another” is gone.
                </Text>
              </Stack>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Copy — real strings</CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text tone="secondary"><Text as="span" weight="semibold">Eyebrow:</Text> “Mira heard” / “What stood out”</Text>
                <Text tone="secondary"><Text as="span" weight="semibold">Body:</Text> the entry’s <Text as="span" weight="semibold">summary</Text>, shown as a quote.</Text>
                <Divider />
                <Text tone="secondary"><Text as="span" weight="semibold">Mood-aware line:</Text></Text>
                <Text tone="secondary">· great/good → “Nice one to keep.”</Text>
                <Text tone="secondary">· okay → “Noted — thanks for checking in.”</Text>
                <Text tone="secondary">· low/rough → “That took something. Rest easy tonight.”</Text>
                <Divider />
                <Text tone="secondary"><Text as="span" weight="semibold">Milestone headlines:</Text> “Your first entry.” · “7 days in a row.” · “New best — 12 days.” · “You hit your week.”</Text>
              </Stack>
            </CardBody>
          </Card>
        </Grid>
        <Callout tone="info" title="Accessibility notes">
          The quiet sheet is non-blocking, so announce it with <Text as="span" weight="semibold">role="status"</Text>{" "}
          / <Text as="span" weight="semibold">aria-live="polite"</Text> — do <Text as="span" italic>not</Text>{" "}
          trap focus. The milestone variant is a real dialog: add <Text as="span" weight="semibold">aria-modal="true"</Text>,{" "}
          <Text as="span" weight="semibold">aria-labelledby</Text> the headline, move focus in, trap it, and
          return focus to the Finish button on close (Esc already closes). Honor{" "}
          <Text as="span" weight="semibold">prefers-reduced-motion</Text> for confetti and the pop-in. Keep the
          mood mascot decorative (aria-hidden) and never rely on color/expression alone — the words carry the
          meaning.
        </Callout>
      </Stack>

      {/* ---- WHY IT DIFFERENTIATES ---- */}
      <Callout tone="success" title="Why this is the right call for Mira">
        Mira’s whole promise is a <Text as="span" weight="semibold">mirror</Text> — you talk, it reflects you
        back a little clearer. Ending on “Saved! 🎉” throws that away at the exact moment (the{" "}
        <Text as="span" italic>end</Text>, per peak–end) that shapes the memory. Reflecting the summary back is
        both the most on-brand payoff <Text as="span" italic>and</Text> an intrinsic one — it rewards the
        reflection, not the tap. Gate the confetti to milestones and the celebration becomes a variable reward
        that stays special instead of a nightly ritual users learn to dismiss.
      </Callout>

      {/* ---- CITATIONS ---- */}
      <Stack gap={8}>
        <H3>Key sources</H3>
        <Grid columns={2} gap={8}>
          <Text tone="secondary" size="small">Peak–end rule — [NN/g](https://www.nngroup.com/articles/peak-end-rule/) · [Laws of UX](https://lawsofux.com/peak-end-rule/)</Text>
          <Text tone="secondary" size="small">Variable reward — [Nir Eyal: Variable Rewards](https://www.nirandfar.com/want-to-hook-your-users-drive-them-crazy/) · [Hook Model (Amplitude)](https://amplitude.com/blog/the-hook-model)</Text>
          <Text tone="secondary" size="small">Overjustification / intrinsic motivation — [Lepper, Greene &amp; Nisbett (1973)](https://web.mit.edu/curhan/www/docs/Articles/15341_Readings/Motivation/Lepper_et_al_Undermining_Childrens_Intrinsic_Interest.pdf) · [SDT &amp; gamification (Rutledge et al.)](https://selfdeterminationtheory.org/wp-content/uploads/2020/10/2018_RutledgeWalshEtAl_Gamification.pdf)</Text>
          <Text tone="secondary" size="small">Celebration / notification fatigue — [Duolingo push teardown](https://duolingo.deconstructoroffun.com/mechanics/notifications) · [m-learning review (73% negative on notifs)](https://doi.org/10.5267/j.ijdns.2025.12.004)</Text>
          <Text tone="secondary" size="small">Post-entry insight/affirmation — [Stoic Foundation Model AI](https://www.getstoic.com/blog/stoic-foundation-model-ai-features) · [Reflectly (App Store)](https://apps.apple.com/us/app/reflectly-journal-ai-diary/id1241229134)</Text>
          <Text tone="secondary" size="small">Gentle, non-punitive loop — [Finch teardown (Deconstructor of Fun)](https://www.deconstructoroffun.com/blog/x0hd2ssr80y5n7gv0w967pg7hwd7tl) · [MakeUseOf on Finch](https://www.makeuseof.com/finch-app-virtual-pet-motivation/)</Text>
        </Grid>
      </Stack>
    </Stack>
  );
}
