// A caverna vira jogo próprio: minérios que melhoram conforme se desce (cobre e ferro em cima, opala e ouro lá no fundo),
// a forja de São Dunstano (facão de cobre, de ferro, espada de ametista, de ágata e a da Salamanca, que se afiam com
// minério), equipamento campeiro, o bornal da caverna (tecla B) com o bolicho do santo (chimarrão, charque, canha,
// esporas, boleadeira, água benta, patuá e tição) e os atalhos 1 a 5. Na primeira descida, o susto: o fantasma se
// apresenta e ensina tudo. E em algumas noites ele sai da gruta e caminha pela estrada da Serra, contando a vida dele.
'use strict';

// ---------- Minérios ----------
// Cada um aparece numa faixa de andares; a ametista (2 a 10) e a ágata (11 em diante) seguem como o minério principal.
const CAVE_ORES = {
  cobre: { name: 'Cobre', value: 4, from: 2, to: 7, weight: 5, filter: 'hue-rotate(110deg) saturate(1.25) brightness(1.05)', glow: '230,140,70' },
  ferro: { name: 'Ferro', value: 6, from: 4, to: 14, weight: 4, filter: 'grayscale(.9) sepia(.4) brightness(.95)', glow: '210,195,180' },
  opala: { name: 'Opala', value: 25, from: 6, to: 99, weight: 1.3, filter: 'hue-rotate(-95deg) saturate(.45) brightness(1.65)', glow: '190,240,255' },
  ouro: { name: 'Ouro', value: 40, from: 13, to: 99, weight: 1, filter: 'hue-rotate(140deg) saturate(1.8) brightness(1.4)', glow: '255,215,90' }
};
const CAVE_MINERALS = ['ametista', 'agata', ...Object.keys(CAVE_ORES)];
for (const [k, o] of Object.entries(CAVE_ORES)) BAG_RAW[k] = { name: o.name, icon: '◆', value: o.value, note: 'Minério da caverna da Serra: São Dunstano forja e compra' };
function caveOresOn(floor) { return Object.entries(CAVE_ORES).filter(([, o]) => floor >= o.from && floor <= o.to); }
{
  // Pedras vazias viram veios de minério; todo andar tem pelo menos uma pedra do minério principal.
  const build = buildCaveFloor;
  buildCaveFloor = function (floor) {
    const run = build(floor); if (floor < 2) return run;
    const R = caveRand(floor * 131 + G.day * 977 + 3), main = floor > 10 ? 'agata' : 'ametista', ores = caveOresOn(floor), total = ores.reduce((n, [, o]) => n + o.weight, 0);
    for (const r of run.rocks) if (!r.loot && ores.length && R() < .55) { let roll = R() * total; for (const [k, o] of ores) { roll -= o.weight; if (roll <= 0) { r.loot = k; break; } } }
    if (run.rocks.length && !run.rocks.some(r => r.loot === main)) run.rocks[0].loot = main;
    return run;
  };
}
// Pedra e minério tingidos a partir da arte da ametista (o geodo e o cristal), guardados prontos.
const oreFrames = new Map();
function oreFrame(ore, index, height) {
  const key = ore + ':' + index + ':' + Math.round(height); if (oreFrames.has(key)) return oreFrames.get(key);
  const f = expansionFrame('cave-props-v1', index, height); if (!f) return null;
  const c = document.createElement('canvas'); c.width = f.w; c.height = f.h; const g = c.getContext('2d'); g.filter = CAVE_ORES[ore].filter; g.drawImage(f.image, 0, 0);
  const out = { image: c, w: f.w, h: f.h, ax: f.ax }; oreFrames.set(key, out); return out;
}
function oreSprite(ore, index, x, y, height) { const f = oreFrame(ore, index, height); if (!f) return false; ctx.drawImage(f.image, x - f.ax, y - f.h, f.w, f.h); return true; }
function oreSparkle(x, y, ore) {
  if (ore !== 'opala' && ore !== 'ouro') return;
  for (let k = 0; k < 3; k++) { const a = frameClock * 2 + k * 2.1, s = (Math.sin(a * 1.7) + 1) * 2; ellipse(x + Math.cos(a) * 14, y - 26 + Math.sin(a * 1.3) * 10, s, s, ore === 'opala' ? ['#ffb8e8', '#b8ffd8', '#b8d8ff'][k] : '#fff6c0'); }
}
// Ícone no inventário: o cristal da ametista em SVG com o filtro da cor (funciona até abrindo o HTML direto do disco).
function oreIconHTML(k) { return `<span class="pixel-item">${expansionPortrait('cave-props-v1', 4, 48).replace('<svg ', `<svg style="filter:${CAVE_ORES[k].filter}" `)}</span>`; }
{
  const rock = drawCaveRock; drawCaveRock = function (r) { if (!CAVE_ORES[r.loot]) return rock(r); if (!expansionSprite('cave-props-v1', r.hp < 3 ? 1 : 0, r.x, r.y + 7, 64)) return rock(r); oreSprite(r.loot, 4, r.x + 12, r.y - 4, 36); oreSprite(r.loot, 4, r.x - 14, r.y + 2, 24); oreSparkle(r.x, r.y, r.loot); };
  const drop = drawCaveDrop; drawCaveDrop = function (d) { if (!CAVE_ORES[d.k]) return drop(d); const bob = Math.sin(frameClock * 4 + d.x) * 3; if (!oreSprite(d.k, 4, d.x, d.y + bob, 26)) drop(d); };
  const icon = itemIconHTML; itemIconHTML = function (key, item = null) { return CAVE_ORES[key] ? oreIconHTML(key) : icon(key, item); };
  const bi = bagIcon; bagIcon = function (k) { return CAVE_ORES[k] ? oreIconHTML(k) : bi(k); };
  const image = itemImageForSize; itemImageForSize = function (key, pixels) { return CAVE_ORES[key] ? oreFrame(key, 4, Math.max(24, pixels || 48))?.image : image(key, pixels); };
  const tiles = caveLootTiles;
  caveLootTiles = function (t) { const l = tiles(t), at = l.findIndex(x => /moedas/.test(x[2])) + 1; const ores = Object.keys(CAVE_ORES).filter(k => t[k]).map(k => [oreIconHTML(k), t[k], CAVE_ORES[k].name]); l.splice(at, 0, ...ores); return l; };
}
function caveOreGlow(k) { return k === 'ametista' ? '190,140,255' : k === 'agata' ? '255,170,90' : CAVE_ORES[k]?.glow || null; }

