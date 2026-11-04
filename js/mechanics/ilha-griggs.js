// O acampamento da entrada da ilha e a bomba de pólvora.
//   · Ao lado do trapiche, a alma de John Griggs, o marinheiro americano que lutou com os farrapos: na travessia de 1839
//     ele comandou o lanchão Seival, e morreu na batalha de Laguna, em 15 de novembro. Quando soube que levaram o Bento,
//     veio atrás e acampou no trapiche. Vende o que serve pra subir a ilha: a bomba de pólvora, o chá de marcela, a
//     carqueja, as balas do 38 e os cartuchos da carabina. E faz, com o que o Sadi junta na ilha, o que pega nos bichos
//     dela: o facão de prata, a reza de sal e arruda, o arpão, a carabina e o sabre; e afia com prata o facão e o arpão
//     (veja "A cerração protege os bichos", mais abaixo). A prata vem dos baús de pirata.
//   · Bomba de pólvora (no bornal, teclas 1 a 5): o Sadi joga na frente (ou no bicho mais perto, na frente dele); ela cai,
//     chia um instante e estoura numa roda. Fere todo bicho em volta, inclusive chefe, e tira o minhocão de debaixo da
//     terra e o afogado de dentro d'água.
'use strict';

const BOMBA = { cost: 40, dmg: 70, r: 140, voo: .55, pavio: .3, alcance: 360, longe: 260 };
MATA_ITEMS.push({ id: 'bomba', name: 'Bomba de pólvora', icon: '💣', cost: BOMBA.cost, griggs: true, desc: 'Joga na frente e estoura numa roda: fere todo bicho em volta e tira o minhocão de debaixo da terra.' });
const GRIGGS = { x: 2560, y: 4700, tent: { x: 2440, y: 4645 }, barris: [[2650, 4622], [2694, 4648], [2640, 4668]], subir: { x: 2300, y: 4700 } };

// ---------- A bomba ----------
const ilhaBombas = [], ilhaEstouros = [];
function bombaJoga() {
  const p = worldOut, N = mataNight; let dx = p.dx || 0, dy = p.dy || 0; if (!dx && !dy) dx = 1; const k = Math.hypot(dx, dy); dx /= k; dy /= k;
  const alvo = (N?.beasts || []).filter(b => b.hp > 0).map(b => ({ b, d: Math.hypot(b.x - p.x, b.y - p.y) })).filter(o => o.d < BOMBA.alcance && (o.b.x - p.x) * dx + (o.b.y - p.y) * dy > 0).sort((a, c) => a.d - c.d)[0];
  ilhaBombas.push({ map: p.map, x0: p.x, y0: p.y - 60, tx: alvo ? alvo.b.x : p.x + dx * BOMBA.longe, ty: alvo ? alvo.b.y : p.y + dy * BOMBA.longe, t: 0, alvo: alvo?.b });
  AudioEngine.swoosh?.(.06);
}
function bombaTick(dt) {
  // No ar, a bomba vai atrás do bicho visado (o minhocão anda debaixo da terra); no chão, fica parada chiando.
  for (const o of ilhaBombas) { o.t += dt; if (o.alvo?.hp > 0 && o.t < BOMBA.voo) { o.tx = o.alvo.x; o.ty = o.alvo.y; } if (o.t >= BOMBA.voo + BOMBA.pavio) { o.done = true; if (worldOut?.map === o.map) bombaEstoura(o.tx, o.ty); } }
  for (let i = ilhaBombas.length - 1; i >= 0; i--) if (ilhaBombas[i].done || ilhaBombas[i].map !== worldOut?.map) ilhaBombas.splice(i, 1);
  for (const e of ilhaEstouros) e.t -= dt; for (let i = ilhaEstouros.length - 1; i >= 0; i--) if (ilhaEstouros[i].t <= 0) ilhaEstouros.splice(i, 1);
}
function bombaEstoura(x, y) {
  ilhaEstouros.push({ x, y, t: .45, map: worldOut.map }); fxPuffs(x, y - 20, 22, 200, '#c8b8a0'); fxPuffs(x, y - 10, 12, 120, '#ffb050');
  AudioEngine.gunshot?.(1.3, .5); AudioEngine.caveCrumble?.(); AudioEngine.thud?.();
  const N = mataNight; if (!N) return;
  for (const b of N.beasts) {
    if (b.hp <= 0 || Math.hypot(b.x - x, (b.y - y) * 1.2) > BOMBA.r) continue;
    // Debaixo da terra ou da água, o estouro tira o bicho pra fora.
    if (b.kind === 'minhocao' && ILHA_MOBS.minhocao.immune(b)) { b.state = 'exposto'; b.t = 2.6; }
    if (b.kind === 'afogado' && ILHA_MOBS.afogado.immune(b)) { b.state = 'chase'; b.rise = 1; }
    b.hp -= BOMBA.dmg; b.hurt = .3; effect('−' + BOMBA.dmg, b.x + (Math.random() - .5) * 20, b.y - 90, '#ffb070', 22); fxStars(b.x, b.y - 50, 3);
    if (b.state === 'windup' || b.state === 'lunge') { b.state = 'rest'; b.t = .8; }
    if (b.hp <= 0) mataKill(b);
  }
}
function drawBombas() {
  const map = worldOut?.map;
  for (const o of ilhaBombas) {
    if (o.map !== map) continue; const k = Math.min(1, o.t / BOMBA.voo), x = o.x0 + (o.tx - o.x0) * k, y = o.y0 + (o.ty - o.y0) * k - Math.sin(k * Math.PI) * 120;
    ellipse(o.tx, o.ty + 2, 12, 4, 'rgba(0,0,0,.3)'); ellipse(x, y, 11, 11, '#1e1c1a'); ellipse(x - 3, y - 3, 3, 3, '#6a6660'); rect(x + 4, y - 15, 3, 7, '#8a6a3a');
    const fa = .6 + .4 * Math.sin(frameClock * 40); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x + 5, y - 16, 12, fa, '255,200,90'); ctx.restore();
  }
  for (const e of ilhaEstouros) { if (e.map !== map) continue; const k = 1 - e.t / .45; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(e.x, e.y - 30, BOMBA.r * (.6 + k), .7 * (1 - k), '255,170,70'); ctx.restore(); ctx.save(); ctx.strokeStyle = `rgba(255,220,160,${.8 * (1 - k)})`; ctx.lineWidth = 5; ctx.beginPath(); ctx.ellipse(e.x, e.y, BOMBA.r * k, BOMBA.r * k * .7, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore(); }
}

