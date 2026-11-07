// A evolução do Sadi no jogo inteiro, pra chegar forte na área mais difícil:
//   · Vida: 100 → poncho 140 → pala 180 → gibão 230, e +10 de vida máxima pra cada chefe grande vencido.
//   · Bornal: três tamanhos pra comprar (couro cru, tropeiro, alforje de campanha), com limite menor nos itens mais fortes.
//   · Cura em degraus: marcela (mata) → caldo de peixe (ilha) → costela de fogo de chão (pampa). A canha dá coragem.
//   · Baús: cada um tem um tema sorteado (moedas, mantimentos, minério ou ferragem, munição, colheita, lembrança), e o tema
//     nunca repete dois baús seguidos.
'use strict';

// ---------- A vida ----------
function chefesVencidos() {
  const m = G?.mata, i = G?.ilha, p = G?.pampa, c = G?.cave;
  return [m?.cachaco, m?.papo, m?.laguna?.won, i?.bruxaMor, i?.bernunciaMae, i?.grenfell, c?.salamanca, p?.sargento, p?.boi, p?.capitao].filter(Boolean).length;
}
CAVE_UPGRADES.push({ id: 'gibao', name: 'Gibão de couro farrapo', icon: '🧥', cost: 900, requires: 'pala', needs: { couro_cru: 14, ferro_imperial: 8 }, desc: 'Couro cru por cima da lã, com tachas de ferro imperial: 230 de vida. É a roupa de quem vai até Porongos.' });
{
  const hp = caveMaxHp; caveMaxHp = function () { return (caveUp('gibao') ? 230 : hp()) + 10 * chefesVencidos(); };
  // Chefe caiu: a vida máxima sobe na hora, e dá pra ver.
  const tick = outsideTick; outsideTick = function (dt) {
    tick(dt); const cs = G?.cave; if (!cs || scene || modal) return; const n = chefesVencidos(); cs.vidaChefes ??= n;
    if (n > cs.vidaChefes) { cs.hp = Math.min(caveMaxHp(), cs.hp + 10 * (n - cs.vidaChefes)); floatNote('❤ A peleia endureceu o couro: +' + 10 * (n - cs.vidaChefes) + ' de vida máxima.'); AudioEngine.heart?.(); } cs.vidaChefes = n;
  };
}

// ---------- O bornal ----------
const BORNAL_NIVEIS = [{ mata: 3, cave: 5 }, { id: 'bornal', mata: 6, cave: 10 }, { id: 'bornal2', mata: 8, cave: 14 }, { id: 'bornal3', mata: 12, cave: 20 }];
const ITENS_FORTES = new Set(['caldo', 'costela', 'canha', 'bomba', 'reza']);
function bornalNivel() { return caveUp('bornal3') ? 3 : caveUp('bornal2') ? 2 : caveUp('bornal') ? 1 : 0; }
caveBagMax = function () { return BORNAL_NIVEIS[bornalNivel()].cave; };
mataBagMax = function (id) { const m = BORNAL_NIVEIS[bornalNivel()].mata; return ITENS_FORTES.has(id) ? Math.max(2, Math.ceil(m / 2)) : m; };
{
  const b = CAVE_UPGRADES.find(u => u.id === 'bornal'); b.cost = 200; b.desc = 'Cabe mais: até 6 de cada item na mata, na ilha e no pampa, e 10 na caverna.';
  CAVE_UPGRADES.splice(CAVE_UPGRADES.indexOf(b) + 1, 0,
    { id: 'bornal2', name: 'Bornal de tropeiro', icon: '🎒', cost: 650, requires: 'bornal', needs: { corrente_ferro: 2 }, desc: 'Lona de vela e fivela de corrente da ilha: até 8 de cada item fora da caverna, e 14 nela.' },
    { id: 'bornal3', name: 'Alforje de campanha', icon: '🎒', cost: 1600, requires: 'bornal2', needs: { couro_cru: 12, ferro_imperial: 6 }, desc: 'O alforje dos farrapos, de couro do pampa: até 12 de cada item fora da caverna, e 20 nela.' });
  if (typeof FORGE_EQUIPMENT_ART === 'object') { FORGE_EQUIPMENT_ART.bornal2 = FORGE_EQUIPMENT_ART.bornal3 = FORGE_EQUIPMENT_ART.bornal; FORGE_EQUIPMENT_ART.gibao = FORGE_EQUIPMENT_ART.pala; }
}

