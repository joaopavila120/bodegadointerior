// O começo do jogo e a ligação da roça com a bodega.
// · Minijogo da roça (ordenhar a vaca), numa janela própria; o forno e o tacho são um botão só.
// · Forno a lenha e tacho na cozinha da bodega: o trigo da horta vira pão de xis e o leite da vaca vira queijo.
// · Prólogo com o Valter: sementes, horta, alguns dias depois a colheita, o pão, a laçada e a carneação, o curral,
//   o queijo e as compras no Armazém Geral. No fim, o tutorial da bodega de sempre.
// · Dicas do Valter ao longo do jogo e o desafiante de bocha esperando na cancha, ao lado da bodega.
'use strict';

// ---------- Minijogos da roça ----------
// Cada minijogo é uma lista de etapas: 'alternate' (alternar A e D até encher a barra) ou 'timing' (apertar E com o
// marcador na faixa verde). O resultado de cada etapa (acertou ou não) vai para quem chamou.
let farmGame = null;
function startFarmGame(def) {
  farmGame = { ...def, stage: 0, progress: 0, last: null, pos: 0, dir: 1, results: [], clock: performance.now(), flash: def.intro || '', left: def.limit || 0 };
  openDialog(def.title, '<div class="farm-game" id="farmGame"></div>', 'farmGame');
  renderFarmGame(); requestAnimationFrame(farmGameLoop);
}
function farmStage() { return farmGame?.stages[farmGame.stage]; }
function renderFarmGame() {
  const g = farmGame, el = $('farmGame'), st = farmStage(); if (!g || !el || !st) return;
  const steps = g.stages.map((s, i) => `<li class="${i < g.stage ? (g.results[i] ? 'done' : 'miss') : i === g.stage ? 'now' : ''}">${s.label}</li>`).join('');
  const body = st.kind === 'alternate'
    ? `<p>${st.text || 'Alterne <span class="keycap">A</span> e <span class="keycap">D</span> sem parar.'}</p><div class="pour-track"><div class="pour-fill" id="farmFill" style="width:${Math.round(g.progress * 100)}%"></div></div><div class="fight-buttons"><button data-act="farmKey" data-id="a">A</button><button data-act="farmKey" data-id="d">D</button></div>`
    : `<p>${st.text || 'Aperte <span class="keycap">E</span> quando o marcador passar na faixa verde.'}</p><div class="farm-track"><div class="farm-zone" style="left:${st.zone[0] * 100}%;width:${(st.zone[1] - st.zone[0]) * 100}%"></div><div class="farm-marker" id="farmMarker" style="left:${g.pos * 100}%"></div></div><div class="fight-buttons${st.touchOnly ? ' touch-only' : ''}"><button class="primary" data-act="farmKey" data-id="e">${st.button || 'Agora!'}</button></div>`;
  el.innerHTML = `${g.limit ? `<p class="farm-timer" id="farmTimer">⏱ ${Math.ceil(g.left)} s</p>` : ''}${g.stages.length > 1 ? `<ol class="farm-steps">${steps}</ol>` : ''}${body}<p class="farm-flash">${g.flash}</p>`;
}
function farmGameLoop() {
  if (!farmGame) return;
  const now = performance.now(), dt = Math.min(.05, (now - farmGame.clock) / 1000); farmGame.clock = now;
  farmGameTick(dt); if (farmGame) requestAnimationFrame(farmGameLoop);
}
function farmGameTick(dt) {
  const g = farmGame, st = farmStage(); if (!g || !st || modal !== 'farmGame') return;
  // Contra o relógio: acabou o tempo, o que faltou conta como erro.
  if (g.limit) { g.left -= dt; const t = $('farmTimer'); if (t) { t.textContent = '⏱ ' + Math.max(0, Math.ceil(g.left)) + ' s'; t.classList.toggle('low', g.left < 5); } if (g.left <= 0) { farmTimeUp(); return; } }
  if (st.kind === 'alternate') { g.progress = Math.max(0, g.progress - (st.decay ?? .05) * dt); const f = $('farmFill'); if (f) f.style.width = Math.round(g.progress * 100) + '%'; return; }
  g.pos += g.dir * (st.speed || .8) * dt; if (g.pos >= 1) { g.pos = 1; g.dir = -1; } else if (g.pos <= 0) { g.pos = 0; g.dir = 1; }
  const m = $('farmMarker'); if (m) m.style.left = (g.pos * 100) + '%';
}
function farmGameKey(k) {
  const g = farmGame, st = farmStage(); if (!g || !st) return;
  if (st.kind === 'alternate') {
    if (!['a', 'd'].includes(k) || k === g.last) return;
    g.last = k; g.progress += st.step || .08; AudioEngine.noise(.05, .12, st.pitch || 1300);
    if (g.progress >= 1) farmStageDone(true); else { const f = $('farmFill'); if (f) f.style.width = Math.round(g.progress * 100) + '%'; }
  } else if (['e', ' ', 'enter'].includes(k)) farmStageDone(g.pos >= st.zone[0] && g.pos <= st.zone[1]);
}
function farmStageDone(hit) {
  const g = farmGame, st = farmStage(); g.results.push(hit);
  g.flash = st.kind === 'alternate' ? (st.doneText || 'Pronto!') : hit ? (st.hitText || 'No ponto!') : (st.missText || 'Passou do ponto…');
  if (hit) AudioEngine.chop(); else AudioEngine.bad();
  g.stage++; g.progress = 0; g.last = null; g.pos = 0; g.dir = 1;
  if (g.stage < g.stages.length) { renderFarmGame(); return; }
  const done = g.done, results = g.results; farmGame = null; closeDialog(true); done(results);
}
function farmTimeUp() {
  const g = farmGame; while (g.results.length < g.stages.length) g.results.push(false);
  AudioEngine.bad(); const done = g.done, results = g.results; farmGame = null; closeDialog(true); done(results);
}
// Esc no meio do minijogo: quem chamou decide (o leite e o trigo voltam; o boi carneado não volta a ser boi).
function cancelFarmGame() { if (!farmGame) return; const cancel = farmGame.cancel; farmGame = null; closeDialog(true); cancel?.(); }

