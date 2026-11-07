// Modo de testes: no menu do Esc, "Testar áreas e chefes" leva pra qualquer lugar do jogo, a qualquer hora, mesmo que a
// história ainda não tenha chegado lá.
//   · Chefes: cada botão vai direto pra luta e deixa pronto o que aquele chefe precisa (missão em andamento, itens, a lança).
//   · Áreas: qualquer mapa, inclusive qualquer trecho da mata, do pampa e da cerração e qualquer andar da caverna.
//   · Resetar: zera os chefes de uma área e o que tinha pra achar hoje, sem mexer em armas, dinheiro nem fogos acesos.
//   · Armas: libera tudo e troca a arma na mão, sem precisar ir na forja.
// Nessas partidas a porteira do pampa fica sempre aberta e a mata nunca trava por causa de um desmaio.
'use strict';

function testeLiberado() { return !!(G?.testMode || G?.eventMode); }
function testeFalas() { let k = 0; while (modal === 'talk' && k++ < 80) talkNext(); }
// Larga o que estiver fazendo (bodega, jogo, cena, caverna, outra luta) e fica pronto pra ir pra qualquer mapa.
function testeSai() {
  closeDialog(true); paused = false; keys.clear(); if (phoneOpen) togglePhone(false); skipWorldTalk();
  if (scene) { scene.onEnd = null; endScene(); }
  ['lassoUI', 'weighUI', 'mixUI', 'chopUI', 'pourUI', 'fightUI', 'bocceScreen'].forEach(id => $(id)?.classList.add('hidden')); document.body.classList.remove('playing-bocce'); hidePenalties();
  G.task = null; G.lasso = null; G.bocce = null; G.game = null; G.penalties = null; G.atCancha = false; G.dialogue = null;
  if (held()) takeHeld();
  if (inCave()) { caveLeave(null, true); testeFalas(); closeDialog(true); }
  lendaFight = null; mataNight = null; worldDash = null;
  if (G.phase === 'open') { G.phase = 'prep'; G.shop = []; G.groups = []; for (const t of G.tables || []) t.group = null; }
  if (!worldOut) { goOutside(); closeDialog(true); }
}
// O que abre o caminho em qualquer momento da história.
function testeAbreTudo() {
  G.regions = Object.assign(G.regions || {}, { serra: true, sc: true }); G.missions ??= {};
  G.mataSeen ??= G.day; const m = mataState(); m.metGaribaldi ??= G.day; delete m.faintDay;
  const cs = caveState(); cs.facao = true; cs.forged ??= {}; cs.up ??= {}; cs.hp = caveMaxHp();
}
function testeVai(fn) {
  if (!testeLiberado()) return; testeSai(); testeAbreTudo(); fn(); testeFalas(); closeDialog(true); caveState().hp = caveMaxHp(); keys.clear(); save(); refreshHUD();
}
// Quem vai pra ilha já chega com o que a ilha pede: a prata e o arpão do Griggs.
function testeIlha() {
  const st = ilhaState(); for (const k of ['chegou', 'sabeBarqueiro', 'griggs', 'planalto', 'facaoPrata']) st[k] ??= G.day; st.cartuchos = Math.max(st.cartuchos || 0, 30);
  G.up.arpao = true; G.up.carabina = true; G.missions.bento ??= { status: 'active', day: G.day };
}
function testeChefeMata(id, n) {
  const st = mataState(); delete st[id]; delete st.today; const C = trechoLayout(n).camp; switchMap({ map: 'trecho', x: C.x - 200, y: C.y, trecho: n });
}
function testeChefeIlha(id, n) {
  testeIlha(); delete ilhaState()[id]; delete ilhaState().mortos; const a = ilhaMatoLayout(n).arena; switchMap({ map: 'ilhamato', x: a.x - 200, y: a.y, n });
}
// No pampa, quem vai pra um chefe já passou pelos anteriores. Depois do Sargento, a lança já é do Sadi.
function testeChefePampa(id, antes) {
  const st = pampaState(), n = PAMPA_N[id], q = pampaLayout(n).palco, cs = caveState(); st.lanceiros ??= G.day; for (const k of antes) st[k] ??= G.day; delete st[id]; delete st.mortos;
  if (antes.includes('sargento') && !weaponOwned('lanca')) { cs.forged.lanca = G.day; cs.weapon = 'lanca'; }
  if (antes.includes('boi')) st.lacoCouro ??= G.day;
  if (id === 'moringue') { delete st.republica; delete st.bandeira; if (G.ilha) delete G.ilha.resgatado; }
  switchMap({ map: 'pampa', n, x: q.x, y: q.y - q.ry * .5 });
}
const TESTE_CHEFES = [
  { grupo: 'Mata de Araucárias', id: 'cachaco', nome: 'Javali Cachaço', feito: () => G.mata?.cachaco, vai: () => testeChefeMata('cachaco', 11) },
  { grupo: 'Mata de Araucárias', id: 'papo', nome: 'Lagarto do papo-amarelo', feito: () => G.mata?.papo, vai: () => testeChefeMata('papo', 21) },
  { grupo: 'Barra de Laguna', id: 'mariath', nome: 'Capitão Mariath', feito: () => G.mata?.laguna?.won, vai() { const st = lagunaState(); delete st.won; st.carregado ??= G.day; switchMap({ map: 'laguna', x: 600, y: 1000 }); testeFalas(); navioBoard(); } },
  { grupo: 'Ilha da Fortaleza', id: 'bruxaMor', nome: 'Bruxa-mor', feito: () => G.ilha?.bruxaMor, vai: () => testeChefeIlha('bruxaMor', 4) },
  { grupo: 'Ilha da Fortaleza', id: 'bernunciaMae', nome: 'Bernúncia-mãe', feito: () => G.ilha?.bernunciaMae, vai: () => testeChefeIlha('bernunciaMae', 7) },
  { grupo: 'Ilha da Fortaleza', id: 'grenfell', nome: 'Almirante Grenfell', feito: () => G.ilha?.grenfell, vai() { testeIlha(); const st = ilhaState(); delete st.grenfell; delete st.grenfellViu; switchMap({ map: 'ilha', x: 3200, y: 1450 }); } },
  { grupo: 'Caverna da Serra', id: 'diabo', nome: 'Diabo Vermelho', feito: () => G.cave?.salamanca, vai() { const cs = caveState(); for (const k of ['salamanca', 'salamancaFled']) delete cs[k]; cs.deepest = Math.max(cs.deepest || 1, SALAMANCA_FLOOR); cs.enchanted ??= G.day; cs.dunstanTaught = true; G.missions.jarau = { status: 'active', day: G.day }; switchMap({ map: 'serra', x: CAVE.door.x, y: CAVE.door.y + 160 }); testeFalas(); enterCave(SALAMANCA_FLOOR); } },
  { grupo: 'Pampa', id: 'sargento', nome: 'Sargento Recolhedor', feito: () => G.pampa?.sargento, vai: () => testeChefePampa('sargento', []) },
  { grupo: 'Pampa', id: 'boi', nome: 'Boi Barroso', feito: () => G.pampa?.boi, vai: () => testeChefePampa('boi', ['sargento']) },
  { grupo: 'Pampa', id: 'capitao', nome: 'Capitão de cavalaria', feito: () => G.pampa?.capitao, vai: () => testeChefePampa('capitao', ['sargento', 'boi']) },
  { grupo: 'Pampa', id: 'moringue', nome: 'Coronel Moringue', feito: () => G.pampa?.moringue, vai: () => testeChefePampa('moringue', ['sargento', 'boi', 'capitao']) }
];
const TESTE_LUGARES = [
  { id: 'vila', nome: 'Fronteira', vai() { const p = front(VILA.bodega, 70); switchMap({ map: 'vila', x: p.x, y: p.y }); } },
  { id: 'serra', nome: 'Serra Gaúcha', vai: () => switchMap({ map: 'serra', x: 1500, y: 1010 }) },
  { id: 'sc', nome: 'Santa Catarina', vai: () => switchMap({ map: 'sc', x: 500, y: 1010 }) },
  { id: 'mata', nome: 'Refúgio do Garibaldi', vai: () => mataGoRancho() },
  { id: 'laguna', nome: 'Barra de Laguna', vai: () => switchMap({ map: 'laguna', x: 600, y: 1000 }) },
  { id: 'ilha', nome: 'Ilha: trapiche', vai() { testeIlha(); switchMap({ map: 'ilha', ...ILHA.arrive }); } },
  { id: 'alto', nome: 'Ilha: alto, na fortaleza', vai() { testeIlha(); switchMap({ map: 'ilha', x: 3200, y: PLANALTO.y - 130 }); } },
  { id: 'cripta', nome: 'Ilha: cripta', vai() { testeIlha(); switchMap({ map: 'masmorra', ...WORLD_MAPS.masmorra.spawn() }); } }
];
const TESTE_FAIXAS = {
  trecho: { nome: 'Mata adentro', de: 2, ate: () => TRECHO.last, rotulo: n => n + ' · ' + TRECHO_BIOME_NAMES[trechoBiome(n)] + (TRECHO_BOSSES[n] ? ' (chefe)' : ''), vai: n => switchMap({ map: 'trecho', x: 90, y: trechoLayout(n).yIn, trecho: n }) },
  ilhamato: { nome: 'Mata da cerração', de: 1, ate: () => ILHAMATO.last, rotulo: n => 'Trecho ' + n + (ILHAMATO.bosses[n] ? ' (chefe)' : ''), vai(n) { testeIlha(); switchMap({ map: 'ilhamato', x: 90, y: ilhaMatoLayout(n).yIn, n }); } },
  caverna: { nome: 'Caverna da Serra', de: 1, ate: () => SALAMANCA_FLOOR, rotulo: n => 'Andar ' + n + (n === SALAMANCA_FLOOR ? ' (chefe)' : ''), vai(n) { const cs = caveState(); cs.deepest = Math.max(cs.deepest || 1, n); switchMap({ map: 'serra', x: CAVE.door.x, y: CAVE.door.y + 160 }); testeFalas(); enterCave(n); } },
  pampa: { nome: 'Pampa', de: 1, ate: () => PAMPA.last, rotulo: n => n + ' · ' + PAMPA_AREAS[n].nome + (pampaLayout(n).palco ? ' (chefe)' : ''), vai: n => switchMap(pampaEntrada(n)) }
};
const TESTE_AREAS = [
  { id: 'mata', icone: '🌲', nome: 'Mata de Araucárias', chefes: ['cachaco', 'papo'], zera() { const st = mataState(); delete st.cachaco; delete st.papo; delete st.today; } },
  { id: 'laguna', icone: '⚓', nome: 'Barra de Laguna', chefes: ['mariath'], zera() { delete lagunaState().won; } },
  { id: 'ilha', icone: '🏝️', nome: 'Ilha da Fortaleza', chefes: ['bruxaMor', 'bernunciaMae', 'grenfell'], zera() { const st = ilhaState(); for (const k of ['bruxaMor', 'bernunciaMae', 'grenfell', 'grenfellViu', 'mortos', 'achados']) delete st[k]; } },
  { id: 'pampa', icone: '🐎', nome: 'Pampa', chefes: ['sargento', 'boi', 'capitao', 'moringue'], zera() { const st = pampaState(); for (const k of ['lanceiros', 'sargento', 'boi', 'capitao', 'moringue', 'republica', 'bandeira', 'fogueira', 'fogueiraVista', 'hoje', 'mortos', 'folk', 'prosa', 'chaDia']) delete st[k]; if (G.ilha) delete G.ilha.resgatado; if (G.missions) { delete G.missions.porongos; delete G.missions.fogueira; } } },
  { id: 'caverna', icone: '⛏️', nome: 'Caverna da Serra', chefes: ['diabo'], zera() { const st = caveState(); for (const k of ['salamanca', 'salamancaFled', 'jarauMet']) delete st[k]; if (missionState('jarau')) G.missions.jarau = { status: 'active', day: G.day }; caveRun = null; } }
];
const testeChefe = id => TESTE_CHEFES.find(c => c.id === id);
function testeArmas() {
  const cs = caveState(); cs.facao = true; cs.forged ??= {}; cs.up ??= {}; for (const w of CAVE_WEAPONS) if (w.id !== 'facao') cs.forged[w.id] ??= G.day; for (const u of CAVE_UPGRADES) cs.up[u.id] = true;
  Object.assign(G.up, { bodoque: true, revolver38: true, arpao: true, carabina: true }); G.balas38 = Math.max(G.balas38 || 0, 99); const st = ilhaState(); st.facaoPrata ??= G.day; st.cartuchos = Math.max(st.cartuchos || 0, 30); cs.hp = caveMaxHp();
  const pa = pampaState(); pa.lancaUp ??= {}; for (const m of LANCA_MELHORIAS) pa.lancaUp[m.id] ??= G.day; pa.fio = PAMPA_FIO.max; const ps = poderState(); for (const k of Object.keys(PODERES)) ps.has[k] ??= G.day; save(); refreshHUD();
}