// ---------- Os itens novos ----------
MATA_ITEMS.push(
  { id: 'caldo', name: 'Caldo de peixe', icon: '🍲', cost: 45, griggs: true, cura: 60, desc: 'Caldo quente com pirão, do acampamento do Griggs: cura 60 de vida e corta o veneno.' },
  { id: 'costela', name: 'Costela de fogo de chão', icon: '🍖', cost: 95, griggs: true, cura: 110, desc: 'Assada devagar, como só no pampa: cura 110 de vida e corta o veneno.' },
  { id: 'canha', name: 'Trago de canha', icon: '🍶', cost: 35, griggs: true, desc: 'Coragem de bolicho: +40% de dano por 20 segundos.' }
);
const CINTO_ORDEM = ['marcela', 'caldo', 'costela', 'carqueja', 'canha', 'bomba', 'reza', 'fumo', 'ticao'];
let caldoCanvas = null;
function caldoArte() {
  if (caldoCanvas) return caldoCanvas;
  const c = caldoCanvas = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = '#2a1a0c'; g.lineWidth = 4;
  g.beginPath(); g.ellipse(48, 46, 34, 12, 0, 0, Math.PI * 2); g.fillStyle = '#d8a050'; g.fill(); g.stroke();
  g.beginPath(); g.moveTo(14, 46); g.quadraticCurveTo(18, 82, 48, 82); g.quadraticCurveTo(78, 82, 82, 46); g.closePath(); g.fillStyle = '#8a5a30'; g.fill(); g.stroke();
  g.fillStyle = '#f0d890'; for (const [x, y] of [[36, 44], [52, 42], [60, 48]]) { g.beginPath(); g.ellipse(x, y, 7, 3, 0, 0, Math.PI * 2); g.fill(); }
  g.strokeStyle = 'rgba(240,240,240,.8)'; g.lineWidth = 3; for (const x of [34, 50, 64]) { g.beginPath(); g.moveTo(x, 28); g.quadraticCurveTo(x - 6, 20, x, 12); g.stroke(); }
  return c;
}
{
  const gear = mataGearHTML; mataGearHTML = function (id, size = 64) {
    const box = h => `<span class="mata-item-art" style="display:inline-flex;width:${size}px;height:${size}px;align-items:center;justify-content:center">${h}</span>`;
    if (id === 'caldo') return box(`<img src="${caldoArte().toDataURL()}" width="${size}" height="${size}" alt="">`);
    if (id === 'costela') return box(itemIconHTML('costela'));
    if (id === 'canha') return box(itemIconHTML('cachaca'));
    return gear(id, size);
  };
  mataBeltItems = function () { const bag = mataBag(), list = CINTO_ORDEM.map(id => MATA_ITEMS.find(i => i.id === id)).filter(i => i && bag[i.id] > 0); return [...healFruits(), ...list].slice(0, 9); };
  const use = mataUseItem; mataUseItem = function (id) {
    const it = MATA_ITEMS.find(i => i.id === id), bag = mataBag(), st = caveState(), p = worldOut;
    if (it?.cura) {
      if (!(bag[id] > 0) || !mataHere() || scene || modal) return false;
      if (st.hp >= caveMaxHp() && !(mataBuffs.veneno > 0)) { floatNote('Vida cheia: guarda pra hora do aperto.'); return false; }
      st.hp = Math.min(caveMaxHp(), st.hp + it.cura); mataBuffs.veneno = 0; effect('+' + it.cura + ' ❤ ' + it.name.toLowerCase(), p.x, p.y - 140, '#d8ffac', 18); fxHearts?.(p.x, p.y - 120, 3); AudioEngine.boost?.();
    } else if (id === 'canha') {
      if (!(bag[id] > 0) || !mataHere() || scene || modal) return false;
      mataBuffs.canha = 20; effect('🍶 Coragem! +40% de dano', p.x, p.y - 140, '#ffcf8a', 18); AudioEngine.glass?.();
    } else return use(id);
    bag[id]--; if (bag[id] <= 0) delete bag[id]; save(); mataBeltRefresh(); return true;
  };
  const dmg = caveDmg; caveDmg = function () { return mataBuffs.canha > 0 && !inCave() ? Math.round(dmg() * 1.4) : dmg(); };
  const combat = mataCombatTick; mataCombatTick = function (dt) { if (mataBuffs.canha > 0) mataBuffs.canha -= dt; return combat(dt); };
  BOMBA.dmg = 130; BOMBA.r = 155; BOMBA.cost = MATA_ITEMS.find(i => i.id === 'bomba').cost = 45;
}
// Griggs: o que dá pra levar da ilha.
function griggsEquipHTML() {
  const lista = ['bornal', 'bornal2', 'pala'].map(id => CAVE_UPGRADES.find(u => u.id === id)).filter(u => u && !caveUp(u.id));
  if (!lista.length) return ''; return `<h3 class="forja-sec">🧥 Equipamento <small>o Griggs também costura</small></h3><div class="store-list">${lista.map(upgradeCardHTML).join('')}</div>`;
}
{
  const act = action; action = function (name, id) {
    if (name === 'facaoBuy' && modal === 'griggsShop') { const open = dunstanShopOpen, shop = dunstanShop; dunstanShopOpen = () => true; dunstanShop = griggsShop; try { return facaoBuy(id); } finally { dunstanShopOpen = open; dunstanShop = shop; } }
    return act(name, id);
  };
}
// O bolicho do seu Zeferino: as curas e o que mais vai no bornal, no começo da forja, pra não precisar procurar.
pampaBolichoSecao = function (sec) {
  const bag = mataBag(), nota = 'teclas 1 a 9 usam · bornal maior leva mais';
  return sec('🍖 Cura e bornal', nota, ['marcela', 'caldo', 'costela', 'carqueja', 'canha', 'bomba'].map(id => MATA_ITEMS.find(i => i.id === id)).map(i => { const have = bag[i.id] || 0, max = mataBagMax(i.id), room = max - have; return forjaCard(mataGearHTML(i.id), i.name + ` <small>· ${have}/${max}</small>`, i.desc, '', `<button class="primary" data-act="pampaItem" data-id="${i.id}" ${room > 0 && hasCash(i.cost) ? '' : 'disabled'}>${room > 0 ? 'Comprar · ' + money(i.cost) : 'Cheio'}</button>`); }).join(''));
};
pampaItemCompra = function (id) {
  const it = MATA_ITEMS.find(i => i.id === id), bag = mataBag(); if (!it || (bag[id] || 0) >= mataBagMax(id) || !hasCash(it.cost)) return;
  spendCash(it.cost); bag[id] = (bag[id] || 0) + 1; AudioEngine.coins?.(); mataBeltRefresh(); save(); refreshHUD(); pampaForja();
};

