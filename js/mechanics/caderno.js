// Caderno de receitas do vô: sete páginas escondidas pelo mapa (sótão, ruína das Missões, baú do pouso, casa do Badin,
// galeteria, árvore de Páscoa e o fundo da caverna). Cada página libera um prato novo na bodega; duas delas liberam o
// xis bacon e o xis coração, que não se compram mais na Ferragem. Os pratos saem do fogão do vô, na cozinha:
// segure E e ele prepara o prato da mesa que pediu primeiro.
// (O caderno de histórias do vô, com as três páginas de relíquias, é outra coisa: fica em missions.js.)
'use strict';

const RECEITAS = [
  { id: 'pastel', dish: 'pastel', goods: ['farinha'], map: 'casa:valter', x: 370, y: 280, label: 'Escadinha do sótão', place: 'no sótão da casa do Valter',
    hint: 'O Valter guarda as tralhas do vô no sótão da casa dele, na Fronteira.',
    note: 'Pastel de feira, do jeito da tua vó: farinha sovada com água morna e uma pitada de cachaça pra massa estalar. Recheio de queijo, fecha com o garfo e óleo bem quente. Pastel bom faz barulho na boca.' },
  { id: 'pinhao_quente', dish: 'pinhao_quente', map: 'vila', x: 3600, y: 1820, place: 'nas pedras da ruína das Missões',
    hint: 'O vô gostava de sentar nas pedras da ruína das Missões.',
    note: 'Pinhão quente, como os guaranis faziam aqui nas Missões: cozido em água e sal até a casca abrir, depois sapecado na chapa. Serve num cone de jornal, que esquenta a mão no inverno.' },
  { id: 'xis_bacon', unlock: 'bacon', map: 'vila', x: 3000, y: 2050, label: 'Baú velho dos tropeiros', place: 'num baú velho do pouso dos tropeiros',
    hint: 'Os tropeiros deixavam baús no pouso, perto da Fronteira.',
    note: 'Xis bacon: o mesmo xis da casa, com bacon tostadinho na chapa por cima do ovo. Foi ideia do teu pai, guri ainda. Não conta pra ninguém que eu copiei dele.' },
  { id: 'polenta_frita', dish: 'polenta_frita', goods: ['fuba'], map: 'casa:badin', x: 1050, y: 360, label: 'Despensa da nona', place: 'na despensa da nona do Badin',
    hint: 'A nona do Badin guarda receita na despensa da casa de pedra, na Serra.',
    note: 'Polenta da nona: fubá mexido na panela de ferro até largar do fundo. Esfria na tábua, corta em palito e frita no óleo bem quente. Com um vinho de garrafão, vira janta.' },
  { id: 'galeto', dish: 'galeto', goods: ['galeto'], map: 'serra', x: 3500, y: 1660, place: 'atrás da galeteria da Serra',
    hint: 'Na Serra, o cheiro de galeto vem de trás da galeteria.',
    note: 'Galeto al primo canto, que os gringos de Caxias me ensinaram: frango novinho, do primeiro canto, com sálvia, alho e vinho branco, assado devagar no espeto.' },
  { id: 'cuca', dish: 'cuca', goods: ['farinha'], map: 'sc', x: 1080, y: 2070, place: 'aos pés da árvore de Páscoa de Pomerode',
    hint: 'Em Pomerode, a oma escondia bilhete aos pés da árvore de Páscoa.',
    note: 'Cuca da oma de Pomerode: massa de farinha e ovo, farofa de manteiga e açúcar por cima e uva da parreira no meio. Com café passado, não tem tristeza que aguente.' },
  { id: 'xis_coracao', unlock: 'coracao', map: 'caverna', place: 'no fundo da caverna da Serra',
    hint: 'Dizem que o vô desceu na caverna da Serra e deixou uma receita lá no fundo.',
    note: 'Xis coração: coração de boi da carneação, picado miúdo e passado na chapa com alho. Receita de galpão, que eu guardei lá embaixo da terra, onde nem o Valter mexe.' }
];
const DISH_KEYS = Object.keys(DISHES), FOGAO = { id: 'fogao', x: 790, y: 640, w: 76, h: 64, unlock: 'fogao' };
// O rótulo do fogão diz qual prato sai agora.
Object.defineProperty(FOGAO, 'label', { get() { const k = fogaoTarget(); return 'Fogão do vô · segure E' + (k ? ': ' + nameOf(k) : ''); }, enumerable: true });
FIXED.push(FOGAO);

