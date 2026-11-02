// Crea build/icon.png y build/icon.ico a partir del logo.
// Uso: electron scripts/make-icon.js
const { app, BrowserWindow, nativeImage } = require('electron');
const fs = require('fs');
const path = require('path');

const SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <rect x="8" y="8" width="240" height="240" rx="58" fill="#ffffff"/>
  <g transform="translate(128 128) scale(7.4) translate(-12 -12)" fill="#000" stroke="#000" stroke-width=".6" stroke-linejoin="round">
    <rect x="4" y="4" width="7" height="7" rx="1.6"/>
    <rect x="13" y="4" width="7" height="7" rx="1.6"/>
    <rect x="4" y="13" width="7" height="7" rx="1.6"/>
    <path d="M14.2 13.4v6.2l5.6-3.1z"/>
  </g>
</svg>`;

// Un .ico puede guardar varias imágenes PNG de distintos tamaños
function buildIco(pngs) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(pngs.length, 4);
  const dir = Buffer.alloc(16 * pngs.length);
  let offset = 6 + 16 * pngs.length;
  pngs.forEach((p, k) => {
    const o = k * 16;
    dir.writeUInt8(p.size >= 256 ? 0 : p.size, o);
    dir.writeUInt8(p.size >= 256 ? 0 : p.size, o + 1);
    dir.writeUInt16LE(1, o + 4);
    dir.writeUInt16LE(32, o + 6);
    dir.writeUInt32LE(p.buf.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += p.buf.length;
  });
  return Buffer.concat([header, dir, ...pngs.map((p) => p.buf)]);
}

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 256,
    height: 256,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: { offscreen: true },
  });
  const html = `<html><body style="margin:0;background:transparent">${SVG}</body></html>`;
  await win.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(html)}`);
  await new Promise((r) => setTimeout(r, 400));
  const img = (await win.webContents.capturePage({ x: 0, y: 0, width: 256, height: 256 })).resize({ width: 256, height: 256, quality: 'best' });

  const out = path.join(__dirname, '..', 'build');
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'icon.png'), img.toPNG());
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngs = sizes.map((size) => ({
    size,
    buf: size === 256 ? img.toPNG() : nativeImage.createFromBuffer(img.toPNG()).resize({ width: size, height: size, quality: 'best' }).toPNG(),
  }));
  fs.writeFileSync(path.join(out, 'icon.ico'), buildIco(pngs));
  const alpha = img.toBitmap()[3];
  console.log(`Ícono creado. Esquina transparente: ${alpha === 0 ? 'sí' : 'no'}`);
  app.quit();
});
