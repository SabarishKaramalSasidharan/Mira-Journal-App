import {
  BarChart,
  Callout,
  Card,
  CardBody,
  CardHeader,
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
  useHostTheme,
} from "cursor/canvas";

// Mira brand teal (from the brand-color strategy doc): light vs dark token.
function useTeal(): string {
  const t = useHostTheme();
  return t.kind === "light" ? "#0e9e8c" : "#2dd4bf";
}

type Confidence = "fact" | "est";

function Conf({ v }: { v: Confidence }) {
  return (
    <Pill size="sm">{v === "fact" ? "confirmed" : "estimate"}</Pill>
  );
}

// ---- Competitor monetization matrix (business models + scale + company) ----
const COMPETITORS: {
  app: string;
  company: string;
  model: string;
  price: string;
  scale: string;
  scaleConf: Confidence;
  team: string;
}[] = [
  {
    app: "Day One",
    company: "Automattic (acquired 2021)",
    model: "Freemium subscription · annual only",
    price: "Silver $49.99/yr · Gold $74.99/yr (all AI)",
    scale: "15M+ downloads; inside Automattic (~$700M+ ARR)",
    scaleConf: "fact",
    team: "500+ staff · ~$985M raised · ~$7.5B val",
  },
  {
    app: "Rosebud",
    company: "Rosebud (justimagine, LA)",
    model: "Freemium subscription · AI is the product",
    price: "Bloom $12.99/mo · $8.99/mo annual ($107.99/yr)",
    scale: "7,500+ paying (mid-2025); 500M words logged",
    scaleConf: "fact",
    team: "VC: ~$6.75M seed (Bessemer, Tim Ferriss) · ~44 ppl",
  },
  {
    app: "Finch",
    company: "Finch Care PBC (US)",
    model: "Freemium · soft paywall · gamified IAP",
    price: "Plus $9.99/mo · $39.99–79.99/yr · IAP to $399",
    scale: "~$30–40M ARR · 15M+ downloads · 627K MAU",
    scaleConf: "est",
    team: "Bootstrapped ($0 VC) · 2 ex-Quora founders",
  },
  {
    app: "Reflectly",
    company: "Kodeon, Inc. (ex-Denmark)",
    model: "Freemium subscription",
    price: "~$9.99/mo · $59.99/yr",
    scale: "4.9M iOS installs · ~239K MAU; revenue est. varies wildly",
    scaleConf: "est",
    team: "~$5.97M raised over 4 rounds · small team",
  },
  {
    app: "Daylio",
    company: "Habitics / Relaxio s.r.o. (Slovakia)",
    model: "Freemium subscription + lifetime · no AI",
    price: "$4.99/mo · $35.99/yr · $59.99 lifetime",
    scale: "~$66–100K/mo · 40–220K downloads/mo",
    scaleConf: "est",
    team: "Small indie studio",
  },
  {
    app: "Stoic",
    company: "Stoic app inc. (YC S19, Kraków)",
    model: "Freemium + AI add-on + lifetime",
    price: "Prem $6.99/mo·$39.99/yr · +AI $12.99/mo·$99.99/yr · $199 life",
    scale: "4M+ downloads · 100K+ reviews (4.8)",
    scaleConf: "fact",
    team: "~$150K (YC) · team of 9 · ex-agency founder",
  },
  {
    app: "Mindsera",
    company: "Mindsera (Estonia/US)",
    model: "Freemium subscription · AI-first",
    price: "Genius $14.99/mo · $10.75/mo annual ($129/yr)",
    scale: "Small; undisclosed",
    scaleConf: "est",
    team: "Bootstrapped, user-funded · ~2 (founder + CTO)",
  },
  {
    app: "Journey",
    company: "2Appstudio (Singapore)",
    model: "Hybrid: one-time license + subscription + lifetime",
    price: "Membership ~$50/yr ($4.17/mo) · per-platform Premium license",
    scale: '"Millions of users" claimed',
    scaleConf: "est",
    team: "Small studio · Stripe/Chargebee billing",
  },
  {
    app: "Diarium",
    company: "Timo Partl (solo, Germany)",
    model: "One-time purchase per platform · no subscription",
    price: "~$4.99 iOS/Android · $9.99 Mac/Win · free tier + trial",
    scale: "500K+ Play downloads · 4.8 iOS / 4.5 Android",
    scaleConf: "fact",
    team: "Solo indie · MS Store Award 2024",
  },
  {
    app: "How We Feel",
    company: "How We Feel Project Inc (501c3)",
    model: "Free · donation-funded · no ads, no data sale",
    price: "Free",
    scale: "App Store Cultural Impact Award; 4.9 rating",
    scaleConf: "fact",
    team: "Nonprofit · Ben Silbermann (Pinterest) + Yale CEI",
  },
  {
    app: "Apple Journal",
    company: "Apple (first-party)",
    model: "Free · bundled with iOS (ecosystem/hardware play)",
    price: "Free",
    scale: "Pre-installed on ~1B+ iPhones (iOS 17.2+)",
    scaleConf: "fact",
    team: "Apple · 'Sherlocked' the entry-level category",
  },
];

