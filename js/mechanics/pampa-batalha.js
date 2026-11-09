// A batalha de Porongos, refeita pra ser o fim do jogo:
//   · O tempo acompanha a luta. Na carga, o céu fecha e começa a chover; no duelo, é tempestade cheia, com raio caindo no campo,
//     trovão e o minuano soprando forte; na madrugada, a chuva vai parando conforme o coronel apanha, e no golpe final um raio
//     estoura em cima dele e o sol abre.
//   · Os farrapos lutam em formação: os três lanceiros, o Garibaldi e a Anita fazem uma roda em volta do duelo, e cada cavaleiro
//     imperial vem em carga contra um deles, não contra o Sadi. Quem aguenta a carga derruba o cavaleiro e termina a peleia
//     a pé, voltando pro seu lugar. O Neto e o Canabarro comandam de trás. O duelo com o Moringue fica no meio, só dos dois.
//   · Tambor de guerra, clarim e trovão por baixo de tudo.
//   · No fim, o Fogo da República, no Campo dos Menezes: dali se volta pra bodega ou pro começo do pampa.
'use strict';

// ---------- O tempo ----------
const BATALHA_CENA = { flash: 0 };
function batalhaN() { const N = mataNight; return N?.pampa === PAMPA_N.moringue && N.chefe && pampaAqui() ? N : null; }
function batalhaTempo(N) { return N.tempo ??= { chuva: 0, escuro: 0, raioT: 2.5, flash: 0, raios: [], marcas: [], tambor: .5, batida: 0, vento: 0, grito: 4 }; }
function batalhaRaio(N, alvo) {
  const T = batalhaTempo(N), L = pampaLayout(), a = L.arena, p = worldOut;
  let q = alvo;
  if (!q) {
    const apagadas = L.lancas.filter(l => !l.acesa && Math.hypot(l.x - p.x, l.y - p.y) > 220);
    if (apagadas.length && Math.random() < .6) { q = apagadas[Math.floor(Math.random() * apagadas.length)]; q.acesa = true; }
    else { for (let k = 0; k < 20; k++) { const ang = Math.random() * Math.PI * 2, r = .3 + Math.random() * .6, x = a.x + Math.cos(ang) * a.rx * r, y = a.y + Math.sin(ang) * a.ry * r; if (Math.hypot(x - p.x, y - p.y) > 260) { q = { x, y }; break; } } q ??= { x: a.x, y: a.y - a.ry * .6 }; }
  }
  const pts = [[q.x + (Math.random() - .5) * 260, q.y - 1500]]; for (let k = 1; k <= 10; k++) { const f = k / 10; pts.push([pts[0][0] + (q.x - pts[0][0]) * f + (Math.random() - .5) * (k < 10 ? 90 : 0), pts[0][1] + (q.y - 70 - pts[0][1]) * f]); }
  const galho = []; const i = 4 + Math.floor(Math.random() * 3); let [gx, gy] = pts[i]; for (let k = 0; k < 4; k++) { gx += (Math.random() < .5 ? -1 : 1) * (30 + Math.random() * 40); gy += 70 + Math.random() * 40; galho.push([gx, gy]); }
  T.raios.push({ pts, galho: [pts[i], ...galho], t: .38 }); T.marcas.push({ x: q.x, y: q.y, t: 14 }); T.flash = Math.max(T.flash, .75);
  golpeTreme = Math.max(golpeTreme, .28); fxPuffs(q.x, q.y - 30, 14, 120, '#a8a090'); fxStars(q.x, q.y - 60, 4);
  setTimeout(() => AudioEngine.trovao?.(.06 + Math.random() * .03), 120 + Math.random() * 260);
}
function batalhaTick(N, dt, p) {
  const T = batalhaTempo(N), b = moringueVivo(), fase = b?.fase || 4, sol = b && fase === 3 ? clamp(1 - b.hp / (b.max * MORINGUE.fase3), 0, 1) : 0;
  const alvoChuva = fase === 1 ? .45 : fase === 2 ? 1 : fase === 3 ? .95 - .85 * sol : 0, alvoEscuro = fase === 1 ? .32 : fase === 2 ? .52 : fase === 3 ? .42 - .3 * sol : 0;
  T.chuva += (alvoChuva - T.chuva) * Math.min(1, dt * .6); T.escuro += (alvoEscuro - T.escuro) * Math.min(1, dt * .5);
  T.flash = Math.max(0, T.flash - dt * 2.6); for (const r of T.raios) r.t -= dt; T.raios = T.raios.filter(r => r.t > 0); for (const m of T.marcas) m.t -= dt; T.marcas = T.marcas.filter(m => m.t > 0);
  if (fase <= 3 && (T.raioT -= dt) <= 0) { T.raioT = fase === 2 ? 3.5 + Math.random() * 3.5 : fase === 1 ? 7 + Math.random() * 5 : 6 + Math.random() * 6 + sol * 6; batalhaRaio(N); }
  T.vento = N.vento?.ativo > 0 ? N.vento.dir : 0;
  // O tambor de guerra: marca o passo da batalha e acelera na madrugada.
  if (fase <= 3 && (T.tambor -= dt) <= 0) { T.tambor = fase === 3 ? .78 : fase === 2 ? .95 : 1.2; T.batida = (T.batida + 1) % 4; AudioEngine.bus = AudioEngine.ambientBus; AudioEngine.tamborGuerra?.(T.batida === 0 ? .024 : .013); AudioEngine.bus = null; }
}
function batalhaChuva(view, k, dir) {
  if (k <= .02) return; const { x, y, w, h } = view, t = frameClock, wrap = (v, m) => ((v % m) + m) % m, leve = typeof lightGraphics !== 'undefined' && lightGraphics, n = Math.round((leve ? 110 : 280) * k), inc = 8 + Math.abs(dir) * 26, sx = dir ? dir : -1;
  ctx.save(); ctx.lineCap = 'round';
  for (const [de, ate, cor, larg, comp, v] of [[0, n * .6, `rgba(186,206,232,${.36 * Math.min(1, k + .3)})`, 1.7, 26, 860], [n * .6, n, `rgba(224,236,250,${.58 * Math.min(1, k + .3)})`, 2.4, 40, 1180]]) {
    ctx.strokeStyle = cor; ctx.lineWidth = larg; ctx.beginPath();
    for (let i = Math.floor(de); i < ate; i++) { const px = x + wrap((i * .61803 % 1) * w + sx * t * (200 + Math.abs(dir) * 500), w), py = y + wrap((i * .75488 % 1) * h + t * (v + (i % 5) * 50), h); ctx.moveTo(px, py); ctx.lineTo(px + sx * inc * comp / 30, py + comp); }
    ctx.stroke();
  }
  ctx.lineWidth = 1.7; for (let i = 0; i < Math.round((leve ? 16 : 46) * k); i++) { const q = t * 2.6 + i * .37, f = wrap(q, 1), m = Math.floor(q), px = x + ((i * .61803 + m * .3819) % 1) * w, py = y + ((i * .75488 + m * .5698) % 1) * h, r = 4 + f * 14; ctx.strokeStyle = `rgba(226,238,248,${.55 * (1 - f)})`; ctx.beginPath(); ctx.ellipse(px, py, r, r * .42, 0, 0, Math.PI * 2); ctx.stroke(); }
  ctx.restore();
}
function batalhaRaioDesenho(r) {
  const k = r.t > .3 ? 1 : .35 + .65 * Math.abs(Math.sin(r.t * 60));
  for (const [larg, cor] of [[16, `rgba(140,170,255,${.22 * k})`], [7, `rgba(200,220,255,${.55 * k})`], [2.6, `rgba(255,255,255,${.95 * k})`]]) {
    ctx.save(); ctx.strokeStyle = cor; ctx.lineWidth = larg; ctx.lineJoin = 'round'; ctx.lineCap = 'round';
    ctx.beginPath(); r.pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke();
    ctx.lineWidth = larg * .5; ctx.beginPath(); r.galho.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.restore();
  }
  const [ex, ey] = r.pts[r.pts.length - 1]; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ex, ey, 160, .5 * k, '200,220,255'); ctx.restore();
}
function drawBatalhaCeu(N, view) {
  const T = batalhaTempo(N), { x, y, w, h } = view;
  if (T.escuro > .01) { const g = ctx.createLinearGradient(0, y, 0, y + h); g.addColorStop(0, `rgba(6,8,22,${.62 * T.escuro})`); g.addColorStop(1, `rgba(6,8,22,${.22 * T.escuro})`); ctx.fillStyle = g; ctx.fillRect(x, y, w, h); }
  batalhaChuva(view, T.chuva, T.vento);
  for (const r of T.raios) batalhaRaioDesenho(r);
  if (T.flash > 0) rect(x, y, w, h, `rgba(220,230,255,${T.flash * .38})`);
}
function drawBatalhaChao(N, seen, layers) {
  const T = batalhaTempo(N), L = pampaLayout();
  for (const m of T.marcas) if (seen(m.x, m.y, 120)) layers.push({ y: m.y - 40, draw: () => { const k = Math.min(1, m.t / 3); ellipse(m.x, m.y, 46, 16, `rgba(20,14,8,${.55 * k})`); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(m.x, m.y - 6, 40, .3 * k * (.6 + .4 * Math.sin(frameClock * 9 + m.x)), '255,120,40'); ctx.restore(); } });
  if (!N.acesas) for (const l of L.lancas) if (l.acesa && seen(l.x, l.y, 300)) layers.push({ y: 8.2e9, draw: () => pampaChama(l) });
}

