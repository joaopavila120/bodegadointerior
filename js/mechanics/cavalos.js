// Tropilha fugida (Estela): a tormenta arrebentou a cerca e os crioulos dela se espalharam pela Fronteira. Depois de
// fechar a bodega, ache os cavalos pelo mapa e lace pelo menos três, numa laçada parecida com a dos javalis: o cavalo
// pasta, se espanta quando a gente chega (girando o laço ele se espanta menos), dispara depois do primeiro laço e dá
// coice em quem chega por trás.
'use strict';

const CAVALOS_NEED = 3, CAVALO_HITS = 2, CAVALO_COATS = ['baio', 'tostado', 'tordilho'];
const ESTELA_SPOT = { x: 1640, y: 680 };
MAP_EVENTS.cavalos = {
  id: 'cavalos', name: 'Tropilha fugida', icon: '🐎', giver: 'estela', place: 'Fronteira, de noite, depois de fechar',
  desc: 'A tormenta arrebentou a cerca da Estela e a tropilha de crioulos se espalhou pela Fronteira. Depois de fechar a bodega, ache os cavalos pelo mapa e lace pelo menos 3.',
  reward: { cash: 110, xp: 80, rep: 3, friend: { estela: 12 } },
  days: n => n === 25 || n > 25 && (n - 25) % 21 === 0, requires: () => true,
  scene: [],
  tracker: () => { const st = mapEvState('cavalos'); if (st.done) return null; return { icon: '🐎', title: 'Tropilha fugida', goal: mapNight() ? 'Ache e lace 3 cavalos da Estela pela Fronteira (' + st.kills + '/' + CAVALOS_NEED + ')' : 'Hoje à noite, depois de fechar a bodega: laçar os cavalos da Estela pela Fronteira' }; }
};
MAP_REMIND.cavalos = ['🐎 Os cavalos da Estela estão soltos pela Fronteira: saia pela porta e lace.', '🐎 A tropilha se espalhou: chegue perto de um cavalo e aperte E.'];
function cavalosNight() { const ev = mapEventToday(); return ev?.id === 'cavalos' && !ev.st.done && mapNight(); }
function cavaloList() { const st = mapEvState('cavalos'); return [...JAVALI_SPOTS].reverse().filter(([x, y]) => WORLD_MAPS.vila.canWalk(x, y)).slice(0, 6).map(([x, y], i) => ({ i, x: x + 30, y, coat: i % 3 })).filter(h => !st.dead[h.i]); }
function cavaloSpots() { if (!cavalosNight() || worldOut?.map !== 'vila') return []; return cavaloList().map(h => ({ id: 'cavalo:' + h.i, x: h.x, y: h.y + 20, radius: 120, label: 'Cavalo ' + CAVALO_COATS[h.coat] + ' da Estela · laçar', act: () => startHorseLasso(h) })); }
function estelaSpot() {
  if (!cavalosNight() || worldOut?.map !== 'vila') return [];
  return [{ id: 'estela:tropilha', x: ESTELA_SPOT.x, y: ESTELA_SPOT.y, radius: 90, label: 'Falar com a Estela (tropilha)', act: () => { const st = mapEvState('cavalos'), i = PEOPLE.findIndex(p => p.id === 'estela'); worldTalkAt = { x: worldOut.x, y: worldOut.y }; showRpgBox('worldTalk', { person: i, name: 'Estela', reply: 'Faltam ' + Math.max(0, CAVALOS_NEED - st.kills) + '. O tordilho gosta da beira do rio; o baio, do pouso dos tropeiros. Chega devagarinho, girando o laço, e nunca por trás!' }); } }];
}
Object.assign(AudioEngine, {
  neigh(v = .06) { this.caveVoice?.([560, 980, 820, 430], .7, { formant: 1300, q: 2.5, vol: v, vib: 70, rate: 18 }); },
  hooves(n = 4) { for (let i = 0; i < n; i++) this.note(95 + Math.random() * 25, .05, 'triangle', .08, i * .11); }
});

