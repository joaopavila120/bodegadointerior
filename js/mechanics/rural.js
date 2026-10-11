// Vida no campo: o inventário do Sadi, as compras nas lojas da Fronteira, o ritmo do dia, o curral (galinhas, codornas,
// vaca e bois) e a mesa de conservas.
// O que a bodega vende sai da roça: horta, curral, forno e tacho (prologue.js). Nas lojas só se compra o que não dá na
// roça: bebida, cigarro, amendoim, vidros, bacon e salame. Ao entrar na bodega, o que é de balcão vai para a despensa.
'use strict';

// ---------- Inventário ----------
// Além dos produtos da bodega (GOODS), o inventário leva o que vem cru do campo.
const BAG_RAW = {
  alface: { name: 'Alface', icon: '🥬', to: 'salada', mult: 2, value: .7 },
  trigo: { name: 'Trigo', icon: '🌾', value: .6, note: 'vira pão de xis no forno a lenha da bodega' },
  leite: { name: 'Leite', icon: '🥛', value: .4, note: 'vira queijo no tacho da bodega' },
  pepino_cru: { name: 'Pepino', icon: '🥒', value: .5 },
  ovo_codorna: { name: 'Ovo de codorna', icon: '🥚', value: .35 },
  conserva_pepino: { name: 'Pote pronto de pepino em conserva', icon: '🥒', to: 'pepino', unlock: 'pepino', value: 4 },
  conserva_codorna: { name: 'Pote pronto de ovos de codorna', icon: '🥚', to: 'codorna', value: 4.5 },
  vidro: { name: 'Vidro vazio de conserva', icon: '🫙', value: .5 },
  peixe: { name: 'Peixe do rio', icon: '🐟', value: 4, note: 'dourado ou jundiá, fisgado no trapiche' },
  butia: { name: 'Butiá', icon: '🟠', value: .5 }, pitanga: { name: 'Pitanga', icon: '🍒', value: .8 }, guabiroba: { name: 'Guabiroba', icon: '🟡', value: .8 },
  racao: { name: 'Saco de ração', icon: '🌽', value: 2 },
  uva: { name: 'Cacho de uva', icon: '🍇', value: .9, note: 'vira vinho de garrafão na mesa de compota' },
  garrafao: { name: 'Garrafão vazio', icon: '🍶', value: .6 }
};
function bagState(g = G) { g.bag ??= {}; return g.bag; }
function bagQty(k) { return bagState()[k]?.q || 0; }
function bagName(k) { return BAG_RAW[k]?.name || nameOf(k); }
function bagIcon(k) { return BAG_RAW[k] ? `<span class="bag-emoji">${BAG_RAW[k].icon}</span>` : itemIconHTML(k); }
function bagBulk(k) { return !BAG_RAW[k] && !!bulk(k); }
function bagText(k, q = bagQty(k)) { return bagBulk(k) ? formatWeight(q) : Math.floor(q) + ' un.'; }
// Coloca no inventário (sem limite de carga).
function bagAdd(k, q, cost = 0) { if (!(q > 0)) return 0; unlockGood(k); const e = bagState()[k] ??= { q: 0, c: 0 }; e.q += q; e.c += cost; return q; }
function bagTake(k, q) { const e = bagState()[k]; if (!e || e.q < q) return false; e.c -= e.c * q / e.q; e.q -= q; if (e.q <= .001) delete bagState()[k]; return true; }
function showBag() {
  const b = bagState(), keys = Object.keys(b), shelf = Object.keys(GOODS).filter(k => unlocked(k) && G.stock[k] > 0 && !GOODS[k].noSupplier);
  openDialog('Inventário do Sadi', `<p>O que é de balcão vai para a despensa quando você entra na bodega.</p>` +
    (keys.length ? `<div class="bag-grid">${keys.map(k => `<div class="bag-item">${bagIcon(k)}<b>${bagText(k)}</b><small>${bagName(k)}</small></div>`).join('')}</div>` : '<p class="small-note">O inventário está vazio.</p>') +
    `<h3>Itens na bodega</h3>` + (shelf.length ? `<div class="bag-grid">${shelf.map(k => `<div class="bag-item">${itemIconHTML(k)}<b>${stockText(k)}</b><small>${nameOf(k)}</small></div>`).join('')}</div>` : '<p class="small-note">A despensa da bodega está vazia.</p>'), 'worldStore');
}
// Ao entrar na bodega: o que é de balcão vai para a despensa (estoque). O que é cru fica no inventário.
// O que o Sadi ganha, colhe ou produz já fica liberado para vender no balcão (salame do Badin, pinhão, bergamota, vinho…).
const HARVEST_UNLOCKS = ['bergamota', 'pinhao', 'vinho'];
function unlockGood(k) {
  const g = GOODS[k]; if (!g?.unlock || G.up[g.unlock] || g.removed) return false;
  G.up[g.unlock] = true; G.upOwned ??= {}; G.upOwned[g.unlock] = true;
  if (k === 'salame' && !G.toastLesson) G.toastLesson = { day: G.day + 1, done: false, actor: null };
  showBanner('Novo no balcão: ' + nameOf(k), 'O que tu ganha, colhe ou produz já pode ser vendido na bodega.', 'level', { world: true });
  if (HARVEST_UNLOCKS.includes(k)) valterTip(k);
  return true;
}
function depositBag() {
  const b = bagState(), done = [], kept = [];
  for (const k of Object.keys(b)) {
    const raw = BAG_RAW[k], target = raw ? raw.to : GOODS[k] ? k : null, mult = raw?.mult || 1; if (!target) continue;
    if (raw?.unlock && !G.up[raw.unlock]) { G.up[raw.unlock] = true; showBanner(nameOf(target) + ' liberado!', 'A conserva da casa já pode ser vendida no balcão.', 'level'); valterTip('compota'); }
    if (!raw?.unlock) unlockGood(target);
    if (!unlocked(target)) { kept.push(bagName(k)); continue; }
    const e = b[k], room = Math.max(0, stationCapacity(target) - G.stock[target]), q = Math.min(e.q, Math.floor(room / mult)); if (q <= 0) continue;
    const cost = e.c * q / e.q, units = G.stock[target], n = q * mult; G.avg[target] = (G.avg[target] * units + cost) / (units + n); G.stock[target] += n;
    bagTake(k, q); done.push(stockText(target, n) + ' ' + nameOf(target).toLowerCase());
  }
  if (done.length) { showBanner('Guardado na despensa', done.slice(0, 4).join(' · ') + (done.length > 4 ? ' e mais ' + (done.length - 4) : ''), 'gift'); AudioEngine.coins(); }
  if (kept.length) say('Ficou no inventário: ' + kept.join(', ') + '.');
  if (done.length) save();
}

