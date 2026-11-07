// O que faz o pampa andar pra frente, como os acampamentos e a ferraria fazem na mata:
//   · Os cinco fogos, cada um com um farrapo: chegou perto a primeira vez, a prosa e o presente (uma vantagem que não mexe em
//     dano nem vida). Depois, causos novos e a dica do próximo passo.
//   · A lança melhora na forja do seu Zeferino, em quatro passos, com o que cai dos bichos, dos imperiais e dos chefes.
//   · O seu Zeferino vende o que vai no bornal, porque do trecho 2 em diante o caminho é longo.
//   · O Assobio do Boi Barroso: o poder que se ganha vencendo o boi. O touro que ninguém laçou vem quando o Sadi chama.
//   · A tela diz o que fazer em cada luta (pampaObjetivo) e avisa a hora da lança firme.
'use strict';

// ---------- Os materiais ----------
Object.assign(BAG_RAW, {
  couro_cru: { name: 'Couro cru', icon: '🟤', value: 3, note: 'Couro de graxaim e de teiú. O seu Zeferino usa nas melhorias da lança.' },
  chifre_boi: { name: 'Chifre do Boi Barroso', icon: '🐂', value: 40, note: 'O boi que ninguém laçou deixou este chifre. Vira o encaixe da lança, na forja do seu Zeferino.' },
  dragona: { name: 'Dragona do capitão', icon: '🎖️', value: 40, note: 'A dragona do capitão de cavalaria. O seu Zeferino faz dela a flâmula da lança.' }
});
const pampaItemArtes = {};
function pampaItemCanvas(k) {
  if (pampaItemArtes[k]) return pampaItemArtes[k];
  const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = '#2a1a0c'; g.lineWidth = 4;
  const forma = (pts, cor) => { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); g.fillStyle = cor; g.fill(); g.stroke(); };
  if (k === 'couro_cru') { forma([[24, 18], [46, 26], [70, 16], [78, 40], [68, 56], [76, 80], [50, 72], [26, 82], [30, 56], [16, 40]], '#a8784a'); g.strokeStyle = '#7a5230'; g.lineWidth = 3; g.beginPath(); g.moveTo(34, 38); g.lineTo(60, 34); g.moveTo(32, 54); g.lineTo(62, 52); g.stroke(); }
  else if (k === 'chifre_boi') { g.beginPath(); g.moveTo(20, 76); g.quadraticCurveTo(26, 34, 74, 16); g.quadraticCurveTo(52, 44, 44, 82); g.closePath(); g.fillStyle = '#e6dcc2'; g.fill(); g.stroke(); g.beginPath(); g.moveTo(74, 16); g.quadraticCurveTo(62, 26, 56, 36); g.lineWidth = 8; g.strokeStyle = '#3a2a18'; g.stroke(); g.lineWidth = 3; g.strokeStyle = '#b8a888'; g.beginPath(); g.moveTo(28, 62); g.lineTo(46, 66); g.moveTo(32, 48); g.lineTo(50, 52); g.stroke(); }
  else { forma([[18, 30], [78, 30], [84, 44], [12, 44]], '#23305a'); g.fillStyle = '#d8b040'; for (let i = 0; i < 8; i++) { g.fillRect(16 + i * 9, 44, 6, 24 + (i % 2) * 5); } g.strokeRect(14, 44, 68, 2); g.beginPath(); g.arc(48, 36, 6, 0, Math.PI * 2); g.fillStyle = '#f0d060'; g.fill(); g.stroke(); }
  return pampaItemArtes[k] = c;
}
{
  const ehNosso = k => k === 'couro_cru' || k === 'chifre_boi' || k === 'dragona';
  const bi = bagIcon; bagIcon = function (k) { return ehNosso(k) ? `<span class="pixel-item"><img src="${pampaItemCanvas(k).toDataURL()}" width="48" height="48" alt=""></span>` : bi(k); };
  const icon = itemIconHTML; itemIconHTML = function (key, item = null) { return ehNosso(key) ? bagIcon(key) : icon(key, item); };
  const image = itemImageForSize; itemImageForSize = function (key, pixels) { return ehNosso(key) ? pampaItemCanvas(key) : image(key, pixels); };
}