// ---------- A tela ----------
function testeTela(aba = 'chefes', aviso = '') {
  if (!testeLiberado()) return;
  const abas = [['chefes', 'Chefes'], ['areas', 'Áreas'], ['resetar', 'Resetar'], ['armas', 'Armas']].map(([id, nome]) => `<button ${id === aba ? 'class="primary" ' : ''}data-act="testChefes" data-id="${id}">${nome}</button>`).join('');
  let corpo = '';
  if (aba === 'chefes') {
    const grupos = [...new Set(TESTE_CHEFES.map(c => c.grupo))];
    corpo = '<p class="small-note">Vai direto pra luta, em qualquer momento da história. ✔ já vencido.</p>' + grupos.map(g => `<h3 class="forja-sec">${g}</h3><div class="game-menu" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">${TESTE_CHEFES.filter(c => c.grupo === g).map(c => `<button data-act="testLuta" data-id="${c.id}">${c.feito() ? '✔ ' : ''}${c.nome}</button>`).join('')}</div>`).join('')
      + `<h3 class="forja-sec">Lendas</h3><div class="game-menu" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">${Object.keys(LENDA_BOSS).map(id => `<button data-act="testLenda" data-id="${id}">${G.folk?.[id]?.wins ? '✔ ' : ''}${FOLK[id].name}</button>`).join('')}</div>`;
  } else if (aba === 'areas') {
    corpo = `<div class="game-menu" style="grid-template-columns:repeat(auto-fit,minmax(150px,1fr))">${TESTE_LUGARES.map(q => `<button data-act="testVai" data-id="${q.id}">${q.nome}</button>`).join('')}<button data-act="testBodega">Dentro da bodega</button></div><h3 class="forja-sec">Cenas do fim</h3><div class="game-menu"><button data-act="testCena" data-id="final">Final do pampa</button><button data-act="testCena" data-id="fogueira">Fogueira da libertação</button></div>`
      + Object.entries(TESTE_FAIXAS).map(([id, f]) => { const op = []; for (let n = f.de; n <= f.ate(); n++) op.push(`<option value="${n}">${f.rotulo(n)}</option>`); return `<h3 class="forja-sec">${f.nome}</h3><div class="game-menu"><select id="testeN-${id}" aria-label="${f.nome}">${op.join('')}</select><button data-act="testFaixa" data-id="${id}">Ir</button></div>`; }).join('');
  } else if (aba === 'resetar') {
    const linha = a => forjaCard(`<span class="bag-emoji">${a.icone}</span>`, a.nome, a.chefes.map(id => (testeChefe(id).feito() ? '✔ ' : '· ') + testeChefe(id).nome).join('<br>'), '', `<button data-act="testReset" data-id="${a.id}">Resetar</button>`);
    corpo = `<p class="small-note">Zera os chefes da área e o que tinha pra achar hoje. Armas, dinheiro, fogos acesos e o resto da história ficam como estão.</p><div class="store-list">${TESTE_AREAS.map(linha).join('')}</div><div class="game-menu"><button class="primary" data-act="testReset" data-id="tudo">Resetar todas as áreas</button></div>`;
  } else {
    const atual = caveWeapon().id, op = CAVE_WEAPONS.filter(w => weaponOwned(w.id)).map(w => `<option value="${w.id}"${w.id === atual ? ' selected' : ''}>${w.name}</option>`).join('');
    corpo = `<div class="game-menu"><button class="primary" data-act="testArmas">Liberar todas as armas e melhorias</button></div><h3 class="forja-sec">Arma na mão</h3><div class="game-menu"><select id="testeArma" aria-label="Arma na mão">${op}</select><button data-act="testArma">Usar esta</button></div>`;
  }
  openDialog('Testar áreas e chefes', `${aviso ? `<p><b>${aviso}</b></p>` : ''}<div style="display:grid;grid-template-columns:repeat(4,1fr);gap:6px;margin-bottom:10px">${abas}</div>${corpo}<div class="actions"><button data-act="testChefesVolta">Voltar pro menu</button></div>`, 'pause');
}
// As duas cenas do fim, a qualquer hora. Rodar a cena conta como tê-la visto, como no jogo.
function testeCena(id) {
  testeVai(() => {
    const st = pampaState();
    if (id === 'final') { for (const k of ['lanceiros', 'sargento', 'boi', 'capitao', 'moringue']) st[k] ??= G.day; delete st.republica; delete st.fogueira; delete st.fogueiraVista; const P = pampaLayout(PAMPA_N.moringue).bento; switchMap({ map: 'pampa', n: PAMPA_N.moringue, x: P.x - 300, y: P.y + 80 }); pampaFinal({}); return; }
    st.republica ??= G.day; delete st.fogueira; delete st.fogueiraVista; const p = front(VILA.bodega, 70); switchMap({ map: 'vila', x: p.x, y: p.y }); fogueiraComeca();
  });
}
function testeReset(id) {
  if (!testeLiberado()) return;
  const areas = id === 'tudo' ? TESTE_AREAS : TESTE_AREAS.filter(a => a.id === id); if (!areas.length) return;
  for (const a of areas) a.zera();
  // A peleia começa de novo com o chefe no lugar, e ninguém fica preso atrás de uma cancela que voltou a fechar.
  if (!lendaFight) mataNight = null;
  if (worldOut && !inCave() && !worldMap().indoor && !worldMap().canWalk(worldOut.x, worldOut.y)) { const s = worldMap().spawn?.(); if (s) Object.assign(worldOut, s); }
  save(); testeTela('resetar', id === 'tudo' ? 'Todas as áreas resetadas.' : areas[0].nome + ' resetado.');
}
function testeLenda(id) {
  if (!LENDA_BOSS[id]) return;
  testeVai(() => { if (worldMap().indoor) switchMap({ map: 'serra', x: 1500, y: 1010 }); testeFalas(); lendaStart(id); });
}
{
  const act = action; action = function (name, id) {
    switch (name) {
      case 'testChefes': testeTela(id || 'chefes'); return;
      case 'testChefesVolta': pauseGame(); return;
      case 'testReset': testeReset(id); return;
      case 'testCena': testeCena(id); return;
      case 'testLenda': testeLenda(id); return;
      case 'testLuta': { const c = testeChefe(id); if (c) testeVai(c.vai); return; }
      case 'testVai': { const q = TESTE_LUGARES.find(x => x.id === id); if (q) testeVai(q.vai); return; }
      case 'testFaixa': { const f = TESTE_FAIXAS[id], n = Number($('testeN-' + id)?.value); if (f && n) testeVai(() => f.vai(n)); return; }
      case 'testBodega': if (testeLiberado()) { testeSai(); testeFalas(); goInside(); closeDialog(true); save(); } return;
      case 'testArmas': if (testeLiberado()) { testeArmas(); testeTela('armas', 'Todas as armas e melhorias liberadas.'); } return;
      case 'testArma': { const w = $('testeArma')?.value; if (testeLiberado() && w && weaponOwned(w)) { caveState().weapon = w; save(); refreshHUD(); testeTela('armas', caveWeapon().name + ' na mão.'); } return; }
    }
    return act(name, id);
  };
  // A porteira do pampa fica sempre aberta, e a mata não trava depois de um desmaio.
  const porteira = pampaAberto; pampaAberto = function () { return testeLiberado() || porteira(); };
  const trava = mataLockedToday; mataLockedToday = function () { return !testeLiberado() && trava(); };
}