// ---------- Lojas da Fronteira ----------
// Atacado (bebida, cigarro, amendoim e vidros), Açougue (carne de porco: bacon e salame), Armazém Querência (sementes,
// mudas e adubo; compra a colheita) e Casa do Campeiro (animais, ração e equipamento).
const STORE_GOODS = {
  atacado: ['cerveja', 'refri', 'cachaca', 'bitter', 'cafe', 'cigarro', 'amendoim', 'azeite'],
  acougue: ['bacon'],
  agro: [],
  badin: ['salame']
};
const STORE_INFO = {
  atacado: { name: 'Atacado da Fronteira', text: 'O que não dá na roça: bebida, cigarro, amendoim torrado e vidros de conserva.' },
  acougue: { name: 'Açougue da Fronteira', text: 'Carne de porco: bacon. O salame de colônia vem da nona do Badin, na Serra.' },
  badin: { name: 'Despensa da colônia do Badin', text: 'Salame curado pela nona e muda de parreira da colônia. A uva vira vinho de garrafão na mesa de compota da bodega.' },
  agro: { name: 'Armazém Querência', text: 'Sementes, mudas e adubo para a horta. Aqui também se vende a colheita.' },
  gado: { name: 'Casa do Campeiro', text: 'Animais, ração e equipamento de campo.' },
  ferragem: { name: 'Ferragem da Fronteira', text: 'Móveis, equipamentos e melhorias para a bodega. Comprou, já sai instalado. No celular dá para ver e guardar o que é da casa.' }
};
// De onde vem cada produto da bodega (lista de compras do celular e tutorial).
const FARM_SOURCES = {
  pao_xis: 'forno a lenha (trigo da horta)', salada: 'horta (alface)', ovo: 'ninhos do curral', queijo: 'tacho (leite da vaca)', queijo_colonial: 'tacho (leite da vaca)',
  burger: 'carneação do boi', costela_crua: 'carneação do boi', coracao: 'carneação do boi', erva: 'erveira da horta', bergamota: 'bergamoteira da horta', pinhao: 'araucária da horta',
  codorna: 'conserva: ovos de codorna + vidro', pepino: 'compota: pepino + vidro', vinho: 'mesa de compota: uva da parreira + garrafão', salame: 'despensa do Badin, na Serra', maionese: 'tigela do costelão', costela: 'fogo de chão do costelão'
};
function goodSource(k) { const store = Object.keys(STORE_GOODS).find(s => STORE_GOODS[s].includes(k)); return store ? STORE_INFO[store].name : FARM_SOURCES[k] || ''; }
function goodPack(k) { return GOODS[k].pack || 6; }
function goodCard(k) {
  const g = GOODS[k], q = goodPack(k), cost = round(q * g.cost);
  return `<div class="supply"><span class="icon">${itemIconHTML(k)}</span><div><b>${nameOf(k)}</b><p>Na bodega: <b>${stockText(k)}</b> · no inventário: <b>${bagText(k)}</b></p></div><button class="primary" data-act="storeBuy" data-id="${k}" ${hasCash(cost) ? '' : 'disabled'}>Comprar ${stockText(k, q)} · ${money(cost)}</button></div>`;
}
function extraCard(id, icon, name, note, cost, label, ok = true) { return `<div class="supply"><span class="icon">${icon.startsWith('<') ? icon : '<span class="bag-emoji">' + icon + '</span>'}</span><div><b>${name}</b><p>${note}</p></div><button class="primary" data-act="storeExtra" data-id="${id}" ${ok && hasCash(cost) ? '' : 'disabled'}>${label}</button></div>`; }
function storeShop(id) {
  const info = STORE_INFO[id], goods = (STORE_GOODS[id] || []).filter(k => GOODS[k] && unlocked(k));
  let extra = '';
  if (id === 'agro') extra = '<h3>Para a horta · nível ' + hortaLevel() + '</h3><div class="store-list">' + hortaSeedCards(k => !CROPS[k].shop) + '</div>' + sellSection();
  if (id === 'badin') extra = '<h3>Para a horta</h3><div class="store-list">' + hortaSeedCards(k => CROPS[k].shop === 'badin', false) + '</div>';
  if (id === 'atacado') extra = '<h3>Para as conservas</h3><div class="store-list">' + extraCard('vidro', '🫙', 'Vidros de conserva (4)', 'Ovos de codorna ou pepino + vidro viram conserva na mesa de compota da cozinha · vidros vazios no inventário: ' + bagQty('vidro'), 4, 'Comprar · ' + money(4)) + (G.badinShop ? extraCard('garrafao', '🍶', 'Garrafões vazios (2)', 'Uva da parreira + garrafão vira vinho de garrafão na mesa de compota · no inventário: ' + bagQty('garrafao'), 6, 'Comprar · ' + money(6)) : '') + '</div>';
  if (id === 'ferragem') extra = ferragemCards();
  if (id === 'acougue' && !goods.length) extra = '<p class="small-note">O bacon aparece aqui quando o xis bacon for liberado na Ferragem. Salame, só com a nona do Badin, na Serra.</p>';
  if (id === 'gado') extra = campeiroCards();
  openDialog(info.name, `<p>${info.text}</p>` + shopMissionNote(id) + (goods.length ? `<div class="store-list">${goods.map(goodCard).join('')}</div>` : '') + extra, 'worldStore');
  G.lastStore = id;
}
function refreshStore() { if (modal === 'worldStore' && G.lastStore) storeShop(G.lastStore); }
// Aviso da missão no topo do caixa: o que comprar, na quantidade certa, e o que já foi.
function shopMissionNote(store) {
  const st = prologueStep(), list = st && PROLOGUE_SHOPPING[st.id];
  if (list && list.store === store) { const done = list.items.every(i => i[2]()); return `<div class="callout mission-note"><b>Missão · ${st.title}</b><ul class="shop-checklist">${list.items.map(([name, q, ok]) => `<li class="${ok() ? 'ok' : ''}">${ok() ? '✔' : '☐'} <b>${name}</b> · ${q}</li>`).join('')}</ul>${done ? '<p><b>Tudo comprado!</b> Pode sair da loja.</p>' : ''}</div>`; }
  if (store === 'ferragem' && missionActive('trago') && !upgradeOwned('trago')) return '<div class="callout mission-note"><b>Missão · Trago de pura</b><ul class="shop-checklist"><li>☐ <b>Mesa de tragos</b> · 1 (o Valter já acertou: sai de graça)</li></ul></div>';
  return '';
}
// Retorno no botão da compra: pisca verde e marca o que entrou.
function buyFeedback(act, id, text) {
  const b = document.querySelector(`#dialogContent [data-act="${act}"][data-id="${id}"]`); if (!b) return;
  b.classList.remove('flash-ok'); void b.offsetWidth; b.classList.add('flash-ok');
  const card = b.closest('.supply'); if (card && text) { card.querySelector('.bought-tag')?.remove(); const t = document.createElement('span'); t.className = 'bought-tag'; t.textContent = '✔ ' + text; card.appendChild(t); }
}
// Ferragem: as melhorias da bodega (as botas e o bodoque ficam na Casa do Campeiro).
const FERRAGEM_SKIP = ['bootsGaucho', 'bootsBagual', 'bodoque'];
function upgradeOwned(id) { return !!G.up[id] || !!G.upOwned?.[id]; }
function upgradeMissing(u) { const m = []; if (bodegaLevel() < (u.level || 1)) m.push('nível ' + u.level); if (G.rep < u.rep) m.push('reputação ' + u.rep); if (!hasCash(u.cost)) m.push(money(u.cost)); if (u.requires && !upgradeOwned(u.requires)) m.push(UPGRADES.find(v => v.id === u.requires).name); return m; }
function ferragemCards() {
  return UPGRADE_TABS.map(cat => {
    const list = UPGRADES.filter(u => upgradeCategory(u) === cat && !u.shop && !FERRAGEM_SKIP.includes(u.id)); if (!list.length) return '';
    return '<h3>' + cat + '</h3><div class="store-list">' + list.map(u => { const own = upgradeOwned(u.id), miss = own ? [] : upgradeMissing(u); return `<div class="supply"><span class="icon">${upgradeIconHTML(u.id) || '<span class="bag-emoji">🔧</span>'}</span><div><b>${u.name}</b><p>${u.desc}${u.level > 1 ? ' · nível ' + u.level : ''}${u.rep ? ' · reputação ' + u.rep : ''}</p></div><button class="primary" data-act="upgrade" data-id="${u.id}" ${own || miss.length ? 'disabled' : ''}>${own ? 'Já é da casa' : miss.length ? 'Falta: ' + miss.join(' + ') : u.cost === 0 ? 'Levar de graça' : 'Comprar · ' + money(u.cost)}</button></div>`; }).join('') + '</div>';
  }).join('');
}
// No balcão (Personalizar bodega): melhorias que são móveis podem ser guardadas e reinstaladas (de graça) fora do expediente.
function moveisSection() {
  const list = REMOVABLE_UPGRADES.filter(upgradeOwned).map(id => UPGRADES.find(u => u.id === id)).filter(Boolean); if (!list.length) return '';
  return '<h3>Móveis da bodega</h3><p class="small-note">Guarde ou reinstale de graça, fora do expediente.</p><div class="store-list">' + list.map(u => `<div class="supply"><span class="icon">${upgradeIconHTML(u.id) || '<span class="bag-emoji">🪑</span>'}</span><div><b>${u.name}</b><p>${G.up[u.id] ? 'Instalado na bodega' : 'Guardado no depósito'}</p></div><button data-act="upgradeToggle" data-id="${u.id}" aria-pressed="${!!G.up[u.id]}">${G.up[u.id] ? 'Guardar' : 'Instalar de novo'}</button></div>`).join('') + '</div>';
}
const REMOVABLE_UPGRADES = ['trago', 'coffee', 'bitter', 'table3', 'table4', 'grill3', 'tray', 'placaFiado'];
function toggleUpgrade(id) {
  if (!REMOVABLE_UPGRADES.includes(id) || !upgradeOwned(id)) return;
  if (['open', 'closing'].includes(G.phase)) { warnDialog('Expediente aberto', 'Guardar ou reinstalar móveis só antes de abrir ou depois de encerrar o expediente.'); return; }
  G.upOwned ??= {}; G.upOwned[id] = true; G.up[id] = !G.up[id];
  if (!canWalk(G.player.x, G.player.y)) { const goal = physicalGoal(G.player.x, G.player.y); G.player.x = goal.x; G.player.y = goal.y; }
  say(UPGRADES.find(u => u.id === id).name + (G.up[id] ? ' instalado de novo.' : ' guardado no depósito.')); AudioEngine.tick(); save(); renderPhone(); refreshStore(); refreshCustomize();
}
function upgradePhonePanel() {
  const owned = UPGRADES.filter(u => upgradeOwned(u.id) && !u.shop), forSale = UPGRADES.filter(u => !upgradeOwned(u.id) && !u.shop);
  return `<div class="phone-intro"><h3>Melhorias da bodega</h3><p>${owned.length} da casa. Comprar é na <b>Ferragem da Fronteira</b> (botas e bodoque na Casa do Campeiro). Aqui dá para ver e guardar os móveis.</p></div>` +
    owned.map(u => `<div class="upgrade"><h3>${upgradeIconHTML(u.id)}${u.name}</h3><p>${u.desc}</p>${REMOVABLE_UPGRADES.includes(u.id) ? `<button data-act="upgradeToggle" data-id="${u.id}" aria-pressed="${!!G.up[u.id]}">${G.up[u.id] ? 'Instalado ✓ · guardar' : 'Guardado · instalar de novo'}</button>` : '<p class="small-note">Melhoria permanente.</p>'}</div>`).join('') +
    (forSale.length ? '<h3 class="phone-section">À venda</h3>' + forSale.map(u => `<div class="upgrade"><h3>${upgradeIconHTML(u.id)}${u.name}</h3><p>${u.desc}</p><button disabled>À venda na ${FERRAGEM_SKIP.includes(u.id) ? 'Casa do Campeiro' : 'Ferragem da Fronteira'} · ${u.cost ? money(u.cost) : 'grátis'}</button></div>`).join('') : '') + gearPanel();
}
// Compra no balcão: vai para o inventário.
function storeBuy(k) {
  const g = GOODS[k]; if (!g || !unlocked(k)) return;
  const q = goodPack(k), cost = round(q * g.cost);
  if (!hasCash(cost)) { worldSay('Não há dinheiro para este pacote.'); AudioEngine.bad(); return; }
  spendCash(cost); G.stats.purchases += cost; bagAdd(k, q, cost); AudioEngine.coins(); save(); refreshStore(); buyFeedback('storeBuy', k, '+' + stockText(k, q) + ' no inventário');
}
function storeExtra(id) {
  const buy = (cost, fn) => { if (!hasCash(cost)) { worldSay('Não há dinheiro para isso.'); AudioEngine.bad(); return false; } spendCash(cost); G.stats.purchases += cost; fn(); AudioEngine.coins(); return true; };
  const r = ranchState();
  if (id === 'vidro') buy(4, () => bagAdd('vidro', 4, 4));
  else if (id === 'garrafao') buy(6, () => bagAdd('garrafao', 2, 6));
  else if (id === 'boi') buyBoi();
  else if (id === 'vaca') { if (r.cows < RANCH_MAX.cows) buy(VACA_COST, () => r.cows++); }
  else if (id === 'galinha') { if (r.hens < RANCH_MAX.hens) buy(15, () => r.hens++); }
  else if (id === 'codorna') { if (r.quails < RANCH_MAX.quails) buy(10, () => r.quails++); }
  else if (id === 'racao') buy(6, () => bagAdd('racao', 1, 6));
  else if (['bodoque', 'bootsGaucho', 'bootsBagual'].includes(id)) buyUpgrade(id);
  save(); refreshStore(); buyFeedback('storeExtra', id, 'Comprado');
}
function campeiroCards() {
  const r = ranchState(), gear = ['bodoque', 'bootsGaucho', 'bootsBagual'].map(id => UPGRADES.find(u => u.id === id)).filter(Boolean);
  const gearCard = u => { const owned = !!G.up[u.id], needs = u.requires && !G.up[u.requires], low = bodegaLevel() < (u.level || 1); return extraCard(u.id, upgradeIconHTML(u.id) || '🥾', u.name, u.desc, u.cost, owned ? 'Já é seu' : needs ? 'Antes: ' + UPGRADES.find(x => x.id === u.requires).name : low ? 'Bodega nível ' + u.level : 'Comprar · ' + money(u.cost), !owned && !needs && !low); };
  return '<h3>Animais e ração</h3><div class="store-list">' +
    extraCard('boi', '🐂', 'Boi', 'Laçado e carneado rende ' + MANTAS_PER_BOI + ' mantas de costela e 24 hambúrgueres · rebanho: ' + (G.herd || 0), BOI_COST, 'Comprar · ' + money(BOI_COST)) +
    extraCard('vaca', '🐄', 'Vaca de leite', 'Dá leite todo dia; o tacho da bodega faz o queijo · você tem ' + r.cows + '/' + RANCH_MAX.cows, VACA_COST, r.cows < RANCH_MAX.cows ? 'Comprar · ' + money(VACA_COST) : 'Curral cheio', r.cows < RANCH_MAX.cows) +
    extraCard('galinha', '🐔', 'Galinha caipira', 'Bota um ovo por dia, se comer · você tem ' + r.hens + '/' + RANCH_MAX.hens, 15, r.hens < RANCH_MAX.hens ? 'Comprar · ' + money(15) : 'Galinheiro cheio', r.hens < RANCH_MAX.hens) +
    extraCard('codorna', '🐦', 'Codorna', 'Bota um ovinho por dia, se comer · você tem ' + r.quails + '/' + RANCH_MAX.quails, 10, r.quails < RANCH_MAX.quails ? 'Comprar · ' + money(10) : 'Codorneira cheia', r.quails < RANCH_MAX.quails) +
    extraCard('racao', '🌽', 'Saco de ração', 'Um saco alimenta o curral inteiro por um dia', 6, 'Comprar · ' + money(6)) +
    '</div><h3>Equipamento</h3><div class="store-list">' + gear.map(gearCard).join('') + '</div>' + bootsPanel();
}
// Venda no Armazém: o que é colhido ou produzido e está no inventário.
const SELLABLE = ['alface', 'trigo', 'leite', 'peixe', 'butia', 'pitanga', 'guabiroba', 'pepino_cru', 'ovo', 'ovo_codorna', 'conserva_pepino', 'conserva_codorna', 'bergamota', 'pinhao', 'erva'];
function sellPrice(k, q) { return round(BAG_RAW[k] ? BAG_RAW[k].value * q : (bagBulk(k) ? q / 1000 * (GOODS[k].price || GOODS[k].cost * 1000) * .4 : (GOODS[k].price || GOODS[k].cost * 2) * .35 * q)); }
function sellSection() {
  const list = SELLABLE.filter(k => bagQty(k) > 0);
  return '<h3>Vender a colheita</h3>' + (list.length ? '<div class="store-list">' + list.map(k => `<div class="supply"><span class="icon">${bagIcon(k)}</span><div><b>${bagName(k)}</b><p>No inventário: ${bagText(k)}</p></div><button class="primary" data-act="storeSell" data-id="${k}">Vender tudo · ${money(sellPrice(k, bagQty(k)))}</button></div>`).join('') + '</div>' : '<p class="small-note">Traga no inventário o que colher na horta e no curral para vender aqui.</p>');
}
function storeSell(k) { const q = bagQty(k); if (!q) return; const v = sellPrice(k, q); bagTake(k, q); G.cash = round(G.cash + v); AudioEngine.coins(); worldSay('Vendeu ' + bagText(k, q) + ' de ' + bagName(k).toLowerCase() + ' por ' + money(v) + '.'); save(); refreshStore(); }
// Celular: no lugar do fornecedor, a lista de compras (o que está acabando e onde comprar).
function physicalShopping() { return !G.testMode; }
function shoppingListHTML() {
  const low = Object.keys(GOODS).filter(k => unlocked(k) && goodSource(k) && !GOODS[k].noSupplier && G.stock[k] < stationCapacity(k) * .35).sort((a, b) => G.stock[a] / stationCapacity(a) - G.stock[b] / stationCapacity(b));
  return `<div class="phone-note">O que a bodega vende sai da roça; nas lojas da Fronteira, só o que não dá para plantar nem criar. Ao voltar, o inventário vai para a despensa.</div>` +
    (low.length ? low.map(k => `<div class="supply"><span class="icon">${itemIconHTML(k)}</span><div><b>${nameOf(k)}</b><p>Bodega: ${stockText(k)} · ${goodSource(k)}</p></div></div>`).join('') : '<p>Estoque em dia. Nada faltando.</p>');
}

