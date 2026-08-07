import {
  BarChart,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Grid,
  H2,
  H1,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useHostTheme,
} from "cursor/canvas";

// ---------- Readiness scorecard ----------
type Rating = "strong" | "partial" | "gap";

const SCORECARD: { dim: string; rating: Rating; gap: string }[] = [
  { dim: "Core UX & signature loop", rating: "strong", gap: "One-tap mood → conversation, offline AI, weekly reflection, charts, streaks — all shipped." },
  { dim: "Visual & interaction polish", rating: "strong", gap: "Brand, mascot, themes, researched completion moment. A real asset." },
  { dim: "Offline capability", rating: "strong", gap: "Rule-based engine works with zero setup; PWA precache. Rare strength." },
  { dim: "Data persistence & durability", rating: "gap", gap: "localStorage only. Clearing cache / reinstall / new device = total data loss." },
  { dim: "Accounts & identity", rating: "gap", gap: "No auth. Needed for sync + subscriptions." },
  { dim: "Cross-device sync & backup", rating: "gap", gap: "None. The 'what if I lose it' objection is wide open." },
  { dim: "Privacy & AI trust model", rating: "partial", gap: "Local-first edge, but BYO key sits in browser; no proxy; no privacy policy." },
  { dim: "Accessibility", rating: "partial", gap: "ARIA + focus present; no formal contrast / screen-reader audit." },
  { dim: "Testing / QA", rating: "gap", gap: "No test suite at all." },
  { dim: "Analytics & crash reporting", rating: "gap", gap: "No instrumentation — you'd launch blind on retention and crashes." },
  { dim: "Legal & compliance", rating: "gap", gap: "No privacy policy, App Privacy / Data-safety answers, or deletion path." },
  { dim: "Store packaging", rating: "gap", gap: "PWA-ready but no native shell, icons, screenshots, or listings." },
  { dim: "Monetization infrastructure", rating: "gap", gap: "No IAP, paywall, tiers, or entitlement logic." },
  { dim: "Native features for Apple 4.2", rating: "gap", gap: "No push, biometric lock, or haptics to avoid 'repackaged website'." },
];

function ratingLabel(r: Rating): string {
  return r === "strong" ? "Strong" : r === "partial" ? "Partial" : "Gap";
}

function RatingDot({ r }: { r: Rating }) {
  const t = useHostTheme();
  const color =
    r === "strong" ? t.accent.primary : r === "partial" ? t.text.secondary : t.text.quaternary;
  return (
    <Row gap={6} align="center">
      <span style={{ width: 7, height: 7, borderRadius: 4, background: color, display: "inline-block" }} />
      <Text as="span" tone={r === "strong" ? "primary" : "secondary"} weight={r === "gap" ? "semibold" : "normal"}>
        {ratingLabel(r)}
      </Text>
    </Row>
  );
}

const strongCount = SCORECARD.filter((s) => s.rating === "strong").length;
const partialCount = SCORECARD.filter((s) => s.rating === "partial").length;
const gapCount = SCORECARD.filter((s) => s.rating === "gap").length;

// ---------- Packaging options ----------
const PACKAGING: { opt: string; what: string; fit: string; rec?: boolean }[] = [
  { opt: "Capacitor", what: "Native shell hosts your dist/ in a WebView; native APIs via plugins. Keeps real Xcode/Android projects.", fit: "Best fit — reuses the whole codebase and adds exactly the native hooks 4.2 needs.", rec: true },
  { opt: "PWABuilder", what: "Wizard turns a PWA URL into store packages. Android via TWA, iOS via Capacitor under the hood.", fit: "A shortcut, but iOS still routes through Capacitor — own the Capacitor project directly." },
  { opt: "Trusted Web Activity", what: "Android-only: Chrome renders your PWA full-screen from Play.", fit: "Fine for Android alone, but no iOS path and fewer native hooks." },
];

