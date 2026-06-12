// Genera los íconos de Magsave a partir del chanchito de Phosphor (licencia MIT).
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

// Path del ícono piggy-bank de Phosphor, peso "fill" (viewBox 256x256)
const PIGGY_FILL =
  'M226 88.08c-.4-1-.82-2-1.25-3a87.93 87.93 0 0 0-30.17-37H216a8 8 0 0 0 0-16H112a88.12 88.12 0 0 0-87.72 81A32 32 0 0 0 0 144a8 8 0 0 0 16 0 16 16 0 0 1 8.57-14.16A87.7 87.7 0 0 0 46 178.22l12.56 35.16A16 16 0 0 0 73.64 224h12.72a16 16 0 0 0 15.07-10.62l1.92-5.38h57.3l1.92 5.38A16 16 0 0 0 177.64 224h12.72a16 16 0 0 0 15.07-10.62L221.64 168H224a24 24 0 0 0 24-24v-32a24 24 0 0 0-22-23.92M152 72h-40a8 8 0 0 1 0-16h40a8 8 0 0 1 0 16m28 56a12 12 0 1 1 12-12 12 12 0 0 1-12 12';

function piggySvg({ size, color, scale, bg = null, radius = 0 }) {
  const inner = size * scale;
  const offset = (size - inner) / 2;
  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">` +
      (bg ? `<rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>` : '') +
      `<g transform="translate(${offset} ${offset}) scale(${inner / 256})" fill="${color}">` +
      `<path d="${PIGGY_FILL}"/></g>` +
      `</svg>`,
  );
}

async function write(name, svg) {
  await sharp(svg).png().toFile(path.join(OUT, name));
  console.log('✓', name);
}

async function main() {
  // Ícono principal (iOS / genérico): chanchito blanco sobre violeta
  await write('icon.png', piggySvg({ size: 1024, color: WHITE, scale: 0.62, bg: VIOLET }));

  // Adaptive icon de Android: capa de frente (transparente), fondo y monocromo.
  // La zona segura del adaptive icon es el 66% central.
  await write(
    'android-icon-foreground.png',
    piggySvg({ size: 1024, color: WHITE, scale: 0.46 }),
  );
  await write(
    'android-icon-background.png',
    piggySvg({ size: 1024, color: VIOLET, scale: 0, bg: VIOLET }),
  );
  await write(
    'android-icon-monochrome.png',
    piggySvg({ size: 1024, color: WHITE, scale: 0.46 }),
  );

  // Splash: chanchito blanco sobre transparente (el fondo oscuro lo pone app.json)
  await write('splash-icon.png', piggySvg({ size: 512, color: WHITE, scale: 0.85 }));

  // Favicon (web)
  await write(
    'favicon.png',
    piggySvg({ size: 64, color: WHITE, scale: 0.74, bg: VIOLET, radius: 14 }),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
