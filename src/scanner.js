// Busca los juegos instalados en Steam, Epic, Xbox y Roblox.
const fs = require('fs');
const path = require('path');
const { execFileSync, execFile } = require('child_process');
const { promisify } = require('util');
const execFileP = promisify(execFile);
// PowerShell sin bloquear la app
const runPs = async (ps) => (await execFileP('powershell', ['-NoProfile', '-Command', ps], { encoding: 'utf8', windowsHide: true, maxBuffer: 32 * 1024 * 1024 })).stdout;

// Apps de Steam que no son juegos
const STEAM_SKIP = new Set([
  '228980',  // Steamworks Common Redistributables
  '431960',  // Wallpaper Engine
  '250820',  // SteamVR
  '1070560', '1391110', '1628350', '1493710', '2180100', '1826330', // Proton / runtimes
]);

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8').replace(/^\uFEFF/, ''));

function vdfValue(text, key) {
  const m = text.match(new RegExp(`"${key}"\\s+"([^"]*)"`, 'i'));
  return m ? m[1] : null;
}

function findSteamRoot() {
  try {
    const out = execFileSync('reg', ['query', 'HKCU\\Software\\Valve\\Steam', '/v', 'SteamPath'], { encoding: 'utf8' });
    const m = out.match(/SteamPath\s+REG_SZ\s+(.+)/);
    if (m) return path.normalize(m[1].trim());
  } catch {}
  const fallback = 'C:\\Program Files (x86)\\Steam';
  return fs.existsSync(fallback) ? fallback : null;
}

function scanSteam(root) {
  if (!root) return [];
  const libs = new Set([root.toLowerCase()]);
  try {
    const vdf = fs.readFileSync(path.join(root, 'steamapps', 'libraryfolders.vdf'), 'utf8');
    for (const m of vdf.matchAll(/"path"\s+"([^"]+)"/g)) {
      libs.add(path.normalize(m[1].replace(/\\\\/g, '\\')).toLowerCase());
    }
  } catch {}

  const games = [];
  for (const lib of libs) {
    const dir = path.join(lib, 'steamapps');
    let files = [];
    try { files = fs.readdirSync(dir).filter((f) => /^appmanifest_\d+\.acf$/.test(f)); } catch { continue; }
    for (const f of files) {
      try {
        const t = fs.readFileSync(path.join(dir, f), 'utf8');
        const appid = vdfValue(t, 'appid');
        if (!appid || STEAM_SKIP.has(appid)) continue;
        games.push({
          id: `steam-${appid}`,
          source: 'steam',
          name: vdfValue(t, 'name') || `App ${appid}`,
          appid,
          installPath: path.join(dir, 'common', vdfValue(t, 'installdir') || ''),
          lastPlayed: Number(vdfValue(t, 'LastPlayed') || 0) * 1000,
          launch: { type: 'url', url: `steam://rungameid/${appid}` },
        });
      } catch {}
    }
  }
  return games;
}

// El launcher de Epic guarda su catálogo (con portadas) en base64
function readEpicCatalog() {
  const map = new Map();
  try {
    const raw = fs.readFileSync('C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Catalog\\catcache.bin', 'utf8');
    const items = JSON.parse(Buffer.from(raw.trim(), 'base64').toString('utf8'));
    for (const it of items) if (it && it.id) map.set(it.id, it);
  } catch {}
  return map;
}

function scanEpic() {
  const dir = 'C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests';
  let files = [];
  try { files = fs.readdirSync(dir).filter((f) => f.endsWith('.item')); } catch { return []; }
  const catalog = readEpicCatalog();
  const games = [];
  for (const f of files) {
    try {
      const j = readJson(path.join(dir, f));
      // Saltar DLCs y contenido extra
      if (j.bIsApplication === false || !j.LaunchExecutable) continue;
      if (j.MainGameAppName && j.MainGameAppName !== j.AppName) continue;
      const images = {};
      for (const k of catalog.get(j.CatalogItemId)?.keyImages || []) images[k.type] = k.url;
      const key = encodeURIComponent(`${j.CatalogNamespace}:${j.CatalogItemId}:${j.AppName}`);
      games.push({
        id: `epic-${j.AppName}`,
        source: 'epic',
        name: j.DisplayName,
        installPath: j.InstallLocation,
        lastPlayed: 0,
        epicImages: images,
        launch: { type: 'url', url: `com.epicgames.launcher://apps/${key}?action=launch&silent=true` },
      });
    } catch {}
  }
  return games;
}