// ---------- Roadmap ----------
const ROADMAP: { phase: string; goal: string; when: string; cost: string; tasks: string[] }[] = [
  {
    phase: "Phase 0 · Harden",
    goal: "Data won't be lost",
    when: "~1–2 wk",
    cost: "~$0",
    tasks: [
      "localStorage → IndexedDB + JSON export/import",
      "Error boundaries; analytics + crash reporting (free)",
      "Fully non-punitive streaks; a11y pass",
      "Publish privacy policy + terms",
    ],
  },
  {
    phase: "Phase 1 · Store MVP",
    goal: "It's a real native app",
    when: "~2–4 wk",
    cost: "$99 + $25",
    tasks: [
      "Capacitor wrap (iOS + Android)",
      "Push/reminders, biometric lock, haptics → clears 4.2",
      "Icons, splash, screenshots, ASO, privacy forms",
      "TestFlight / Play internal → submit (local-first)",
    ],
  },
  {
    phase: "Phase 2 · Monetize",
    goal: "It makes money",
    when: "~3–5 wk",
    cost: "free tiers",
    tasks: [
      "Supabase auth + encrypted sync/backup",
      "RevenueCat + IAP paywall, Free vs Plus, 7-day trial",
      "Hosted-AI proxy (Edge Fn → Gemini Flash-Lite)",
      "Ship 'Ask Mira' long-term memory (the #1 gap)",
    ],
  },
  {
    phase: "Phase 3 · Grow",
    goal: "It grows",
    when: "ongoing",
    cost: "~$0",
    tasks: [
      "Product Hunt + Reddit + short-form content",
      "ASO iteration; share / referral",
      "D1/D7/D30 retention experiments; widget",
      "Small paid UA test only after D30 proven",
    ],
  },
];

// ---------- Monetization: free vs plus ----------
type Tier = "both" | "plus";
const FEATURES: { name: string; tier: Tier }[] = [
  { name: "One-tap mood → conversation", tier: "both" },
  { name: "Offline AI follow-ups + BYO key", tier: "both" },
  { name: "Basic weekly reflection, charts, streaks", tier: "both" },
  { name: "Local export / import (data safety)", tier: "both" },
  { name: "Cloud sync + encrypted backup (multi-device)", tier: "plus" },
  { name: "Hosted AI — smart replies, no key needed", tier: "plus" },
  { name: "Long-term memory / “Ask Mira”", tier: "plus" },
  { name: "Voice transcription, richer weekly insight", tier: "plus" },
  { name: "Extra app icons / themes", tier: "plus" },
];

function TierCell({ on }: { on: boolean }) {
  const t = useHostTheme();
  return on ? (
    <Text as="span" weight="semibold" style={{ color: t.accent.primary }}>✓</Text>
  ) : (
    <Text as="span" tone="quaternary">—</Text>
  );
}

const BENCHMARKS: { app: string; price: string; note: string; you?: boolean }[] = [
  { app: "Mira Plus (you)", price: "$4.99/mo · $39.99/yr · $99.99 lifetime", note: "7-day trial; core free forever", you: true },
  { app: "Rosebud", price: "~$13/mo", note: "AI is the whole product" },
  { app: "Mindsera", price: "~$15/mo", note: "AI-first" },
  { app: "Day One", price: "$49.99–74.99/yr", note: "AI only in $74.99 Gold; annual only" },
  { app: "Stoic", price: "$39.99/yr · +AI $99.99/yr", note: "Lifetime $199.99" },
  { app: "Reflectly", price: "~$59.99/yr / $9.99/mo", note: "—" },
  { app: "Daylio", price: "~$35.99/yr / $4.99/mo", note: "No AI; ads on free" },
];

// ---------- Budget ----------
const BUDGET: { item: string; cost: string; recurring: string; total?: boolean }[] = [
  { item: "Apple Developer Program", cost: "$99", recurring: "Yearly" },
  { item: "Google Play Developer", cost: "$25", recurring: "One-time" },
  { item: "Domain (landing + privacy + deletion URL)", cost: "~$12", recurring: "Yearly (optional)" },
  { item: "Backend — Supabase / Firebase free tier", cost: "$0", recurring: "—" },
  { item: "LLM — offline engine + BYO key", cost: "$0", recurring: "—" },
  { item: "Analytics + crash reporting (free)", cost: "$0", recurring: "—" },
  { item: "Landing page hosting (Pages / Vercel / Netlify)", cost: "$0", recurring: "—" },
  { item: "Icons, screenshots, ASO, privacy policy (DIY)", cost: "$0", recurring: "—" },
  { item: "Minimum to launch (year 1)", cost: "≈ $124–136", recurring: "≈ $111/yr after", total: true },
];

