// A ilha refeita: cada pedaço com nome, força e som próprios, do trapiche até a fortaleza, e chuva na ilha inteira.
//   · O caminho: Praia do Trapiche → Mata Baixa → Pé do Paredão → Mata da cerração (7 trechos com nome) → O Alto da Ilha → Cripta.
//     Os inimigos ficam mais fortes conforme se sobe (ilhaForcaEm). O baú do pé da capela, dos ranchos e do farol recompensa quem
//     explora a parte de baixo.
//   · O ar: chove em toda parte que tem céu, com respingo no chão, trovão ao longe e relâmpago na Toca da Mãe. Na fortaleza, braseiro,
//     tambor e corneta; na cripta, corrente e goteira.
//   · Os bichos: cada um avisa com som e sai de cena com um efeito próprio.
'use strict';

// ---------- A força de cada lugar ----------
const ILHA_TRECHOS = {
  1: { nome: 'Igapó dos Afogados', tinta: 'rgba(24,70,84,.14)' },
  2: { nome: 'Caminho das Bruxas', tinta: 'rgba(60,44,96,.12)' },
  3: { nome: 'Bosque das Mariposas', tinta: 'rgba(72,48,108,.14)' },
  4: { nome: 'Clareira de Cinzas', tinta: 'rgba(60,56,62,.16)' },
  5: { nome: 'Barreiro da Bernúncia', tinta: 'rgba(58,56,26,.14)' },
  6: { nome: 'Mata Fechada', tinta: 'rgba(66,48,26,.14)' },
  7: { nome: 'Toca da Mãe', tinta: 'rgba(92,32,30,.16)', raio: true }
};
function ilhaRegiao(x, y) {
  if (x > FORT.x - 60 && x < FORT.x + FORT.w + 60 && y > FORT.y - 60 && y < FORT.y + FORT.h + 40) return 'Fortaleza do Império';
  if (y < PLANALTO.y + PLANALTO.face) return 'O Alto da Ilha';
  if (y < ilhaRioY(x) + 40) return 'Pé do Paredão';
  if (y > 3950) return 'Praia do Trapiche';
  return 'Mata Baixa';
}
const ILHA_REGIAO_AVISO = { 'Praia do Trapiche': 'Por aqui só aparecem afogados e um ou outro pirata perdido.', 'Mata Baixa': 'Os piratas fantasmas rondam as trilhas: mira de garrucha na linha vermelha.', 'Pé do Paredão': 'A picada no paredão sobe pra Mata da cerração. Aqui em baixo, eles já andam em bando.', 'O Alto da Ilha': 'Daqui se vê a fortaleza. Os marinheiros batem forte.', 'Fortaleza do Império': 'Quem manda aqui é o almirante.' };
function ilhaForcaEm(map, y, n = ilhaState().trecho || 1) {
  if (map === 'masmorra') return { hp: 1.7, dmg: 1.5 };
  if (map === 'ilhamato') return { hp: 1 + n * .13, dmg: 1 + n * .075 };
  if (y > 3950) return { hp: .8, dmg: .85 };
  if (y > 2900) return { hp: 1, dmg: 1 };
  if (y > PLANALTO.y + PLANALTO.face) return { hp: 1.2, dmg: 1.15 };
  return { hp: 2, dmg: 1.65 };
}
{
  const hurt = mataHurt; mataHurt = function (dmg, from) { if (!ilhaAqui() || from?.boss || !worldOut) return hurt(dmg, from); return hurt(Math.max(1, Math.round(dmg * ilhaForcaEm(worldOut.map, worldOut.y).dmg)), from); };
}