// ---------- Os farrapos em formação ----------
// A roda dos que peleiam e o lugar de quem comanda, em volta do meio do campo.
function batalhaPosicoes(a) {
  const linha = [[-.66, -.12], [-.46, .5], [0, .66], [.46, .5], [.66, -.12]].map(([fx, fy]) => { const x = a.x + fx * a.rx, y = a.y + fy * a.ry, d = Math.hypot(x - a.x, (y - a.y) * 1.5) || 1; return { x, y, ux: (x - a.x) / d, uy: (y - a.y) * 1.5 / d }; });
  const comando = [{ x: a.x - a.rx * .3, y: a.y - a.ry * .62 }, { x: a.x + a.rx * .1, y: a.y - a.ry * .68 }];
  return { linha, comando };
}
const BATALHA_LUTADORES = [['lanceiro', 0], ['lanceiro', 1], ['lanceiro', 2], ['garibaldi'], ['anita']];
const BATALHA_GRITOS = { neto: ['Primeira Brigada, firme!', 'Ninguém recua!', 'Segura a linha!'], canabarro: ['Desta vez eu tô aqui!', 'Firmes, lanceiros!', 'Não deixa passar!'] };
function batalhaAliadosMonta(a) {
  const P = batalhaPosicoes(a);
  const linha = BATALHA_LUTADORES.map(([id, v], i) => Object.assign(pampaAliado(id, P.linha[i].x, P.linha[i].y, v || 0), { ancora: P.linha[i], dx: P.linha[i].ux < 0 ? -1 : 1, papel: 'linha' }));
  const comando = [Object.assign(pampaAliado('neto', P.comando[0].x, P.comando[0].y), { parado: true, papel: 'comando', dx: 1, grito: 3 }), Object.assign(pampaAliado('canabarro', P.comando[1].x, P.comando[1].y), { parado: true, papel: 'comando', dx: -1, grito: 6 })];
  return [...linha, ...comando];
}
function batalhaAliados(N, dt, p) {
  for (const a of N.aliados) {
    if (scene || modal || !mataNight) return;
    a.walk = false; a.hit -= dt; a.swing = Math.max(0, a.swing - dt); if (a.caido > 0) { a.caido -= dt; continue; }
    if (a.papel === 'comando') {
      const b = moringueVivo(); a.dx = (b ? b.x : p.x) < a.x ? -1 : 1;
      if ((a.grito -= dt) <= 0) { a.grito = 7 + Math.random() * 5; const g = BATALHA_GRITOS[a.id]; if (g) { effect(g[Math.floor(Math.random() * g.length)], a.x, a.y - 200, '#ffe8b0', 15); a.swing = .25; AudioEngine.caveVoice?.([170, 220, 160], .3, { formant: 760, q: 1.6, vol: .018, vib: 5, rate: 6 }); } }
      continue;
    }
    const A = a.ancora; if (!A) continue;
    const anda = (x, y, sp) => { const mx = x - a.x, my = y - a.y, k = Math.hypot(mx, my); if (k <= 8) return true; a.x += mx / k * Math.min(k, sp * dt); a.y += my / k * Math.min(k, sp * dt); a.walk = true; if (Math.abs(mx) > 2) a.dx = mx < 0 ? -1 : 1; a.dy = Math.abs(my) > Math.abs(mx) ? Math.sign(my) : 0; return false; };
    // Cavaleiro que caiu perto do posto: vai até ele e termina a peleia; depois volta pro lugar.
    let alvo = null, ad = 1e9; for (const q of N.beasts) { if (q.hp <= 0 || !q.batalha || q.montado) continue; const d = Math.hypot(q.x - A.x, q.y - A.y); if (d < 420 && d < ad) { ad = d; alvo = q; } }
    if (alvo) { const d = Math.hypot(alvo.x - a.x, alvo.y - a.y); if (d > 105) anda(alvo.x - Math.sign(alvo.x - a.x || 1) * 90, alvo.y, 175); else { a.dx = alvo.x < a.x ? -1 : 1; if (a.hit <= 0) { a.hit = .95 + Math.random() * .3; a.swing = .25; AudioEngine.swoosh?.(.025); pampaGolpeAliado(alvo, a.id === 'lanceiro' ? .34 : .4); } } continue; }
    if (anda(A.x, A.y, 150)) { const vindo = N.beasts.find(q => q.hp > 0 && q.alvo === a && q.montado && (q.state === 'mira' || q.state === 'carga')); a.dx = (vindo ? vindo.x - a.x : A.ux) < 0 ? -1 : 1; a.dy = 0; a.firme = !!vindo; }
  }
}
// O cavaleiro imperial da madrugada: entra pelo lado, mira no farrapo do posto e vem em carga contra ele.
function batalhaCavaleiro(b, dt, N) {
  const B = CAVE_BEASTS.lanceiroMontado, A = b.alvo, a = pampaLayout().arena; ilhaTick0(b, dt); b.carga = false;
  if (!A || !N.aliados.includes(A)) { b.alvo = batalhaAlvoLivre(N); return; }
  if (!b.montado) {
    // A pé, briga com o farrapo do posto (nunca com o Sadi).
    const dx = A.x - b.x, dy = A.y - b.y, d = Math.hypot(dx, dy) || 1; b.dx = dx < 0 ? -1 : 1;
    if (b.state === 'windup') { if (b.t <= 0) { b.state = 'rest'; b.t = 1.1; if (d < 130 && !(A.caido > 0)) { if (Math.random() < .4) { A.caido = 1.3; fxPuffs(A.x, A.y - 20, 6, 60, '#a89878'); AudioEngine.thud?.(); } else { A.swing = .25; AudioEngine.clinkMetal?.(.025); } } } return; }
    if (b.state === 'rest') { if (b.t <= 0) b.state = 'chase'; return; }
    b.state = 'chase'; if (d > 110) mataStep(b, dx / d * B.speed * .45, dy / d * B.speed * .45, dt); else if (b.cool <= 0) { b.state = 'windup'; b.t = b.t0 = .5; b.cool = 1.2; }
    return;
  }
  const S = { x: A.ancora.x + A.ancora.ux * 360, y: A.ancora.y + A.ancora.uy * 240 }, dx = A.x - b.x, dy = A.y - b.y, d = Math.hypot(dx, dy) || 1;
  if (b.state === 'entra') { const mx = S.x - b.x, my = S.y - b.y, k = Math.hypot(mx, my) || 1; b.mx = mx / k; b.my = my / k; b.dx = mx < 0 ? -1 : 1; if (k < 40 || !mataStep(b, mx / k * 420, my / k * 420, dt)) { b.state = 'mira'; b.t = b.t0 = .9; AudioEngine.neigh?.(.03); } return; }
  if (b.state === 'mira') { b.vx = dx / d; b.vy = dy / d; b.mx = b.vx; b.my = b.vy; b.dx = dx < 0 ? -1 : 1; if (b.t <= 0) { b.state = 'carga'; b.t = 1.4; AudioEngine.tropel?.(.035); } return; }
  if (b.state === 'carga') {
    b.carga = true; if (Math.random() < dt * 16) fxPuffs(b.x - b.vx * 50, b.y, 1, 26, '#c8b890');
    const moveu = mataStep(b, b.vx * 700, b.vy * 700, dt);
    if (Math.hypot(A.x - b.x, A.y - b.y) < 80 && !(A.caido > 0)) {
      if (Math.random() < .7) { A.swing = .25; AudioEngine.firme?.(.045); pampaDerruba(b, N, 'Derrubado!'); b.stun = 1.4; }
      else { A.caido = 1.6; fxPuffs(A.x, A.y - 20, 10, 90, '#a89878'); AudioEngine.thud?.(); b.state = 'curva'; b.t = .9; }
      return;
    }
    if (!moveu || b.t <= 0 || Math.hypot(b.x - a.x, (b.y - a.y) * 1.5) > a.rx * .95) { b.state = 'curva'; b.t = .9; }
    return;
  }
  if (b.state === 'curva') { if (b.t <= 0) b.state = 'entra'; else { b.mx = -b.vx; b.my = -b.vy; mataStep(b, -b.vx * 300, -b.vy * 300, dt); } return; }
  b.state = 'entra';
}
function batalhaAlvoLivre(N) { const ocupados = new Set(N.beasts.filter(q => q.hp > 0 && q.batalha).map(q => q.alvo)); const livres = N.aliados.filter(a => a.papel === 'linha' && !ocupados.has(a)); return livres[Math.floor(Math.random() * livres.length)] || N.aliados.find(a => a.papel === 'linha') || null; }