// ---------- Os baús ----------
const BAU_NOMES = { bolsa: 'Bolsa de moedas', mantimentos: 'Mantimentos', minerio: 'Minério', ferragem: 'Ferragem', municao: 'Munição', colheita: 'Colheita do mato', lembranca: 'Lembrança', prata: 'Prata de pirata', chefe: 'O tesouro do chefe' };
const BAU_PESOS = {
  caverna: { bolsa: 3, mantimentos: 3.5, minerio: 3.5, municao: 1.5, lembranca: 1.5 },
  mata: { bolsa: 3, mantimentos: 4, minerio: 2.5, municao: 1.5, colheita: 2.5, lembranca: 1.5 },
  ilha: { bolsa: 2, mantimentos: 4, ferragem: 3.5, municao: 2.5, lembranca: 1.5 },
  pampa: { bolsa: 2.5, mantimentos: 4, ferragem: 3.5, municao: 2, lembranca: 1.5 }
};
function bauPega(lista) { return lista[Math.floor(Math.random() * lista.length)]; }
// Sorteia o tema. O mesmo tema nunca sai duas vezes em seguida, e munição só pra quem tem com que atirar.
function bauTema(area) {
  const temArma = rangedOwned('revolver38') || rangedOwned('carabina') || (area === 'ilha' || area === 'pampa') && !!G.ilha?.griggs;
  const pesos = Object.entries(BAU_PESOS[area]).filter(([k]) => k !== G.bauUltimo && (k !== 'municao' || temArma) && (k !== 'lembranca' || randomLooseCard()));
  let r = Math.random() * pesos.reduce((s, [, p]) => s + p, 0); for (const [k, p] of pesos) { r -= p; if (r <= 0) return G.bauUltimo = k; } return G.bauUltimo = pesos[0][0];
}
function bauMonta(area, n, temaFixo) {
  const fundo = area === 'mata' ? (n >= 22 ? 2 : n >= 12 ? 1 : 0) : area === 'caverna' ? (n > 10 ? 2 : n > 5 ? 1 : 0) : 2, r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const base = { caverna: 12 + n * 2, mata: 14 + n * 3, ilha: 50 + n * 14, pampa: 110 + n * 12 }[area] * (caveUp('guaiaca') && area !== 'caverna' ? 1.3 : 1), tema = temaFixo || bauTema(area);
  const loot = { tema, cash: Math.round(base * (.45 + Math.random() * .3)), raw: {}, items: {}, caveItems: {}, frutas: 0, balas: 0, cartuchos: 0, cards: [], heal: 0 };
  const poe = (obj, k, q = 1) => { obj[k] = (obj[k] || 0) + q; };
  if (tema === 'bolsa') loot.cash = Math.round(base * (1.9 + Math.random() * .8));
  else if (tema === 'mantimentos') {
    if (area === 'caverna') { for (let k = 0; k < 2 + fundo; k++) poe(loot.caveItems, bauPega(fundo ? ['chimarrao', 'charque', 'patua', 'esporas', 'canha', 'boleadeira'] : ['charque', 'chimarrao', 'charque'])); if (Math.random() < .4) loot.heal = 25; }
    else if (area === 'mata') { for (let k = 0; k < 2 + fundo; k++) poe(loot.items, bauPega(fundo ? ['marcela', 'carqueja', 'fumo', 'ticao', 'marcela'] : ['marcela', 'carqueja'])); if (Math.random() < .5) loot.frutas = r(1, 2 + fundo); }
    else if (area === 'ilha') { for (let k = 0; k < 2 + (n > 3 ? 1 : 0); k++) poe(loot.items, bauPega(['marcela', 'caldo', 'carqueja', 'caldo', 'canha'])); }
    else { for (let k = 0; k < 2 + (n > 8 ? 1 : 0); k++) poe(loot.items, bauPega(n > 8 ? ['caldo', 'costela', 'canha', 'carqueja', 'costela'] : ['marcela', 'caldo', 'carqueja', 'canha'])); }
  } else if (tema === 'minerio') {
    const ores = [['cobre', 'ferro'], ['ferro', 'ametista', 'opala'], ['agata', 'opala', 'ouro']][fundo];
    for (const k of [bauPega(ores), bauPega(ores)]) poe(loot.raw, k, k === 'ouro' || k === 'opala' ? 1 : r(2, 4));
  } else if (tema === 'ferragem') {
    if (area === 'ilha') { poe(loot.raw, 'prata', r(1, 3)); poe(loot.raw, bauPega(['corrente_ferro', 'garapuvu', 'arruda', 'sal', n > 4 ? 'sabre_peca' : 'corrente_ferro']), r(1, 2)); poe(loot.raw, bauPega(['sal', 'arruda', 'garapuvu']), 1); }
    else { poe(loot.raw, 'couro_cru', r(3, 6)); poe(loot.raw, 'ferro_imperial', r(2, 5)); }
  } else if (tema === 'municao') {
    if (rangedOwned('revolver38')) loot.balas = r(6, 12); if (rangedOwned('carabina')) loot.cartuchos = r(4, 10); if (area === 'ilha' || area === 'pampa') poe(loot.items, 'bomba', r(1, 2));
    if (!loot.balas && !loot.cartuchos && !Object.keys(loot.items).length) loot.cash = Math.round(base * 1.6);
  } else if (tema === 'colheita') {
    poe(loot.raw, 'erva_verde', r(3, 6)); poe(loot.raw, 'mel', r(1, 2)); poe(loot.raw, 'pinhao', 50 * r(1, 3)); loot.frutas = r(0, 2);
  } else if (tema === 'lembranca') { const c = randomLooseCard(); if (c) loot.cards.push(c); loot.cash = Math.round(base * .8); }
  return loot;
}
// Guarda o que veio e devolve os quadradinhos do que não é moeda nem minério (a caverna mostra esses do jeito dela).
function bauExtras(loot) {
  const bag = mataBag(), out = [];
  for (const [id, q] of Object.entries(loot.items)) { const got = Math.min(q, Math.max(0, mataBagMax(id) - (bag[id] || 0))), it = MATA_ITEMS.find(i => i.id === id); if (!got || !it) continue; bag[id] = (bag[id] || 0) + got; out.push([mataGearHTML(id, 34), got, it.name.toLowerCase()]); }
  const cb = caveBag(); for (const [id, q] of Object.entries(loot.caveItems)) { const got = Math.min(q, Math.max(0, caveBagMax() - (cb[id] || 0))), it = CAVE_ITEMS.find(i => i.id === id); if (!got || !it) continue; cb[id] = (cb[id] || 0) + got; out.push([caveItemIcon(it), got, it.name.toLowerCase()]); }
  if (loot.frutas) { bagAdd('butia', loot.frutas); out.push([itemIconHTML('butia'), loot.frutas, loot.frutas > 1 ? 'butiás (curam)' : 'butiá (cura)']); }
  if (loot.cartuchos) { carabinaAdd(loot.cartuchos); out.push([rangedIcon('cartuchos'), loot.cartuchos, 'cartuchos de carabina']); }
  return out;
}
// Mostra o baú: o tema no título e tudo o que tinha dentro.
function bauMostra(loot, titulo, texto, regiao) {
  const tiles = [['<span class="bag-emoji">🪙</span>', money(loot.cash), 'moedas']];
  G.cash = round(G.cash + loot.cash);
  for (const [k, q] of Object.entries(loot.raw)) { bagAdd(k, q); tiles.push([bagIcon(k), k === 'pinhao' ? formatWeight(q) : q, (BAG_RAW[k]?.name || k).toLowerCase()]); }
  if (loot.balas) { rangedAddBalas(loot.balas); tiles.push([rangedIcon('balas'), loot.balas, 'balas .38']); }
  tiles.push(...bauExtras(loot));
  const cards = loot.cards.filter(id => giveCard(id, 'baú')); if (cards.length) tiles.push(['<span class="bag-emoji">🃏</span>', cards.length, 'figurinha nova']);
  AudioEngine.caveChestOpen?.(); mataBeltRefresh(); save(); refreshHUD();
  talk([['card', `<b>🧰 ${titulo} · ${BAU_NOMES[loot.tema]}</b><br>${texto} Dentro tinha:<div class="bag-grid cave-loot">${tiles.map(([icon, big, small]) => `<div class="bag-item">${icon}<b>${big}</b><small>${small}</small></div>`).join('')}</div>`, regiao]], null, 'Guardar');
}
trechoChestLoot = function (n) { return bauMonta('mata', n); };
trechoOpenChest = function (T, c) {
  const d = trechoDay(T.n); if (d.got.includes(c.id)) return; d.got.push(c.id);
  fxStars(c.x, c.y - 50, 6); mataXP(4); bauMostra(bauMonta('mata', T.n), 'Baú de mateiro', 'Escondido no fundo do ramal, um baú de tropeiro coberto de folha.', TRECHO_BIOME_NAMES[T.biome]);
};
pampaAbreBau = function (L, c) {
  const got = pampaHoje(L.n); if (got.includes(c.id)) return; got.push(c.id);
  fxStars(c.x, c.y - 50, 6); mataXP(4); bauMostra(bauMonta('pampa', L.n), 'Baú de tropeiro', 'Escondido atrás da taipa, um baú largado por quem passou com pressa.', L.nome);
};
// Na ilha, o primeiro baú de cada trecho é o da prata (é ela que o Griggs usa); o segundo sai no sorteio. O da clareira é grande.
ilhaBauLoot = function (n, c) {
  const i = c.chefe ? -1 : +c.id.slice(1) - 1;
  if (c.chefe) { const l = bauMonta('ilha', n, 'bolsa'); l.tema = 'chefe'; l.cash = 180 + n * 30; l.raw = { prata: 6, sabre_peca: 1 }; l.items = { bomba: 2, caldo: 2 }; l.cartuchos = 10; return l; }
  if (i === 0) { const l = bauMonta('ilha', n, 'ferragem'); l.tema = 'prata'; l.raw = { prata: 2 + Math.ceil(n * .5) }; return l; }
  return bauMonta('ilha', n);
};
ilhaBauAbre = function (L, c) {
  const st = ilhaState(), key = L.n + ':' + c.id; st.baus ??= {}; if (st.baus[key]) return; st.baus[key] = G.day;
  fxStars(c.x, c.y - 50, 8); mataXP(6);
  bauMostra(ilhaBauLoot(L.n, c), c.chefe ? 'O baú da clareira' : 'Baú de pirata', c.chefe ? 'No meio da clareira, onde o chefe caiu, um baú de pirata grande, de ferragem de prata.' : 'No fim do ramal, meio enterrado nas folhas, um baú de pirata com a fechadura podre.', 'Mata da cerração · trecho ' + L.n);
};