function receitaFound(id) { return !!G.receitas?.[id]; }
function receitasFound() { return RECEITAS.filter(r => receitaFound(r.id)).length; }
function receitaTitle(r) { return r.dish ? DISHES[r.dish].name : RECIPES[r.id]?.name || r.id; }

// ---------- Achar as páginas ----------
function receitaSpots(map = worldOut?.map) {
  if (!worldOut || prologueActive()) return [];
  return RECEITAS.filter(r => r.map === map && r.x && !receitaFound(r.id)).map(r => ({ id: 'receita:' + r.id, x: r.x, y: r.y, radius: 70, label: r.label || 'Uma folha amarelada no chão', act: () => findReceita(r) }));
}
function findReceita(r) {
  G.receitas ??= {}; if (receitaFound(r.id)) return; G.receitas[r.id] = G.day;
  const first = !G.up.fogao && !!r.dish;
  if (r.dish) G.up.fogao = true;
  for (const k of r.goods || []) G.up[k] = true;
  if (r.unlock) { G.up[r.unlock] = true; G.upOwned ??= {}; G.upOwned[r.unlock] = true; }
  const rw = { xp: 40, rep: 1 }; grantReward(rw); AudioEngine.heart(); save(); refreshHUD();
  const what = r.dish ? `Novo no <b>fogão do vô</b>: <b>${DISHES[r.dish].name}</b> (${money(DISHES[r.dish].price)}). Leva ${dishPartsText(r.dish)}.`
    : `Liberado o <b>${receitaTitle(r)}</b> na bancada de montagem.` + (r.unlock === 'bacon' ? ' O bacon se compra no Açougue da Fronteira.' : ' O coração sai da carneação do boi.');
  talk([['card', `<div class="vo-note"><small>Caderno de receitas do vô · página ${receitasFound()}/${RECEITAS.length}</small><b>${receitaTitle(r)}</b><p>“${r.note}”</p></div>`, 'Uma página do caderno do vô!'],
    ['dica', what + (first ? '<br><br>O fogão a lenha do vô foi pra cozinha da bodega, do lado da cambona.' : '') + '<br><br>As páginas achadas ficam no Guia e progresso, em Caderno do vô.', 'Receita nova'],
    ['reward', rw, 'Página do caderno']], null, 'Guardar no caderno');
}
function dishPartsText(k) { return Object.keys(DISHES[k].parts).map(g => nameOf(g).toLowerCase() + (goodSource(g) ? ' (' + goodSource(g) + ')' : '')).join(', '); }
// O brilho das páginas, só de perto: um papel amarelado que pisca.
function drawReceitas() {
  if (!worldOut) return;
  for (const s of receitaSpots()) {
    const d = Math.hypot(s.x - worldOut.x, s.y - worldOut.y); if (d > 300) continue;
    const a = (1 - d / 300) * (.6 + .4 * Math.sin(frameClock * 4 + s.x));
    ctx.save(); ctx.globalAlpha = Math.max(0, a);
    ellipse(s.x, s.y + 2, 20, 7, 'rgba(255,236,170,.35)');
    ctx.translate(s.x, s.y - 6); ctx.rotate(-.18); rect(-11, -8, 22, 15, '#f0e2b8', 2, '#8a6a3a'); for (let k = 0; k < 3; k++) rect(-7, -4 + k * 4, 14, 1, '#9a8060');
    ctx.rotate(.18); for (let k = 0; k < 3; k++) { const ang = frameClock * 2.4 + k * 2.1; rect(Math.cos(ang) * 18 - 2, -6 + Math.sin(ang) * 9 - 2, 4, 4, '#ffe27a', 1); }
    ctx.restore();
  }
}
// No sótão do Valter, a escadinha encostada na parede (enquanto a página está lá em cima).
function drawSotao(layers) {
  if (worldOut?.map !== 'casa:valter' || receitaFound('pastel')) return;
  layers.push({ y: 300, draw: () => { for (const x of [352, 388]) rect(x, 200, 5, 100, '#7a5230', 2); for (let k = 0; k < 6; k++) rect(352, 210 + k * 16, 41, 4, '#8a6238', 1); } });
}

