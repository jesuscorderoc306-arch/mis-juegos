'use strict';

const $ = (s) => document.querySelector(s);
const SOURCES = { steam: 'Steam', epic: 'Epic Games', xbox: 'Xbox', ea: 'EA', ubisoft: 'Ubisoft', battlenet: 'Battle.net', gog: 'GOG', riot: 'Riot Games', otros: 'Otros' };
const EASE = 'cubic-bezier(.2, .8, .2, 1)';
const STAR = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-5-6.5 5V4.5a1 1 0 0 1 1-1z"/></svg>';

const ICONS = {
  home: '<path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z"/>',
  favs: '<path d="M6.5 3.5h11a1 1 0 0 1 1 1V21l-6.5-5-6.5 5V4.5a1 1 0 0 1 1-1z"/>',
  all: '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
  steam: '<path class="fill" d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.605 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z"/>',
  epic: '<path class="fill" d="M3.537 0C2.165 0 1.66.506 1.66 1.879V18.44a4.262 4.262 0 00.02.433c.031.3.037.59.316.92.027.033.311.245.311.245.153.075.258.13.43.2l8.335 3.491c.433.199.614.276.928.27h.002c.314.006.495-.071.928-.27l8.335-3.492c.172-.07.277-.124.43-.2 0 0 .284-.211.311-.243.28-.33.285-.621.316-.92a4.261 4.261 0 00.02-.434V1.879c0-1.373-.506-1.88-1.878-1.88zm13.366 3.11h.68c1.138 0 1.688.553 1.688 1.696v1.88h-1.374v-1.8c0-.369-.17-.54-.523-.54h-.235c-.367 0-.537.17-.537.539v5.81c0 .369.17.54.537.54h.262c.353 0 .523-.171.523-.54V8.619h1.373v2.143c0 1.144-.562 1.71-1.7 1.71h-.694c-1.138 0-1.7-.566-1.7-1.71V4.82c0-1.144.562-1.709 1.7-1.709zm-12.186.08h3.114v1.274H6.117v2.603h1.648v1.275H6.117v2.774h1.74v1.275h-3.14zm3.816 0h2.198c1.138 0 1.7.564 1.7 1.708v2.445c0 1.144-.562 1.71-1.7 1.71h-.799v3.338h-1.4zm4.53 0h1.4v9.201h-1.4zm-3.13 1.235v3.392h.575c.354 0 .523-.171.523-.54V4.965c0-.368-.17-.54-.523-.54zm-3.74 10.147a1.708 1.708 0 01.591.108 1.745 1.745 0 01.49.299l-.452.546a1.247 1.247 0 00-.308-.195.91.91 0 00-.363-.068.658.658 0 00-.28.06.703.703 0 00-.224.163.783.783 0 00-.151.243.799.799 0 00-.056.299v.008a.852.852 0 00.056.31.7.7 0 00.157.245.736.736 0 00.238.16.774.774 0 00.303.058.79.79 0 00.445-.116v-.339h-.548v-.565H7.37v1.255a2.019 2.019 0 01-.524.307 1.789 1.789 0 01-.683.123 1.642 1.642 0 01-.602-.107 1.46 1.46 0 01-.478-.3 1.371 1.371 0 01-.318-.455 1.438 1.438 0 01-.115-.58v-.008a1.426 1.426 0 01.113-.57 1.449 1.449 0 01.312-.46 1.418 1.418 0 01.474-.309 1.58 1.58 0 01.598-.111 1.708 1.708 0 01.045 0zm11.963.008a2.006 2.006 0 01.612.094 1.61 1.61 0 01.507.277l-.386.546a1.562 1.562 0 00-.39-.205 1.178 1.178 0 00-.388-.07.347.347 0 00-.208.052.154.154 0 00-.07.127v.008a.158.158 0 00.022.084.198.198 0 00.076.066.831.831 0 00.147.06c.062.02.14.04.236.061a3.389 3.389 0 01.43.122 1.292 1.292 0 01.328.17.678.678 0 01.207.24.739.739 0 01.071.337v.008a.865.865 0 01-.081.382.82.82 0 01-.229.285 1.032 1.032 0 01-.353.18 1.606 1.606 0 01-.46.061 2.16 2.16 0 01-.71-.116 1.718 1.718 0 01-.593-.346l.43-.514c.277.223.578.335.9.335a.457.457 0 00.236-.05.157.157 0 00.082-.142v-.008a.15.15 0 00-.02-.077.204.204 0 00-.073-.066.753.753 0 00-.143-.062 2.45 2.45 0 00-.233-.062 5.036 5.036 0 01-.413-.113 1.26 1.26 0 01-.331-.16.72.72 0 01-.222-.243.73.73 0 01-.082-.36v-.008a.863.863 0 01.074-.359.794.794 0 01.214-.283 1.007 1.007 0 01.34-.185 1.423 1.423 0 01.448-.066 2.006 2.006 0 01.025 0zm-9.358.025h.742l1.183 2.81h-.825l-.203-.499H8.623l-.198.498h-.81zm2.197.02h.814l.663 1.08.663-1.08h.814v2.79h-.766v-1.602l-.711 1.091h-.016l-.707-1.083v1.593h-.754zm3.469 0h2.235v.658h-1.473v.422h1.334v.61h-1.334v.442h1.493v.658h-2.255zm-5.3.897l-.315.793h.624zm-1.145 5.19h8.014l-4.09 1.348z"/>',
  xbox: '<path class="fill" d="M4.102 21.033C6.211 22.881 8.977 24 12 24c3.026 0 5.789-1.119 7.902-2.967 1.877-1.912-4.316-8.709-7.902-11.417-3.582 2.708-9.779 9.505-7.898 11.417zm11.16-14.406c2.5 2.961 7.484 10.313 6.076 12.912C23.002 17.48 24 14.861 24 12.004c0-3.34-1.365-6.362-3.57-8.536 0 0-.027-.022-.082-.042-.063-.022-.152-.045-.281-.045-.592 0-1.985.434-4.805 3.246zM3.654 3.426c-.057.02-.082.041-.086.042C1.365 5.642 0 8.664 0 12.004c0 2.854.998 5.473 2.661 7.533-1.401-2.605 3.579-9.951 6.08-12.91-2.82-2.813-4.216-3.245-4.806-3.245-.131 0-.223.021-.281.046v-.002zM12 3.551S9.055 1.828 6.755 1.746c-.903-.033-1.454.295-1.521.339C7.379.646 9.659 0 11.984 0H12c2.334 0 4.605.646 6.766 2.085-.068-.046-.615-.372-1.52-.339C14.946 1.828 12 3.545 12 3.545v.006z"/>',
  roblox: '<path class="fill" d="M18.926 23.998 0 18.892 5.075.002 24 5.108ZM15.348 10.09l-5.282-1.453-1.414 5.273 5.282 1.453z"/>',
  ea: '<path class="fill" d="M16.635 6.162l-5.928 9.377H4.24l1.508-2.3h4.024l1.474-2.335H2.264L.79 13.239h2.156L0 17.84h12.072l4.563-7.259 1.652 2.66h-1.401l-1.473 2.299h4.347l1.473 2.3H24zm-11.461.107L3.7 8.604l9.52-.035 1.474-2.3z"/>',
  ubisoft: '<path class="fill" d="M23.561 11.988C23.301-.304 6.954-4.89.656 6.634c.282.206.661.477.943.672a11.747 11.747 0 00-.976 3.067 11.885 11.885 0 00-.184 2.071C.439 18.818 5.621 24 12.005 24c6.385 0 11.556-5.17 11.556-11.556v-.455zm-20.27 2.06c-.152 1.246-.054 1.636-.054 1.788l-.282.098c-.108-.206-.37-.932-.488-1.908C2.163 10.308 4.7 6.96 8.57 6.33c3.544-.52 6.937 1.68 7.728 4.758l-.282.098c-.087-.087-.228-.336-.77-.878-4.281-4.281-11.002-2.32-11.956 3.74zm11.002 2.081a3.145 3.145 0 01-2.59 1.355 3.15 3.15 0 01-3.155-3.155 3.159 3.159 0 012.927-3.144c1.018-.043 1.972.51 2.416 1.398a2.58 2.58 0 01-.455 2.95c.293.205.575.4.856.595zm6.58.12c-1.669 3.782-5.106 5.766-8.77 5.712-7.034-.347-9.083-8.466-4.38-11.393l.207.206c-.076.108-.358.325-.791 1.182-.51 1.041-.672 2.081-.607 2.732.369 5.67 8.314 6.83 11.045 1.214C21.057 8.217 11.822.401 3.626 6.374l-.184-.184C5.599 2.808 9.816 1.3 13.837 2.309c6.147 1.55 9.453 7.956 7.035 13.94z"/>',
  battlenet: '<path class="fill" d="M18.94 8.296C15.9 6.892 11.534 6 7.426 6.332c.206-1.36.714-2.308 1.548-2.508 1.148-.275 2.4.48 3.594 1.854.782.102 1.71.28 2.355.429C12.747 2.013 9.828-.282 7.607.565c-1.688.644-2.553 2.97-2.448 6.094-2.2.468-3.915 1.3-5.013 2.495-.056.065-.181.227-.137.305.034.058.146-.008.194-.04 1.274-.89 2.904-1.373 5.027-1.676.303 3.333 1.713 7.56 4.055 10.952-1.28.502-2.356.536-2.946-.087-.812-.856-.784-2.318-.19-4.04a26.764 26.764 0 0 1-.807-2.254c-2.459 3.934-2.986 7.61-1.143 9.11 1.402 1.14 3.847.725 6.502-.926 1.505 1.672 3.083 2.74 4.667 3.094.084.015.287.043.332-.034.034-.06-.08-.124-.131-.149-1.408-.657-2.64-1.828-3.964-3.515 2.735-1.929 5.691-5.263 7.457-8.988 1.076.86 1.64 1.773 1.398 2.595-.336 1.131-1.615 1.84-3.403 2.185a27.697 27.697 0 0 1-1.548 1.826c4.634.16 8.08-1.22 8.458-3.565.286-1.786-1.295-3.696-4.053-5.17.696-2.139.832-4.04.346-5.588-.029-.08-.106-.27-.196-.27-.068 0-.067.13-.063.187.135 1.547-.263 3.2-1.062 5.19zm-8.533 9.869c-1.96-3.145-3.09-6.849-3.082-10.594 3.702-.124 7.474.748 10.714 2.627-1.743 3.269-4.385 6.1-7.633 7.966h.001z"/>',
  gog: '<path class="fill" d="M7.15 15.24H4.36a.4.4 0 0 0-.4.4v2c0 .21.18.4.4.4h2.8v1.32h-3.5c-.56 0-1.02-.46-1.02-1.03v-3.39c0-.56.46-1.02 1.03-1.02h3.48v1.32zM8.16 11.54c0 .58-.47 1.05-1.05 1.05H2.63v-1.35h3.78a.4.4 0 0 0 .4-.4V6.39a.4.4 0 0 0-.4-.4H4.39a.4.4 0 0 0-.41.4v2.02c0 .23.18.4.4.4H6v1.35H3.68c-.58 0-1.05-.46-1.05-1.04V5.68c0-.57.47-1.04 1.05-1.04H7.1c.58 0 1.05.47 1.05 1.04v5.86zM21.36 19.36h-1.32v-4.12h-.93a.4.4 0 0 0-.4.4v3.72h-1.33v-4.12h-.93a.4.4 0 0 0-.4.4v3.72h-1.33v-4.42c0-.56.46-1.02 1.03-1.02h5.61v5.44zM21.37 11.54c0 .58-.47 1.05-1.05 1.05h-4.48v-1.35h3.78a.4.4 0 0 0 .4-.4V6.39a.4.4 0 0 0-.4-.4h-2.03a.4.4 0 0 0-.4.4v2.02c0 .23.18.4.4.4h1.62v1.35H16.9c-.58 0-1.05-.46-1.05-1.04V5.68c0-.57.47-1.04 1.05-1.04h3.43c.58 0 1.05.47 1.05 1.04v5.86zM13.72 4.64h-3.44c-.58 0-1.04.47-1.04 1.04v3.44c0 .58.46 1.04 1.04 1.04h3.44c.57 0 1.04-.46 1.04-1.04V5.68c0-.57-.47-1.04-1.04-1.04m-.3 1.75v2.02a.4.4 0 0 1-.4.4h-2.03a.4.4 0 0 1-.4-.4V6.4c0-.22.17-.4.4-.4H13c.23 0 .4.18.4.4zM12.63 13.92H9.24c-.57 0-1.03.46-1.03 1.02v3.39c0 .57.46 1.03 1.03 1.03h3.39c.57 0 1.03-.46 1.03-1.03v-3.39c0-.56-.46-1.02-1.03-1.02m-.3 1.72v2a.4.4 0 0 1-.4.4v-.01H9.94a.4.4 0 0 1-.4-.4v-1.99c0-.22.18-.4.4-.4h2c.22 0 .4.18.4.4zM23.49 1.1a1.74 1.74 0 0 0-1.24-.52H1.75A1.74 1.74 0 0 0 0 2.33v19.34a1.74 1.74 0 0 0 1.75 1.75h20.5A1.74 1.74 0 0 0 24 21.67V2.33c0-.48-.2-.92-.51-1.24m0 20.58a1.23 1.23 0 0 1-1.24 1.24H1.75A1.23 1.23 0 0 1 .5 21.67V2.33a1.23 1.23 0 0 1 1.24-1.24h20.5a1.24 1.24 0 0 1 1.24 1.24v19.34z"/>',
  riot: '<path class="fill" d="M13.458.86 0 7.093l3.353 12.761 2.552-.313-.701-8.024.838-.373 1.447 8.202 4.361-.535-.775-8.857.83-.37 1.591 9.025 4.412-.542-.849-9.708.84-.374 1.74 9.87L24 17.318V3.5Zm.316 19.356.222 1.256L24 23.14v-4.18l-10.22 1.256Z"/>',
  col: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  stats: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  otros: '<circle cx="5" cy="12" r="1.6"/><circle cx="12" cy="12" r="1.6"/><circle cx="19" cy="12" r="1.6"/>',
  hidden: '<path d="M3 3l18 18"/><path d="M10.6 6.1A9 9 0 0 1 12 6c5 0 9 6 9 6a16 16 0 0 1-3 3.6M6.6 6.6C4.2 8.2 3 12 3 12s4 6 9 6a9 9 0 0 0 4.4-1.1"/>',
  settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
};