// ---------- Ritmo do dia ----------
// A manhã (antes de abrir) corre das 6h ao meio-dia: horta, curral, compras e prosa. Às 9h, aviso para abrir; se a
// bodega continuar fechada ao meio-dia, a freguesia vai embora: perde reputação e o evento do dia. O dia não para no
// mundo aberto: a tarde passa e, no pôr do sol, se a bodega não abriu, vem a noite (dá para dormir e seguir).
const SUNSET = 12 * 60;   // 18h, contando a partir das 6h
const MORNING_RATE = 1.5;   // minutos de jogo por segundo
function morningActive() { return G.phase === 'prep' && !tutorialActive() && !prologueActive() && !G.testMode; }
// Noite de um dia em que a bodega não abriu: o relógio segue do pôr do sol até 23h30, escurecendo aos poucos.
function duskActive() { return G.phase === 'closed' && !G.report && G.openedDay !== G.day && (G.morning || 0) >= SUNSET && !G.testMode; }
function ruralTick(dt) {
  ruralGuideTick(); reminderTick();
  if (duskActive()) G.morning = Math.min(SUNSET + 330, G.morning + dt * MORNING_RATE);
  if (!morningActive()) return;
  const before = G.morning || 0; G.morning = Math.min(SUNSET, before + dt * MORNING_RATE);
  if (before < 360 && G.morning >= 360 && G.event.id !== 'costelao') {
    repChange(-4); const lost = eventInfo() !== EVENTS.normal && G.event.id !== 'costelao' ? eventInfo().name : null;
    if (lost) G.event = { id: 'normal', seen: true, fired: {}, lost: true };
    floatNote('Meio-dia e a bodega fechada! A freguesia foi embora (−4 de reputação)' + (lost ? ' e o dia de ' + lost + ' se perdeu.' : '.'), 'bad'); AudioEngine.bad(); save();
  }
  // Pôr do sol com a bodega fechada: o dia acaba assim mesmo e a sequência de dias abertos se perde.
  if (G.morning >= SUNSET && G.phase === 'prep') {
    G.phase = 'closed'; G.report = null; G.openStreak = 0;
    floatNote('🌇 O sol se pôs e a bodega não abriu hoje. Quando quiser, durma no caixa para começar outro dia.', 'bad'); save(); refreshHUD();
  }
}
// Lembretes: aparecem uma vez por dia, flutuam um pouco e somem.
function remindOnce(id, text) {
  const key = G.day + ':' + id; G.reminders = Object.fromEntries(Object.entries(G.reminders || {}).filter(([k]) => k.startsWith(G.day + ':')));
  if (G.reminders[key]) return; G.reminders[key] = true; floatNote(text, 'reminder'); AudioEngine.tick();
}
function lowStock() { return Object.keys(GOODS).filter(k => unlocked(k) && !GOODS[k].noSupplier && !GOODS[k].removed && ['Cozinha', 'Bebidas', 'Balcão'].includes(GOODS[k].cat) && G.stock[k] < stationCapacity(k) * .25).sort((a, b) => G.stock[a] / stationCapacity(a) - G.stock[b] / stationCapacity(b)); }
function reminderTick() {
  if (!started || G.testMode || prologueActive() || tutorialActive() || modal || scene || G.lasso || !G.tutorial?.complete) return;
  if (morningActive()) {
    const m = G.morning || 0, low = m >= 60 ? lowStock() : [];
    if (low.length) remindOnce('estoque', '📦 Lembrete: confira o estoque. Está acabando: ' + low.slice(0, 3).map(k => nameOf(k).toLowerCase()).join(', ') + '. Se faltar, o freguês reclama.');
    const ch = activeChapter(); if (ch && m >= 20) remindOnce('historia', '📖 Capítulo ' + ch.chapter + ' · ' + ch.title + ': ' + ch.goal() + '.');
    if (m >= 180) remindOnce('abrir', '🕘 9h: quando estiver pronto, abra a bodega no caixa. Fechada ao meio-dia, a freguesia vai embora.');
    if (m >= 300 && m < 360 && G.event.id !== 'costelao') remindOnce('abrir2', worldOut ? '🕚 11h e a bodega fechada: tem freguês esperando na porta! Ao meio-dia eles vão embora.' : '🕚 11h: tem freguês esperando na porta! Abra no caixa antes do meio-dia.');
    if (m >= 540) remindOnce('tarde', '🌇 A tarde passa e a bodega segue fechada. Ainda dá para abrir e pegar o movimento da noite' + (G.lastOpenDay === G.day - 1 && G.openStreak >= 1 ? ', sem perder a freguesia fiel.' : '.'));
    if (m >= 240 && hortaCells().some(cellThirsty)) remindOnce('agua', '💧 Lembrete: as plantas da horta ainda não beberam água hoje.');
  } else if (G.phase === 'closed' && !duskActive()) remindOnce('noite', '🌙 Expediente encerrado. Confira o estoque pro próximo dia e, quando quiser, durma no caixa.');
}
function morningMinutes() { return 6 * 60 + (G.morning || 0); }
// Ao abrir: aviso das plantas sem água.
function ruralOnOpen() {
  G.openAt = morningActive() ? morningMinutes() : null;
  if (hortaCells().some(cellThirsty)) showBanner('As plantas ainda não foram regadas hoje', 'Passe na horta com o regador antes que sequem.', 'info');
}
function ruralNewDay(prevDay) { G.morning = 0; G.openAt = null; if (!G.testMode) hortaPests(); ranchNewDay(prevDay); if (calendar().weekday === 5) valterTip('sabado'); }
// Ícone no topo: estado da horta e do curral, de qualquer lugar.
function updateFarmStatus() {
  const el = $('farmStatus'); if (!el) return;
  const cells = hortaCells(), r = ranchState(), thirsty = cells.filter(cellThirsty).length, ready = cells.filter(cellReady).length, eggs = r.nests.ovo + r.nests.ovo_codorna, milk = r.cows && r.milkedDay !== G.day;
  const parts = [thirsty && '💧' + thirsty, ready && '🧺' + ready, eggs && '🥚' + eggs, milk && '🥛'].filter(Boolean);
  el.classList.toggle('hidden', !parts.length); setHTML(el, parts.join(' '));
  el.title = [thirsty && thirsty + ' planta(s) com sede', ready && ready + ' pronta(s) para colher', eggs && eggs + ' ovo(s) no curral', milk && 'vaca esperando a ordenha'].filter(Boolean).join(' · ');
}