// ---- Indie-studio / portfolio pattern ----
const STUDIOS: { studio: string; who: string; portfolio: string }[] = [
  {
    studio: "Automattic",
    who: "Public-ish giant, 500+ staff",
    portfolio: "Day One + WordPress.com, WooCommerce, Tumblr, Pocket Casts, Beeper — grows by acquiring category apps",
  },
  {
    studio: "2Appstudio",
    who: "Small studio (Singapore)",
    portfolio: "Journey journal + companion productivity/utility apps under one billing stack",
  },
  {
    studio: "Timo Partl",
    who: "Solo dev (Germany)",
    portfolio: "Diarium (journal) + WorkingHours (time tracking) + SubTotal (invoicing) + photo/time utilities — one maker, many one-time-buy apps",
  },
  {
    studio: "Lagerland Apps",
    who: "Solo dev, Antti Aittamaa (Finland)",
    portfolio: "19 native SwiftUI apps: Observa (sleep/recovery), Taskful Day (calm planner), health/finance/utilities — all on-device, no VC",
  },
  {
    studio: "Lazy Hippo",
    who: "Solo dev (Seoul)",
    portfolio: "Tochi (mood journal) + quit-habit companion + Bavi (focus) — gentle character-driven wellness apps",
  },
  {
    studio: "byArcadia",
    who: "Solo dev, D. Woźniak (Kraków)",
    portfolio: "Umbra (shadow-work journal), Aether, Plutus — offline-first apps + open-source RN packages",
  },
  {
    studio: "BMcks Apps",
    who: "One founder + AI (Silicon Valley)",
    portfolio: "15+ AI wellness apps incl. MoodLog + MindReset (journaling), SleepWell, cross-linked as a suite",
  },
];

// ---- LLM cost ladder (per 1M tokens, 2026) ----
const LLM: { model: string; input: string; output: string; use: string }[] = [
  { model: "Gemini 2.5 Flash-Lite", input: "$0.10", output: "$0.40", use: "Text follow-ups (Mira's pick)" },
  { model: "GPT-4o mini", input: "$0.15", output: "$0.60", use: "Text follow-ups" },
  { model: "Gemini 2.5 Flash", input: "$0.30", output: "$2.50", use: "Richer insight passes" },
  { model: "Gemini Flash native audio (Live)", input: "$3.00 audio", output: "$12.00 audio", use: "Voice / call mode — the real cost driver" },
];

// ---- Mira unit economics per plan (15% store cut assumed) ----
const UNIT: { plan: string; gross: string; store: string; ai: string; net: string; margin: string }[] = [
  { plan: "Monthly $4.99", gross: "$4.99/mo", store: "−$0.75", ai: "−$0.25", net: "$3.99/mo", margin: "~80%" },
  { plan: "Annual $39.99 (hero)", gross: "$39.99/yr", store: "−$6.00", ai: "−$3.00/yr", net: "~$31/yr", margin: "~78%" },
  { plan: "Lifetime $99.99", gross: "$99.99 once", store: "−$15.00", ai: "~$3/yr to serve", net: "~$85 up front", margin: "safe — text AI is cheap" },
];

// ---- Break-even scenarios ----
const BREAKEVEN_PAYERS = ["100", "500", "1,000", "3,000"];
const BREAKEVEN_PROFIT = [165, 960, 1900, 6050]; // approx monthly profit, USD