// ---------- As cenas da batalha ----------
function batalhaFalaTalk(lines) { return lines.map(l => typeof l[0] === 'string' && !['card', 'sadi'].includes(l[0]) ? [pampaQuem(l[0]), ...l.slice(1)] : l); }
moringueApeia = function (b, N) {
  pampaDerruba(b, N, 'Caiu do cavalo!'); b.fase = 2; b.state = 'chase'; b.stun = 2.4; b.cool = 2; N.vento = { t: 5, ativo: 0, dir: 1 }; keys.clear(); golpeTreme = Math.max(golpeTreme, .35);
  batalhaRaio(N, { x: b.x + 70, y: b.y + 10 }); AudioEngine.neigh?.(.06);
  const falas = [['moringue', 'Pois bem. Sabre contra lança, então.'], ['sadi', 'Pode vir, coronel. A chuva não me assusta.']], regras = [['card', '<b>Fase 2 de 3: o duelo na tempestade</b><br>Ele defende quase tudo. Bate <b>logo depois da estocada dele</b> ou <b>quando o minuano soprar</b>, que ele perde a guarda.', 'Cerro de Porongos']];
  if (!scenesEnabled()) { pampaTalk([...falas, ...regras], null, 'Em guarda!'); return; }
  const p = worldOut, lado = b.x < p.x ? -1 : 1;
  playSteps([...sceneWorld({ map: 'pampa', x: (p.x + b.x) / 2, y: (p.y + b.y) / 2 + 60, night: .3, props: batalhaCenaProps }), { actor: 'sadi', x: p.x, y: p.y, dx: lado }, { actor: 'moringue', x: b.x, y: b.y, dx: -lado, draw: (q, y) => moringueFigura(q.x, y, q.dx) }, { fade: 'in', time: .3 },
    { do: () => { BATALHA_CENA.flash = .8; AudioEngine.trovao?.(.07); golpeTreme = Math.max(golpeTreme, .3); } }, { wait: .6 }, ...falas.map(([w, t]) => ({ say: w, text: t })), { fade: 'out', time: .25 }], 'pampa-duelo', () => { keys.clear(); pampaTalk(regras, null, 'Em guarda!'); });
};
// O céu da batalha também nas cenas: chuva e o clarão do raio.
function batalhaCenaProps(layers) {
  const N = mataNight, T = N?.tempo; BATALHA_CENA.flash = Math.max(0, BATALHA_CENA.flash - .02);
  layers.push({ y: 9.1e9, draw: () => { const w = scene?.world; if (!w) return; const view = { x: w.x - 1400, y: w.y - 900, w: 2800, h: 1800 }; if (T) { rect(view.x, view.y, view.w, view.h, `rgba(6,8,22,${.3 * T.escuro})`); batalhaChuva(view, Math.max(.6, T.chuva), 0); } if (BATALHA_CENA.flash > 0) rect(view.x, view.y, view.w, view.h, `rgba(220,230,255,${BATALHA_CENA.flash * .4})`); } });
}
moringueMadrugada = function (b, N) {
  b.state = 'rest'; b.t = 1; b.stun = 0; keys.clear(); sparks.length = 0; const L = pampaLayout(), a = L.arena, p = worldOut, P = batalhaPosicoes(a);
  const fim = () => {
    N.madrugada = true; N.acesas = true; N.onda = 2.5; N.cargaCd = 3; N.vento = null; caveState().hp = caveMaxHp();
    N.aliados = batalhaAliadosMonta(a); moringueOnda(N, a); moringueOnda(N, a); floatNote('Os farrapos seguram a cavalaria em volta. O Moringue é contigo, no meio do campo.'); save();
  };
  const falas = [['moringue', 'Cavalaria! Todos! Acabem com eles!'], ['lanceiro', 'Um dia mandaram a gente largar a lança. Hoje, não.'], ['sadi', 'Avante, farrapos!'], ['garibaldi', 'Desta vez ninguém fica sozinho no campo!'], ['anita', 'Tô contigo, bodegueiro!'], ['canabarro', 'Desta vez eu vim.'], ['neto', 'Primeira Brigada, em linha!']];
  if (!scenesEnabled()) { N.acesas = true; pampaTalk([['card', '<b>Fase 3 de 3: a madrugada</b><br>Um raio cai no meio das lanças, e uma a uma elas se acendem. A cavalaria inteira desce o cerro, e os farrapos fazem a roda em volta do duelo.', 'Cerro de Porongos'], ...falas], fim, 'À carga!'); return; }
  // O duelo vai pro meio do campo e a câmera abre, pra ver a roda inteira se formando.
  const zoom0 = camera.zoom; Object.assign(worldOut, { x: a.x - 170, y: a.y + 30, dx: 1, dy: 0, walk: false }); Object.assign(b, { x: a.x + 170, y: a.y + 20, dx: -1 });
  const perto = [...L.lancas].sort((q, r) => Math.hypot(q.x - a.x, q.y - a.y) - Math.hypot(r.x - a.x, r.y - a.y)).slice(0, 3);
  let chamas = 0, acende = false;
  const cav = [-.5, 0, .5].map((f, i) => ({ actor: 'cav' + i, x: a.x + f * a.rx * .8, y: a.y - a.ry * .98, dx: f < 0 ? 1 : -1, alpha: 0, draw: (q, y) => { ctx.save(); ctx.globalAlpha *= q.alpha ?? 1; drawCavaleiro({ kind: 'lanceiroMontado', x: q.x, y, montado: true, mx: 0, my: 1, dx: q.dx, state: 'ronda', hurt: 0, boss: true }, '', 'soldado'); ctx.restore(); } }));
  const lanc = perto.map((l, i) => ({ actor: 'lanc' + i, as: lanceiroArt(i), x: l.x, y: l.y + 10, dx: l.x < a.x ? 1 : -1, alpha: 0, speed: 210 }));
  const props = layers => { batalhaCenaProps(layers); if (acende) chamas = Math.min(L.lancas.length, chamas + .25); layers.push({ y: 8.9e9, draw: () => L.lancas.slice(0, Math.floor(chamas)).forEach(l => pampaChama(l)) }); };
  const somar = ids => ({ do: () => { for (const id of ids) { const q = scene.actors[id]; if (q) { let k = 0; const t = setInterval(() => { if (!scene?.actors?.[id] || ++k > 16) { clearInterval(t); return; } q.alpha = k / 16; }, 50); fxPuffs(q.x, q.y - 40, 6, 70, '#c8dcf0'); } } } });
  playSteps([...sceneWorld({ map: 'pampa', x: a.x, y: a.y + 10, night: .22, props }), { do: () => { camera.zoom = Math.min(zoom0, .6); } },
    { actor: 'sadi', x: worldOut.x, y: worldOut.y, dx: 1 }, { actor: 'moringue', x: b.x, y: b.y, dx: -1, draw: (q, yy) => moringueFigura(q.x, yy, q.dx) }, ...cav, ...lanc, { fade: 'in', time: .4 },
    { say: 'moringue', text: falas[0][1] }, somar(['cav0', 'cav1', 'cav2']), { do: () => { AudioEngine.clarim?.(.06); AudioEngine.tropel?.(.08); golpeTreme = Math.max(golpeTreme, .2); } }, { wait: 1.2 },
    { do: () => { BATALHA_CENA.flash = 1; AudioEngine.trovao?.(.08); golpeTreme = Math.max(golpeTreme, .4); acende = true; AudioEngine.caveGem?.(); } }, { wait: 1.2 },
    somar(['lanc0', 'lanc1', 'lanc2']), { do: () => AudioEngine.caveGhost?.() }, { wait: .8 }, { walk: ['lanc0', 'lanc1', 'lanc2'], to: [P.linha[0], P.linha[1], P.linha[2]] }, { say: 'lanceiro', text: falas[1][1] },
    { do: () => AudioEngine.gritoFarrapo?.() }, { say: 'sadi', text: falas[2][1] },
    { actor: 'garibaldi', x: a.x + a.rx * .95, y: P.linha[3].y, dx: -1, speed: 300 }, { actor: 'anita', x: a.x + a.rx * .98, y: P.linha[4].y, dx: -1, speed: 300 }, { walk: ['garibaldi', 'anita'], to: [P.linha[3], P.linha[4]] }, { say: 'garibaldi', text: falas[3][1] }, { say: 'anita', text: falas[4][1] },
    { actor: 'neto', x: P.comando[0].x - 160, y: P.comando[0].y, dx: 1, speed: 200, draw: (q, yy) => pampaFigura('neto', q.x, yy, q.dx, 1) }, { actor: 'canabarro', x: P.comando[1].x + 160, y: P.comando[1].y, dx: -1, speed: 200 }, { walk: ['neto', 'canabarro'], to: [P.comando[0], P.comando[1]] },
    { say: 'canabarro', text: falas[5][1] }, { say: 'neto', text: falas[6][1] },
    { do: () => { for (const [id, q] of Object.entries(scene.actors)) if (!['sadi', 'moringue'].includes(id) && !id.startsWith('cav')) q.hop = 10; AudioEngine.vivas?.(.04); BATALHA_CENA.flash = .7; AudioEngine.trovao?.(.05); } }, { wait: 1.4 }, { fade: 'out', time: .4 }], 'pampa-madrugada', () => { camera.zoom = zoom0; fim(); });
};
moringueOnda = function (N, a) {
  if (!N.madrugada || N.beasts.filter(x => x.batalha && x.hp > 0).length >= 2) return;
  const alvo = batalhaAlvoLivre(N); if (!alvo) return; const A = alvo.ancora, x = clamp(A.x + A.ux * a.rx * .45, a.x - a.rx * .9, a.x + a.rx * .9), y = clamp(A.y + A.uy * a.ry * .45, a.y - a.ry * .9, a.y + a.ry * .9);
  N.beasts.push(ilhaMob('lanceiroMontado', WORLD_MAPS.pampa.canWalk(x, y) ? { x, y } : { x: A.x + A.ux * 200, y: A.y + A.uy * 140 }, Math.random, { minion: true, batalha: true, alvo, montado: true, need: 1, hpMul: .7, state: 'entra', t: 0, dx: A.ux < 0 ? 1 : -1 }));
};
{
  const tickC = pampaChefesTick; pampaChefesTick = function (N, dt, p) { tickC(N, dt, p); if (mataNight && batalhaN()) batalhaTick(N, dt, p); };
  const ali = pampaAliadosTick; pampaAliadosTick = function (N, dt, p) { return N.madrugada ? batalhaAliados(N, dt, p) : ali(N, dt, p); };
  const cav = ILHA_MOBS.lanceiroMontado.tick; ILHA_MOBS.lanceiroMontado.tick = (b, dt, p, N) => b.batalha ? batalhaCavaleiro(b, dt, N) : cav(b, dt, p, N);
  const aviso = ILHA_MOBS.lanceiroMontado.warn; ILHA_MOBS.lanceiroMontado.warn = (b, N) => b.batalha ? undefined : aviso?.(b, N);
  // O duelo fica no meio da roda.
  const campo = moringueNoCampo; moringueNoCampo = function (b) { if (b.fase >= 2 && mataNight?.madrugada) { const a = pampaLayout().arena, dx = (b.x - a.x) / a.rx, dy = (b.y - a.y) / a.ry, k = Math.hypot(dx, dy); if (k > .42) { b.x = a.x + dx / k * a.rx * .42; b.y = a.y + dy / k * a.ry * .42; } return; } return campo(b); };
  // Quem caiu, cai de verdade: tomba pro lado e levanta.
  const desenha = drawPampaAliado; drawPampaAliado = function (a) {
    if (!(a.caido > 0) || !mataNight?.madrugada) return desenha(a);
    const c = a.caido, ang = (a.dx < 0 ? 1 : -1) * 1.2 * Math.min(1, (1.6 - c) * 5, c * 3); ctx.save(); ctx.translate(a.x, a.y); ctx.rotate(ang); ctx.translate(-a.x, -a.y); a.caido = 0; try { desenha(a); } finally { a.caido = c; } ctx.restore();
  };
  // O golpe final: um raio em cima do coronel, o clarão, e o sol começa a abrir.
  const venc = moringueVencido; moringueVencido = function (b, N) { if (N) { batalhaRaio(N, { x: b.x, y: b.y }); } BATALHA_CENA.flash = 1; golpeTreme = Math.max(golpeTreme, .6); AudioEngine.trovao?.(.09); AudioEngine.clarim?.(.06); return venc(b, N); };
  const M = WORLD_MAPS.pampa, draw = M.draw;
  M.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers); const N = batalhaN(); if (!N || scene) return;
    drawBatalhaChao(N, seen, layers); layers.push({ y: 8.25e9, draw: () => drawBatalhaCeu(N, view) });
  };
  // O som: chuva e vento por baixo de tudo.
  const amb = AudioEngine.ambience; AudioEngine.ambience = function (dt) {
    amb.call(this, dt); const N = batalhaN(), T = N?.tempo; this.bus = this.ambientBus;
    this.loop('batalhaChuva', T ? .032 * T.chuva : 0, { type: 'highpass', freq: 1700 }); this.loop('batalhaVento', T ? (T.vento ? .07 : .022 * T.chuva) : 0, { type: 'bandpass', freq: 380, q: .5 });
    this.bus = null;
  };
}
Object.assign(AudioEngine, { tamborGuerra(vol = .015) { this.note(62, .26, 'sine', vol * 1.6); this.note(94, .12, 'triangle', vol * .6); this.noise(.07, vol * .5, 520); } });

