// Descarga y guarda las portadas, fondos y logos de cada juego.
const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');

let artRoot = '';
let steamRoot = null;

function init(userData, steamDir) {
  artRoot = path.join(userData, 'art');
  fs.mkdirSync(artRoot, { recursive: true });
  steamRoot = steamDir;
}

const dirOf = (g) => path.join(artRoot, g.id.replace(/[^a-z0-9_-]/gi, '_'));

function findFile(dir, base) {
  for (const ext of ['.jpg', '.png', '.webp', '.jpeg']) {
    const p = path.join(dir, base + ext);
    if (fs.existsSync(p)) return p;
  }
  return null;
}

function toUrl(p) {
  if (!p) return null;
  return `${pathToFileURL(p).href}?v=${Math.round(fs.statSync(p).mtimeMs)}`;
}

// Lo que ya está guardado. La portada elegida por el usuario tiene prioridad.
function cached(g) {
  const d = dirOf(g);
  return {
    cover: toUrl(findFile(d, 'cover-custom') || findFile(d, 'cover')),
    hero: toUrl(findFile(d, 'hero')),
    logo: toUrl(findFile(d, 'logo')),
    icon: toUrl(findFile(d, 'icon')),
  };
}

// Súbelo cuando agregues nuevas fuentes de imágenes, para que se vuelvan a buscar
const ART_VERSION = 2;

// Ya se buscó en los últimos 7 días
function complete(g) {
  try {
    const meta = JSON.parse(fs.readFileSync(path.join(dirOf(g), 'meta.json'), 'utf8'));
    return meta.v === ART_VERSION && Date.now() - meta.at < 7 * 864e5;
  } catch {
    return false;
  }
}

async function download(url, dest) {
  const res = await fetch(url, { signal: AbortSignal.timeout(15000) });
  if (!res.ok || !(res.headers.get('content-type') || '').startsWith('image')) throw new Error('no image');
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 2000) throw new Error('too small');
  fs.writeFileSync(dest, buf);
  return dest;
}

async function firstOk(urls, dest) {
  for (const u of urls) {
    try { return await download(u, dest); } catch {}
  }
  return null;
}

const steamUrls = (id, file) => [
  `https://shared.akamai.steamstatic.com/store_item_assets/steam/apps/${id}/${file}`,
  `https://cdn.cloudflare.steamstatic.com/steam/apps/${id}/${file}`,
];

// Steam también guarda las imágenes en su caché local (a veces en subcarpetas)
function copyFromSteamCache(appid, name, dest) {
  if (!steamRoot) return null;
  const base = path.join(steamRoot, 'appcache', 'librarycache', String(appid));
  const stack = [base];
  while (stack.length) {
    const dir = stack.pop();
    let entries = [];
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { continue; }
    for (const e of entries) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) stack.push(p);
      else if (e.name === name) { fs.copyFileSync(p, dest); return dest; }
    }
  }
  return null;
}

const simplify = (s) => s.toLowerCase().replace(/[®™©:'’\-.]/g, '').replace(/\s+/g, ' ').trim();

// Para juegos que no son de Steam, buscamos si existen en Steam para usar su arte
async function findSteamAppId(name) {
  try {
    const res = await fetch(
      `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(name)}&cc=us&l=english`,
      { signal: AbortSignal.timeout(10000) },
    );
    const json = await res.json();
    const items = json.items || [];
    const want = simplify(name);
    const hit = items.find((i) => simplify(i.name) === want)
      || (want.length >= 4 && items.find((i) => simplify(i.name).startsWith(want) || want.startsWith(simplify(i.name))));
    return hit ? String(hit.id) : null;
  } catch {
    return null;
  }
}

// Imágenes oficiales de la Microsoft Store (portada "Poster" y fondo "SuperHeroArt")
async function microsoftStoreImages(id) {
  const out = {};
  try {
    const res = await fetch(
      `https://displaycatalog.mp.microsoft.com/v7.0/products?bigIds=${id}&market=US&languages=en-us`,
      { signal: AbortSignal.timeout(10000) },
    );
    const json = await res.json();
    for (const img of json.Products?.[0]?.LocalizedProperties?.[0]?.Images || []) {
      if (!out[img.ImagePurpose]) out[img.ImagePurpose] = `https:${img.Uri}`;
    }
  } catch {}
  return out;
}

async function resolve(g) {
  const d = dirOf(g);
  fs.mkdirSync(d, { recursive: true });
  const has = (base) => findFile(d, base);
  const out = (file) => path.join(d, file);

  const appid = g.appid || (await findSteamAppId(g.name));
  if (appid) {
    if (!has('cover')) {
      (await firstOk([...steamUrls(appid, 'library_600x900_2x.jpg'), ...steamUrls(appid, 'library_600x900.jpg')], out('cover.jpg')))
        || copyFromSteamCache(appid, 'library_600x900.jpg', out('cover.jpg'))
        || copyFromSteamCache(appid, 'library_capsule.jpg', out('cover.jpg'));
    }
    if (!has('hero')) {
      (await firstOk(steamUrls(appid, 'library_hero.jpg'), out('hero.jpg')))
        || copyFromSteamCache(appid, 'library_hero.jpg', out('hero.jpg'));
    }
    if (!has('logo')) {
      (await firstOk(steamUrls(appid, 'logo.png'), out('logo.png')))
        || copyFromSteamCache(appid, 'logo.png', out('logo.png'));
    }
  }

  const epic = g.epicImages || {};
  if (!has('cover') && epic.DieselGameBoxTall) await firstOk([epic.DieselGameBoxTall], out('cover.jpg'));
  if (!has('hero') && epic.DieselGameBox) await firstOk([epic.DieselGameBox], out('hero.jpg'));
  if (!has('logo') && epic.DieselGameBoxLogo) await firstOk([epic.DieselGameBoxLogo], out('logo.png'));

  if (g.msStoreId && (!has('cover') || !has('hero'))) {
    const imgs = await microsoftStoreImages(g.msStoreId);
    if (!has('cover') && imgs.Poster) await firstOk([`${imgs.Poster}?w=600`], out('cover.jpg'));
    if (!has('hero') && imgs.SuperHeroArt) await firstOk([`${imgs.SuperHeroArt}?w=1920`], out('hero.jpg'));
  }

  if (!has('icon') && g.localLogo && fs.existsSync(g.localLogo)) {
    fs.copyFileSync(g.localLogo, out('icon.png'));
  }

  fs.writeFileSync(out('meta.json'), JSON.stringify({ v: ART_VERSION, at: Date.now(), appid }));
  return cached(g);
}

function setCustomCover(g, file) {
  const d = dirOf(g);
  fs.mkdirSync(d, { recursive: true });
  for (const ext of ['.jpg', '.png', '.webp', '.jpeg']) {
    fs.rmSync(path.join(d, `cover-custom${ext}`), { force: true });
  }
  const ext = path.extname(file).toLowerCase() || '.jpg';
  fs.copyFileSync(file, path.join(d, `cover-custom${ext}`));
  return cached(g);
}

// Al renombrar un juego sin portada, se vuelve a buscar con el nombre nuevo
function forget(g) {
  const d = dirOf(g);
  if (findFile(d, 'cover') || findFile(d, 'cover-custom')) return false;
  fs.rmSync(path.join(d, 'meta.json'), { force: true });
  return true;
}

module.exports = { init, cached, complete, resolve, setCustomCover, forget };