// ---------- A bênção do monge ----------
// O João Maria, na fogueira da mata da cerração, ensina um poder de cura: V usa, como os outros poderes.
const MONGE_CURA = { agora: .33, porSeg: 4, seg: 8 };
Object.assign(PODERES, { monge: { name: 'Bênção do monge', icon: '✚', cd: 50, desc: 'A reza do João Maria: cura um terço da vida na hora, corta o veneno e segue curando por 8 segundos.' } });
Object.assign(PODER_DICAS, { monge: 'o monge João Maria, na fogueira da mata da cerração, ensina uma reza que cura' });
Object.assign(AudioEngine, { benzer(vol = .03) { this.note(440, 1.1, 'sine', vol); this.note(659, .9, 'sine', vol * .7, .12); this.note(880, .7, 'sine', vol * .4, .24); this.caveVoice?.([196, 220, 196], 1.1, { formant: 520, q: 2.5, vol: vol * .5, vib: 4, rate: 5 }); } });
function mongeEnsina(then) {
  if (poderHas('monge')) { then?.(); return; }
  poderGanha('monge', ilhaFolkFala([['joaomaria', 'Antes de subir, filho, vou te ensinar uma coisa que não pesa no bornal.'], ['joaomaria', 'Quando a carne fraquejar, fecha os olhos, respira fundo e benze a ti mesmo com o nome de quem te espera em casa.'], ['sadi', 'E isso cura, seu João Maria?'], ['joaomaria', 'Cura quem acredita que ainda tem o que fazer amanhã. Vai com Deus, e volta pro fogo.']]), then);
}
function poderMonge() {
  const st = caveState(), p = worldOut, max = caveMaxHp(), q = Math.round(max * MONGE_CURA.agora);
  st.hp = Math.min(max, st.hp + q); mataBuffs.veneno = 0; poder.monge = { t: MONGE_CURA.seg, acc: 0 };
  effect('✚ +' + q + ' ❤ Bênção do monge', p.x, p.y - 170, '#f4eab0', 20); fxStars(p.x, p.y - 90, 6); fxHearts(p.x, p.y - 120, 3); AudioEngine.benzer?.();
}
{
  // Vida cheia: não gasta a bênção à toa.
  const usa = poderUse; poderUse = function () {
    if (rangedCombat() && !paused && !modal && !scene && !phoneOpen && !worldTalkOpen() && poderPick() === 'monge' && !(poder.cd.monge > 0) && caveState().hp >= caveMaxHp() && !(mataBuffs.veneno > 0)) { floatNote('Vida cheia: a bênção fica pra hora do aperto.'); AudioEngine.bad?.(); return; }
    return usa();
  };
  const tick = poderTick; poderTick = function (dt) {
    tick(dt); const M = poder.monge; if (!M) return; if (!rangedCombat()) { poder.monge = null; return; }
    M.t -= dt; M.acc += MONGE_CURA.porSeg * dt; if (M.acc >= 1) { const q = Math.floor(M.acc), st = caveState(); M.acc -= q; st.hp = Math.min(caveMaxHp(), st.hp + q); }
    if (M.t <= 0) poder.monge = null;
  };
  const draw = drawPoderWorld; drawPoderWorld = function () {
    draw(); if (!poder.monge || !rangedCombat()) return; const p = worldOut;
    ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(p.x, p.y - 70, 130, .2, '255,236,160'); ctx.restore();
    for (let i = 0; i < 4; i++) { const f = (frameClock * .6 + i * .25) % 1; txt('✚', p.x + Math.sin(i * 2.1 + frameClock) * 36, p.y - 30 - f * 130, 14, `rgba(255,240,170,${1 - f})`, 'center'); }
  };
  // Quem já conhecia o monge aprende na próxima prosa.
  const prosa = ilhaFolkTalk; ilhaFolkTalk = function (f) { if (f.folk === 'joaomaria' && !poderHas('monge')) { mongeEnsina(); return; } return prosa(f); };
}