// ---------- Armas da forja ----------
const CAVE_WEAPONS = [
  { id: 'facao', name: 'Facão do vô', icon: '🔪', dmg: 12, desc: 'O facão de cabo de chifre que estava cravado na boca da gruta. Afia com as melhorias do vô.' },
  { id: 'cobre', name: 'Facão de cobre', icon: '🗡️', dmg: 20, cost: 60, needs: { cobre: 8 }, ore: 'cobre', color: '255,170,100', desc: 'Cobre das primeiras galerias, batido a frio. Leve e ligeiro.' },
  { id: 'ferro', name: 'Facão de ferro batido', icon: '🗡️', dmg: 28, cost: 140, needs: { ferro: 8, cobre: 4 }, ore: 'ferro', color: '220,220,235', desc: 'Ferro das galerias do meio, temperado na água fria do arroio.' },
  { id: 'ametista', name: 'Espada de ametista', icon: '⚔️', dmg: 34, cost: 200, needs: { ametista: 10 }, ore: 'ametista', color: '200,150,255', desc: 'Fio de ametista lapidada sobre alma de aço: corta e brilha no escuro.' },
  { id: 'agata', name: 'Espada de ágata', icon: '⚔️', dmg: 42, cost: 320, needs: { agata: 8, ferro: 6 }, ore: 'agata', color: '255,150,90', desc: 'Ágata das galerias vermelhas montada em ferro batido. Pesada e certeira.' },
  { id: 'ouro', name: 'Espada da Salamanca', icon: '⚔️', dmg: 52, cost: 500, needs: { ouro: 6, opala: 2 }, ore: 'ouro', color: '255,220,110', desc: 'Ouro do fundo da serra com olhos de opala. Dizem que o encanto da Teiniaguá mora nela.' }
];
const AFIAR_MAX = 3;
function caveWeapon() { const st = caveState(); return CAVE_WEAPONS.find(w => w.id === (st.weapon || 'facao')) || CAVE_WEAPONS[0]; }
function weaponOwned(id) { return id === 'facao' || !!caveState().forged?.[id]; }
function weaponRefine(id = caveWeapon().id) { return caveState().refine?.[id] || 0; }
function afiarNeeds(w, level) { return { [w.ore || 'cobre']: 2 * level }; }
function afiarCost(level) { return 40 * level; }
function needsText(needs) { return Object.entries(needs).map(([k, q]) => `${q} ${bagName(k).toLowerCase()} <small>(tem ${Math.floor(bagQty(k))})</small>`).join(' · '); }
function hasNeeds(needs = {}) { return Object.entries(needs).every(([k, q]) => bagQty(k) >= q); }
function takeNeeds(needs = {}) { for (const [k, q] of Object.entries(needs)) bagTake(k, q); }
{
  const facaoDmg = caveDmg;
  caveDmg = function () { const w = caveWeapon(), base = w.id === 'facao' ? facaoDmg() : w.dmg; let d = base + 3 * weaponRefine(w.id); if (caveBuff('canha')) d = Math.round(d * 1.4); return d; };
}
// Água benta: dano em dobro nas assombrações (os bichos de carne seguem iguais).
const CAVE_SPIRITS = ['sanguanel', 'boitata', 'lobisomem', 'mula', 'teiniagua', 'anhanga'];
caveHitDmg = function (b) { return caveDmg() * (caveBuff('aguabenta') && CAVE_SPIRITS.includes(b?.kind) ? 2 : 1); };
caveSwingColor = function () { return caveBuff('aguabenta') ? '170,225,255' : caveWeapon().color || '255,248,220'; };
function forjaMake(id) {
  if (!dunstanShopOpen()) return; const w = CAVE_WEAPONS.find(x => x.id === id); if (!w || weaponOwned(id)) return;
  if (!hasNeeds(w.needs)) { say('Falta minério para ' + w.name.toLowerCase() + '.'); AudioEngine.bad(); return; }
  if (!hasCash(w.cost)) { say('Falta dinheiro para ' + w.name.toLowerCase() + '.'); AudioEngine.bad(); return; }
  takeNeeds(w.needs); spendCash(w.cost); const st = caveState(); st.forged ??= {}; st.forged[id] = true; st.weapon = id;
  AudioEngine.caveAnvil(); setTimeout(() => AudioEngine.ready(), 380); floatNote('⚒ ' + w.name + ' forjado na hora! Já está na tua mão.'); save(); refreshHUD(); dunstanShop();
}
function forjaEquip(id) { if (!dunstanShopOpen() || !weaponOwned(id)) return; caveState().weapon = id; AudioEngine.tick(); save(); dunstanShop(); }
function forjaAfiar() {
  if (!dunstanShopOpen()) return; const w = caveWeapon(), lv = weaponRefine(w.id) + 1; if (lv > AFIAR_MAX) return;
  const needs = afiarNeeds(w, lv), cost = afiarCost(lv);
  if (!hasNeeds(needs) || !hasCash(cost)) { say('Para afiar: ' + Object.entries(needs).map(([k, q]) => q + ' ' + bagName(k).toLowerCase()).join(', ') + ' e ' + money(cost) + '.'); AudioEngine.bad(); return; }
  takeNeeds(needs); spendCash(cost); const st = caveState(); st.refine ??= {}; st.refine[w.id] = lv;
  AudioEngine.caveAnvil(); floatNote('✨ ' + w.name + ' afiado: +' + lv + ' (' + caveDmg() + ' de dano)'); save(); refreshHUD(); dunstanShop();
}
// Saves antigos: lâmina de aço comprada do Mano Lima continua valendo pelo caminho do facão do vô.

// ---------- Equipamento campeiro ----------
CAVE_UPGRADES.push(
  { id: 'botas', name: 'Botas de garrão de potro', icon: '👢', cost: 140, desc: 'Couro macio de garrão: anda 15% mais ligeiro na caverna.' },
  { id: 'chapeu', name: 'Chapéu de aba larga', icon: '🤠', cost: 160, needs: { cobre: 3 }, desc: 'Aba firme com barbicacho: 15% menos dano em cada pancada.' },
  { id: 'guaiaca', name: 'Guaiaca de couro', icon: '👝', cost: 180, desc: 'Cinto de tropeiro com bolso: +30% de moedas dos bichos e dos baús.' },
  { id: 'bornal', name: 'Bornal de couro cru', icon: '🎒', cost: 120, desc: 'Cabe o dobro: até 10 de cada item do bolicho.' },
  { id: 'pala', name: 'Pala de lã crioula', icon: '🧣', cost: 240, requires: 'poncho', needs: { ferro: 4 }, desc: 'Por cima do poncho, lã de ovelha crioula: 180 de vida.' }
);
{
  const buy = facaoBuy;
  facaoBuy = function (id) {
    const u = CAVE_UPGRADES.find(x => x.id === id), had = caveUp(id);
    if (u?.needs && !had && !hasNeeds(u.needs)) { if (dunstanShopOpen()) { say('Falta minério: ' + Object.entries(u.needs).map(([k, q]) => q + ' ' + bagName(k).toLowerCase()).join(', ') + '.'); AudioEngine.bad(); } return; }
    buy(id); if (u?.needs && !had && caveUp(id)) { takeNeeds(u.needs); save(); dunstanShop(); }
  };
  const hp = caveMaxHp; caveMaxHp = function () { return caveUp('pala') ? 180 : hp(); };
  const bonus = movementBonus; movementBonus = function () { return bonus() + (inCave() ? (caveUp('botas') ? .15 : 0) + (caveBuff('esporas') ? .4 : 0) : 0) + (playerMounted() ? horseshoeBonus() : 0); };
}