// ---------- Os sons ----------
const ilhaSomT = {};
function ilhaSomLivre(id, seg) { const t = frameClock; if (t - (ilhaSomT[id] ?? -99) < seg) return false; ilhaSomT[id] = t; return true; }
Object.assign(AudioEngine, {
  rangido(vol = .012) { this.caveVoice?.([110, 170, 105], .7, { type: 'sawtooth', formant: 560, q: 6, vol, vib: 3, rate: 9 }); },
  sinoLonge(vol = .012) { for (const [f, d] of [[420, 0], [420, 1.5]]) { this.note(f, 1.3, 'sine', vol, d); this.note(f * 2.4, .9, 'sine', vol * .3, d); } },
  risoBruxa(vol = .018) { [960, 1130, 1010, 1210, 1060, 880].forEach((f, i) => this.caveVoice?.([f, f * 1.2, f * .9], .13, { type: 'triangle', formant: 1500, q: 3, vol, vib: 26, rate: 22, delay: i * .13 })); },
  asas(vol = .012) { for (let i = 0; i < 4; i++) setTimeout(() => this.noise?.(.05, vol, 2200 + Math.random() * 800), i * 70); },
  tremorChao(vol = .03) { this.note(38, .9, 'sine', vol * 1.3); this.noise(.8, vol * .7, 130); },
  tamborBoi(vol = .02) { [0, .22, .44].forEach((d, i) => { this.note(78, .14, 'sine', vol * (i === 2 ? 1.3 : 1), d); this.noise(.04, vol * .35, 700); }); },
  borbulha(vol = .012) { for (let i = 0; i < 3; i++) setTimeout(() => this.bloop?.(170 + Math.random() * 180, vol), i * 110); },
  gemido(vol = .012) { this.caveVoice?.([230, 190, 150], 1.1, { formant: 480, q: 3, vol, vib: 6, rate: 4 }); },
  corrente(vol = .012) { for (let i = 0; i < 4; i++) { this.note(2100 + Math.random() * 700, .05, 'square', vol * .5, i * .12); this.note(3200, .06, 'sine', vol * .6, i * .12); } },
  cornetaLonge(vol = .01) { [392, 392, 523, 392].forEach((f, i) => this.note(f, i === 3 ? .6 : .2, 'triangle', vol, i * .24)); },
  marcha(vol = .012) { [0, .3, .6, .75, .9].forEach(d => this.note(120, .06, 'triangle', vol, d)); }
});
{
  for (const m of ['ilha', 'ilhamato', 'masmorra']) MATA_MUSIC_MAPS.add(m);
  const amb = AudioEngine.ambience;
  AudioEngine.ambience = function (dt) {
    amb.call(this, dt);
    const on = ilhaAqui() && !scene && !!worldOut, map = on ? worldOut.map : '', p = worldOut;
    let perto = 0; if (map === 'ilha') { const { d, a } = ilhaD(p.x, p.y); perto = clamp((d / ilhaK(a) - .72) / .28, 0, 1); }
    this.bus = this.ambientBus;
    const mar = this.loop('ilhaMar', map === 'ilha' ? .012 + .05 * perto : 0, { buffer: 'brown', type: 'lowpass', freq: 520 });
    if (mar && map === 'ilha') mar.filter.frequency.setTargetAtTime(420 + 240 * (.5 + .5 * Math.sin(frameClock * .42)), this.ctx.currentTime, .6);
    this.loop('ilhaChuva', map === 'ilha' || map === 'ilhamato' ? .02 : 0, { type: 'highpass', freq: 1900 });
    this.loop('ilhaCerracao', map === 'ilhamato' ? .016 : 0, { type: 'bandpass', freq: 300, q: .7 });
    this.loop('ilhaCripta', map === 'masmorra' ? .03 : 0, { buffer: 'brown', type: 'lowpass', freq: 120 });
    if (map === 'ilha') {
      const r = ilhaRegiao(p.x, p.y);
      if (perto > .5 && sombrioDue('ilhaSino', dt, 45, 90)) this.sinoLonge();
      if (perto > .5 && sombrioDue('ilhaRangido', dt, 18, 40)) this.rangido();
      if (sombrioDue('ilhaTrovaoLonge', dt, 35, 80)) this.trovao?.(.016);
      if (r === 'Fortaleza do Império' || r === 'O Alto da Ilha') { if (sombrioDue('ilhaMarcha', dt, 14, 26)) this.marcha(); if (sombrioDue('ilhaCorneta', dt, 28, 60)) this.cornetaLonge(); }
    } else if (map === 'ilhamato') {
      const n = ilhaState().trecho || 1;
      if (n <= 1 && sombrioDue('ilhaBorbulha', dt, 6, 14)) this.borbulha(.008);
      if (n >= 2 && n <= 4 && sombrioDue('ilhaRisoLonge', dt, 22, 46)) this.risoBruxa(.008);
      if (n >= 5 && sombrioDue('ilhaTambor', dt, 18, 36)) this.tamborBoi(.009);
      if (sombrioDue('ilhaGemido', dt, 26, 52)) this.gemido(.008);
    } else if (map === 'masmorra') {
      if (sombrioDue('ilhaCorrente', dt, 11, 24)) this.corrente(.01);
      if (sombrioDue('ilhaGota', dt, 3, 8)) this.bloop?.(1100 + Math.random() * 800, .012);
      if (sombrioDue('ilhaGemido2', dt, 24, 50)) this.gemido(.008);
    }
    this.bus = null;
  };
}

