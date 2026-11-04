// Sons gravados (assets/audio/sons, créditos em CREDITOS.md): o tiro, os bichos, o baú abrindo, o campo
// de dia, a noite de grilos e sapos, o fogo, a caverna, a Maria Fumaça (e o apito) e o sino da igreja da Serra.
// Cada um entra por cima do som sintetizado; enquanto o arquivo não chegou (ou se falhar), o sintetizado toca como antes.
//   · Os dados vêm de sons.js (base64), carregado depois do primeiro clique: assim funciona também em file://.
//   · Cada som só é decodificado na primeira vez que toca (os laços são os maiores).
//   · Os laços de ambiente sobem e descem devagar conforme o lugar e a hora, baixinhos e sem agudo.
'use strict';

// Duração de cada laço (laco-campo.mp3…; o arquivo tem 0,2 s antes e 0,3 s depois: o laço toca de 0,25 s até 0,25 s + duração).
const SONS_LACOS = { caverna: 32, campo: 32, mata: 30, noite: 30, fogo: 20, trem: 24 };
// Os laços sintetizados que o gravado substitui.
const SONS_TROCA = { grutaRonco: 'caverna', grutaVento: 'caverna', fire: 'fogo' };
// Mapas de céu aberto (os outros são casas, salões, a caverna e o navio).
const SONS_FORA = new Set(['vila', 'serra', 'sc', 'mata', 'trecho', 'arena', 'laguna', 'horta', 'curral', 'ilha', 'ilhamato']);
const SONS_MATO = new Set(['mata', 'trecho', 'arena', 'ilha', 'ilhamato']);

Object.assign(AudioEngine, {
  sons: {}, sonsPedidos: false, sonsLacos: {},
  // Os sons curtos já ficam decodificados quando o pacote chega (o primeiro tiro sai gravado); os laços, na hora.
  carregarSons() {
    if (this.sonsPedidos || !this.ctx) return; this.sonsPedidos = true;
    const curtos = () => { for (const k of Object.keys(window.BODEGA_SONS || {})) if (!k.startsWith('laco-')) this.somBuffer(k); };
    if (window.BODEGA_SONS) { curtos(); return; }
    const s = document.createElement('script'); s.src = 'assets/audio/sons/sons.js'; s.onload = curtos; s.onerror = () => {}; document.head.append(s);
  },
  // O buffer pronto, ou null (e a decodificação começa na primeira vez).
  somBuffer(k) {
    if (this.sons[k]) return this.sons[k];
    const b64 = window.BODEGA_SONS?.[k]; if (this.sons[k] === null || !b64 || !this.ctx) return null;
    this.sons[k] = null;
    const bin = atob(b64), bytes = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    this.ctx.decodeAudioData(bytes.buffer).then(b => { this.sons[k] = b; }, () => {});
    return null;
  },
  somPronto(k) { return !!this.sons[k]; },
  // Toca um som curto no canal da vez (efeitos ou ambiente). Falso quando ainda não dá (aí vale o sintetizado).
  som(k, vol = .5, rate = 1, delay = 0, dur) {
    if (!this.on || !this.ctx || this.ctx.state !== 'running') return false;
    const b = this.somBuffer(k); if (!b) return false;
    const c = this.ctx, s = c.createBufferSource(), g = c.createGain();
    s.buffer = b; s.playbackRate.value = rate; g.gain.value = vol; s.connect(g); g.connect(this.out());
    if (dur) { const end = c.currentTime + delay + dur; g.gain.setValueAtTime(vol, end - .08); g.gain.linearRampToValueAtTime(0, end); s.start(c.currentTime + delay, 0, dur); }
    else s.start(c.currentTime + delay);
    s.onended = () => { s.disconnect(); g.disconnect(); }; return true;
  },
  // Um entre vários (porco1, porco2…).
  somDe(base, n, vol, rate) { return this.som(base + (1 + Math.floor(Math.random() * n)), vol, rate); },
  // Laço de ambiente: o volume vai até `level` devagar (zero para calar). `abafa` corta os agudos acima dessa frequência.
  somLaco(k, level, { abafa, tau = .7 } = {}) {
    const c = this.ctx; if (!c || c.state !== 'running') return;
    let l = this.sonsLacos[k];
    if (!l) {
      if (level <= 0) return; const b = this.somBuffer('laco-' + k); if (!b) return;
      const s = c.createBufferSource(), g = c.createGain(), L = SONS_LACOS[k];
      s.buffer = b; s.loop = true; s.loopStart = .25; s.loopEnd = .25 + L; g.gain.value = 0;
      if (abafa) { const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = abafa; f.Q.value = .5; s.connect(f); f.connect(g); } else s.connect(g);
      g.connect(this.ambientBus || this.master); s.start(0, .25 + Math.random() * L);
      l = this.sonsLacos[k] = { s, g };
    }
    l.g.gain.setTargetAtTime(Math.max(0, level), c.currentTime, tau);
  },

  // ---------- Os sons do jogo ----------
  // O tiro: o 38 seco e, com `rate` baixo, a espingarda de dois canos.
  gunshot(v = 1, rate = 1) { if (!this.som('tiro', .55 * v, rate * (.96 + Math.random() * .08))) { this.noise(.2 * v, .3, 700 * rate); this.note(64 * rate, .16, 'sawtooth', .06 * v); } },
});