// ---------- Bornal da caverna e bolicho do santo ----------
const CAVE_ITEMS = [
  { id: 'chimarrao', name: 'Cuia de chimarrão', icon: '🧉', art: 'mate', cost: 18, desc: 'Mate amargo bem quente: recupera 40 de vida.', heal: 40 },
  { id: 'charque', name: 'Charque', icon: '🥩', art: 'costela', cost: 8, desc: 'Carne seca de tropeiro: recupera 20 de vida.', heal: 20 },
  { id: 'canha', name: 'Trago de canha', icon: '🍶', art: 'cachaca', cost: 15, desc: 'Coragem de bolicho: +40% de dano por 20 segundos.', buff: 'canha', time: 20 },
  { id: 'esporas', name: 'Esporas de prata', icon: '✴️', cost: 20, desc: 'Um toque de espora: +40% de velocidade por 20 segundos.', buff: 'esporas', time: 20 },
  { id: 'boleadeira', name: 'Boleadeira', icon: '🪢', cost: 25, desc: 'Três pedras e tento de couro: atordoa os bichos por perto durante 3 segundos.' },
  { id: 'aguabenta', name: 'Água benta do Padre Romio', icon: '💧', cost: 30, desc: 'Contra assombração: dano em dobro no Sanguanel, Boitatá, Lobisomem, Mula, Teiniaguá e Anhangá por 30 segundos.', buff: 'aguabenta', time: 30 },
  { id: 'patua', name: 'Patuá benzido', icon: '🧿', cost: 22, desc: 'Benzido pela benzedeira da colônia: segura a próxima pancada inteirinha.', buff: 'patua', time: 9999 },
  { id: 'ticao', name: 'Tição de angico', icon: '🔥', cost: 12, desc: 'Lenha que queima devagar: clareia o andar inteiro até tu descer.' }
];
const CAVE_BELT = 5;
function caveItemIcon(i) { return i.art ? itemIconHTML(i.art) : `<span class="bag-emoji">${i.icon}</span>`; }
function caveBag() { const st = caveState(); st.bag ??= {}; return st.bag; }
function caveBagMax() { return caveUp('bornal') ? 10 : 5; }
function caveBuffs() { const st = caveState(); st.buffs ??= {}; return st.buffs; }
function caveBuff(id) { return (G?.cave?.buffs?.[id] || 0) > 0; }
function caveBeltItems() { return CAVE_ITEMS.filter(i => caveBag()[i.id] > 0).slice(0, CAVE_BELT); }
function bolichoBuy(arg) {
  if (!dunstanShopOpen()) return; const [id, n] = String(arg).split(':'), it = CAVE_ITEMS.find(x => x.id === id); if (!it) return;
  const bag = caveBag(), q = Math.min(Number(n) || 1, caveBagMax() - (bag[id] || 0)); if (q <= 0) { say('O bornal já está cheio de ' + it.name.toLowerCase() + '.'); AudioEngine.bad(); return; }
  if (!hasCash(it.cost * q)) { say('Falta dinheiro para ' + it.name.toLowerCase() + '.'); AudioEngine.bad(); return; }
  spendCash(it.cost * q); bag[id] = (bag[id] || 0) + q; AudioEngine.coins(); floatNote(it.icon + ' +' + q + ' ' + it.name.toLowerCase() + ' no bornal'); save(); refreshHUD(); dunstanShop(); caveBeltRefresh();
}
function caveUse(id) {
  if (!inCave() || caveDefeatActive() || scene) return false;
  const it = CAVE_ITEMS.find(x => x.id === id), bag = caveBag(); if (!it || !(bag[id] > 0)) return false;
  const st = caveState(), run = caveFloorRun(), p = worldOut;
  if (it.heal) { if (st.hp >= caveMaxHp()) { floatNote('Vida cheia: guarda pra hora do aperto.'); return false; } st.hp = Math.min(caveMaxHp(), st.hp + it.heal); effect('+' + it.heal + ' ❤ ' + it.name.toLowerCase(), p.x, p.y - 140, '#d8ffac', 18); fxHearts(p.x, p.y - 120, 3); AudioEngine.caveHeal(); }
  else if (it.buff) { caveBuffs()[it.buff] = it.time; effect(it.name, p.x, p.y - 140, '#ffe28a', 18); fxStars(p.x, p.y - 90, 5); AudioEngine.boost(); }
  else if (id === 'boleadeira') {
    let n = 0; for (const b of run.beasts) if (b.hp > 0 && Math.hypot(b.x - p.x, b.y - p.y) < 300) { b.stun = 3; b.state = b.state === 'charge' || b.state === 'lunge' ? 'rest' : b.state; n++; fxStars(b.x, b.y - 80, 4); }
    AudioEngine.lassoThrow(); setTimeout(() => AudioEngine.ropeHit(), 180); effect(n ? 'Boleou ' + n + (n > 1 ? ' bichos!' : ' bicho!') : 'Boleadeira no vazio…', p.x, p.y - 140, '#ffe28a', 18);
  } else if (id === 'ticao') { run.torch = true; run.ladderPing = 2.5; effect('🔥 O andar clareou!', p.x, p.y - 140, '#ffcf6a', 18); AudioEngine.ignite?.(); }
  bag[id]--; if (bag[id] <= 0) delete bag[id]; save(); caveBeltRefresh(); if (modal === 'caveBag') openCaveBag(); return true;
}
function caveBuffTick(dt) { const b = caveBuffs(); for (const k of Object.keys(b)) if (k !== 'patua') { b[k] -= dt; if (b[k] <= 0) { delete b[k]; floatNote({ canha: 'O efeito da canha passou.', esporas: 'As esporas perderam o brilho.', aguabenta: 'A água benta secou na lâmina.' }[k] || ''); } } }
function caveBuffText() { const b = caveBuffs(); return Object.keys(b).map(k => { const it = CAVE_ITEMS.find(i => i.buff === k); return it ? { canha: 'canha', esporas: 'esporas', aguabenta: 'água benta', patua: 'patuá' }[k] + (k === 'patua' ? '' : ' ' + Math.ceil(b[k]) + 's') : ''; }).filter(Boolean).join('  '); }
function openCaveBag() {
  const st = caveState(), w = caveWeapon(), bag = caveBag(), have = CAVE_ITEMS.filter(i => bag[i.id] > 0), belt = caveBeltItems();
  const items = have.length ? `<div class="store-list">${have.map(i => `<div class="supply"><span class="icon">${caveItemIcon(i)}</span><div><b>${i.name} · ${bag[i.id]}</b><p>${i.desc}${belt.includes(i) ? ' <b>Atalho: tecla ' + (belt.indexOf(i) + 1) + '</b>' : ''}</p></div><button class="primary" data-act="caveUse" data-id="${i.id}">Usar</button></div>`).join('')}</div>` : '<p class="small-note">O bornal está vazio. O bolicho de São Dunstano, no primeiro andar, vende chimarrão, charque, canha, esporas, boleadeira, água benta, patuá e tição.</p>';
  const ores = CAVE_MINERALS.filter(k => bagQty(k) > 0), equip = CAVE_UPGRADES.filter(u => caveUp(u.id) && !['afiado', 'aco'].includes(u.id));
  openDialog('Bornal da caverna', `<div class="callout"><b>${w.icon} ${w.name}${weaponRefine() ? ' +' + weaponRefine() : ''}</b> · ${caveDmg()} de dano · ❤ ${st.hp}/${caveMaxHp()}${caveBuffText() ? '<br>Efeitos: ' + caveBuffText() : ''}</div>
    <h3>Itens · teclas 1 a ${CAVE_BELT}</h3>${items}
    ${ores.length ? `<h3>Minérios</h3><div class="bag-grid cave-loot">${ores.map(k => `<div class="bag-item">${bagIcon(k)}<b>${Math.floor(bagQty(k))}</b><small>${bagName(k)}</small></div>`).join('')}</div>` : ''}
    ${equip.length ? `<h3>Equipamento</h3><p class="small-note">${equip.map(u => u.icon + ' ' + u.name).join(' · ')}</p>` : ''}
    <div class="actions"><button data-act="close">Voltar pra caverna</button></div>`, 'caveBag');
}
function caveBeltRefresh() {
  const el = $('caveBelt'); if (!el) return; const on = inCave() && !scene && !caveDefeatActive(), list = on ? caveBeltItems() : [];
  el.classList.toggle('hidden', !list.length);
  const html = list.map((i, k) => `<button type="button" data-act="caveUse" data-id="${i.id}" title="${i.name}"><small>${k + 1}</small><span>${caveItemIcon(i)}</span><em>${caveBag()[i.id]}</em></button>`).join('');
  if (el.dataset.html !== html) { el.dataset.html = html; el.innerHTML = html; }
}