// ---------- Laçada ----------
function startHorseLasso(h) {
  if (G.lasso || G.bocce || G.game || !cavalosNight()) return;
  closeDialog(true); if (phoneOpen) togglePhone(false); showRpgBox('worldTalk', null);
  const horse = { id: 0, cavalo: true, coat: h.coat, x: 960, y: 640, face: -1, state: 'free', mode: 'graze', t: 1, vx: 0, vy: 0, rope: 0 };
  G.lasso = { mode: 'cavalo', horseIndex: h.i, bois: [horse], caught: 0, need: 1, charge: 0, charging: false, throw: null, saved: { ...G.player }, fx: 1, fy: 0, time: 0, queros: [], hits: 0 };
  G.player = { x: 260, y: 700, dx: 1, dy: 0, walk: false };
  $('lassoUI').classList.remove('hidden'); updateLassoUI(); AudioEngine.neigh(.05);
  if (!G.taught?.cavalo) { G.taught ??= {}; G.taught.cavalo = true; showBanner('Tropilha fugida', 'Chegue devagar girando o laço (Q): ele se espanta menos. ' + CAVALO_HITS + ' laços e ele acalma. Nunca por trás: coice! Espaço esquiva.', 'info'); }
  save();
}
function horseTick(L, b, dt) {
  const p = G.player, dx = b.x - p.x, dy = b.y - p.y, d = Math.hypot(dx, dy) || 1; b.t -= dt; b.frame = (b.frame || 0) + dt; b.kickCd = Math.max(0, (b.kickCd || 0) - dt); b.bolt = Math.max(0, (b.bolt || 0) - dt);
  if (b.mode === 'kick') {
    if (b.t <= 0) {
      const back = { x: b.x - b.face * 50, y: b.y };
      if (Math.hypot(p.x - back.x, p.y - back.y) < 105 && !(L.immune > 0) && !(L.dash > 0)) horseKick(L, b);
      b.mode = 'flee'; b.t = 1.1; b.vx = b.face; b.vy = 0;
    }
    return;
  }
  // Pelo lado do rabo e perto demais: ele levanta as patas de trás.
  if (d < 100 && (p.x - b.x) * b.face < 0 && !b.kickCd) { b.mode = 'kick'; b.t = .5; b.kickCd = 2.4; AudioEngine.caveSnort?.(); return; }
  const spook = L.charging ? 170 : 270;
  if (b.mode !== 'flee' && d < spook) { b.mode = 'flee'; b.t = 1.3 + Math.random() * .6; b.vx = dx / d; b.vy = dy / d * .7; AudioEngine.neigh(.04); AudioEngine.hooves(); }
  if (b.mode === 'flee') { const sp = b.bolt > 0 ? 340 : 240; b.x += b.vx * sp * dt; b.y += b.vy * sp * dt; if (b.t <= 0) { b.mode = 'graze'; b.t = 1.4 + Math.random() * 2; b.vx = b.vy = 0; } }
  else { if (b.t <= 0) { b.t = 1.5 + Math.random() * 2.5; const a = Math.random() * Math.PI * 2, go = Math.random() < .5; b.vx = go ? Math.cos(a) : 0; b.vy = go ? Math.sin(a) * .5 : 0; } b.x += b.vx * 45 * dt; b.y += b.vy * 45 * dt; }
  if (b.x < 90 || b.x > 1310) { b.vx *= -1; b.x = clamp(b.x, 90, 1310); } if (b.y < 480 || b.y > 860) { b.vy *= -1; b.y = clamp(b.y, 480, 860); }
  if (Math.abs(b.vx) > .1) b.face = b.vx < 0 ? -1 : 1;
}
function horseKick(L, b) {
  const p = G.player, d = Math.hypot(p.x - b.x, p.y - b.y) || 1; L.immune = 1.1; L.charging = false; L.knock = .35; L.knockX = (p.x - b.x) / d * 700; L.knockY = (p.y - b.y) / d * 420; L.hits = (L.hits || 0) + 1;
  AudioEngine.punch?.(1.2); AudioEngine.ouch(); effect('Coice!', p.x, p.y - 150, '#ffb3a0', 20); fxPuffs(p.x, p.y - 60, 6, 90, '#9a8a6a'); fxStars(p.x, p.y - 120, 4);
  if (L.hits >= 5) { L.flee = true; b.mode = 'flee'; b.bolt = 3; b.t = 3; effect('O cavalo disparou pro campo aberto!', p.x, p.y - 190, '#ffd0a0', 17); setTimeout(() => { if (G.lasso === L) finishHorse(L); }, 900); }
  updateLassoUI();
}
function horseRoped(L, b) {
  const p = G.player;
  if (b.rope >= CAVALO_HITS) { b.state = 'caught'; b.ledT = 0; L.caught++; AudioEngine.neigh(.07); AudioEngine.heart(); burst(b.x, b.y - 40, 'leaf'); effect('Laçou o ' + CAVALO_COATS[b.coat] + '!', b.x, b.y - 140, '#e1ff9e', 19); gainXP(8); }
  else { const d = Math.hypot(b.x - p.x, b.y - p.y) || 1; b.mode = 'flee'; b.bolt = 1.5; b.t = 1.5; b.vx = (b.x - p.x) / d; b.vy = (b.y - p.y) / d * .6; AudioEngine.neigh(.07); AudioEngine.hooves(6); effect('Laço ' + b.rope + '/' + CAVALO_HITS + ' · ele disparou!', b.x, b.y - 140, '#ffe9a8', 17); }
}
// Laçado, ele acalma e vai mansinho pro lado da Estela.
function horseLed(L, b, dt) { b.ledT = (b.ledT || 0) + dt; const tx = 1250, ty = 540, d = Math.hypot(tx - b.x, ty - b.y); if (d > 4) { b.x += (tx - b.x) / d * 80 * dt; b.y += (ty - b.y) / d * 80 * dt; b.face = tx < b.x ? -1 : 1; } if (b.ledT > 1.2) b.state = 'pen'; }
function finishHorse(L) {
  G.player = { ...L.saved }; G.lasso = null; keys.clear(); $('lassoUI').classList.add('hidden');
  const st = mapEvState('cavalos');
  if (L.caught > 0) {
    st.dead[L.horseIndex] = true; st.kills++; gainXP(10); AudioEngine.heart();
    if (st.kills >= CAVALOS_NEED && !st.done) { st.done = true; const rw = MAP_EVENTS.cavalos.reward; grantReward(rw); cavalosThanks(rw, st.kills); }
    else floatNote('🐎 Cavalo de volta! ' + st.kills + '/' + CAVALOS_NEED + ' esta noite.');
  } else floatNote('🐎 O cavalo escapou pro campo aberto. Respira e tenta de novo, chegando devagar.');
  save(); refreshHUD();
}
function horseUI(L) {
  const b = L.bois[0], st = mapEvState('cavalos'), ui = $('lassoUI');
  ui.querySelector('b').textContent = 'Tropilha da Estela';
  ui.querySelectorAll('small')[1].innerHTML = 'WASD anda · segure <b>Q</b> (chega devagar, ele se espanta menos) e solte em cima do cavalo · nunca por trás · <b>Espaço</b> esquiva do coice';
  $('lassoCount').textContent = L.caught ? 'Laçou o ' + CAVALO_COATS[b.coat] + '!' : 'Laços no cavalo: ' + (b.rope || 0) + '/' + CAVALO_HITS;
  $('lassoHerd').textContent = 'Cavalos laçados esta noite: ' + st.kills + '/' + CAVALOS_NEED + ' · coices: ' + (L.hits || 0) + '/5';
  $('lassoFinish').disabled = true; $('lassoFinish').textContent = L.caught ? 'Levando o cavalo…' : 'Lace o cavalo';
}
// Noite de lua: mais claro que a caçada de javali; a Estela espera montada, com o lampião.
function horseBackdrop(L) {
  rect(0, 0, W, H, 'rgba(18,26,62,.42)');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(G.player.x, G.player.y - 60, 300, .22, '255,210,140'); glow(1300, 420, 160, .3, '255,200,110'); glow(1180, 140, 90, .25, '230,236,255'); ctx.restore();
  ellipse(1180, 140, 26, 26, '#f1ecd6');
  const i = PEOPLE.findIndex(p => p.id === 'estela'); if (i >= 0) personDraw(PEOPLE[i].sprite, 1300, 520, false, false, -1);
}
function drawArenaHorse(L, b) {
  const moving = b.state === 'caught' || b.mode === 'flee' || Math.hypot(b.vx, b.vy) > .05, rate = b.mode === 'flee' ? (b.bolt > 0 ? 16 : 12) : 6;
  const frame = moving ? 1 + Math.floor(L.time * rate) % 3 : 0, shake = b.mode === 'kick' ? Math.sin(L.time * 50) * 3 : 0;
  if (b.mode === 'kick') { const bx = b.x - b.face * 60, pulse = .5 + .5 * Math.sin(L.time * 18); ellipse(bx, b.y, 50, 20, `rgba(230,50,36,${.18 + .16 * pulse})`); ctx.strokeStyle = `rgba(235,52,40,${.7 + .3 * pulse})`; ctx.lineWidth = 4; ctx.beginPath(); ctx.ellipse(bx, b.y, 50, 20, 0, 0, Math.PI * 2); ctx.stroke(); }
  ellipse(b.x, b.y + 2, 60, 12, '#1c140c44');
  ctx.save(); if (b.mode === 'kick') { ctx.translate(b.x + shake, b.y); ctx.rotate(-b.face * .08); ctx.translate(-b.x, -b.y); }
  expansionSprite('wild-horses-v1', b.coat * 4 + frame, b.x, b.y + 4, 150, b.face < 0); ctx.restore();
  if (b.state === 'free' && b.rope) bar(b.x - 32, b.y - 170, 64, b.rope / CAVALO_HITS, '#e8cc8a');
  if (b.state === 'caught') { ctx.strokeStyle = '#d8b878'; ctx.lineWidth = 3; ctx.beginPath(); ctx.ellipse(b.x + b.face * 48, b.y - 112, 14, 7, 0, 0, Math.PI * 2); ctx.stroke(); }
}

