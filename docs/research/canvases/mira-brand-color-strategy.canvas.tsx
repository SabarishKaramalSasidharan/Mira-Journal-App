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

function Cell({ v, yes, partial }: { v: Mark; yes?: string; partial?: string }) {
  const t = useHostTheme();
  if (v === "y")
    return (
      <Text as="span" weight="semibold" style={{ color: t.accent.primary }}>
        {yes ?? "Yes"}
      </Text>
    );
  if (v === "p")
    return (
      <Text as="span" tone="secondary">
        {partial ?? "Partial"}
      </Text>
    );
  return (
    <Text as="span" tone="quaternary">
      —
    </Text>
  );
}

// A real brand-color swatch. `hex` is DATA (the competitor's actual color),
// not decorative styling — so it is intentionally rendered as a literal value.
function Swatch({
  hex,
  size = 40,
  label,
  sub,
}: {
  hex: string;
  size?: number;
  label?: string;
  sub?: string;
}) {
  const t = useHostTheme();
  return (
    <Row gap={10} align="center">
      <span
        style={{
          width: size,
          height: size,
          borderRadius: 8,
          background: hex,
          border: `1px solid ${t.stroke.secondary}`,
          flex: "0 0 auto",
        }}
      />
      {(label || sub) && (
        <Stack gap={1}>
          {label && (
            <Text as="span" weight="medium">
              {label}
            </Text>
          )}
          {sub && (
            <Text as="span" tone="tertiary" size="small">
              {sub}
            </Text>
          )}
        </Stack>
      )}
    </Row>
  );
}

// Competitor brand colors. Hex is sourced where a brand color is published,
// otherwise a representative hue value (flagged in `note`).
const LANDSCAPE: {
  app: string;
  cat: string;
  hue: string;
  hex: string;
  note: string;
}[] = [
  { app: "Day One", cat: "Journaling", hue: "Sky blue", hex: "#4cbef8", note: "“Day One Blue” (sourced)" },
  { app: "Calm", cat: "Meditation", hue: "Navy / blue", hex: "#4276ce", note: "wordmark; navy #1B2250 (sourced)" },
  { app: "Headspace", cat: "Meditation", hue: "Orange", hex: "#f47d31", note: "mascot; blue #0061ef action (sourced)" },
  { app: "Insight Timer", cat: "Meditation", hue: "Teal", hex: "#2f7a7c", note: "+ #00a486 (sourced)" },
  { app: "Reflectly", cat: "Journaling", hue: "Indigo / violet", hex: "#6b5ce7", note: "brand + user themes (representative)" },
  { app: "Finch", cat: "Self-care", hue: "Teal + lime", hex: "#2f8f83", note: "teal + yellow-green + slate (representative)" },
  { app: "Journey", cat: "Journaling", hue: "Green", hex: "#3aa76d", note: "green accent (representative)" },
  { app: "Jour", cat: "Journaling", hue: "Coral / pink", hex: "#f0567a", note: "warm gradient (representative)" },
  { app: "Daylio", cat: "Mood", hue: "Blue (themed)", hex: "#4c6fb1", note: "user-selectable themes (representative)" },
  { app: "Stoic", cat: "Journaling", hue: "Monochrome", hex: "#111827", note: "black / white; blue dark-mode (sourced)" },
];

// Apps that deliberately DON'T own a single hue.
const NO_HUE: { app: string; why: string }[] = [
  { app: "Apple Journal", why: "White icon + multicolor loops; leans on the iOS system tint, no owned brand color." },
  { app: "How We Feel", why: "4-quadrant mood grid (red/yellow/green/blue) on black; multicolor by design." },
  { app: "Diarly", why: "Ships user-selectable accent themes; default blue, no committed identity color." },
];

// Hue bands: how crowded each is at the top of the category.
const BANDS: { band: string; hex: string; who: string; status: Mark; verdict: string }[] = [
  { band: "Blue (sky → navy)", hex: "#4276ce", who: "Day One, Calm, Daylio, Diarly, Headspace CTA", status: "n", verdict: "Crowded — hardest to own" },
  { band: "Orange / amber", hex: "#f47d31", who: "Headspace (mascot)", status: "n", verdict: "Owned — avoid" },
  { band: "Indigo / violet", hex: "#6b5ce7", who: "Reflectly, Jour", status: "p", verdict: "Moderately taken" },
  { band: "Green", hex: "#3aa76d", who: "Journey, Finch (lime), Insight (leans teal)", status: "p", verdict: "Moderately taken" },
  { band: "Rose / coral", hex: "#f0567a", who: "Jour, How We Feel (quadrant)", status: "p", verdict: "Reads romance / high-arousal" },
  { band: "Teal (blue-green)", hex: "#0e9e8c", who: "Insight Timer, Finch — no journaling leader", status: "y", verdict: "Open at the top → ownable" },
];

