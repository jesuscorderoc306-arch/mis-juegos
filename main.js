// Proceso principal: crea la ventana, busca juegos y los abre.
const { app, BrowserWindow, ipcMain, shell, Menu, dialog, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const { spawn } = require('child_process');
const { scanAll, watchDirs } = require('./src/scanner');
const art = require('./src/art');
const { autoUpdater } = require('electron-updater');

// Misma carpeta de datos en modo desarrollo y ya instalado
app.setPath('userData', path.join(app.getPath('appData'), 'mis-juegos'));
app.setAppUserModelId('com.chuyo.misjuegos');

// Solo una ventana abierta a la vez
if (!app.requestSingleInstanceLock()) app.quit();

const CONSOLE_MODE = process.argv.includes('--consola');
const ICON = path.join(__dirname, 'build', 'icon.png');

let win;
let games = [];
let cfg = { hidden: [], recent: {}, favs: [], names: {}, custom: [], playtime: {}, sounds: true, music: false, collections: {}, snapshots: {} };

const cfgPath = () => path.join(app.getPath('userData'), 'config.json');

function loadConfig() {
  try { cfg = { ...cfg, ...JSON.parse(fs.readFileSync(cfgPath(), 'utf8')) }; } catch {}
}

function saveConfig() {
  fs.mkdirSync(path.dirname(cfgPath()), { recursive: true });
  fs.writeFileSync(cfgPath(), JSON.stringify(cfg, null, 2));
}

// Lo que la ventana necesita saber de cada juego
const toView = (g) => ({
  id: g.id,
  name: cfg.names[g.id] || g.name,
  source: g.source,
  custom: !!g.custom,
  lastPlayed: Math.max(g.lastPlayed || 0, cfg.recent[g.id] || 0),
  playtime: (g.playtime || 0) + (cfg.playtime[g.id] || 0),
  hidden: cfg.hidden.includes(g.id),
  fav: cfg.favs.includes(g.id),
  cols: Object.keys(cfg.collections).filter((c) => cfg.collections[c].includes(g.id)),
  art: art.cached(g),
});

function createWindow() {
  nativeTheme.themeSource = 'dark';
  win = new BrowserWindow({
    width: 1400,
    height: 880,
    minWidth: 960,
    minHeight: 620,
    backgroundColor: '#000000',
    title: 'Mis Juegos',
    icon: fs.existsSync(ICON) ? ICON : undefined,
    titleBarStyle: 'hidden',
    titleBarOverlay: { color: '#000000', symbolColor: '#ffffff', height: 52 },
    fullscreen: CONSOLE_MODE,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });
  win.removeMenu();
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.once('ready-to-show', () => win.show());

  // F11: pantalla completa
  win.webContents.on('before-input-event', (e, input) => {
    if (input.type === 'keyDown' && input.key === 'F11') {
      win.setFullScreen(!win.isFullScreen());
      e.preventDefault();
    }
  });
  win.on('enter-full-screen', () => send('fullscreen', true));
  win.on('leave-full-screen', () => send('fullscreen', false));
}

function send(channel, data) {
  if (win && !win.isDestroyed()) win.webContents.send(channel, data);
}

// Descarga las imágenes que falten, 4 a la vez, y avisa a la ventana
let artRunning = false;
async function fetchMissingArt() {
  if (artRunning) return;
  artRunning = true;
  const queue = games.filter((g) => !art.complete(g));
  let next = 0;
  const worker = async () => {
    while (next < queue.length) {
      const g = queue[next++];
      try { send('art', { id: g.id, art: await art.resolve({ ...g, name: cfg.names[g.id] || g.name }) }); } catch {}
    }
  };
  await Promise.all([worker(), worker(), worker(), worker()]);
  artRunning = false;
}

const cachePath = () => path.join(app.getPath('userData'), 'games-cache.json');

// Lista guardada de la última vez, para abrir al instante
function cachedList() {
  try {
    const c = JSON.parse(fs.readFileSync(cachePath(), 'utf8'));
    if (!games.length) { games = c.games; art.init(app.getPath('userData'), c.steamRoot); }
    return c.games.map(toView);
  } catch { return null; }
}

async function scan() {
  const result = await scanAll(cfg.custom);
  try { fs.writeFileSync(cachePath(), JSON.stringify(result)); } catch {}
  games = result.games;
  snapshot();
  art.init(app.getPath('userData'), result.steamRoot);
  fetchMissingArt();
  return games.map(toView);
}

// Vigila carpetas de Steam / Epic / Xbox para detectar juegos nuevos
function startWatching() {
  let timer = 0;
  for (const dir of watchDirs()) {
    try {
      fs.watch(dir, () => {
        clearTimeout(timer);
        timer = setTimeout(() => send('changed'), 3000);
      });
    } catch {}
  }
}

ipcMain.handle('scan', () => scan());
ipcMain.handle('cached', () => cachedList());

ipcMain.handle('launch', (_e, id) => {
  const g = games.find((x) => x.id === id);
  if (!g) return false;
  const l = g.launch;
  try {
    if (l.type === 'url') shell.openExternal(l.url);
    else if (l.type === 'shell') spawn('explorer.exe', [l.target], { detached: true, stdio: 'ignore' }).unref();
    else {
      // Para .exe medimos cuánto tiempo estuvo abierto
      const started = Date.now();
      const child = spawn(l.path, l.args || [], { detached: true, stdio: 'ignore', cwd: path.dirname(l.path) });
      child.on('exit', () => {
        const min = Math.round((Date.now() - started) / 60000);
        if (min >= 1) { cfg.playtime[id] = (cfg.playtime[id] || 0) + min; saveConfig(); }
      });
      child.unref();
    }
    cfg.recent[id] = Date.now();
    saveConfig();
    return true;
  } catch {
    return false;
  }
});

ipcMain.handle('fav', (_e, id) => {
  const on = !cfg.favs.includes(id);
  cfg.favs = on ? [...cfg.favs, id] : cfg.favs.filter((x) => x !== id);
  saveConfig();
  return on;
});

ipcMain.handle('rename', (_e, id, name) => {
  const g = games.find((x) => x.id === id);
  if (!g) return null;
  const clean = String(name || '').trim().slice(0, 80);
  if (!clean || clean === g.name) delete cfg.names[id];
  else cfg.names[id] = clean;
  saveConfig();
  if (art.forget(g)) fetchMissingArt();
  return toView(g);
});

ipcMain.handle('add-game', async () => {
  const r = await dialog.showOpenDialog(win, {
    title: 'Elige el programa del juego',
    filters: [{ name: 'Programas', extensions: ['exe'] }],
    properties: ['openFile'],
  });
  const file = r.filePaths?.[0];
  if (r.canceled || !file) return null;
  const id = `custom-${crypto.createHash('md5').update(file.toLowerCase()).digest('hex').slice(0, 10)}`;
  if (!cfg.custom.some((c) => c.id === id)) {
    cfg.custom.push({ id, name: path.basename(file, path.extname(file)), path: file });
    saveConfig();
  }
  return { id, list: await scan() };
});

function loginArgs() {
  return app.isPackaged ? ['--consola'] : [app.getAppPath(), '--consola'];
}

ipcMain.handle('settings', () => ({
  sounds: cfg.sounds,
  music: cfg.music,
  startup: app.getLoginItemSettings({ path: process.execPath, args: loginArgs() }).openAtLogin,
  fullscreen: win.isFullScreen(),
}));

ipcMain.handle('set-setting', (_e, key, value) => {
  if (key === 'sounds' || key === 'music') { cfg[key] = !!value; saveConfig(); }
  if (key === 'startup') app.setLoginItemSettings({ openAtLogin: !!value, path: process.execPath, args: loginArgs() });
  if (key === 'fullscreen') win.setFullScreen(!!value);
  return true;
});

ipcMain.handle('context', (e, id) => {
  const g = games.find((x) => x.id === id);
  if (!g) return null;
  const hidden = cfg.hidden.includes(id);
  const fav = cfg.favs.includes(id);

  return new Promise((resolve) => {
    let picked = null;
    const item = (label, key) => ({ label, click: () => (picked = key) });
    const template = [
      item('Jugar', 'play'),
      item(fav ? 'Quitar de favoritos' : 'Agregar a favoritos', 'fav'),
      {
        label: 'Colecciones',
        submenu: [
          ...Object.keys(cfg.collections).sort().map((n) => ({
            label: n, type: 'checkbox', checked: cfg.collections[n].includes(id), click: () => (picked = { col: n }),
          })),
          ...(Object.keys(cfg.collections).length ? [{ type: 'separator' }] : []),
          item('Nueva colección…', 'newcol'),
        ],
      },
      item('Ver ficha', 'info'),
      { type: 'separator' },
      item('Renombrar…', 'rename'),
      item('Cambiar portada…', 'cover'),
      item('Abrir carpeta', 'folder'),
      { type: 'separator' },
      item(hidden ? 'Mostrar en la biblioteca' : 'Ocultar', 'hide'),
    ];
    if (g.custom) template.push(item('Quitar de Mis Juegos', 'remove'));

    Menu.buildFromTemplate(template).popup({
      window: BrowserWindow.fromWebContents(e.sender),
      callback: () => setTimeout(async () => {
        if (['play', 'fav', 'rename', 'newcol', 'info'].includes(picked)) return resolve({ action: picked });
        if (picked?.col) {
          const n = picked.col;
          const on = !cfg.collections[n].includes(id);
          cfg.collections[n] = on ? [...cfg.collections[n], id] : cfg.collections[n].filter((x) => x !== id);
          if (!cfg.collections[n].length) delete cfg.collections[n];
          saveConfig();
          return resolve({ action: 'list', list: games.map(toView), text: on ? `Agregado a ${n}` : `Quitado de ${n}` });
        }
        if (picked === 'folder') { shell.openPath(g.installPath); return resolve(null); }
        if (picked === 'hide') {
          cfg.hidden = hidden ? cfg.hidden.filter((x) => x !== id) : [...cfg.hidden, id];
          saveConfig();
          return resolve({ action: 'hide', hidden: !hidden });
        }
        if (picked === 'remove') {
          cfg.custom = cfg.custom.filter((c) => c.id !== id);
          cfg.favs = cfg.favs.filter((x) => x !== id);
          saveConfig();
          return resolve({ action: 'removed', list: await scan() });
        }
        if (picked === 'cover') {
          const r = await dialog.showOpenDialog(win, {
            title: `Portada para ${toView(g).name}`,
            filters: [{ name: 'Imágenes', extensions: ['jpg', 'jpeg', 'png', 'webp'] }],
            properties: ['openFile'],
          });
          if (r.canceled || !r.filePaths[0]) return resolve(null);
          return resolve({ action: 'art', art: art.setCustomCover(g, r.filePaths[0]) });
        }
        resolve(null);
      }, 0),
    });
  });
});

/* ---------- Estadísticas: foto diaria del tiempo jugado ---------- */
const dayKey = (d = new Date()) => d.toISOString().slice(0, 10);
const totalOf = (g) => (g.playtime || 0) + (cfg.playtime[g.id] || 0);

function snapshot() {
  const today = dayKey();
  if (cfg.snapshots[today]) return;
  cfg.snapshots[today] = Object.fromEntries(games.map((g) => [g.id, totalOf(g)]));
  const keep = Object.keys(cfg.snapshots).sort().slice(-35);
  cfg.snapshots = Object.fromEntries(keep.map((k) => [k, cfg.snapshots[k]]));
  saveConfig();
}

ipcMain.handle('stats', () => {
  const weekAgo = dayKey(new Date(Date.now() - 7 * 864e5));
  // La foto más vieja dentro de los últimos 7 días
  const base = Object.keys(cfg.snapshots).sort().find((k) => k >= weekAgo);
  return { base: base ? cfg.snapshots[base] : {}, since: base || dayKey() };
});

/* ---------- Ficha del juego ---------- */
async function folderSize(dir) {
  let total = 0;
  let count = 0;
  const walk = async (d) => {
    let items = [];
    try { items = await fs.promises.readdir(d, { withFileTypes: true }); } catch { return; }
    for (const it of items) {
      if (++count > 200000) return;
      const p = path.join(d, it.name);
      if (it.isDirectory()) await walk(p);
      else if (it.isFile()) { try { total += (await fs.promises.stat(p)).size; } catch {} }
    }
  };
  await walk(dir);
  return total;
}

ipcMain.handle('details', async (_e, id) => {
  const g = games.find((x) => x.id === id);
  if (!g) return null;
  let installed = 0;
  try { installed = fs.statSync(g.installPath).birthtimeMs; } catch {}
  return { path: g.installPath || '', installed, size: g.installPath ? await folderSize(g.installPath) : 0 };
});

ipcMain.handle('open-folder', (_e, id) => {
  const g = games.find((x) => x.id === id);
  if (g?.installPath) shell.openPath(g.installPath);
});

// Desinstalar: se abre el desinstalador de cada plataforma
ipcMain.handle('uninstall', async (_e, id) => {
  const g = games.find((x) => x.id === id);
  if (!g) return null;
  if (g.custom) {
    cfg.custom = cfg.custom.filter((c) => c.id !== id);
    cfg.favs = cfg.favs.filter((x) => x !== id);
    saveConfig();
    return { removed: true, list: await scan() };
  }
  if (g.source === 'steam') shell.openExternal(`steam://uninstall/${g.appid}`);
  else if (g.source === 'epic') shell.openExternal('com.epicgames.launcher://store/library');
  else shell.openExternal('ms-settings:appsfeatures');
  return { opened: true };
});

/* ---------- Colecciones ---------- */
ipcMain.handle('collect', (_e, id, name, on) => {
  const n = String(name || '').trim().slice(0, 40);
  if (!n) return null;
  const list = cfg.collections[n] || [];
  cfg.collections[n] = on ? [...new Set([...list, id])] : list.filter((x) => x !== id);
  if (!cfg.collections[n].length) delete cfg.collections[n];
  saveConfig();
  return games.map(toView);
});

ipcMain.handle('collections', () => Object.keys(cfg.collections).sort((a, b) => a.localeCompare(b, 'es')));

// Actualizaciones desde GitHub: se descargan solas y se instalan al cerrar la app
function checkUpdates() {
  if (!app.isPackaged) return;
  autoUpdater.autoDownload = true;
  autoUpdater.autoInstallOnAppQuit = true;
  autoUpdater.on('update-downloaded', (info) => send('update', info.version));
  autoUpdater.on('error', () => {});
  autoUpdater.checkForUpdates().catch(() => {});
  setInterval(() => autoUpdater.checkForUpdates().catch(() => {}), 6 * 3600e3);
}

// Botón de Ajustes: buscar actualización ahora
let updateReady = null;
autoUpdater.on('update-downloaded', (info) => { updateReady = info.version; });
ipcMain.handle('check-update', async () => {
  if (!app.isPackaged) return { status: 'dev' };
  if (updateReady) return { status: 'ready', version: updateReady };
  try {
    const r = await autoUpdater.checkForUpdates();
    const v = r?.updateInfo?.version;
    if (v && v !== app.getVersion()) return { status: 'downloading', version: v };
    return { status: 'latest', version: app.getVersion() };
  } catch {
    return { status: 'error' };
  }
});
ipcMain.handle('install-update', () => autoUpdater.quitAndInstall());
ipcMain.handle('version', () => app.getVersion());

app.on('second-instance', () => {
  if (!win) return;
  if (win.isMinimized()) win.restore();
  win.focus();
});

app.whenReady().then(() => {
  loadConfig();
  createWindow();
  startWatching();
  checkUpdates();
});

app.on('window-all-closed', () => app.quit());
