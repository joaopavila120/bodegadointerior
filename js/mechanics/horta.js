// Horta da bodega, na Fronteira. Entrando pelo portão, abre a tela da horta: anda-se entre os canteiros, escolhe-se a
// ferramenta na barra (1 a 0) e aperta-se E na terra à frente do peão.
// Mão colhe · regador rega (enche no poço) · mangueira rega a fileira inteira · sementes plantam alface, trigo e pepino
// nos canteiros · mudas plantam bergamoteira, araucária e erveira nas covas · adubo faz crescer o dobro.
// Cada planta precisa de água uma vez por dia: só cresce no dia em que foi regada, e canteiro que passa dois dias sem
// água seca. A colheita vai para o inventário (rural.js) e cada colheita dá experiência à horta, que sobe de nível.
'use strict';

const CROPS = {
  alface: { name: 'Alface', seed: 'Semente de alface', pack: 5, seedCost: 4, kind: 'bed', days: 2, good: 'salada', raw: 'alface', yield: 2, icon: '🥬' },
  trigo: { name: 'Trigo', seed: 'Semente de trigo', pack: 5, seedCost: 4, kind: 'bed', days: 3, good: 'pao_xis', raw: 'trigo', yield: 3, icon: '🌾' },
  // Pepino: liberado no nível 3 da horta; vira compota na mesa de conservas do galpão.
  pepino: { name: 'Pepino', seed: 'Semente de pepino', pack: 5, seedCost: 5, kind: 'bed', days: 3, good: 'pepino', raw: 'pepino_cru', yield: 3, icon: '🥒', level: 3 },
  bergamota: { name: 'Bergamoteira', seed: 'Muda de bergamoteira', pack: 1, seedCost: 18, kind: 'tree', days: 5, every: 2, good: 'bergamota', yield: 3000, icon: '🍊' },
  araucaria: { name: 'Araucária', seed: 'Muda de araucária', pack: 1, seedCost: 24, kind: 'tree', days: 6, every: 3, good: 'pinhao', yield: 2000, icon: '🌲' },
  // Pé de erva-mate (Ilex paraguariensis): a erveira dá folha para a erva do chimarrão, cancheada e moída.
  erva: { name: 'Erveira', seed: 'Muda de erva-mate (Ilex paraguariensis)', pack: 1, seedCost: 20, kind: 'tree', days: 6, every: 3, good: 'erva', yield: 2000, icon: '🧉' },
  // Parreira: muda de uva da colônia do Badin. O cacho vira vinho de garrafão na mesa de compota.
  uva: { name: 'Parreira', seed: 'Muda de parreira (uva)', pack: 2, seedCost: 12, kind: 'bed', days: 5, good: 'vinho', raw: 'uva', yield: 6, icon: '🍇', shop: 'badin' }
};
const ADUBO_PACK = 3, ADUBO_COST = 6, CAN_MAX = 12;
const HORTA_TOOLS = [
  { id: 'mao', name: 'Mão', icon: '✋' }, { id: 'regador', name: 'Regador', icon: '🚿' }, { id: 'mangueira', name: 'Mangueira', icon: '🌊' },
  { id: 'alface', name: 'Alface', icon: '🥬' }, { id: 'trigo', name: 'Trigo', icon: '🌾' }, { id: 'pepino', name: 'Pepino', icon: '🥒' },
  { id: 'bergamota', name: 'Bergamoteira', icon: '🍊' }, { id: 'araucaria', name: 'Araucária', icon: '🌲' },
  { id: 'erva', name: 'Erveira', icon: '🧉' }, { id: 'uva', name: 'Parreira', icon: '🍇' }, { id: 'adubo', name: 'Adubo', icon: '🧪' }
];
// Progressão da horta: cada colheita dá experiência. Cada nível abre canteiros, aumenta o regador, libera o pepino,
// a mangueira e o espantalho reforçado contra as pragas.
const HORTA_LEVELS = [
  { xp: 0, rows: 2, can: 12 },
  { xp: 18, rows: 3, can: 20, note: 'Mais uma fileira de canteiros e um regador de 20 regadas.' },
  { xp: 45, rows: 3, can: 20, note: 'Sementes de pepino no Armazém Querência. Na cozinha, pepino vira compota na mesa de compota.' },
  { xp: 80, rows: 4, can: 20, hose: true, note: 'A última fileira de canteiros e a mangueira do poço: rega uma fileira inteira de uma vez.' },
  { xp: 125, rows: 4, can: 24, hose: true, scare: true, note: 'Espantalho reforçado: as pragas não chegam mais nos canteiros.' }
];
function hortaLevel(h = hortaState()) { let n = 1; HORTA_LEVELS.forEach((l, i) => { if ((h.xp || 0) >= l.xp) n = i + 1; }); return n; }
function hortaPerks(h = hortaState()) { return HORTA_LEVELS[hortaLevel(h) - 1]; }
function canMax(h = hortaState()) { return hortaPerks(h).can; }
function cropOpen(k, h = hortaState()) { if (CROPS[k]?.shop === 'badin' && !G.badinShop) return false; return hortaLevel(h) >= (CROPS[k]?.level || 1); }
function hortaTools(h = hortaState()) { return HORTA_TOOLS.filter(t => t.id === 'mangueira' ? !!hortaPerks(h).hose : !CROPS[t.id] || cropOpen(t.id, h)); }
// Canteiro numa fileira ainda fechada: só se mexe nele se já tinha planta (partidas antigas).
function tileLocked(i, h = hortaState()) { return Math.floor(i / GARDEN.cols) >= hortaPerks(h).rows && !h.tiles[i].crop; }
function hortaGainXP(n) {
  const h = hortaState(), before = hortaLevel(h); h.xp = (h.xp || 0) + n; const lv = hortaLevel(h);
  if (lv > before) {
    if (h.tool === 'regador' || h.can > canMax(h)) h.can = canMax(h); AudioEngine.ready(); gainXP(20); if (lv === 3) valterTip('horta3');
    const next = HORTA_LEVELS[lv], text = '<b>' + HORTA_LEVELS[lv - 1].note + '</b>' + (next ? '<br><br>Próximo nível: ' + next.note.toLowerCase() + ' Faltam ' + (next.xp - h.xp) + ' pontos de colheita.' : '<br><br>A horta chegou no nível máximo!') + '<br><br>Recompensa: <b>+20 XP da bodega</b>.';
    if (scenesEnabled() && !modal) talk([['dica', text, 'A horta subiu para o nível ' + lv + '!']], null, 'Bah, que beleza!'); else showBanner('Horta nível ' + lv + '!', HORTA_LEVELS[lv - 1].note, 'level', { world: true });
  }
}
// Tela da horta: 8 × 4 canteiros, quatro covas para árvore, o poço e o galpãozinho.
const GARDEN = { W: 1600, H: 1000, gx: 300, gy: 250, ts: 90, cols: 8, rows: 4, gate: 800,
  pits: [{ x: 360, y: 770 }, { x: 560, y: 770 }, { x: 760, y: 770 }, { x: 960, y: 770 }], well: { x: 1170, y: 250, w: 110, h: 90 }, shed: { x: 1170, y: 560, w: 230, h: 150 } };