// ---------- Cenas: a Estela pede ajuda e, no fim, agradece ----------
function cavalosIntro(def) {
  const c = { x: 1500, y: 700 }, done = () => talk([['card', '<b>' + def.icon + ' ' + def.name + '</b><br>' + def.desc + '<br><i>Onde: ' + def.place + '</i><br><br>Recompensa:' + rewardHTML(def.reward), 'Evento de hoje no mapa']], null, 'Combinado');
  if (!scenesEnabled()) { done(); return; }
  playSteps([...sceneWorld({ map: 'vila', x: c.x + 60, y: c.y }), { actor: 'sadi', x: c.x - 80, y: c.y, dx: 1 }, { actor: 'estela', x: c.x + 760, y: c.y + 20, dx: -1, speed: 320 }, { fade: 'in', time: .5 },
    { do: () => AudioEngine.hooves(10) }, { walk: 'estela', to: { x: c.x + 110, y: c.y + 10 } },
    { say: 'estela', text: 'Sadi! Desculpa chegar assim, a galope. A tormenta de ontem arrebentou a cerca lá de casa.' },
    { say: 'estela', text: 'A tropilha inteira se espalhou pela Fronteira: o baio, o tostado, o tordilho… crioulo de lida, tudo criado no meu galpão.' },
    { say: 'sadi', text: 'Bah, Estela! Precisa de laço?' },
    { say: 'estela', text: 'Preciso de laço com jeito. Cavalo assustado não se pega no grito: chega devagar, girando a armada, e nunca por trás, que o coice é certo.' },
    { say: 'estela', text: 'Depois de fechar a bodega, me ajuda a laçar pelo menos três? Eu espero na frente da bodega, com o lampião.' },
    { say: 'sadi', text: 'Conta comigo. Hoje de noite a tropilha volta pra querência!' },
    { walk: 'estela', to: { x: c.x + 800, y: c.y + 40 } }], 'evento-cavalos', done);
}
function cavalosThanks(rw, kills) {
  const receive = () => talk([['reward', rw, 'Tropilha fugida · concluída']], null, 'Receber'), first = !G.cavalosThanked; G.cavalosThanked = (G.cavalosThanked || 0) + 1; save();
  if (!scenesEnabled()) { talk([['estela', 'Os ' + kills + ' de volta! Obrigada, Sadi.'], ['reward', rw, 'Tropilha fugida · concluída']], null, 'Receber'); return; }
  const c = ESTELA_SPOT, cast = [{ actor: 'estela', x: c.x, y: c.y, dx: -1 }, { actor: 'sadi', x: c.x - 170, y: c.y + 40, dx: 1 },
    { actor: 'h0', horse: 0, x: c.x + 150, y: c.y + 20, dx: -1 }, { actor: 'h1', horse: 1, x: c.x + 270, y: c.y + 60, dx: -1 }, { actor: 'h2', horse: 2, x: c.x + 390, y: c.y + 30, dx: -1 }];
  const lines = first ? [
    { say: 'estela', text: 'Os três de volta! O baio, o tostado e o tordilho… e nenhum machucado. Tu laça com respeito, Sadi.' },
    { do: () => AudioEngine.neigh(.06) },
    { say: 'estela', text: 'Se não fosse tu, a essa hora eles tavam atravessando o rio, rumo à Argentina!' },
    { say: 'sadi', text: 'Cavalo crioulo é parceiro de lida, Estela. Tem que voltar pra querência.' },
    { say: 'estela', text: 'Toma a paga. E se um dia tu quiser um parceiro de verdade, a Casa do Campeiro tem crioulo de primeira.' },
    { say: 'estela', text: 'Agora deixa eu levar essa tropa pra casa antes que o tordilho invente outra aventura.' }
  ] : [{ say: 'estela', text: 'De novo a tropilha de volta! Obrigada, Sadi: tu já é o laçador oficial da Fronteira.' }];
  playSteps([...sceneWorld({ map: 'vila', x: c.x + 60, y: c.y, night: true, lights: [{ x: c.x + 20, y: c.y - 100, r: 180, a: .35 }] }), ...cast, { fade: 'in', time: .8 }, ...lines,
    { do: () => AudioEngine.hooves(10) }, { walk: ['estela', 'h0', 'h1', 'h2'], to: [{ x: c.x + 780, y: c.y }, { x: c.x + 900, y: c.y + 20 }, { x: c.x + 1020, y: c.y + 50 }, { x: c.x + 1140, y: c.y + 30 }] }, { fade: 'out', time: .7 }], 'cavalos-agradecimento', receive);
}