// ---------- Campo: fogo de chão do costelão e curral (galinhas, codornas, vaca e a cerca do boi) ----------
// O mesmo campo do costelão: atrás da cerca pasta o gado; na clareira, o fogo de chão; à direita, o curral.
const RANCH_MAX = { hens: 16, quails: 10, cows: 3 }, VACA_COST = 180;
function ranchState(g = G) { g.ranch ??= { hens: 6, quails: 2, cows: 1, fedDay: null, milkedDay: null, nests: { ovo: 0, ovo_codorna: 0 } }; g.ranch.nests ??= { ovo: 0, ovo_codorna: 0 }; g.ranch.cows ??= 1; return g.ranch; }
// Bicho que comeu ontem bota hoje.
function ranchNewDay(prevDay) { const r = ranchState(); if (r.fedDay === prevDay) { r.nests.ovo = Math.min(30, r.nests.ovo + r.hens); r.nests.ovo_codorna = Math.min(40, r.nests.ovo_codorna + r.quails); } }
const RANCH = { W: 1600, H: 900, gate: 990, fence: 440,
  coop: { x: 1060, y: 480, w: 250, h: 150 }, quail: { x: 1370, y: 510, w: 190, h: 110 },
  cocho: { x: 1100, y: 740, w: 180, h: 44 }, cow: { x: 1400, y: 790, w: 110, h: 30 }, fogo: { x: 470, y: 560, w: 170, h: 70 } };
