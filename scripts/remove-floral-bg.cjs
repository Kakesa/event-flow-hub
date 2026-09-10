const sharp = require('sharp');
const path = require('path');

const dir = path.join(__dirname, '..', 'public', 'images', 'marque-tables');

function bgScore(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const avg = (r + g + b) / 3;
  const sat = max - min;
  if (avg < 175) return 100;
  return sat * 1.8 + (255 - avg) * 0.55;
}

async function process(input, output) {
  const { data, info } = await sharp(input)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const n = w * h;

  // 1) supprimer globalement les pixels "papier / crème"
  for (let i = 0; i < n; i += 1) {
    const o = i * 4;
    if (bgScore(data[o], data[o + 1], data[o + 2]) <= 44) {
      data[o + 3] = 0;
    }
  }

  // 2) flood fill depuis les bords pour le reste du blanc connecté
  const mark = new Uint8Array(n);
  const q = [];
  const push = (x, y, limit) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = y * w + x;
    if (mark[i] || data[i * 4 + 3] === 0) {
      mark[i] = 1;
      return;
    }
    const o = i * 4;
    if (bgScore(data[o], data[o + 1], data[o + 2]) > limit) return;
    mark[i] = 1;
    data[o + 3] = 0;
    q.push(i);
  };

  for (let x = 0; x < w; x += 1) {
    push(x, 0, 70);
    push(x, h - 1, 70);
  }
  for (let y = 0; y < h; y += 1) {
    push(0, y, 70);
    push(w - 1, y, 70);
  }

  let qi = 0;
  while (qi < q.length) {
    const i = q[qi];
    qi += 1;
    const x = i % w;
    const y = (i / w) | 0;
    push(x + 1, y, 70);
    push(x - 1, y, 70);
    push(x, y + 1, 70);
    push(x, y - 1, 70);
  }

  // 3) nettoyer halo clair au contact du transparent
  const snap = Buffer.from(data);
  for (let y = 1; y < h - 1; y += 1) {
    for (let x = 1; x < w - 1; x += 1) {
      const o = (y * w + x) * 4;
      if (snap[o + 3] === 0) continue;
      let t = 0;
      for (const [dx, dy] of [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ]) {
        if (snap[((y + dy) * w + (x + dx)) * 4 + 3] === 0) t += 1;
      }
      if (!t) continue;
      if (bgScore(snap[o], snap[o + 1], snap[o + 2]) <= 58) {
        data[o + 3] = 0;
      }
    }
  }

  await sharp(data, { raw: { width: w, height: h, channels: 4 } })
    .png()
    .toFile(output);
  console.log('OK', path.basename(output));
}

(async () => {
  await process(path.join(dir, 'floral-corner.jpg'), path.join(dir, 'floral-corner.png'));
  await process(path.join(dir, 'floral-branch.jpg'), path.join(dir, 'floral-branch.png'));
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