// ---------- Por cima dos sintetizados ----------
{
  const A = AudioEngine, over = (name, fn) => { const old = A[name]; A[name] = function (...args) { return fn.call(this, old, ...args); }; };
  over('unlock', function (old, ...a) { const r = old.apply(this, a); this.carregarSons(); return r; });
  over('silence', function (old) { old.call(this); for (const l of Object.values(this.sonsLacos)) l.g.gain.setTargetAtTime(0, this.ctx.currentTime, .08); });
  // Com o gravado pronto, o laço sintetizado equivalente fica calado.
  over('loop', function (old, name, level, setup) { return old.call(this, name, SONS_TROCA[name] && this.somPronto('laco-' + SONS_TROCA[name]) ? 0 : level, setup); });
  over('moo', function (old, volume = .07, pitch = 1) { if (!this.somDe('boi', 3, volume * 3, pitch)) old.call(this, volume, pitch); });
  over('neigh', function (old, v = .06) { if (!this.somDe('relincho', 2, v * 6, .95 + Math.random() * .1)) old.call(this, v); });
  over('coruja', function (old, vol = .03) { if (!this.som('coruja', vol * 6, .95 + Math.random() * .1)) old.call(this, vol); });
  over('uivo', function (old, vol = .022) { if (!this.som('uivo', vol * 7, .9 + Math.random() * .1)) old.call(this, vol); });
  over('morcego', function (old, vol = .02) { if (!this.som('morcegos', vol * 14, .95 + Math.random() * .15)) old.call(this, vol); });
  // Com o laço da noite tocando, os grilos já estão nele.
  over('grilo', function (old, vol) { if (!this.somPronto('laco-noite')) old.call(this, vol); });
  // O baú: a tampa rangendo e as moedas lá dentro.
  over('caveChestOpen', function (old) { if (!this.som('bau', .24)) old.call(this); });
  // O facão na carne (o tiro, a pedrada, a lança e os poderes acertando ficam com o baque de antes) e o Sadi apanhando.
  over('caveFlesh', function (old, arma) { if (arma !== 'facao' || !this.som('facao', .4, .9 + Math.random() * .2)) { old.call(this); return; } this.note(105 + Math.random() * 25, .08, 'triangle', .09); });
  over('caveOuch', function (old) { if (!this.som('soco', .55, .9 + Math.random() * .15)) { old.call(this); return; } this.ouch(); this.note(70, .18, 'triangle', .08); });
  // A voz de cada bicho (a morte continua com o grito próprio de cave-deaths.js). As cobras ficam caladas.
  over('caveCry', function (old, kind, dead = false) {
    if (kind === 'jararaca' || kind === 'coral' || kind === 'cascavel') return;
    const r = (a, b) => a + Math.random() * (b - a);
    if (!dead) {
      if (kind === 'javali' && this.somDe('porco', 3, .36, r(.7, .85))) return;
      if (kind === 'queixada' && this.somDe('porco', 3, .27, r(.9, 1.05))) return;
      if (kind === 'onca' && this.som('onca', .4, r(.92, 1.05))) return;
      if (kind === 'lobisomem' && this.somDe('rosnado', 2, .4, r(.7, .82))) return;
      if (kind === 'mula' && this.somDe('relincho', 2, .32, r(.82, .92))) return;
      if (kind === 'corposeco' && this.somDe('corposeco', 3, .15, r(.85, 1))) return;
    } else if (kind === 'corposeco' && this.som('corposeco3', .17, .7)) return;
    return old.call(this, kind, dead);
  });
}

