// O ar do pampa: o que se ouve e o que passa na tela, e muda conforme o caminho desce pro sul e o dia acaba.
//   · O campo: sombra de nuvem, sementes no ar, bando de pássaro, quero-quero e, de longe, gado e cavalo.
//   · O banhado: neblina rente ao chão, vaga-lume, anel na água e sapo.
//   · Os campos rasos: poeira correndo pela estrada, e um clarim longe.
//   · O cerro: céu fechado, relâmpago, trovão, coruja. Quanto mais fundo, mais escuro em volta da tela.
// Os sons de cada inimigo e de cada poder ficam aqui também; quem toca é quem luta.
'use strict';

Object.assign(AudioEngine, {
  // "A-van-te, far-ra-pos!": a voz do Sadi, em seis sílabas, e o eco de quem responde.
  gritoFarrapo(vol = .1) {
    [[210, 240, .13], [300, 330, .14], [270, 240, .16], [250, 280, .13], [340, 370, .14], [300, 220, .34]].reduce((t, [a, b, d]) => { this.caveVoice?.([a, b], d, { type: 'sawtooth', formant: 950, q: 2.6, vol, vib: 7, rate: 6, delay: t }); return t + d + .025; }, 0);
    this.noise(.3, vol * .5, 1400);
    setTimeout(() => { for (let i = 0; i < 3; i++) this.caveVoice?.([190 + i * 30, 240 + i * 26, 170], .5, { type: 'sawtooth', formant: 800, q: 1.6, vol: vol * .28, vib: 9, rate: 5, delay: i * .07 }); this.clarim(.05); }, 1000);
  },
  clarim(vol = .04) { [392, 523, 659, 784].forEach((f, i) => { this.note(f, i === 3 ? .5 : .16, 'triangle', vol, i * .14); this.note(f * 2, i === 3 ? .45 : .14, 'square', vol * .16, i * .14); }); },
  assobio(vol = .07) { this.note(1500, .14, 'sine', vol); this.note(2300, .1, 'sine', vol, .13); this.note(2000, .22, 'sine', vol * .9, .23); this.note(2700, .24, 'sine', vol, .42); },
  boiBerro(vol = .03) { this.moo?.(vol, .62); this.note(62, .4, 'sawtooth', vol * .25); },
  bufo(vol = .05) { this.noise(.32, vol, 700); this.note(90, .16, 'triangle', vol * .7); },
  tropel(vol = .06) { for (let i = 0; i < 4; i++) { const v = vol * (i % 2 ? .7 : 1); this.note(82 + Math.random() * 26, .05, 'triangle', v, i * .055); } this.noise(.14, vol * .4, 420); },
  boleadeira(vol = .05) { this.noise(.13, vol, 1700 + Math.random() * 500); this.note(330, .06, 'triangle', vol * .3); },
  clinkMetal(vol = .05) { this.note(2300, .06, 'square', vol * .55); this.note(3400, .08, 'sine', vol, .012); this.pop?.(3900, vol * .8, .02); },
  vareta(vol = .05) { this.noise(.07, vol * .7, 2400); this.note(1700, .04, 'triangle', vol * .5, .04); },
  rosnado(vol = .04) { this.caveVoice?.([120, 150, 110], .28, { formant: 520, q: 2, vol, vib: 26, rate: 16 }); },
  splash(vol = .07) { this.noise(.32, vol, 1500); this.bloop?.(210, vol * .7); setTimeout(() => this.bloop?.(320, vol * .4), 90); },
  firme(vol = .1) { this.note(1900, .1, 'square', vol * .45); this.note(2900, .16, 'sine', vol * .7, .01); this.note(70, .24, 'triangle', vol * 1.3); this.noise(.2, vol, 900); },
  rajada(k = 1) { this.noise(1.3 * k, .05 * k, 760); this.noise(.9 * k, .024 * k, 1500); },
  sapo(vol = .018) { this.caveVoice?.([210, 310, 170], .17, { type: 'sawtooth', formant: 720, q: 3, vol, vib: 24, rate: 28 }); this.caveVoice?.([190, 290, 160], .15, { type: 'sawtooth', formant: 680, q: 3, vol: vol * .8, vib: 24, rate: 28, delay: .28 }); },
  trovao(vol = .08) { this.noise(2.2, vol, 170); this.noise(.5, vol * .7, 380); this.note(44, 1.2, 'sine', vol * 1.1); },
  gadoLonge(vol = .02) { this.moo?.(vol, .78 + Math.random() * .2); },
  // A despedida das almas: notas abertas subindo devagar.
  despedida(vol = .045) { [262, 392, 523, 659, 784].forEach((f, i) => { this.note(f, 1.1, 'sine', vol * (1 - i * .1), i * .42); this.note(f / 2, 1.3, 'triangle', vol * .4, i * .42); }); },
  // O povo gritando viva.
  vivas(vol = .06) { for (let i = 0; i < 6; i++) this.caveVoice?.([220 + Math.random() * 110, 340 + Math.random() * 120, 240 + Math.random() * 60], .7 + Math.random() * .4, { type: 'sawtooth', formant: 900 + Math.random() * 400, q: 1.2, vol: vol * .6, vib: 10, rate: 7, delay: i * .08 }); this.noise(1.3, vol * .7, 1700); [0, .5, 1].forEach(d => setTimeout(() => this.crowd?.(), d * 1000)); },
  // A subida da bandeira: um tema solene e curto, feito pro jogo. Sobe aos poucos e termina aberto.
  hinoFarrapo(vol = .05) {
    const tom = { G3: 196, B3: 247, D4: 294, E4: 330, Fs4: 370, G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, G5: 784 };
    const linha = [['G4', 1], ['B4', .5], ['D5', .5], ['G5', 1.5], ['E5', .5], ['D5', 1], ['C5', .5], ['B4', .5], ['A4', 1], ['D5', 1], ['B4', 1], ['C5', .5], ['D5', .5], ['E5', 1.5], ['D5', .5], ['G5', 2.4]];
    let t = 0; for (const [n, d] of linha) { const f = tom[n], dur = d * .5; this.note(f, dur * 1.05, 'triangle', vol, t); this.note(f * 2, dur, 'sine', vol * .22, t); this.note(f / 2, dur * 1.2, 'triangle', vol * .5, t); t += dur; }
    [[0, 'G3'], [2.25, 'E4'], [4.25, 'D4'], [5.75, 'G3']].forEach(([at, n]) => { this.note(tom[n], 2.1, 'sine', vol * .4, at); this.note(tom[n] * 1.5, 2.1, 'sine', vol * .22, at); });
  }
});
{
  MATA_MUSIC_MAPS.add('pampa');
  const amb = AudioEngine.ambience;
  AudioEngine.ambience = function (dt) {
    amb.call(this, dt);
    const on = typeof pampaAqui === 'function' && pampaAqui() && !scene, L = on ? pampaLayout() : null, A = on ? PAMPA_AREAS[L.n] : null;
    this.bus = this.ambientBus;
    // O vento não para nunca: sobe e desce devagar.
    const l = this.loop('minuano', on ? (A.chao === 'cerro' ? .03 : .045) : 0, { type: 'bandpass', freq: 420, q: .5 });
    if (l && on) l.filter.frequency.setTargetAtTime(340 + 150 * Math.sin(frameClock * .31) + 110 * Math.sin(frameClock * .13), this.ctx.currentTime, .5);
    if (on) {
      if (A.chao === 'banhado') { if (sombrioDue('pampaSapo', dt, 2, 6)) this.sapo(); if (sombrioDue('pampaAgua', dt, 3, 8)) this.bloop?.(170 + Math.random() * 120, .012); }
      else if (A.chao === 'cerro') { if (sombrioDue('pampaCoruja', dt, 18, 34)) this.coruja?.(.022); if (sombrioDue('pampaUivo', dt, 30, 60)) this.uivo?.(.016); }
      else { if (sombrioDue('pampaQuero', dt, 11, 22)) this.queroquero?.(.02, 2 + Math.floor(Math.random() * 3)); if (A.coxilha && sombrioDue('pampaGado', dt, 16, 30)) this.gadoLonge(); }
      if (A.chao === 'raso' && sombrioDue('pampaClarim', dt, 26, 48)) this.clarim(.011);
      if (sombrioDue('pampaRajada', dt, 12, 26)) this.rajada(.42);
    }
    this.bus = null;
  };
}