const PSYCH: { hue: string; hex: string; connotes: string; fit: Mark; note: string }[] = [
  { hue: "Teal", hex: "#0e9e8c", connotes: "Calm + growth; “alert stillness”; trust without coldness; renewal", fit: "y", note: "Best fit — soothes without sedating; on-name (mirror / still water)" },
  { hue: "Blue", hex: "#4276ce", connotes: "Trust, calm, clarity — but sedating & corporate", fit: "p", note: "Safe but generic and the most crowded lane" },
  { hue: "Green", hex: "#2f9e44", connotes: "Growth, nature, balance", fit: "p", note: "Skews productivity / eco / finance, less “reflective”" },
  { hue: "Indigo", hex: "#6366f1", connotes: "Introspection, creativity, “night”", fit: "p", note: "Evocative but higher-arousal and already taken" },
  { hue: "Amber", hex: "#e08a00", connotes: "Warmth, optimism, energy", fit: "n", note: "High-arousal; Headspace territory; weakest AA on white" },
  { hue: "Rose", hex: "#e23a6d", connotes: "Care, warmth, passion", fit: "n", note: "Romance / high-arousal — wrong register for reflection" },
];

// The 6 palettes currently shipped in palette.ts, rated for the single-color role.
const OPTIONS: {
  name: string;
  id: string;
  hex: string;
  onName: Mark;
  calm: Mark;
  open: Mark;
  verdict: string;
  rank: number;
}[] = [
  { name: "Lagoon", id: "teal", hex: "#0e9e8c", onName: "y", calm: "y", open: "y", verdict: "Pick — on-mascot, calm+growth, ownable lane", rank: 1 },
  { name: "Twilight", id: "indigo", hex: "#6366f1", onName: "n", calm: "p", open: "n", verdict: "Runner-up — evocative but crowded & off-mascot", rank: 2 },
  { name: "Grove", id: "grove", hex: "#2f9e44", onName: "n", calm: "p", open: "p", verdict: "Off-tone — reads productivity / eco", rank: 3 },
  { name: "Orchid", id: "plum", hex: "#9333ea", onName: "n", calm: "n", open: "p", verdict: "High-arousal / luxury — off-calm", rank: 4 },
  { name: "Blossom", id: "rose", hex: "#e23a6d", onName: "n", calm: "n", open: "p", verdict: "Too high-arousal for reflection", rank: 5 },
  { name: "Honey", id: "amber", hex: "#e08a00", onName: "n", calm: "n", open: "n", verdict: "Headspace territory + weakest AA on white", rank: 6 },
];

function StatusDot({ v, label }: { v: Mark; label: string }) {
  const t = useHostTheme();
  const color = v === "y" ? t.accent.primary : v === "p" ? t.text.secondary : t.text.quaternary;
  return (
    <Row gap={6} align="center">
      <span style={{ width: 7, height: 7, borderRadius: 4, background: color, display: "inline-block" }} />
      <Text as="span" tone={v === "y" ? "primary" : "secondary"}>
        {label}
      </Text>
    </Row>
  );
}