// ---------- Caderno (Guia e progresso) ----------
function cadernoDialog() {
  const rows = RECEITAS.map((r, n) => {
    if (!receitaFound(r.id)) return `<div class="supply caderno-page missing"><span class="icon"><span class="bag-emoji">📜</span></span><div><b>Página ${n + 1} · perdida</b><p>${r.hint}</p></div></div>`;
    const icon = r.dish ? itemIconHTML(r.dish) : itemIconHTML(r.id);
    const how = r.dish ? `Fogão do vô · ${money(DISHES[r.dish].price)} · leva ${dishPartsText(r.dish)}` : 'Bancada de montagem · ' + money(RECIPES[r.id].price);
    return `<div class="supply caderno-page"><span class="icon">${icon}</span><div><b>${receitaTitle(r)}</b><p class="vo-hand">“${r.note}”</p><p class="small-note">${how} · achada ${r.place}</p></div></div>`;
  }).join('');
  openDialog('Caderno de receitas do vô', `<p>Páginas achadas: <b>${receitasFound()}/${RECEITAS.length}</b>. Cada uma é um prato novo na bodega.</p><div class="store-list">${rows}</div><div class="actions"><button data-act="guide">Voltar ao guia</button><button class="primary" data-act="close">Fechar</button></div>`, 'caderno');
}

// ---------- Pratos do fogão ----------
function dishMissing(k) { return Object.entries(DISHES[k].parts).filter(([g, q]) => (G.stock[g] || 0) < q).map(([g]) => nameOf(g).toLowerCase()); }
function dishOpen(k) { return !!G.up.fogao && RECEITAS.some(r => r.dish === k && receitaFound(r.id)); }
function dishReady(k) { return dishOpen(k) && !dishMissing(k).length; }
function dishPool() { return DISH_KEYS.filter(dishReady); }
// O prato da mesa que espera há mais tempo, descontando os que já estão prontos na mão ou no apoio.
function fogaoTarget() {
  if (!G?.groups) return null;
  const ready = {}; for (const i of [...(G.hands || []), ...(G.kitchen?.parking || [])]) if (i && DISHES[i.pid]) ready[i.pid] = (ready[i.pid] || 0) + 1;
  const list = []; for (const g of G.groups) if (g.state === 'seated') for (const d of g.diners || []) if (d.status === 'waiting') for (const k of d.orders) if (DISHES[k]) list.push({ k, p: d.patience });
  list.sort((a, b) => a.p - b.p);
  for (const o of list) { if (ready[o.k] > 0) { ready[o.k]--; continue; } return o.k; }
  return null;
}
function startFogao() {
  if (!freeHand()) { say('Libere uma mão para pegar o prato.'); return; }
  const k = fogaoTarget(); if (!k) { say('Nenhuma mesa pediu prato do caderno do vô agora.'); return; }
  const miss = dishMissing(k); if (miss.length) { say('Falta ' + miss.join(', ') + ' para ' + nameOf(k).toLowerCase() + '.'); AudioEngine.bad(); return; }
  G.task = { type: 'fogao', target: 'fogao', time: 0, dish: k };
}
function finishFogao() {
  const t = G.task; G.task = null; const k = t.dish; if (dishMissing(k).length || !freeHand()) return;
  let cost = 0; for (const [g, q] of Object.entries(DISHES[k].parts)) { cost += (G.avg[g] ?? GOODS[g].cost) * q; G.stock[g] -= q; }
  putHeld({ id: G.next++, kind: 'product', pid: k, key: k, ready: true, cost, sealed: false });
  AudioEngine.glass(); effect(nameOf(k) + '!', G.player.x, G.player.y - 100, '#d8ffac'); burst(G.player.x, G.player.y - 50); save();
}
// Fogão de ferro a lenha: chapa com duas bocas, fornalha acesa e a chaminé subindo.
function drawFogao(f) {
  const { x, y, w, h } = f, cooking = G.task?.type === 'fogao', glowA = cooking ? .55 + .2 * Math.sin(frameClock * 9) : .25;
  ellipse(x + w / 2, y + h + 2, w * .55, 8, '#1c140c55');
  rect(x + w - 18, y - 70, 12, 76, '#2a2a2e', 3); rect(x + w - 21, y - 74, 18, 6, '#3a3a40', 2);
  rect(x, y + 8, w, h - 8, '#2c2c30', 6, '#141416'); rect(x + 4, y + 2, w - 8, 12, '#4a4a50', 3, '#1e1e22');
  for (const bx of [x + 22, x + w - 26]) { ellipse(bx, y + 8, 10, 4, '#1e1e22'); ellipse(bx, y + 8, 6, 2.4, '#3a3a40'); }
  rect(x + 12, y + 26, w - 24, h - 34, '#1a1a1c', 4, '#5a5a60');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + w / 2, y + h - 12, 34, glowA, '255,140,50'); ctx.restore();
  for (let k = 0; k < 3; k++) ellipse(x + w / 2 - 10 + k * 10, y + h - 14 + Math.sin(frameClock * 8 + k) * 1.5, 4, 6, k % 2 ? '#ffb030' : '#ff6a20');
  if (cooking) {
    ellipse(x + 22, y + 4, 16, 6, '#3a3a40'); rect(x + 4, y + 2, 10, 3, '#3a3a40'); food(G.task.dish, x + 22, y - 2, 24);
    for (let k = 0; k < 3; k++) { const a = (frameClock * 1.4 + k * .33) % 1; ellipse(x + 18 + k * 6, y - 8 - a * 26, 4 + a * 6, 3 + a * 4, `rgba(240,240,235,${.5 * (1 - a)})`); }
    bar(x - 3, y - 30, w + 6, Math.min(1, G.task.time / DISHES[G.task.dish].time));
  }
}