function hortaState(g = G) {
  g.horta ??= {};
  const h = g.horta;
  if (!Array.isArray(h.tiles)) h.tiles = Array.from({ length: GARDEN.cols * GARDEN.rows }, () => ({ crop: null }));
  if (!Array.isArray(h.trees)) h.trees = [];
  while (h.trees.length < GARDEN.pits.length) h.trees.push({ crop: null });
  h.seeds ??= {}; for (const k of [...Object.keys(CROPS), 'adubo']) h.seeds[k] ??= 0;
  h.can ??= CAN_MAX; h.xp ??= 0; h.tool ??= 'mao'; delete h.plots;
  return h;
}
function cellReady(c) { return !!c.crop && c.growth >= CROPS[c.crop].days; }
function cellThirsty(c) { return !!c.crop && !cellReady(c) && c.water !== G.day; }
function hortaCells(h = hortaState()) { return [...h.tiles, ...h.trees]; }

// Virada do dia: quem foi regado ontem cresce; canteiro sem água por dois dias seca.
function hortaNewDay(prevDay) {
  for (const c of hortaCells()) {
    if (!c.crop || cellReady(c)) continue;
    const crop = CROPS[c.crop];
    if (c.water === prevDay) { c.growth = Math.min(crop.days, c.growth + (c.fert ? 2 : 1)); c.dry = 0; }
    else if (crop.kind === 'bed' && ++c.dry >= 2) { c.dead = crop.name; c.crop = null; }
  }
}
// De noite, às vezes uma lagarta ou um bando de caturritas ataca um canteiro. O espantalho reforçado (nível 5) protege.
const PESTS = ['Uma lagarta comeu', 'As caturritas bicaram', 'Os pulgões acabaram com'];
function hortaPests(rng = Math.random) {
  const h = hortaState(); if (hortaPerks(h).scare) return null;
  const list = h.tiles.filter(c => c.crop && !cellReady(c)); if (!list.length || rng() >= .22) return null;
  const c = list[Math.floor(rng() * list.length)], what = PESTS[Math.floor(rng() * PESTS.length)] + ' o canteiro de ' + CROPS[c.crop].name.toLowerCase();
  c.dead = CROPS[c.crop].name; c.crop = null; h.pest = { day: G.day, text: what };
  return what;
}

