import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const imagesRoot = path.resolve(__dirname, '../public/images');

/** @param {string} dir */
async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else if (/\.(jpe?g|png)$/i.test(entry.name)) files.push(full);
  }
  return files;
}

/** @param {string} file */
function isHero(file) {
  return /planification-hero|accueil-qr-hero/i.test(file);
}

/** @param {string} file */
async function optimize(file) {
  const rel = path.relative(imagesRoot, file);
  const base = file.replace(/\.(jpe?g|png)$/i, '');

  if (isHero(file)) {
    for (const width of [768, 1280, 1920]) {
      const out = `${base}-${width}.webp`;
      await sharp(file)
        .resize(width, null, { withoutEnlargement: true })
        .webp({ quality: 82 })
        .toFile(out);
    }
    await sharp(file)
      .resize(1920, null, { withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(`${base}.webp`);
    console.log(`✓ hero ${rel} → webp (768/1280/1920)`);
    return;
  }

  const info = await stat(file);
  const maxWidth = /gallery/i.test(file) ? 800 : /services/i.test(file) ? 900 : 1200;
  const out = `${base}.webp`;
  await sharp(file)
    .resize(maxWidth, null, { withoutEnlargement: true })
    .webp({ quality: 80 })
    .toFile(out);

  const saved = ((info.size - (await stat(out)).size) / 1024).toFixed(0);
  console.log(`✓ ${rel} → webp (~${saved} KiB saved)`);
}

const files = await walk(imagesRoot);
await Promise.all(files.map((file) => optimize(file)));

/** Hero landing — photo mariage N&B responsive */
const landingHeroSrc = path.join(imagesRoot, 'gallery/gallery-couple-road.png');
const landingHeroOut = path.join(imagesRoot, 'hero');
await import('node:fs/promises').then(({ mkdir }) => mkdir(landingHeroOut, { recursive: true }));

for (const width of [768, 1280, 1920]) {
  await sharp(landingHeroSrc)
    .resize(width, null, { withoutEnlargement: true })
    .grayscale()
    .modulate({ brightness: 0.92, saturation: 0 })
    .webp({ quality: 82 })
    .toFile(path.join(landingHeroOut, `landing-${width}.webp`));
}
console.log('✓ hero/landing → webp N&B (768/1280/1920)');

console.log(`Optimized ${files.length} images.`);