// O que sai da roça entra direto na despensa da bodega; se a estação estiver cheia, o resto fica no inventário.
function addFarmStock(k, n) {
  unlockGood(k);
  const room = Math.max(0, stationCapacity(k) - G.stock[k]), q = Math.min(n, room);
  if (q > 0) { const units = G.stock[k]; G.avg[k] = units + q > 0 ? G.avg[k] * units / (units + q) : 0; G.stock[k] += q; }
  if (n > q) bagAdd(k, n - q);
}

// ---------- Forno a lenha, tacho e mesa de compota (cozinha da bodega) ----------
const FORNO = { trigo: 3, paes: 8 }, TACHO = { leite: 4, fatias: 10 };
// Forno e tacho: um botão só, sem minijogo. O trigo vira pão e o leite vira queijo na hora.
function useForno() {
  if (held()) { say('Libere as mãos para mexer no forno.'); return; }
  if (bagQty('trigo') < FORNO.trigo) { say('O forno faz pão de xis com o trigo da horta: precisa de ' + FORNO.trigo + ' trigo no inventário (você tem ' + Math.floor(bagQty('trigo')) + ').'); AudioEngine.bad(); return; }
  teachFirst('forno', fornoMenu);
}
function fornoMenu() {
  const ok = bagQty('trigo') >= FORNO.trigo;
  openDialog('Forno a lenha · pão de xis', `<p>${FORNO.trigo} trigo viram ${FORNO.paes} pães de xis. Você tem <b>${Math.floor(bagQty('trigo'))} trigo</b> no inventário.</p><div class="store-list">
    <div class="supply"><span class="icon">${itemIconHTML('pao_xis')}</span><div><b>Pão de xis</b><p>${FORNO.paes} pães, direto na caixa de pão da cozinha.</p></div><button class="primary" data-act="makePao" ${ok ? '' : 'disabled'}>${ok ? 'Assar' : 'Falta trigo: colha na horta'}</button></div></div>`, 'forno');
}
function makePao() {
  if (bagQty('trigo') < FORNO.trigo) return;
  closeDialog(true); bagTake('trigo', FORNO.trigo); addFarmStock('pao_xis', FORNO.paes);
  AudioEngine.scaleDone(); effect('+' + FORNO.paes + ' pães de xis', G.player.x, G.player.y - 100, '#fff2b0'); farmXP(3); prologueFlag('pao'); save();
}
function useTacho() {
  if (held()) { say('Libere as mãos para mexer o tacho.'); return; }
  if (bagQty('leite') < TACHO.leite) { say('O tacho faz queijo com o leite da vaca: precisa de ' + TACHO.leite + ' L no inventário (você tem ' + Math.floor(bagQty('leite')) + ' L). Ordenhe a vaca no campo.'); AudioEngine.bad(); return; }
  teachFirst('tacho', tachoMenu);
}
function tachoMenu() {
  openDialog('Tacho · queijo da casa', `<p>${TACHO.leite} L de leite viram ${TACHO.fatias} fatias de queijo para o xis. Você tem <b>${Math.floor(bagQty('leite'))} L</b> no inventário.</p><div class="store-list">
    <div class="supply"><span class="icon">${itemIconHTML('queijo')}</span><div><b>Queijo em fatias</b><p>${TACHO.fatias} fatias para o xis, direto na caixa de queijo da cozinha.</p></div><button class="primary" data-act="makeQueijo" data-id="fatias" ${bagQty('leite') >= TACHO.leite ? '' : 'disabled'}>${bagQty('leite') >= TACHO.leite ? 'Fazer' : 'Falta leite: ordenhe a vaca'}</button></div></div>`, 'tacho');
}
function makeQueijo() {
  if (bagQty('leite') < TACHO.leite) return;
  closeDialog(true); bagTake('leite', TACHO.leite); addFarmStock('queijo', TACHO.fatias);
  effect('+' + TACHO.fatias + ' fatias de queijo', G.player.x, G.player.y - 100, '#fff2b0'); AudioEngine.scaleDone(); farmXP(3); prologueFlag('queijo'); save();
}
function useConservas() { if (held()) { say('Libere as mãos para mexer nos vidros.'); return; } teachFirst('compota', conservasMenu); }
function drawFarmStation(f) {
  const { x, y, w, h } = f;
  if (f.id === 'forno') {
    ellipse(x + w / 2, y + h + 2, w * .55, 10, '#1c140c55');
    rect(x, y + h * .45, w, h * .55, '#8a5a3a', 4, '#4a2a18');
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) rect(x + 5 + c * (w - 10) / 4 + (r % 2) * 7, y + h * .52 + r * 15, (w - 10) / 4 - 6, 10, '#a8683e', 2);
    ctx.fillStyle = '#c48a5a'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * .48, w * .46, h * .62, 0, Math.PI, 0); ctx.fill(); ctx.strokeStyle = '#6a3a20'; ctx.lineWidth = 3; ctx.stroke();
    ctx.fillStyle = '#2a1a10'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * .47, w * .17, h * .24, 0, Math.PI, 0); ctx.fill();
    ellipse(x + w / 2, y + h * .42, w * .1, h * .08, `rgba(255,140,40,${.45 + .3 * Math.sin(frameClock * 6)})`);
    rect(x + w * .74, y - h * .3, 11, h * .42, '#6a4a3a', 2, '#3a2414');
    txt(Math.floor(bagQty('trigo')) + ' trigo', x + w / 2, y + h - 8, 11, '#ffe8b8');
    return true;
  }
  if (f.id === 'tacho') {
    ellipse(x + w / 2, y + h + 2, w * .5, 8, '#1c140c55');
    rect(x + 6, y + h * .45, w - 12, h * .55, '#2e2e2e', 4, '#111');
    ellipse(x + w / 2, y + h * .62, w * .2, 6, `rgba(255,120,40,${.4 + .25 * Math.sin(frameClock * 7)})`);
    ctx.fillStyle = '#b8743a'; ctx.beginPath(); ctx.ellipse(x + w / 2, y + h * .42, w * .5, h * .3, 0, 0, Math.PI); ctx.fill(); ctx.strokeStyle = '#5a3218'; ctx.lineWidth = 2; ctx.stroke();
    ellipse(x + w / 2, y + h * .42, w * .46, h * .12, '#f2ead8');
    rect(x + w * .62, y - 6, 4, h * .45, '#8a5a32', 2);
    txt(Math.floor(bagQty('leite')) + ' L', x + w / 2, y + h - 6, 11, '#ffe8b8');
    return true;
  }
  if (f.id === 'conservas') {
    ellipse(x + w / 2, y + h + 2, w * .52, 8, '#1c140c55');
    rect(x, y, w, h * .55, '#8a5a32', 4, '#3a2414'); rect(x, y, w, 8, '#a8744a', 3);
    for (const lx of [x + 8, x + w - 16]) rect(lx, y + h * .5, 8, h * .5, '#6a4024', 2);
    // vidros na mesa: vazios, com ovinhos e com pepino
    const jars = [['#e8f0f0', null], ['#e8f0f0', '#f4ecd8'], ['#e8f0f0', '#4f8a3a'], ['#e8f0f0', '#f4ecd8'], ['#e8f0f0', null]];
    jars.forEach(([glass, fill], k) => { const jx = x + 14 + k * (w - 28) / 4; rect(jx - 9, y - 20, 18, 24, glass, 4, '#8a9a9a'); if (fill) rect(jx - 7, y - 10, 14, 12, fill, 3); rect(jx - 10, y - 24, 20, 6, '#c8a040', 2); });
    txt(Math.floor(bagQty('vidro')) + ' vidros', x + w / 2, y + h - 6, 11, '#ffe8b8');
    return true;
  }
  return false;
}
function farmStationHint(n) {
  if (n?.id === 'forno') return '<strong>E</strong> forno a lenha · ' + FORNO.trigo + ' trigo viram ' + FORNO.paes + ' pães de xis (inventário: ' + Math.floor(bagQty('trigo')) + ')';
  if (n?.id === 'tacho') return '<strong>E</strong> tacho · ' + TACHO.leite + ' L de leite viram queijo (inventário: ' + Math.floor(bagQty('leite')) + ' L)';
  if (n?.id === 'conservas') return '<strong>E</strong> mesa de compota · ovinhos ou pepinos + vidro viram conserva (vidros: ' + Math.floor(bagQty('vidro')) + ')';
  return '';
}