// ---------- O que está à frente do peão ----------
function hortaTarget() {
  const p = worldOut, G_ = GARDEN, fx = p.x + (p.dx || 0) * 46, fy = p.y - 14 + (p.dy || 0) * 40;
  const w = G_.well; if (Math.hypot(p.x - (w.x + w.w / 2), p.y - (w.y + w.h + 20)) < 110) return { type: 'well' };
  for (let i = 0; i < G_.pits.length; i++) if (Math.hypot(fx - G_.pits[i].x, fy - G_.pits[i].y) < 56) return { type: 'tree', i };
  const c = Math.floor((fx - G_.gx) / G_.ts), r = Math.floor((fy - G_.gy) / G_.ts);
  if (c >= 0 && c < G_.cols && r >= 0 && r < G_.rows) return { type: tileLocked(r * G_.cols + c) ? 'locked' : 'tile', i: r * G_.cols + c, c, r };
  return null;
}
function targetCell(t, h = hortaState()) { return t?.type === 'tile' || t?.type === 'locked' || t?.type === 'locked' ? h.tiles[t.i] : t?.type === 'tree' ? h.trees[t.i] : null; }
function cellCenter(t) { return t.type !== 'tree' ? { x: GARDEN.gx + t.c * GARDEN.ts + GARDEN.ts / 2, y: GARDEN.gy + t.r * GARDEN.ts + GARDEN.ts / 2 } : GARDEN.pits[t.i]; }

