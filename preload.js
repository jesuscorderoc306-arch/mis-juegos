// Puente seguro entre la ventana y el resto del programa.
const { contextBridge, ipcRenderer } = require('electron');

const on = (channel) => (cb) => ipcRenderer.on(channel, (_e, data) => cb(data));

contextBridge.exposeInMainWorld('api', {
  scan: () => ipcRenderer.invoke('scan'),
  cached: () => ipcRenderer.invoke('cached'),
  launch: (id) => ipcRenderer.invoke('launch', id),
  context: (id) => ipcRenderer.invoke('context', id),
  fav: (id) => ipcRenderer.invoke('fav', id),
  rename: (id, name) => ipcRenderer.invoke('rename', id, name),
  addGame: () => ipcRenderer.invoke('add-game'),
  settings: () => ipcRenderer.invoke('settings'),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  stats: () => ipcRenderer.invoke('stats'),
  details: (id) => ipcRenderer.invoke('details', id),
  openFolder: (id) => ipcRenderer.invoke('open-folder', id),
  uninstall: (id) => ipcRenderer.invoke('uninstall', id),
  collect: (id, name, on) => ipcRenderer.invoke('collect', id, name, on),
  onArt: on('art'),
  onUpdate: on('update'),
  onChanged: on('changed'),
  onFullscreen: on('fullscreen'),
});