// ---------- Campo: ordenha e laçada ----------
function milkCow() {
  const r = ranchState();
  if (!r.cows) { worldSay('Sem vaca de leite: compre uma na Casa do Campeiro.'); return; }
  if (r.milkedDay === G.day) { worldSay('A Mimosa já foi ordenhada hoje. Amanhã cedo tem mais.'); return; }
  startFarmGame({ title: 'Ordenhando a Mimosa', stages: [
    { kind: 'alternate', label: 'Ordenhar', text: 'Uma mão de cada vez: alterne <span class="keycap">A</span> e <span class="keycap">D</span>, no ritmo, sem pressa.', step: .06, decay: .04, doneText: 'Balde cheio!', pitch: 1900 }
  ], done: () => {
    // Vaca que comeu ração ontem dá o balde cheio.
    const fed = r.fedDay === G.day - 1 || r.fedDay === G.day, L = r.cows * (fed ? 8 : 5);
    r.milkedDay = G.day; bagAdd('leite', L); AudioEngine.gulp(); farmXP(3, L + ' L de leite no inventário' + (fed ? '' : ' (com ração no cocho, amanhã ela dá mais)'));
    prologueFlag('leite'); save();
  } });
}
function lassoFromCurral() {
  if (!(G.herd > 0)) { worldSay('Nenhum boi na cerca. Boi novo se compra na Casa do Campeiro.'); AudioEngine.bad(); return; }
  teachFirst('laco', startLasso);
}
// Boi laçado vira carne na hora: mantas de costela para o costelão e hambúrguer para o xis (e coração, com a receita).
const BOI_YIELD = { mantas: MANTAS_PER_BOI, burgers: 24, coracao: 3 };
function butcherBoi(n = 1) {
  const value = G.herdValue || 0, each = value / Math.max(1, (G.herd || 0) + n), cost = each * n; G.herdValue = Math.max(0, value - cost);
  const mantas = BOI_YIELD.mantas * n, burgers = BOI_YIELD.burgers * n, coracao = G.up.coracao ? BOI_YIELD.coracao * n : 0;
  bagAdd('costela_crua', mantas, cost * .5); bagAdd('burger', burgers, cost * (coracao ? .45 : .5)); if (coracao) bagAdd('coracao', coracao, cost * .05);
  G.carneacoes = (G.carneacoes || 0) + n; gainXP(15 * n); AudioEngine.ready();
  const rw = { items: { costela_crua: mantas, burger: burgers, ...(coracao ? { coracao } : {}) }, xp: 15 * n };
  if (!worldOut) depositBag();
  prologueFlag('laco'); if (!G.herd) valterTip('boi0'); save(); refreshHUD();
  if (scenesEnabled()) talk([['reward', rw, n > 1 ? 'Bois laçados!' : 'Boi laçado!']], null, 'Guardar');
  else showBanner('Boi laçado!', mantas + ' mantas de costela e ' + burgers + ' hambúrgueres no inventário.', 'gift', { world: true });
}