// ---------- John Griggs ----------
ILHA_LOOKS.griggs = { look: { skin: '#e8c8a8', hair: '#c8904a', style: 'short', sideburns: true, hat: 'brim', hatColor: '#2a2a3a', coat: '#26304a', shirt: '#ece4d4', pants: '#d8d0c0', boots: '#1a1410' }, tint: 'rgba(150,200,255,.3)' };
let griggsPortraitURL = null;
function griggsPortrait(size = 104) {
  if (!griggsPortraitURL) { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.fillStyle = '#1e3448'; g.fillRect(0, 0, 96, 96); g.drawImage(ilhaGhost('griggs'), 60, 110, 120, 120, 0, 0, 96, 96); try { griggsPortraitURL = c.toDataURL(); } catch (_) { return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px">⚓</span>`; } }
  return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px;display:grid;place-items:center;overflow:hidden"><img src="${griggsPortraitURL}" width="${size}" height="${size}" alt=""></span>`;
}
function griggsSpeaker() { return { name: 'John Griggs', portrait: griggsPortrait() }; }
function drawGriggs(x, y, dx) {
  const c = ilhaGhost('griggs'), bob = Math.sin(frameClock * 1.6 + x) * 3;
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 80 + bob, 110, .2, '140,190,255'); ctx.restore();
  ellipse(x, y + 3, 24, 7, 'rgba(10,14,8,.3)'); ctx.save(); ctx.globalAlpha = .86; ctx.translate(x, y - 8 + bob); if (dx < 0) ctx.scale(-1, 1); ctx.drawImage(c, -60, -220, 120, 230); ctx.restore();
}
function drawGriggsCamp(seen, layers) {
  const G0 = GRIGGS, t = G0.tent; if (!seen(G0.x, G0.y, 500)) return;
  layers.push({ y: t.y, draw: () => { if (!mataNature(10, t.x, t.y, 220, 180)) rect(t.x - 100, t.y - 120, 200, 120, '#c8b890'); } });
  for (const [x, y] of G0.barris) layers.push({ y, draw: () => { ellipse(x, y + 3, 22, 8, 'rgba(10,8,6,.35)'); rect(x - 18, y - 36, 36, 38, '#5a3a20', 7, '#2e1c0e'); rect(x - 18, y - 28, 36, 4, '#2a2a2a'); rect(x - 18, y - 12, 36, 4, '#2a2a2a'); ellipse(x, y - 36, 18, 6, '#6a4628'); txt('P', x, y - 18, 11, '#e8d8b0', 'center', 'Georgia', false); } });
  // A bandeira farroupilha num mastro de remo.
  layers.push({ y: t.y + 10, draw: () => { const fx = t.x + 120, fy = t.y + 10; rect(fx - 2, fy - 150, 4, 152, '#5a3a20'); const w = Math.sin(frameClock * 3) * 3; ctx.save(); ctx.translate(fx + 2, fy - 148); ctx.fillStyle = '#2a8a3a'; ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(60, w); ctx.lineTo(0, 40); ctx.closePath(); ctx.fill(); ctx.fillStyle = '#f0d020'; ctx.beginPath(); ctx.moveTo(60, w); ctx.lineTo(60, 40 + w); ctx.lineTo(0, 40); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#d42a2a'; ctx.lineWidth = 9; ctx.beginPath(); ctx.moveTo(0, 40); ctx.lineTo(60, w); ctx.stroke(); ctx.restore(); } });
  layers.push({ y: G0.y, draw: () => drawGriggs(G0.x, G0.y, worldOut && worldOut.x < G0.x ? -1 : 1) });
}
function griggsSolid(x, y) { const t = GRIGGS.tent; return inRect({ x: t.x - 95, y: t.y - 60, w: 190, h: 60 }, x, y) || GRIGGS.barris.some(([bx, by]) => Math.hypot(x - bx, (y - by) * 1.3) < 26) || Math.hypot(x - t.x - 120, (y - t.y - 10) * 1.4) < 10; }
const GRIGGS_FALAS = [
  'Arpão de baleeiro atravessa bernúncia de ponta a ponta. Traz garapuvu e corrente de afogado, que eu monto.',
  'Os marinheiros lá de cima usam sabre de abordagem. Traz os pedaços que eu refaço um pra ti.',
  'Quem manda na fortaleza é o Grenfell, um inglês, almirante do Império. Se ele subir na muralha, só o arpão tira ele de lá.',
  'Bala comum passa por alma que nem vento. A carabina que eu monto, não: coronha de garapuvu, ferragem de corrente e mira de prata.',
  'Bruxa foge de quem chega perto. Com o arpão tu puxa ela pra boca do facão.',
  'Os piratas enterravam prata em baú no fim dos ramais da mata. Procura o brilho no escuro.',
  'Tem arruda na horta da capela velha, a oeste, e sal grosso nos ranchos de pescador e nas pedras da praia.',
  'Pólvora seca é ouro, gaúcho. Guarda pra hora do aperto.',
  'Bruxa não gosta de estouro: joga a bomba e ela some.',
  'O minhocão cava por baixo da terra. Uma bomba em cima do chão tremendo e ele sai, querendo ou não.',
  'No mar, a gente dizia: quem não tem pólvora, reza. Aqui é igual.',
  'O Garibaldi falava de ti. Disse que tu sobe em convés de navio fantasma sem tremer.'
];
function griggsTalk() {
  const st = ilhaState(), N = griggsSpeaker();
  if (!st.griggs) {
    st.griggs = G.day; save();
    talk([[N, 'Hello, gaúcho! John Griggs, americano de nascença e farrapo de coração. Às ordens.'],
      ['sadi', 'Mais um fantasma de farrapo?'],
      [N, 'Na travessia de 1839, quando o Garibaldi levou os barcos por terra, quem comandava o Seival era eu. E fiquei em Laguna, no 15 de novembro: bala de canhão do Império.'],
      [N, 'Quando soube que levaram o Bento, vim atrás. Acampei aqui no trapiche, que daqui pra cima a ilha é deles.'],
      [N, 'Mas escuta: a cerração protege os bichos da ilha. Facão e bala comum quase não pegam neles. Traz a prata dos baús de pirata, que eu ponho no fio do teu facão.'],
      ['sadi', 'Pois eu vou precisar de tudo isso.']], griggsShop, 'Ver o que ele tem');
    return;
  }
  talk([[N, pick(GRIGGS_FALAS)]], griggsShop, 'Ver o que ele tem');
}
function griggsShop() {
  if (worldOut?.map !== 'ilha') return; skipWorldTalk();
  const bag = mataBag(), max = mataBagMax(), own = rangedOwned('revolver38'), full = rangedBalas() >= BALAS.max, ownC = rangedOwned('carabina'), fullC = carabinaBalas() >= CARABINA.max, box = $('dialogContent').closest('.dialog'), keep = modal === 'griggsShop' ? box.scrollTop : 0;
  const itens = ['bomba', 'marcela', 'carqueja'].map(id => MATA_ITEMS.find(i => i.id === id)).map(i => { const have = bag[i.id] || 0, room = max - have; return forjaCard(mataGearHTML(i.id), i.name + ` <small>· ${have}/${max}</small>`, i.desc, '', `<button class="primary" data-act="griggsItem" data-id="${i.id}" ${room > 0 && hasCash(i.cost) ? '' : 'disabled'}>${room > 0 ? 'Comprar · ' + money(i.cost) : 'Cheio'}</button>`); }).join('');
  const balas = forjaCard(rangedIcon('balas'), 'Caixa de balas .38', BALAS.box + ' balas, secas, embrulhadas em lona de vela.', `<small>Na guaiaca: ${rangedBalas()}/${BALAS.max}</small>`, `<button class="primary" data-act="griggsBalas" ${own && !full && hasCash(BALAS.cost) ? '' : 'disabled'}>${!own ? 'Antes, o revólver (Garibaldi ou São Dunstano)' : full ? 'Guaiaca cheia' : 'Comprar · ' + money(BALAS.cost)}</button>`);
  const cartuchos = forjaCard(rangedIcon('cartuchos'), 'Caixa de cartuchos', CARABINA.box + ' cartuchos de carabina, de papel encerado.', `<small>Na guaiaca: ${carabinaBalas()}/${CARABINA.max}</small>`, `<button class="primary" data-act="griggsCartuchos" ${ownC && !fullC && hasCash(CARABINA.cost) ? '' : 'disabled'}>${!ownC ? 'Antes, a carabina' : fullC ? 'Guaiaca cheia' : 'Comprar · ' + money(CARABINA.cost)}</button>`);
  openDialog('Acampamento do John Griggs', `<div class="rpg-speaker">${griggsPortrait(72)}<div><p><b>John Griggs</b></p><p>${pick(GRIGGS_FALAS)}</p></div></div>
    <div class="forja-top"><span>❤ ${Math.round(caveState().hp)}/${caveMaxHp()}</span><span>💰 ${money(G.cash)}</span></div>
    <p class="small-note">Na ilha, as teclas <b>1 a 5</b> usam o que tá no bornal (até ${max} de cada${caveUp('bornal') ? '' : '; o bornal de couro cru da ferraria dobra'}).</p>
    ${griggsReceitasHTML()}
    ${griggsAfiarHTML()}
    <h3 class="forja-sec">🎒 Pro bornal <small>pra subir a ilha</small></h3><div class="store-list">${itens}</div>
    <h3 class="forja-sec">🎯 Munição <small>a bala acaba</small></h3><div class="store-list">${balas}${cartuchos}</div>`, 'griggsShop');
  box.scrollTop = keep;
}
function griggsItem(id) {
  const i = MATA_ITEMS.find(x => x.id === id), bag = mataBag(); if (!i || (bag[id] || 0) >= mataBagMax() || !hasCash(i.cost)) return;
  spendCash(i.cost); bag[id] = (bag[id] || 0) + 1; AudioEngine.coins?.(); save(); refreshHUD(); mataBeltRefresh(); griggsShop();
}
function griggsBalas() { if (!rangedOwned('revolver38') || rangedBalas() >= BALAS.max || !hasCash(BALAS.cost)) return; spendCash(BALAS.cost); rangedAddBalas(BALAS.box); AudioEngine.coins?.(); save(); refreshHUD(); griggsShop(); }

// ---------- Ligações ----------
{
  const M = WORLD_MAPS.ilha, walk = M.canWalk, spots = M.spots, draw = M.draw;
  M.canWalk = function (x, y) { return walk.call(this, x, y) && !griggsSolid(x, y); };
  M.spots = function () { const list = spots.call(this); list.push({ id: 'ilha:griggs', x: GRIGGS.x, y: GRIGGS.y + 34, radius: 100, label: 'Prosear e comprar com o John Griggs', act: griggsTalk }); return list; };
  M.draw = function (view, seen, layers) { draw.call(this, view, seen, layers); drawGriggsCamp(seen, layers); };
  // A bomba vai no bornal, como o chá e o tição (o Garibaldi não vende: é pólvora do Griggs).
  const use = mataUseItem; mataUseItem = function (id) {
    if (id === 'reza') return ilhaReza();
    if (id !== 'bomba') return use(id);
    const bag = mataBag(); if (!(bag.bomba > 0) || !mataHere() || !mataCombatOn() || scene || modal) return false;
    bombaJoga(); bag.bomba--; if (bag.bomba <= 0) delete bag.bomba; save(); mataBeltRefresh(); return true;
  };
  const gear = mataGearHTML, emoji = { bomba: '💣', reza: '🙏' }; mataGearHTML = function (id, size = 64) { return emoji[id] ? `<span class="mata-item-art" style="display:inline-flex;width:${size}px;height:${size}px;align-items:center;justify-content:center;font-size:${Math.round(size * .62)}px">${emoji[id]}</span>` : gear(id, size); };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (!paused && !modal && !scene) bombaTick(dt); };
  const sparks = drawSparks; drawSparks = function (map = null) { if (map && map === worldOut?.map) drawBombas(); sparks(map); };
  const act = action; action = function (name, id) {
    if (name === 'griggsItem') { griggsItem(id); return; }
    if (name === 'griggsBalas') { griggsBalas(); return; }
    if (name === 'griggsFaz') { griggsFaz(id); return; }
    if (name === 'griggsAfia') { griggsAfia(id); return; }
    if (name === 'griggsCartuchos') { griggsCartuchos(); return; }
    return act(name, id);
  };
}

// ---------- A cerração protege os bichos ----------
// Os bichos da ilha são assombração: arma comum quase não pega. Na parte de baixo da ilha um pouco menos; na mata da
// cerração, na fortaleza e na masmorra, bem menos. O facão de prata e as armas feitas na ilha (arpão, carabina, sabre)
// pegam cheio, a reza de sal e arruda benze tudo por um tempo, e a bomba e os poderes (o grito, o lunar, as gralhas)
// pegam sempre. O 38 e o bodoque só pegam cheio com a reza.
const ILHA_ARMAS = { praia: { mao: .6, tiro: .25 }, fundo: { mao: .35, tiro: .12 } };
function ilhaResiste() { if (!mataNight?.ilha) return null; return worldOut.map === 'ilha' && worldOut.y > PLANALTO.y + PLANALTO.face ? ILHA_ARMAS.praia : ILHA_ARMAS.fundo; }
// (benzido: o nome antigo do facão de prata, em save feito antes da troca.)
function ilhaFacaoPrata() { const st = ilhaState(); return !!(st.facaoPrata || st.benzido); }
function ilhaComDano(mult, fn) { const base = caveDmg; caveDmg = function () { return Math.max(1, Math.round(base() * mult)); }; try { return fn(); } finally { caveDmg = base; } }
function ilhaFraco() { const st = ilhaState(); if (st.dicaArma) return; st.dicaArma = G.day; save(); showBanner('Arma comum quase não pega', 'A cerração protege os bichos da ilha. O John Griggs, no trapiche, sabe o que fazer.', 'info', { world: true }); }

// ---------- O que se junta na parte de baixo da ilha ----------
Object.assign(BAG_RAW, {
  prata: { name: 'Moeda de prata', icon: '🪙', value: 6, note: 'Prata espanhola dos baús de pirata da ilha. O John Griggs põe no fio do facão, no arpão e na carabina.' },
  sal: { name: 'Sal grosso', icon: '🧂', value: 1, note: 'Dos ranchos de pescador e das pedras da praia da ilha. Com arruda, o Griggs faz a reza.' },
  arruda: { name: 'Ramo de arruda', icon: '🌿', value: 1, note: 'Da horta da capela antiga, na ilha. Espanta bruxa.' }
});
// Arruda na horta da capela, sal nos ranchos e nas pedras da praia, baús de pirata (com prata) pela beira da ilha.
// Tudo volta no outro dia. Mata adentro, nos ramais da cerração, tem baús maiores, que abrem uma vez só.
const ILHA_ACHADOS_DEF = [
  ...[[1430, 3790], [1510, 3840], [1620, 3860], [1730, 3810], [1790, 3740]].map(([x, y]) => ({ k: 'arruda', x, y })),
  { k: 'sal', x: 4540, y: 4300 }, { k: 'sal', x: 4840, y: 4330 }, ...[.95, 1.15, 2.15].map(a => ({ k: 'sal', a })),
  ...[2.5, -.6, .45, 1.35].map(a => ({ k: 'prata', a, q: 2 })),
  ...[[2350, 3650], [3650, 3450], [2700, 3150], [4050, 3050], [2000, 3300]].map(([x, y]) => ({ k: 'garapuvu', x, y }))
];
const ILHA_ACHADO_TXT = { arruda: 'Colher arruda', sal: 'Raspar sal grosso', prata: 'Abrir baú de pirata' };
let ilhaAchadosPos = null;
function ilhaAchados() {
  if (ilhaAchadosPos) return ilhaAchadosPos;
  return ilhaAchadosPos = ILHA_ACHADOS_DEF.map(d => {
    let x = d.x, y = d.y; if (d.a != null) { const k = ilhaK(d.a) - .045; x = ILHA.cx + Math.cos(d.a) * ILHA.rx * k; y = ILHA.cy + Math.sin(d.a) * ILHA.ry * k; }
    const at = ilhaSpotNear('ilha', x, y) || { x, y }; return { ...d, x: at.x, y: at.y, q: d.q || 1 };
  });
}
function ilhaAchadosDia() { const st = ilhaState(); if (st.achados?.day !== G.day) st.achados = { day: G.day, got: [] }; return st.achados.got; }
function ilhaColhe(i) {
  const a = ilhaAchados()[i], got = ilhaAchadosDia(); if (!a || got.includes(i)) return;
  got.push(i); bagAdd(a.k, a.q); effect('+' + a.q + ' ' + BAG_RAW[a.k].icon + ' ' + BAG_RAW[a.k].name.toLowerCase(), a.x, a.y - 80, '#e8f0c8', 16);
  if (a.k === 'prata') { AudioEngine.caveChestOpen?.(); fxStars(a.x, a.y - 30, 6); } else AudioEngine.pop?.(1400, .04, .04);
  save();
}
function drawAchado(a) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(a.x, a.y - 18, 26, .3 + .2 * Math.sin(frameClock * 4 + a.x), '255,250,210'); ctx.restore();
  if (a.k === 'arruda') { if (!mataNature(5, a.x, a.y, 56, 46)) ellipse(a.x, a.y - 16, 24, 16, '#4a7a2a'); for (let k = 0; k < 5; k++) ellipse(a.x - 14 + k * 7, a.y - 30 + (k % 2) * 8, 2.5, 2.5, '#e8d040'); }
  else if (a.k === 'garapuvu') { if (!mataNature(3, a.x, a.y, 120, 70)) rect(a.x - 50, a.y - 24, 100, 24, '#7a5634', 10); }
  else if (a.k === 'sal') { ellipse(a.x, a.y, 26, 8, 'rgba(0,0,0,.2)'); for (const [dx, dy, r] of [[-10, -6, 9], [8, -5, 10], [0, -14, 9], [-2, -4, 11]]) ellipse(a.x + dx, a.y + dy, r, r * .7, dy < -10 ? '#fbfaf6' : '#e2ded6'); }
  else { ellipse(a.x, a.y + 2, 30, 9, 'rgba(0,0,0,.3)'); rect(a.x - 24, a.y - 26, 48, 26, '#6a4426', 4, '#3a2414'); rect(a.x - 26, a.y - 34, 52, 12, '#7a5030', 5, '#3a2414'); rect(a.x - 26, a.y - 22, 52, 4, '#8a8a8a'); rect(a.x - 4, a.y - 26, 8, 10, '#c8b060', 2); }
}

// ---------- O que o Griggs faz ----------
MATA_ITEMS.push({ id: 'reza', name: 'Reza de sal e arruda', icon: '🙏', cost: 0, griggs: true, desc: 'Por 30 segundos, tudo que sai da tua mão pega cheio nos bichos da ilha, e a praga das bruxas não te pega.' });
const ILHA_RECEITAS = [
  { id: 'facao', name: 'Facão de prata', icon: '🔪', needs: { prata: 5 }, cost: 80, desc: 'O Griggs derrete a prata dos baús de pirata no fio da tua lâmina (facão, espada ou sabre): o golpe pega cheio nos bichos da ilha. Pra sempre. Depois, dá pra afiar com mais prata.' },
  { id: 'reza', name: 'Reza de sal e arruda', icon: '🙏', needs: { arruda: 1, sal: 1 }, cost: 0, desc: 'Vai pro bornal (teclas 1 a 5): por 30 segundos tudo que sai da tua mão pega cheio, e a praga das bruxas não te pega.' }
];
// Afiar com prata: cada fio no facão dá mais dano (em todo lugar); a ponta de prata faz o arpão bater mais forte.
const ILHA_FIO = { max: 3, facao: { dmg: 5, prata: [3, 5, 7], cost: [40, 80, 120] }, arpao: { base: .8, dmg: .35, prata: [2, 4, 6], cost: [30, 60, 90] }, bruxa: 1.5, preso: 1.6 };
function ilhaFio(id) { return ilhaState()['fio_' + id] || 0; }
function griggsEmoji(e) { return `<span class="mata-item-art" style="display:inline-flex;width:64px;height:64px;align-items:center;justify-content:center;font-size:40px">${e}</span>`; }
function griggsAfiarHTML() {
  const card = (id, name, icon, pode, antes, fx) => {
    const F = ILHA_FIO[id], lv = ilhaFio(id);
    if (lv >= ILHA_FIO.max) return forjaCard(icon, name + ' · +' + lv, 'Afiado ao máximo.', '', '<button disabled>✔ Máximo</button>', 'owned');
    const needs = { prata: F.prata[lv] }, cost = F.cost[lv], ok = pode && hasNeeds(needs) && hasCash(cost);
    return forjaCard(icon, name + ' · +' + (lv + 1), fx, reqChips(needs, cost), `<button class="primary" data-act="griggsAfia" data-id="${id}" ${ok ? '' : 'disabled'}>${!pode ? antes : ok ? 'Afiar · ' + money(cost) : 'Falta prata'}</button>`);
  };
  return `<h3 class="forja-sec">✨ Afiar com prata <small>cada fio, mais dano</small></h3><div class="store-list">${card('facao', 'Fio de prata no facão', griggsEmoji('🔪'), ilhaFacaoPrata(), 'Antes, o facão de prata', '+' + ILHA_FIO.facao.dmg + ' de dano na lâmina que tá na mão, em todo lugar.')}${card('arpao', 'Ponta de prata no arpão', rangedIcon('arpao'), rangedOwned('arpao'), 'Antes, o arpão', 'O arpão bate mais forte. Bom contra bruxas.')}</div>`;
}
function griggsAfia(id) {
  const F = ILHA_FIO[id], lv = ilhaFio(id); if (!F?.prata || lv >= ILHA_FIO.max || !(id === 'facao' ? ilhaFacaoPrata() : rangedOwned('arpao'))) return;
  const needs = { prata: F.prata[lv] }, cost = F.cost[lv]; if (!hasNeeds(needs) || !hasCash(cost)) return;
  takeNeeds(needs); spendCash(cost); ilhaState()['fio_' + id] = lv + 1; AudioEngine.caveAnvil?.(); AudioEngine.coins?.(); save(); refreshHUD();
  worldSay(id === 'facao' ? `O Griggs passa mais prata no fio e bate na pedra: a lâmina tá com ${caveDmg()} de dano.` : 'O Griggs refaz a ponta do arpão em prata: agora entra mais fundo, e bruxa nenhuma escapa.');
  griggsShop();
}
function griggsReceitasHTML() {
  const bag = mataBag(), max = mataBagMax();
  const card = r => {
    let extra = '', off = !hasNeeds(r.needs) || !hasCash(r.cost), label = 'Fazer' + (r.cost ? ' · ' + money(r.cost) : '');
    if (r.id === 'facao' && ilhaFacaoPrata()) { off = true; label = '✔ Já é de prata'; }
    if (r.id === 'reza') { extra = ` <small>· ${bag.reza || 0}/${max}</small>`; if ((bag.reza || 0) >= max) { off = true; label = 'Bornal cheio'; } }
    if (['arpao', 'carabina', 'sabre'].includes(r.id) && ilhaArmaFeita(r.id)) { off = true; label = '✔ Já é teu'; }
    return forjaCard(RANGED_ART[r.id] ? rangedIcon(r.id) : griggsEmoji(r.icon), r.name + extra, r.desc, reqChips(r.needs, r.cost), `<button class="primary" data-act="griggsFaz" data-id="${r.id}" ${off ? 'disabled' : ''}>${label}</button>`);
  };
  const tem = ['prata', 'arruda', 'sal', 'garapuvu', 'corrente_ferro', 'sabre_peca'].filter(k => k === 'prata' || bagQty(k) >= 1).map(k => (typeof islandItemIcon === 'function' ? islandItemIcon(k,22) : BAG_RAW[k].icon) + ' ' + Math.floor(bagQty(k)) + ' ' + BAG_RAW[k].name.toLowerCase()).join(' · ');
  return `<h3 class="forja-sec">⚒️ Pedir pro Griggs fazer <small>com o que tu junta na ilha</small></h3><p class="small-note">Contigo: ${tem}.</p><div class="store-list">${ILHA_RECEITAS.map(card).join('')}</div>`;
}
function griggsFaz(id) {
  const r = ILHA_RECEITAS.find(x => x.id === id), st = ilhaState(), bag = mataBag(); if (!r || !hasNeeds(r.needs) || !hasCash(r.cost)) return;
  if (id === 'facao') { if (ilhaFacaoPrata()) return; st.facaoPrata = G.day; }
  else if (id === 'reza') { if ((bag.reza || 0) >= mataBagMax()) return; bag.reza = (bag.reza || 0) + 1; mataBeltRefresh(); }
  else if (['arpao', 'carabina', 'sabre'].includes(id)) { if (ilhaArmaFeita(id)) return; ilhaArmaFaz(id); }
  takeNeeds(r.needs); if (r.cost) spendCash(r.cost); AudioEngine.caveAnvil?.(); AudioEngine.coins?.(); save(); refreshHUD();
  if (id === 'facao') worldSay('O Griggs derrete a prata dos piratas numa colher de ferro e passa no fio da lâmina. Agora sim: prata pega em assombração.');
  griggsShop();
}
function ilhaReza() {
  const bag = mataBag(); if (!(bag.reza > 0) || !mataHere() || scene || modal) return false;
  mataBuffs.reza = 30; bag.reza--; if (bag.reza <= 0) delete bag.reza;
  effect('🙏 Reza de sal e arruda', worldOut.x, worldOut.y - 150, '#e8f0a0', 18); AudioEngine.caveHeal?.(); save(); mataBeltRefresh(); return true;
}
function drawReza() {
  if (!(mataBuffs.reza > 0) || !worldOut) return; const p = worldOut, k = Math.min(1, mataBuffs.reza / 3);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(p.x, p.y - 60, 70, .14 * k, '230,240,150'); ctx.restore();
  for (let i = 0; i < 4; i++) { const a = frameClock * 2 + i * Math.PI / 2; ctx.save(); ctx.translate(p.x + Math.cos(a) * 46, p.y - 60 + Math.sin(a) * 26); ctx.rotate(a); ctx.globalAlpha = .8 * k; ellipse(0, 0, 7, 3, '#7ab85a'); ctx.restore(); }
}
{
  // Golpe, pedrada e tiro: na ilha, com o dano da cerração.
  const atk = mataAttack; mataAttack = function () { const R = ilhaResiste(); if (!R) return atk(); const mult = ilhaFacaoPrata() || mataBuffs.reza > 0 || caveWeapon().id === 'sabre' ? 1 : R.mao, N = mataNight, cd = N.cd, r = ilhaComDano(mult, atk); if (mult < 1 && N.cd !== cd) ilhaFraco(); return r; };
  const shot = rangedHit; rangedHit = function (b, s) {
    const R = ilhaResiste(); if (!R || !ILHA_MOBS[b.kind]) return shot(b, s);
    // Arpão e carabina, feitos na ilha, pegam cheio (e o arpão bate mais forte em bruxa); a pedra e a bala comum, só com a reza.
    const daIlha = s.id === 'arpao' || s.id === 'carabina', mult = daIlha || mataBuffs.reza > 0 ? 1 : s.id === 'revolver38' ? R.tiro : R.mao; if (mult < 1) ilhaFraco();
    const bruxa = s.id === 'arpao' && (b.kind === 'bruxa' || b.kind === 'bruxaMor') ? ILHA_FIO.bruxa : 1;
    return ilhaComDano(mult * bruxa, () => shot(b, s));
  };
  // A prata vem dos baús; o pirata, de vez em quando, deixa a pólvora e a bala dele: cartucho de carabina.
  ILHA_MOBS.pirata.onKill = b => { if (Math.random() < .4) { carabinaAdd(2); effect('+2 cartuchos de carabina', b.x, b.y - 120, '#ffe2a6', 15); } };
  const dmg = caveDmg; caveDmg = function () { return dmg() + (ilhaFacaoPrata() ? ILHA_FIO.facao.dmg * ilhaFio('facao') : 0); };
  const M = WORLD_MAPS.ilha, spots = M.spots, draw = M.draw;
  M.spots = function () { const list = spots.call(this), got = ilhaAchadosDia(); ilhaAchados().forEach((a, i) => { if (!got.includes(i)) list.push({ id: 'ilha:achado:' + i, x: a.x, y: a.y + 24, radius: 70, label: ILHA_ACHADO_TXT[a.k], act: () => ilhaColhe(i) }); }); return list; };
  M.draw = function (view, seen, layers) { draw.call(this, view, seen, layers); const got = ilhaAchadosDia(); ilhaAchados().forEach((a, i) => { if (!got.includes(i) && seen(a.x, a.y, 120)) layers.push({ y: a.y, draw: () => drawAchado(a) }); }); };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (mataBuffs.reza > 0 && !paused && !modal && !scene) mataBuffs.reza = Math.max(0, mataBuffs.reza - dt); };
  const sparks = drawSparks; drawSparks = function (map = null) { sparks(map); if (map && map === worldOut?.map && mataHere()) drawReza(); };
}

// ---------- Os desenhos do sal, da arruda e da prata no inventário ----------
// A prata é o cristal dos minérios da caverna, prateado; o sal vai num saco de estopa; a arruda é um ramo verde.
const PRATA_FILTRO = 'grayscale(1) brightness(1.5) contrast(1.15)', ilhaItemFrames = new Map();
function ilhaItemImage(k, pixels = 48) {
  const h = Math.max(24, Math.round(pixels)), key = k + ':' + h; if (ilhaItemFrames.has(key)) return ilhaItemFrames.get(key);
  let c = null;
  if (k === 'prata') { const f = expansionFrame('cave-props-v1', 4, h); if (f) { c = document.createElement('canvas'); c.width = f.w; c.height = f.h; const g = c.getContext('2d'); g.filter = PRATA_FILTRO; g.drawImage(f.image, 0, 0); } }
  else if (k === 'arruda') { const im = MATA_ART['mata-gear'], r = MATA_GEAR_RECTS[MATA_GEAR_IDS.indexOf('erva_verde')]; if (im?.naturalWidth && r) { c = document.createElement('canvas'); c.height = h; c.width = Math.round(r[2] * h / r[3]); c.getContext('2d').drawImage(im, ...r, 0, 0, c.width, c.height); } }
  if (c) ilhaItemFrames.set(key, c); return c;
}
{
  const bi = bagIcon; bagIcon = function (k) {
    if (k === 'prata') return `<span class="pixel-item">${expansionPortrait('cave-props-v1', 4, 48).replace('<svg ', `<svg style="filter:${PRATA_FILTRO}" `)}</span>`;
    if (k === 'arruda') return mataGearHTML('erva_verde');
    if (k === 'sal') return ruralIconHTML('racao') || bi(k);
    return bi(k);
  };
  // A folha dos cristais carrega logo: a prata aparece no inventário mesmo antes de o Sadi entrar na caverna.
  if (typeof expansionImage === 'function') expansionImage('cave-props-v1');
  const image = itemImageForSize; itemImageForSize = function (key, pixels) { if (key === 'sal') return ruralItemImage('racao') || image(key, pixels); return key === 'prata' || key === 'arruda' ? ilhaItemImage(key, pixels) || image(key, pixels) : image(key, pixels); };
}

// ---------- Arpão de baleeiro, carabina e sabre de abordagem ----------
// O Griggs faz com o que vem da ilha: madeira de garapuvu (troncos caídos na mata de baixo), corrente enferrujada (cai
// dos afogados), prata (baús de pirata) e pedaço de sabre (cai dos marinheiros da fortaleza). Feitos na ilha, pegam cheio
// nos bichos dela.
//   · Arpão (arma de longe, X troca): bom contra bruxas. Atravessa todos os bichos da fila, puxa os pequenos pra perto
//     do Sadi e prende a bruxa um tempo (nem foge nem some). Começa fraco; o Griggs afia a ponta com prata.
//   · Carabina (arma de longe): tiro forte e comprido, um de cada vez, com cartucho próprio (o Griggs vende; os baús e
//     os piratas dão).
//   · Sabre (arma de corpo a corpo): golpe mais ligeiro, um pouco mais comprido e em arco bem largo.
Object.assign(BAG_RAW, {
  garapuvu: { name: 'Madeira de garapuvu', icon: '🪵', value: 3, note: 'Tronco caído de garapuvu, a árvore das canoas da ilha. O Griggs faz o arpão e a coronha da carabina.' },
  corrente_ferro: { name: 'Corrente enferrujada', icon: '⛓️', value: 2, note: 'Corrente de âncora que os afogados arrastam. O Griggs faz o arpão e a ferragem da carabina.' },
  sabre_peca: { name: 'Pedaço de sabre', icon: '🗡️', value: 4, note: 'Lâmina quebrada dos marinheiros da fortaleza. O Griggs refaz o sabre de abordagem.' }
});
const ARPAO_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 48"><path d="M4 31 L44 22" stroke="#7a5230" stroke-width="5" stroke-linecap="round"/><path d="M43 22 L61 18 L46 14 Z" fill="#c8ccd0" stroke="#3a3a3a" stroke-width="1.5"/><path d="M48 21 L43 28" stroke="#c8ccd0" stroke-width="3"/><path d="M10 30 q-7 6 0 10 q7 4 11 -2" fill="none" stroke="#d8c080" stroke-width="2.5"/></svg>';
RANGED.arpao = { name: 'Arpão de baleeiro', range: 640, speed: 1100, cd: 1, pierce: true, get dmg() { return ILHA_FIO.arpao.base + ILHA_FIO.arpao.dmg * ilhaFio('arpao'); } };
RANGED_ART.arpao = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(ARPAO_SVG);
const CARABINA = { max: 40, box: 8, cost: 48, nova: 10 };
const CARABINA_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 24"><path d="M2 13 L15 10 L19 16 L5 20 Z" fill="#7a5230" stroke="#3a2414" stroke-width="1.2"/><rect x="14" y="8.5" width="17" height="6" rx="1.5" fill="#8a5a34" stroke="#3a2414" stroke-width="1.2"/><rect x="29" y="9" width="33" height="3" fill="#4a4a52"/><rect x="29" y="12" width="21" height="2.6" fill="#6a4426"/><path d="M22 14.5 q2 5 6 3" fill="none" stroke="#3a3a3a" stroke-width="1.5"/><rect x="57" y="7" width="2" height="2.5" fill="#d8dce0"/><rect x="24" y="6.6" width="4" height="2" fill="#d8dce0"/></svg>';
const CARTUCHOS_SVG = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect x="9" y="9" width="4" height="15" rx="1" fill="#d8b048" stroke="#7a5a20" stroke-width=".8"/><path d="M9 10 q2 -6 4 0 Z" fill="#c8ccd0" stroke="#6a6a6a" stroke-width=".6"/><rect x="15" y="9" width="4" height="15" rx="1" fill="#d8b048" stroke="#7a5a20" stroke-width=".8"/><path d="M15 10 q2 -6 4 0 Z" fill="#c8ccd0" stroke="#6a6a6a" stroke-width=".6"/><rect x="21" y="9" width="4" height="15" rx="1" fill="#d8b048" stroke="#7a5a20" stroke-width=".8"/><path d="M21 10 q2 -6 4 0 Z" fill="#c8ccd0" stroke="#6a6a6a" stroke-width=".6"/><rect x="27" y="9" width="4" height="15" rx="1" fill="#d8b048" stroke="#7a5a20" stroke-width=".8"/><path d="M27 10 q2 -6 4 0 Z" fill="#c8ccd0" stroke="#6a6a6a" stroke-width=".6"/><rect x="33" y="9" width="4" height="15" rx="1" fill="#d8b048" stroke="#7a5a20" stroke-width=".8"/><path d="M33 10 q2 -6 4 0 Z" fill="#c8ccd0" stroke="#6a6a6a" stroke-width=".6"/><rect x="5" y="20" width="38" height="22" rx="3" fill="#7a5a34" stroke="#3a2414" stroke-width="2"/><rect x="5" y="27" width="38" height="5" fill="#a8823c"/></svg>';
RANGED.carabina = { name: 'Carabina', range: 920, speed: 2600, cd: 1.05, dmg: 2.4 };
RANGED_ART.carabina = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(CARABINA_SVG);
RANGED_ART.cartuchos = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(CARTUCHOS_SVG);
function carabinaBalas() { return ilhaState().cartuchos || 0; }
function carabinaAdd(n) { const st = ilhaState(); st.cartuchos = Math.min(CARABINA.max, (st.cartuchos || 0) + n); }
function carabinaGasta() { const st = ilhaState(); st.cartuchos = Math.max(0, (st.cartuchos || 0) - 1); }
// Sem cartucho: o cão bate seco.
function carabinaSeca() { ranged.cd = .3; ranged.hold = .3; AudioEngine.gunDry?.(); if (frameClock - ranged.dryNote > 4) { ranged.dryNote = frameClock; floatNote('Click! Sem cartucho na carabina. O John Griggs vende, e os baús de pirata da ilha costumam ter.'); } }
function griggsCartuchos() { if (!rangedOwned('carabina') || carabinaBalas() >= CARABINA.max || !hasCash(CARABINA.cost)) return; spendCash(CARABINA.cost); carabinaAdd(CARABINA.box); AudioEngine.coins?.(); save(); refreshHUD(); griggsShop(); }
CAVE_WEAPONS.push({ id: 'sabre', name: 'Sabre de abordagem', icon: '⚔️', dmg: 44, griggs: true, color: '225,235,255', desc: 'O sabre curvo dos marinheiros da fortaleza, refeito pelo Griggs com prata na guarda: golpe mais ligeiro, em arco largo, e pega cheio nos bichos da ilha.' });
ILHA_ACHADO_TXT.garapuvu = 'Cortar madeira de garapuvu';
ILHA_RECEITAS.push(
  { id: 'arpao', name: 'Arpão de baleeiro', icon: '🔱', needs: { garapuvu: 3, corrente_ferro: 2, prata: 4 }, cost: 120, desc: 'Bom contra bruxas: prende a bruxa na corda um tempo (nem foge nem some) e bate mais forte nela. Arma de longe (R atira, X troca): atravessa a fila de bichos e puxa os pequenos pra perto. Começa fraco; o Griggs afia a ponta com prata.' },
  { id: 'carabina', name: 'Carabina', icon: '🎯', needs: { garapuvu: 2, corrente_ferro: 3, prata: 3 }, cost: 260, desc: 'Arma de longe (R atira, X troca): tiro forte e comprido, um de cada vez, com cartucho de carabina. Coronha de garapuvu, ferragem de corrente e mira de prata: feita na ilha, pega cheio nos bichos dela. Vem com ' + CARABINA.nova + ' cartuchos.' },
  { id: 'sabre', name: 'Sabre de abordagem', icon: '⚔️', needs: { sabre_peca: 4, prata: 2 }, cost: 220, desc: 'Golpe mais ligeiro, em arco largo, e pega cheio nos bichos da ilha. A arma pra fortaleza e pra masmorra.' }
);
function ilhaArmaFeita(id) { return id === 'arpao' || id === 'carabina' ? rangedOwned(id) : id === 'sabre' ? weaponOwned('sabre') : false; }
function ilhaArmaFaz(id) {
  if (id === 'arpao') { G.up.arpao = true; G.rangedPick = 'arpao'; updateRangedButton(); worldSay('O Griggs crava a ponta de prata no cabo de garapuvu e enrola a corrente: arpão de baleeiro. Bom contra bruxas. X troca de arma.'); }
  else if (id === 'carabina') { G.up.carabina = true; G.rangedPick = 'carabina'; carabinaAdd(CARABINA.nova); updateRangedButton(); worldSay('Coronha de garapuvu, ferragem de corrente e mira de prata: a carabina do Griggs, com ' + CARABINA.nova + ' cartuchos. X troca de arma.'); }
  else if (id === 'sabre') { const st = caveState(); st.forged ??= {}; st.forged.sabre = G.day; st.weapon = 'sabre'; worldSay('O Griggs bate as lâminas quebradas numa só e põe prata na guarda: o sabre de abordagem já tá na mão.'); }
}
// O arpão em voo, preso na corda até a mão do Sadi.
function arpaoDrawShot(s, x, y) {
  const p = worldOut, a = Math.atan2(s.vy, s.vx);
  ctx.save(); ctx.strokeStyle = 'rgba(216,192,128,.85)'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(p.x + Math.cos(a) * 20, p.y - 60); ctx.quadraticCurveTo((p.x + x) / 2, (p.y - 60 + y) / 2 + 16, x, y); ctx.stroke(); ctx.restore();
  ctx.save(); ctx.translate(x, y); ctx.rotate(a); rect(-40, -2.5, 42, 5, '#7a5230', 2); ctx.fillStyle = '#c8ccd0'; ctx.beginPath(); ctx.moveTo(2, -6); ctx.lineTo(17, 0); ctx.lineTo(2, 6); ctx.closePath(); ctx.fill(); ctx.strokeStyle = '#c8ccd0'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(5, 4); ctx.lineTo(-2, 10); ctx.stroke(); ctx.restore();
}
const arpaoPuxadas = [];
function arpaoPuxa(b) {
  const bruxa = b.kind === 'bruxa';
  if (inCave() || b.hp <= 0 || b.boss || b.lenda || !bruxa && (CAVE_BEASTS[b.kind]?.r || 30) >= 36) return;
  // A bruxa fica presa na corda um bom tempo: nem foge nem some (e a praga que ela armava se perde).
  b.stun = Math.max(b.stun || 0, bruxa ? ILHA_FIO.preso : .7); if (bruxa) { b.state = 'hover'; b.foge = Math.max(b.foge || 0, ILHA_FIO.preso + .4); }
  const p = worldOut, d = Math.hypot(b.x - p.x, b.y - p.y) || 1;
  if (d >= 110) arpaoPuxadas.push({ b, x0: b.x, y0: b.y, x1: p.x + (b.x - p.x) / d * 90, y1: p.y + (b.y - p.y) / d * 90, t: 0 });
  effect(bruxa ? 'Presa!' : 'Puxou!', b.x, b.y - 120, '#e8d8a8', 15);
}
function arpaoTick(dt) {
  for (const o of arpaoPuxadas) { o.t = Math.min(1, o.t + dt / .25); const k = o.t * o.t * (3 - 2 * o.t), x = o.x0 + (o.x1 - o.x0) * k, y = o.y0 + (o.y1 - o.y0) * k; if (o.b.hp > 0 && mataFree(x, y)) { o.b.x = x; o.b.y = y; } else o.t = 1; }
  for (let i = arpaoPuxadas.length - 1; i >= 0; i--) if (arpaoPuxadas[i].t >= 1) arpaoPuxadas.splice(i, 1);
}
{
  const arpaoHit = rangedHit; rangedHit = function (b, s) { const r = arpaoHit(b, s); if (s.id === 'arpao') arpaoPuxa(b); return r; };
  const fwi = forgeWeaponIcon; forgeWeaponIcon = function (id) { return id === 'sabre' ? `<span style="display:inline-flex;filter:grayscale(1) brightness(1.2) contrast(1.1)">${fwi('ouro')}</span>` : fwi(id); };
  const cd = caveCd; caveCd = function () { return caveWeapon().id === 'sabre' ? cd() * .7 : cd(); };
  const reach = caveReach; caveReach = function () { return reach() + (caveWeapon().id === 'sabre' ? 20 : 0); };
  const arco = mataArco; mataArco = function () { return caveWeapon().id === 'sabre' ? 1.9 : arco(); };
  ILHA_MOBS.afogado.onKill = b => { if (Math.random() < .55) { bagAdd('corrente_ferro', 1); effect('+1 ⛓️ corrente enferrujada', b.x, b.y - 120, '#d8d0c0', 15); } };
  ILHA_MOBS.marujo.onKill = b => { if (Math.random() < .5) { bagAdd('sabre_peca', 1); effect('+1 🗡️ pedaço de sabre', b.x, b.y - 120, '#e0e8f0', 15); } };
  const spec = ruralItemSpec; ruralItemSpec = function (key) { return key === 'corrente_ferro' ? ['keepsakes-v2', KEEPSAKE_ART.freio] : spec(key); };
  const bi = bagIcon; bagIcon = function (k) { return k === 'garapuvu' ? itemIconHTML('lenha') : k === 'sabre_peca' ? mataGearHTML('facao_mato') : bi(k); };
  const image = itemImageForSize; itemImageForSize = function (key, pixels) { return key === 'garapuvu' ? image('lenha', pixels) : key === 'sabre_peca' ? ilhaGearImage('facao_mato', pixels) : image(key, pixels); };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (!paused && !modal && !scene && arpaoPuxadas.length) arpaoTick(dt); };
}
// Um desenho do bornal da mata (folha mata-gear) como imagem de item.
function ilhaGearImage(gear, pixels = 48) {
  const h = Math.max(24, Math.round(pixels)), key = gear + ':' + h; if (ilhaItemFrames.has(key)) return ilhaItemFrames.get(key);
  const im = MATA_ART['mata-gear'], r = MATA_GEAR_RECTS[MATA_GEAR_IDS.indexOf(gear)]; if (!im?.naturalWidth || !r) return null;
  const c = document.createElement('canvas'); c.height = h; c.width = Math.round(r[2] * h / r[3]); c.getContext('2d').drawImage(im, ...r, 0, 0, c.width, c.height); ilhaItemFrames.set(key, c); return c;
}
