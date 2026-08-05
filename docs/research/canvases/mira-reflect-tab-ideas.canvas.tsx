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

// ---------------------------------------------------------------------------
// Competitor "reflect / insights" feature matrix
// y = shipped & solid · p = present but shallow/partial · n = absent
// ---------------------------------------------------------------------------

type Mark = "y" | "p" | "n";

function Cell({ v }: { v: Mark }) {
  const t = useHostTheme();
  if (v === "y")
    return (
      <Text as="span" weight="semibold" style={{ color: t.accent.primary }}>
        Yes
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

const MATRIX: {
  app: string;
  memories: Mark; // "On this day" / memory resurfacing
  trend: Mark; // mood trend chart over time
  corr: Mark; // mood ↔ activity/theme correlations
  themes: Mark; // themes / word cloud / activity frequency
  weekly: Mark; // weekly recap / review
  year: Mark; // year-in-review / year-in-pixels
  gran: Mark; // emotion granularity / vocabulary
  ai: Mark; // AI narrative reflection
  you?: boolean;
}[] = [
  { app: "Mira (today)", memories: "n", trend: "y", corr: "n", themes: "y", weekly: "p", year: "n", gran: "p", ai: "y", you: true },
  { app: "Day One", memories: "y", trend: "p", corr: "n", themes: "p", weekly: "n", year: "p", gran: "n", ai: "y" },
  { app: "Apple Journal", memories: "p", trend: "p", corr: "n", themes: "n", weekly: "n", year: "n", gran: "p", ai: "p" },
  { app: "Reflectly", memories: "n", trend: "y", corr: "y", themes: "p", weekly: "y", year: "n", gran: "p", ai: "y" },
  { app: "Daylio", memories: "p", trend: "y", corr: "y", themes: "y", weekly: "y", year: "y", gran: "p", ai: "n" },
  { app: "Stoic", memories: "p", trend: "y", corr: "y", themes: "p", weekly: "p", year: "p", gran: "p", ai: "y" },
  { app: "How We Feel", memories: "p", trend: "y", corr: "y", themes: "y", weekly: "y", year: "n", gran: "y", ai: "p" },
  { app: "Exist.io", memories: "y", trend: "y", corr: "y", themes: "p", weekly: "y", year: "n", gran: "n", ai: "n" },
  { app: "Rosebud", memories: "p", trend: "y", corr: "y", themes: "y", weekly: "y", year: "p", gran: "p", ai: "y" },
];

// ---------------------------------------------------------------------------
// The idea menu — three tiers, each positioned on the effort/impact map
// ---------------------------------------------------------------------------

type Tier = "quick" | "medium" | "ambitious";

interface Idea {
  id: string;
  name: string;
  tier: Tier;
  effort: number; // 0.5 – 5
  impact: number; // 2 – 5
}

const IDEAS: Idea[] = [
  // Quick wins — leverage data we already store (mood, themes, timestamps, streaks, text)
  { id: "Q8", name: "Weekly recap card", tier: "quick", effort: 1.9, impact: 4.6 },
  { id: "Q1", name: "On this day", tier: "quick", effort: 1.3, impact: 4.3 },
  { id: "Q7", name: "Emotion-word weather", tier: "quick", effort: 2.3, impact: 3.9 },
  { id: "Q2", name: "Best / hardest weekday", tier: "quick", effort: 1.2, impact: 3.5 },
  { id: "Q5", name: "Time-of-day patterns", tier: "quick", effort: 2.2, impact: 3.1 },
  { id: "Q6", name: "Themes over time", tier: "quick", effort: 1.5, impact: 2.9 },
  { id: "Q4", name: "Longest streak & consistency %", tier: "quick", effort: 1.0, impact: 2.6 },
  { id: "Q3", name: "Mood distribution donut", tier: "quick", effort: 2.0, impact: 2.5 },
  // Medium — light new computation / UI
  { id: "M1", name: "Mood × theme correlation", tier: "medium", effort: 3.3, impact: 4.4 },
  { id: "M2", name: "Calendar mood heatmap", tier: "medium", effort: 2.9, impact: 4.2 },
  { id: "M3", name: "Weekly review ritual", tier: "medium", effort: 3.5, impact: 4.0 },
  { id: "M4", name: "Gratitude / wins digest", tier: "medium", effort: 3.0, impact: 3.6 },
  { id: "M5", name: "Emotional-vocabulary growth", tier: "medium", effort: 3.5, impact: 3.2 },
  { id: "M6", name: "Theme trend sparklines", tier: "medium", effort: 2.7, impact: 2.9 },
  // Ambitious — LLM-powered, differentiating
  { id: "A1", name: "Reflect with Mira (chat recap)", tier: "ambitious", effort: 4.6, impact: 4.7 },
  { id: "A4", name: "Year in review — Mira Wrapped", tier: "ambitious", effort: 4.4, impact: 4.2 },
  { id: "A3", name: "Patterns + gentle suggestions", tier: "ambitious", effort: 4.3, impact: 3.9 },
  { id: "A2", name: "Monthly / seasonal narrative", tier: "ambitious", effort: 4.0, impact: 3.7 },
  { id: "A5", name: "Theme-based prompt suggestions", tier: "ambitious", effort: 3.8, impact: 3.5 },
];

const TIER_LABEL: Record<Tier, string> = {
  quick: "Quick win",
  medium: "Medium",
  ambitious: "Ambitious",
};

function tierColor(t: ReturnType<typeof useHostTheme>, tier: Tier): string {
  if (tier === "quick") return t.category.green;
  if (tier === "medium") return t.category.blue;
  return t.category.purple;
}

// ---------------------------------------------------------------------------
// Effort vs. impact scatter — pure inline SVG
// ---------------------------------------------------------------------------

function EffortImpactMap() {
  const theme = useHostTheme();
  const W = 960;
  const H = 380;
  const pad = { l: 56, r: 24, t: 22, b: 46 };
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;

  const xDomain = [0.5, 5];
  const yDomain = [2, 5];
  const x = (e: number) =>
    pad.l + ((e - xDomain[0]) / (xDomain[1] - xDomain[0])) * innerW;
  const y = (i: number) =>
    pad.t + innerH - ((i - yDomain[0]) / (yDomain[1] - yDomain[0])) * innerH;

  const xMid = x(2.75);
  const yMid = y(3.5);

  const quadrants: { label: string; qx: number; qy: number }[] = [
    { label: "Quick wins — do first", qx: pad.l + 8, qy: pad.t + 14 },
    { label: "Big bets", qx: W - pad.r - 8, qy: pad.t + 14 },
    { label: "Easy extras", qx: pad.l + 8, qy: pad.t + innerH - 6 },
    { label: "Heavy — defer", qx: W - pad.r - 8, qy: pad.t + innerH - 6 },
  ];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: "100%", height: "auto" }}
      role="img"
      aria-label="Effort versus impact map of Reflect-tab ideas"
    >
      {/* Axes frame */}
      <line x1={pad.l} x2={pad.l} y1={pad.t} y2={pad.t + innerH} stroke={theme.stroke.secondary} />
      <line x1={pad.l} x2={pad.l + innerW} y1={pad.t + innerH} y2={pad.t + innerH} stroke={theme.stroke.secondary} />

      {/* Quadrant dividers */}
      <line x1={xMid} x2={xMid} y1={pad.t} y2={pad.t + innerH} stroke={theme.stroke.tertiary} strokeDasharray="4 5" />
      <line x1={pad.l} x2={pad.l + innerW} y1={yMid} y2={yMid} stroke={theme.stroke.tertiary} strokeDasharray="4 5" />

      {quadrants.map((q, k) => (
        <text
          key={q.label}
          x={q.qx}
          y={q.qy}
          textAnchor={k % 2 === 0 ? "start" : "end"}
          fontSize={11}
          fontWeight={700}
          fill={theme.text.quaternary}
        >
          {q.label}
        </text>
      ))}

      {/* Axis titles */}
      <text x={pad.l + innerW / 2} y={H - 10} textAnchor="middle" fontSize={12} fontWeight={700} fill={theme.text.secondary}>
        Effort  →
      </text>
      <text x={pad.l - 12} y={pad.t - 8} textAnchor="start" fontSize={12} fontWeight={700} fill={theme.text.secondary}>
        ↑ Impact
      </text>
      <text x={pad.l} y={H - 26} textAnchor="middle" fontSize={10} fill={theme.text.quaternary}>
        low
      </text>
      <text x={pad.l + innerW} y={H - 26} textAnchor="middle" fontSize={10} fill={theme.text.quaternary}>
        high
      </text>

      {/* Idea bubbles */}
      {IDEAS.map((idea) => {
        const c = tierColor(theme, idea.tier);
        return (
          <g key={idea.id}>
            <circle cx={x(idea.effort)} cy={y(idea.impact)} r={13} fill={c} fillOpacity={0.22} stroke={c} strokeWidth={1.5} />
            <text
              x={x(idea.effort)}
              y={y(idea.impact) + 3.5}
              textAnchor="middle"
              fontSize={9.5}
              fontWeight={700}
              fill={theme.text.primary}
            >
              {idea.id}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function LegendDot({ tier }: { tier: Tier }) {
  const theme = useHostTheme();
  const c = tierColor(theme, tier);
  return (
    <Row gap={6} align="center">
      <span style={{ width: 10, height: 10, borderRadius: 6, background: c, display: "inline-block" }} />
      <Text as="span" tone="secondary" size="small">
        {TIER_LABEL[tier]}
      </Text>
    </Row>
  );
}

// ---------------------------------------------------------------------------
// Tier tables
// ---------------------------------------------------------------------------

interface Row5 {
  id: string;
  idea: string;
  why: string;
  data: string;
  have: "have" | "some" | "new";
  effort: string;
  risk: string;
  brand?: boolean; // strong fit for Mira's calm / mirror / mascot brand
}

function DataPill({ have }: { have: Row5["have"] }) {
  const t = useHostTheme();
  const map = {
    have: { label: "Have it", color: t.accent.primary },
    some: { label: "Mostly", color: t.text.secondary },
    new: { label: "New calc", color: t.text.tertiary },
  } as const;
  const m = map[have];
  return (
    <Text as="span" weight="semibold" size="small" style={{ color: m.color }}>
      {m.label}
    </Text>
  );
}

function IdeaName({ r }: { r: Row5 }) {
  const t = useHostTheme();
  return (
    <Row gap={6} align="center">
      <Text as="span" weight="semibold">
        {r.idea}
      </Text>
      {r.brand && (
        <span
          title="Strong fit for Mira's calm / mirror brand"
          style={{
            fontSize: 10,
            fontWeight: 700,
            color: t.accent.primary,
            border: `1px solid ${t.stroke.secondary}`,
            borderRadius: 4,
            padding: "0 4px",
          }}
        >
          on-brand
        </span>
      )}
    </Row>
  );
}

function TierTable({ rows }: { rows: Row5[] }) {
  return (
    <Table
      headers={["#", "Idea", "Why it's valuable", "Data", "Effort", "Risk to watch"]}
      columnAlign={["center", "left", "left", "left", "center", "left"]}
      rows={rows.map((r) => [
        <Text as="span" weight="bold" tone="tertiary">{r.id}</Text>,
        <IdeaName r={r} />,
        <Text as="span" tone="secondary">{r.why}</Text>,
        <Stack gap={1}>
          <DataPill have={r.have} />
          <Text as="span" tone="tertiary" size="small">{r.data}</Text>
        </Stack>,
        <Text as="span" tone="secondary" size="small">{r.effort}</Text>,
        <Text as="span" tone="tertiary" size="small">{r.risk}</Text>,
      ])}
    />
  );
}

const QUICK: Row5[] = [
  { id: "Q8", idea: "Weekly recap card", why: "A single warm summary — entries, avg mood, top theme, one win — anchors the ritual reviewers say drives retention.", data: "mood, themes, turns, streak", have: "have", effort: "Low", risk: "Keep it to one card; don't restate other sections.", brand: true },
  { id: "Q1", idea: "On this day", why: "Memory resurfacing is Day One's most-loved feature and a strong return-visit hook (\"resurface last month's entry\").", data: "createdAt, summary, mood", have: "have", effort: "Low", risk: "Hide when no past entry exists; older memories can sting.", brand: true },
  { id: "Q7", idea: "Emotion-word weather", why: "Surface the feeling words you used most — affect labeling (\"name it to tame it\") lowers amygdala reactivity.", data: "turns text + FEELING_WORDS", have: "have", effort: "Low", risk: "Frame gently; avoid over-labeling low-intensity days.", brand: true },
  { id: "Q2", idea: "Best / hardest weekday", why: "Extends the existing insight into a durable stat (\"Tuesdays run heavier\"); mirrors Exist.io's day-of-week averages.", data: "mood + createdAt weekday", have: "have", effort: "Low", risk: "Needs enough data; show confidence, not false certainty." },
  { id: "Q5", idea: "Time-of-day patterns", why: "When you write and how you feel by morning/evening — nudges toward the best reflection window.", data: "createdAt hour + mood", have: "have", effort: "Low", risk: "Sparse hourly data; bucket into 3–4 day-parts." },
  { id: "Q6", idea: "Themes over time", why: "Most-used themes this month vs last makes 'what kept coming up' feel like movement, not a static list.", data: "themes + createdAt", have: "have", effort: "Low", risk: "Avoid clutter — a compact delta, not another chart." },
  { id: "Q4", idea: "Longest streak & consistency %", why: "streakStats already computes personal best; % of days logged rewards consistency without punishing misses.", data: "streak logic (exists)", have: "have", effort: "Low", risk: "Keep non-punitive — celebrate, never shame a gap." },
  { id: "Q3", idea: "Mood distribution donut", why: "Share of ☀️→🌧️ over a range gives an at-a-glance emotional balance, complementing the line trend.", data: "mood", have: "have", effort: "Low", risk: "One more chart — only if it earns its space." },
];

const MEDIUM: Row5[] = [
  { id: "M1", idea: "Mood × theme correlation", why: "Daylio's crown jewel, adapted: \"entries about #work skew lower.\" The insight users can't see from inside a day.", data: "mood + themes", have: "some", effort: "Med", risk: "Correlation ≠ cause; add confidence + gentle wording." },
  { id: "M2", idea: "Calendar mood heatmap", why: "A calm 'year in pixels' — mood-colored day grid. Beautiful, glanceable, reinforces the reflective mirror.", data: "mood + createdAt", have: "have", effort: "Med", risk: "Empty days shouldn't read as failure.", brand: true },
  { id: "M3", idea: "Weekly review ritual", why: "A gentle guided review (wins, themes, one small adjustment) — the research-backed weekly habit that beats daily rote.", data: "existing + prompts", have: "some", effort: "Med", risk: "Make it optional; a tap, not a chore.", brand: true },
  { id: "M4", idea: "Gratitude / wins digest", why: "Collect the good moments — specific gratitude with reasons produces lasting well-being gains (Emmons & McCullough).", data: "turns text (light detect / LLM)", have: "some", effort: "Med", risk: "Detection misses; let users pin a 'win'.", brand: true },
  { id: "M5", idea: "Emotional-vocabulary growth", why: "Track breadth of feeling words over time and gently suggest new ones — builds emotional granularity.", data: "turns text + FEELING_WORDS", have: "some", effort: "Med", risk: "Never make richer vocabulary feel like homework.", brand: true },
  { id: "M6", idea: "Theme trend sparklines", why: "Each theme's rise/fall across weeks turns tags into a story of what's growing or fading.", data: "themes + createdAt", have: "have", effort: "Med", risk: "Sparse themes look noisy; require a minimum count." },
];

const AMBITIOUS: Row5[] = [
  { id: "A1", idea: "Reflect with Mira (chat recap)", why: "The mascot talks you through your week in the same chat UI you journal in — no incumbent pairs a companion with private, on-device AI.", data: "LLM + entries (offline fallback)", have: "some", effort: "High", risk: "Must degrade to rule-based recap offline.", brand: true },
  { id: "A4", idea: "Year in review — Mira Wrapped", why: "Daylio's Year in Pixels + Stoic Wrapped are share/retention magnets; a warm annual narrative fits the brand.", data: "LLM + all entries", have: "some", effort: "High", risk: "Privacy on any sharing; keep export local-first." },
  { id: "A3", idea: "Patterns + gentle suggestions", why: "Detected patterns with a soft nudge (\"you feel lighter on days you mention walks\") — Rosebud's paid differentiator.", data: "LLM + correlations", have: "some", effort: "High", risk: "Advice tone risk; suggest, never prescribe." },
  { id: "A2", idea: "Monthly / seasonal narrative", why: "A short written story of your month gives the overview daily life hides — Rosebud/Mindsera weekly reports at a calmer cadence.", data: "LLM + month of entries", have: "some", effort: "High", risk: "Cost/latency; cache and generate on demand." },
  { id: "A5", idea: "Theme-based prompt suggestions", why: "\"You've written about your dad 4×—want a prompt?\" turns recurring themes into gentle depth, echoing Day One's Go Deeper.", data: "themes + LLM", have: "some", effort: "Med-High", risk: "Don't nag; surface at most one, dismissible.", brand: true },
];

// ---------------------------------------------------------------------------
// Recommended shortlist / build order
// ---------------------------------------------------------------------------

const ROADMAP: { n: string; build: string; why: string; place: string }[] = [
  { n: "1", build: "Weekly recap card (Q8)", why: "Lowest effort, highest ritual value; reframes the footer stats into one warm summary and anchors the page.", place: "Replaces the two footer stat tiles" },
  { n: "2", build: "On this day (Q1)", why: "Emotional return-visit hook using data you already store; the single most-loved feature in the category.", place: "Top of Reflect, above the insight card" },
  { n: "3", build: "Calendar mood heatmap (M2)", why: "The signature calm visual — a 'year in pixels' that makes consistency felt without words or pressure.", place: "Below the mood trend, collapsible" },
  { n: "4", build: "Emotion-word weather (Q7 → M5)", why: "Cheap, deeply on-brand: reinforces the mirror + affect-labeling science, and seeds vocabulary growth later.", place: "Beside 'What kept coming up'" },
  { n: "5", build: "Reflect with Mira (A1)", why: "The true differentiator — a companion recap in-chat, offline-capable. Build last, once the data views exist to feed it.", place: "A 'Reflect with Mira' entry, opens the chat" },
];

// ---------------------------------------------------------------------------

export default function MiraReflectTabIdeas() {
  const theme = useHostTheme();

  return (
    <Stack gap={22} style={{ padding: 24, maxWidth: 1060 }}>
      <Stack gap={4}>
        <H1>What more can Mira's Reflect tab do?</H1>
        <Text tone="tertiary" size="small">
          A prioritized menu grounded in leading journaling apps + reflection science · compiled Aug 2026
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="9" label="Reflect surfaces studied" />
        <Stat value="19" label="Concrete ideas, 3 tiers" />
        <Stat value="8" label="Quick wins on data you already store" tone="success" />
        <Stat value="5" label="Recommended, in build order" />
      </Grid>

      <Callout tone="info" title="Design guardrail — protect the calm mirror">
        Reflect today has five quiet elements: the header, the{" "}
        <Text as="span" weight="semibold">insight card</Text> (“The pattern”), the{" "}
        <Text as="span" weight="semibold">mood trend</Text> with range toggle, the{" "}
        <Text as="span" weight="semibold">theme bars</Text>, and a{" "}
        <Text as="span" weight="semibold">two-stat footer</Text>. It is clean on purpose. The goal is not to bolt on
        dashboards — it's to deepen the “mirror” with a few resonant additions, and tuck heavier analytics behind a
        “Reflect deeper” tap so the main page stays unhurried.
      </Callout>

      <Stack gap={8}>
        <H2>What leading apps put on their reflect / insights surface</H2>
        <Text tone="secondary" size="small">
          Yes = shipped and solid · Partial = present but shallow/gated · — = absent
        </Text>
        <Table
          headers={[
            "App",
            "On this day",
            "Mood trend",
            "Mood ↔ theme correlation",
            "Themes / word cloud",
            "Weekly recap",
            "Year in review",
            "Emotion granularity",
            "AI narrative",
          ]}
          columnAlign={["left", "center", "center", "center", "center", "center", "center", "center", "center"]}
          rowTone={MATRIX.map((r) => (r.you ? "info" : undefined))}
          rows={MATRIX.map((r) => [
            <Text as="span" weight={r.you ? "bold" : "medium"}>{r.app}</Text>,
            <Cell v={r.memories} />,
            <Cell v={r.trend} />,
            <Cell v={r.corr} />,
            <Cell v={r.themes} />,
            <Cell v={r.weekly} />,
            <Cell v={r.year} />,
            <Cell v={r.gran} />,
            <Cell v={r.ai} />,
          ])}
        />
        <Text tone="tertiary" size="small">
          Takeaway: Mira already leads on{" "}
          <Text as="span" weight="semibold">AI narrative</Text> and{" "}
          <Text as="span" weight="semibold">themes</Text>, but trails the field on{" "}
          <Text as="span" weight="semibold">memory resurfacing</Text> (“On this day”),{" "}
          <Text as="span" weight="semibold">mood↔theme correlation</Text>, a real{" "}
          <Text as="span" weight="semibold">weekly recap</Text>, and{" "}
          <Text as="span" weight="semibold">year-in-review</Text>. Those are exactly the highest-loved features — and
          most are cheap on data Mira already has.
        </Text>
      </Stack>

      <Stack gap={10}>
        <H2>The idea menu, mapped by effort vs. impact</H2>
        <Row gap={16} wrap>
          <LegendDot tier="quick" />
          <LegendDot tier="medium" />
          <LegendDot tier="ambitious" />
          <Text as="span" tone="tertiary" size="small">
            Bubble labels map to the tables below · impact and effort are directional estimates for Mira's local-first stack
          </Text>
        </Row>
        <EffortImpactMap />
      </Stack>

      <Stack gap={8}>
        <H3>Tier 1 · Quick wins</H3>
        <Text tone="secondary" size="small">
          Small additions on data Mira already stores — moods, themes, timestamps, streaks, entry text.
        </Text>
        <TierTable rows={QUICK} />
      </Stack>

      <Stack gap={8}>
        <H3>Tier 2 · Medium</H3>
        <Text tone="secondary" size="small">
          Some new computation or light UI — trends, correlations, a review flow, a heatmap.
        </Text>
        <TierTable rows={MEDIUM} />
      </Stack>

      <Stack gap={8}>
        <H3>Tier 3 · Ambitious / differentiating</H3>
        <Text tone="secondary" size="small">
          LLM-powered, with an offline rule-based fallback — the surfaces that make Mira feel like a companion, not a dashboard.
        </Text>
        <TierTable rows={AMBITIOUS} />
      </Stack>

      <Stack gap={10}>
        <H2>Recommended shortlist &amp; build order</H2>
        <Text tone="secondary">
          Five, sequenced so each ships value on its own and the page never turns into a dashboard. Cheap-and-warm first,
          the companion differentiator last.
        </Text>
        <Table
          headers={["#", "Build", "Why now", "Where it lives"]}
          columnAlign={["center", "left", "left", "left"]}
          rows={ROADMAP.map((r) => [
            <Text as="span" weight="bold" style={{ color: theme.accent.primary }}>{r.n}</Text>,
            <Text as="span" weight="semibold">{r.build}</Text>,
            <Text as="span" tone="secondary">{r.why}</Text>,
            <Text as="span" tone="tertiary" size="small">{r.place}</Text>,
          ])}
        />
      </Stack>

      <Grid columns={2} gap={16} align="stretch">
        <Card>
          <CardHeader>Best fit for the calm / mirror brand</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text>
                Lean into ideas that feel like reflection, not analytics:{" "}
                <Text as="span" weight="semibold">On this day</Text>,{" "}
                <Text as="span" weight="semibold">Weekly recap</Text>,{" "}
                <Text as="span" weight="semibold">Emotion-word weather</Text>,{" "}
                <Text as="span" weight="semibold">Calendar heatmap</Text>, and the{" "}
                <Text as="span" weight="semibold">Reflect-with-Mira</Text> recap voiced by the mascot.
              </Text>
              <Divider />
              <Text tone="secondary" size="small">
                Each reinforces “the mirror — what your entries are quietly telling you,” and the droplet mascot is the
                natural narrator for the weekly and yearly recaps.
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Keep behind a “Reflect deeper” tap</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text>
                Heavier, chart-dense features —{" "}
                <Text as="span" weight="semibold">mood × theme correlation</Text>,{" "}
                <Text as="span" weight="semibold">time-of-day</Text>,{" "}
                <Text as="span" weight="semibold">mood donut</Text>,{" "}
                <Text as="span" weight="semibold">theme sparklines</Text> — belong on a secondary screen.
              </Text>
              <Divider />
              <Text tone="secondary" size="small">
                Correlation and pattern claims need confidence framing and gentle, non-prescriptive wording, and everything
                must degrade gracefully offline given the local-first, pluggable-LLM design.
              </Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Stack gap={6}>
        <H3>Sources</H3>
        <Grid columns={2} gap={4}>
          <Text tone="tertiary" size="small">
            [Daylio — activity/mood stats & correlations](https://daylio.net/faq/activity-and-mood-statistics/)
          </Text>
          <Text tone="tertiary" size="small">
            [Day One — features (On This Day, streaks)](https://dayoneapp.com/features/)
          </Text>
          <Text tone="tertiary" size="small">
            [Day One — Apple Intelligence: Go Deeper & Highlights](https://dayoneapp.com/releases/ios-26-liquid-glass-plus-apple-intelligence/)
          </Text>
          <Text tone="tertiary" size="small">
            [Apple — Journal app & reflection prompts](https://www.apple.com/newsroom/2023/12/apple-launches-journal-app-a-new-app-for-reflecting-on-everyday-moments/)
          </Text>
          <Text tone="tertiary" size="small">
            [Reflectly — mood correlations, weekly/monthly overviews](https://apps.apple.com/us/app/reflectly-journal-ai-diary/id1241229134)
          </Text>
          <Text tone="tertiary" size="small">
            [How We Feel — patterns & Calendar tab](https://howwefeel.substack.com/p/finding-the-patterns)
          </Text>
          <Text tone="tertiary" size="small">
            [Stoic — insights, trends, guided reflections](https://www.getstoic.com/features)
          </Text>
          <Text tone="tertiary" size="small">
            [Exist.io — mood correlations & “this day last year”](https://exist.io/about/mood/)
          </Text>
          <Text tone="tertiary" size="small">
            [Rosebud — long-term memory & weekly reports](https://www.rosebud.app/blog/ai-journaling-vs-traditional-journaling)
          </Text>
          <Text tone="tertiary" size="small">
            [Gratitude & weekly review — what the science says](https://www.simplypsychology.com/articles/journaling-for-mental-health)
          </Text>
          <Text tone="tertiary" size="small">
            [Affect labeling — “name it to tame it”](https://www.6seconds.org/2021/01/08/naming-emotions-affect-labeling-emotional-intelligence/)
          </Text>
          <Text tone="tertiary" size="small">
            [Affect labeling — timing & intensity (PMC)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9799301/)
          </Text>
        </Grid>
      </Stack>
    </Stack>
  );
}
