// Os enfeites da casa do Sadi e a recompensa da missão final.
//   · A fogueira da libertação (a última missão) deixa presentes: costela, caldo, canha e bomba no bornal, munição pras
//     armas de longe e cinco enfeites pra casa: a mesa campeira com chimarrão, a poltrona de couro com pelego, o cavalete
//     com a sela e o laço, o tapete de lã e a lança dos Lanceiros Negros.
//   · Personalizar: na estante de "Coleções e retratos", cada enfeite que o Sadi tem pode ficar à mostra ou guardado.
//     A mesa, a poltrona e o cavalete ocupam lugar (o Sadi contorna); o tapete fica no chão.
// Os desenhos são da mesma folha dos móveis da casa (home-furniture-v1).
'use strict';

// Posição (pé do enfeite, no desenho da casa), largura no desenho e o quadro da folha.
const CASA_ENFEITES = [
  { id: 'tapete', name: 'Tapete de lã', icon: '🟥', frame: 8, at: [850, 712], w: 370, chao: true, desc: 'Lã de ovelha tingida, com o losango campeiro no meio. Presente da roda de fogo.' },
  { id: 'mesa_mate', name: 'Mesa campeira com chimarrão', icon: '🧉', frame: 3, at: [1160, 612], w: 250, pe: [250, 56], desc: 'Mesa de madeira com dois mochos, a cuia e a térmica de sempre.' },
  { id: 'poltrona', name: 'Poltrona de couro com pelego', icon: '🪑', frame: 7, at: [1370, 700], w: 175, pe: [170, 48], desc: 'Couro cru e pelego de ovelha, pra sentar perto do fogão.' },
  { id: 'cavalete', name: 'Cavalete com sela e laço', icon: '🐎', frame: 5, at: [520, 760], w: 195, pe: [190, 44], desc: 'A sela de campanha e o laço trançado, prontos pra próxima tropeada.' },
  { id: 'lanca', name: 'Lança dos Lanceiros Negros', icon: '🔱', at: [1445, 575], pe: [24, 14], desc: 'Uma das lanças fincadas em roda no acampamento dos lanceiros. Deixaram contigo, em confiança.' }
];
function casaState() { const c = G.casa ??= {}; c.tem ??= {}; c.mostra ??= {}; return c; }
function casaTem(id) { return !!casaState().tem[id]; }
function casaMostra(id) { const c = casaState(); return casaTem(id) && c.mostra[id] !== false; }
function casaGanha(ids) { const c = casaState(); for (const id of ids) { c.tem[id] ??= G.day; c.mostra[id] ??= true; } save(); }
// A caixa do enfeite no mapa da casa (canto de cima e tamanho), a partir do pé e da largura no desenho.
function casaCaixa(e) {
  const meta = CAMPEIRA_CROPS['home-furniture-v1'].frames[e.frame], w = e.w * HOME_SCENE.scale, h = w * meta[3] / meta[2], p = homePoint(...e.at);
  return { x: p.x - w / 2, y: p.y - h, w, h };
}
function casaPe(e) { if (!e.pe) return null; const p = homePoint(...e.at), s = HOME_SCENE.scale; return { x: p.x - e.pe[0] * s / 2, y: p.y - e.pe[1] * s, w: e.pe[0] * s, h: e.pe[1] * s }; }
function drawCasaEnfeite(e) {
  if (e.id === 'lanca') { const p = homePoint(...e.at); drawPampaLanca({ x: p.x, y: p.y }); return; }
  const b = casaCaixa(e); if (!e.chao) ellipse(b.x + b.w / 2, b.y + b.h - 4, b.w * .42, 9, '#1c140c55');
  campeiraSprite('home-furniture-v1', e.frame, b.x, b.y, b.w, b.h);
}