// A conversa do Valter (e de quem mais estiver junto) fica em missions.js: talk / valterTalk.

// ---------- Prólogo: a roça do vô ----------
const PROLOGUE_STEPS = [
  { id: 'sementes', title: 'Sementes no Armazém Querência', places: ['agro'], target: { map: 'agro', spot: 'item:caixa' },
    text: () => 'Saia pela <b>porta</b> da bodega e desça a estrada até o <b>Armazém Querência</b>. No <b>caixa</b>, compre sementes de <b>alface</b> e de <b>trigo</b>.',
    done: () => hortaState().seeds.alface > 0 && hortaState().seeds.trigo > 0,
    after: ['Isso, vivente! Alface pro xis e trigo pro pão.', 'A horta fica colada na bodega. E olha: o pé de erva-mate que o teu vô plantou tá carregado. Colhe primeiro, que bodega sem erva não é bodega.'] },
  { id: 'erva', title: 'Colha a erva-mate do vô', places: ['horta'], target: { map: 'horta', tree: 0 },
    text: () => 'Entre na <b>horta</b>, ao lado da bodega. O <b>pé de erva-mate</b> do vô, na primeira cova de baixo, está carregado: chegue perto e aperte <span class="keycap">E</span> para colher.',
    done: () => prologueFlagSet('erva'),
    after: ['Erva-mate da boa, já sapecada no carijo! Na bodega ela vai pro balcão e pra cuia.', 'Agora planta: dois canteiros de alface e dois de trigo.'] },
  { id: 'plantar', title: 'Plante na horta', places: ['horta'], target: { map: 'horta', tile: 'empty' },
    text: () => 'Escolha a semente na barra embaixo (<span class="keycap">3</span> alface, <span class="keycap">4</span> trigo) e aperte <span class="keycap">E</span> na terra à frente. Plante <b>2 canteiros de alface</b> (' + Math.min(2, planted('alface')) + '/2) e <b>2 de trigo</b> (' + Math.min(2, planted('trigo')) + '/2).',
    done: () => planted('alface') >= 2 && planted('trigo') >= 2,
    after: ['Semente na terra é só metade do serviço.', 'Pega o regador, enche no poço e rega cada canteiro. Planta só cresce no dia em que bebe água.'] },
  { id: 'regar', title: 'Regue os canteiros', places: ['horta'], target: { map: 'horta', tile: 'thirsty' },
    text: () => 'Escolha o <b>regador</b> (<span class="keycap">2</span>) e aperte <span class="keycap">E</span> em cada canteiro plantado. Se esvaziar, encha no <b>poço</b>. Faltam ' + hortaState().tiles.filter(cellThirsty).length + '.',
    done: () => hortaState().tiles.some(c => c.crop) && !hortaState().tiles.some(cellThirsty),
    after: ['Pronto. Agora é com o sol e com o tempo.', 'Nos próximos dias eu passo aqui cedinho, rego a horta e trato os bichos, enquanto tu ajeita o galpão.'], skip: 3,
    afterSkip: ['Bah, olha o tamanho dessa alface! E o trigo já tá dourado.', 'Colhe tudo. O que tu colhe vai pro inventário: aperta B pra ver.'] },
  { id: 'colher', title: 'Colha a alface e o trigo', places: ['horta'], target: { map: 'horta', tile: 'ready' },
    text: () => 'Com qualquer ferramenta, aperte <span class="keycap">E</span> nos canteiros maduros. A colheita vai para o <b>inventário</b> (<span class="keycap">B</span>).',
    done: () => !hortaState().tiles.some(cellReady) && bagQty('trigo') >= FORNO.trigo,
    after: ['A alface lavada vira salada pro xis: ela vai sozinha pra despensa quando tu entra na bodega.', 'Já o trigo vira pão: na cozinha tem o forno a lenha do teu vô.'] },
  { id: 'pao', title: 'Pão de xis no forno a lenha', places: [], target: { kitchen: 'forno' },
    text: () => 'Volte para a <b>bodega</b>. Na cozinha, o <b>forno a lenha</b> transforma ' + FORNO.trigo + ' trigo em ' + FORNO.paes + ' pães de xis: aperte <span class="keycap">E</span> nele e depois em <b>Assar</b>.',
    done: () => prologueFlagSet('pao'),
    after: [['sadi', 'Pão de xis feito em casa! O cheiro tomou conta do galpão.'], 'É assim que se faz, guri. Agora a carne: o boi que eu te dei tá no campo, do outro lado da horta.', 'Vai na cerca do boi e laça. Boi laçado vira manta pro costelão de domingo e hambúrguer pro xis.'] },
  { id: 'laco', title: 'Lace o boi', places: ['curral'], target: { map: 'curral', spot: 'cerca' },
    text: () => 'Entre no <b>campo</b>, o do fogo de chão, à esquerda da horta. Vá até a <b>cerca do boi</b> e aperte <span class="keycap">E</span>: <b>Laçar</b>. Segure <span class="keycap">Q</span> para girar o laço e solte com o círculo sobre o boi.',
    done: () => prologueFlagSet('laco'),
    after: ['Boi laçado, carne guardada: mantas pro costelão e hambúrguer pro xis!', 'Boi novo tu compra na Casa do Campeiro, mas isso fica pra depois. Agora os bichos do teu vô, que acordam com fome.', 'Te deixei dois sacos de ração no inventário. Dá no cocho, junta os ovos das galinhas e os ovinhos das codornas, e ordenha a Mimosa.'],
    give: () => bagAdd('racao', 2) },
  { id: 'curral', title: 'Cuide do curral', places: ['curral'], target: { map: 'curral', spot: () => !prologueFlagSet('racao') ? 'cocho' : !prologueFlagSet('ovos') ? 'ninhos' : !prologueFlagSet('ovinhos') ? 'codorneira' : 'vaca' },
    text: () => 'No campo: ' + [['racao', 'dê <b>ração no cocho</b>'], ['ovos', 'recolha os <b>ovos dos ninhos</b>'], ['ovinhos', 'recolha os <b>ovinhos da codorneira</b>'], ['leite', 'ordenhe a <b>Mimosa</b>']].map(([k, t]) => (prologueFlagSet(k) ? '✔ ' : '') + t).join(' · ') + '.',
    done: () => ['racao', 'ovos', 'ovinhos', 'leite'].every(prologueFlagSet),
    after: ['A Mimosa encheu o balde! Bicho bem tratado retribui.', 'Leite assim não se vende: no tacho da cozinha ele vira queijo. É só mexer até coalhar.', 'Queijo em fatia vai no xis: pão, carne, ovo, queijo e salada, tudo da tua roça.'] },
  { id: 'queijo', title: 'Queijo no tacho', places: [], target: { kitchen: 'tacho' },
    text: () => 'Volte para a <b>bodega</b>. No <b>tacho</b>, na cozinha, ' + TACHO.leite + ' L de leite viram ' + TACHO.fatias + ' fatias de queijo para o xis.',
    done: () => prologueFlagSet('queijo'),
    after: ['Pão, carne, ovo, queijo e salada: o xis tá completo!', 'O que não dá na roça tu compra no Armazém Geral: cerveja, refri, cachaça, cigarro e amendoim.', 'E leva vidros: os ovinhos das codornas viram conserva na mesa de compota da cozinha.'] },
  { id: 'compras', title: 'Compras no Armazém Geral', places: ['atacado'], target: { map: 'atacado', spot: 'item:caixa' },
    text: () => 'Bebida e cigarro não dão na roça. No <b>Armazém Geral</b>, no caixa, compre ' + [['cerveja', 'cerveja'], ['refri', 'refrigerante'], ['cigarro', 'cigarro']].map(([k, t]) => (G.stock[k] + bagQty(k) > 0 ? '✔ ' : '') + '<b>' + t + '</b>').join(', ') + ' e ' + (bagQty('vidro') > 0 ? '✔ ' : '') + '<b>vidros de conserva</b>.',
    done: () => ['cerveja', 'refri', 'cigarro'].every(k => G.stock[k] + bagQty(k) > 0) && (bagQty('vidro') > 0 || prologueFlagSet('compota')),
    after: ['Prateleira quase cheia! Falta a conserva de codorna, que freguês de balcão adora.', 'Na cozinha da bodega tem a mesa de compota: seis ovinhos e um vidro viram três potes.'] },
  { id: 'compota', title: 'Conserva na mesa de compota', places: [], target: { kitchen: 'conservas' },
    text: () => 'Volte para a <b>bodega</b>. Na <b>mesa de compota</b> da cozinha, faça a conserva de ovos de codorna: 6 ovinhos e 1 vidro viram 3 potes.',
    done: () => prologueFlagSet('compota'),
    after: ['Agora sim: prateleira cheia, vivente!', 'Dá uma limpada nas mesas e abre a bodega no caixa, ali no balcão de atendimento.', 'E amanhã cedo, antes de abrir, cuida da horta e do curral: o que tu planta e cria vira o que tu vende. Boa sorte, guri!'], end: true }
];
function prologueActive(g = G) { return !!g?.prologue && !g.prologue.done; }
function prologueStep() { return prologueActive() ? PROLOGUE_STEPS[G.prologue.step] : null; }
function prologueFlag(k) { if (prologueActive()) G.prologue.flags[k] = true; }
function prologueFlagSet(k) { return !!G.prologue?.flags?.[k]; }
function planted(k) { return hortaState().tiles.filter(c => c.crop === k).length; }
// Jogo novo: a bodega está montada, mas vazia. O Valter deu um boi e a vaca; na horta, o pé de erva-mate do vô.
function beginPrologue(g) {
  for (const k of Object.keys(GOODS)) if (k !== 'azeite') g.stock[k] = 0;
  g.up.amendoim = true;
  g.tutorial.stockLesson = true; g.tutorial.cleanLesson = true; for (const t of g.tables) if (!t.unlock) { t.dirty = true; t.plates = 2; }
  g.prologue = { step: 0, flags: {} }; g.herd = 1; g.herdValue = 0;
  g.ranch = { hens: 6, quails: 2, cows: 1, fedDay: null, milkedDay: null, nests: { ovo: 0, ovo_codorna: 0 } };
  // O pé de erva-mate do vô já está carregado na horta: a primeira erva da bodega sai dele.
  hortaState(g).trees[0] = { crop: 'erva', growth: CROPS.erva.days, water: null, fert: false, dry: 0 };
  // Missões e regiões: a Serra e Santa Catarina se abrem com a história.
  g.missions = {}; g.regions = { serra: false, sc: false };
  // O prólogo leva três dias (o pulo da horta): a bodega abre numa sexta, e o domingo seguinte é de costelão.
  g.calOffset = 3;
}
function prologueWelcome() {
  const st = prologueStep();
  openDialog('A roça do vô', `<p>A bodega está montada, mas a prateleira está vazia. Com a ajuda do Valter, tudo começa na roça.</p><div class="callout"><b>${st.title}</b><br>${st.text()}</div><p><span class="keycap">E</span> interagir · <span class="keycap">B</span> inventário · <span class="keycap">C</span> celular · <span class="keycap">Esc</span> menu. O quadro no alto da tela mostra cada passo; a seta amarela aponta o caminho.</p><button class="primary" data-act="close">Vamos lá</button>`, 'tutorial');
}
// Verifica a etapa atual quando o jogo está livre (sem janela, cena ou laçada).
// Lista de compras de cada passo do tutorial que manda comprar: aparece no topo do caixa da loja, na quantidade certa.
const PROLOGUE_SHOPPING = {
  sementes: { store: 'agro', items: [['Sementes de alface', '1 pacote (5 sementes) · vai plantar 2 canteiros', () => hortaState().seeds.alface > 0 || planted('alface') > 0], ['Sementes de trigo', '1 pacote (5 sementes) · vai plantar 2 canteiros', () => hortaState().seeds.trigo > 0 || planted('trigo') > 0]] },
  compras: { store: 'atacado', items: [['Cerveja', '1 pacote', () => G.stock.cerveja + bagQty('cerveja') > 0], ['Refrigerante', '1 pacote', () => G.stock.refri + bagQty('refri') > 0], ['Cigarro', '1 pacote', () => G.stock.cigarro + bagQty('cigarro') > 0], ['Vidros de conserva', '1 pacote (4 vidros) · 1 vira a conserva de codorna', () => bagQty('vidro') > 0 || prologueFlagSet('compota')]] }
};
// Nenhum passo pode travar por falta de material (vendido, gasto ou perdido): o Valter repõe uma vez por passo.
function prologueSupply(st) {
  if (!st || G.prologue.supplied?.[st.id] || !storyCalm()) return;
  const r = ranchState(), give = (text, fn) => { G.prologue.supplied ??= {}; G.prologue.supplied[st.id] = true; fn(); showBanner('O Valter deu uma mão', text, 'gift', { world: true }); save(); };
  if (st.id === 'colher' && !hortaState().tiles.some(c => c.crop) && bagQty('trigo') < FORNO.trigo) give('Trouxe ' + FORNO.trigo + ' trigos do paiol dele, para não faltar pão.', () => bagAdd('trigo', FORNO.trigo - bagQty('trigo')));
  else if (st.id === 'pao' && bagQty('trigo') < FORNO.trigo) give('Faltou trigo para o forno: ele trouxe do paiol dele.', () => bagAdd('trigo', FORNO.trigo - bagQty('trigo')));
  else if (st.id === 'laco' && !(G.herd > 0)) give('A cerca estava vazia: ele trouxe outro boi.', () => { G.herd = 1; });
  else if (st.id === 'curral' && !prologueFlagSet('racao') && bagQty('racao') < 1) give('Deixou mais um saco de ração no inventário.', () => bagAdd('racao', 1));
  else if (st.id === 'curral' && !prologueFlagSet('ovos') && !r.nests.ovo) give('Ele juntou os ovos que as galinhas esconderam no mato.', () => { r.nests.ovo = 6; });
  else if (st.id === 'curral' && !prologueFlagSet('ovinhos') && !r.nests.ovo_codorna) give('Ele achou ovinhos na codorneira.', () => { r.nests.ovo_codorna = 6; });
  else if (st.id === 'queijo' && bagQty('leite') < TACHO.leite) give('Trouxe leite da vaca dele para o tacho.', () => bagAdd('leite', TACHO.leite - bagQty('leite')));
  else if (st.id === 'compota' && bagQty('ovo_codorna') < 6) give('Trouxe ovinhos de codorna para a conserva.', () => bagAdd('ovo_codorna', 6 - bagQty('ovo_codorna')));
  else if (st.id === 'compota' && bagQty('vidro') < 1) give('Trouxe um vidro vazio para a conserva.', () => bagAdd('vidro', 1));
}
function prologueTick() {
  if (!prologueActive() || modal || scene || G.lasso || farmGame) return;
  const p = G.prologue, st = PROLOGUE_STEPS[p.step]; prologueSupply(st); if (!st || !st.done()) return;
  const next = () => {
    st.give?.(); p.step++; save();
    if (st.end) { endPrologue(); return; }
    if (st.skip) prologueSkip(st.skip, st.afterSkip);
  };
  if (st.after) valterTalk(st.after, next); else next();
}
// "Três dias depois…": o Valter rega e trata os bichos; a horta cresce até o ponto de colher.
function prologueSkip(days, lines) {
  for (let n = 0; n < days; n++) {
    for (const c of hortaCells()) if (c.crop) c.water = G.day;
    ranchState().fedDay = G.day; hortaNewDay(G.day); ranchNewDay(G.day); G.day++;
  }
  for (const c of hortaCells()) if (c.crop) c.water = null;
  G.morning = 0; G.event = { id: 'normal', seen: true, fired: {} }; G.stats = stats(G.cash); save(); saveDayStart();
  playSteps([{ caption: ['Dois', 'Três', 'Quatro'][days - 2] + ' dias depois…', time: 2.4 }], 'pulo', () => { if (lines) valterTalk(lines); refreshHUD(); });
}
function endPrologue() {
  G.prologue.done = true; G.tutorial.day = G.day; G.calOffset = G.day - 1; G.nextEvent = null; G.event = { id: 'normal', seen: true, fired: {} }; G.morning = 0;
  G.taught ??= {}; for (const id of PROLOGUE_TEACH) G.taught[id] = true;
  showBanner('Prateleira cheia!', 'Agora é com a bodega: limpe as mesas e abra no caixa, no balcão de atendimento.', 'level', { world: true }); AudioEngine.ready(); save(); refreshHUD();
}
// Fora do caminho do tutorial: o resto do mapa espera.
function prologuePlaces() { return new Set(['vila', ...PROLOGUE_STEPS.slice(0, G.prologue.step + 1).flatMap(s => s.places)]); }
function prologueBlocks(place) { return prologueActive() && !prologuePlaces().has(place); }
function prologueWarn() { warnDialog('Ainda não, vivente', 'Primeiro conclua o tutorial da roça. Agora: <b>' + prologueStep().title.toLowerCase() + '</b>.'); }
function prologueHint() {
  const st = prologueStep(); if (!st) return '';
  return '<b>' + (G.prologue.step + 1) + '/' + PROLOGUE_STEPS.length + ' · ' + st.title + '</b><p>' + st.text() + '</p>';
}
// Para onde a seta aponta: na bodega, a estação da cozinha ou a porta; no mapa, a entrada ou o ponto certo.
function prologueBodegaTarget() {
  const st = prologueStep(); if (!st) return null;
  return st.target.kitchen || 'door';
}
function guideSpot(id) { const s = worldMap().spots().find(s => s.id === id || s.id.startsWith(id)); return s ? { x: s.x, y: s.y - 70 } : null; }
const WORLD_ENTRANCES = { agro: 'agro', horta: 'horta', curral: 'campo', atacado: 'atacado', cancha: 'cancha', ferragem: 'ferragem' };
function worldGuidePoint() {
  if (!worldOut) return null;
  const map = worldOut.map, waiting = sportState().waiting;
  let goal = null;
  if (prologueActive()) goal = prologueStep().target;
  else if (waiting) goal = { map: 'cancha', spot: 'waiting' };
  else if (tutorialActive() && G.phase === 'prep') goal = { kitchen: true };
  // Fora dos tutoriais não tem seta: só a primeira missão (o trago, que ensina a comprar na Ferragem) ainda é guiada.
  else { const ch = activeChapter(); if (ch?.id === 'trago' && ch.guide && !upgradeOwned('trago')) return routeGuide(ch.guide); }
  if (!goal) return null;
  if (goal.kitchen) return map === 'vila' ? guideSpot('door') : null;
  if (map === goal.map) {
    const spot = typeof goal.spot === 'function' ? goal.spot() : goal.spot;
    if (spot) return guideSpot(spot);
    if (goal.tree != null) { const pit = GARDEN.pits[goal.tree]; return { x: pit.x, y: pit.y - 190 }; }
    const h = hortaState(), test = { empty: c => !c.crop, thirsty: cellThirsty, ready: cellReady }[goal.tile];
    const i = h.tiles.findIndex((c, n) => !tileLocked(n, h) && test(c)); if (i < 0) return goal.tile === 'thirsty' && h.can <= 0 ? { x: GARDEN.well.x + GARDEN.well.w / 2, y: GARDEN.well.y - 100 } : null;
    return { x: GARDEN.gx + (i % GARDEN.cols) * GARDEN.ts + GARDEN.ts / 2, y: GARDEN.gy + Math.floor(i / GARDEN.cols) * GARDEN.ts - 6 };
  }
  return map === 'vila' && WORLD_ENTRANCES[goal.map] ? guideSpot(WORLD_ENTRANCES[goal.map]) : null;
}
// Caminho até o objetivo do capítulo: dentro do lugar, o ponto exato; na região, a porta; noutra região, a estrada.
function routeGuide(g) {
  const map = worldOut.map;
  if (g.inside && map === g.inside) return g.insideSpot ? guideSpot(g.insideSpot) : null;
  if (map === g.region) return guideSpot(g.spot);
  const exits = { vila: { serra: [VILA.W - 90, VILA.roadY + 45], sc: [VILA.W - 90, VILA.roadY + 45] }, serra: { vila: [80, SERRA.roadY + 45], sc: [SERRA.roadX + 40, 150] }, sc: { vila: [SC.roadX + 40, SC.H - 90], serra: [SC.roadX + 40, SC.H - 90] } };
  const e = exits[map]?.[g.region]; return e ? { x: e[0], y: e[1] - 70 } : null;
}
function drawGuideArrow(x, y) {
  y -= Math.abs(Math.sin(frameClock * 5)) * 12;
  ctx.fillStyle = '#ffd34a'; ctx.strokeStyle = '#5a3a10'; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(x - 16, y - 22); ctx.lineTo(x + 16, y - 22); ctx.lineTo(x + 16, y - 6); ctx.lineTo(x + 26, y - 6); ctx.lineTo(x, y + 16); ctx.lineTo(x - 26, y - 6); ctx.lineTo(x - 16, y - 6); ctx.closePath(); ctx.fill(); ctx.stroke();
}
// Destino fora da tela: a seta fica na borda, apontando para onde ir.
function drawWorldGuide(view) {
  if (modal) return; const p = worldGuidePoint(); if (!p) return;
  const m = 70, inside = !view || p.x > view.x + m && p.x < view.x + view.w - m && p.y > view.y + m && p.y < view.y + view.h - m;
  if (inside) { drawGuideArrow(p.x, p.y); return; }
  const cx = view.x + view.w / 2, cy = view.y + view.h / 2, a = Math.atan2(p.y - cy, p.x - cx);
  const k = Math.min((view.w / 2 - m) / Math.abs(Math.cos(a) || 1e-6), (view.h / 2 - m) / Math.abs(Math.sin(a) || 1e-6));
  ctx.save(); ctx.translate(cx + Math.cos(a) * k, cy + Math.sin(a) * k); ctx.rotate(a - Math.PI / 2);
  const bob = Math.abs(Math.sin(frameClock * 5)) * 8; ctx.translate(0, bob);
  ctx.fillStyle = '#ffd34a'; ctx.strokeStyle = '#5a3a10'; ctx.lineWidth = 3; ctx.beginPath();
  ctx.moveTo(-14, -26); ctx.lineTo(14, -26); ctx.lineTo(14, -6); ctx.lineTo(26, -6); ctx.lineTo(0, 18); ctx.lineTo(-26, -6); ctx.lineTo(-14, -6); ctx.closePath(); ctx.fill(); ctx.stroke(); ctx.restore();
}