const SETTINGS = [
  { key: 'sounds', type: 'toggle', title: 'Sonidos', desc: 'Sonidos suaves al moverte y al abrir juegos' },
  { key: 'music', type: 'toggle', title: 'Música de fondo', desc: 'Música suave en el menú. Se pausa al abrir un juego' },
  { key: 'startup', type: 'toggle', title: 'Abrir con Windows', desc: 'Se abre en pantalla completa al prender la PC, como una consola' },
  { key: 'fullscreen', type: 'toggle', title: 'Pantalla completa', desc: 'También puedes usar F11' },
  { key: 'add', type: 'action', title: 'Agregar juego', desc: 'Elige el .exe de un juego que no aparece solo' },
  { key: 'refresh', type: 'action', title: 'Buscar juegos nuevos', desc: 'Vuelve a revisar Steam, Epic, Xbox y tus juegos' },
];

const state = {
  all: [],
  q: '',
  view: 'home',
  sections: [],  // [{ key, title, layout: 'wide'|'row'|'grid'|'list', games, el, box }]
  s: 0,
  i: 0,
  mem: {},
  sel: null,
  inSide: false,
  sideIdx: 0,
  settings: { sounds: true, startup: false, fullscreen: false },
  lastScan: 0,
};
const tilesById = new Map();
let usingMouse = false;

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const byName = (a, b) => a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
const findGame = (id) => state.all.find((g) => g.id === id);
const SORTS = { name: 'Nombre', recent: 'Último jugado', time: 'Tiempo jugado' };
state.sort = SORTS[localStorage.sort] ? localStorage.sort : 'name';
const sorter = () => (state.sort === 'recent' ? (a, b) => (b.lastPlayed - a.lastPlayed) || byName(a, b)
  : state.sort === 'time' ? (a, b) => (b.playtime - a.playtime) || byName(a, b) : byName);