// ---------- Personalizar, na estante das coleções ----------
function casaSecaoHTML() {
  const lista = CASA_ENFEITES.filter(e => casaTem(e.id));
  if (!lista.length) return '<h3>Enfeites da casa</h3><p class="small-note">Ainda nenhum. Dizem que quem fecha a história com uma fogueira na frente da bodega ganha presente pra casa.</p>';
  return `<h3>Enfeites da casa · ${lista.length}</h3><p class="small-note">Escolha o que fica à mostra. O que for guardado volta quando quiser.</p><div class="store-list">${lista.map(e => `<div class="supply"><span class="icon"><span class="bag-emoji">${e.icon}</span></span><div><b>${e.name}</b><p>${e.desc}</p></div><button class="${casaMostra(e.id) ? '' : 'primary'}" data-act="casaEnfeite" data-id="${e.id}">${casaMostra(e.id) ? 'Guardar' : 'Pôr à mostra'}</button></div>`).join('')}</div>`;
}
function casaAlterna(id) {
  if (!casaTem(id)) return; const c = casaState(); c.mostra[id] = !casaMostra(id);
  // Não deixa o Sadi preso dentro do móvel que acabou de aparecer.
  if (worldOut?.map === 'casa:sadi' && !homeMap.canWalk(worldOut.x, worldOut.y)) { const sp = homeMap.spawn(); worldOut.x = sp.x; worldOut.y = sp.y; }
  AudioEngine.tick?.(); save(); homeCollectionsMenu();
}

// ---------- A recompensa da missão final ----------
const FOGUEIRA_PRESENTES = { bornal: { costela: 4, caldo: 4, canha: 2, bomba: 2 }, balas: 24, cartuchos: 20, casa: CASA_ENFEITES.map(e => e.id) };
{
  const m = MISSIONS.find(x => x.id === 'fogueira'); if (m) Object.assign(m.reward, FOGUEIRA_PRESENTES);
  const parts = rewardParts; rewardParts = function (rw = {}) {
    const list = parts(rw);
    for (const [id, q] of Object.entries(rw.bornal || {})) { const it = MATA_ITEMS.find(i => i.id === id); if (it) list.push(['🎒', q + ' × ' + it.name.toLowerCase() + ' no bornal']); }
    if (rw.balas) list.push(['🎯', rw.balas + ' balas .38']);
    if (rw.cartuchos) list.push(['🎯', rw.cartuchos + ' cartuchos de carabina']);
    for (const id of rw.casa || []) { const e = CASA_ENFEITES.find(x => x.id === id); if (e) list.push(['🏠', e.name + ' pra enfeitar a casa']); }
    return list;
  };
  const grant = grantReward; grantReward = function (rw = {}) {
    const bag = mataBag();
    for (const [id, q] of Object.entries(rw.bornal || {})) bag[id] = Math.min(Math.max(bag[id] || 0, mataBagMax(id)), (bag[id] || 0) + q);
    if (rw.balas) rangedAddBalas(rw.balas);
    if (rw.cartuchos && typeof carabinaAdd === 'function') carabinaAdd(rw.cartuchos);
    if (rw.casa?.length) casaGanha(rw.casa);
    mataBeltRefresh?.();
    return grant(rw);
  };
}

// ---------- Ligações ----------
{
  const draw = homeMap.draw; homeMap.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers);
    for (const e of CASA_ENFEITES) if (casaMostra(e.id)) layers.push({ y: e.chao ? -1e9 : homePoint(...e.at).y, draw: () => drawCasaEnfeite(e) });
  };
  const walk = homeMap.canWalk; homeMap.canWalk = function (x, y) {
    for (const e of CASA_ENFEITES) { if (!casaMostra(e.id)) continue; const r = casaPe(e); if (r && x > r.x - 10 && x < r.x + r.w + 10 && y > r.y && y < r.y + r.h + 6) return false; }
    return walk(x, y);
  };
  const menu = homeCollectionsMenu; homeCollectionsMenu = function () { menu(); $('dialogContent')?.insertAdjacentHTML('afterbegin', casaSecaoHTML()); };
  const act = action; action = function (name, id) { if (name === 'casaEnfeite') { casaAlterna(id); return; } return act(name, id); };
}