// E na horta: usa a ferramenta escolhida na terra à frente. Planta pronta é colhida com qualquer ferramenta.
function hortaUse() {
  const h = hortaState(), t = hortaTarget(), tool = h.tool;
  if (!t) return false;
  if (t.type === 'well') {
    if (tool !== 'regador') { worldSay('Escolha o regador (2) para encher no poço.'); return true; }
    h.can = canMax(h); AudioEngine.gulp(); fxPuffs(GARDEN.well.x + 55, GARDEN.well.y + 40, 6, 50, '#7ab8e0'); worldSay('Regador cheio: ' + canMax(h) + ' regadas.'); save(); return true;
  }
  if (t.type === 'locked') { const n = HORTA_LEVELS.findIndex(l => l.rows > t.r) + 1; worldSay('Terra por lavrar: esta fileira abre no nível ' + n + ' da horta. Colha para subir de nível.'); return true; }
  const cell = targetCell(t, h), slot = t.type === 'tile' ? 'bed' : 'tree', at = cellCenter(t);
  if (cellReady(cell)) { hortaHarvest(cell, at); save(); return true; }
  if (tool === 'mao') {
    if (!cell.crop && cell.dead) { cell.dead = null; worldSay('Limpou o que secou.'); }
    else if (cell.crop) worldSay(CROPS[cell.crop].name + ': ainda não está pronta.');
    else worldSay('Escolha uma semente ou muda (3 a 7) para plantar.');
  } else if (tool === 'regador') {
    if (!cell.crop) worldSay('Não há nada plantado aqui.');
    else if (cell.water === G.day) worldSay('Já foi regada hoje.');
    else if (h.can <= 0) { worldSay('O regador está vazio: encha no poço.'); AudioEngine.bad(); }
    else { h.can--; cell.water = G.day; AudioEngine.gulp(); fxPuffs(at.x, at.y - 10, 5, 36, '#7ab8e0'); }
  } else if (tool === 'mangueira') {
    const row = h.tiles.slice(t.r * GARDEN.cols, (t.r + 1) * GARDEN.cols).filter(c => c.crop && !cellReady(c) && c.water !== G.day);
    if (!row.length) worldSay('Nada para regar nesta fileira.');
    else { row.forEach(c => c.water = G.day); AudioEngine.gulp(); for (let c = 0; c < GARDEN.cols; c++) fxPuffs(GARDEN.gx + c * GARDEN.ts + GARDEN.ts / 2, GARDEN.gy + t.r * GARDEN.ts + 40, 2, 30, '#7ab8e0'); worldSay('Mangueira: ' + row.length + ' canteiro' + (row.length > 1 ? 's regados' : ' regado') + ' de uma vez.'); }
  } else if (tool === 'adubo') {
    if (!cell.crop) worldSay('Plante primeiro, depois adube.');
    else if (cell.fert) worldSay('Já está adubada.');
    else if (h.seeds.adubo <= 0) { worldSay('Sem adubo: compre no Armazém Querência.'); AudioEngine.bad(); }
    else { h.seeds.adubo--; cell.fert = true; AudioEngine.tick(); fxPuffs(at.x, at.y - 10, 4, 30, '#8a6a3a'); }
  } else {
    const crop = CROPS[tool];
    if (crop.kind !== slot) worldSay(crop.kind === 'tree' ? 'Muda de árvore vai nas covas, embaixo.' : 'Semente vai nos canteiros de terra.');
    else if (cell.crop) worldSay('Aqui já tem ' + CROPS[cell.crop].name.toLowerCase() + '.');
    else if (h.seeds[tool] <= 0) { worldSay('Acabou ' + (crop.kind === 'tree' || crop.shop ? 'a muda' : 'a semente') + ': compre ' + (crop.shop === 'badin' ? 'na despensa do Badin, na Serra.' : 'no Armazém Querência.')); AudioEngine.bad(); }
    else { h.seeds[tool]--; Object.assign(cell, { crop: tool, growth: 0, water: null, fert: false, dry: 0, dead: null }); AudioEngine.tick(); fxPuffs(at.x, at.y - 6, 4, 26, '#6e4e2e'); }
  }
  save(); return true;
}
// A colheita vai para o inventário: o que é de balcão é guardado na despensa ao entrar na bodega.
function hortaHarvest(cell, at) {
  const crop = CROPS[cell.crop], k = crop.raw || crop.good;
  if (cell.crop === 'erva') prologueFlag('erva');
  bagAdd(k, crop.yield);
  if (crop.kind === 'tree') { cell.growth = crop.days - crop.every; cell.fert = false; } else cell.crop = null;
  AudioEngine.coins(); effect('+' + bagText(k, crop.yield) + ' ' + bagName(k).toLowerCase(), at.x, at.y - 60, '#e1ff9e');
  hortaGainXP(crop.kind === 'tree' ? 3 : 1); farmXP(crop.kind === 'tree' ? 4 : 2, bagText(k, crop.yield) + ' de ' + bagName(k).toLowerCase() + ' no inventário');
}
function hortaSelectTool(n) { const t = hortaTools()[n]; if (!t) return; hortaState().tool = t.id; AudioEngine.tick(); refreshHUD(); }
function hortaToolCount(id, h = hortaState()) { return id === 'mao' || id === 'mangueira' ? '' : id === 'regador' ? h.can + '/' + canMax(h) : String(h.seeds[id] || 0); }
function hortaHint() {
  const h = hortaState(), t = hortaTarget(), tool = HORTA_TOOLS.find(x => x.id === h.tool), n = hortaTools(h).length;
  if (!t) return tool.icon + ' ' + tool.name + ' · 1–' + (n % 10) + ' troca a ferramenta · E usa na terra à frente · horta nível ' + hortaLevel(h);
  if (t.type === 'well') return '<strong>E</strong> encher o regador no poço';
  if (t.type === 'locked') return 'Terra por lavrar · abre com o nível da horta';
  const c = targetCell(t, h);
  if (cellReady(c)) return '<strong>E</strong> colher ' + CROPS[c.crop].name.toLowerCase();
  if (c.crop) return CROPS[c.crop].name + ' · ' + (c.water === G.day ? 'regada hoje' : 'precisa de água') + (c.fert ? ' · adubada' : '') + ' · <strong>E</strong> ' + tool.name.toLowerCase();
  return (c.dead ? c.dead + ' secou · ' : 'Terra livre · ') + '<strong>E</strong> ' + tool.name.toLowerCase();
}
// Barra de ferramentas da horta, embaixo da tela.
function updateHortaBar() {
  const bar = $('hortaBar'); if (!bar) return;
  const show = worldOut?.map === 'horta' && !modal; bar.classList.toggle('hidden', !show); if (!show) return;
  const h = hortaState();
  if (!hortaTools(h).some(t => t.id === h.tool)) h.tool = 'mao';
  setHTML(bar, hortaTools(h).map((t, n) => `<button type="button" class="${h.tool === t.id ? 'on' : ''}" data-act="hortaTool" data-id="${n}" title="${t.name}"><small>${(n + 1) % 10}</small><span>${t.icon}</span><em>${hortaToolCount(t.id, h)}</em></button>`).join(''));
}