// ---------- Ligações ----------
{
  const sw = spawnWalkers; spawnWalkers = function (M) { sw(M); if (cavalosNight()) worldWalkers = worldWalkers.filter(w => PEOPLE[w.person]?.id !== 'estela'); };
  const wk = walkersKey; walkersKey = function (M) { return wk(M) + (cavalosNight() ? ':cavalos' : ''); };
  const vila = WORLD_MAPS.vila, spots = vila.spots, draw = vila.draw;
  vila.spots = function () { return [...spots.call(this), ...cavaloSpots(), ...estelaSpot()]; };
  vila.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers); if (!cavalosNight()) return;
    for (const h of cavaloList()) if (seen(h.x, h.y)) layers.push({ y: h.y, draw: () => { const k = Math.floor(frameClock * 1.5 + h.i) % 8, frame = k < 5 ? 0 : 1 + k % 3; ellipse(h.x, h.y + 2, 46, 9, '#1c140c44'); expansionSprite('wild-horses-v1', h.coat * 4 + frame, h.x, h.y + 4, 112, h.i % 2 === 0); } });
    const i = PEOPLE.findIndex(p => p.id === 'estela'); if (i >= 0 && seen(ESTELA_SPOT.x, ESTELA_SPOT.y)) layers.push({ y: ESTELA_SPOT.y, draw: () => { personDraw(PEOPLE[i].sprite, ESTELA_SPOT.x, ESTELA_SPOT.y, false, false, -1); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(ESTELA_SPOT.x - 20, ESTELA_SPOT.y - 110, 150, .3, '255,200,110'); ctx.restore(); } });
  };
  // A Estela não entra na bodega: o aviso é na frente dela, montada.
  const intro = playEventScene; playEventScene = function (def) { if (def.id === 'cavalos') { cavalosIntro(def); return; } intro(def); };
}