// ---------- O fim: as almas, o sol abrindo e a chuva parando ----------
// Na cena final, a chuva ainda cai no começo e vai parando com o sol.
function batalhaChuvaFinal(cam, sol) {
  const view = { x: cam.x - 1400, y: cam.y - 900, w: 2800, h: 1800 }; BATALHA_CENA.flash = Math.max(0, BATALHA_CENA.flash - .015);
  batalhaChuva(view, Math.max(0, .8 - sol * 1.8), 0); if (BATALHA_CENA.flash > 0) rect(view.x, view.y, view.w, view.h, `rgba(230,236,255,${BATALHA_CENA.flash * .45})`);
}

// ---------- O Fogo da República ----------
// No Campo dos Menezes, ao lado do palanque, depois da proclamação: descansa, volta pra bodega ou pro começo do pampa.
function pampaFogoFim() { const P = pampaLayout(PAMPA_N.capitao).palanque; return { x: P.x - 70, y: P.y + P.h + 150 }; }
function pampaFogoFimAbre() {
  const st = pampaState(); caveState().hp = caveMaxHp(); st.ultimoFogo ??= 'porteira'; save(); AudioEngine.ready?.();
  talkChoose([['sadi', 'O fogo da República. Daqui, pra onde eu vou?']], [['Voltar pra bodega', () => pampaVoltaCasa()], ['Voltar pro começo do pampa (Porteira)', () => pampaFogoVai(PAMPA_FOGOS[0])], ['Ficar mais um pouco']], 2);
}
{
  const M = WORLD_MAPS.pampa, draw = M.draw, spots = M.spots;
  M.spots = function () {
    const list = spots.call(this).filter(s => s.id !== 'pampa:casa' || !pampaLayout().palanque), L = pampaLayout();
    if (L.n === PAMPA_N.capitao && pampaState().republica) { const f = pampaFogoFim(); list.push({ id: 'pampa:fogofim', x: f.x, y: f.y + 70, radius: 120, label: 'Fogo da República · voltar pra bodega ou pro começo', act: pampaFogoFimAbre }); }
    return list;
  };
  M.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers); const L = pampaLayout(); if (L.n !== PAMPA_N.capitao || !pampaState().republica) return; const f = pampaFogoFim(); if (!seen(f.x, f.y, 400)) return;
    layers.push({ y: f.y + 20, draw: () => { if (!worldSprite('rural', 6, f.x - 70, f.y - 110, 140, 110)) sceneFire(f.x, f.y); drawMataLog({ x: f.x + 10, y: f.y + 70, w: 120, a: .05 }); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(f.x, f.y - 30, 200, .3 + .06 * Math.sin(frameClock * 9), '255,150,60'); ctx.restore(); } });
  };
  // A cena final termina com o Sadi ao lado do fogo.
  const fim = pampaFim; pampaFim = function () { fim(); const f = pampaFogoFim(); Object.assign(worldOut, { x: f.x + 130, y: f.y + 60, dx: -1, dy: 0, walk: false }); };
}