let curralBirds = null;
WORLD_MAPS.curral = {
  id: 'curral', name: 'Campo e curral', W: RANCH.W, H: RANCH.H,
  spawn() { return { x: RANCH.gate, y: RANCH.H - 60 }; },
  onEnter() { teach('campo'); },
  canWalk(x, y) {
    if (x < 30 || x > RANCH.W - 30 || y < RANCH.fence + 10) return false;
    if (y > RANCH.H - 40 && (Math.abs(x - RANCH.gate) > 60 || y > RANCH.H + 20)) return false;
    return !hitRect([RANCH.coop, RANCH.quail, RANCH.cocho, RANCH.fogo, ...(ranchState().cows ? [RANCH.cow] : [])], x, y);
  },
  edge(p) { if (p.y > RANCH.H - 15) return { ...(worldOut.back || { map: 'vila', ...front(VILA.fogo, 70) }), title: '' }; return null; },
  spots() {
    const r = ranchState(), C = RANCH;
    return [
      { id: 'cerca', x: 800, y: C.fence + 30, label: G.herd > 0 ? 'Laçar · ' + G.herd + (G.herd === 1 ? ' boi na cerca' : ' bois na cerca') : 'Cerca do boi · vazia (boi novo na Casa do Campeiro)', act: lassoFromCurral },
      { id: 'fogo', x: C.fogo.x + C.fogo.w / 2, y: C.fogo.y + C.fogo.h + 30, label: isCampo() ? 'Voltar ao costelão' : 'Fogo de chão do costelão', act: () => { if (isCampo()) goInside(); else worldSay('Fogo de chão: domingo é dia de costelão. A carne vem do boi laçado na cerca.'); } },
      { id: 'cocho', ...front(C.cocho, 26), label: r.fedDay === G.day ? 'Cocho · bichos já comeram hoje' : 'Cocho · dar ração (' + bagQty('racao') + ' saco' + (bagQty('racao') === 1 ? '' : 's') + ')', act: feedRanch },
      { id: 'ninhos', ...front(C.coop, 26), label: 'Ninhos das galinhas · ' + r.nests.ovo + ' ovo' + (r.nests.ovo === 1 ? '' : 's'), act: () => collectEggs('ovo') },
      { id: 'codorneira', ...front(C.quail, 26), label: 'Codorneira · ' + r.nests.ovo_codorna + ' ovinho' + (r.nests.ovo_codorna === 1 ? '' : 's'), act: () => collectEggs('ovo_codorna') },
      ...(r.cows ? [{ id: 'vaca', ...front(C.cow, 26), label: r.milkedDay === G.day ? 'Mimosa · já ordenhada hoje' : 'Ordenhar a Mimosa', act: milkCow }] : [])
    ];
  },
  draw(view, seen, layers) {
    const C = RANCH, r = ranchState();
    if (campoArt.complete && campoArt.naturalWidth) { ctx.imageSmoothingEnabled = false; ctx.drawImage(campoArt, 0, 0, C.W, C.H); ctx.imageSmoothingEnabled = true; }
    else { rect(0, 0, C.W, C.H, '#6ca040'); rect(0, 0, C.W, C.fence - 40, '#8ec0e8'); for (let x = 0; x < C.W; x += 44) rect(x, C.fence - 50, 8, 40, '#6a4424'); rect(0, C.fence - 40, C.W, 6, '#8a5a32'); }
    // o rebanho de verdade, atrás da cerca
    const herd = Math.min(G.herd || 0, 9);
    for (let i = 0; i < herd; i++) { const bx = 160 + i * 150 + Math.sin(frameClock * .3 + i) * 40, by = 396 + (i % 3) * 9; drawBoi(i % BOI_COATS.length, Math.sin(frameClock * .2 + i) > .6 ? 2 : Math.floor(frameClock * 2 + i) % 2, bx, by, .85, Math.cos(frameClock * .3 + i) < 0); }
    signBoard(800, C.fence - 2, 150, 'CERCA DO BOI', 11);
    // fogo de chão na clareira
    layers.push({ y: C.fogo.y + C.fogo.h, draw: () => {
      const f = C.fogo, cx = f.x + f.w / 2, cy = f.y + f.h / 2, lit = isCampo() && fireLit();
      if (!worldSprite('garden', 3, f.x - 40, f.y - 50, f.w + 80, f.h + 70)) { for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; ellipse(cx + Math.cos(a) * 70, cy + Math.sin(a) * 26, 16, 11, '#8a8a80'); } ellipse(cx, cy, 52, 18, '#3a2a1a'); }
      if (lit) for (let k = 0; k < 5; k++) ellipse(cx - 30 + k * 15, cy - 10 - Math.abs(Math.sin(frameClock * 8 + k)) * 18, 6, 12, '#ff9a2a');
      signBoard(cx, f.y + f.h + 4, 130, 'FOGO DE CHÃO', 11);
    } });
    // a Mimosa, vaca de leite, amarrada no palanque
    if (r.cows) layers.push({ y: C.cow.y + C.cow.h, draw: () => { const c = C.cow, cx = c.x + c.w / 2, cy = c.y + c.h; rect(c.x - 6, cy - 70, 8, 72, '#5a3a20', 2); ellipse(cx, cy + 2, 46, 10, '#1c140c44'); drawBoi(2, Math.floor(frameClock * 1.5) % 2 ? 2 : 0, cx, cy, 1.5, false); ellipse(cx - 34, cy - 30, 4, 4, '#e8c040'); signBoard(cx, cy + 8, 90, 'MIMOSA', 11); } });
    // galinheiro, codorneira e cocho
    layers.push({ y: C.coop.y + C.coop.h, draw: () => { const c = C.coop; if (worldSprite('rural', 2, c.x, c.y - 10, c.w, c.h + 10)) { signBoard(c.x + c.w / 2, c.y + c.h + 5, 160, 'GALINHEIRO', 12); return; } gable(c.x, c.y - 10, c.w, 70, '#8a3a24', 12); rect(c.x, c.y + 54, c.w, c.h - 54, '#c8a870', 0, '#6a4a2a'); for (let x = c.x + 10; x < c.x + c.w; x += 18) rect(x, c.y + 56, 2, c.h - 58, '#a8884a'); rect(c.x + c.w / 2 - 22, c.y + c.h - 56, 44, 56, '#5a3a20', 2); for (let k = 0; k < Math.min(r.nests.ovo, 6); k++) ellipse(c.x + 40 + k * 14, c.y + c.h - 14, 6, 7, '#f4ecd8'); signBoard(c.x + c.w / 2, c.y + 60, 160, 'GALINHEIRO', 12); } });
    layers.push({ y: C.quail.y + C.quail.h, draw: () => { const q = C.quail; if (worldSprite('rural', 3, q.x, q.y, q.w, q.h)) { signBoard(q.x + q.w / 2, q.y + q.h + 5, 150, 'CODORNEIRA', 12); return; } rect(q.x, q.y + 30, q.w, q.h - 30, '#8a6a3a', 4, '#4a3018'); for (let x = q.x + 8; x < q.x + q.w; x += 12) rect(x, q.y + 34, 1, q.h - 38, 'rgba(220,220,210,.6)'); rect(q.x - 6, q.y + 20, q.w + 12, 14, '#6a4424'); for (let k = 0; k < Math.min(r.nests.ovo_codorna, 8); k++) ellipse(q.x + 30 + k * 18, q.y + q.h - 12, 4, 5, '#e8dcc0'); signBoard(q.x + q.w / 2, q.y + 2, 150, 'CODORNEIRA', 12); } });
    layers.push({ y: C.cocho.y + C.cocho.h, draw: () => { const c = C.cocho; if (worldSprite('rural', 5, c.x, c.y - 10, c.w, c.h + 10)) { if (r.fedDay !== G.day) rect(c.x + 8, c.y, c.w - 16, 9, '#45321d'); signBoard(c.x + c.w / 2, c.y + c.h + 4, 100, 'COCHO', 11); return; } rect(c.x, c.y, c.w, c.h, '#7a5a34', 6, '#4a3018'); rect(c.x + 8, c.y + 6, c.w - 16, 18, r.fedDay === G.day ? '#e8c060' : '#4a3018', 4); signBoard(c.x + c.w / 2, c.y + c.h + 4, 100, 'COCHO', 11); } });
    // galinhas e codornas ciscando em volta do curral
    if (!curralBirds || curralBirds.hens !== r.hens || curralBirds.quails !== r.quails) curralBirds = { hens: r.hens, quails: r.quails, list: [...Array(r.hens)].map((_, i) => ({ k: 'hen', x: 1060 + (i % 6) * 45, y: 690 - (i % 3) * 18, t: i })).concat([...Array(r.quails)].map((_, i) => ({ k: 'quail', x: 1380 + i * 40, y: 690 - (i % 2) * 14, t: i * 2 }))) };
    for (const b of curralBirds.list) { b.t += 1 / 60; const peck = Math.sin(b.t * 3) > .7; if (!peck) b.x = clamp(b.x + Math.sin(b.t * .7) * .6, 1030, 1570); layers.push({ y: b.y, draw: () => drawBird(b, peck) }); }
  }
};
function drawBird(b, peck) {
  const s = b.k === 'hen' ? 1 : .78, x = b.x, y = b.y, dir = Math.cos(b.t * .7) > 0 ? 1 : -1;
  ellipse(x, y + 2, 14 * s, 4 * s, '#1c140c44'); ellipse(x, y - 12 * s, 14 * s, 11 * s, b.k === 'hen' ? '#f4ece0' : '#8a6a4a');
  if (b.k === 'quail') for (let k = 0; k < 4; k++) ellipse(x - 6 + k * 4, y - 12 * s + (k % 2) * 3, 1.5, 1.5, '#3a2a1a');
  const hx = x + dir * 11 * s, hy = y - (peck ? 10 : 22) * s; ellipse(hx, hy, 6 * s, 6 * s, b.k === 'hen' ? '#f4ece0' : '#8a6a4a');
  if (b.k === 'hen') rect(hx - 2, hy - 9 * s, 4, 5, '#d42a2a', 2); rect(hx + dir * 5 * s - 2, hy - 1, 5, 3, '#e8b040', 1);
  rect(x - 3, y - 2, 2, 4, '#e8b040'); rect(x + 2, y - 2, 2, 4, '#e8b040');
}
function feedRanch() {
  const r = ranchState();
  if (r.fedDay === G.day) { worldSay('Os bichos já comeram hoje.'); return; }
  if (!bagTake('racao', 1)) { worldSay('Sem ração no inventário: compre na Casa do Campeiro.'); AudioEngine.bad(); return; }
  r.fedDay = G.day; AudioEngine.grain?.(); worldSay('Ração no cocho: amanhã tem ovo nos ninhos e leite no balde.'); prologueFlag('racao'); save();
}
function collectEggs(k) {
  const r = ranchState(), n = r.nests[k]; if (!n) { worldSay(k === 'ovo' ? 'Nenhum ovo nos ninhos. Galinha só bota se comer no dia anterior.' : 'Nenhum ovinho na codorneira hoje.'); return; }
  const got = bagAdd(k, n); r.nests[k] -= got;
  AudioEngine.tick(); farmXP(2, 'Recolheu ' + got + (k === 'ovo' ? ' ovo' + (got > 1 ? 's' : '') : ' ovinho' + (got > 1 ? 's' : '') + ' de codorna')); prologueFlag(k === 'ovo' ? 'ovos' : 'ovinhos'); save();
}

