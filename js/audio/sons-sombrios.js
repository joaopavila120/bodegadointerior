// Ambiente de medo: a mata adentro (e o pinheiral e a clareira das lendas, de noite) e a gruta da Serra.
//   · Mata: vento nas copas, grilos, a coruja, o urutau (a mãe-da-lua, que chora "ai, ai, ai"), galho quebrando,
//     folha mexendo no escuro, um uivo longe e, de vez em quando, um sussurro que ninguém sabe de onde vem.
//   · Gruta: o ronco da pedra, o vento gemendo nos túneis, goteira com eco, morcego, pedra rolando longe, a rocha
//     rangendo e, nos andares fundos, uma risadinha perdida.
// Tudo no volume do ambiente (o controle de "ambiente" do menu); os relógios sorteiam o intervalo de cada som.
'use strict';

const SOMBRIO = { clocks: {} };
function sombrioMata() { return !!worldOut && (inTrecho() || inArena() || (worldOut.map === 'mata' && worldNight())); }
// Conta o relógio do som e diz se é hora de tocar (e já sorteia o próximo).
function sombrioDue(id, dt, min, max) {
  const c = SOMBRIO.clocks; c[id] = (c[id] ?? min * Math.random() + 2) - dt;
  if (c[id] > 0) return false; c[id] = min + Math.random() * (max - min); return true;
}

Object.assign(AudioEngine, {
  // Um "eco": o mesmo som de novo, mais baixo e mais tarde.
  echo(fn, times = 2, gap = .2, fade = .45) { fn(1, 0); for (let i = 1; i <= times; i++) fn(Math.pow(fade, i), gap * i); },
  coruja(vol = .03) { [0, .42, .62].forEach((t, i) => this.caveVoice([i ? 360 : 330, i ? 340 : 310], i === 2 ? .55 : .3, { type: 'sine', formant: 500, q: .8, vol, vib: 6, rate: 7, delay: t })); },
  // O urutau: notas que vão descendo, tristes, uma atrás da outra.
  urutau(vol = .028) { [880, 760, 640, 560, 500].forEach((f, i) => this.caveVoice([f * 1.04, f, f * .92], .62, { type: 'sine', formant: 800, q: .6, vol: vol * (1 - i * .12), vib: 9, rate: 5, delay: i * .78 })); },
  uivo(vol = .022) { this.caveVoice([260, 470, 520, 500, 360], 2.6, { type: 'sine', formant: 650, q: .7, vol, vib: 8, rate: 4.5 }); },
  galho(vol = .1) { this.pop(900 + Math.random() * 500, vol, .05); this.noise(.12, vol * .6, 1100); this.note(150, .06, 'triangle', vol * .4); },
  folhas(vol = .05) { for (let i = 0; i < 4; i++) setTimeout(() => { this.bus = this.ambientBus; this.noise(.09, vol * (.6 + Math.random() * .5), 2600 + Math.random() * 1400); this.bus = null; }, i * (140 + Math.random() * 90)); },
  sussurro(vol = .03) { this.caveVoice([180, 210, 160], 1.4, { type: 'sawtooth', formant: 2400, q: 6, vol: vol * .5, vib: 30, rate: 11 }); this.noise(1.2, vol, 2800); },
  grilo(vol = .01) { for (let i = 0; i < 3; i++) this.note(4300 + Math.random() * 300, .03, 'triangle', vol, i * .07); },
  morcego(vol = .02) { for (let i = 0; i < 5; i++) this.note(6200 + Math.random() * 1600, .025, 'sine', vol, i * .06 + Math.random() * .03); this.noise(.3, vol * 1.5, 1800); },
  pedrasLonge(vol = .06) { this.echo((k, d) => { this.note(70, .2, 'triangle', vol * k, d); setTimeout(() => { this.bus = this.ambientBus; this.noise(.3, vol * .9 * k, 500); this.bus = null; }, d * 1000); }, 2, .28, .4); for (let i = 0; i < 4; i++) this.pop(1000 + Math.random() * 1500, vol * .5, .03); },
  rochaRange(vol = .05) { this.caveVoice([62, 48, 44], 1.6, { type: 'sawtooth', formant: 160, q: 2, vol, vib: 3, rate: 9 }); },
  goteiraEco(vol = .024) { const f = 1200 + Math.random() * 900; this.echo((k, d) => setTimeout(() => { this.bus = this.ambientBus; this.bloop(f, vol * k); this.bus = null; }, d * 1000), 2, .22, .4); }
});

{
  const amb = AudioEngine.ambience;
  AudioEngine.ambience = function (dt) {
    amb.call(this, dt);
    const mata = sombrioMata(), gruta = typeof inCave === 'function' && inCave(), deep = gruta ? caveFloorRun()?.floor || 1 : 0, t = frameClock;
    this.bus = this.ambientBus;
    // Fundo contínuo: o vento nas copas (com rajadas) e, na gruta, o ronco da pedra e o vento gemendo nos túneis.
    this.loop('mataVento', mata ? .026 + .018 * Math.max(0, Math.sin(t * .23) * Math.sin(t * .61)) : 0, { type: 'bandpass', freq: 380, q: .6 });
    this.loop('grutaRonco', gruta ? .05 + Math.min(.04, deep * .002) : 0, { buffer: 'brown', type: 'lowpass', freq: 110 });
    const moan = this.loop('grutaVento', gruta ? .012 + .012 * Math.max(0, Math.sin(t * .17)) : 0, { type: 'bandpass', freq: 260, q: 4 });
    if (moan && gruta) moan.filter.frequency.setTargetAtTime(220 + 120 * Math.sin(t * .21), this.ctx.currentTime, .4);
    if (mata) {
      if (sombrioDue('grilo', dt, .6, 2.2)) this.grilo();
      if (sombrioDue('coruja', dt, 14, 30)) this.coruja();
      if (sombrioDue('urutau', dt, 40, 80)) this.urutau();
      if (sombrioDue('uivo', dt, 45, 90)) this.uivo();
      if (sombrioDue('galho', dt, 10, 24)) this.galho(.05 + Math.random() * .06);
      if (sombrioDue('folhas', dt, 16, 34)) this.folhas();
      if (sombrioDue('sussurro', dt, 60, 120)) this.sussurro();
    }
    if (gruta && deep > 1) {
      if (sombrioDue('goteiraEco', dt, 5, 12)) this.goteiraEco();
      if (sombrioDue('morcego', dt, 18, 36)) this.morcego();
      if (sombrioDue('pedras', dt, 22, 45)) this.pedrasLonge(.04 + Math.random() * .04);
      if (sombrioDue('rocha', dt, 35, 70)) this.rochaRange();
      if (deep > 10 && sombrioDue('risada', dt, 50, 100)) this.caveGiggle();
    }
    this.bus = null;
  };
}