function timeAgo(ms) {
  if (!ms) return 'Sin jugar todavía';
  const min = Math.round((Date.now() - ms) / 60000);
  if (min < 2) return 'Jugado hace un momento';
  if (min < 60) return `Jugado hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Jugado hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return 'Jugado ayer';
  if (d < 30) return `Jugado hace ${d} días`;
  return `Jugado el ${new Date(ms).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', year: 'numeric' })}`;
}

function playtimeText(min) {
  if (!min) return '';
  if (min < 60) return `${min} min jugados`;
  const h = min / 60;
  return `${h < 10 ? h.toFixed(1).replace('.0', '') : Math.round(h)} h jugadas`;
}

/* ---------------- Barra lateral ---------------- */

function sideEntries() {
  const visible = state.all.filter((g) => !g.hidden);
  const favs = visible.filter((g) => g.fav).length;
  const list = [{ key: 'home', label: 'Inicio' }];
  if (favs) list.push({ key: 'favs', label: 'Favoritos', n: favs });
  list.push({ key: 'all', label: 'Biblioteca', n: visible.length }, { group: 'Plataformas' });
  for (const [key, label] of Object.entries(SOURCES)) {
    const n = visible.filter((g) => g.source === key).length;
    if (n) list.push({ key, label, n });
  }
  const cols = [...new Set(visible.flatMap((g) => g.cols || []))].sort((a, b) => a.localeCompare(b, 'es'));
  if (cols.length) {
    list.push({ group: 'Colecciones' });
    for (const c of cols) list.push({ key: `col:${c}`, label: c, n: visible.filter((g) => g.cols?.includes(c)).length, icon: 'col' });
  }
  list.push({ group: 'Más' });
  list.push({ key: 'stats', label: 'Estadísticas' });
  const hidden = state.all.filter((g) => g.hidden).length;
  if (hidden) list.push({ key: 'hidden', label: 'Ocultos', n: hidden });
  list.push({ key: 'settings', label: 'Ajustes' });
  return list;
}

function renderSide() {
  const nav = $('#sideNav');
  nav.querySelectorAll('.side-item, .side-group').forEach((x) => x.remove());
  for (const e of sideEntries()) {
    if (e.group) {
      const g = document.createElement('div');
      g.className = 'side-group';
      g.textContent = e.group;
      nav.appendChild(g);
      continue;
    }
    const b = document.createElement('button');
    b.className = 'side-item';
    b.dataset.view = e.key;
    b.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[e.icon || e.key]}</svg><span></span>${e.n != null ? '<span class="n"></span>' : ''}`;
    b.querySelector('span').textContent = e.label;
    if (e.n != null) b.querySelector('.n').textContent = e.n;
    b.addEventListener('click', () => { setView(e.key); leaveSide(); });
    nav.appendChild(b);
  }
  const total = state.all.length;
  $('#sideCount').textContent = `${total} ${total === 1 ? 'juego' : 'juegos'}`;
  // Si la vista actual ya no existe (por ejemplo, quitaste el último favorito)
  if (!sideItems().some((x) => x.dataset.view === state.view)) state.view = 'home';
  markSide();
}

function sideItems() { return [...document.querySelectorAll('.side-item')]; }

function markSide(instant = false) {
  let active = null;
  for (const it of sideItems()) {
    const on = it.dataset.view === state.view;
    it.classList.toggle('on', on);
    if (on) active = it;
  }
  const pill = $('#sidePill');
  if (!active) { pill.classList.remove('ready'); return; }
  if (instant) pill.style.transition = 'none';
  pill.style.transform = `translateY(${active.offsetTop}px)`;
  pill.classList.add('ready');
  if (instant) requestAnimationFrame(() => { pill.style.transition = ''; });
}

function setView(view) {
  if (!view) return;
  const q = $('#q');
  const hadSearch = !!q.value;
  if (hadSearch) { q.value = ''; state.q = ''; }
  if (state.view === view && !hadSearch) return;
  state.view = view;
  state.sel = null;
  sfx.play('view');
  markSide();
  render();
}

function enterSide() {
  if (state.inSide) return;
  state.inSide = true;
  state.sideIdx = Math.max(0, sideItems().findIndex((x) => x.dataset.view === state.view));
  paintSideFocus();
  document.querySelector('.tile.focus, .set-row.focus')?.classList.remove('focus');
  sfx.play('back');
}

function leaveSide() {
  state.inSide = false;
  paintSideFocus();
  if (state.sections.length) focusAt(state.s, state.i, { scroll: false });
}

function paintSideFocus() {
  sideItems().forEach((x, i) => x.classList.toggle('kfocus', state.inSide && i === state.sideIdx));
}

let sideTimer = 0;
function moveSide(d) {
  const items = sideItems();
  const next = Math.max(0, Math.min(items.length - 1, state.sideIdx + d));
  if (next === state.sideIdx) return;
  state.sideIdx = next;
  paintSideFocus();
  sfx.play('move');
  // Cambia de sección al moverse, como en las apps de tele
  clearTimeout(sideTimer);
  sideTimer = setTimeout(() => {
    setView(items[state.sideIdx].dataset.view);
    document.querySelector('.tile.focus, .set-row.focus')?.classList.remove('focus');
  }, 160);
}

/* ---------------- Secciones ---------------- */

function buildSections() {
  const q = norm(state.q.trim());
  if (q) {
    const found = state.all.filter((g) => norm(g.name).includes(q)).sort(byName);
    return found.length ? [{ key: 'search', title: 'Resultados', layout: 'grid', games: found }] : [];
  }
  const visible = state.all.filter((g) => !g.hidden);
  const v = state.view;
  if (v === 'settings') return [{ key: 'settings', title: 'Ajustes', layout: 'list', games: SETTINGS }];
  if (v === 'home') {
    const recent = visible.filter((g) => g.lastPlayed > 0).sort((a, b) => b.lastPlayed - a.lastPlayed).slice(0, 10);
    const favs = visible.filter((g) => g.fav).sort(byName);
    return [
      { key: 'recent', title: 'Continuar jugando', layout: 'wide', games: recent },
      { key: 'favs', title: 'Favoritos', layout: 'row', games: favs },
      { key: 'all', title: 'Todos tus juegos', layout: 'grid', sortable: true, games: [...visible].sort(sorter()) },
    ].filter((x) => x.games.length);
  }
  if (v === 'favs') return [{ key: 'favs', title: 'Favoritos', layout: 'grid', sortable: true, games: visible.filter((g) => g.fav).sort(sorter()) }];
  if (v.startsWith('col:')) {
    const c = v.slice(4);
    return [{ key: v, title: c, layout: 'grid', sortable: true, games: visible.filter((g) => g.cols?.includes(c)).sort(sorter()) }].filter((x) => x.games.length);
  }
  if (v === 'all') return [{ key: 'all', title: 'Biblioteca', layout: 'grid', sortable: true, games: [...visible].sort(sorter()) }];
  if (v === 'hidden') {
    return [{ key: 'hidden', title: 'Ocultos', layout: 'grid', muted: true, games: state.all.filter((g) => g.hidden).sort(byName) }];
  }
  return [{ key: v, title: SOURCES[v], layout: 'grid', sortable: true, games: visible.filter((g) => g.source === v).sort(sorter()) }]
    .filter((x) => x.games.length);
}

function paintTile(el, g) {
  const cover = el.querySelector('.cover');
  const wide = el.classList.contains('wide');
  const src = wide ? (g.art.hero || g.art.cover) : g.art.cover;
  if (src) {
    if (cover.getAttribute('src') !== src) {
      cover.classList.remove('ok');
      cover.src = src;
    }
    cover.classList.toggle('blur', wide && !g.art.hero);
  } else {
    cover.removeAttribute('src');
    cover.classList.remove('ok');
  }
  const icon = el.querySelector('.icon');
  if (g.art.icon) { icon.src = g.art.icon; icon.hidden = false; } else { icon.hidden = true; }

  const logo = el.querySelector('.wlogo');
  if (logo) {
    if (g.art.logo) { if (logo.getAttribute('src') !== g.art.logo) logo.src = g.art.logo; }
    else { logo.removeAttribute('src'); logo.classList.remove('ok'); }
  }
  el.querySelector('.fb-name').textContent = g.name;
  el.querySelector('.cap b').textContent = g.name;
  el.querySelector('.star').hidden = !g.fav;
}

function createTile(g, si, ii, layout, muted) {
  const wide = layout === 'wide';
  const el = document.createElement('div');
  el.className = `tile${wide ? ' wide' : ''}${muted ? ' muted' : ''}`;
  el.innerHTML = `
    <div class="card">
      <div class="fb"><img class="icon" alt="" hidden><span class="fb-name"></span><span class="fb-src"></span></div>
      <img class="cover" alt="" draggable="false">
      ${wide ? '<img class="wlogo" alt="" draggable="false">' : ''}
      <span class="star" hidden>${STAR}</span>
    </div>
    <div class="cap"><b></b>${wide ? '<small></small>' : ''}</div>`;
  el.querySelector('.fb-src').textContent = SOURCES[g.source];
  if (wide) {
    const pt = playtimeText(g.playtime);
    el.querySelector('.cap small').textContent = pt ? `${timeAgo(g.lastPlayed)} · ${pt}` : timeAgo(g.lastPlayed);
  }

  const cover = el.querySelector('.cover');
  cover.addEventListener('load', () => cover.classList.add('ok'));
  cover.addEventListener('error', () => cover.classList.remove('ok'));
  const logo = el.querySelector('.wlogo');
  if (logo) {
    logo.addEventListener('load', () => logo.classList.add('ok'));
    logo.addEventListener('error', () => logo.classList.remove('ok'));
  }

  const focusMe = () => { if (state.inSide) { state.inSide = false; paintSideFocus(); } focusAt(si, ii, { scroll: false }); };
  el.addEventListener('click', () => { focusMe(); sfx.play('view'); });
  el.addEventListener('dblclick', () => play(g.id));
  el.addEventListener('contextmenu', (e) => { e.preventDefault(); focusMe(); openContext(g.id); });

  if (!tilesById.has(g.id)) tilesById.set(g.id, new Set());
  tilesById.get(g.id).add(el);
  paintTile(el, g);
  return el;
}

function createSetting(item, si, ii) {
  const el = document.createElement('button');
  el.className = 'set-row';
  el.dataset.key = item.key;
  el.innerHTML = `<span class="set-text"><b></b><small></small></span>${item.type === 'toggle' ? '<span class="switch"></span>' : '<span class="set-go">Abrir</span>'}`;
  el.querySelector('b').textContent = item.title;
  el.querySelector('small').textContent = item.desc;
  el.classList.toggle('on', item.type === 'toggle' && !!state.settings[item.key]);
  el.addEventListener('mouseenter', () => { if (usingMouse) focusAt(si, ii, { scroll: false }); });
  el.addEventListener('click', () => { focusAt(si, ii, { scroll: false }); runSetting(item); });
  return el;
}

function updateNav(sec) {
  const t = sec.box;
  sec.el.querySelector('.prev').classList.toggle('can', t.scrollLeft > 4);
  sec.el.querySelector('.next').classList.toggle('can', t.scrollLeft + t.clientWidth < t.scrollWidth - 4);
}

function render() {
  const keepId = state.sel;
  tilesById.clear();
  const content = $('#content');
  content.textContent = '';
  $('#scroller').scrollTop = 0;
  document.body.classList.toggle('settings', state.view === 'settings' && !state.q);
  state.sections = buildSections();
  const isStats = state.view === 'stats' && !state.q;
  document.body.classList.toggle('stats', isStats);
  if (isStats) renderStats(content);

  state.sections.forEach((sec, si) => {
    const el = document.createElement('section');
    el.className = 'sec';
    el.innerHTML = '<div class="sec-head"><h2></h2><span></span></div>';
    el.querySelector('h2').textContent = sec.title;
    if (sec.layout !== 'list') el.querySelector('.sec-head span').textContent = sec.games.length;
    if (sec.sortable) {
      const b = document.createElement('button');
      b.className = 'sort-btn';
      b.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4v16M3 16l4 4 4-4M17 20V4M13 8l4-4 4 4"/></svg><span></span>';
      b.querySelector('span').textContent = `Orden: ${SORTS[state.sort]}`;
      b.title = 'Cambiar orden (tecla O o botón X del control)';
      b.addEventListener('click', cycleSort);
      el.querySelector('.sec-head').appendChild(b);
    }

    let box;
    if (sec.layout === 'wide' || sec.layout === 'row') {
      const wrap = document.createElement('div');
      wrap.className = `track-wrap${sec.layout === 'row' ? ' covers' : ''}`;
      wrap.innerHTML = `
        <button class="nav prev" aria-label="Anterior"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>
        <div class="track"></div>
        <button class="nav next" aria-label="Siguiente"><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button>`;
      box = wrap.querySelector('.track');
      wrap.querySelector('.prev').addEventListener('click', () => box.scrollBy({ left: -box.clientWidth * 0.8, behavior: 'smooth' }));
      wrap.querySelector('.next').addEventListener('click', () => box.scrollBy({ left: box.clientWidth * 0.8, behavior: 'smooth' }));
      box.addEventListener('scroll', () => updateNav(sec), { passive: true });
      el.appendChild(wrap);
    } else {
      box = document.createElement('div');
      box.className = sec.layout === 'list' ? 'set-list' : 'grid';
      el.appendChild(box);
    }

    sec.games.forEach((g, ii) => box.appendChild(
      sec.layout === 'list' ? createSetting(g, si, ii) : createTile(g, si, ii, sec.layout, sec.muted),
    ));
    sec.el = el;
    sec.box = box;
    content.appendChild(el);
    if (box.classList.contains('track')) updateNav(sec);

    // Animación de entrada escalonada
    el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }],
      { duration: 550, delay: si * 80, easing: EASE, fill: 'backwards' });
    [...box.children].slice(0, 18).forEach((t, k) => t.animate(
      [{ opacity: 0, transform: 'translateY(14px) scale(.98)' }, { opacity: 1, transform: 'none' }],
      { duration: 520, delay: si * 80 + k * 28, easing: EASE, fill: 'backwards' },
    ));
  });

  const empty = $('#empty');
  empty.hidden = state.sections.length > 0 || isStats;
  empty.textContent = state.q ? `No hay juegos que coincidan con "${state.q}".` : 'No hay juegos aquí.';

  let s = 0;
  let i = 0;
  if (keepId) {
    for (let k = 0; k < state.sections.length; k++) {
      const j = state.sections[k].games.findIndex((g) => g.id === keepId);
      if (j >= 0) { s = k; i = j; break; }
    }
  }
  state.mem = {};
  if (state.sections.length) focusAt(s, i, { instant: true, quiet: state.inSide, silent: true });
}

/* ---------------- Enfoque y movimiento ---------------- */

function cols(sec) {
  if (sec.layout !== 'grid') return sec.layout === 'list' ? 1 : sec.games.length;
  const items = sec.box.children;
  if (!items.length) return 1;
  const top = items[0].offsetTop;
  let n = 0;
  for (const it of items) { if (it.offsetTop !== top) break; n++; }
  return Math.max(1, n);
}

function focusAt(s, i, opts = {}) {
  const sec = state.sections[s];
  if (!sec) return;
  i = Math.max(0, Math.min(sec.games.length - 1, i));
  const el = sec.box.children[i];
  const prev = document.querySelector('.tile.focus, .set-row.focus');
  const changed = prev !== el;
  if (prev && changed) prev.classList.remove('focus');
  if (!opts.quiet) el.classList.add('focus');
  if (changed && !opts.silent && !usingMouse) sfx.play('move');
  state.s = s;
  state.i = i;
  state.mem[sec.key] = i;

  if (opts.scroll !== false) {
    const behavior = opts.instant ? 'auto' : 'smooth';
    if (sec.box.classList.contains('track')) {
      const tr = sec.box.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      if (er.left < tr.left + 30) sec.box.scrollBy({ left: er.left - tr.left - 30, behavior });
      else if (er.right > tr.right - 30) sec.box.scrollBy({ left: er.right - tr.right + 30, behavior });
      $('#scroller').scrollTo({ top: sec.el.offsetTop - 26, behavior });
    } else {
      el.scrollIntoView({ block: 'nearest', behavior });
    }
  }
  if (sec.layout !== 'list') select(sec.games[i]);
}

function move(dir) {
  if (state.inSide) {
    if (dir === 'U') moveSide(-1);
    else if (dir === 'D') moveSide(1);
    else if (dir === 'R') leaveSide();
    return;
  }
  const sec = state.sections[state.s];
  if (!sec) { if (dir === 'L') enterSide(); return; }
  const c = cols(sec);
  const i = state.i;
  const isGrid = sec.layout === 'grid' || sec.layout === 'list';

  if (dir === 'L') {
    if (i % c === 0) enterSide();
    else focusAt(state.s, i - 1);
  } else if (dir === 'R') {
    if (!isGrid || (i + 1) % c !== 0) focusAt(state.s, i + 1);
  } else if (dir === 'U') {
    if (isGrid && i - c >= 0) focusAt(state.s, i - c);
    else if (state.s > 0) {
      const p = state.sections[state.s - 1];
      focusAt(state.s - 1, state.mem[p.key] ?? 0);
    } else $('#q').focus();
  } else if (dir === 'D') {
    if (isGrid && i + c < sec.games.length) focusAt(state.s, i + c);
    else if (isGrid && Math.floor(i / c) < Math.floor((sec.games.length - 1) / c)) focusAt(state.s, sec.games.length - 1);
    else if (state.s < state.sections.length - 1) {
      const n = state.sections[state.s + 1];
      focusAt(state.s + 1, state.mem[n.key] ?? 0);
    }
  }
}

function activate() {
  if (state.inSide) {
    clearTimeout(sideTimer);
    setView(sideItems()[state.sideIdx]?.dataset.view);
    leaveSide();
    return;
  }
  const sec = state.sections[state.s];
  if (sec?.layout === 'list') runSetting(sec.games[state.i]);
  else if (state.sel) play(state.sel);
}

/* ---------------- Imagen grande de arriba ---------------- */

let heroTimer = 0;
let heroToken = 0;
let heroFront = $('#heroA');
let heroBack = $('#heroB');

function select(g) {
  if (state.sel === g.id) return;
  const first = state.sel === null;
  state.sel = g.id;
  clearTimeout(heroTimer);
  if (first) showHero(g);
  else heroTimer = setTimeout(() => showHero(g), 80);
}

function showHero(g, refresh = false) {
  const token = ++heroToken;
  const src = g.art.hero || g.art.cover || '';
  const useBlur = !g.art.hero;

  if (!src) {
    heroFront.classList.remove('on');
    heroBack.classList.remove('on');
    heroFront.dataset.src = '';
  } else if (heroFront.dataset.src !== src || refresh) {
    const next = heroBack;
    const swap = () => {
      if (token !== heroToken) return;
      next.classList.toggle('blur', useBlur);
      next.classList.add('on');
      heroFront.classList.remove('on');
      heroBack = heroFront;
      heroFront = next;
    };
    next.dataset.src = src;
    next.classList.remove('on');
    if (next.getAttribute('src') === src && next.complete) requestAnimationFrame(swap);
    else { next.onload = swap; next.src = src; }
  }

  const logo = $('#logo');
  const title = $('#title');
  title.textContent = g.name;
  if (g.art.logo) {
    logo.onload = () => { if (token !== heroToken) return; logo.classList.add('on'); title.classList.add('hide'); };
    logo.onerror = () => { logo.classList.remove('on'); title.classList.remove('hide'); };
    if (logo.getAttribute('src') === g.art.logo && logo.complete) logo.onload();
    else { logo.classList.remove('on'); title.classList.add('hide'); logo.src = g.art.logo; }
  } else {
    logo.classList.remove('on');
    logo.removeAttribute('src');
    title.classList.remove('hide');
  }

  const meta = $('#meta');
  meta.textContent = '';
  const badge = document.createElement('span');
  badge.className = 'badge';
  badge.innerHTML = `<svg viewBox="0 0 24 24" aria-hidden="true">${ICONS[/roblox/i.test(g.name) ? 'roblox' : g.source]}</svg>`;
  badge.title = SOURCES[g.source];
  badge.dataset.src = g.source;
  const when = document.createElement('span');
  when.textContent = timeAgo(g.lastPlayed);
  meta.append(badge, when);
  const pt = playtimeText(g.playtime);
  if (pt) {
    const t = document.createElement('span');
    t.textContent = pt;
    meta.append(t);
  }
  $('#favBtn').classList.toggle('on', !!g.fav);

  if (!refresh) {
    $('#heroContent').animate(
      [{ opacity: 0, transform: 'translateY(12px)' }, { opacity: 1, transform: 'none' }],
      { duration: 520, easing: EASE },
    );
  }
}

/* ---------------- Acciones ---------------- */

let toastTimer = 0;
function toast(text) {
  const t = $('#toast');
  t.textContent = text;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 2600);
}

async function play(id) {
  const g = findGame(id);
  if (!g) return;
  sfx.play('select');
  sfx.pause();
  const btn = $('#play');
  btn.classList.add('busy');
  btn.querySelector('span').textContent = 'INICIANDO';
  const ok = await window.api.launch(id);
  toast(ok ? `Abriendo ${g.name}` : `No se pudo abrir ${g.name}`);
  if (ok) {
    g.lastPlayed = Date.now();
    if (state.sel === id) showHero(g, true);
  }
  setTimeout(() => {
    btn.classList.remove('busy');
    btn.querySelector('span').textContent = 'JUGAR';
  }, 2500);
}

async function toggleFav(id) {
  const g = findGame(id);
  if (!g) return;
  g.fav = await window.api.fav(id);
  sfx.play('fav');
  toast(g.fav ? `${g.name} está en Favoritos` : `${g.name} ya no está en Favoritos`);
  const btn = $('#favBtn');
  if (state.sel === id) {
    btn.classList.toggle('on', g.fav);
    btn.classList.remove('bump');
    void btn.offsetWidth;
    btn.classList.add('bump');
  }
  renderSide();
  // En Inicio la fila de Favoritos cambia; en otras vistas solo la estrella
  if (state.view === 'home' || state.view === 'favs') render();
  else tilesById.get(id)?.forEach((el) => paintTile(el, g));
}

function refreshArt(g) {
  tilesById.get(g.id)?.forEach((el) => paintTile(el, g));
  if (state.sel === g.id) showHero(g, true);
}

function applyList(list, opts = {}) {
  const before = new Set(state.all.map((g) => g.id));
  const changed = list.length !== state.all.length || list.some((g) => !before.has(g.id));
  const added = state.all.length ? list.filter((g) => !before.has(g.id)) : [];
  state.all = list;
  state.lastScan = Date.now();
  renderSide();
  if (changed || opts.force) render();
  if (added.length) toast(added.length === 1 ? `Nuevo juego: ${added[0].name}` : `${added.length} juegos nuevos`);
  return added;
}

let refreshing = false;
async function refresh(manual = false) {
  if (refreshing) return;
  refreshing = true;
  $('#refresh').classList.add('spin');
  try {
    const added = applyList(await window.api.scan());
    if (manual && !added.length) toast('No hay juegos nuevos');
  } finally {
    refreshing = false;
    setTimeout(() => $('#refresh').classList.remove('spin'), 400);
  }
}

async function addGame() {
  const res = await window.api.addGame();
  if (!res) return;
  applyList(res.list, { force: true });
  const g = findGame(res.id);
  if (g) {
    toast(`${g.name} agregado. Clic derecho para renombrarlo.`);
    state.sel = g.id;
    setView('otros');
  }
}

async function openContext(id) {
  const res = await window.api.context(id);
  const g = findGame(id);
  if (!res || !g) return;
  if (res.action === 'play') play(id);
  if (res.action === 'fav') toggleFav(id);
  if (res.action === 'rename') openRename(id);
  if (res.action === 'newcol') newCollection(id);
  if (res.action === 'info') openInfo(id);
  if (res.action === 'list') { applyList(res.list, { force: state.view.startsWith('col:') }); toast(res.text); }
  if (res.action === 'art') { g.art = res.art; refreshArt(g); }
  if (res.action === 'removed') { applyList(res.list, { force: true }); toast(`${g.name} se quitó`); }
  if (res.action === 'hide') {
    g.hidden = res.hidden;
    toast(res.hidden ? `${g.name} se movió a Ocultos` : `${g.name} vuelve a tu biblioteca`);
    renderSide();
    render();
  }
}

async function runSetting(item) {
  if (item.type === 'toggle') {
    const value = !state.settings[item.key];
    state.settings[item.key] = value;
    await window.api.setSetting(item.key, value);
    if (item.key === 'sounds') sfx.on = value;
    if (item.key === 'music') sfx.music(value);
    sfx.play('select');
    document.querySelector(`.set-row[data-key="${item.key}"]`)?.classList.toggle('on', value);
    if (item.key === 'startup') toast(value ? 'Se abrirá al prender la PC' : 'Ya no se abrirá al prender la PC');
  } else if (item.key === 'add') addGame();
  else if (item.key === 'refresh') refresh(true);
}

/* ---------------- Orden ---------------- */

function cycleSort() {
  const keys = Object.keys(SORTS);
  state.sort = keys[(keys.indexOf(state.sort) + 1) % keys.length];
  localStorage.sort = state.sort;
  sfx.play('view');
  toast(`Ordenado por ${SORTS[state.sort].toLowerCase()}`);
  render();
}

/* ---------------- Estadísticas ---------------- */

async function renderStats(content) {
  const { base, since } = await window.api.stats();
  if (state.view !== 'stats') return;
  const games = state.all.filter((g) => !g.hidden);
  const total = games.reduce((s, g) => s + (g.playtime || 0), 0);
  const week = games.map((g) => ({ g, m: Math.max(0, (g.playtime || 0) - (base[g.id] ?? (g.playtime || 0))) }));
  const weekTotal = week.reduce((s, x) => s + x.m, 0);
  const played = games.filter((g) => g.playtime > 0).length;
  const top = [...games].filter((g) => g.playtime > 0).sort((a, b) => b.playtime - a.playtime).slice(0, 8);
  const hours = (m) => (m < 60 ? `${m} min` : `${(m / 60).toFixed(m < 600 ? 1 : 0).replace('.0', '')} h`);

  const el = document.createElement('section');
  el.className = 'sec stats-view';
  el.innerHTML = `
    <div class="sec-head"><h2>Estadísticas</h2></div>
    <div class="stat-cards">
      <div class="stat"><small>Tiempo total</small><b data-k="total"></b></div>
      <div class="stat"><small>Esta semana</small><b data-k="week"></b><em data-k="since"></em></div>
      <div class="stat"><small>Juegos jugados</small><b data-k="played"></b></div>
    </div>
    <div class="sec-head"><h2>Más jugados</h2></div>
    <div class="bars"></div>`;
  el.querySelector('[data-k=total]').textContent = hours(total);
  el.querySelector('[data-k=week]').textContent = hours(weekTotal);
  el.querySelector('[data-k=since]').textContent = since === new Date().toISOString().slice(0, 10)
    ? 'Se empieza a contar desde hoy' : `Desde el ${new Date(`${since}T12:00`).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}`;
  el.querySelector('[data-k=played]').textContent = `${played} de ${games.length}`;
  const bars = el.querySelector('.bars');
  if (!top.length) bars.textContent = 'Todavía no hay tiempo de juego registrado.';
  top.forEach((g, k) => {
    const row = document.createElement('button');
    row.className = 'bar-row';
    row.innerHTML = '<span class="bar-name"></span><span class="bar-track"><span class="bar-fill"></span></span><span class="bar-val"></span>';
    row.querySelector('.bar-name').textContent = g.name;
    row.querySelector('.bar-val').textContent = hours(g.playtime);
    const fill = row.querySelector('.bar-fill');
    fill.animate([{ transform: 'scaleX(0)' }, { transform: `scaleX(${g.playtime / top[0].playtime})` }],
      { duration: 700, delay: 120 + k * 60, easing: EASE, fill: 'both' });
    row.addEventListener('click', () => openInfo(g.id));
    bars.appendChild(row);
  });
  content.textContent = '';
  content.appendChild(el);
  el.animate([{ opacity: 0, transform: 'translateY(16px)' }, { opacity: 1, transform: 'none' }], { duration: 550, easing: EASE });
  if (top[0]) select(top[0]);
}

/* ---------------- Ficha del juego ---------------- */

let infoId = null;
function fmtSize(b) {
  if (!b) return 'Desconocido';
  const gb = b / 1024 ** 3;
  return gb >= 1 ? `${gb.toFixed(1)} GB` : `${Math.round(b / 1024 ** 2)} MB`;
}
async function openInfo(id) {
  const g = findGame(id);
  if (!g) return;
  infoId = id;
  sfx.play('view');
  const box = $('#info');
  box.querySelector('h3').textContent = g.name;
  const rows = {
    Plataforma: SOURCES[g.source],
    'Tiempo jugado': playtimeText(g.playtime) || 'Sin registro',
    'Última vez': timeAgo(g.lastPlayed).replace(/^Jugado /, ''),
    Instalado: 'Calculando…',
    Tamaño: 'Calculando…',
    Carpeta: '…',
  };
  const dl = box.querySelector('dl');
  const paint = () => {
    dl.textContent = '';
    for (const [k, v] of Object.entries(rows)) {
      const dt = document.createElement('dt');
      const dd = document.createElement('dd');
      dt.textContent = k;
      dd.textContent = v;
      dl.append(dt, dd);
    }
  };
  paint();
  const un = $('#infoUninstall');
  un.textContent = g.custom ? 'Quitar de Mis Juegos' : 'Desinstalar';
  un.classList.remove('armed');
  $('#infoModal').hidden = false;
  $('#infoPlay').focus();
  const d = await window.api.details(id);
  if (infoId !== id || !d) return;
  rows.Instalado = d.installed ? new Date(d.installed).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Desconocido';
  rows.Tamaño = fmtSize(d.size);
  rows.Carpeta = d.path || 'Desconocida';
  paint();
}
function closeInfo() {
  infoId = null;
  $('#infoModal').hidden = true;
}
$('#infoClose').addEventListener('click', closeInfo);
$('#infoModal').addEventListener('click', (e) => { if (e.target.id === 'infoModal') closeInfo(); });
$('#infoPlay').addEventListener('click', () => { const id = infoId; closeInfo(); play(id); });
$('#infoFolder').addEventListener('click', () => window.api.openFolder(infoId));
$('#infoUninstall').addEventListener('click', async (e) => {
  const b = e.currentTarget;
  // Pide confirmar con un segundo clic
  if (!b.classList.contains('armed')) { b.classList.add('armed'); b.textContent = 'Confirmar'; return; }
  const id = infoId;
  const g = findGame(id);
  closeInfo();
  const r = await window.api.uninstall(id);
  if (r?.removed) { applyList(r.list, { force: true }); toast(`${g.name} se quitó`); }
  else if (r?.opened) toast(`Se abrió el desinstalador de ${SOURCES[g.source]}`);
});
$('#infoBtn').addEventListener('click', () => state.sel && openInfo(state.sel));

/* ---------------- Ventana para escribir (renombrar / colección) ---------------- */

let renaming = null; // { submit(texto) }
function openPrompt(title, value, submit) {
  renaming = { submit };
  $('#modal h3').textContent = title;
  const input = $('#renameInput');
  input.value = value;
  $('#modal').hidden = false;
  input.focus();
  input.select();
}
function openRename(id) {
  const g = findGame(id);
  if (!g) return;
  openPrompt('Renombrar juego', g.name, async (text) => {
    const view = await window.api.rename(id, text);
    if (!view) return;
    g.name = view.name;
    tilesById.get(id)?.forEach((el) => paintTile(el, g));
    if (state.sel === id) showHero(g, true);
    toast('Nombre guardado');
  });
}
function newCollection(id) {
  openPrompt('Nueva colección', '', async (text) => {
    const name = text.trim();
    if (!name) return;
    const list = await window.api.collect(id, name, true);
    if (!list) return;
    applyList(list, { force: state.view.startsWith('col:') });
    toast(`Agregado a ${name}`);
  });
}
function closeRename() {
  renaming = null;
  $('#modal').hidden = true;
}
$('#renameForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const r = renaming;
  const text = $('#renameInput').value;
  closeRename();
  r?.submit(text);
});
$('#renameCancel').addEventListener('click', closeRename);
$('#modal').addEventListener('click', (e) => { if (e.target.id === 'modal') closeRename(); });

/* ---------------- Teclado, mouse y control ---------------- */

// Solo cuenta como "usar el mouse" si de verdad se movió
addEventListener('mousemove', (e) => { if (e.movementX || e.movementY) usingMouse = true; }, { passive: true });

addEventListener('keydown', (e) => {
  if (renaming) { if (e.key === 'Escape') closeRename(); return; }
  if (infoId) { if (e.key === 'Escape') closeInfo(); return; }
  const q = $('#q');
  const inSearch = document.activeElement === q;

  if ((e.ctrlKey && e.key.toLowerCase() === 'f') || (!inSearch && e.key === '/')) {
    e.preventDefault();
    q.focus();
    q.select();
    return;
  }
  if (inSearch) {
    if (e.key === 'Escape') { q.value = ''; onSearch(); q.blur(); }
    else if (e.key === 'ArrowDown' || e.key === 'Enter') { e.preventDefault(); q.blur(); }
    return;
  }

  usingMouse = false;
  const keys = {
    ArrowRight: () => move('R'),
    ArrowLeft: () => move('L'),
    ArrowDown: () => move('D'),
    ArrowUp: () => move('U'),
    Enter: activate,
    Escape: () => (state.inSide ? leaveSide() : enterSide()),
    f: () => state.sel && !state.inSide && toggleFav(state.sel),
    o: () => state.sections.some((s) => s.sortable) && cycleSort(),
    i: () => state.sel && !state.inSide && openInfo(state.sel),
  };
  const k = keys[e.key] || keys[e.key.toLowerCase()];
  if (k) { e.preventDefault(); k(); }
});

let searchTimer = 0;
function onSearch() {
  state.q = $('#q').value;
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { state.sel = null; render(); }, 120);
}
$('#q').addEventListener('input', onSearch);
$('#play').addEventListener('click', () => state.sel && play(state.sel));
$('#favBtn').addEventListener('click', () => state.sel && toggleFav(state.sel));
$('#addGame').addEventListener('click', addGame);
$('#refresh').addEventListener('click', () => refresh(true));
addEventListener('resize', () => markSide(true));

// Al volver a la ventana, revisa si hay juegos nuevos (máximo cada minuto)
addEventListener('blur', () => sfx.pause());
addEventListener('focus', () => {
  sfx.resume();
  if (Date.now() - state.lastScan > 60000) refresh();
});

// Control (GameSir / Xbox): cruceta o stick, A jugar, B menú, Y favorito, LB/RB cambiar sección
const pad = { dir: '', next: 0, btn: {} };
function pressed(gp, i) {
  const now = !!gp.buttons[i]?.pressed;
  const was = pad.btn[i];
  pad.btn[i] = now;
  return now && !was;
}
function pollGamepad(t) {
  const gp = [...navigator.getGamepads()].find(Boolean);
  if (gp && infoId) {
    if (pressed(gp, 1)) closeInfo();
    if (pressed(gp, 0)) document.querySelector('#infoPlay').click();
  } else if (gp && !renaming) {
    const b = (i) => gp.buttons[i]?.pressed;
    const x = gp.axes[0] || 0;
    const y = gp.axes[1] || 0;
    const dir = b(14) || x < -0.5 ? 'L' : b(15) || x > 0.5 ? 'R' : b(12) || y < -0.5 ? 'U' : b(13) || y > 0.5 ? 'D' : '';
    if (dir && t >= pad.next) {
      usingMouse = false;
      if (document.activeElement === $('#q')) $('#q').blur();
      move(dir);
      pad.next = t + (pad.dir === dir ? 140 : 380);
    }
    if (!dir) pad.next = 0;
    pad.dir = dir;

    if (pressed(gp, 0)) activate();
    if (pressed(gp, 1)) (state.inSide ? leaveSide() : enterSide());
    if (pressed(gp, 3) && state.sel && !state.inSide && state.view !== 'settings') toggleFav(state.sel);
    if (pressed(gp, 2) && state.sections.some((s) => s.sortable)) cycleSort();
    if (pressed(gp, 9) && state.sel && !state.inSide) openInfo(state.sel);
    const items = sideItems();
    const cur = items.findIndex((x) => x.dataset.view === state.view);
    if (pressed(gp, 4) && cur > 0) setView(items[cur - 1].dataset.view);
    if (pressed(gp, 5) && cur < items.length - 1) setView(items[cur + 1].dataset.view);
  }
  requestAnimationFrame(pollGamepad);
}
requestAnimationFrame(pollGamepad);

/* ---------------- Inicio ---------------- */

(async () => {
  const started = performance.now();
  // Primero la lista guardada (instantáneo); si no hay, se busca ahora
  const [cached, settings] = await Promise.all([window.api.cached(), window.api.settings()]);
  const list = cached || await window.api.scan();
  state.settings = settings;
  sfx.on = settings.sounds;
  sfx.music(!!settings.music);
  window.api.onArt(({ id, art }) => {
    const g = findGame(id);
    if (g) { g.art = art; refreshArt(g); }
  });
  window.api.onChanged(() => refresh());
  window.api.onUpdate((v) => toast(`Versión ${v} lista. Se instalará al cerrar la app.`));
  window.api.onFullscreen((on) => {
    state.settings.fullscreen = on;
    document.querySelector('.set-row[data-key="fullscreen"]')?.classList.toggle('on', on);
  });

  state.all = list;
  state.lastScan = Date.now();
  renderSide();
  markSide(true);
  render();

  // La bienvenida dura al menos 1.2 s para que se vea la animación
  setTimeout(() => {
    $('#splash').classList.add('out');
    document.body.classList.remove('booting');
  }, Math.max(0, 500 - (performance.now() - started)));

  // Luego busca en segundo plano por si hay cambios
  if (cached) setTimeout(() => refresh(), 600);
})();