// ---------- As melhorias da lança ----------
const LANCA_MELHORIAS = [
  { id: 'cabo', nome: 'Cabo de guajuvira', desc: 'Madeira dura e leve: a lança volta 15% mais ligeiro.', needs: { couro_cru: 6, ferro_imperial: 3 }, cost: 150 },
  { id: 'ponta', nome: 'Ponta temperada', desc: 'Ferro imperial batido e temperado: +12 de dano.', needs: { ferro_imperial: 10 }, cost: 300, antes: 'cabo' },
  { id: 'chifre', nome: 'Encaixe de chifre', desc: 'Com o chifre do Boi Barroso: +40 de alcance, e quem cai da lança firme apanha em dobro.', needs: { chifre_boi: 1, couro_cru: 10 }, cost: 450, antes: 'ponta' },
  { id: 'flamula', nome: 'Flâmula farrapa', desc: 'Com a dragona do capitão: +8 de dano, e o quarto golpe deixa tonto quem estiver em volta.', needs: { dragona: 1, ferro_imperial: 14, couro_cru: 8 }, cost: 700, antes: 'chifre' }
];
function pampaLancaTem(id) { return !!G?.pampa?.lancaUp?.[id]; }
function pampaLancaSecao(sec) {
  if (!weaponOwned('lanca')) return '';
  const linhas = LANCA_MELHORIAS.map(m => {
    const tem = pampaLancaTem(m.id), bloq = m.antes && !pampaLancaTem(m.antes), ok = hasNeeds(m.needs) && hasCash(m.cost);
    if (tem) return forjaCard(pampaLancaIcone(48), m.nome, m.desc, '', '<button disabled>✔ Feito</button>', 'owned');
    return forjaCard(pampaLancaIcone(48), m.nome, m.desc, bloq ? `<span class="req miss">antes: ${LANCA_MELHORIAS.find(x => x.id === m.antes).nome}</span>` : reqChips(m.needs, m.cost), `<button class="primary" data-act="pampaMelhora" data-id="${m.id}" ${!bloq && ok ? '' : 'disabled'}>${bloq ? 'Depois' : ok ? 'Fazer' : 'Falta material'}</button>`);
  }).join('');
  return sec('🔱 Lança do Lanceiro Negro', 'com o que cai dos inimigos e dos chefes', linhas);
}
function pampaMelhora(id) {
  const m = LANCA_MELHORIAS.find(x => x.id === id); if (!m || pampaLancaTem(id) || (m.antes && !pampaLancaTem(m.antes)) || !hasNeeds(m.needs) || !hasCash(m.cost)) return;
  takeNeeds(m.needs); spendCash(m.cost); (pampaState().lancaUp ??= {})[id] = G.day; AudioEngine.caveAnvil?.(); AudioEngine.caveGem?.(); save(); refreshHUD(); floatNote('🔱 ' + m.nome + ': pronto.'); pampaForja();
}
function pampaBolichoSecao(sec) {
  const bag = mataBag(), max = mataBagMax();
  return sec('🎒 Bornal', 'do seu Zeferino, pro caminho · teclas 1 a 5 usam', MATA_ITEMS.filter(i => ['marcela', 'carqueja'].includes(i.id)).map(i => { const have = bag[i.id] || 0, room = max - have, cost = i.cost * 2; return forjaCard(mataGearHTML(i.id), i.name + ` <small>· ${have}/${max}</small>`, i.desc, '', `<button class="primary" data-act="pampaItem" data-id="${i.id}" ${room > 0 && hasCash(cost) ? '' : 'disabled'}>${room > 0 ? 'Comprar · ' + money(cost) : 'Cheio'}</button>`); }).join(''));
}
function pampaItemCompra(id) {
  const it = MATA_ITEMS.find(i => i.id === id), bag = mataBag(); if (!it || (bag[id] || 0) >= mataBagMax() || !hasCash(it.cost * 2)) return;
  spendCash(it.cost * 2); bag[id] = (bag[id] || 0) + 1; AudioEngine.coins?.(); mataBeltRefresh(); save(); refreshHUD(); pampaForja();
}