async function scanXbox() {
  const found = [];
  for (const letter of 'CDEFGHIJK') {
    const root = `${letter}:\\XboxGames`;
    let dirs = [];
    try { dirs = fs.readdirSync(root); } catch { continue; }
    for (const d of dirs) {
      const content = path.join(root, d, 'Content');
      const cfgFile = path.join(content, 'MicrosoftGame.config');
      if (!fs.existsSync(cfgFile)) continue;
      const t = fs.readFileSync(cfgFile, 'utf8');
      const name = (t.match(/<Identity[^>]*\sName="([^"]+)"/) || [])[1];
      const exeId = (t.match(/<Executable[^>]*\sId="([^"]+)"/) || [])[1];
      if (!name || !exeId) continue;
      found.push({
        identity: name,
        exeId,
        name: (t.match(/DefaultDisplayName="([^"]+)"/) || [])[1] || d,
        dir: content,
        logo: (t.match(/Square480x480Logo="([^"]+)"/) || [])[1],
      });
    }
  }
  if (!found.length) return [];

  // Windows necesita el "PackageFamilyName" para abrir el juego
  const families = {};
  try {
    const names = found.map((f) => `'${f.identity.replace(/'/g, '')}'`).join(',');
    const ps = `Get-AppxPackage | ? { @(${names}) -contains $_.Name } | % { $_.Name + '|' + $_.PackageFamilyName }`;
    const out = await runPs(ps);
    for (const line of out.split(/\r?\n/)) {
      const [n, pfn] = line.split('|');
      if (pfn) families[n] = pfn.trim();
    }
  } catch {}

  return found.filter((f) => families[f.identity]).map((f) => ({
    id: `xbox-${f.identity}`,
    source: 'xbox',
    name: f.name,
    installPath: f.dir,
    lastPlayed: 0,
    localLogo: f.logo ? path.join(f.dir, f.logo) : null,
    launch: { type: 'shell', target: `shell:AppsFolder\\${families[f.identity]}!${f.exeId}` },
  }));
}

function scanRoblox() {
  const versions = path.join(process.env.LOCALAPPDATA || '', 'Roblox', 'Versions');
  let dirs = [];
  try { dirs = fs.readdirSync(versions); } catch { return []; }
  const exes = dirs
    .map((d) => path.join(versions, d, 'RobloxPlayerBeta.exe'))
    .filter((p) => fs.existsSync(p))
    .sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  if (!exes.length) return [];
  return [{
    id: 'roblox',
    source: 'otros',
    name: 'Roblox',
    installPath: path.dirname(exes[0]),
    lastPlayed: 0,
    msStoreId: '9NBLGGGZM6WM', // Roblox en la Microsoft Store (para la portada)
    launch: { type: 'exe', path: exes[0] },
  }];
}

// EA, Ubisoft, Battle.net, GOG y Riot: se leen del registro de Windows
const exeOf = (s) => {
  const m = String(s || '').match(/^"?([^"]+?\.exe)/i);
  return m ? m[1] : null;
};

