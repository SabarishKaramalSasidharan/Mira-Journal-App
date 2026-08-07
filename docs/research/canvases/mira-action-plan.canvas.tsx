import { useState, type CSSProperties } from "react";
import {
  BarChart,
  Callout,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
  Divider,
  Grid,
  H1,
  H2,
  H3,
  Pill,
  Row,
  Stack,
  Stat,
  Table,
  Text,
  useCanvasState,
  useHostTheme,
} from "cursor/canvas";

// Mira brand teal (from the brand-color strategy doc): light vs dark token.
function useTeal(): string {
  const t = useHostTheme();
  return t.kind === "light" ? "#0e9e8c" : "#2dd4bf";
}

// Status colors for the 🟢/🟡/🔴 legend, tuned for light vs dark legibility.
function useStatusColors(): { green: string; amber: string; red: string } {
  const t = useHostTheme();
  return t.kind === "light"
    ? { green: "#2f8f5b", amber: "#b7791f", red: "#c0492f" }
    : { green: "#5bba82", amber: "#e0a94a", red: "#e8846b" };
}

// Small solid status dot used in the "where we are today" chips.
function Dot({ color }: { color: string }) {
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 8,
        borderRadius: "50%",
        background: color,
        flexShrink: 0,
      }}
    />
  );
}

// A single scannable status chip (dot + label) for built / gap columns.
function StatusChip({ color, label }: { color: string; label: string }) {
  const t = useHostTheme();
  return (
    <Row gap={8} align="center">
      <Dot color={color} />
      <Text as="span" size="small" style={{ color: t.text.secondary }}>
        {label}
      </Text>
    </Row>
  );
}

type Phase = {
  n: number;
  name: string;
  goal: string;
  steps: string[];
  doneWhen: string;
  time: string;
  cost: string;
  costHot?: boolean; // the one phase with real spend
};

