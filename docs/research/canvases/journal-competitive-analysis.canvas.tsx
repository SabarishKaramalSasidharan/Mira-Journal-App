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

// Feature matrix. Columns: Mood log · Chat capture · AI follow-ups ·
// Patterns/weekly · Long-term memory · Voice · On-device/private · Price
const MATRIX: {
  app: string;
  mood: Mark;
  chat: Mark;
  follow: Mark;
  patterns: Mark;
  memory: Mark;
  voice: Mark;
  private: Mark;
  price: string;
  you?: boolean;
}[] = [
  { app: "Mira (you)", mood: "y", chat: "y", follow: "y", patterns: "y", memory: "n", voice: "y", private: "y", price: "Free (prototype)", you: true },
  { app: "Rosebud", mood: "y", chat: "y", follow: "y", patterns: "y", memory: "y", voice: "y", private: "n", price: "Free / $13/mo" },
  { app: "Day One", mood: "p", chat: "y", follow: "y", patterns: "p", memory: "y", voice: "y", private: "p", price: "Free / Gold ~$50–75/yr" },
  { app: "Apple Journal", mood: "y", chat: "n", follow: "p", patterns: "p", memory: "n", voice: "y", private: "y", price: "Free (iOS only)" },
  { app: "Daylio", mood: "y", chat: "n", follow: "n", patterns: "y", memory: "n", voice: "y", private: "y", price: "Free / Premium" },
  { app: "Reflection", mood: "y", chat: "y", follow: "y", patterns: "p", memory: "n", voice: "y", private: "n", price: "Free / ~$8/mo" },
  { app: "Mindsera", mood: "y", chat: "y", follow: "y", patterns: "y", memory: "y", voice: "y", private: "n", price: "Free / $15/mo" },
  { app: "How We Feel", mood: "y", chat: "n", follow: "n", patterns: "y", memory: "n", voice: "n", private: "y", price: "Free (nonprofit)" },
];

const RIVALS: { app: string; owns: string; weak: string }[] = [
  { app: "Rosebud", owns: "Deep emotional coaching + long-term memory that connects entries; therapist-recommended.", weak: "Sends entries to cloud AI; $13/mo; analytics & export underdeveloped." },
  { app: "Day One", owns: "Durable multimedia archive, every platform, 'Daily Chat' + memory.", weak: "Mood & pattern insight are shallow; all AI is behind the Gold paywall." },
  { app: "Apple Journal", owns: "Frictionless capture from your day (photos/workouts/places), fully on-device.", weak: "iOS-only; no conversation; no cross-entry intelligence." },
  { app: "Daylio", owns: "Fastest logging (mood+activity in 2 taps); best-in-class stats & correlations.", weak: "No real writing depth, no conversation, no AI reflection." },
  { app: "Reflection", owns: "Cleanest low-friction conversational check-in + 100+ expert guides.", weak: "Session-based only (no persistent memory); cloud-based." },
  { app: "How We Feel", owns: "Emotion literacy via a 144-word grid; free, ad-free, private.", weak: "No AI, no conversation, no guided depth." },
];

const PLAYBOOK: { lever: string; why: string; status: Mark; note: string }[] = [
  { lever: "Time-to-first-value < 15s", why: "Blank-page anxiety is the #1 reason people quit; removing it lifted D30 retention ~22%.", status: "y", note: "Have it — mood tap + instant prompt" },
  { lever: "Persistent cross-entry memory", why: "Reviewers repeatedly call this the single feature that separates winners.", status: "n", note: "Biggest gap — build next" },
  { lever: "Privacy as the pitch", why: "30–47% of users delete apps over unexpected data collection.", status: "y", note: "Strength — lean into local-first" },
  { lever: "Non-punitive streaks", why: "Punitive streaks create guilt ('your app made me feel like a failure').", status: "p", note: "Soften current streak model" },
  { lever: "Core free, paywall AI depth", why: "Paywalling basic writing caused a 60% drop-off in A/B tests.", status: "n", note: "Add freemium tiering" },
  { lever: "Backup / export", why: "Trust + safety; today entries live only in local storage.", status: "n", note: "Add export/import + optional sync" },
];