// ---------- Os bichos: o aviso e a saída ----------
const ILHA_MORTE = {
  pirata: [['#bcdce8', 14, 110], ['#e8f4ff', 6, 60]], afogado: [['#9ad0d8', 16, 120]], mariposa: [['#b49ad8', 6, 50]], minhocao: [['#7a5a38', 20, 170], ['#a88a60', 10, 110]],
  bruxa: [['#9a6ad8', 16, 130], ['#e0c8ff', 6, 70]], bernuncia: [['#d83a30', 8, 130], ['#e8c030', 8, 130], ['#3a6ad8', 8, 130]], marujo: [['#a8b4c8', 10, 90]]
};
function ilhaMorteFx(b) {
  for (const [cor, n, r] of ILHA_MORTE[b.kind] || []) fxPuffs(b.x, b.y - 50, n, r, cor);
  if (b.kind === 'pirata') { AudioEngine.gemido?.(.022); fxStars(b.x, b.y - 90, 2); }
  else if (b.kind === 'afogado') AudioEngine.splash?.(.035);
  else if (b.kind === 'bruxa') AudioEngine.risoBruxa?.(.02);
  else if (b.kind === 'minhocao') { AudioEngine.tremorChao?.(.04); golpeTreme = Math.max(golpeTreme, .18); }
  else if (b.kind === 'bernuncia') AudioEngine.tamborBoi?.(.03);
  else if (b.kind === 'mariposa') AudioEngine.asas?.(.012);
}
function ilhaMudouEstado(b, de) {
  const s = b.state;
  if (b.kind === 'pirata' && s === 'aim') { fxPuffs(b.x, b.y - 60, 3, 40, '#c8e0e8'); }
  if (b.kind === 'pirata' && de === 'aim') { fxPuffs(b.x + (b.dx < 0 ? -40 : 40), b.y - 80, 8, 70, '#d8d4cc'); glowFlash(b.x + (b.dx < 0 ? -46 : 46), b.y - 82); }
  if (b.kind === 'afogado' && s === 'rise') { fxPuffs(b.x, b.y - 20, 12, 90, '#a8dce4'); AudioEngine.splash?.(.03); }
  if (b.kind === 'afogado' && s === 'grab') AudioEngine.borbulha?.(.02);
  if (b.kind === 'minhocao' && s === 'tremor') { AudioEngine.tremorChao?.(.028); golpeTreme = Math.max(golpeTreme, .12); }
  if (b.kind === 'minhocao' && s === 'erupcao') { fxPuffs(b.x, b.y - 20, 24, 170, '#7a5a38'); golpeTreme = Math.max(golpeTreme, .26); }
  if ((b.kind === 'bruxa' || b.kind === 'bruxaMor') && s === 'cast' && ilhaSomLivre('bruxaCast', 4)) AudioEngine.risoBruxa?.(.016);
  if ((b.kind === 'bruxa' || b.kind === 'bruxaMor') && (s === 'chama' || s === 'roda')) fxPuffs(b.x, b.y - 90, 10, 90, '#9a6ad8');
  if ((b.kind === 'bernuncia' || b.kind === 'bernunciaMae') && s === 'windup' && ilhaSomLivre('bernunciaTambor', 1.4)) AudioEngine.tamborBoi?.(.024);
  if ((b.kind === 'bernuncia' || b.kind === 'bernunciaMae') && s === 'lunge') fxPuffs(b.x, b.y - 30, 6, 80, ['#d83a30', '#e8c030', '#3a6ad8'][Math.floor(Math.random() * 3)]);
}
const ilhaClarões = [];
function glowFlash(x, y) { ilhaClarões.push({ x, y, t: .14, map: worldOut?.map }); }
function ilhaBichosFx(N, dt, p) {
  for (const b of N.beasts) {
    if (b.hp <= 0) continue;
    if (b.fxEst !== b.state) { const de = b.fxEst; b.fxEst = b.state; if (de !== undefined) ilhaMudouEstado(b, de); }
    const d = Math.hypot(b.x - p.x, b.y - p.y); if (d > 760) continue;
    if ((b.fxT = (b.fxT ?? 2 + Math.random() * 6) - dt) > 0) continue; b.fxT = 5 + Math.random() * 7;
    if (b.kind === 'pirata' && ilhaSomLivre('pirata', 3.5)) AudioEngine.gemido?.(.012);
    else if (b.kind === 'afogado' && ilhaSomLivre('afogado', 4)) AudioEngine.borbulha?.(.012);
    else if (b.kind === 'mariposa' && ilhaSomLivre('mariposa', 2.5)) AudioEngine.asas?.(.008);
    else if (b.kind === 'bruxa' && ilhaSomLivre('bruxa', 6)) AudioEngine.risoBruxa?.(.011);
    else if (b.kind === 'bernuncia' && ilhaSomLivre('bernuncia', 5)) AudioEngine.caveGrowl?.(.25, .03);
    else if (b.kind === 'marujo' && ilhaSomLivre('marujo', 4)) AudioEngine.caveVoice?.([170, 220, 160], .22, { formant: 750, q: 1.6, vol: .018, vib: 5, rate: 6 });
  }
  for (const c of ilhaClarões) c.t -= dt; for (let i = ilhaClarões.length - 1; i >= 0; i--) if (ilhaClarões[i].t <= 0) ilhaClarões.splice(i, 1);
}
{
  const kill = mataKill; mataKill = function (b) { const r = kill(b); if (ilhaAqui()) ilhaMorteFx(b); return r; };
  const combat = mataCombatTick; mataCombatTick = function (dt) { combat(dt); if (ilhaAqui() && mataNight && !scene && !modal && !paused && worldOut) ilhaBichosFx(mataNight, dt, worldOut); };
}

