import sharp from 'sharp'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const svg = readFileSync(join(root, 'public', 'icon.svg'))

const targets = [
  { size: 192, name: 'pwa-192x192.png' },
  { size: 512, name: 'pwa-512x512.png' },
  // iOS applies its own rounded mask, so flatten onto a solid bg to avoid
  // black corners from the source SVG's transparent rounded-rect edges.
  { size: 180, name: 'apple-touch-icon.png', flatten: '#eef4f2' },
]

for (const t of targets) {
  let img = sharp(svg, { density: 384 }).resize(t.size, t.size)
  if (t.flatten) img = img.flatten({ background: t.flatten })
  await img.png().toFile(join(root, 'public', t.name))
  console.log('wrote', t.name)
}