function StatusDot({ v }: { v: Mark }) {
  const t = useHostTheme();
  const color = v === "y" ? t.accent.primary : v === "p" ? t.text.secondary : t.text.quaternary;
  const label = v === "y" ? "Done" : v === "p" ? "Partial" : "To do";
  return (
    <Row gap={6} align="center">
      <span style={{ width: 7, height: 7, borderRadius: 4, background: color, display: "inline-block" }} />
      <Text as="span" tone={v === "y" ? "primary" : "secondary"}>
        {label}
      </Text>
    </Row>
  );
}

export default function JournalCompetitiveAnalysis() {
  const theme = useHostTheme();

  return (
    <Stack gap={20} style={{ padding: 24, maxWidth: 1040 }}>
      <Stack gap={4}>
        <H1>Journaling apps in 2026 — where Mira fits</H1>
        <Text tone="tertiary" size="small">
          Sources: Reflection.app, clairecalls, Know Your Ethos, Rosebud, Day One docs, Apple/Wirecutter,
          Daylio, ViviDiary, FMI & Straits market reports · compiled Aug 2026
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="$6.34B" label="Journaling app market (2026)" />
        <Stat value="~11.4%" label="Market CAGR to 2034" />
        <Stat value="#1" label="Blank page = top reason users quit" tone="warning" />
        <Stat value="60%" label="Drop-off when writing is paywalled" tone="danger" />
      </Grid>

      <Callout tone="warning" title="The blunt verdict">
        Every feature Mira has today — one-tap mood, chat capture, AI follow-ups, weekly insight, themes,
        streaks, charts — already exists in the market, often more maturely. Mood emoji logging is
        table-stakes (Daylio, Apple, How We Feel). Conversational AI journaling is the hottest, most crowded
        space (Rosebud, Day One's Daily Chat, Reflection, Mindsera). Mira is a well-built synthesis, not a novel
        feature set. So the game is <Text as="span" weight="semibold">positioning and retention</Text>, not features.
      </Callout>

      <Stack gap={8}>
        <H2>Feature matrix</H2>
        <Text tone="secondary" size="small">
          Yes = shipped and solid · Partial = present but shallow/gated · — = absent
        </Text>
        <Table
          headers={["App", "Mood log", "Chat capture", "AI follow-ups", "Patterns / weekly", "Long-term memory", "Voice", "On-device / private", "Price"]}
          columnAlign={["left", "center", "center", "center", "center", "center", "center", "center", "left"]}
          rowTone={MATRIX.map((r) => (r.you ? "info" : undefined))}
          rows={MATRIX.map((r) => [
            <Text as="span" weight={r.you ? "bold" : "medium"}>{r.app}</Text>,
            <Cell v={r.mood} />,
            <Cell v={r.chat} />,
            <Cell v={r.follow} />,
            <Cell v={r.patterns} />,
            <Cell v={r.memory} />,
            <Cell v={r.voice} />,
            <Cell v={r.private} />,
            <Text as="span" tone="secondary" size="small">{r.price}</Text>,
          ])}
        />
        <Text tone="tertiary" size="small">
          Takeaway: the only column where Mira trails the leaders is <Text as="span" weight="semibold">long-term memory</Text> —
          and the only column where Mira quietly beats most of them is <Text as="span" weight="semibold">on-device / private</Text>.
        </Text>
      </Stack>

      <Stack gap={8}>
        <H2>Where each rival wins — and where it's exposed</H2>
        <Table
          headers={["App", "Owns this niche", "Where it's weak"]}
          columnAlign={["left", "left", "left"]}
          rows={RIVALS.map((r) => [
            <Text as="span" weight="semibold">{r.app}</Text>,
            <Text as="span" tone="secondary">{r.owns}</Text>,
            <Text as="span" tone="secondary">{r.weak}</Text>,
          ])}
        />
      </Stack>

      <Stack gap={12}>
        <H2>How Mira differentiates</H2>
        <Text tone="secondary">
          Don't try to out-feature Rosebud or Day One. Pick one wedge the incumbents structurally can't copy and own it.
        </Text>
        <Grid columns={3} gap={16} align="stretch">
          <Card>
            <CardHeader trailing={<Text as="span" size="small" style={{ color: theme.accent.primary }}>Recommended</Text>}>
              1 · The private conversational journal
            </CardHeader>
            <CardBody>
              <Text>
                Rosebud, Reflection, Day One and Mindsera all send your entries to a cloud LLM. Apple is private but
                has <Text as="span" weight="semibold">no conversation</Text>. Mira can be the one that is
                <Text as="span" weight="semibold"> both</Text> — a real chat that runs offline / on-device (or
                bring-your-own key). "Your journal talks back, and it never leaves your phone." That's genuine white space.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>2 · The one-tap → conversation loop</CardHeader>
            <CardBody>
              <Text>
                Daylio is fast but writing is optional and separate; Rosebud is deep but starts you at a blank chat.
                Mira already fuses them: tap a mood and it <Text as="span" weight="semibold">instantly</Text> becomes a
                gentle conversation. Lowest time-to-first-word <Text as="span" weight="semibold">and</Text> optional depth.
                Make this the signature, marketed moment.
              </Text>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>3 · Kind by design</CardHeader>
            <CardBody>
              <Text>
                Punitive streaks make people feel like failures and churn. Position Mira as the journal that never guilt-trips —
                supportive, non-punitive progress (Finch/ViviDiary lean here). A warmth wedge the "productivity" incumbents ignore.
              </Text>
            </CardBody>
          </Card>
        </Grid>
      </Stack>

      <Stack gap={8}>
        <H2>Playbook: how a journal app actually succeeds</H2>
        <Text tone="secondary" size="small">
          Retention &gt; features. The winners optimize the first 30 days, not the feature list.
        </Text>
        <Table
          headers={["Lever", "Why it matters", "Mira status"]}
          columnAlign={["left", "left", "left"]}
          rows={PLAYBOOK.map((p) => [
            <Text as="span" weight="semibold">{p.lever}</Text>,
            <Text as="span" tone="secondary">{p.why}</Text>,
            <Stack gap={2}>
              <StatusDot v={p.status} />
              <Text as="span" tone="tertiary" size="small">{p.note}</Text>
            </Stack>,
          ])}
        />
      </Stack>

      <Grid columns={2} gap={16} align="stretch">
        <Card>
          <CardHeader>Pricing that converts</CardHeader>
          <CardBody>
            <Stack gap={8}>
              <Text>
                Keep <Text as="span" weight="semibold">core journaling free forever</Text> (capture, mood, basic reflection).
                Charge only for AI depth: long-term memory / "Ask Mira", richer weekly insights, voice, and cloud sync.
              </Text>
              <Text tone="secondary">
                Target ~<Text as="span" weight="semibold">$4–8/mo</Text> or ~$40–60/yr — deliberately undercutting Rosebud
                ($13) and Mindsera ($15). Free-to-paid of ~8% is realistic when the habit forms on the free tier.
              </Text>
            </Stack>
          </CardBody>
        </Card>
        <Card>
          <CardHeader>Build these next (in order)</CardHeader>
          <CardBody>
            <Stack gap={6}>
              <Text><Text as="span" weight="semibold">1. Persistent memory</Text> — "You've written about work stress 5 times this month." The #1 differentiator, and your biggest gap.</Text>
              <Divider />
              <Text><Text as="span" weight="semibold">2. Data safety</Text> — export/import + optional encrypted sync. Removes the "what if I lose it" objection.</Text>
              <Divider />
              <Text><Text as="span" weight="semibold">3. Non-punitive streaks</Text> — celebrate consistency, never shame a missed day.</Text>
              <Divider />
              <Text><Text as="span" weight="semibold">4. On-device model + freemium</Text> — make "private conversation" real, then gate the cloud-heavy AI.</Text>
            </Stack>
          </CardBody>
        </Card>
      </Grid>

      <Callout tone="info" title="One-line positioning to test">
        "Mira — the journal that talks with you, in one tap, and never leaves your phone." It combines Daylio's speed,
        Rosebud's conversation, and Apple's privacy — a combination no single incumbent offers today.
      </Callout>
    </Stack>
  );
}