// ---------- Os cinco fogos ----------
const PAMPA_FOLK = {
  garibaldi: { perk: 'Lenço vermelho: no pampa, o Grito farroupilha volta em 30 segundos em vez de 45.',
    meet: [['garibaldi', 'Chegou, gaúcho! Eu disse que desta vez não precisava de barco. Só de perna boa.'], ['sadi', 'Achei que tu ia ficar no refúgio.'], ['garibaldi', 'E perder a última? Vim na frente acender o fogo. Cada fogo deste caminho tem um dos nossos esperando.'], ['garibaldi', 'Daqui até o Cerro de Porongos são quinze trechos, e cada um é pior que o outro. Primeiro os bichos, depois a água, depois a gente do Moringue e, por fim, a cavalaria.'], ['garibaldi', 'O seu Zeferino, ali na forja, melhora arma com o que tu tirar dos inimigos. Não passa reto por ele.']],
    causos: [[['garibaldi', 'Em 1839, puxei dois barcos por terra, em cima de rodas, com dezenas de juntas de boi, até o mar. O Bento dizia que eu era louco.'], ['garibaldi', 'Era mesmo. Por isso deu certo.']], [['garibaldi', 'Se a coisa apertar, grita. De onde eu estiver, eu venho.']]] },
  lanceiro: { perk: 'Três lanças: o Lanceiro Negro e mais dois vão contigo na peleia do Sargento e na batalha final.',
    meet: [['lanceiro', 'Chegou, gaúcho. O general Canabarro mandou a gente acampar separado, aqui no banhado, longe do resto da tropa.'], ['sadi', 'Separado? Igual lá em 1844?'], ['lanceiro', 'Igual. Mas desta vez a gente não entrega arma nenhuma. Já chega de uma vez.'], ['lanceiro', 'Logo adiante, no Passo do Banhado, anda o Sargento Recolhedor: foi ele que recolheu as nossas lanças naquela noite. Ainda arrasta o feixe atrás de si, e o caminho passa por ele.'], ['lanceiro', 'Nós três vamos contigo. Quando tu chegar nele, a gente chega junto.']],
    causos: [[['lanceiro', 'A República prometeu liberdade pra quem pegasse em lança. A gente pegou.'], ['lanceiro', 'Lança a cavalo é coisa de quem não tem medo de chegar perto. E a gente nunca teve.']], [['lanceiro', 'Em cima do cavalo, ninguém é escravo de ninguém. Isso eu aprendi cedo.']]] },
  neto: { perk: 'Olho de coronel: os batedores escondidos no capim aparecem mais.',
    meet: [['neto', 'Alto! Quem vem lá?'], ['sadi', 'Sadi, da bodega. Tô indo buscar o Bento.'], ['neto', 'Coronel Antônio de Sousa Neto. Foi aqui que eu vi o Império correr, em 10 de setembro de 1836, no Seival.'], ['neto', 'No outro dia, proclamei a República no Campo dos Menezes, na frente da minha brigada. Ainda falta muita coisa pra ela valer de verdade.'], ['neto', 'Adiante tem um touro fechando o caminho. E os batedores do Moringue se escondem no capim, mas eu tenho olho de coronel. Presta atenção, que eu te ensino a ver.']],
    causos: [[['neto', 'Cavalaria ganha batalha. Mas quem ganha guerra é quem chega no fim com o cavalo inteiro.']], [['neto', 'O teu facão é de avô, não é? Dá pra ver pelo cabo. Essas coisas não se compram.']]] },
  anita: { perk: 'Chá da Anita: todo dia que tu descansar em algum fogo do pampa, ela deixa um chá de marcela no teu bornal.',
    meet: [['anita', 'Tá com cara de quem não dorme faz três trechos, bodegueiro. Senta.'], ['sadi', 'Anita? Aqui?'], ['anita', 'Onde o Giuseppe vai, eu vou. E onde ele não vai, eu vou antes.'], ['anita', 'Já fui presa, já procurei ele entre os mortos e já fugi a cavalo, de noite, com um filho no colo. Cavalaria imperial não me assusta.'], ['anita', 'A gente do capitão se mexe demais pra bala. Finca a lança e espera. Quem corre, apanha.'], ['anita', 'E toma: todo dia que tu descansar, vou deixar um chá de marcela no teu bornal. Bebe, que ninguém vira herói de barriga vazia.']],
    causos: [[['anita', 'Me chamam de heroína de dois mundos. Eu só não sabia ficar em casa.']], [['anita', 'Quando acabar, quero um mate na tua bodega. Mas é tu que paga.']]] },
  canabarro: { perk: 'Toque de clarim: o clarim do general avisa antes, e os cavaleiros levam mais tempo pra sair em carga.',
    meet: [['canabarro', 'Não precisa dizer nada. Eu sei onde a gente tá.'], ['sadi', 'General…'], ['canabarro', 'Foi sob o meu comando, em 1844. Os lanceiros acamparam ali e, dizem muitos, sem as armas. Até hoje discutem se foi traição.'], ['canabarro', 'Não vim aqui me explicar. Vim lutar do lado certo do campo, desta vez.'], ['canabarro', 'Um conselho de velho: o Moringue ataca na hora que tu acha que acabou. Fica firme quando ele vier. O meu clarim vai te dar mais tempo de ver.']],
    causos: [[['canabarro', 'Tem noite que eu ainda ouço os cavalos.']], [['canabarro', 'Descansa. Lá embaixo não tem fogo nenhum.']]] }
};
function pampaPerk(id) { return !!G?.pampa?.folk?.[id]; }
function pampaOcultoAlpha() { return pampaPerk('neto') ? .6 : .18; }
function pampaFolkAqui(L = pampaLayout()) { const f = pampaFogoAqui(L.n); return f?.folk && L.camp && !(L.n === 1 && !f.folk) ? f.folk : null; }
function pampaFolkSpot(L = pampaLayout()) { const q = ilhaFogoPartes(L.camp).folk; return { x: q.x, y: q.y }; }
function pampaFolkMeet(id) {
  const st = pampaState(), F = PAMPA_FOLK[id]; (st.folk ??= {})[id] = G.day; if (id === 'lanceiro') st.lanceiros = G.day; keys.clear(); mataXP(20); AudioEngine.heart?.(); save();
  pampaTalk([...F.meet, ['card', `<b>🔥 ${pampaFogoAqui()?.nome || 'Acampamento'}</b><br>${F.perk}`, PAMPA_AREAS[pampaArea()].nome]], null, 'Bora');
}
function pampaFolkProsa(id) {
  const st = pampaState(), F = PAMPA_FOLK[id]; st.prosa ??= {}; const k = st.prosa[id] = (st.prosa[id] || 0) + 1, c = F.causos[k % (F.causos.length + 1)];
  pampaTalk(c || [[id, 'Agora é contigo: ' + pampaGoal().replace(/^./, m => m.toLowerCase()) + '.']], null, 'Valeu');
}
function drawPampaFolk(id, x, y) { const dx = worldOut.x < x ? -1 : 1; if (id === 'neto') pampaFigura('neto', x, y, dx, 1); else sceneActorDraw(id, { x, y, dx, walk: false }); }
function pampaVoltaCasa() { const p = front(VILA.bodega, 70); mataNight = null; switchMap({ map: 'vila', x: p.x, y: p.y, title: 'Fronteira', text: 'De volta pra bodega.' }); }