// ---------- Efeitos no combate ----------
{
  const hurt = caveHurt;
  caveHurt = function (dmg, from) {
    const run = caveFloorRun(); if (caveDefeatActive() || run.floor === 1 || run.inv > 0 || run.dash) return hurt(dmg, from);
    if (caveBuffs().patua) { delete caveBuffs().patua; run.inv = .9; effect('🧿 O patuá segurou!', worldOut.x, worldOut.y - 140, '#a8e0ff', 20); AudioEngine.glass(); fxStars(worldOut.x, worldOut.y - 90, 6); caveBeltRefresh(); return; }
    return hurt(caveUp('chapeu') ? Math.max(1, Math.round(dmg * .85)) : dmg, from);
  };
  const kill = caveKill;
  caveKill = function (b) { const run = caveFloorRun(), n = run.drops.length; kill(b); if (caveUp('guaiaca')) for (const d of run.drops.slice(n)) if (d.k === 'moeda') d.q = Math.round(d.q * 1.3); };
  const loot = caveChestLoot;
  caveChestLoot = function (l) {
    if (caveUp('guaiaca') && l.cash) l.cash = Math.round(l.cash * 1.3);
    const run = caveFloorRun(), t = caveTripNow();
    if (!l.vo && run.floor > 1) { const ores = caveOresOn(run.floor); if (ores.length && Math.random() < .7) { const [k] = pick(ores); l[k] = (l[k] || 0) + 1 + (Math.random() < .35 ? 1 : 0); } }
    for (const k of Object.keys(CAVE_ORES)) if (l[k]) { bagAdd(k, l[k]); t[k] = (t[k] || 0) + l[k]; }
    return loot(l);
  };
  const beast = caveBeastTick;
  caveBeastTick = function (b, dt, run, p) { if (b.stun > 0) { b.stun -= dt; b.hurt = Math.max(0, b.hurt - dt); return; } return beast(b, dt, run, p); };
  const drawB = drawCaveBeast;
  drawCaveBeast = function (b) { drawB(b); if (b.stun > 0) for (let k = 0; k < 3; k++) { const a = frameClock * 6 + k * 2.1; txt('✦', b.x + Math.cos(a) * 22, b.y - 96 + Math.sin(a) * 6, 13, '#ffe28a'); } };
  const tick = caveTick; caveTick = function (dt) { tick(dt); if (inCave() && !paused && !modal && !scene && !caveDefeatActive()) caveBuffTick(dt); };
  const controls = caveUpdateControls; caveUpdateControls = function () { controls(); caveBeltRefresh(); };
  // Subiu pela corda (ou desmaiou): o que é de efeito passa; o patuá segue no peito.
  const leave = caveLeave; caveLeave = function (text, quiet = false) { const b = caveBuffs(); for (const k of Object.keys(b)) if (k !== 'patua') delete b[k]; return leave(text, quiet); };
}