// ---------- Tela da horta ----------
WORLD_MAPS.horta = {
  id: 'horta', name: 'Horta da bodega', W: GARDEN.W, H: GARDEN.H,
  spawn() { return { x: GARDEN.gate, y: GARDEN.H - 110 }; },
  canWalk(x, y) {
    if (x < 110 || x > GARDEN.W - 110 || y < 200) return false;
    if (y > GARDEN.H - 90 && (Math.abs(x - GARDEN.gate) > 50 || y > GARDEN.H - 20)) return false;
    const solid = [GARDEN.well, GARDEN.shed, ...hortaState().trees.map((c, i) => c.crop ? { x: GARDEN.pits[i].x - 14, y: GARDEN.pits[i].y - 14, w: 28, h: 22 } : null).filter(Boolean)];
    return !hitRect(solid, x, y);
  },
  edge(p) { if (p.y > GARDEN.H - 60) return { ...worldOut.back, title: '' }; return null; },
  spots() { return []; },
  onEnter() { teach('horta'); const h = hortaState(); if (h.pest?.day === G.day) { worldBanner('Praga na horta!', h.pest.text + '. Com o nível 5, o espantalho reforçado protege tudo.'); h.pest = null; } },
  interact: hortaUse,
  hint: hortaHint,
  draw(view, seen, layers) {
    const G_ = GARDEN, h = hortaState();
    grassField(this, view, seen, '#6f9a45', ['#5f8a3a', '#86ad55']);
    // cerca, com o portão embaixo
    for (let x = 100; x <= G_.W - 100; x += 40) { rect(x, 170, 6, 36, '#6a4424'); if (Math.abs(x - G_.gate) > 60) rect(x, G_.H - 96, 6, 36, '#6a4424'); }
    rect(100, 180, G_.W - 200, 6, '#8a5a32'); rect(100, G_.H - 86, G_.gate - 160, 6, '#8a5a32'); rect(G_.gate + 60, G_.H - 86, G_.W - 160 - G_.gate, 6, '#8a5a32');
    for (const x of [100, G_.W - 100]) rect(x, 170, 6, G_.H - 230, '#6a4424');
    rect(G_.gate - 60, G_.H - 100, 8, 50, '#5a3a20'); rect(G_.gate + 52, G_.H - 100, 8, 50, '#5a3a20');
    gardenSurroundings(layers);
    // canteiros: terra escura quando regada hoje
    for (let r = 0; r < G_.rows; r++) for (let c = 0; c < G_.cols; c++) {
      const cell = h.tiles[r * G_.cols + c], x = G_.gx + c * G_.ts, y = G_.gy + r * G_.ts, wet = cell.crop && cell.water === G.day;
      if (tileLocked(r * G_.cols + c, h)) { gardenLocked(x,y,G_.ts); continue; }
      rect(x + 3, y + 3, G_.ts - 6, G_.ts - 6, cell.dead && !cell.crop ? '#a8885a' : wet ? '#4a3220' : '#7a5634', 6);
      for (let k = 0; k < 3; k++) rect(x + 10, y + 18 + k * 26, G_.ts - 20, 3, wet ? '#3a2616' : '#6a4a2c', 2);
      gardenBed(cell, x, y, G_.ts);
    }
    for (const pit of G_.pits) gardenPit(pit.x, pit.y);
    // a terra que vai receber a ferramenta
    const t = hortaTarget();
    if (t && t.type !== 'well' && t.type !== 'shed') { const a = cellCenter(t), pulse = .6 + .4 * Math.sin(frameClock * 6); ctx.strokeStyle = `rgba(255,224,110,${pulse})`; ctx.lineWidth = 4; if (t.type !== 'tree') ctx.strokeRect(a.x - G_.ts / 2 + 3, a.y - G_.ts / 2 + 3, G_.ts - 6, G_.ts - 6); else { ctx.beginPath(); ctx.ellipse(a.x, a.y, 48, 25, 0, 0, Math.PI * 2); ctx.stroke(); } }
    for (let i = 0; i < h.tiles.length; i++) { const cell = h.tiles[i]; if (!cell.crop) continue; const x = G_.gx + (i % G_.cols) * G_.ts, y = G_.gy + Math.floor(i / G_.cols) * G_.ts; layers.push({ y: y + G_.ts - 8, draw: () => drawTileCrop(cell, x, y) }); }
    h.trees.forEach((cell, i) => { if (cell.crop) layers.push({ y: G_.pits[i].y + 10, draw: () => drawTreeCrop(cell, G_.pits[i].x, G_.pits[i].y + 6) }); });
    // poço, galpãozinho e espantalho
    layers.push({ y: G_.well.y + G_.well.h, draw: () => { const w = G_.well; if (worldSprite("garden", 0, w.x, w.y - 90, w.w, w.h + 90)) { signBoard(w.x+w.w/2,w.y+w.h+6,90,"POÇO",12); return; } ellipse(w.x + w.w / 2, w.y + w.h - 20, w.w / 2, 26, '#8a8a80'); ellipse(w.x + w.w / 2, w.y + w.h - 26, w.w / 2 - 12, 16, '#2a4a5a'); for (const x of [w.x + 10, w.x + w.w - 16]) rect(x, w.y - 50, 6, w.h - 10, '#5a3a20'); rect(w.x, w.y - 56, w.w, 10, '#7a4a2a'); gable(w.x - 6, w.y - 90, w.w + 12, 40, '#8a3a24', 6); rect(w.x + w.w / 2 - 2, w.y - 46, 4, 40, '#c8c8c0'); rect(w.x + w.w / 2 - 12, w.y - 10, 24, 22, '#7a5a3a', 3); signBoard(w.x + w.w / 2, w.y + w.h + 6, 90, 'POÇO', 12); } });
    layers.push({ y: G_.shed.y + G_.shed.h, draw: () => { const s = G_.shed; if (worldSprite("garden", 1, s.x, s.y - 30, s.w, s.h + 30)) { signBoard(s.x+s.w/2,s.y+s.h+6,150,"GALPÃO",12); return; } gable(s.x, s.y - 20, s.w, 70, '#7a4a2a', 14); rect(s.x, s.y + 40, s.w, s.h - 40, '#a8743a', 0, '#5a3a20'); for (let x = s.x + 12; x < s.x + s.w; x += 22) rect(x, s.y + 42, 2, s.h - 44, '#8a5a2a'); rect(s.x + s.w / 2 - 28, s.y + s.h - 70, 56, 70, '#5a3a20', 2); for (let k = 0; k < 3; k++) rect(s.x + 16 + k * 20, s.y + s.h - 30, 16, 26, '#c8a870', 5); signBoard(s.x + s.w / 2, s.y + 50, 150, 'GALPÃO', 12); } });
    layers.push({ y: 720, draw: () => { const sx = 1100, sy = 720; if (worldSprite("garden", 2, sx - 35, sy - 110, 70, 110)) return; rect(sx - 3, sy - 60, 6, 64, '#5a3a20'); rect(sx - 34, sy - 36, 68, 6, '#5a3a20'); ellipse(sx, sy - 70, 14, 14, '#e8d6a8'); rect(sx - 20, sy - 88, 40, 9, '#3a2a1a'); rect(sx - 11, sy - 100, 22, 14, '#3a2a1a'); rect(sx - 17, sy - 50, 34, 34, '#a83a24', 4); } });
  }
};