// ---------- O Assobio do Boi Barroso ----------
Object.assign(PODERES, { boi: { name: 'Assobio do Boi Barroso', icon: '🐂', cd: 40, desc: 'O touro que ninguém laçou vem quando o Sadi assobia: atravessa o caminho e arrasta quem estiver na frente.' } });
Object.assign(PODER_DICAS, { boi: 'o Boi Barroso, lá no pampa, só respeita quem encara ele de frente' });
Object.defineProperty(PODERES.grito, 'cd', { get() { return pampaAqui() && pampaPerk('garibaldi') ? 30 : 45; }, configurable: true });
function pampaBoiPoder() {
  if (poderHas('boi')) return;
  poderGanha('boi', [['card', 'Do outro lado da taipa, o Boi Barroso para, vira a cabeça e fica olhando.', 'Mangueira de Pedra'], ['sadi', 'Pode ir, velho. Hoje ninguém mais te laça.'], ['sadi', '… Ele tá me seguindo pelo lado de fora da cerca?']]);
}
function poderBoi() {
  const p = worldOut, k = Math.hypot(p.dx || 0, p.dy || 0), ux = k ? p.dx / k : 1, uy = k ? p.dy / k : 0;
  poder.boi = { x: p.x - ux * 620, y: p.y - uy * 420, ux, uy, t: 1.5, feitos: new Set(), som: 0 };
  effect('🐂 Fiiiu!', p.x, p.y - 170, '#ffe2a6', 22); AudioEngine.assobio?.(); setTimeout(() => { AudioEngine.boiBerro?.(.03); }, 350);
}
function poderBoiTick(dt) {
  const B = poder.boi; if (!B) return; B.t -= dt; B.x += B.ux * 980 * dt; B.y += B.uy * 980 * dt; if ((B.som -= dt) <= 0) { B.som = .22; AudioEngine.tropel?.(.022); golpeTreme = Math.max(golpeTreme, .06); }
  if (Math.random() < dt * 24) fxPuffs(B.x - B.ux * 70, B.y, 1, 46, '#c8b890');
  const N = mataNight;
  for (const b of rangedTargets()) {
    if (B.feitos.has(b) || Math.hypot(b.x - B.x, (b.y - B.y) * 1.2) > 130) continue; B.feitos.add(b);
    if (b.montado && N?.pampa) { if (b.kind === 'moringue') moringueLancada(b, N); else pampaDerruba(b, N, 'O boi derrubou!'); }
    if (!b.boss && !b.lenda) { b.stun = Math.max(b.stun || 0, .9); const q = Math.hypot(b.x - B.x, b.y - B.y) || 1; if (typeof mataStep === 'function' && !inCave()) mataStep(b, (b.x - B.x) / q * 120, (b.y - B.y) / q * 120, 1); }
    effect('Boi Barroso!', b.x, b.y - 150, '#ffe27a', 17); AudioEngine.thud?.(); poderHit(b, 2.6); if (!poder.boi) return;
  }
  if (B.t <= 0) poder.boi = null;
}
function drawPoderBoi() {
  const B = poder.boi; if (!B) return; const flip = B.ux < 0, ok = typeof pampaFigureSprite === 'function' && pampaFigureSprite('boiBarroso', 5, B.x, B.y, 285, flip);
  ellipse(B.x, B.y + 3, 90, 18, 'rgba(14,16,8,.3)'); if (!ok) drawBoi(4, Math.floor(frameClock * 12) % 3, B.x, B.y + 6, 3.2, flip);
}
{
  const tick = poderTick; poderTick = function (dt) { tick(dt); if (!rangedCombat()) { poder.boi = null; return; } poderBoiTick(dt); };
  const draw = drawPoderWorld; drawPoderWorld = function () { draw(); if (rangedCombat()) drawPoderBoi(); };
  // O grito agora se ouve: a voz do Sadi e o clarim respondendo.
  const grito = poderGrito; poderGrito = function () { AudioEngine.gritoFarrapo?.(); return grito(); };
}