// ---------- A ferraria de São Dunstano ----------
// ---------- Ferraduras do cavalo crioulo ----------
// Na bigorna do santo: primeiro o fole (A e D) pra esquentar o metal, depois quatro marteladas no tempo certo. Três
// marteladas boas e a ferradura sai; senão ela entorta, e o minério e o dinheiro não se perdem (é só tentar de novo).
// Montado, o cavalo anda mais ligeiro: cobre +10%, ferro +15% (a de ferro pede a de cobre antes).
const HORSESHOES = {
  cobre: { name: 'Ferraduras de cobre', icon: '🧲', needs: { cobre: 8 }, cost: 60, bonus: .10, zone: [.4, .62], speed: 1, desc: 'Leves e macias: o crioulo anda 10% mais ligeiro com o Sadi montado.' },
  ferro: { name: 'Ferraduras de ferro', icon: '🧲', needs: { ferro: 8, cobre: 2 }, cost: 120, bonus: .15, requires: 'cobre', zone: [.44, .6], speed: 1.3, desc: 'Ferro batido e cravo de cobre: 15% mais ligeiro montado, e aguentam pedra da Serra.' }
};
function horseshoes() { return mountState().shoes || null; }
function horseshoeBonus() { return HORSESHOES[horseshoes()]?.bonus || 0; }
function horseshoeOwned(id) { const h = horseshoes(); return h === id || id === 'cobre' && h === 'ferro'; }
function dunstanHorseshoesHTML() {
  return Object.entries(HORSESHOES).map(([id, s]) => {
    const own = horseshoeOwned(id), before = s.requires && !horseshoeOwned(s.requires), ok = !own && !before && hasNeeds(s.needs) && hasCash(s.cost);
    const info = own ? `<small>${horseshoes() === id ? 'No cavalo agora' : 'Trocada pela de ferro'}</small>` : before ? '<span class="req miss">antes: Ferraduras de cobre</span>' : reqChips(s.needs, s.cost);
    return forjaCard('<span class="bag-emoji">🐎</span>', s.name, s.desc, info, `<button class="primary" data-act="ferraduraBater" data-id="${id}" ${ok ? '' : 'disabled'}>${own ? '✔ No cavalo' : ok ? 'Bater na bigorna' : before ? 'Bloqueado' : 'Falta material'}</button>`, own ? 'owned' : '');
  }).join('');
}
function horseshoeForge(id) {
  const s = HORSESHOES[id]; if (!s || !dunstanShopOpen() || !mountState().owned || horseshoeOwned(id) || s.requires && !horseshoeOwned(s.requires)) return;
  if (!hasNeeds(s.needs) || !hasCash(s.cost)) { say('Falta material pra ' + s.name.toLowerCase() + '.'); AudioEngine.bad(); return; }
  closeDialog(true);
  const strike = n => ({ kind: 'timing', label: 'Martelada ' + n, text: 'Aperte <span class="keycap">E</span> quando o martelo passar na faixa verde: é ali que o metal tá no ponto.', zone: s.zone, speed: s.speed + n * .08, button: 'Martelar', hitText: 'Tum! No ponto.', missText: 'Bateu fora do ponto…' });
  startFarmGame({ title: '⚒ ' + s.name, stages: [
    { kind: 'alternate', label: 'Esquentar no fole', text: 'Alterne <span class="keycap">A</span> e <span class="keycap">D</span> no fole até o ' + bagName(Object.keys(s.needs)[0]).toLowerCase() + ' ficar vermelho.', doneText: 'O metal tá em brasa!', pitch: 620 },
    strike(1), strike(2), strike(3), strike(4)
  ], done: r => horseshoeResult(id, r), cancel: () => dunstanShop() });
}
function horseshoeResult(id, r) {
  const s = HORSESHOES[id], good = r.slice(1).filter(Boolean).length;
  if (!r[0] || good < 3) { AudioEngine.bad(); talk([['dunstano', good ? 'Entortou na ponta, vivente. Ferradura torta machuca o casco. Esquenta de novo e bate com calma.' : 'Bateu frio, e o metal não pega forma. O minério tá aqui ainda: tenta de novo.']], () => dunstanShop(), 'Tentar de novo'); return; }
  takeNeeds(s.needs); spendCash(s.cost); mountState().shoes = id; AudioEngine.caveAnvil(); setTimeout(() => AudioEngine.ready(), 380); save(); refreshHUD();
  talk([['dunstano', 'Ferradura bem batida, de ferreiro de mosteiro! Prega no casco que o crioulo nem sente.'], ['dica', '<b>🐎 ' + s.name + '</b><br>Montado, o cavalo anda ' + Math.round(s.bonus * 100) + '% mais ligeiro no mundo aberto.', 'Ferraria de São Dunstano']], () => dunstanShop(), 'Valeu, santo');
}