// ---------- Mesa de compota (na cozinha da bodega) ----------
const CONSERVAS = [
  { id: 'pepino', name: 'Compota de pepino', needs: { pepino_cru: 3, vidro: 1 }, out: 'conserva_pepino', n: 3, note: '3 pepinos + 1 vidro → 3 potes' },
  { id: 'codorna', name: 'Ovos de codorna em conserva', needs: { ovo_codorna: 6, vidro: 1 }, out: 'conserva_codorna', n: 3, note: '6 ovinhos + 1 vidro → 3 potes' },
  { id: 'vinho', name: 'Vinho de garrafão', needs: { uva: 6, garrafao: 1 }, out: 'vinho', n: 1, note: '6 cachos de uva + 1 garrafão vazio → 1 garrafão de vinho colonial', open: () => G.badinShop }
];
function conservasMenu() {
  openDialog('Mesa de compota', '<p>Vinagre, sal e ervas da casa: o que sai da horta e do curral vira conserva para o balcão. Vidros no Atacado da Fronteira.</p><div class="store-list">' +
    CONSERVAS.filter(c => !c.open || c.open()).map(c => { const miss = Object.entries(c.needs).filter(([k, q]) => bagQty(k) < q), ok = !miss.length; return `<div class="supply"><span class="icon"><span class="bag-emoji">🫙</span></span><div><b>${c.name}</b><p>${c.note}<br>No inventário: ${Object.entries(c.needs).map(([k, q]) => (bagQty(k) >= q ? '✔ ' : '✖ ') + bagText(k) + ' de ' + bagName(k).toLowerCase()).join(' · ')}</p></div><button class="primary" data-act="makeConserva" data-id="${c.id}" ${ok ? '' : 'disabled'}>${ok ? (c.id === 'vinho' ? 'Fazer 1 garrafão' : 'Fazer ' + c.n + ' potes') : 'Falta: ' + miss.map(([k, q]) => (q - Math.floor(bagQty(k))) + ' ' + (k === 'vidro' ? 'vidro vazio (Atacado)' : k === 'garrafao' ? 'garrafão vazio (Atacado)' : bagName(k).toLowerCase())).join(' + ')}</button></div>`; }).join('') + '</div>' +
    (bagQty('conserva_codorna') + bagQty('conserva_pepino') > 0 ? '<p class="small-note">🫙 Potes prontos no inventário (' + (bagQty('conserva_codorna') + bagQty('conserva_pepino')) + ') esperam lugar na prateleira: vendendo, eles vão sozinhos para o balcão. Pote pronto não é vidro vazio.</p>' : ''), 'worldStore');
}
function makeConserva(id) {
  const c = CONSERVAS.find(x => x.id === id); if (!c || !Object.entries(c.needs).every(([k, q]) => bagQty(k) >= q)) return;
  for (const [k, q] of Object.entries(c.needs)) bagTake(k, q);
  bagAdd(c.out, c.n); AudioEngine.glass(); say(c.name + ': ' + c.n + ' potes prontos.');
  if (!worldOut) depositBag();   // feita na cozinha, a conserva já vai para o balcão
  farmXP(3); if (c.id === 'codorna') prologueFlag('compota'); save(); conservasMenu();
}