export default function MiraCompetitorMonetization() {
  const teal = useTeal();

  return (
    <Stack gap={22} style={{ padding: 24, maxWidth: 1080 }}>
      <Stack gap={4}>
        <H1>Mira — how competitors make money, and Mira&apos;s path to profitability</H1>
        <Text tone="tertiary" size="small">
          Sources: app pricing pages &amp; App Store / Play listings, Sensor Tower / AppGoblin / Tracxn
          estimates, Crunchbase / TechCrunch, RevenueCat State of Subscription Apps 2026, Gemini/OpenAI
          pricing · compiled Aug 2026 · builds on the in-repo competitive analysis &amp; launch/monetization docs
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="$6.34B" label="Journaling market (2026), ~11% CAGR" />
        <Stat value="10.7% vs 2.1%" label="Hard-paywall vs freemium conversion (RevenueCat 2026)" tone="info" />
        <Stat value="~$0.20/mo" label="Mira's est. LLM cost per Plus user (text, capped)" tone="success" />
        <Stat value="~15–20" label="Paying subs to cover all fixed costs" tone="success" />
      </Grid>

      <Callout tone="info" title="The three findings that matter">
        <Stack gap={6}>
          <Text>
            <Text as="span" weight="semibold">1 · Subscription freemium is the default,</Text> but the winners
            keep a genuinely usable free core and gate <Text as="span" italic>depth</Text> (AI, sync, memory),
            not the act of writing. The one breakout — <Text as="span" weight="semibold">Finch (~$30–40M ARR,
            bootstrapped)</Text> — did it with a soft paywall and a generous free tier, not by locking everything.
          </Text>
          <Text>
            <Text as="span" weight="semibold">2 · Most journaling apps are tiny teams or one person.</Text> Stoic
            (9), Mindsera (~2), Daylio and Diarium (solo/indie), and a wide field of one-maker studios each shipping
            a <Text as="span" weight="semibold">portfolio</Text> of wellness apps. Only Rosebud (VC) and Day One
            (Automattic) are &quot;companies.&quot; Mira competing as a lean indie is the norm, not the exception.
          </Text>
          <Text>
            <Text as="span" weight="semibold">3 · AI journaling is cheap to run if you stay text-only.</Text> A
            capped text follow-up on Flash-Lite costs a fraction of a cent; the apps priced at $13–15/mo
            (Rosebud, Mindsera) are paying for <Text as="span" weight="semibold" style={{ color: teal }}>voice / call
            mode</Text>, the real cost driver. Mira&apos;s text loop lets it price at ~$5/mo and still keep ~80% margin.
          </Text>
        </Stack>
      </Callout>

      <Stack gap={8}>
        <H2>1 · How competing journaling apps make money</H2>
        <Text tone="secondary" size="small">
          Revenue model, exact 2026 price tiers, scale/revenue (with confidence), and the company behind it.
          &quot;confirmed&quot; = official/first-party; &quot;estimate&quot; = third-party analytics or press.
        </Text>
        <Table
          headers={["App", "Model", "Price tiers (2026)", "Scale / revenue", "", "Company · team · funding"]}
          columnAlign={["left", "left", "left", "left", "left", "left"]}
          rows={COMPETITORS.map((c) => [
            <Stack key="app" gap={1}>
              <Text as="span" weight="bold">{c.app}</Text>
              <Text as="span" tone="tertiary" size="small">{c.company}</Text>
            </Stack>,
            <Text key="model" as="span" tone="secondary" size="small">{c.model}</Text>,
            <Text key="price" as="span" size="small">{c.price}</Text>,
            <Text key="scale" as="span" tone="secondary" size="small">{c.scale}</Text>,
            <Conf key="conf" v={c.scaleConf} />,
            <Text key="team" as="span" tone="secondary" size="small">{c.team}</Text>,
          ])}
        />
        <Text tone="tertiary" size="small">
          Pattern: pricing tracks AI/compute cost — Daylio (no AI) $35.99/yr &lt; Stoic base $39.99 &lt; Day One
          Gold $74.99 (AI) &lt; Rosebud $107.99 &lt; Mindsera $129. One-time-buy holdouts (Diarium) and free/nonprofit
          plays (How We Feel, Apple Journal) anchor the bottom.
        </Text>
      </Stack>

      <Stack gap={10}>
        <H2>2 · The indie-studio / portfolio pattern</H2>
        <Text tone="secondary">
          A striking share of journaling and wellness apps come from <Text as="span" weight="semibold">one maker
          (or a tiny studio) shipping several apps</Text> — a shared engine, brand, and billing stack amortized
          across a catalog. It is the dominant shape of this market, and a realistic template for Mira.
        </Text>
        <Grid columns={3} gap={16} align="stretch">
          <Card>
            <CardHeader>Why the pattern works</CardHeader>
            <CardBody>
              <Text size="small">
                One codebase and one App Store account fund many small bets. Each app is a cheap ASO surface; a
                winner subsidizes the rest. Low overhead means a few hundred subscribers per app is already profit.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader trailing={<Text as="span" size="small" style={{ color: teal }}>relevant to Mira</Text>}>
              The &quot;calm wellness&quot; sub-genre
            </CardHeader>
            <CardBody>
              <Text size="small">
                Lazy Hippo, byArcadia, Lagerland, BMcks — all ship gentle, private, on-device journaling/mood apps
                as part of a portfolio. Mira&apos;s positioning sits squarely in this lane.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>The two exceptions</CardHeader>
            <CardBody>
              <Text size="small">
                Only <Text as="span" weight="semibold">Rosebud</Text> (VC-backed) and <Text as="span" weight="semibold">Day
                One</Text> (owned by Automattic) run as funded companies. Everyone else is lean by design — which is
                exactly how Mira should launch.
              </Text>
            </CardBody>
          </Card>
        </Grid>
        <Table
          headers={["Studio / maker", "Shape", "Portfolio (journaling app in bold context)"]}
          columnAlign={["left", "left", "left"]}
          rows={STUDIOS.map((s) => [
            <Text key="studio" as="span" weight="semibold">{s.studio}</Text>,
            <Text key="who" as="span" tone="secondary" size="small">{s.who}</Text>,
            <Text key="portfolio" as="span" tone="secondary" size="small">{s.portfolio}</Text>,
          ])}
        />
      </Stack>

      <Stack gap={10}>
        <H2>3 · AI-journaling economics — LLM cost vs price</H2>
        <Text tone="secondary">
          The central question for Mira: how do AI journals cover model costs? Answer — text follow-ups are nearly
          free; the price tag is really about <Text as="span" weight="semibold">voice, call mode, and big-context
          long-term memory</Text>.
        </Text>
        <Grid columns="1.15fr 1fr" gap={16} align="stretch">
          <Stack gap={6}>
            <H3>Annual price to the user, by app (USD, 2026)</H3>
            <BarChart
              categories={["Daylio", "Stoic", "Reflectly", "Day One Gold", "Mira (rec.)", "Rosebud", "Mindsera"]}
              series={[{ name: "Annual price (USD)", data: [35.99, 39.99, 59.99, 74.99, 39.99, 107.99, 129] }]}
              valuePrefix="$"
              height={230}
              referenceLines={[{ value: 39.99, label: "Mira $39.99", tone: "success" }]}
            />
            <Text tone="tertiary" size="small">
              Source: each app&apos;s pricing page / App Store listing, checked Jul–Aug 2026. Mira&apos;s recommended
              annual sits at the low end while still funding a text-AI loop — a deliberate undercut of the AI leaders.
            </Text>
          </Stack>
          <Stack gap={6}>
            <H3>LLM API price ladder (per 1M tokens)</H3>
            <Table
              headers={["Model", "Input", "Output", "Fit"]}
              columnAlign={["left", "right", "right", "left"]}
              rowTone={[undefined, undefined, undefined, "warning"]}
              rows={LLM.map((m) => [
                <Text key="model" as="span" size="small" weight="medium">{m.model}</Text>,
                <Text key="input" as="span" size="small">{m.input}</Text>,
                <Text key="output" as="span" size="small">{m.output}</Text>,
                <Text key="use" as="span" tone="secondary" size="small">{m.use}</Text>,
              ])}
            />
            <Callout tone="success" title="The cost math that sets Mira free">
              <Text size="small">
                A capped ~150-token text reply on Flash-Lite costs <Text as="span" weight="semibold">~$0.0002</Text>.
                Even a heavy user (5–15 exchanges/day + weekly insight) runs <Text as="span" weight="semibold">~$0.05–0.30/month</Text>.
                Voice/call mode is 15–60× pricier — which is why Rosebud &amp; Mindsera charge $13–15/mo. Keep the free
                and Plus loops <Text as="span" weight="semibold">text-first</Text> and the marginal cost stays in cents.
              </Text>
            </Callout>
          </Stack>
        </Grid>
      </Stack>

      <Divider />

      <Stack gap={12}>
        <Row gap={10} align="center">
          <H2 style={{ margin: 0 }}>4 · Mira&apos;s path to profitability</H2>
          <Pill size="sm">recommended</Pill>
        </Row>
        <Text tone="secondary">
          Break-even is astonishingly low because the cost base is near-zero (free store tiers, text-only AI). The
          job is not to cover big costs — it is to <Text as="span" weight="semibold">form the habit free, then
          convert on depth</Text>, and get the first ~20 subscribers fast.
        </Text>

        <Grid columns={3} gap={16} align="stretch">
          <Card>
            <CardHeader trailing={<Text as="span" size="small" style={{ color: teal }}>hero</Text>}>
              Mira Plus — recommended pricing
            </CardHeader>
            <CardBody>
              <Stack gap={6}>
                <Text weight="semibold" style={{ color: teal, fontSize: 18 }}>$4.99/mo · $39.99/yr · $99.99 lifetime</Text>
                <Text size="small" tone="secondary">
                  Annual is the hero (14-day trial). Undercuts Rosebud ($108) and Mindsera ($129) by ~60–70%; matches
                  Day One Silver; beats Day One&apos;s AI-only-in-$74.99-Gold.
                </Text>
                <Text size="small" tone="tertiary">
                  Free forever: writing, mood, offline follow-ups, basic reflection, export. Plus gates: cloud sync +
                  backup, hosted AI (no key), long-term memory / &quot;Ask Mira,&quot; voice, richer insight.
                </Text>
              </Stack>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>Conversion benchmarks (RevenueCat 2026)</CardHeader>
            <CardBody>
              <Stack gap={5}>
                <Row justify="space-between"><Text as="span" size="small" tone="secondary">Freemium download→paid (median)</Text><Text as="span" size="small" weight="semibold">2.1%</Text></Row>
                <Divider />
                <Row justify="space-between"><Text as="span" size="small" tone="secondary">Health &amp; Fitness median</Text><Text as="span" size="small" weight="semibold">2.9%</Text></Row>
                <Divider />
                <Row justify="space-between"><Text as="span" size="small" tone="secondary">Hard paywall (median)</Text><Text as="span" size="small" weight="semibold">10.7%</Text></Row>
                <Divider />
                <Row justify="space-between"><Text as="span" size="small" tone="secondary">Trial→paid, H&amp;F</Text><Text as="span" size="small" weight="semibold">~40%</Text></Row>
                <Divider />
                <Row justify="space-between"><Text as="span" size="small" tone="secondary">17–32 day trial vs ≤4 day</Text><Text as="span" size="small" weight="semibold">42.5% vs 25.5%</Text></Row>
              </Stack>
            </CardBody>
          </Card>
          <Card>
            <CardHeader trailing={<Text as="span" size="small" style={{ color: teal }}>fastest route</Text>}>
              First revenue in weeks
            </CardHeader>
            <CardBody>
              <Stack gap={6}>
                <Text size="small">
                  1 · Ship <Text as="span" weight="semibold">lifetime + annual</Text> first with a 14-day trial at the
                  depth moment (memory/sync).
                </Text>
                <Text size="small">
                  2 · <Text as="span" weight="semibold">$99.99 lifetime</Text> as a cash accelerator — uniquely safe for
                  Mira because text-AI costs ~$3/yr to serve.
                </Text>
                <Text size="small">
                  3 · Test a trial-led <Text as="span" weight="semibold">hard-ish paywall</Text> (5× conversion) while
                  keeping a real free core for ASO, word-of-mouth &amp; the privacy pitch.
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </Grid>

        <Stack gap={8}>
          <H3>Unit economics per subscriber (15% store cut · Flash-Lite text AI · free-tier infra)</H3>
          <Table
            headers={["Plan", "Gross", "Store cut", "AI + infra", "Net to Mira", "Margin"]}
            columnAlign={["left", "left", "left", "left", "left", "left"]}
            rowTone={[undefined, "success", undefined]}
            rows={UNIT.map((u) => [
              <Text key="plan" as="span" weight="semibold">{u.plan}</Text>,
              <Text key="gross" as="span" size="small">{u.gross}</Text>,
              <Text key="store" as="span" size="small" tone="secondary">{u.store}</Text>,
              <Text key="ai" as="span" size="small" tone="secondary">{u.ai}</Text>,
              <Text key="net" as="span" size="small" weight="semibold" style={{ color: teal }}>{u.net}</Text>,
              <Text key="margin" as="span" size="small">{u.margin}</Text>,
            ])}
          />
          <Text tone="tertiary" size="small">
            Payment processing is inside the 15% store commission (no separate Stripe fee on IAP). Infra is $0 on
            Supabase/Firebase/PostHog free tiers until real traffic, then ~$25/mo amortized to fractions of a cent per user.
          </Text>
        </Stack>

        <Grid columns="1fr 1fr" gap={16} align="stretch">
          <Stack gap={6}>
            <H3>Monthly profit by paying-subscriber count</H3>
            <BarChart
              categories={BREAKEVEN_PAYERS}
              series={[{ name: "Est. monthly profit (USD)", data: BREAKEVEN_PROFIT, tone: "success" }]}
              valuePrefix="$"
              height={220}
            />
            <Text tone="tertiary" size="small">
              Assumes blended net ~$27/payer/yr (mix of monthly/annual/lifetime) minus ~$0.20/payer/mo AI + ~$40/mo
              baseline infra. Break-even on fixed costs lands at <Text as="span" weight="semibold">~15–20 paying subscribers</Text>.
            </Text>
          </Stack>
          <Card>
            <CardHeader>Break-even &amp; scale math</CardHeader>
            <CardBody>
              <Stack gap={6}>
                <Text size="small">
                  <Text as="span" weight="semibold">Fixed cost, year 1:</Text> Apple $99 + Google $25 + domain $12
                  ≈ <Text as="span" weight="semibold">$136</Text>; ongoing infra ~$40/mo once you have traffic.
                </Text>
                <Divider />
                <Text size="small">
                  <Text as="span" weight="semibold">Break-even:</Text> ~$40/mo ÷ ~$2.6 net per annual sub ≈
                  <Text as="span" weight="semibold" style={{ color: teal }}> 16 subscribers</Text> covers everything.
                </Text>
                <Divider />
                <Text size="small">
                  <Text as="span" weight="semibold">Downloads needed:</Text> at a conservative 3% freemium conversion,
                  ~16,700 downloads → 500 payers (~$960/mo profit); ~33,000 → 1,000 payers (~$1,900/mo). A trial-led
                  paywall pushes conversion toward 5%+, roughly halving the traffic required.
                </Text>
                <Divider />
                <Text size="small">
                  <Text as="span" weight="semibold">Indie full-time:</Text> ~3,000 payers ≈ ~$72K/yr profit — reachable
                  on this cost base without a single dollar of paid UA.
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </Grid>
      </Stack>

      <Callout tone="neutral" title="Bottom line">
        Copy the market&apos;s proven shape — <Text as="span" weight="semibold">lean freemium, gate depth not
        writing</Text> — but exploit Mira&apos;s structural edge: a <Text as="span" weight="semibold" style={{ color: teal }}>text-first,
        on-device AI loop</Text> that costs cents, so Mira can price ~60% under the AI leaders, safely sell lifetime,
        break even at ~15–20 subscribers, and reach indie-sustaining profit at a few thousand — as a one-person studio.
      </Callout>

      <Text tone="quaternary" size="small">
        Estimate flags: Finch ARR, Reflectly revenue, Daylio revenue, and all MAU/download figures are third-party
        estimates and vary by source. Rosebud&apos;s 7,500 paying customers and Automattic&apos;s financials are the
        most dated/indirect. Mira&apos;s cost and break-even figures are modeled from public 2026 LLM &amp; store rates,
        not measured — validate against live analytics post-launch.
      </Text>
    </Stack>
  );
}