async function scanRegistryLaunchers() {
  const ps = `
$u = 'HKLM:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKLM:\\SOFTWARE\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*','HKCU:\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*'
$apps = @(Get-ItemProperty $u -EA 0 | ? DisplayName | select PSChildName,DisplayName,Publisher,InstallLocation,DisplayIcon,UninstallString)
$gog = @(Get-ItemProperty 'HKLM:\\SOFTWARE\\WOW6432Node\\GOG.com\\Games\\*' -EA 0 | select gameID,gameName,exe,path,launchParam)
$ubi = @(Get-ChildItem 'HKLM:\\SOFTWARE\\WOW6432Node\\Ubisoft\\Launcher\\Installs' -EA 0 | % { [pscustomobject]@{ id = $_.PSChildName; dir = (Get-ItemProperty $_.PSPath).InstallDir } })
@{ apps = $apps; gog = $gog; ubi = $ubi } | ConvertTo-Json -Depth 3 -Compress`;
  let data;
  try {
    data = JSON.parse(await runPs(ps));
  } catch { return []; }
  const arr = (x) => (Array.isArray(x) ? x : x ? [x] : []);
  const apps = arr(data.apps);
  const games = [];

  for (const a of apps) {
    const un = String(a.UninstallString || '');
    // Riot (League of Legends, Valorant...)
    const riot = un.match(/^"?([^"]*RiotClientServices\.exe)"?.*--uninstall-product=(\S+).*--uninstall-patchline=(\S+)/i);
    if (riot) {
      if (/riot_client/i.test(riot[2])) continue;
      games.push({
        id: `riot-${riot[2]}`, source: 'riot', name: a.DisplayName,
        installPath: a.InstallLocation || path.dirname(riot[1]), lastPlayed: 0,
        launch: { type: 'exe', path: riot[1], args: [`--launch-product=${riot[2]}`, `--launch-patchline=${riot[3]}`] },
      });
      continue;
    }
    const icon = exeOf(a.DisplayIcon);
    const goodExe = icon && !/unins|uninstall|cleanup|installer|setup/i.test(path.basename(icon)) && fs.existsSync(icon);
    // Battle.net (Overwatch, Diablo...)
    if (/Battle\.net/i.test(un) && !/^Battle\.net$/i.test(a.DisplayName) && goodExe) {
      games.push({
        id: `battlenet-${a.PSChildName}`, source: 'battlenet', name: a.DisplayName,
        installPath: a.InstallLocation || path.dirname(icon), lastPlayed: 0,
        launch: { type: 'exe', path: icon },
      });
      continue;
    }
    // EA app
    if (/Electronic Arts/i.test(a.Publisher || '') && !/^(EA app|EA Desktop|Origin)/i.test(a.DisplayName) && goodExe) {
      games.push({
        id: `ea-${a.PSChildName}`, source: 'ea', name: a.DisplayName,
        installPath: a.InstallLocation || path.dirname(icon), lastPlayed: 0,
        launch: { type: 'exe', path: icon },
      });
    }
  }

  // Ubisoft Connect
  for (const u of arr(data.ubi)) {
    if (!u.dir || !fs.existsSync(u.dir)) continue;
    const entry = apps.find((a) => a.PSChildName === `Uplay Install ${u.id}`);
    games.push({
      id: `ubisoft-${u.id}`, source: 'ubisoft',
      name: entry?.DisplayName || path.basename(path.normalize(u.dir)),
      installPath: u.dir, lastPlayed: 0,
      launch: { type: 'url', url: `uplay://launch/${u.id}/0` },
    });
  }

  // GOG
  for (const g of arr(data.gog)) {
    if (!g.exe || !fs.existsSync(g.exe)) continue;
    games.push({
      id: `gog-${g.gameID}`, source: 'gog', name: g.gameName,
      installPath: g.path || path.dirname(g.exe), lastPlayed: 0,
      launch: { type: 'exe', path: g.exe, args: g.launchParam ? String(g.launchParam).split(' ') : [] },
    });
  }
  return games;
}