const LEVERAGE: { item: string; cost: string; why: string }[] = [
  { item: "Premium .app domain", cost: "~$15–20/yr", why: "Trust + brand." },
  { item: "RevenueCat", cost: "$0 → paid past $2.5k/mo", why: "Cross-platform IAP, no billing build." },
  { item: "Hosted AI (Gemini PAYG)", cost: "~$5–30/mo", why: "Only when Plus users exist; revenue-covered." },
  { item: "Supabase Pro", cost: "$25/mo", why: "When free-tier pausing / limits bite." },
  { item: "Screenshot / ASO tooling or designer pass", cost: "~$50–150 once", why: "Sharper store conversion." },
  { item: "Apple Search Ads test", cost: "~$100–300 once", why: "Only after D30 retention proven." },
];

// ---------- GTM ----------
const GTM: { channel: string; tactics: string; spend: string }[] = [
  { channel: "ASO (do first)", tactics: "Keywords: journal, AI journal, private journal, mood tracker. Screenshots lead with the one-tap → conversation moment.", spend: "$0" },
  { channel: "Community", tactics: "Value-first posts in r/Journaling, r/selfimprovement, r/getdisciplined, r/privacy; Indie Hackers; build-in-public on X/Threads.", spend: "$0" },
  { channel: "Launch", tactics: "Product Hunt launch + a free landing page doubling as privacy policy + account-deletion URL + waitlist.", spend: "$0" },
  { channel: "Short-form content", tactics: "TikTok / IG Reels / YouTube Shorts demoing the 'journal that talks back' moment.", spend: "$0" },
  { channel: "Paid UA", tactics: "Not worth it early. Small Apple Search Ads test only after D7/D30 retention is proven.", spend: "later" },
];