// Plantas por estágio: semente, broto, crescendo e pronta.
function drawTileCrop(cell, x, y) {
  const crop = CROPS[cell.crop], k = Math.min(1, cell.growth / crop.days), sway = Math.sin(frameClock * 2 + x * .05) * 1.5, ts = GARDEN.ts;
  if (cell.growth === 0) { for (let n = 0; n < 4; n++) { const px = x + 22 + (n % 2) * 44, py = y + 28 + Math.floor(n / 2) * 34; ellipse(px, py, 4, 2, '#3a2414'); rect(px - 1 + sway * .3, py - 7, 2, 6, '#7ac850'); } }
  else if (cell.crop === 'pepino') for (let n = 0; n < 3; n++) { const cx = x + 18 + n * 27, cy = y + 50, r = 8 + k * 14; ellipse(cx + sway * .3, cy, r, r * .6, '#2f7a2a'); ellipse(cx - 4, cy - 6, r * .6, r * .45, '#4f9a3a'); if (k > .5) ellipse(cx + 4, cy + 10, 4 + k * 3, 9 + k * 4, k >= 1 ? '#3a7a2a' : '#7ac850'); if (k >= 1) ellipse(cx + 4, cy + 6, 2, 2, '#d8f0a0'); }
  else if (cell.crop === 'alface') for (let n = 0; n < 4; n++) { const cx = x + 24 + (n % 2) * 42, cy = y + 36 + Math.floor(n / 2) * 32, r = 6 + k * 12; ellipse(cx, cy, r, r * .78, '#3f8a2a'); ellipse(cx + sway * .3, cy - 2, r * .65, r * .5, '#7ac850'); if (k >= 1) ellipse(cx, cy - 3, r * .3, r * .25, '#b8e890'); }
  else for (let n = 0; n < 7; n++) { const sx = x + 12 + n * 11, hgt = 14 + k * 46, col = k >= 1 ? '#d8b040' : k > .5 ? '#a8b040' : '#6aa83a', top = y + ts - 10 - hgt; ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(sx, y + ts - 10); ctx.quadraticCurveTo(sx + sway, top + hgt / 2, sx + sway * 2, top); ctx.stroke(); if (k > .5) ellipse(sx + sway * 2, top - 4, 3.5, 8, col); }
  if (cellThirsty(cell)) drawDrop(x + ts - 16, y + 14 + Math.sin(frameClock * 4) * 2, 7);
  if (cellReady(cell)) for (let n = 0; n < 3; n++) { const a = frameClock * 2 + n * 2.1; ellipse(x + ts / 2 + Math.cos(a) * 30, y + 20 + Math.sin(a) * 10, 2.5, 2.5, '#fff6b0'); }
}
function drawTreeCrop(cell, x, base) {
  const crop = CROPS[cell.crop], k = Math.min(1, cell.growth / crop.days), hgt = 40 + k * 150, w = 18 + k * 60, sway = Math.sin(frameClock * 1.3 + x) * 2;
  ellipse(x, base, 30 + k * 30, 9, '#1c140c44'); rect(x - 4 - k * 3, base - hgt * .5, 8 + k * 6, hgt * .5, '#5a3a20');
  if (cell.crop === 'erva') { for (const [dx, dy, f] of [[0, .62, 1], [-.45, .5, .7], [.45, .52, .7], [0, .82, .6]]) { ellipse(x + w * dx + sway, base - hgt * dy, w * f, w * f * .7, '#1f5a2a'); ellipse(x + w * dx + sway - 3, base - hgt * dy - 4, w * f * .6, w * f * .4, cellReady(cell) ? '#6ab84a' : '#2f7a3a'); } if (cellReady(cell)) for (let n = 0; n < 8; n++) ellipse(x - w * .6 + (n * 23) % (w * 1.2) + sway, base - hgt * .7 + (n * 11) % (w * .7), 3, 3, '#a8243a'); }
  else if (cell.crop === 'bergamota') { ellipse(x + sway, base - hgt * .62, w, w * .8, '#2f6a2a'); ellipse(x - w * .3 + sway, base - hgt * .7, w * .5, w * .4, '#3f7a36'); if (cellReady(cell)) for (let n = 0; n < 10; n++) ellipse(x - w * .7 + (n * 19) % (w * 1.4) + sway, base - hgt * .75 + (n * 13) % (w * .9), 5, 5, '#f09a2a'); }
  else { for (const [dy, f] of [[.45, 1], [.68, .78], [.88, .55], [1, .3]]) { ctx.fillStyle = '#2f5a2a'; ctx.beginPath(); ctx.ellipse(x + sway * f, base - hgt * dy, w * f, 6 + k * 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.fillStyle = '#3f7a36'; ctx.beginPath(); ctx.ellipse(x + sway * f, base - hgt * dy - 3, w * f * .8, 3 + k * 4, 0, 0, Math.PI * 2); ctx.fill(); } if (cellReady(cell)) for (let n = 0; n < 4; n++) ellipse(x - 36 + n * 24 + sway, base - hgt * .5, 8, 9, '#8a5a2a'); }
  if (cellThirsty(cell)) drawDrop(x + 40, base - 30 + Math.sin(frameClock * 4) * 2, 8);
}
function drawDrop(x, y, s) { ctx.fillStyle = '#3a8ad0'; ctx.beginPath(); ctx.moveTo(x, y - s); ctx.quadraticCurveTo(x + s, y + s * .3, x, y + s); ctx.quadraticCurveTo(x - s, y + s * .3, x, y - s); ctx.fill(); }

// ---------- A horta vista da Fronteira ----------
function hortaSpots() { return [{ id: 'horta', ...front(VILA.horta), label: 'Entrar na horta', act: () => enterInterior('horta') }]; }
function drawHortaLayers(layers, seen) {
  const hz = VILA.horta; if (!seen(hz.x + hz.w / 2, hz.y + hz.h / 2, hz.w)) return;
  const h = hortaState();
  layers.push({ y: hz.y + hz.h, draw: () => {
    rect(hz.x, hz.y, hz.w, hz.h, '#7a5634', 4, '#5a3a20'); for (let x = hz.x; x <= hz.x + hz.w; x += 20) rect(x, hz.y - 8, 4, 12, '#6a4424');
    for (let r = 0; r < 4; r++) { const y = hz.y + 34 + r * 52; rect(hz.x + 14, y, hz.w * .58, 26, '#5e4428', 6); for (let c = 0; c < 4; c++) { const cell = h.tiles[r * GARDEN.cols + c * 2]; if (cell?.crop) ellipse(hz.x + 30 + c * 34, y + 10, 8, 7, cell.crop === 'trigo' ? (cellReady(cell) ? '#d8b040' : '#8ab040') : cell.crop === 'pepino' ? '#2f6a2a' : '#3f8a2a'); } }
    h.trees.forEach((cell, i) => { if (!cell.crop) return; const x = hz.x + hz.w * .82, y = hz.y + 50 + i * 60, k = Math.min(1, cell.growth / CROPS[cell.crop].days); rect(x - 3, y, 6, 22, '#5a3a20'); ellipse(x, y - 6, 12 + k * 18, 10 + k * 14, '#2f6a2a'); if (cellReady(cell)) ellipse(x, y - 8, 5, 5, cell.crop === 'bergamota' ? '#f09a2a' : cell.crop === 'erva' ? '#a8243a' : '#8a5a2a'); });
    signBoard(hz.x + hz.w / 2, hz.y + hz.h - 30, 120, 'HORTA', 13);
    // aviso de que tem planta com sede ou pronta para colher
    const thirsty = hortaCells(h).some(cellThirsty), ready = hortaCells(h).some(cellReady);
    if (thirsty || ready) { const x = hz.x + hz.w - 20, y = hz.y - 26 + Math.sin(frameClock * 4) * 3; rect(x - 16, y - 16, 32, 32, '#fff8e6', 16, '#8a6a3a'); if (ready) { rect(x - 9, y - 1, 18, 10, '#a8743a', 3); ellipse(x - 3, y - 4, 4, 4, '#e8b040'); ellipse(x + 4, y - 5, 4, 4, '#7ac850'); } else drawDrop(x, y, 9); }
  } });
}

// ---------- Sementes no Armazém Querência ----------
function hortaDo(arg) { const [what, k] = String(arg).split(':'); if (what === 'seed') hortaBuySeed(k); }
function hortaBuySeed(key) {
  const h = hortaState(), crop = CROPS[key], cost = key === 'adubo' ? ADUBO_COST : crop?.seedCost, n = key === 'adubo' ? ADUBO_PACK : crop?.pack; if (!cost || crop && !cropOpen(key)) return;
  if (!hasCash(cost)) { worldSay('Não há dinheiro para isso.'); AudioEngine.bad(); return; }
  spendCash(cost); G.stats.purchases += cost; h.seeds[key] += n; AudioEngine.coins(); save();
  if (modal === 'worldStore') { refreshStore(); buyFeedback('hortaDo', 'seed:' + key, '+' + n + ' no inventário da horta'); }
}
function hortaSeedCards(filter = () => true, adubo = true) {
  const h = hortaState(), card = (key, name, cost, n, note, ok = true, why = '') => `<div class="supply"><span class="icon">${key === 'adubo' ? '🧪' : CROPS[key].icon}</span><div><b>${name}</b><p>${note} · você tem ${h.seeds[key] || 0}</p></div><button class="primary" data-act="hortaDo" data-id="seed:${key}" ${ok && hasCash(cost) ? '' : 'disabled'}>${ok ? 'Comprar ' + n + ' · ' + money(cost) : why}</button></div>`;
  return Object.entries(CROPS).filter(([k]) => filter(k)).map(([k, c]) => card(k, c.pack > 1 ? c.seed.replace('Semente', 'Sementes') : c.seed, c.seedCost, c.pack, c.kind === 'tree' ? 'Árvore: dá ' + stockText(c.good, c.yield) + ' a cada ' + c.every + ' dias' : 'Pronta em ' + c.days + ' dias regando: ' + c.yield + ' ' + bagName(c.raw).toLowerCase() + ' por canteiro', cropOpen(k, h), 'Horta nível ' + (c.level || 1))).join('') +
    (adubo ? card('adubo', 'Adubo orgânico', ADUBO_COST, ADUBO_PACK, 'Cresce o dobro até a colheita') : '');
}