// ---------- O ambiente gravado ----------
// A Maria Fumaça na Serra: bem baixinho, e só quando passa perto (a distância conta até o último vagão).
function sonsTrem(p) {
  const x = serraTrainX(), y = SERRA.rail + 10, d = Math.hypot(p.x - Math.max(x - 600, Math.min(x, p.x)), p.y - y);
  return d < 1500 ? .08 * Math.pow(1 - d / 1500, 1.5) : 0;
}
{
  const amb = AudioEngine.ambience;
  AudioEngine.ambience = function (dt) {
    amb.call(this, dt);
    const p = worldOut, gruta = typeof inCave === 'function' && inCave() || p?.map === 'masmorra', fora = !!p && SONS_FORA.has(p.map) && !gruta;
    const noite = fora && worldNight(), mato = fora && SONS_MATO.has(p.map), campo = isCampo() && !p;
    const fuel = campo && !G.lasso && campoState().lit ? (campoState().fuel ?? 0) / 100 : 0;
    // Os grilos cantam umas rodadas curtas e param um pouco (nunca um chiado sem fim).
    this.griloClock = (this.griloClock ?? 0) - dt;
    if (this.griloClock <= 0) { this.griloCanta = !this.griloCanta; this.griloClock = this.griloCanta ? 2.5 + Math.random() * 3 : 3 + Math.random() * 5; }
    this.somLaco('campo', (fora && !noite && !mato) || (campo && !G.lasso) ? .22 : 0);
    this.somLaco('mata', fora && !noite && mato ? .1 : 0, { abafa: 3500 });
    this.somLaco('noite', noite ? (mato ? .03 : .022) * (this.griloCanta ? 1 : .15) : 0, { tau: .45, abafa: 3000 });
    this.somLaco('caverna', gruta ? .32 : 0, { abafa: 2200 });
    this.somLaco('fogo', fuel > 0 ? (.18 + .3 * fuel) * this.near(525, 510, 900) : 0, { abafa: 5000 });
    this.somLaco('trem', fora && p.map === 'serra' ? sonsTrem(p) : 0, { abafa: 1800 });
    // O apito, de vez em quando, logo que a Maria Fumaça sai da estação (o apito se ouve de longe, mas baixinho).
    const tx = serraTrainX();
    if (fora && p.map === 'serra' && this.tremAntes < 500 && tx >= 500 && Math.random() < .6) {
      const d = Math.hypot(p.x - tx, p.y - SERRA.rail); this.bus = this.ambientBus; this.som('apito', .13 * Math.max(.3, 1 - d / 3000), .97 + Math.random() * .06); this.bus = null;
    }
    this.tremAntes = tx;
    // O sino da igreja da Serra bate de dia, de tempos em tempos; mais perto da igreja, mais alto (calado enquanto está
    // rachado, na missão do sino).
    if (fora && p.map === 'serra' && !noite) {
      this.sinoClock = (this.sinoClock ?? 20 + Math.random() * 30) - dt;
      if (this.sinoClock <= 0 && !missionActive('sino')) {
        const ig = SERRA.igreja, d = Math.hypot(p.x - ig.x - ig.w / 2, p.y - ig.y - ig.h / 2);
        this.sinoClock = 100 + Math.random() * 80; this.bus = this.ambientBus; this.som('sino', .22 * Math.max(.3, 1 - d / 3200)); this.bus = null;
      }
    }
    // De manhã, antes de abrir a bodega, um galo canta longe.
    this.galoClock = (this.galoClock ?? 5) - dt;
    if (fora && !mato && G.phase === 'prep' && this.galoClock <= 0) { this.galoClock = 25 + Math.random() * 40; this.bus = this.ambientBus; this.som('galo', .11, .95 + Math.random() * .1); this.bus = null; }
  };
}