// Tudo da ferraria num menu só (armas, afiar, equipamento e bolicho); na aba do lado, só a venda de minérios.
let dunstanTab = 'loja';
const DUNSTAN_TABS = [['loja', '⚒ Ferraria'], ['vender', '💰 Vender minérios']];
// O que cada coisa pede: minério e dinheiro, em verde quando tem e em vermelho quando falta.
function reqChips(needs = {}, cost = 0) {
  const list = Object.entries(needs).map(([k, q]) => { const have = Math.floor(bagQty(k)); return `<span class="req ${have >= q ? 'ok' : 'miss'}">${q} ${bagName(k).toLowerCase()}${have >= q ? '' : ' · tem ' + have}</span>`; });
  if (cost) list.push(`<span class="req ${hasCash(cost) ? 'ok' : 'miss'}">${money(cost)}</span>`);
  return list.join('');
}
function forjaCard(icon, name, desc, info, btn, cls = '') { return `<div class="supply forja-card ${cls}"><span class="icon">${icon}</span><div><b>${name}</b><p>${desc}${info ? '<br>' + info : ''}</p></div>${btn}</div>`; }
function dunstanWeaponsHTML() {
  const cur = caveWeapon();
  return CAVE_WEAPONS.map(w => {
    const emoji = `<span class="bag-emoji">${w.icon}</span>`, using = cur.id === w.id;
    if (weaponOwned(w.id)) return forjaCard(emoji, w.name, w.desc, `<small>${w.id === 'facao' ? 'Dano ' + (using ? caveDmg() : 12) : w.dmg + ' de dano'}${weaponRefine(w.id) ? ' · afiado +' + weaponRefine(w.id) : ''}</small>`,
      using ? '<button disabled>✔ Na mão</button>' : `<button class="primary" data-act="forjaEquip" data-id="${w.id}">Usar</button>`, using ? 'using' : 'owned');
    const ok = hasNeeds(w.needs) && hasCash(w.cost);
    return forjaCard(emoji, w.name, w.desc, `<small>${w.dmg} de dano</small><br>${reqChips(w.needs, w.cost)}`, `<button class="primary" data-act="forjaMake" data-id="${w.id}" ${ok ? '' : 'disabled'}>${ok ? 'Forjar' : 'Falta material'}</button>`);
  }).join('');
}
function dunstanAfiarHTML() {
  const cur = caveWeapon(), lv = weaponRefine(cur.id), icon = '<span class="bag-emoji">✨</span>';
  if (lv >= AFIAR_MAX) return forjaCard(icon, 'Afiar ' + cur.name, 'Já está afiado ao máximo (+' + AFIAR_MAX + ').', '', '<button disabled>✔ Máximo</button>', 'owned');
  const needs = afiarNeeds(cur, lv + 1), cost = afiarCost(lv + 1), ok = hasNeeds(needs) && hasCash(cost);
  return forjaCard(icon, 'Afiar na pedra · +' + (lv + 1), '+3 de dano na arma que está na mão (' + cur.name + ').', reqChips(needs, cost), `<button class="primary" data-act="forjaAfiar" ${ok ? '' : 'disabled'}>${ok ? 'Afiar' : 'Falta material'}</button>`);
}
function upgradeCardHTML(u) {
  const owned = caveUp(u.id), before = u.requires && !caveUp(u.requires), ok = !owned && !before && hasCash(u.cost) && (!u.needs || hasNeeds(u.needs));
  const info = owned ? '' : before ? `<span class="req miss">antes: ${CAVE_UPGRADES.find(x => x.id === u.requires).name}</span>` : reqChips(u.needs, u.cost);
  return forjaCard(`<span class="bag-emoji">${u.icon}</span>`, u.name, u.desc, info, `<button class="primary" data-act="facaoBuy" data-id="${u.id}" ${ok ? '' : 'disabled'}>${owned ? '✔ Já é teu' : ok ? 'Comprar' : before ? 'Bloqueado' : 'Falta material'}</button>`, owned ? 'owned' : '');
}
function dunstanBolichoHTML() {
  const bag = caveBag(), max = caveBagMax();
  return CAVE_ITEMS.map(i => {
    const n = bag[i.id] || 0, full = n >= max;
    return forjaCard(caveItemIcon(i), i.name, i.desc, `<small>No bornal: ${n}/${max}</small> <span class="req ${hasCash(i.cost) ? 'ok' : 'miss'}">${money(i.cost)} cada</span>`,
      `<button class="primary" data-act="bolichoBuy" data-id="${i.id}:1" ${full || !hasCash(i.cost) ? 'disabled' : ''}>${full ? 'Bornal cheio' : 'Comprar 1'}</button>${max - n >= 3 ? `<button data-act="bolichoBuy" data-id="${i.id}:3" ${hasCash(i.cost * 3) ? '' : 'disabled'}>3 · ${money(i.cost * 3)}</button>` : ''}`);
  }).join('');
}
// A ferraria inteira: armas, afiar (e as melhorias antigas do facão do vô), equipamento e bolicho.
function dunstanLojaHTML() {
  const old = caveWeapon().id === 'facao' ? CAVE_UPGRADES.filter(u => ['afiado', 'aco'].includes(u.id)) : [];
  const sec = (title, note, html) => `<h3 class="forja-sec">${title} <small>${note}</small></h3><div class="store-list">${html}</div>`;
  return sec('⚔️ Armas', 'minério + dinheiro · a nova já vai pra mão', dunstanWeaponsHTML()) +
    sec('✨ Afiar', 'a arma que está na mão', dunstanAfiarHTML() + old.map(upgradeCardHTML).join('')) +
    sec('🧥 Equipamento', 'fica contigo pra sempre', CAVE_UPGRADES.filter(u => !['afiado', 'aco'].includes(u.id)).map(upgradeCardHTML).join('')) +
    (mountState().owned ? sec('🐎 Ferraduras', 'pro cavalo crioulo · no tempo certo da bigorna', dunstanHorseshoesHTML()) : '') +
    sec('🧉 Bolicho', 'vai pro bornal da caverna (B) · até ' + caveBagMax() + ' de cada' + (caveUp('bornal') ? '' : ' (o Bornal de couro cru dobra)'), dunstanBolichoHTML());
}
// Pra que a forja ainda usa cada minério (ajuda a decidir o que guardar e o que vender).
function oreUses(k) { return [...CAVE_WEAPONS.filter(w => !weaponOwned(w.id) && w.needs?.[k]), ...CAVE_UPGRADES.filter(u => !caveUp(u.id) && u.needs?.[k])].map(x => x.name); }
function dunstanMineralHTML() {
  return '<p class="small-note">O santo compra o minério que sobrar. Guarde o que a forja ainda vai pedir.</p><div class="store-list">' + CAVE_MINERALS.map(k => {
    const q = Math.floor(bagQty(k)), uses = oreUses(k);
    return forjaCard(bagIcon(k), bagName(k), `${q} no inventário · ${money(BAG_RAW[k].value)} cada`, uses.length ? `<small>A forja ainda usa em: ${uses.join(', ')}</small>` : '',
      `<button data-act="dunstanSell" data-id="${k}:1" ${q ? '' : 'disabled'}>Vender 1</button><button class="primary" data-act="dunstanSell" data-id="${k}:all" ${q ? '' : 'disabled'}>Vender tudo · ${money(q * BAG_RAW[k].value)}</button>`);
  }).join('') + '</div>';
}
// No topo: o que está na mão e os minérios que tu tem.
function dunstanStatusHTML() {
  const w = caveWeapon(), ores = CAVE_MINERALS.map(k => `<span class="ore" title="${bagName(k)}">${bagIcon(k)}<b>${Math.floor(bagQty(k))}</b></span>`).join('');
  return `<div class="forja-top"><span>Na mão: <b>${w.icon} ${w.name}${weaponRefine() ? ' +' + weaponRefine() : ''}</b> · ${caveDmg()} de dano · ${caveMaxHp()} de vida · <b>${money(G.cash)}</b></span><span class="forja-ores">${ores}</span></div>`;
}
dunstanShop = function () {
  if (!dunstanShopOpen()) { floatNote('Procure a ferraria de São Dunstano no primeiro andar da caverna.'); return; }
  if (!DUNSTAN_TABS.some(([id]) => id === dunstanTab)) dunstanTab = dunstanTab === 'minerios' ? 'vender' : 'loja';
  skipWorldTalk(); const box = $('dialogContent').closest('.dialog'), keep = modal === 'dunstanShop' ? box.scrollTop : 0;
  const body = dunstanTab === 'vender' ? dunstanMineralHTML() : dunstanLojaHTML();
  openDialog('Ferraria de São Dunstano', `<div class="rpg-speaker">${portraitHTML(DUNSTAN_PERSON, 72)}<div><p><b>São Dunstano</b></p><p>${pick(DUNSTAN_SHOP_LINES)}</p></div></div>${gemeosRingReady() ? `<div class="callout"><b>💍 Anel de opala pro Márcio</b><br>“Antes de santo, fui ourives. Me dá as cinco opalas que eu monto o anel do teu amigo.”<div class="actions"><button class="primary" data-act="forjaAnel">Fazer o anel (5 opalas)</button></div></div>` : ''}${dunstanStatusHTML()}<div class="phone-cat">${DUNSTAN_TABS.map(([id, label]) => `<button class="${dunstanTab === id ? 'active' : ''}" data-act="dunstanTab" data-id="${id}">${label}</button>`).join('')}</div>${body}<div class="actions"><button data-act="close">Até mais</button></div>`, 'dunstanShop');
  box.scrollTop = keep; caveUpdateControls();
};
const DUNSTAN_SHOP_LINES = ['Aqui o fogo serve pra cuidar de quem desce. O que vamos fazer hoje?', 'Minério bom vira lâmina boa. Mostra o que tu trouxe lá de baixo.', 'Antes de santo, fui ourives e ferreiro. Mão de ferreiro não esquece o ofício.', 'Leva um chimarrão no bornal: lá embaixo, vida é mais valiosa que ouro.'];
dunstanSell = function (id) {
  if (!dunstanShopOpen() || modal !== 'dunstanShop') return false;
  const [key, amount] = String(id).split(':'); if (!CAVE_MINERALS.includes(key) || !['1', 'all'].includes(amount)) return false;
  const q = amount === 'all' ? Math.floor(bagQty(key)) : 1; if (q < 1 || !bagTake(key, q)) return false;
  const value = round(q * BAG_RAW[key].value); G.cash = round(G.cash + value); AudioEngine.coins(); floatNote('São Dunstano comprou ' + q + ' ' + bagName(key).toLowerCase() + ' · +' + money(value)); save(); refreshHUD(); dunstanShop(); return true;
};