// ---------- Dicas do Valter ao longo do jogo ----------
const VALTER_TIPS = {
  bergamota: ['Bergamota madura no pé! A partir de agora tu vende ela por quilo, no balcão.', 'Gaúcho não resiste: bergamota com chimarrão na tarde de inverno.'],
  pinhao: ['Pinhão da tua araucária! Cozido no fogão a lenha, sai que nem pão quente.', 'Já deixei a balança pronta: agora ele vai pro balcão, a granel.'],
  horta3: ['Tua horta tá crescendo, vivente. No Armazém já tem semente de pepino.', 'Pepino com vidro vira compota na mesa de compota da cozinha. A primeira compota já vai pro balcão.'],
  compota: ['Compota de pepino no balcão! Teu vô fazia igualzinho: vinagre, alho e endro.'],
  boi0: ['O pasto ficou vazio. Boi novo, só na Casa do Campeiro: um boi rende as mantas do costelão e um mês de hambúrguer.'],
  sabado: ['Amanhã é domingo de costelão, guri!', 'Se não tiver manta na despensa, laça um boi hoje. Laçar dá pra qualquer hora: é só ir na cerca do boi, lá no campo.'],
  vinho: ['Vinho de garrafão da tua parreira! Pode vender no balcão, por garrafão.', 'Vinho colonial, feito em casa: a freguesia da Serra vai sentir o cheiro de longe.'],
  campeiro: ['Já passou na Casa do Campeiro? Além de bicho e ração, eles têm bandeira, poncho, chapéu, gaita e lampião.', 'Galpão enfeitado deixa a freguesia faceira.']
};
function valterTip(id) {
  if (prologueActive() || G.testMode || !VALTER_TIPS[id]) return;
  G.valterSeen ??= {}; if (G.valterSeen[id]) return; G.valterSeen[id] = true; (G.valterQueue ??= []).push(id);
}
// A dica espera um momento calmo: sem janela, cena, tarefa nem freguesia esperando na bodega.
function valterTipsTick() {
  if (!G.valterQueue?.length || !storyCalm() || !worldOut && G.phase !== 'prep') return;
  const id = G.valterQueue.shift(); save(); valterTalk(VALTER_TIPS[id], null, 'Valeu, Valter');
}
function ruralGuideTick() {
  prologueTick(); storyTick(); valterTipsTick();
  if (!prologueActive() && G.tutorial?.day && G.day >= G.tutorial.day + 2) valterTip('campeiro');
}