const PHASES: Phase[] = [
  {
    n: 1,
    name: "Finalize the open UX & polish",
    goal: "Lock every “still deciding” toggle so Mira feels like one confident, coherent app — not a lab.",
    steps: [
      "Pick the feeling entry point — conversational (B) vs moodstep (C) vs keeping pill (A); make one the single default.",
      "Lock the mood selector — commit to Hybrid mascot-face 1–5 + optional emotion tag; retire the weather-scale A/B.",
      "Decide the Labs toggle’s fate — remove it from Settings or keep it hidden.",
      "Quick accessibility pass — WCAG AA contrast, tab order, screen-reader labels on faces/chips.",
      "Final polish sweep — empty states, error copy, the completion moment, dark-mode edge cases.",
    ],
    doneWhen: "No user-visible “variant” choices remain; a first-time user gets one clear, polished flow.",
    time: "~3–5 days",
    cost: "$0",
  },
  {
    n: 2,
    name: "Make it trustworthy & measurable",
    goal: "Be able to see what’s happening (retention, crashes) and satisfy the legal requirements both stores demand — all on free tiers.",
    steps: [
      "Add privacy-friendly analytics (PostHog / Firebase free) — install, first entry, D1/D7/D30, paywall view, purchase. No PII.",
      "Add crash/error visibility (Crashlytics or Sentry free) + a React error boundary.",
      "Write a privacy policy + terms (free generator); host free on GitHub Pages — you’ll need this URL for store listings.",
      "Prepare the store privacy answers — draft Apple App Privacy + Google Data safety forms now.",
    ],
    doneWhen: "You can watch a live installs/retention dashboard, crashes report to you, and privacy policy + terms are on a public URL.",
    time: "~3–5 days",
    cost: "$0",
  },
  {
    n: 3,
    name: "Package as real apps (Capacitor)",
    goal: "Turn the existing web build into genuine iOS + Android apps you can submit — reusing this exact codebase, not rewriting.",
    steps: [
      "Add Capacitor — npm i @capacitor/core @capacitor/cli, cap init, cap add ios/android; point at Vite dist/.",
      "Add 3 native features for Apple 4.2 — local/push notifications, biometric unlock (Face ID/Touch ID), haptics + safe-area. List them in review notes.",
      "Pay the store fees — Apple Developer Program ($99/yr) + Google Play Console ($25 one-time).",
      "Create store assets (DIY, free) — icon, screenshots leading with one-tap→conversation, ASO keywords.",
      "Build & test on device — cap sync, open in Xcode / Android Studio, run on a real phone.",
    ],
    doneWhen: "Signed iOS and Android builds run on real devices and are ready to upload.",
    time: "~1–2 weeks",
    cost: "~$124–136",
    costHot: true,
  },
  {
    n: 4,
    name: "Wire monetization (the paywall)",
    goal: "Be able to take money — free-forever core, Plus unlocks depth, with a paywall that appears at the depth moment, never on writing.",
    steps: [
      "Set up billing — RevenueCat (free < $2.5k/mo) over StoreKit + Play Billing; it handles receipts, entitlements, trials.",
      "Create products — Monthly $4.99, Annual $39.99 (14-day trial, hero), Lifetime $99.99; map in RevenueCat.",
      "Gate depth, not writing — keep capture/offline follow-ups/charts free; Plus = sync, hosted AI, long-term memory, richer insight.",
      "Place the paywall at the depth moment (sync / “Ask Mira”) — paywalling writing caused a 60% drop-off in research.",
      "Add accounts + cloud sync (Supabase, free) + ship in-app AND public web account-deletion the day you add auth.",
      "Enroll in Apple’s Small Business Program for the 15% commission tier.",
    ],
    doneWhen: "A test user can start a trial, “buy” Plus in a sandbox, unlock gated features; entitlements persist across reinstall.",
    time: "~1–2 weeks",
    cost: "$0",
  },
  {
    n: 5,
    name: "Control LLM cost for production",
    goal: "Make sure hosted AI for Plus users stays in cents per user, protecting the ~80% margin.",
    steps: [
      "Proxy hosted AI through a backend (Supabase Edge Function → Gemini Flash-Lite) so the server key is never in the client.",
      "Keep it text-first and capped — ~120–150 output tokens; reserve voice/call mode for a later, clearly-costed add-on.",
      "Add per-user caps — a soft monthly ceiling to stop runaway cost from one heavy user.",
      "Keep free users free to you — free tier stays on the offline engine or BYO key ($0 to you).",
    ],
    doneWhen: "Plus AI runs server-side with a cap; a heavy user’s modeled cost is single-digit cents/month (est.) — well under a $4.99 sub.",
    time: "~2–3 days",
    cost: "$0 now",
  },
  {
    n: 6,
    name: "Soft launch (test before the world sees it)",
    goal: "Find the embarrassing bugs and confusing moments with a small, friendly group before the public launch.",
    steps: [
      "Ship to TestFlight (iOS) + Play internal testing (Android).",
      "Recruit ~10–30 testers — friends, r/Journaling, build-in-public followers.",
      "Watch the analytics — where do people drop off? Does the trial start? Any crashes?",
      "Fix the top issues and confirm purchase/trial/restore works end-to-end on real accounts.",
    ],
    doneWhen: "Testers complete a full loop (write → reflect → paywall → trial) with no blocking bugs; you’ve fixed the top 3–5 pieces of feedback.",
    time: "~1–2 weeks",
    cost: "$0",
  },
  {
    n: 7,
    name: "Public launch → first revenue → break-even",
    goal: "Go live, get the first paying customers, and cross break-even (~16–20 subs) — all on $0 paid acquisition.",
    steps: [
      "Submit to both stores with completed App Privacy / Data-safety forms and the native features noted for Apple 4.2.",
      "Launch organically — Product Hunt, value-first r/Journaling / r/selfimprovement / r/privacy posts, short-form demos, build-in-public.",
      "Lead with the $99.99 lifetime as a launch cash accelerator (a lifetime user costs only ~$3/yr to serve).",
      "Track toward break-even — watch paying subs climb to ~16–20 (covers ~$40/mo infra).",
      "Iterate on retention (D1/D7/D30) and ASO; consider a small Apple Search Ads test only after D30 retention is proven.",
    ],
    doneWhen: "The app is live on both stores, you have your first paying subscribers, and paying subs ≥ ~16–20 → break-even.",
    time: "ongoing",
    cost: "$0 paid",
  },
];