export default function MiraBrandColorStrategy() {
  const theme = useHostTheme();

  return (
    <Stack gap={20} style={{ padding: 24, maxWidth: 1040 }}>
      <Stack gap={4}>
        <H1>Mira brand color — cut the picker, own the teal</H1>
        <Text tone="tertiary" size="small">
          Sources: ColorsWall & Automattic Design (Day One), ColorFYI & logotyp.us (Calm), Refero &
          oh-my-design (Headspace), Mobbin (Insight Timer), fawnchen (Finch), Stoic press kit,
          neurolaunch / euto-topia / WGSN color psychology · compiled Aug 2026
        </Text>
      </Stack>

      <Grid columns={4} gap={16}>
        <Stat value="Cut it" label="Verdict on the 6-way theme picker" tone="warning" />
        <Stat value="Teal" label="Single recommended brand color" />
        <Stat value="#0e9e8c" label="“Mira Teal” — light (already the default)" />
        <Stat value="0 of 10" label="Journaling leaders that own teal" tone="success" />
      </Grid>

      <Callout tone="success" title="The recommendation, up front">
        Ship <Text as="span" weight="semibold">one</Text> color and hide the picker. Commit to the current
        default teal, <Text as="span" weight="semibold">“Mira Teal” #0e9e8c</Text> (light) /{" "}
        <Text as="span" weight="semibold">#2dd4bf</Text> (dark). The name (mirror / reflection), the teal
        reflection-droplet mascot, and teal’s psychology (calm <Text as="span" italic>and</Text> growth) all
        point to the same hue — and unlike blue, orange, or purple, no journaling headliner owns teal yet.
        A rotating accent would recolor the mascot and erase the one thing a young brand needs most: a
        color people remember.
      </Callout>

      {/* ---- COMPETITOR LANDSCAPE ---- */}
      <Stack gap={8}>
        <H2>The competitive color landscape</H2>
        <Text tone="secondary" size="small">
          Dominant brand/accent hue per app. Hex is the published brand value where available, otherwise a
          representative hue (flagged). Swatches are the actual colors.
        </Text>
        <Table
          headers={["", "App", "Category", "Dominant hue", "Hex", "Notes"]}
          columnAlign={["center", "left", "left", "left", "left", "left"]}
          rowTone={LANDSCAPE.map((r) => (r.app === "Insight Timer" || r.app === "Finch" ? "info" : undefined))}
          rows={LANDSCAPE.map((r) => [
            <Swatch hex={r.hex} size={22} />,
            <Text as="span" weight="semibold">{r.app}</Text>,
            <Text as="span" tone="secondary">{r.cat}</Text>,
            <Text as="span">{r.hue}</Text>,
            <Text as="span" tone="secondary" size="small">{r.hex}</Text>,
            <Text as="span" tone="tertiary" size="small">{r.note}</Text>,
          ])}
        />
        <Text tone="tertiary" size="small">
          The only teal on the board belongs to <Text as="span" weight="semibold">meditation / self-care</Text> apps
          (Insight Timer, Finch) — not the journaling headliners. That’s the gap Mira sits in.
        </Text>
      </Stack>

      <Stack gap={8}>
        <H3>…and the apps that deliberately own no color</H3>
        <Grid columns={3} gap={16} align="stretch">
          {NO_HUE.map((n) => (
            <div key={n.app}>
              <Card>
                <CardHeader>{n.app}</CardHeader>
                <CardBody>
                  <Text tone="secondary">{n.why}</Text>
                </CardBody>
              </Card>
            </div>
          ))}
        </Grid>
        <Text tone="tertiary" size="small">
          These are cautionary tales: no owned hue = no color memory. Reflectly, Daylio and Diarly all lead
          with a picker — and none of them has a recognizable brand color.
        </Text>
      </Stack>

      {/* ---- HUE CROWDING ---- */}
      <Stack gap={8}>
        <H2>Which hues are crowded vs. open</H2>
        <Table
          headers={["", "Hue band", "Who’s there", "Status"]}
          columnAlign={["center", "left", "left", "left"]}
          rowTone={BANDS.map((b) => (b.status === "y" ? "success" : undefined))}
          rows={BANDS.map((b) => [
            <Swatch hex={b.hex} size={22} />,
            <Text as="span" weight="semibold">{b.band}</Text>,
            <Text as="span" tone="secondary">{b.who}</Text>,
            <Stack gap={2}>
              <StatusDot
                v={b.status}
                label={b.status === "y" ? "Open" : b.status === "p" ? "Partial" : "Crowded"}
              />
              <Text as="span" tone="tertiary" size="small">{b.verdict}</Text>
            </Stack>,
          ])}
        />
      </Stack>

      {/* ---- COLOR PSYCHOLOGY ---- */}
      <Stack gap={8}>
        <H2>Color psychology for a reflection app</H2>
        <Text tone="secondary" size="small">
          Fit = suitability for calm, empathetic, anti-blank-page journaling.
        </Text>
        <Table
          headers={["", "Hue", "Connotes", "Fit for Mira"]}
          columnAlign={["center", "left", "left", "left"]}
          rowTone={PSYCH.map((p) => (p.fit === "y" ? "success" : undefined))}
          rows={PSYCH.map((p) => [
            <Swatch hex={p.hex} size={22} />,
            <Text as="span" weight="semibold">{p.hue}</Text>,
            <Text as="span" tone="secondary">{p.connotes}</Text>,
            <Stack gap={2}>
              <StatusDot v={p.fit} label={p.fit === "y" ? "Best" : p.fit === "p" ? "Partial" : "Poor"} />
              <Text as="span" tone="tertiary" size="small">{p.note}</Text>
            </Stack>,
          ])}
        />
        <Callout tone="info" title="Why teal specifically">
          Teal is the rare hue that borrows blue’s trust and lowered arousal while keeping green’s growth and
          renewal — research calls it “alert stillness”: it soothes without sedating. WGSN even named
          “Transformative Teal” its Colour of the Year 2026. For an app about looking inward and coming out
          a little clearer, that duality is the brief.
        </Callout>
      </Stack>

      {/* ---- 6 OPTIONS RATED ---- */}
      <Stack gap={8}>
        <H2>The 6 palettes you ship today, rated for the single-color role</H2>
        <Table
          headers={["Rank", "", "Palette", "On-name / mascot", "Calm fit", "Open lane", "Verdict"]}
          columnAlign={["center", "center", "left", "center", "center", "center", "left"]}
          rowTone={OPTIONS.map((o) => (o.rank === 1 ? "success" : undefined))}
          rows={OPTIONS.map((o) => [
            <Text as="span" weight="bold">{o.rank}</Text>,
            <Swatch hex={o.hex} size={22} />,
            <Stack gap={1}>
              <Text as="span" weight="semibold">{o.name}</Text>
              <Text as="span" tone="tertiary" size="small">{o.hex}</Text>
            </Stack>,
            <Cell v={o.onName} />,
            <Cell v={o.calm} />,
            <Cell v={o.open} />,
            <Text as="span" tone="secondary">{o.verdict}</Text>,
          ])}
        />
      </Stack>

      {/* ---- RECOMMENDED COLOR + LIGHT/DARK TREATMENT ---- */}
      <Stack gap={12}>
        <H2>The pick: “Mira Teal” in light &amp; dark</H2>
        <Text tone="secondary">
          Keep the exact tokens already tuned in <Text as="span" weight="semibold">palette.ts</Text> — they’re
          well chosen. The move is to <Text as="span" weight="semibold">promote the default to the brand color</Text>,
          name it, and build the identity system around it.
        </Text>
        <Grid columns={2} gap={16} align="stretch">
          {/* Light theme demo panel — fixed light background is a faithful
              reproduction of the product's light theme (data, not decoration). */}
          <Card>
            <CardHeader trailing={<Text as="span" size="small" tone="tertiary">light</Text>}>
              Light theme
            </CardHeader>
            <CardBody>
              <div style={{ background: "#ffffff", borderRadius: 8, padding: 16 }}>
                <Stack gap={12}>
                  <Row gap={12} align="center">
                    <span style={{ background: "#0e9e8c", color: "#ffffff", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                      think out loud
                    </span>
                    <span style={{ color: "#0a6d61", fontSize: 13, fontWeight: 600 }}>accent text</span>
                  </Row>
                  <Row gap={10} align="center">
                    {/* Mascot two-tone (accent → strong) shown as two solids, not a gradient */}
                    <span style={{ width: 28, height: 28, borderRadius: 14, background: "#0e9e8c" }} />
                    <span style={{ width: 28, height: 28, borderRadius: 14, background: "#0b8072" }} />
                    <span style={{ width: 60, height: 28, borderRadius: 8, background: "#d7f3ee" }} />
                    <span style={{ color: "#111827", fontSize: 12 }}>accent · strong · soft</span>
                  </Row>
                  <Row gap={10} wrap>
                    <Text as="span" size="small" style={{ color: "#374151" }}>accent #0e9e8c</Text>
                    <Text as="span" size="small" style={{ color: "#374151" }}>strong #0b8072</Text>
                    <Text as="span" size="small" style={{ color: "#374151" }}>text #0a6d61</Text>
                  </Row>
                </Stack>
              </div>
            </CardBody>
          </Card>
          {/* Dark theme demo panel */}
          <Card>
            <CardHeader trailing={<Text as="span" size="small" tone="tertiary">dark</Text>}>
              Dark theme
            </CardHeader>
            <CardBody>
              <div style={{ background: "#04241f", borderRadius: 8, padding: 16 }}>
                <Stack gap={12}>
                  <Row gap={12} align="center">
                    <span style={{ background: "#2dd4bf", color: "#04241f", padding: "8px 14px", borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                      think out loud
                    </span>
                    <span style={{ color: "#2dd4bf", fontSize: 13, fontWeight: 600 }}>accent text</span>
                  </Row>
                  <Row gap={10} align="center">
                    <span style={{ width: 28, height: 28, borderRadius: 14, background: "#2dd4bf" }} />
                    <span style={{ width: 28, height: 28, borderRadius: 14, background: "#14b8a6" }} />
                    <span style={{ width: 60, height: 28, borderRadius: 8, background: "#0f302c" }} />
                    <span style={{ color: "#d1d5db", fontSize: 12 }}>accent · strong · soft</span>
                  </Row>
                  <Row gap={10} wrap>
                    <Text as="span" size="small" style={{ color: "#9ca3af" }}>accent #2dd4bf</Text>
                    <Text as="span" size="small" style={{ color: "#9ca3af" }}>strong #14b8a6</Text>
                    <Text as="span" size="small" style={{ color: "#9ca3af" }}>text #2dd4bf</Text>
                  </Row>
                </Stack>
              </div>
            </CardBody>
          </Card>
        </Grid>
        <Callout tone="neutral" title="Accessibility & dark-mode behavior">
          White on #0e9e8c lands near <Text as="span" weight="semibold">3.3:1</Text> — passes WCAG AA for
          large text and UI components (buttons, the mascot), which is exactly why palette.ts pairs it with a
          darkened <Text as="span" weight="semibold">#0a6d61</Text> for accent-colored body copy (AA ≥ 4.5). In
          dark mode the brighter <Text as="span" weight="semibold">#2dd4bf</Text> clears AA comfortably on the
          near-black surface. Teal is genuinely easier to hit AA in both themes than amber (Honey), whose light
          value struggles on white.
        </Callout>
      </Stack>

      {/* ---- PICKER VERDICT ---- */}
      <Stack gap={12}>
        <H2>The picker: keep or cut?</H2>
        <Grid columns={2} gap={16} align="stretch">
          <Card>
            <CardHeader trailing={<Text as="span" size="small" style={{ color: theme.accent.primary }}>Recommended</Text>}>
              Cut it now
            </CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text>
                  <Text as="span" weight="semibold">Brand recognition compounds.</Text> A young brand’s
                  scarcest asset is a color people can recall. Six rotating accents = no color memory.
                </Text>
                <Divider />
                <Text>
                  <Text as="span" weight="semibold">The mascot IS the accent.</Text> Its body is the{" "}
                  <Text as="span" weight="semibold">--accent → --accent-strong</Text> gradient. A purple Mira
                  isn’t Mira — theming the accent breaks the character.
                </Text>
                <Divider />
                <Text>
                  <Text as="span" weight="semibold">The strong brands commit.</Text> Calm (blue), Headspace
                  (orange), Day One (blue) own one color. The picker-first apps — Reflectly, Daylio, Diarly —
                  are exactly the ones with no identity color.
                </Text>
              </Stack>
            </CardBody>
          </Card>
          <Card>
            <CardHeader>The honest counter-arguments (and the middle path)</CardHeader>
            <CardBody>
              <Stack gap={8}>
                <Text>
                  <Text as="span" weight="semibold">Personalization delights &amp; retains</Text> — the
                  “magic color change” is a real dopamine moment (Reflectly leans on it).
                </Text>
                <Text>
                  <Text as="span" weight="semibold">Accessibility</Text> — some users need to shift hue for
                  color sensitivity or contrast.
                </Text>
                <Divider />
                <Text tone="secondary">
                  So don’t delete the code — <Text as="span" weight="semibold">hide it</Text>. Ship one teal
                  now, then reintroduce theming later as a deliberate, possibly-gated “delight” that recolors
                  UI accents <Text as="span" italic>but never the mascot</Text>, plus a dedicated
                  high-contrast / colorblind-friendly mode that earns its keep on accessibility rather than
                  vanity.
                </Text>
              </Stack>
            </CardBody>
          </Card>
        </Grid>
      </Stack>

      {/* ---- DIFFERENTIATION ---- */}
      <Callout tone="info" title="How this makes Mira stand out">
        Mira owns a specific <Text as="span" weight="semibold">“mirror-water” teal</Text> — deeper and greener
        than Day One’s airy sky blue, brighter than Calm’s navy, and nowhere near Headspace’s orange or
        Reflectly’s violet. Yes, teal appears in wellness (Insight Timer, Finch) — but never on a journaling
        headliner, and never <Text as="span" italic>embodied by a character</Text>. One committed hue + one
        teal reflection-droplet that literally is that hue = a brand you recognize from the home-screen icon
        alone. That compounding recognition is worth far more to a young app than a color picker ever could be.
      </Callout>
    </Stack>
  );
}