// ---------- O que passa na tela ----------
function ilhaChuva(view, leve) {
  const { x, y, w, h } = view, t = frameClock, wrap = (v, m) => ((v % m) + m) % m, gotas = leve ? 90 : 240, cair = (i, v) => ({ px: x + wrap((i * .61803 % 1) * w - t * 190, w), py: y + wrap((i * .75488 % 1) * h + t * v, h) });
  ctx.save(); ctx.lineCap = 'round';
  // Duas camadas: as gotas de perto, maiores e mais claras, por cima das de longe.
  for (const [de, ate, cor, larg, comp, v] of [[0, gotas * .6, 'rgba(190,212,236,.42)', 1.8, 26, 820], [gotas * .6, gotas, 'rgba(226,238,250,.62)', 2.5, 40, 1120]]) { ctx.strokeStyle = cor; ctx.lineWidth = larg; ctx.beginPath(); for (let i = Math.floor(de); i < ate; i++) { const { px, py } = cair(i, v + (i % 5) * 50); ctx.moveTo(px, py); ctx.lineTo(px - comp * .3, py + comp); } ctx.stroke(); }
  // O respingo no chão: um anel ligeiro que abre e some.
  ctx.lineWidth = 1.8; for (let i = 0; i < (leve ? 18 : 54); i++) { const q = t * 2.6 + i * .37, f = wrap(q, 1), n = Math.floor(q), px = x + ((i * .61803 + n * .3819) % 1) * w, py = y + ((i * .75488 + n * .5698) % 1) * h, r = 4 + f * 15; ctx.strokeStyle = `rgba(226,238,248,${.62 * (1 - f)})`; ctx.beginPath(); ctx.ellipse(px, py, r, r * .42, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}
const ILHA_CEU = { flash: 0, antes: 0 };
const FORT_BRASEIROS = () => [[FORT.x + 330, FORT.y + FORT.h - 250], [FORT.x + FORT.w - 330, FORT.y + FORT.h - 250], [FORT_PARTS.gateX - 130, FORT.y + FORT.h - 150], [FORT_PARTS.gateX + FORT.gate + 130, FORT.y + FORT.h - 150]];
function drawBraseiro(x, y) {
  ellipse(x, y + 4, 22, 7, 'rgba(10,8,6,.4)'); rect(x - 3, y - 44, 6, 46, '#2a2622', 2); rect(x - 17, y - 54, 34, 12, '#3a342c', 3, '#1a1612');
  for (let k = 0; k < 5; k++) { const fx = x + Math.sin(frameClock * 9 + k * 1.7) * 7, fy = y - 60 - k * 7 - Math.abs(Math.sin(frameClock * 7 + k)) * 4; ellipse(fx, fy, 11 - k * 1.7, 13 - k * 2, k % 2 ? '#ffb030' : '#ff6a20'); }
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 62, 120, .3 + .05 * Math.sin(frameClock * 9 + x), '255,150,60'); ctx.restore();
}
function drawIlhaClimaBaixo(view, p) {
  const leve = typeof lightGraphics !== 'undefined' && lightGraphics, t = frameClock, { x, y, w, h } = view;
  // Dia fechado de chuva: um pouco mais frio e escuro por igual.
  rect(x, y, w, h, 'rgba(26,40,58,.2)');
  // A espuma andando na beira da praia.
  ctx.save(); const costa = ilhaCoastPath(-.006 + .004 * Math.sin(t * .6)); ctx.strokeStyle = `rgba(240,250,250,${.28 + .12 * Math.sin(t * .9)})`; ctx.lineWidth = 7; ctx.stroke(costa); ctx.restore();
  // Quanto mais pro alto, mais fechado em volta da tela.
  const k = clamp((3900 - p.y) / 3100, 0, 1); if (k > 0) { const cx = x + w / 2, cy = y + h / 2, r = Math.hypot(w, h) / 2, g = ctx.createRadialGradient(cx, cy, r * .5, cx, cy, r); g.addColorStop(0, 'rgba(8,14,22,0)'); g.addColorStop(1, `rgba(8,14,22,${.06 + .3 * k})`); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
  // O farol, girando.
  const f = ILHA.farol; if (Math.hypot(f.x - p.x, f.y - p.y) < 1700) { const a = t * .55, lx = f.x, ly = f.y - 445; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.translate(lx, ly); ctx.rotate(a); const g = ctx.createLinearGradient(0, 0, 900, 0); g.addColorStop(0, 'rgba(255,240,190,.32)'); g.addColorStop(1, 'rgba(255,240,190,0)'); ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(900, -120); ctx.lineTo(900, 120); ctx.closePath(); ctx.fill(); ctx.restore(); }
  ilhaChuva(view, leve);
}
function drawIlhaClimaMato(view, L, p) {
  const leve = typeof lightGraphics !== 'undefined' && lightGraphics, C = ILHA_TRECHOS[L.n], { x, y, w, h } = view;
  rect(x, y, w, h, C.tinta); ilhaChuva(view, leve);
  if (C.raio && ILHA_CEU.flash > 0) rect(x, y, w, h, `rgba(220,230,255,${ILHA_CEU.flash * .3})`);
}
function drawIlhaClimaCripta(view, p) {
  const { x, y, w, h } = view, t = frameClock; ctx.save(); ctx.fillStyle = 'rgba(214,200,170,.5)'; for (let i = 0; i < 26; i++) { const px = x + ((i * 233 + Math.sin(t * .3 + i) * 40) % w + w) % w, py = y + ((i * 149 + t * (5 + i % 4 * 2)) % h + h) % h; ctx.fillRect(px, py, 2, 2); } ctx.restore();
  rect(x, y, w, h, `rgba(14,8,4,${.06 + .03 * Math.sin(t * 7)})`);
}
// Os baús da parte de baixo da ilha: quem explora acha, e uma semana depois tem coisa nova.
const ILHA_ACHADOS = [{ id: 'capela', de: ILHA.capela, dx: 200, dy: 220, nome: 'Baú da capela' }, { id: 'ranchos', de: ILHA.ranchos, dx: -40, dy: 190, nome: 'Baú dos ranchos' }, { id: 'farol', de: ILHA.farol, dx: -210, dy: 200, nome: 'Baú do farol' }];
function ilhaAchadoLugar(a) { return a.lugar ??= ilhaSpotNear('ilha', a.de.x + a.dx, a.de.y + a.dy) || { x: a.de.x + a.dx, y: a.de.y + a.dy }; }
function ilhaAchadoAberto(a) { const d = ilhaState().achados?.[a.id]; return d != null && G.day - d < 7; }
function ilhaAchadoAbre(a) { if (ilhaAchadoAberto(a)) return; const st = ilhaState(), q = ilhaAchadoLugar(a); (st.achados ??= {})[a.id] = G.day; fxStars(q.x, q.y - 50, 6); mataXP(4); bauMostra(bauMonta('ilha', a.id === 'farol' ? 5 : 2), a.nome, 'Meio escondido, um baú que os piratas não levaram.', 'Ilha da Fortaleza'); }
{
  const M = WORLD_MAPS.ilha, draw = M.draw, spots = M.spots;
  M.spots = function () { const list = spots.call(this); for (const a of ILHA_ACHADOS) if (!ilhaAchadoAberto(a)) { const q = ilhaAchadoLugar(a); list.push({ id: 'ilha:achado:' + a.id, x: q.x, y: q.y + 10, radius: 95, label: 'Abrir o ' + a.nome.toLowerCase(), act: () => ilhaAchadoAbre(a) }); } return list; };
  M.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers); const p = worldOut;
    for (const a of ILHA_ACHADOS) { const q = ilhaAchadoLugar(a); if (seen(q.x, q.y, 120)) layers.push({ y: q.y, draw: () => drawCaveChest({ x: q.x, y: q.y, open: ilhaAchadoAberto(a) }) }); }
    if (seen(FORT.x + FORT.w / 2, FORT.y + FORT.h / 2, FORT.w)) for (const [bx, by] of FORT_BRASEIROS()) if (seen(bx, by, 160)) layers.push({ y: by, draw: () => drawBraseiro(bx, by) });
    layers.push({ y: 8.1e9, draw: () => { for (const c of ilhaClarões) if (c.map === 'ilha') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(c.x, c.y, 70, c.t * 4, '255,220,140'); ctx.restore(); } drawIlhaClimaBaixo(view, p); } });
  };
  const K = WORLD_MAPS.ilhamato, drawK = K.draw;
  K.draw = function (view, seen, layers) {
    drawK.call(this, view, seen, layers); const L = ilhaMatoLayout(), p = worldOut, agora = performance.now(), dt = Math.min(.1, (agora - ILHA_CEU.antes) / 1000); ILHA_CEU.antes = agora;
    if (ILHA_TRECHOS[L.n].raio && !scene) { if (ILHA_CEU.flash > 0) ILHA_CEU.flash = Math.max(0, ILHA_CEU.flash - dt * 2.4); if (sombrioDue('ilhaRaio', dt, 12, 26)) { ILHA_CEU.flash = .55; setTimeout(() => { AudioEngine.bus = AudioEngine.ambientBus; AudioEngine.trovao?.(.035); AudioEngine.bus = null; }, 500 + Math.random() * 1200); } }
    layers.push({ y: 8.1e9, draw: () => { for (const c of ilhaClarões) if (c.map === 'ilhamato') { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(c.x, c.y, 70, c.t * 4, '255,220,140'); ctx.restore(); } drawIlhaClimaMato(view, L, p); } });
  };
  const C = WORLD_MAPS.masmorra, drawC = C.draw;
  C.draw = function (view, seen, layers) { drawC.call(this, view, seen, layers); layers.push({ y: 8.1e9, draw: () => drawIlhaClimaCripta(view, worldOut) }); };
  // Ao entrar em cada parte da ilha, o nome e o que esperar.
  const tick = outsideTick; outsideTick = function (dt) {
    tick(dt); if (worldOut?.map !== 'ilha' || scene || modal) return; const r = ilhaRegiao(worldOut.x, worldOut.y);
    if (r !== ilhaState().regiao) { const antes = ilhaState().regiao; ilhaState().regiao = r; if (antes) showBanner(r, ILHA_REGIAO_AVISO[r] || '', 'info', { world: true }); }
  };
}