// ---------- O susto da primeira descida ----------
const DUNSTAN_TEACH = [
  ['dunstano', 'Este primeiro andar é um refúgio: aqui nenhum bicho entra. Daqui pra baixo, cada andar é mais fundo e mais brabo.'],
  ['card', '<b>Como funciona a caverna</b><br><b>Espaço</b> ou <b>F</b>: golpe · <b>Shift</b>: esquiva (depois de comprar) · <b>E</b>: escada, baú e corda<br><b>B</b>: bornal da caverna · <b>1</b> a <b>5</b>: usam os itens do bornal<br>A escada aparece quando os bichos acabam ou embaixo de uma pedra.', 'São Dunstano ensina'],
  ['dunstano', 'Quebra as pedras: lá embaixo tem cobre, ferro e ametista. Mais fundo, opala, ágata e até ouro. Quanto mais tu desce, melhor o minério.'],
  ['dunstano', 'Traz os minérios pra minha forja. Com dez ametistas e um dinheirinho eu te faço uma espada de ametista, e depois a gente afia ela. O que sobrar eu compro.'],
  ['dunstano', 'No bolicho da ferraria tem cuia de chimarrão, charque, trago de canha, esporas, boleadeira e água benta do Padre Romio. Guarda no bornal e usa na hora do aperto.'],
  ['dunstano', 'Se a vida acabar, tu desmaia e acorda na boca da gruta, mais leve no bolso. Mas ninguém precisa esperar o pior: a corda te leva de volta pra Serra quando quiser.'],
  ['sadi', 'Entendido, seu Dunstano! Vou conhecer a forja antes de descer.']
];
function dunstanTeach() { talk(DUNSTAN_TEACH.map(l => [...l]), () => { caveState().dunstanTaught = true; giveCard('dunstano', 'conversa no refúgio'); save(); }, 'Explorar o refúgio'); }
function dunstanFirstMeeting() {
  if (!scenesEnabled()) { dunstanTeach(); return; }
  const s = caveCenter(...CAVE.start), forge = { x: DUNSTAN_FORGE.x + DUNSTAN_FORGE.w / 2, y: DUNSTAN_FORGE.y + 40 };
  const ghost = (a, y) => expansionSprite('cave-props-v1', 10, a.x, y + 6, 150, a.dx < 0);
  playSteps([...sceneWorld({ map: 'caverna', x: 470, y: 780, night: .72, lights: [{ x: forge.x, y: forge.y, r: 260, a: .38, color: '255,150,60' }] }),
    { do: () => { Object.assign(DUNSTAN, { x: -900, y: -900, wait: 99 }); } }, { actor: 'sadi', x: s.x, y: s.y - 10, dx: 1, dy: -1 }, { fade: 'in', time: 1 },
    { walk: 'sadi', to: { x: 400, y: 860 } },
    { say: 'sadi', text: 'Que escuridão… e esse barulho de martelo batendo, lá no fundo?' },
    { do: () => [0, 380, 760].forEach(t => setTimeout(() => AudioEngine.caveAnvil(), t)) }, { wait: 1.2 },
    { actor: 'dunstano', x: 560, y: 760, dx: -1, alpha: 0, alphaTo: .85, ghost: true, draw: ghost }, { do: () => { AudioEngine.caveGhost(); } }, { wait: 1.4 },
    sceneSet('sadi', { hop: 22 }), { do: () => { sceneShout('Bah!', 400, 700, '#ffe28a', 22); AudioEngine.ouch(); } },
    { say: 'sadi', text: 'Bah! Uma assombração! Valei-me, Nossa Senhora!' },
    sceneSet('sadi', { hop: 0, speed: 320 }), { walk: 'sadi', to: { x: 300, y: 900 } }, sceneSet('sadi', { dx: 1 }),
    { say: 'dunstano', text: 'Calma, vivente! Assombração que bate ferro não faz mal pra ninguém.' },
    { say: 'dunstano', text: 'Sou Dunstano. Fui ferreiro e ourives antes de ser santo, lá na Inglaterra, faz mais de mil anos.' },
    { say: 'sadi', text: 'Um santo… numa gruta da Serra Gaúcha?!' },
    { say: 'dunstano', text: 'Onde tem forja acesa e gente de coragem, eu apareço. Teu vô me conheceu: desceu aqui com esse mesmo facão de cabo de chifre.' },
    sceneSet('sadi', { speed: 150 }), { walk: 'sadi', to: { x: 440, y: 840 } },
    { say: 'sadi', text: 'O vô?! Então… me ensina como é que se anda aqui embaixo.' }, { fade: 'out', time: .6 }], 'caverna-dunstano', () => { Object.assign(DUNSTAN, { x: 560, y: 760, dx: -1, dy: 0, wait: 3 }); dunstanTeach(); });
}
{
  const meet = dunstanTalk;
  dunstanTalk = function () { if (!caveState().dunstanTaught) { if (!scene && modal !== 'talk') dunstanFirstMeeting(); return; } meet(); };
  // Aparição na cena: o fantasma surge aos poucos, com o brilho azul dele.
  const tick = sceneTick;
  sceneTick = function (dt) { tick(dt); for (const a of Object.values(scene?.actors || {})) if (a.alphaTo != null) { a.alpha = Math.min(a.alphaTo, (a.alpha || 0) + dt * .7); if (a.alpha >= a.alphaTo) a.alphaTo = null; } };
}
Object.assign(AudioEngine, {
  caveAnvil() { this.note(1180, .09, 'square', .03); this.pop(3200, .2, .03); this.note(2360, .25, 'sine', .025, .01); this.note(140, .06, 'triangle', .06); },
  caveGhost() { this.caveVoice?.([220, 330, 260], 1.6, { type: 'sine', formant: 700, q: .8, vol: .035, vib: 6, rate: 4 }); this.hiss(1.2, .03, 3000); }
});

