// Bodoque: espanta quero-quero na laçada e no costelão. Comprado na Casa do Campeiro.
// Segure F: um círculo fecha sobre o quero-quero mais próximo; solte com ele verde e a pedrada assusta o bicho.
// Em voo o círculo fecha mais rápido; pousado é mais fácil.
'use strict';

const SLING_RANGE = 650, SLING_WINDOW = [.62, .9];
let sling = { aim: null, cool: 0 };

function slingOwned() { return !!G.up?.bodoque; }
function slingActive() { return started && !scene && (!!G.lasso || isCampo()); }
// Posição desenhada do quero-quero (na laçada e de visita no costelão).
function slingTargetPos(t) { return t.kind === 'lasso' ? { x: t.ref.x, y: t.ref.y - t.ref.h } : { x: t.ref.x, y: t.ref.y - 28 - t.ref.h }; }
function slingTargets() {
  const list = G.lasso ? activeQueros(G.lasso).filter(q => q.state !== 'flee').map(ref => ({ kind: 'lasso', ref }))
    : campoBirds.filter(b => b.state !== 'out').map(ref => ({ kind: 'campo', ref }));
  return list.filter(t => Math.hypot(t.ref.x - G.player.x, t.ref.y - G.player.y) < SLING_RANGE);
}
function slingAlive(t) { return t.kind === 'lasso' ? !!G.lasso && t.ref.state !== 'flee' : campoBirds.includes(t.ref) && t.ref.state !== 'out'; }

function slingStart() {
  if (!slingActive()) return;
  if (!slingOwned()) { say('Bodoque bloqueado: compre na Casa do Campeiro, na Fronteira.'); AudioEngine.bad(); return; }
  if (sling.aim || sling.cool > 0) return;
  const t = slingTargets().sort((a, b) => Math.hypot(a.ref.x - G.player.x, a.ref.y - G.player.y) - Math.hypot(b.ref.x - G.player.x, b.ref.y - G.player.y))[0];
  if (!t) { effect('Nenhum quero-quero por perto', G.player.x, G.player.y - 140, '#fff0c3'); return; }
  sling.aim = { ...t, t: 0, dur: t.ref.h > 20 ? .75 : 1.3 };
  AudioEngine.tick();
}
function slingTick(dt) {
  sling.cool = Math.max(0, sling.cool - dt);
  const a = sling.aim; if (!a) return;
  if (!slingAlive(a)) { sling.aim = null; return; }
  a.t += dt;
  if (a.t > a.dur * 1.25) { sling.aim = null; sling.cool = .4; effect('Segurou demais', G.player.x, G.player.y - 140, '#ffc0a0'); }
}
function slingRelease() {
  const a = sling.aim; if (!a) return;
  sling.aim = null; sling.cool = .5;
  const p = a.t / a.dur, pos = slingTargetPos(a);
  AudioEngine.swoosh(.05);
  if (p < SLING_WINDOW[0] || p > SLING_WINDOW[1]) { effect(p < SLING_WINDOW[0] ? 'Pedrada fraca' : 'Passou do ponto', pos.x, pos.y - 30, '#ffc0a0'); return; }
  scareQuero(a);
}
// O quero-quero leva o susto, grita e vai embora (na laçada volta ao ninho depois de um tempo).
function scareQuero(a) {
  const b = a.ref, pos = slingTargetPos(a), away = Math.sign(b.x - G.player.x) || 1;
  if (a.kind === 'lasso') { b.state = 'flee'; b.t = 9; b.fleeDir = away; b.face = away; }
  else { b.state = 'out'; b.face = away; b.h = Math.max(b.h, 40); b.hit = true; }
  AudioEngine.thud(); AudioEngine.queroquero(.1, 3);
  fxPuffs(pos.x, pos.y, 8, 110, '#f2efe8'); gainXP(2);
}
function drawSlingAim() {
  const a = sling.aim; if (!a || !slingAlive(a)) return;
  const pos = slingTargetPos(a), p = a.t / a.dur, r = 64 * (1 - Math.min(p, 1)) + 14;
  const good = p >= SLING_WINDOW[0] && p <= SLING_WINDOW[1], color = good ? '#7ee06a' : p > SLING_WINDOW[1] ? '#ff8a6a' : '#fff2c0';
  // elástico esticado da mão do peão até a mira
  ctx.strokeStyle = 'rgba(168,58,36,.55)'; ctx.lineWidth = 2; ctx.setLineDash([5, 6]); ctx.beginPath(); ctx.moveTo(G.player.x, G.player.y - 110); ctx.lineTo(pos.x, pos.y); ctx.stroke(); ctx.setLineDash([]);
  ctx.strokeStyle = '#2a1d12'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = 'rgba(126,224,106,.45)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(pos.x, pos.y, 64 * (1 - SLING_WINDOW[0]) + 14, 0, Math.PI * 2); ctx.stroke();
  for (let k = 0; k < 4; k++) { const ang = k * Math.PI / 2; ctx.strokeStyle = color; ctx.beginPath(); ctx.moveTo(pos.x + Math.cos(ang) * (r + 4), pos.y + Math.sin(ang) * (r + 4)); ctx.lineTo(pos.x + Math.cos(ang) * (r + 12), pos.y + Math.sin(ang) * (r + 12)); ctx.stroke(); }
}
// Botão na tela (celular e mouse): aparece no campo; trancado até comprar.
function updateSlingButton() {
  const b = $('slingButton'); if (!b) return;
  const show = slingActive() && !modal; b.classList.toggle('hidden', !show); if (!show) return;
  const owned = slingOwned(); b.classList.toggle('locked', !owned);
  setHTML(b, owned ? '<b>F</b> · Bodoque' : '🔒 Bodoque · Casa do Campeiro');
}
