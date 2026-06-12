// Genera los íconos de Magsave a partir del chanchito de lucide (licencia ISC).
//
// Uso:
//   npm install --no-save sharp
//   node scripts/generate-icons.js
//
// Sobrescribe icon.png, android-icon-*.png, splash-icon.png y favicon.png
// en assets/images/.

const path = require('path');
const sharp = require('sharp');

const OUT = path.join(__dirname, '..', 'assets', 'images');

const VIOLET = '#7C6FF7';
const WHITE = '#FFFFFF';

// Paths del ícono piggy-bank de lucide (viewBox 24x24, stroke 2)
const PIGGY_PATHS = [
  'M11 17h3v2a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-3a3.16 3.16 0 0 0 2-2h1a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1h-1a5 5 0 0 0-2-4V3a4 4 0 0 0-3.2 1.6l-.3.4H11a6 6 0 0 0-6 6v1a5 5 0 0 0 2 4v3a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1z',
  'M16 10h.01',
  'M2 8v1a2 2 0 0 0 2 2h1',
];

function piggySvg({ size, color, scale, bg = null, radius = 0 }) {
  const inner = size * scale;
  const offset = (size - inner) / 2;
  const paths = PIGGY_PATHS.map((d) => `<path d="${d}"/>`).join('');
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      (bg ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>` : '') +
      `<g transform="translate(${offset} ${offset}) scale(${inner / 24})" ` +
      `fill="none" stroke="${color}" stroke-width="2" ` +
      `stroke-linecap="round" stroke-linejoin="round">${paths}</g>` +
      `</svg>`,
  );
}

async function write(name, svg) {
  await sharp(svg).png().toFile(path.join(OUT, name));
  console.log('✓', name);
}

async function main() {
  // Ícono principal (iOS / genérico): chanchito blanco sobre violeta
  await write('icon.png', piggySvg({ size: 1024, color: WHITE, scale: 0.58, bg: VIOLET }));

  // Adaptive icon de Android: capa de frente (transparente), fondo y monocromo.
  // La zona segura del adaptive icon es el 66% central.
  await write(
    'android-icon-foreground.png',
    piggySvg({ size: 1024, color: WHITE, scale: 0.42 }),
  );
  await write(
    'android-icon-background.png',
    piggySvg({ size: 1024, color: VIOLET, scale: 0, bg: VIOLET }),
  );
  await write(
    'android-icon-monochrome.png',
    piggySvg({ size: 1024, color: WHITE, scale: 0.42 }),
  );

  // Splash: chanchito violeta sobre transparente (el fondo crema lo pone app.json)
  await write('splash-icon.png', piggySvg({ size: 512, color: VIOLET, scale: 0.8 }));

  // Favicon (web)
  await write(
    'favicon.png',
    piggySvg({ size: 64, color: WHITE, scale: 0.7, bg: VIOLET, radius: 14 }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
