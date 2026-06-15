import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const publicDir = path.join(root, 'public');
const source = path.join(publicDir, 'images', 'logo-white.png');

const themeBg = '#1a1a2e';

const writeIcon = async (filename, size, { maskable = false } = {}) => {
  const output = path.join(publicDir, filename);
  const logoSize = maskable ? Math.round(size * 0.62) : Math.round(size * 0.88);
  const logo = await sharp(source)
    .resize(logoSize, logoSize, { fit: 'contain', background: maskable ? themeBg : '#ffffff' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: maskable ? themeBg : '#ffffff',
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(output);

  console.log(`✓ ${filename} (${size}x${size}${maskable ? ', maskable' : ''})`);
};

await mkdir(publicDir, { recursive: true });

await writeIcon('pwa-icon-192.png', 192);
await writeIcon('pwa-icon-512.png', 512);
await writeIcon('pwa-icon-512-maskable.png', 512, { maskable: true });
await writeIcon('apple-touch-icon.png', 180);

console.log('PWA icons generated from images/logo-white.png');