// ---------- Bocha: o desafiante espera na cancha, ao lado da bodega ----------
function waitAtCancha(c) {
  sportState().waiting = { person: c.person, wager: c.wager, tutorial: !!c.tutorial };
  closeDialog(true); challengeVisitLeave();
  showBanner(sportName(c.person) + ' te espera na cancha', 'Saia pela porta da bodega e entre na cancha de bocha, aqui do lado.', 'info'); AudioEngine.doorChime(); save();
}
function waitingSpot() {
  const w = sportState().waiting; if (!w) return null;
  return { id: 'waiting', x: 980, y: 720, label: 'Jogar bocha com ' + sportName(w.person), act: playWaitingBocha };
}
function playWaitingBocha() {
  const s = sportState(), w = s.waiting; if (!w) return;
  if (!hasCash(w.wager)) { worldSay('Falta dinheiro para a aposta de ' + money(w.wager) + '.'); AudioEngine.bad(); return; }
  s.waiting = null; G.atCancha = true; launchSport('bocha', w.person, { wager: w.wager, tutorial: w.tutorial });
}
function drawWaitingPlayer(layers) {
  const w = sportState().waiting; if (!w) return;
  layers.push({ y: 690, draw: () => { specialRing(980, 690); personDraw(PEOPLE[w.person].sprite, 980, 690, false, false, -1); } });
}
function waitingHint() {
  const w = sportState().waiting; if (!w) return '';
  return '<b>' + sportName(w.person) + ' te espera na cancha</b><p>' + (worldOut?.map === 'cancha' ? 'Chegue perto dele e aperte <span class="keycap">E</span> para começar a partida.' : 'Saia pela <b>porta</b> da bodega e entre na <b>cancha de bocha</b>, ao lado. Lá dentro, aperte <span class="keycap">E</span> perto dele para começar.') + '</p>';
}