export default function MiraLaunchMonetizationStrategy() {
  const theme = useHostTheme();

  return (
    <Stack gap={22} style={{ padding: 24, maxWidth: 1060 }}>
      <Stack gap={4}>
        <H1>Mira — launch & monetization strategy</H1>
        <Text tone="tertiary" size="small">
          From polished single-device prototype → money-making app on the App Store & Google Play, at minimum spend.
          Sources: Capacitor, Apple/Google store docs, Supabase/Firebase, Gemini pricing, Day One & journaling-app pricing · compiled Aug 2026
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="≈ $124–136" label="Minimum to launch (year 1)" tone="success" />
        <Stat value="$4.99/mo" label="Mira Plus — $39.99/yr · $99.99 lifetime" />
        <Stat value="15%" label="Store commission (Small Business Program)" />
        <Stat value="Late-stage prototype" label="Current product stage" tone="warning" />
      </Grid>

      <Callout tone="warning" title="Honest stage: a beautiful prototype, not a shippable product">
        The signature loop — tap a mood, it instantly becomes a gentle conversation — works, looks great, and runs
        offline. But it's a <Text as="span" weight="semibold">single-device web app</Text>: all data lives in one
        localStorage key (clearing cache or reinstalling loses everything), with no accounts, sync, backup, legal,
        analytics, or store packaging. The gap to launch isn't features — it's{" "}
        <Text as="span" weight="semibold">durability, trust, and packaging</Text>.
      </Callout>

      {/* Readiness scorecard */}
      <Stack gap={8}>
        <H2>Product readiness scorecard</H2>
        <Grid columns="1fr 2fr" gap={20} align="start">
          <Stack gap={8}>
            <BarChart
              categories={["Strong", "Partial", "Gap"]}
              series={[{ name: "Dimensions", data: [strongCount, partialCount, gapCount] }]}
              height={190}
              showValues
              style={{ marginTop: 4 }}
            />
            <Text tone="tertiary" size="small">
              14 launch dimensions by readiness. Source: repo read, Aug 2026. Strong = launch-ready · Partial = shallow/at-risk · Gap = blocking.
            </Text>
          </Stack>
          <Table
            headers={["Dimension", "Rating", "The gap today"]}
            columnAlign={["left", "left", "left"]}
            rowTone={SCORECARD.map((s) => (s.rating === "gap" ? "danger" : s.rating === "partial" ? "warning" : "success"))}
            rows={SCORECARD.map((s) => [
              <Text as="span" weight="medium">{s.dim}</Text>,
              <RatingDot r={s.rating} />,
              <Text as="span" tone="secondary" size="small">{s.gap}</Text>,
            ])}
          />
        </Grid>
      </Stack>

      {/* Packaging */}
      <Stack gap={8}>
        <H2>Leanest path to the stores — wrap, don't rebuild</H2>
        <Text tone="secondary" size="small">
          Mira is already a Vite/React PWA, so reuse the exact web build inside a native shell.
        </Text>
        <Table
          headers={["Option", "What it is", "Fit for Mira"]}
          columnAlign={["left", "left", "left"]}
          rowTone={PACKAGING.map((p) => (p.rec ? "success" : undefined))}
          rows={PACKAGING.map((p) => [
            <Row gap={6} align="center">
              <Text as="span" weight="semibold">{p.opt}</Text>
              {p.rec && <Pill size="sm" active>Recommended</Pill>}
            </Row>,
            <Text as="span" tone="secondary">{p.what}</Text>,
            <Text as="span" tone="secondary">{p.fit}</Text>,
          ])}
        />
        <Callout tone="danger" title="The Apple 4.2 trap — and how to dodge it">
          Apple rejects apps that are "just a repackaged website." Ship 3+ genuine native features and{" "}
          <Text as="span" weight="semibold">list them in the review notes</Text>: (1) local + push{" "}
          <Text as="span" weight="semibold">reminders</Text>, (2) <Text as="span" weight="semibold">biometric lock</Text>{" "}
          (Face ID / Touch ID — on-brand for a private journal), (3) <Text as="span" weight="semibold">haptics + safe-area</Text>.
          Mira already has offline + native-feeling tab nav, so this clears the bar comfortably.
        </Callout>
      </Stack>

      {/* Roadmap */}
      <Stack gap={12}>
        <H2>Phased roadmap</H2>
        <Grid columns={4} gap={16} align="stretch">
          <PhaseCard {...ROADMAP[0]} />
          <PhaseCard {...ROADMAP[1]} />
          <PhaseCard {...ROADMAP[2]} />
          <PhaseCard {...ROADMAP[3]} />
        </Grid>
      </Stack>

      {/* Monetization */}
      <Stack gap={12}>
        <H2>Monetization — freemium, "Mira Plus"</H2>
        <Grid columns={4} gap={16}>
          <Stat value="$4.99" label="Per month" />
          <Stat value="$39.99" label="Per year — hero plan (~33% off)" tone="success" />
          <Stat value="$99.99" label="Lifetime" />
          <Stat value="7 days" label="Free trial (annual)" tone="info" />
        </Grid>
        <Grid columns="3fr 2fr" gap={20} align="start">
          <Stack gap={8}>
            <H3Like>What's free vs Plus</H3Like>
            <Table
              headers={["Capability", "Free", "Plus"]}
              columnAlign={["left", "center", "center"]}
              rows={FEATURES.map((f) => [
                <Text as="span" weight="medium">{f.name}</Text>,
                <TierCell on={f.tier === "both"} />,
                <TierCell on={true} />,
              ])}
            />
            <Text tone="tertiary" size="small">
              Never paywall basic writing (caused a 60% drop-off in the competitive analysis). Gate depth + peace-of-mind, not the act of writing.
            </Text>
          </Stack>
          <Stack gap={8}>
            <H3Like>Priced under the AI incumbents</H3Like>
            <Table
              headers={["App", "Price", "Note"]}
              columnAlign={["left", "left", "left"]}
              rowTone={BENCHMARKS.map((b) => (b.you ? "info" : undefined))}
              rows={BENCHMARKS.map((b) => [
                <Text as="span" weight={b.you ? "bold" : "medium"}>{b.app}</Text>,
                <Text as="span" tone="secondary" size="small">{b.price}</Text>,
                <Text as="span" tone="tertiary" size="small">{b.note}</Text>,
              ])}
            />
          </Stack>
        </Grid>
      </Stack>

      {/* Budget */}
      <Stack gap={12}>
        <H2>Lean budget — minimum spend, maximum output</H2>
        <Grid columns="3fr 2fr" gap={20} align="start">
          <Stack gap={8}>
            <H3Like>Minimum to launch (do this)</H3Like>
            <Table
              headers={["Item", "Cost", "Recurring?"]}
              columnAlign={["left", "right", "left"]}
              rowTone={BUDGET.map((b) => (b.total ? "success" : undefined))}
              rows={BUDGET.map((b) => [
                <Text as="span" weight={b.total ? "bold" : "medium"}>{b.item}</Text>,
                <Text as="span" weight={b.total ? "bold" : "normal"} style={b.total ? { color: theme.accent.primary } : undefined}>{b.cost}</Text>,
                <Text as="span" tone="secondary" size="small">{b.recurring}</Text>,
              ])}
            />
          </Stack>
          <Stack gap={8}>
            <H3Like>Spend-a-bit-more for leverage (only when revenue justifies)</H3Like>
            <Table
              headers={["Item", "Cost", "Why"]}
              columnAlign={["left", "left", "left"]}
              rows={LEVERAGE.map((l) => [
                <Text as="span" weight="medium">{l.item}</Text>,
                <Text as="span" tone="secondary" size="small">{l.cost}</Text>,
                <Text as="span" tone="tertiary" size="small">{l.why}</Text>,
              ])}
            />
          </Stack>
        </Grid>
        <Callout tone="success" title="Bottom line">
          You can be live on both stores for <Text as="span" weight="semibold">~$124–136</Text>, with{" "}
          <Text as="span" weight="semibold">zero</Text> ongoing infra or AI cost until paying users arrive to cover it.
        </Callout>
      </Stack>

      {/* GTM */}
      <Stack gap={8}>
        <H2>Go-to-market on ~$0</H2>
        <Table
          headers={["Channel", "Tactics", "Spend"]}
          columnAlign={["left", "left", "center"]}
          rows={GTM.map((g) => [
            <Text as="span" weight="semibold">{g.channel}</Text>,
            <Text as="span" tone="secondary" size="small">{g.tactics}</Text>,
            g.spend === "$0"
              ? <Text as="span" weight="semibold" style={{ color: theme.accent.primary }}>$0</Text>
              : <Text as="span" tone="tertiary">{g.spend}</Text>,
          ])}
        />
      </Stack>

      <Callout tone="info" title="The wedge to win on">
        Every feature already exists elsewhere, so win on positioning: <Text as="span" weight="semibold">"the private
        journal that talks back, in one tap, and never leaves your phone."</Text> Ship long-term memory — the single
        real gap vs. Rosebud and Day One — and the pitch has no direct competitor.
      </Callout>
    </Stack>
  );
}