// ---------- Lore: o que ele conta, na gruta e na estrada ----------
// Fatos do Dunstano histórico (Inglaterra, século X) e os causos que o povo conta dele; os causos vêm como causos.
const DUNSTAN_LORE = [
  [['dunstano', 'Nasci lá pelo ano de 909, perto de Glastonbury, na Inglaterra. Meu nome, no inglês antigo, é algo como “pedra escura” ou “pedra do morro”.'], ['sadi', 'Pedra escura… combina com a gruta!'], ['dunstano', 'Por isso eu me sinto em casa aqui embaixo, vivente.']],
  [['dunstano', 'Fui abade de Glastonbury. Arrumei o mosteiro pela regra de São Bento: oração, estudo e trabalho com as mãos.'], ['dunstano', 'E trabalho com as mãos, pra mim, era fole, bigorna e martelo.']],
  [['dunstano', 'Eu era ferreiro, ourives, pintava livro e tocava harpa. Por isso até hoje ferreiros, ourives e músicos me têm como padroeiro.'], ['sadi', 'Bah, então o senhor é padroeiro do Baitaca também!'], ['dunstano', 'Se ele tocar com fé, sou sim!']],
  [['dunstano', 'O causo mais contado é este: o diabo apareceu na minha forja, disfarçado. Eu peguei ele pelo nariz com a tenaz em brasa.'], ['sadi', 'Pelo nariz?!'], ['dunstano', 'Saiu berrando que se ouviu três léguas. É causo, mas é dos bons.']],
  [['dunstano', 'Outro causo: o diabo veio pedir ferradura pro casco dele. Eu preguei com tanta força que ele implorou pra eu tirar.'], ['dunstano', 'Só tirei quando jurou nunca entrar em casa com ferradura na porta. Dizem que daí vem a ferradura da sorte.'], ['sadi', 'Vou pregar uma na porta da bodega!']],
  [['dunstano', 'Tive briga com um rei moço, o Eadwig, e fui mandado pro exílio em Gante, em Flandres.'], ['dunstano', 'Lá conheci mosteiros reformados e voltei com ideia nova. Às vezes o exílio ensina mais que a casa.']],
  [['dunstano', 'Fui arcebispo de Cantuária de 959 até morrer. Em 973 coroei o rei Edgar, em Bath.'], ['dunstano', 'O jeito que montei aquela coroação ainda é a base da coroação dos reis ingleses.'], ['sadi', 'E agora o senhor coroa bodegueiro com espada de ametista.']],
  [['dunstano', 'Morri num 19 de maio, em 988, em Cantuária. Os ourives de Londres contaram o ano da marca do ouro a partir do meu dia por uns seiscentos anos.'], ['dunstano', 'Por isso, quando tu me traz minério bom, eu sinto o cheiro da ourivesaria de novo.']],
  [['dunstano', 'Dizem que a minha harpa, pendurada na parede, tocou sozinha um hino.'], ['dunstano', 'Eu não confirmo nem desminto. Mas aqui na gruta, quando venta pela fenda, parece música.']]
];
// Na gruta, as falas de conselho ganham também a lore curtinha.
WORLD_TALK.dunstano.push(
  { player: 'De onde o senhor é, afinal?', reply: 'De perto de Glastonbury, na Inglaterra. Nasci lá pelo ano de 909. Dunstan quer dizer algo como “pedra escura”.' },
  { player: 'É verdade o causo do diabo e da tenaz?', reply: 'Dizem que peguei o diabo pelo nariz com a tenaz em brasa. Causo de ferreiro… mas olha bem a minha tenaz.' },
  { player: 'O senhor é padroeiro de quem?', reply: 'De ferreiros, ourives e músicos. Quem bate ferro ou toca gaita pode contar comigo.' },
  { player: 'O que eu faço com tanto minério?', reply: 'Cobre e ferro viram facão; ametista vira espada. Afiar também gasta minério. O resto eu compro.' }
);
function dunstanLoreTalk() {
  const st = caveState(), k = (st.lore || 0) % DUNSTAN_LORE.length; st.lore = (st.lore || 0) + 1; save();
  talk(DUNSTAN_LORE[k].map(l => [...l]), null, 'Seguir a estrada');
}
// Em algumas noites, depois da primeira descida, o santo sai da gruta e caminha pela estrada da Serra.
let dunstanOut = null, dunstanOutKey = '';
function dunstanWalksTonight() {
  if (!G.cave?.dunstanTaught || !worldNight() || prologueActive()) return false;
  return caveRand(G.day * 733 + 11)() < .3;
}
function dunstanOutTick(dt) {
  const M = worldMap();
  if (M.id !== 'serra' || !dunstanWalksTonight()) { dunstanOut = null; dunstanOutKey = ''; return; }
  const key = G.day + ':serra'; if (key !== dunstanOutKey) { dunstanOutKey = key; const r = randomRoadWalker(M, caveRand(G.day * 97 + 5)); dunstanOut = r ? { ...r, map: 'serra' } : null; }
  const w = dunstanOut; if (!w) return; w.walk = false;
  if (paused || modal || scene || worldTalkOpen() && Math.hypot(w.x - worldOut.x, w.y - worldOut.y) < 200) return;
  const target = w.line[w.seg + (w.dir > 0 ? 1 : 0)], dx = target[0] - w.x, dy = target[1] - w.y, d = Math.hypot(dx, dy), step = 38 * dt;
  w.walk = d > 1; if (d <= step) { w.x = target[0]; w.y = target[1]; w.seg += w.dir; if (w.seg < 0 || w.seg >= w.line.length - 1) { w.dir = -w.dir; w.seg = clamp(w.seg, 0, w.line.length - 2); } } else { w.dx = dx / d; w.dy = dy / d; w.x += w.dx * step; w.y += w.dy * step; }
}
{
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); dunstanOutTick(dt); if (inCave()) caveBeltRefresh(); else if ($('caveBelt') && !$('caveBelt').classList.contains('hidden')) $('caveBelt').classList.add('hidden'); };
  const spots = walkerSpots; walkerSpots = function () { const list = spots(), w = dunstanOut; if (w && worldOut?.map === w.map) list.push({ id: 'walker:dunstano', x: w.x, y: w.y, label: 'Prosear com São Dunstano (a assombração da gruta)', act: dunstanLoreTalk }); return list; };
  const landscape = worldLandscape;
  worldLandscape = function (M, seen, layers, view) {
    landscape(M, seen, layers, view); const w = dunstanOut; if (!w || M.id !== w.map || !seen(w.x, w.y)) return;
    layers.push({ y: w.y, draw: () => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(w.x, w.y - 70, 150, .3 + .06 * Math.sin(frameClock * 3), '120,190,255'); ctx.restore(); ctx.save(); ctx.globalAlpha = .78; personDraw(PEOPLE[DUNSTAN_PERSON].sprite, w.x, w.y - Math.sin(frameClock * 2) * 3, w.walk, false, w.dx, false, 0, w.dy); ctx.restore(); } });
  };
}

// ---------- Teclas e ações ----------
{
  const act = action;
  action = function (name, id) {
    if (name === 'dunstanTab') { dunstanTab = id === 'minerios' || id === 'vender' ? 'vender' : 'loja'; if (modal === 'dunstanShop') $('dialogContent').closest('.dialog').scrollTop = 0; dunstanShop(); return; }
    if (name === 'forjaMake') { forjaMake(id); return; }
    if (name === 'forjaEquip') { forjaEquip(id); return; }
    if (name === 'forjaAfiar') { forjaAfiar(); return; }
    if (name === 'forjaAnel') { gemeosMakeRing(); return; }
    if (name === 'ferraduraBater') { horseshoeForge(id); return; }
    if (name === 'bolichoBuy') { bolichoBuy(id); return; }
    if (name === 'caveUse') { if (caveDefeatActive()) return; caveUse(id); return; }
    return act(name, id);
  };
  // Na caverna, B abre o bornal dela (e não o inventário da bodega); 1 a 5 usam os itens do cinto.
  document.addEventListener('keydown', e => {
    if (!inCave() || e.repeat || scene || caveDefeatActive() || ['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    if (key === 'b' && (!modal || modal === 'caveBag')) { e.preventDefault(); e.stopImmediatePropagation(); if (modal === 'caveBag') closeDialog(true); else if (!phoneOpen) openCaveBag(); return; }
    const n = Number(key); if (!modal && !phoneOpen && n >= 1 && n <= CAVE_BELT) { const it = caveBeltItems()[n - 1]; if (it) { e.preventDefault(); e.stopImmediatePropagation(); caveUse(it.id); } }
  }, true);
}
document.addEventListener('DOMContentLoaded', () => { $('hudLayer')?.insertAdjacentHTML('beforeend', '<div id="caveBelt" class="horta-bar cave-belt hidden" aria-label="Bornal da caverna"></div>'); });