// ---------- Cardápio das mesas ----------
// Com prato do caderno liberado e ingrediente na despensa, uma parte das mesas pede ele no lugar do primeiro item.
function dishOrders(orders, g) {
  const pool = dishPool(); if (!pool.length || G.event.id === 'campeonato' || isCampo() || g?.training) return orders;
  if (Math.random() < .3) orders[0] = pick(pool);
  return orders;
}

// ---------- Ligações (depois que todos os arquivos carregam: game.js e renderer.js vêm depois deste) ----------
document.addEventListener('DOMContentLoaded', () => {
  const orders = tableOrders; tableOrders = function (g) { return dishOrders(orders(g), g); };
  const next = orderNext; orderNext = function (d, g) {
    const k = d.later?.[0]; if (!DISHES[k]) return next(d, g);
    d.later.shift(); if (!dishReady(k)) return next(d, g);
    d.orders = [k]; d.status = 'waiting'; d.patience = d.maxPatience = Math.round(ORDER_WAIT * difficulty().patience * 1.2);
  };
  const serv = unservable; unservable = function (k, n = 1) { return DISHES[k] ? !dishReady(k) && !preparedUnits(k) && G.task?.type !== 'fogao' : serv(k, n); };
  const inter = interact; interact = function () {
    if (started && !paused && !modal && !phoneOpen && !G.task && !worldOut && nearest()?.id === 'fogao') { startFogao(); return; }
    inter();
  };
  const hold = holdTick; holdTick = function (dt) { hold(dt); const t = G.task; if (t?.type === 'fogao' && t.time >= DISHES[t.dish].time) finishFogao(); };
  const station = drawNewStation; drawNewStation = function (f) { if (f.id === 'fogao') { drawFogao(f); return true; } return station(f); };
  const secrets = drawSecrets; drawSecrets = function () { secrets(); drawReceitas(); };
  const hint = hintText; hintText = function (n) { if (!worldOut && n?.id === 'fogao') { const k = fogaoTarget(); return k ? '<strong>Segure E</strong> preparar ' + nameOf(k).toLowerCase() + (dishMissing(k).length ? ' · falta ' + dishMissing(k).join(', ') : '') : 'Fogão do vô · nenhuma mesa pediu prato do caderno'; } return hint(n); };
  for (const id of ['vila', 'serra', 'sc', 'casa:valter', 'casa:badin']) {
    const M = WORLD_MAPS[id], spots = M.spots, draw = M.draw;
    M.spots = function () { return [...spots.call(this), ...receitaSpots(id)]; };
    if (id === 'casa:valter') M.draw = function (view, seen, layers) { draw.call(this, view, seen, layers); drawSotao(layers); };
  }
});