// ---- Money map data ----
const PRICING: { plan: string; price: string; note: string; hero?: boolean }[] = [
  { plan: "Monthly", price: "$4.99/mo", note: "Entry point." },
  { plan: "Annual", price: "$39.99/yr", note: "14-day free trial · ~60% under Rosebud/Mindsera.", hero: true },
  { plan: "Lifetime", price: "$99.99 once", note: "Launch cash accelerator · ~$3/yr to serve." },
];

const MILESTONES: { subs: string; profit: string; milestone: string; tone?: "success" }[] = [
  { subs: "~20", profit: "~$5/mo", milestone: "Break-even — costs covered", tone: "success" },
  { subs: "100", profit: "~$165/mo", milestone: "Self-sustaining hobby" },
  { subs: "500", profit: "~$960/mo", milestone: "Meaningful side income" },
  { subs: "1,000", profit: "~$1,900/mo", milestone: "Serious side business" },
  { subs: "3,000", profit: "~$6,050/mo (~$72K/yr)", milestone: "Indie full-time viable" },
];

const MILESTONE_SUBS = ["~20", "100", "500", "1,000", "3,000"];
const MILESTONE_PROFIT = [5, 165, 960, 1900, 6050];

const BUDGET: { item: string; cost: string; recurring: string; tone?: "warning" }[] = [
  { item: "Apple Developer Program", cost: "$99", recurring: "Yearly", tone: "warning" },
  { item: "Google Play Console", cost: "$25", recurring: "One-time", tone: "warning" },
  { item: "Domain (landing + privacy + deletion URL)", cost: "~$12", recurring: "Yearly · optional" },
  { item: "Backend / billing / LLM / analytics (free tiers)", cost: "$0", recurring: "—" },
];

const QUICKSTART: { id: string; label: string; phase: string }[] = [
  { id: "q1", label: "Pick the feeling entry point (B vs C vs A) and make it the single default.", phase: "Phase 1" },
  { id: "q2", label: "Lock the mood selector and hide/remove the Labs toggle.", phase: "Phase 1" },
  { id: "q3", label: "Run a quick accessibility pass (contrast, labels, tab order).", phase: "Phase 1" },
  { id: "q4", label: "Add free analytics (PostHog/Firebase) — track install, first entry, D1/D7.", phase: "Phase 2" },
  { id: "q5", label: "Add crash reporting + an error boundary.", phase: "Phase 2" },
  { id: "q6", label: "Publish a privacy policy + terms on a free URL.", phase: "Phase 2" },
  { id: "q7", label: "Enroll in Apple ($99) + Google ($25) accounts — they take time to approve, start now.", phase: "Phase 3" },
  { id: "q8", label: "Add Capacitor and get the app running on your own phone.", phase: "Phase 3" },
];

const RISKS: { risk: string; derisk: string }[] = [
  {
    risk: "Apple 4.2 rejection (wrapped web app)",
    derisk: "Ship 3+ native features (push, biometric lock, haptics), native-feeling nav; list them in review notes. (Phase 3)",
  },
  {
    risk: "Nobody converts",
    derisk: "Gate depth (sync, memory, hosted AI) not writing; surface the 14-day trial at the depth moment; lead with lifetime.",
  },
  {
    risk: "AI cost creep",
    derisk: "Text-only, capped tokens, Flash-Lite, per-user caps, server-side proxy; free tier stays offline/BYO. (Phase 5)",
  },
  {
    risk: "Store compliance blocks you",
    derisk: "Privacy policy + data-safety answers early; in-app AND web account-deletion the day you add auth. (Phase 2/4)",
  },
  {
    risk: "Launch blind / solo burnout",
    derisk: "Analytics + crashes before launch; follow phases in order; ship the smallest thing that can charge.",
  },
];

