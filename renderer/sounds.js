'use strict';

// Sonidos suaves tipo consola, generados al momento (sin archivos de audio)
window.sfx = {
  on: true,
  ctx: null,
  last: 0,

  play(type) {
    if (!this.on) return;
    const now = performance.now();
    if (type === 'move' && now - this.last < 45) return; // no saturar al mantener presionado
    this.last = now;
    try {
      this.ctx ||= new AudioContext();
      const c = this.ctx;
      const t = c.currentTime;
      const tones = {
        move: [[1046, 0.016, 0.045, 'sine']],
        select: [[660, 0.035, 0.09, 'triangle'], [990, 0.03, 0.14, 'triangle', 0.06]],
        back: [[520, 0.022, 0.07, 'sine']],
        fav: [[880, 0.03, 0.1, 'triangle'], [1320, 0.025, 0.16, 'triangle', 0.07]],
        view: [[740, 0.02, 0.07, 'sine']],
      }[type] || [];
      for (const [freq, vol, len, wave, delay = 0] of tones) {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = wave;
        o.frequency.setValueAtTime(freq, t + delay);
        g.gain.setValueAtTime(0, t + delay);
        g.gain.linearRampToValueAtTime(vol, t + delay + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0001, t + delay + len);
        o.connect(g).connect(c.destination);
        o.start(t + delay);
        o.stop(t + delay + len + 0.02);
      }
    } catch {}
  },

  // Música de fondo: acordes suaves generados al momento (sin archivos)
  musicOn: false,
  bus: null,
  timer: 0,
  step: 0,

  music(on) {
    this.musicOn = on;
    if (on) this.resume(); else this.pause();
  },

  resume() {
    if (!this.musicOn || this.timer) return;
    try {
      this.ctx ||= new AudioContext();
      const c = this.ctx;
      if (!this.bus) {
        this.bus = c.createGain();
        const lp = c.createBiquadFilter();
        lp.type = 'lowpass';
        lp.frequency.value = 1400;
        this.bus.connect(lp).connect(c.destination);
      }
      this.bus.gain.cancelScheduledValues(c.currentTime);
      this.bus.gain.setTargetAtTime(0.05, c.currentTime, 1.2);
      this.chord();
      this.timer = setInterval(() => this.chord(), 6000);
    } catch {}
  },

  pause() {
    clearInterval(this.timer);
    this.timer = 0;
    if (this.bus && this.ctx) this.bus.gain.setTargetAtTime(0, this.ctx.currentTime, 0.6);
  },

  chord() {
    const c = this.ctx;
    const chords = [[220, 277.2, 329.6, 440], [196, 246.9, 293.7, 392], [174.6, 220, 261.6, 349.2], [196, 246.9, 329.6, 392]];
    const notes = chords[this.step++ % chords.length];
    const t = c.currentTime;
    for (const f of notes) {
      for (const detune of [-4, 4]) {
        const o = c.createOscillator();
        const g = c.createGain();
        o.type = 'sine';
        o.frequency.value = f;
        o.detune.value = detune;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.12, t + 2.2);
        g.gain.linearRampToValueAtTime(0, t + 7.5);
        o.connect(g).connect(this.bus);
        o.start(t);
        o.stop(t + 7.6);
      }
    }
  },
};