// A single roadmap phase. Tasks are rendered explicitly (fixed 4) to avoid list keys.
function PhaseCard({
  phase,
  goal,
  when,
  cost,
  tasks,
}: {
  phase: string;
  goal: string;
  when: string;
  cost: string;
  tasks: string[];
}) {
  const theme = useHostTheme();
  return (
    <Card>
      <CardHeader trailing={<Text as="span" size="small" tone="tertiary">{when}</Text>}>{phase}</CardHeader>
      <CardBody>
        <Stack gap={8}>
          <Row gap={6} align="center">
            <Text as="span" weight="semibold" style={{ color: theme.accent.primary }}>{goal}</Text>
            <Pill size="sm">{cost}</Pill>
          </Row>
          <Divider />
          <Stack gap={6}>
            {tasks[0] && <Text as="span" tone="secondary" size="small">{tasks[0]}</Text>}
            {tasks[1] && <Text as="span" tone="secondary" size="small">{tasks[1]}</Text>}
            {tasks[2] && <Text as="span" tone="secondary" size="small">{tasks[2]}</Text>}
            {tasks[3] && <Text as="span" tone="secondary" size="small">{tasks[3]}</Text>}
          </Stack>
        </Stack>
      </CardBody>
    </Card>
  );
}

// Small heading used inside two-column grids.
function H3Like({ children }: { children: string }) {
  return (
    <Text as="span" weight="semibold" size="small" tone="tertiary" style={{ textTransform: "uppercase", letterSpacing: 0.4 }}>
      {children}
    </Text>
  );
}