function PhaseCard({
  phase,
  open,
  onToggle,
}: {
  phase: Phase;
  open: boolean;
  onToggle: () => void;
}) {
  const t = useHostTheme();
  const teal = useTeal();

  const badgeStyle: CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: 30,
    height: 30,
    borderRadius: "50%",
    border: `1.5px solid ${teal}`,
    color: teal,
    fontSize: 14,
    fontWeight: 600,
    flexShrink: 0,
  };

  const cardStyle: CSSProperties = {
    border: `1px solid ${t.stroke.tertiary}`,
    borderRadius: 10,
    padding: 14,
    cursor: "pointer",
    background: open ? t.fill.quaternary : "transparent",
    flex: 1,
  };

  return (
    <Row gap={12} align="stretch">
      <Stack gap={0} style={{ alignItems: "center" }}>
        <div style={badgeStyle}>{phase.n}</div>
        {phase.n < PHASES.length ? (
          <div style={{ flex: 1, width: 1.5, background: t.stroke.tertiary, marginTop: 2 }} />
        ) : null}
      </Stack>

      <div style={cardStyle} onClick={onToggle}>
        <Stack gap={8}>
          <Row gap={10} align="center" justify="space-between">
            <Text as="span" weight="semibold" style={{ fontSize: 15 }}>
              {phase.name}
            </Text>
            <Row gap={6} align="center">
              <Pill size="sm">{phase.time}</Pill>
              <Pill size="sm">
                <span style={phase.costHot ? { color: teal, fontWeight: 600 } : undefined}>{phase.cost}</span>
              </Pill>
              <Text as="span" size="small" tone="tertiary" style={{ color: teal }}>
                {open ? "− hide" : "+ steps"}
              </Text>
            </Row>
          </Row>

          <Text size="small" tone="secondary">
            {phase.goal}
          </Text>

          {open ? (
            <Stack gap={10} style={{ marginTop: 2 }}>
              <Divider />
              <Stack gap={6}>
                {phase.steps.map((s, i) => (
                  <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span
                      style={{
                        color: teal,
                        fontSize: 13,
                        lineHeight: "18px",
                        flexShrink: 0,
                        fontWeight: 600,
                      }}
                    >
                      {i + 1}.
                    </span>
                    <Text as="span" size="small" tone="secondary">
                      {s}
                    </Text>
                  </div>
                ))}
              </Stack>
              <Row gap={8} align="start">
                <Text as="span" size="small" weight="semibold" style={{ color: teal, flexShrink: 0 }}>
                  Done when
                </Text>
                <Text as="span" size="small">
                  {phase.doneWhen}
                </Text>
              </Row>
            </Stack>
          ) : null}
        </Stack>
      </div>
    </Row>
  );
}