// ---------- O que fazer agora, na luta ----------
function pampaObjetivo(N, b) {
  if (b.kind === 'sargento') return b.state === 'rest' ? 'Agora! Bate nele!' : 'Sai das faixas vermelhas e bate entre um arremesso e outro';
  if (b.kind === 'boiBarroso') return b.state === 'cansado' ? 'Cansou! Bate agora!' : b.state === 'bate' ? 'Tonto! Aproveita!' : 'Q laça o boi (' + b.lacos + ' de ' + b.need + '). Sai da faixa laranja';
  if (b.kind === 'capitao') return b.montado ? (armaLanca() ? 'Fica firme: F quando ele vier em carga' : 'A cavalo o golpe não pega: Q laça, ou troca pra lança') : 'A pé! Bate antes do cavalo voltar';
  if (b.kind === 'moringue') {
    if (b.fase === 1) return (b.state === 'tonto' ? 'Empinou! Bate!' : armaLanca() ? 'Fase 1 de 3 · Fica firme: F quando ele chegar' : 'Fase 1 de 3 · Q laça, fora da carga') + ' (' + Math.min(b.lacos, MORINGUE.need) + ' de ' + MORINGUE.need + ')';
    if (b.state === 'rest' || b.state === 'vento') return b.state === 'vento' ? 'Minuano! Ele perdeu a guarda: bate!' : 'Agora! Bate!';
    return b.fase === 2 ? 'Fase 2 de 3 · Ele defende: bate depois da estocada dele' : 'Fase 3 de 3 · Os farrapos seguram a cavalaria: acaba com o coronel';
  }
  return '';
}
function pampaChefeHud(N, b) {
  const t = pampaObjetivo(N, b); if (!t) return; const dpr = canvas.width / Math.max(1, canvas.clientWidth), W = canvas.clientWidth, alerta = /Agora|Tonto|Cansou|Empinou|Minuano|A pé/.test(t);
  ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.font = '600 15px system-ui, sans-serif'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; const w = ctx.measureText(t).width + 30, x = W / 2 - w / 2, y = 54;
  ctx.fillStyle = alerta ? 'rgba(96,58,8,.9)' : 'rgba(18,14,10,.74)'; ctx.beginPath(); ctx.roundRect?.(x, y, w, 28, 8); ctx.fill(); ctx.fillStyle = alerta ? '#ffe27a' : '#f4ead0'; ctx.fillText(t, W / 2, y + 14.5); ctx.restore();
}
// A hora da lança firme: um anel em volta do Sadi mostra até onde a lança chega; quando o cavalo entra nele, é agora.
function pampaFirmeAviso(N) {
  if (!armaLanca() || N.faint) return; const p = worldOut, R = caveReach(); let c = null, cd = 1e9; for (const b of N.beasts) { if (b.hp <= 0 || !b.montado || !(b.carga || b.state === 'mira')) continue; const d = Math.hypot(b.x - p.x, b.y - p.y); if (d < cd) { cd = d; c = b; } } if (!c) return;
  const agora = c.carga && cd < R + 240; ctx.save(); ctx.strokeStyle = agora ? `rgba(255,226,120,${.75 + .25 * Math.sin(frameClock * 22)})` : 'rgba(255,255,255,.32)'; ctx.lineWidth = agora ? 5 : 2; ctx.beginPath(); ctx.ellipse(p.x, p.y, R * .8, R * .5, 0, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
  if (agora) txt('F!', p.x, p.y - 205, 30, '#ffe27a', 'center');
}

// ---------- Ligações ----------
{
  const act = action; action = function (name, id) { if (name === 'pampaMelhora') { pampaMelhora(id); return; } if (name === 'pampaItem') { pampaItemCompra(id); return; } return act(name, id); };
  const dmg = caveDmg; caveDmg = function () { return dmg() + (armaLanca() ? (pampaLancaTem('ponta') ? 12 : 0) + (pampaLancaTem('flamula') ? 8 : 0) : 0); };
  const cd = caveCd; caveCd = function () { return cd() * (armaLanca() && pampaLancaTem('cabo') ? .85 : 1); };
  const reach = caveReach; caveReach = function () { return reach() + (armaLanca() && pampaLancaTem('chifre') ? 40 : 0); };
  // A flâmula: o quarto golpe deixa tonto quem estiver em volta.
  const atk = mataAttack; mataAttack = function () {
    const N = mataNight, old = N?.swing, r = atk(), s = N?.swing;
    if (N?.pampa && s && s !== old && s.n === 4 && pampaLancaTem('flamula') && armaLanca()) { const p = worldOut, R = caveReach() * 1.3; for (const b of N.beasts) if (b.hp > 0 && !b.boss && Math.hypot(b.x - p.x, b.y - p.y) < R) b.stun = Math.max(b.stun || 0, 1); effect('Flâmula!', p.x, p.y - 190, '#ffb0a0', 17); }
    return r;
  };
  // O chá da Anita.
  const rest = pampaDescansa; pampaDescansa = function (f) { const st = pampaState(), r = rest(f); if (pampaPerk('anita') && st.chaDia !== G.day) { const bag = mataBag(); if ((bag.marcela || 0) < mataBagMax()) { bag.marcela = (bag.marcela || 0) + 1; st.chaDia = G.day; effect('+1 chá de marcela da Anita', worldOut.x, worldOut.y - 170, '#e8f0c8', 16); mataBeltRefresh(); save(); } } return r; };
  // O farrapo de cada fogo: aparece, puxa prosa na primeira vez e depois conta causo.
  const M = WORLD_MAPS.pampa, spots = M.spots, draw = M.draw;
  M.spots = function () {
    const list = spots.call(this), L = pampaLayout(), id = pampaFolkAqui(L), st = pampaState();
    if (id && st.folk?.[id]) { const q = pampaFolkSpot(L); list.push({ id: 'pampa:folk:' + id, x: q.x, y: q.y, radius: 110, label: 'Prosear com ' + (sceneSpeaker(id).name || id), act: () => pampaFolkProsa(id) }); }
    if (st.republica && (L.camp || L.palanque)) { const q = L.palanque ? { x: L.palanque.x + L.palanque.w / 2, y: L.palanque.y + L.palanque.h + 60 } : { x: L.camp.x + 40, y: L.camp.y + 100 }; list.push({ id: 'pampa:casa', x: q.x, y: q.y, radius: 110, label: 'Voltar pra bodega', act: pampaVoltaCasa }); }
    return list;
  };
  M.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers); if (scene) return; const L = pampaLayout(), id = pampaFolkAqui(L); if (!id) return;
    const q = pampaFolkSpot(L); if (seen(q.x, q.y, 200) && !(mataNight?.chefe)) layers.push({ y: q.y, draw: () => drawPampaFolk(id, q.x, q.y) });
  };
  const tick = outsideTick; outsideTick = function (dt) {
    tick(dt); if (!pampaAqui() || scene || modal || worldTalkOpen()) return;
    const L = pampaLayout(), id = pampaFolkAqui(L); if (!id || pampaPerk(id)) return; const q = pampaFolkSpot(L); if (Math.hypot(worldOut.x - q.x, worldOut.y - q.y) < 340) pampaFolkMeet(id);
  };
}