// ---------- O que passa na tela ----------
const PAMPA_CEU = { flash: 0, antes: 0 };
function pampaRaio(dt) {
  if (PAMPA_CEU.flash > 0) PAMPA_CEU.flash = Math.max(0, PAMPA_CEU.flash - dt * 2.4);
  if (typeof sombrioDue === 'function' && sombrioDue('pampaRaio', dt, 14, 30)) { PAMPA_CEU.flash = .55; setTimeout(() => { AudioEngine.bus = AudioEngine.ambientBus; AudioEngine.trovao?.(.05); AudioEngine.bus = null; }, 500 + Math.random() * 1400); }
}
function drawPampaClima(L, A, view) {
  const { x: vx, y: vy, w: vw, h: vh } = view, t = frameClock, leve = typeof lightGraphics !== 'undefined' && lightGraphics;
  // Sombra de nuvem passando: mancha grande e macia, só no campo aberto.
  if (A.chao !== 'banhado') for (let i = 0; i < 3; i++) { const sw = vw + 1400, cx = vx + ((i * 977 + t * (18 + i * 5)) % sw) - 700, cy = vy + ((i * 613) % vh), r = 460 + i * 90; ctx.save(); ctx.translate(cx, cy); ctx.scale(1, .55); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, `rgba(20,24,16,${A.chao === 'cerro' ? .16 : .1})`); g.addColorStop(1, 'rgba(20,24,16,0)'); ctx.fillStyle = g; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore(); }
  if (A.chao === 'banhado') {
    // Neblina rente ao chão e vaga-lume.
    if (!leve) for (let i = 0; i < 6; i++) { const sw = vw + 900, cx = vx + ((i * 541 + t * (14 + i * 4)) % sw) - 450, cy = vy + vh * (.3 + (i * .13) % .7), r = 320 + i * 40; ctx.save(); ctx.translate(cx, cy); ctx.scale(1, .22); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, 'rgba(214,226,214,.2)'); g.addColorStop(1, 'rgba(214,226,214,0)'); ctx.fillStyle = g; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore(); }
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (let i = 0; i < (leve ? 6 : 16); i++) { const px = vx + ((i * 239.7 + Math.sin(t * .4 + i) * 90) % vw + vw) % vw, py = vy + ((i * 157.3 + Math.cos(t * .5 + i * 2) * 60) % vh + vh) % vh, k = Math.max(0, Math.sin(t * 1.6 + i * 1.7)); if (k > .15) glow(px, py, 9, .55 * k, '210,240,120'); } ctx.restore();
    // O anel que abre na água.
    ctx.save(); ctx.lineWidth = 1.6; for (const q of L.pools) { if (q.x + q.rx < vx || q.x - q.rx > vx + vw || q.y + q.ry < vy || q.y - q.ry > vy + vh) continue; for (let i = 0; i < 2; i++) { const f = (t * .35 + i * .5 + q.x * .01) % 1; ctx.strokeStyle = `rgba(220,240,240,${.26 * (1 - f)})`; ctx.beginPath(); ctx.ellipse(q.x + Math.sin(q.y + i) * q.rx * .4, q.y + Math.cos(q.x + i) * q.ry * .4, 6 + f * 44, (6 + f * 44) * .45, 0, 0, Math.PI * 2); ctx.stroke(); } } ctx.restore();
  } else if (A.chao === 'raso') {
    // Poeira correndo.
    if (!leve) for (let i = 0; i < 5; i++) { const sw = vw + 800, cx = vx + ((i * 683 + t * (150 + i * 26)) % sw) - 400, cy = vy + (i * 197) % vh, r = 120 + i * 18; ctx.save(); ctx.translate(cx, cy); ctx.scale(1, .3); const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r); g.addColorStop(0, 'rgba(216,190,130,.2)'); g.addColorStop(1, 'rgba(216,190,130,0)'); ctx.fillStyle = g; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore(); }
  }
  if (A.chao === 'campo' || A.chao === 'raso') {
    // Sementes e pelinhos de capim no ar.
    if (!leve) { ctx.save(); ctx.fillStyle = 'rgba(255,246,206,.55)'; for (let i = 0; i < 26; i++) { const px = vx + ((i * 311 + t * (46 + (i % 5) * 14)) % vw), py = vy + ((i * 173 + Math.sin(t * .8 + i) * 26) % vh + vh) % vh; ctx.fillRect(px, py, 2, 2); } ctx.restore(); }
    // Um bando cruzando o céu, de vez em quando.
    const ciclo = (t + L.n * 7) % 26; if (ciclo < 7) { const f = ciclo / 7, bx = vx - 120 + f * (vw + 240), by = vy + vh * .16 + Math.sin(f * 4) * 30; ctx.save(); ctx.strokeStyle = 'rgba(24,24,20,.6)'; ctx.lineWidth = 2; ctx.lineCap = 'round'; for (let i = 0; i < 6; i++) { const ox = bx - (i % 2 ? 1 : -1) * ((i + 1) >> 1) * 26 - ((i + 1) >> 1) * 22, oy = by + ((i + 1) >> 1) * 15, b = Math.sin(t * 9 + i) * 5; ctx.beginPath(); ctx.moveTo(ox - 9, oy - b); ctx.quadraticCurveTo(ox, oy - 3, ox + 9, oy - b); ctx.stroke(); } ctx.restore(); }
  }
  // Quanto mais fundo, mais escuro nas beiradas. E, no cerro, o relâmpago.
  const k = clamp((L.n - 2) / (PAMPA.last - 2), 0, 1); if (k > 0) { const cx = vx + vw / 2, cy = vy + vh / 2, r = Math.hypot(vw, vh) / 2, g = ctx.createRadialGradient(cx, cy, r * .46, cx, cy, r); g.addColorStop(0, 'rgba(8,10,20,0)'); g.addColorStop(1, `rgba(8,10,20,${.08 + .38 * k})`); ctx.fillStyle = g; ctx.fillRect(vx, vy, vw, vh); }
  if (A.chao === 'cerro' && PAMPA_CEU.flash > 0) rect(vx, vy, vw, vh, `rgba(214,226,255,${PAMPA_CEU.flash * .34})`);
}
{
  const M = WORLD_MAPS.pampa, draw = M.draw;
  M.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers); const L = pampaLayout(), A = PAMPA_AREAS[L.n], agora = performance.now(), dt = Math.min(.1, (agora - PAMPA_CEU.antes) / 1000); PAMPA_CEU.antes = agora;
    if (A.chao === 'cerro' && !scene) pampaRaio(dt);
    layers.push({ y: 8.1e9, draw: () => drawPampaClima(L, A, view) });
  };
}