export default function MiraActionPlan() {
  const teal = useTeal();
  const status = useStatusColors();

  const [openMap, setOpenMap] = useState<Record<number, boolean>>({ 1: true });
  const [checks, setChecks] = useCanvasState<Record<string, boolean>>("quickstart-checks", {});

  const setAll = (val: boolean) => {
    const next: Record<number, boolean> = {};
    for (const p of PHASES) next[p.n] = val;
    setOpenMap(next);
  };

  const built: string[] = [
    "Conversational capture (one-tap mood → gentle chat, type or voice)",
    "Mood + emotion selection (Hybrid mascot-face 1–5 + tag)",
    "AI follow-ups + weekly insight (BYO key, offline fallback)",
    "Reflect page (mood trend + theme charts, no deps)",
    "Journal timeline (search, filters, entry detail)",
    "Streaks (non-punitive 7-day strip + milestones)",
    "Data durability (IndexedDB + export/import backup)",
    "App lock (hashed PIN, SHA-256 + salt)",
    "Polish (splash, themes, mascot, micro-interactions)",
    "PWA — installable, live on GitHub Pages",
  ];

  const gaps: string[] = [
    "No native app — payments & store discovery need Capacitor",
    "No payments / paywall — nothing to charge for yet",
    "No analytics / crash visibility — you’d launch blind",
    "No legal (privacy policy / terms) — a hard store blocker",
    "No production LLM strategy — needs server key + per-user caps",
    "No accounts / cloud sync — the headline Plus value",
  ];

  const deciding: string[] = [
    "Feeling entry point — 3 variants shipped, one needs to win",
    "Mood selector — Hybrid shipped, lock the weather-scale A/B",
    "Accessibility — ARIA/focus exist, no formal AA pass yet",
  ];

  return (
    <Stack gap={22} style={{ padding: 24, maxWidth: 1080 }}>
      <Stack gap={6}>
        <H1>Mira — Action Plan: from here to first paying customers</H1>
        <Text tone="secondary">
          <Text as="span" weight="semibold" style={{ color: teal }}>
            North star:
          </Text>{" "}
          get Mira from “polished web app” to “live on both stores, taking money, and past break-even” — with
          minimum spend, maximum output. Break-even is only{" "}
          <Text as="span" weight="semibold">~15–20 paying subscribers</Text>.
        </Text>
        <Text tone="tertiary" size="small">
          Source: docs/research/action-plan.md (mirrors launch-monetization-strategy.md + competitor-monetization.md).
          Pricing, unit-economics & break-even reused, not re-derived. Projections marked (est.).
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="7 phases" label="Finalize UX → public launch" />
        <Stat value="≈ $124–136" label="Total spend to get live (year 1)" tone="info" />
        <Stat value="~15–20 subs" label="Break-even — covers ~$40/mo infra" tone="success" />
        <Stat value="~6–10 weeks" label="To first revenue, solo (est.)" />
      </Grid>

      {/* ---- Where we are today ---- */}
      <Stack gap={10}>
        <Row gap={16} align="center" wrap>
          <H2 style={{ margin: 0 }}>Where we are today</H2>
          <Row gap={12} align="center" wrap>
            <StatusChip color={status.green} label="built & solid" />
            <StatusChip color={status.amber} label="being decided" />
            <StatusChip color={status.red} label="gap to money" />
          </Row>
        </Row>
        <Text tone="secondary" size="small">
          You’re not missing features — you’re missing{" "}
          <Text as="span" weight="semibold">packaging, trust, and a way to charge</Text>. That’s the whole job below.
        </Text>

        <Grid columns="1fr 1fr" gap={16} align="stretch">
          <Card>
            <CardHeader trailing={<Text as="span" size="small" style={{ color: status.green }}>10 shipped</Text>}>
              What’s built — the product is real
            </CardHeader>
            <CardBody>
              <Stack gap={7}>
                {built.map((b, i) => (
                  <div key={i}>
                    <StatusChip color={status.green} label={b} />
                  </div>
                ))}
              </Stack>
            </CardBody>
          </Card>

          <Stack gap={16}>
            <Card>
              <CardHeader trailing={<Text as="span" size="small" style={{ color: status.red }}>6 gaps</Text>}>
                The gaps between you and paying customers
              </CardHeader>
              <CardBody>
                <Stack gap={7}>
                  {gaps.map((g, i) => (
                    <div key={i}>
                      <StatusChip color={status.red} label={g} />
                    </div>
                  ))}
                </Stack>
              </CardBody>
            </Card>
            <Card>
              <CardHeader>Still being decided</CardHeader>
              <CardBody>
                <Stack gap={7}>
                  {deciding.map((d, i) => (
                    <div key={i}>
                      <StatusChip color={status.amber} label={d} />
                    </div>
                  ))}
                </Stack>
              </CardBody>
            </Card>
          </Stack>
        </Grid>
      </Stack>

      <Divider />

      {/* ---- The 7 phases ---- */}
      <Stack gap={12}>
        <Row gap={10} align="center" justify="space-between">
          <H2 style={{ margin: 0 }}>The phased plan</H2>
          <Row gap={6} align="center">
            <Pill size="sm" onClick={() => setAll(true)}>expand all</Pill>
            <Pill size="sm" onClick={() => setAll(false)}>collapse all</Pill>
          </Row>
        </Row>
        <Text tone="secondary" size="small">
          Seven phases, sequenced so you can do them in order and check them off. Only{" "}
          <Text as="span" weight="semibold" style={{ color: teal }}>Phase 3</Text> costs real money; everything else
          runs on free tiers. Tap a phase to show its steps.
        </Text>
        <Stack gap={10}>
          {PHASES.map((p) => (
            <div key={p.n}>
              <PhaseCard
                phase={p}
                open={!!openMap[p.n]}
                onToggle={() => setOpenMap((m) => ({ ...m, [p.n]: !m[p.n] }))}
              />
            </div>
          ))}
        </Stack>
      </Stack>

      <Divider />

      {/* ---- Money map ---- */}
      <Stack gap={12}>
        <H2 style={{ margin: 0 }}>Money map</H2>

        <Grid columns={3} gap={16} align="stretch">
          {PRICING.map((pl) => (
            <div key={pl.plan}>
              <Card>
                <CardHeader trailing={pl.hero ? <Pill size="sm">hero</Pill> : undefined}>
                  Mira Plus — {pl.plan}
                </CardHeader>
                <CardBody>
                  <Stack gap={6}>
                    <Text as="span" weight="semibold" style={{ color: teal, fontSize: 18 }}>
                      {pl.price}
                    </Text>
                    <Text size="small" tone="secondary">
                      {pl.note}
                    </Text>
                  </Stack>
                </CardBody>
              </Card>
            </div>
          ))}
        </Grid>

        <Callout tone="success" title="~80% margin, break-even at ~15–20 subs">
          <Text size="small">
            With the 15% store cut and text-only Flash-Lite AI, each subscriber nets{" "}
            <Text as="span" weight="semibold">~$3.99/mo</Text> or <Text as="span" weight="semibold">~$31/yr</Text> at
            roughly <Text as="span" weight="semibold" style={{ color: teal }}>~80% margin</Text> — Mira’s marginal AI
            cost is cents, not dollars. Fixed cost year 1 ≈ $136; ongoing infra ~$40/mo. Break-even: ~$40/mo ÷ ~$2.6
            net per annual sub ≈ <Text as="span" weight="semibold">~16 subscribers</Text> covers everything. Call it
            ~15–20.
          </Text>
        </Callout>

        <Grid columns="1fr 1fr" gap={16} align="stretch">
          <Stack gap={6}>
            <H3>Est. monthly profit by paying-subscriber count (USD)</H3>
            <BarChart
              categories={MILESTONE_SUBS}
              series={[{ name: "Est. monthly profit (USD)", data: MILESTONE_PROFIT, tone: "success" }]}
              valuePrefix="$"
              height={230}
            />
            <Text tone="tertiary" size="small">
              Est. · blended ~$27/payer/yr (mix of monthly/annual/lifetime), minus AI + ~$40/mo baseline infra.
              Source: action-plan.md. Downloads needed (est., 3% conversion): ~16,700 → 500 payers.
            </Text>
          </Stack>
          <Stack gap={6}>
            <H3>Revenue milestones (est.)</H3>
            <Table
              headers={["Paying subs", "Est. monthly profit", "Milestone"]}
              columnAlign={["left", "left", "left"]}
              rowTone={MILESTONES.map((m) => m.tone)}
              rows={MILESTONES.map((m) => [
                <Text as="span" weight="semibold">{m.subs}</Text>,
                <Text as="span" size="small" style={{ color: teal }}>{m.profit}</Text>,
                <Text as="span" size="small" tone="secondary">{m.milestone}</Text>,
              ])}
            />
          </Stack>
        </Grid>
      </Stack>

      {/* ---- Minimum spend to launch ---- */}
      <Stack gap={10}>
        <H2 style={{ margin: 0 }}>Minimum spend to launch</H2>
        <Text tone="secondary" size="small">
          Principle: everything that <Text as="span" italic>can</Text> be $0 <Text as="span" italic>is</Text> $0. The
          only unavoidable spend is the two store fees.
        </Text>
        <Table
          headers={["Item", "Cost", "Recurring?"]}
          columnAlign={["left", "left", "left"]}
          rowTone={BUDGET.map((b) => b.tone)}
          rows={BUDGET.map((b) => [
            <Text as="span" size="small">{b.item}</Text>,
            <Text as="span" size="small" weight="semibold">{b.cost}</Text>,
            <Text as="span" size="small" tone="secondary">{b.recurring}</Text>,
          ])}
        />
        <Row gap={8} align="center" wrap>
          <Text as="span" weight="semibold">Total minimum to launch (year 1):</Text>
          <Text as="span" weight="semibold" style={{ color: teal, fontSize: 16 }}>≈ $124–136</Text>
          <Text as="span" size="small" tone="tertiary">(≈ $111/yr thereafter)</Text>
        </Row>
      </Stack>

      <Divider />

      {/* ---- First 2 weeks + risks ---- */}
      <Grid columns="1fr 1fr" gap={20} align="start">
        <Stack gap={10}>
          <H2 style={{ margin: 0 }}>First 2 weeks — do this next</H2>
          <Text tone="secondary" size="small">
            A quick-start so you always know the very next action. Checks persist as you go.
          </Text>
          <Stack gap={9}>
            {QUICKSTART.map((q) => (
              <div key={q.id} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <Checkbox
                  checked={!!checks[q.id]}
                  onChange={(v) => setChecks((c) => ({ ...c, [q.id]: v }))}
                />
                <Stack gap={2} style={{ flex: 1 }}>
                  <Text
                    as="span"
                    size="small"
                    style={checks[q.id] ? { textDecoration: "line-through", opacity: 0.6 } : undefined}
                  >
                    {q.label}
                  </Text>
                  <Text as="span" size="small" tone="tertiary" style={{ color: teal }}>
                    {q.phase}
                  </Text>
                </Stack>
              </div>
            ))}
          </Stack>
          <Text tone="tertiary" size="small">
            That’s the whole runway to “real app on my device.” Payments come right after.
          </Text>
        </Stack>

        <Stack gap={10}>
          <H2 style={{ margin: 0 }}>Top risks & how to de-risk cheaply</H2>
          <Table
            headers={["Risk", "De-risk (cheap)"]}
            columnAlign={["left", "left"]}
            rows={RISKS.map((r) => [
              <Text as="span" size="small" weight="semibold">{r.risk}</Text>,
              <Text as="span" size="small" tone="secondary">{r.derisk}</Text>,
            ])}
          />
          <Callout tone="neutral" title="Bottom line">
            <Text size="small">
              Follow the phases in order; don’t build sync until the paywall needs it; ship the smallest thing that
              can charge. The wedge to lean on:{" "}
              <Text as="span" weight="semibold" style={{ color: teal }}>“the private journal that talks back, in one
              tap, and never leaves your phone.”</Text>
            </Text>
          </Callout>
        </Stack>
      </Grid>

      <Text tone="quaternary" size="small">
        Figures mirror docs/research/action-plan.md (Aug 2026), which reuses the pricing, unit economics, break-even,
        and milestones from launch-monetization-strategy.md and competitor-monetization.md. Cost and revenue
        projections are modeled from public 2026 LLM & store rates, not measured — validate against live analytics
        post-launch. Items marked (est.) are projections.
      </Text>
    </Stack>
  );
}