// Lector simple del formato de texto de Steam (VDF / KeyValues)
function parseVdf(text) {
  let i = 0;
  const n = text.length;
  const skip = () => {
    while (i < n) {
      const c = text[i];
      if (c === ' ' || c === '\t' || c === '\r' || c === '\n') i++;
      else if (c === '/' && text[i + 1] === '/') { while (i < n && text[i] !== '\n') i++; }
      else break;
    }
  };
  const str = () => {
    i++;
    let s = '';
    while (i < n && text[i] !== '"') {
      if (text[i] === '\\' && i + 1 < n) { s += text[i + 1]; i += 2; } else s += text[i++];
    }
    i++;
    return s;
  };
  const obj = () => {
    const o = {};
    for (;;) {
      skip();
      if (i >= n) return o;
      if (text[i] === '}') { i++; return o; }
      if (text[i] !== '"') { i++; continue; }
      const key = str();
      skip();
      if (text[i] === '{') { i++; o[key] = obj(); }
      else if (text[i] === '"') o[key] = str();
    }
  };
  return obj();
}

// Busca una clave sin importar mayúsculas
const pick = (o, key) => {
  if (!o) return undefined;
  const k = Object.keys(o).find((x) => x.toLowerCase() === key.toLowerCase());
  return k ? o[k] : undefined;
};

// Tiempo jugado de Steam (minutos) desde localconfig.vdf de la cuenta más reciente
function steamPlaytime(root) {
  const out = {};
  if (!root) return out;
  let best = null;
  try {
    for (const u of fs.readdirSync(path.join(root, 'userdata'))) {
      const f = path.join(root, 'userdata', u, 'config', 'localconfig.vdf');
      try {
        const m = fs.statSync(f).mtimeMs;
        if (!best || m > best.m) best = { f, m };
      } catch {}
    }
    if (!best) return out;
    const data = parseVdf(fs.readFileSync(best.f, 'utf8'));
    const apps = pick(pick(pick(pick(pick(data, 'UserLocalConfigStore'), 'Software'), 'Valve'), 'Steam'), 'apps') || {};
    for (const [id, v] of Object.entries(apps)) {
      if (typeof v !== 'object') continue;
      out[id] = { minutes: Number(pick(v, 'Playtime') || 0), last: Number(pick(v, 'LastPlayed') || 0) * 1000 };
    }
  } catch {}
  return out;
}

// Juegos que el usuario agregó a mano
function scanCustom(list = []) {
  return list.filter((c) => c.path && fs.existsSync(c.path)).map((c) => ({
    id: c.id,
    source: 'otros',
    name: c.name,
    installPath: path.dirname(c.path),
    lastPlayed: 0,
    custom: true,
    launch: { type: 'exe', path: c.path },
  }));
}

async function scanAll(custom) {
  const steamRoot = findSteamRoot();
  const games = [];
  // Todas las búsquedas al mismo tiempo
  const results = await Promise.all([() => scanSteam(steamRoot), scanEpic, scanXbox, scanRoblox, scanRegistryLaunchers, () => scanCustom(custom)]
    .map(async (scan) => { try { return await scan(); } catch { return []; } }));
  for (const r of results) games.push(...r);
  const pt = steamPlaytime(steamRoot);
  for (const g of games) {
    const p = g.appid && pt[g.appid];
    if (p) {
      g.playtime = p.minutes;
      g.lastPlayed = Math.max(g.lastPlayed || 0, p.last);
    }
  }
  return { games, steamRoot };
}

// Carpetas a vigilar para detectar juegos nuevos
function watchDirs() {
  const dirs = ['C:\\ProgramData\\Epic\\EpicGamesLauncher\\Data\\Manifests'];
  const root = findSteamRoot();
  if (root) {
    dirs.push(path.join(root, 'steamapps'));
    try {
      const vdf = fs.readFileSync(path.join(root, 'steamapps', 'libraryfolders.vdf'), 'utf8');
      for (const m of vdf.matchAll(/"path"\s+"([^"]+)"/g)) dirs.push(path.join(m[1].replace(/\\\\/g, '\\'), 'steamapps'));
    } catch {}
  }
  for (const l of 'CDEFGHIJK') dirs.push(`${l}:\\XboxGames`);
  return [...new Set(dirs.map((d) => path.normalize(d).toLowerCase()))].filter((d) => fs.existsSync(d));
}

module.exports = { scanAll, watchDirs };
