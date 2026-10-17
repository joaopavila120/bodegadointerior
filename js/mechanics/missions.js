// Progressão do jogo inteiro: recompensas claras, dicas de primeira vez, missões da história (que também abrem a Serra e
// Santa Catarina), pedidos dos especiais dentro das casas, relíquias escondidas pelos mapas, frutas do mato, pescaria
// no trapiche e o calendário na frente da bodega.
'use strict';

// ---------- Recompensas ----------
function rewardParts(rw = {}) {
  const parts = [];
  if (rw.cash) parts.push(['💰', money(rw.cash)]);
  if (rw.xp) parts.push(['⭐', '+' + rw.xp + ' XP da bodega']);
  if (rw.rep) parts.push(['🏅', '+' + rw.rep + ' de reputação']);
  for (const [id, n] of Object.entries(rw.friend || {})) { const i = PEOPLE.findIndex(p => p.id === id); if (i >= 0) parts.push(['❤️', '+' + n + ' de amizade com ' + PEOPLE[i].name]); }
  for (const [k, q] of Object.entries(rw.items || {})) parts.push(['🎁', bagText(k, q) + ' · ' + bagName(k).toLowerCase()]);
  for (const [k, q] of Object.entries(rw.seeds || {})) parts.push(['🌱', q + ' × ' + (k === 'adubo' ? 'adubo' : CROPS[k]?.seed.toLowerCase())]);
  if (rw.decor) { const d = DECOR.find(x => x.id === rw.decor); if (d) parts.push(['🖼️', d.name + ' para enfeitar a bodega']); }
  if (rw.unlock) parts.push(['🔓', rw.unlock]);
  return parts;
}
function rewardHTML(rw) { return '<div class="reward-list">' + rewardParts(rw).map(([i, t]) => `<span><b aria-hidden="true">${i}</b>${t}</span>`).join('') + '</div>'; }
function grantReward(rw = {}) {
  if (rw.cash) G.cash = round(G.cash + rw.cash);
  if (rw.xp) gainXP(rw.xp);
  if (rw.rep) repChange(rw.rep);
  for (const [id, n] of Object.entries(rw.friend || {})) { const i = PEOPLE.findIndex(p => p.id === id); if (i >= 0) addFriendship(i, n); }
  for (const [k, q] of Object.entries(rw.items || {})) bagAdd(k, q);
  for (const [k, q] of Object.entries(rw.seeds || {})) hortaState().seeds[k] = (hortaState().seeds[k] || 0) + q;
  // Peça de decoração repetida vira dinheiro.
  if (rw.decor) { if (decorOwned(rw.decor)) G.cash = round(G.cash + (DECOR.find(d => d.id === rw.decor)?.cost || 30)); else decorState()[rw.decor] = true; }
  AudioEngine.coins(); save(); refreshHUD();
}
// Pequenas recompensas do dia a dia: XP que aparece na hora.
function farmXP(n, text) { gainXP(n); if (worldOut) worldSay((text ? text + ' · ' : '') + '+' + n + ' XP'); else effect('+' + n + ' XP', G.player.x, G.player.y - 125, '#d8ffac'); }

// ---------- Conversas com vários personagens (missões, pedidos e dicas) ----------
// Linhas: texto (Valter), [id, texto], ['sadi', texto], ['dica', texto] ou ['reward', recompensa, título].
let talkState = null;
function talk(lines, then, ok) { talkState = { lines: lines.map(l => typeof l === 'string' ? ['valter', l] : l), i: 0, then, ok }; showTalkLine(); }
function showTalkLine() {
  const s = talkState, [who, text, extra] = s.lines[s.i], last = s.i === s.lines.length - 1, button = last ? (s.ok || 'Vamos lá') : 'Continuar';
  if (who === 'card') { openDialog(extra || 'Aviso', `<div class="talk-card">${text}</div><div class="actions"><button class="primary" data-act="talkNext">${button}</button></div>`, 'talk'); return; }
  if (who === 'reward') { openDialog(extra || 'Recompensa recebida', `<div class="reward-card"><p>Você recebeu:</p>${rewardHTML(text)}</div><div class="actions"><button class="primary" data-act="talkNext">${button}</button></div>`, 'talk'); return; }
  if (who === 'dica') { openDialog(extra || 'Primeira vez', `<div class="rpg-speaker"><span class="portrait portrait-phone" style="width:88px;height:88px">💡</span><div><p><b>Primeira vez</b></p><p>${text}</p></div></div><div class="actions"><button class="primary" data-act="talkNext">${button}</button></div>`, 'talk'); return; }
  // Fala de personagem: a mesma caixa azul estilo RPG das cenas e das conversas na rua, com o mundo aparecendo atrás.
  const i = PEOPLE.findIndex(p => p.id === who), name = who === 'sadi' ? avatarName() : PEOPLE[i]?.name || who;
  const portrait = who === 'sadi' ? portraitFromSprite(avatarSprite(), 104) : undefined;
  modal = 'talk'; keys.clear(); pointerHold = false; $('overlay').classList.add('hidden'); showRpgBox('worldTalk', null);
  // A janela (escondida) guarda a mesma fala: título e texto continuam consultáveis como antes.
  $('dialogTitle').textContent = extra || name; $('dialogContent').innerHTML = `<div class="rpg-speaker"><div><p><b>${name}</b></p><p>${text}</p></div></div>`;
  showRpgBox('talk', { person: i, portrait, name, reply: String(text).replace(/<br\s*\/?>/gi, ' ').replace(/<[^>]+>/g, '') });
  $('talkAction').textContent = last ? 'E · ' + button : '';
}
function talkEnd() { showRpgBox('talk', null); }
function talkNext() { const s = talkState; if (!s) return; if (++s.i < s.lines.length) { showTalkLine(); return; } talkState = null; talkEnd(); closeDialog(true); s.then?.(); }
function talkSkip() { const s = talkState; if (!s) return; talkState = null; talkEnd(); closeDialog(true); s.then?.(); }
// E, Espaço, Enter ou clique: completa a fala que está sendo digitada; com ela inteira, passa para a próxima.
function talkKey() { if (!$('talkUI').classList.contains('hidden') && rpgTyping('talk')) { finishRpgTyping('talk'); return; } talkNext(); }
// A conversa do Valter (prólogo e dicas) usa a mesma janela.
function valterTalk(lines, then, ok) { talk(lines, then, ok); }
function valterNext() { talkNext(); }
function valterSkip() { talkSkip(); }
// Popups da história (missões, dicas) só aparecem quando a cena está livre; os testes automáticos desligam as cenas.
// Aviso de bloqueio (lugar fechado, tutorial, região): caixa de diálogo no meio da tela, e não aviso lateral.
function warnDialog(title, text) { openDialog(title, `<p>${text}</p><div class="actions"><button class="primary" data-act="close">Entendi</button></div>`, 'aviso'); AudioEngine.bad(); }
function storyCalm() { return scenesEnabled() && !modal && !scene && !G.lasso && !farmGame && !G.task && !G.dialogue && !G.bocce && !G.game && !G.penalties && !G.atCancha; }

// ---------- Primeira vez: cada coisa nova tem uma explicação ----------
const TEACH = {
  horta: ['A horta', 'Escolha a ferramenta na barra (<span class="keycap">1</span> a <span class="keycap">0</span>) e aperte <span class="keycap">E</span> na terra à frente. Cada planta precisa de água <b>uma vez por dia</b>; sem água por dois dias, o canteiro seca. Cada colheita dá experiência à horta: nos próximos níveis vêm mais canteiros, regador maior, pepino, mangueira e espantalho.'],
  campo: ['O campo e o curral', 'Ração no <b>cocho</b> hoje vira ovo nos ninhos e leite no balde amanhã. Recolha os ovos das galinhas e os ovinhos da codorneira, ordenhe a vaca e, na <b>cerca do boi</b>, aperte <span class="keycap">E</span> para laçar: o boi laçado vira mantas de costela e hambúrguer.'],
  loja: ['As lojas da Fronteira', 'No <b>caixa</b> de cada loja você compra o que não dá na roça. Tudo vai para o <b>inventário</b> (<span class="keycap">B</span>) e, quando você entra na bodega, o que é de balcão vai sozinho para a despensa.'],
  forno: ['Forno a lenha', 'O trigo da horta vira pão de xis: alterne <span class="keycap">A</span> e <span class="keycap">D</span> para sovar a massa. Cada fornada usa ' + 3 + ' trigo do inventário.'],
  tacho: ['Tacho do queijo', 'O leite da vaca vira queijo em fatias para o xis. Alterne <span class="keycap">A</span> e <span class="keycap">D</span> para mexer o leite até coalhar.'],
  compota: ['Mesa de compota', 'Na mesa de compota da cozinha, ovinhos de codorna ou pepinos com um <b>vidro</b> viram conserva para o balcão. Vidros no Atacado da Fronteira.'],
  laco: ['A laçada', 'Segure <span class="keycap">Q</span> para girar o laço e solte com o círculo sobre o boi. Cuidado com o quero-quero: o alvo vermelho no chão é rasante, saia dele ou aperte <span class="keycap">Espaço</span>. Laçado o boi, a carne vai direto para o inventário.'],
  inventario: ['O inventário', 'Tudo o que você colhe, cria, pesca ou compra fica no inventário (<span class="keycap">B</span>). Entrando na bodega, o que é de balcão vai para a despensa; trigo, leite, ovinhos e vidros ficam para o forno, o tacho e a mesa de compota.'],
  calendario: ['O calendário', 'Mostra a semana: domingo é costelão, quarta tem futebol, sábado tem baile ou campeonato. Planeje a roça e o estoque para os dias grandes.'],
  pedidos: ['Pedidos dos especiais', 'Converse com os moradores, em casa e na rua: alguns têm pedidos ou missões secundárias. Os pedidos aparecem com o tempo, conforme a amizade cresce: atenda bem na bodega e puxe prosa. Aceite, junte os itens (do inventário ou da despensa) e volte para entregar. Os aceitos ficam na aba <b>Missões</b> do celular.'],
  segredo: ['Relíquias escondidas', 'Há 12 relíquias espalhadas pela Fronteira, pela Serra e por Santa Catarina. Quando o chão brilha de perto, aperte <span class="keycap">E</span>. Três delas são páginas do caderno do vô.'],
  pesca: ['Pescaria no trapiche', 'Aperte <span class="keycap">E</span> quando o marcador passar na faixa verde para fisgar. São 3 lances por dia. O peixe vai para o inventário: vende no Armazém ou atende pedido de quem gosta de peixe.'],
  mato: ['Frutas do mato', 'Butiazeiro, pitangueira e guabirobeira dão fruta a cada dois dias. Colha e venda no Armazém Querência, ou guarde para os pedidos dos especiais.'],
  serra: ['Serra Gaúcha', 'Colônia italiana, vinhedos, a igreja e o salão da comunidade. Badin, os gêmeos da Casona, Mito do Sul e Dianho moram aqui: visite as casas.'],
  sc: ['Santa Catarina', 'O Vale Europeu: Lauro, Indavírus, Peixinho na Brasa e Loli Gebien moram aqui. Tem pitangueira e a canchinha do Lauro.'],
  manha: ['A manhã antes de abrir', 'O dia começa às 6h: horta, curral, compras e prosa. Às 9h vem o aviso para abrir; se a bodega continuar fechada ao meio-dia, a freguesia vai embora, você perde reputação e o evento do dia.'],
  falta: ['Produto em falta', 'Freguês que pede bebida ou produto do balcão sem estoque fica chateado e vai embora: perde reputação. Xis só é pedido quando dá para montar.<br><br>Faltou alguma coisa? Dá para <b>ligar pro Atacado</b> pelo celular (<span class="keycap">C</span> → Compras): chega pela porta em alguns segundos, mas sai bem mais caro do que produzir na roça ou comprar na loja.'],
  missoes: ['Missões', 'A <b>história</b> segue em capítulos, um depois do outro: o capítulo atual fica no alto, à esquerda, e a seta amarela mostra o caminho. As <b>secundárias</b> e os pedidos se descobrem conversando com o povo, em casa e na rua. Tudo fica na aba <b>Missões</b> do celular (<span class="keycap">C</span>).']
};
// No prólogo, o próprio tutorial explica estes: eles ficam marcados como vistos no fim.
const PROLOGUE_TEACH = ['horta', 'campo', 'loja', 'forno', 'tacho', 'compota', 'laco', 'inventario'];
function teachSeen(id) { return !!G.taught?.[id]; }
function teach(id) {
  if (!TEACH[id] || G.testMode || teachSeen(id) || prologueActive() && PROLOGUE_TEACH.includes(id)) return;
  G.taught ??= {}; G.taught[id] = true; (G.teachQueue ??= []).push(id); save();
}
// Antes da primeira vez numa estação, a explicação; depois, a ação.
function teachFirst(id, then) {
  if (!TEACH[id] || G.testMode || teachSeen(id) || !scenesEnabled() || prologueActive() && PROLOGUE_TEACH.includes(id)) { then?.(); return; }
  G.taught ??= {}; G.taught[id] = true; save();
  talk([['dica', TEACH[id][1], 'Primeira vez · ' + TEACH[id][0]]], then, 'Entendi');
}
function teachTick() { if (!G.teachQueue?.length || !storyCalm()) return; const id = G.teachQueue.shift(); save(); talk([['dica', TEACH[id][1], 'Primeira vez · ' + TEACH[id][0]]], null, 'Entendi'); }

// ---------- Regiões que se abrem com a história ----------
// Jogos novos começam só com a Fronteira; saves antigos (sem G.regions) seguem com tudo aberto.
function regionLocked(map) { return !!G.regions && G.regions[map] === false; }
function unlockRegion(map) {
  if (!G.regions || G.regions[map]) return; G.regions[map] = true;
  showBanner('Nova região: ' + (map === 'serra' ? 'Serra Gaúcha' : 'Santa Catarina'), map === 'serra' ? 'Siga a estrada da Fronteira para a direita.' : 'Na Serra, pegue a estrada que sobe para o norte, no meio da vila.', 'level', { world: true }); AudioEngine.ready(); save();
}
function regionLockText(map) { return map === 'serra' ? 'A estrada da Serra abre quando o Valter confiar na bodega: abra a bodega <b>três noites seguidas</b> (missão do Valter).' : 'Santa Catarina abre com o <b>convite de Indaial</b>: uma carta do Lauro que chega na bodega, depois das missões do Badin.'; }
// Campeonatos de bocha e truco já encerrados (ganhando ou perdendo).
function sportCups(type) { return G.sportCups?.[type] || 0; }
// Segunda missão do Badin: a despensa da colônia abre (salame e muda de uva).
function openBadinShop() {
  G.badinShop = true;
  if (!G.up.salame) { G.up.salame = true; const n = GOODS.salame.starter || 4; G.stock.salame = (G.stock.salame || 0) + n; if (!G.toastLesson) G.toastLesson = { day: G.day + 1, done: false, actor: null }; }
  showBanner('Despensa da colônia aberta!', 'Salame curado e muda de uva na casa do Badin, na Serra.', 'level', { world: true }); save();
}
// Saves com a missão antiga do queijo (que abria a Serra) passam para a cadeia nova.
function migrateMissions() {
  const M = G.missions; if (!M || G.missionsV === 2) return;
  if (M.serra) { M.queijo ??= { status: M.serra.status === 'done' ? 'done' : 'active', day: M.serra.day }; if (M.queijo.status === 'active') M.campeonato ??= { status: 'done', day: G.day }; delete M.serra; }
  if (M.abertura?.status === 'done' && G.regions?.serra === false) G.regions.serra = true;
  if (M.queijo?.status === 'done') G.badinShop = true;
  G.missionsV = 2;
}

// ---------- Missões da história ----------
const MISSIONS = [
  // Antes do segundo dia, o Valter chega reclamando que não tem trago de pura: a mesa de tragos sai de graça na Ferragem.
  { id: 'trago', chapter: 1, title: 'Trago de pura', giver: 'valter', direct: () => tragoMorning(), where: 'Ferragem da Fronteira, à direita da cancha',
    guide: { region: 'vila', spot: 'ferragem', inside: 'ferragem', insideSpot: 'item:caixa' },
    when: () => G.tutorial?.complete && !tutorialActive() && !firstDay() && !worldOut && G.phase === 'prep',
    waitText: () => 'de manhã, na bodega · ou já compre a Mesa de tragos na Ferragem',
    goal: () => 'Compre a Mesa de tragos na Ferragem da Fronteira, à direita da cancha (sai de graça)',
    done: () => upgradeOwned('trago'), reward: { xp: 20, rep: 1 },
    outro: ['Agora sim, bodega de respeito! A mesa fica embaixo da torneira de cerveja: segura E pra servir a dose.', 'E a primeira dose de pura quem toma sou eu, hehe.'] },
  { id: 'abertura', chapter: 2, title: 'Três noites seguidas', giver: 'valter', where: 'Na bodega: abra no caixa todos os dias',
    when: () => G.tutorial?.complete && !tutorialActive(),
    intro: ['Bodega que se preze abre todo santo dia, vivente. Freguês gosta de porta aberta.', 'Abre a bodega três noites seguidas, sem falhar nenhuma. Aí eu te mostro a estrada da Serra: o Badin, lá de Erechim, quer te conhecer.'],
    goal: () => 'Abra a bodega 3 noites seguidas (' + Math.min(3, G.openStreak || 0) + '/3)',
    done: () => (G.openStreak || 0) >= 3, reward: { cash: 60, xp: 40, items: { vidro: 4 }, unlock: 'Estrada da Serra Gaúcha liberada' },
    onDone: () => unlockRegion('serra'),
    outro: ['Três noites seguidas! A freguesia já fala da bodega até na Serra.', 'A estrada da Serra Gaúcha tá liberada: segue a estrada da Fronteira pra direita.'] },
  { id: 'conhecer', chapter: 3, title: 'O colono de Erechim', giver: 'valter', needs: 'badin', where: 'Serra Gaúcha, casa de pedra do Badin',
    guide: { region: 'serra', spot: 'house:badin', inside: 'casa:badin', insideSpot: 'home:badin' },
    intro: ['O Badin, lá de Erechim, mandou dizer que quer te conhecer. Gente boa, mas a nona dele é brava que só.', 'Sobe a estrada da Serra e bate na casa de pedra dele. Vai que ele tem serviço pra ti!'],
    goal: () => 'Vá à Serra Gaúcha e fale com o Badin, na casa de pedra',
    done: () => !!G.metOutside?.badin, reward: { xp: 30, friend: { badin: 4 } }, outroBy: 'badin',
    outro: [['badin', 'Então é tu o neto do velho Sadi? A nona disse que o teu vô vendia o melhor salame da Fronteira… e que era tudo da colônia, hehe.']] },
  // O Badin manda organizar um campeonato de bocha na cancha da bodega (ganhar ou perder não importa): abre Santa Catarina.
  { id: 'campeonato', chapter: 4, title: 'Campeonato de bocha', giver: 'badin', where: 'Cancha de bocha, ao lado da bodega',
    guide: { region: 'vila', spot: 'cancha' },
    intro: [['badin', 'Ô, Sadi! Lá na tua bodega tem cancha de bocha, né?'], ['badin', 'Organiza um campeonato de bocha na tua cancha, que o povo da Serra quer ver. Ganhar ou perder não importa: o que vale é a festa!']],
    start: () => { G.missions.campeonato.base = sportCups('bocha'); },
    goal: () => 'Organize um campeonato de bocha na cancha da bodega (Cancha → Jogar campeonato). Ganhar ou perder, tanto faz',
    done: () => sportCups('bocha') > (G.missions.campeonato?.base || 0),
    reward: { cash: 70, xp: 60, rep: 3, friend: { badin: 10 } },
    outro: [['badin', 'Que campeonato! Até a nona torceu, e ela nem gosta de bocha.'], ['badin', 'Passa lá em casa um dia desses, que a nona quer te pedir uma coisa.']] },
  // Segunda missão do Badin: o queijo pra nona. Cumprida, ele passa a vender salame e muda de uva.
  { id: 'queijo', chapter: 5, title: 'Queijo pra nona', giver: 'badin', needs: 'badin', visit: true, where: 'Serra Gaúcha, casa de pedra do Badin',
    guide: { region: 'serra', spot: 'house:badin', inside: 'casa:badin', insideSpot: 'home:badin' },
    intro: [['badin', 'A nona provou um xis da tua bodega e quer saber de onde vem esse queijo.'], ['badin', 'Me traz 10 fatias do queijo da tua vaca? Se ela aprovar, a despensa da colônia abre pra ti: salame curado e muda de uva.']],
    deliver: { to: 'badin', items: { queijo: 10 } },
    goal: () => 'Leve 10 fatias de queijo ao Badin, na casa de pedra da Serra Gaúcha',
    thanks: [['badin', 'A nona aprovou! Disse que tu é “um bom rapaz”, o maior elogio que ela já deu.'], ['badin', 'A despensa da colônia tá aberta pra ti: salame da nona e muda de uva pra fazer vinho de garrafão. É só passar aqui em casa.']],
    reward: { cash: 50, xp: 50, friend: { badin: 10 }, unlock: 'Salame e muda de uva na casa do Badin' },
    onDone: () => openBadinShop() },
  { id: 'pomar', title: 'O pomar do vô', giver: 'valter', after: 'abertura', side: true, skipIfDone: true,
    intro: ['Teu vô tinha bergamota e pinhão no fundo da horta. Planta uma bergamoteira e uma araucária nas covas.', 'Muda tem no Armazém Querência. Quando derem fruto, a venda no balcão se libera sozinha.'],
    goal: () => 'Plante uma bergamoteira e uma araucária na horta (' + ['bergamota', 'araucaria'].filter(k => hortaState().trees.some(c => c.crop === k)).length + '/2)',
    done: () => ['bergamota', 'araucaria'].every(k => hortaState().trees.some(c => c.crop === k)),
    reward: { cash: 40, xp: 30, seeds: { adubo: 3 } } },
  { id: 'costelao', title: 'Domingo de costelão', giver: 'manolima', after: 'abertura', side: true, skipIfDone: true,
    intro: [['manolima', 'Buenas, vivente! Domingo é dia de costelão no campo, e índio véio não perde um.'], ['manolima', 'Laça um boi na cerca, que a carne vira manta pro fogo de chão. No domingo, abre a bodega no caixa: ela vira campo, com freguesia comprando costela no peso.']],
    goal: () => 'Faça o primeiro costelão de domingo', done: () => !!G.costelaoTaught,
    reward: { cash: 80, xp: 60, items: { racao: 2 } } },
  { id: 'caderno', title: 'O caderno do vô', giver: 'jayme', after: 'abertura', side: true,
    intro: [['jayme', 'Vivente, teu vô me mostrou uma vez um caderno: receita, causo, verso e o nome de cada boi.'], ['jayme', 'Dizem que o vento espalhou as páginas pela Fronteira, pela Serra e por Santa Catarina. Onde o chão brilhar de perto, olha com calma.']],
    goal: () => 'Encontre as 3 páginas do caderno do vô (' + pagesFound() + '/3)', done: () => pagesFound() >= 3,
    reward: { cash: 150, xp: 100, rep: 5 }, finale: () => playCadernoScene() },
  { id: 'indaial', chapter: 7, title: 'Convite de Indaial', giver: 'lauro', needs: 'lauro', letter: true, where: 'Santa Catarina, casa do Lauro',
    guide: { region: 'sc', spot: 'house:lauro', inside: 'casa:lauro', insideSpot: 'home:lauro' },
    intro: [['card', '<div class="carta-letter"><small>Indaial, Santa Catarina</small><p>Opa, Sadi!</p><p>Aqui é o Lauro, o da bocha. O Gustavo, do Jornal Indavírus, quer gravar uma reportagem contigo aqui em Indaial: bodegueiro gaúcho é notícia, ja!</p><p>A estrada de Santa Catarina tá aberta pra ti: na Serra, pega a estrada que sobe pro norte, no meio da vila. E traz uns pães de xis, que gravação dá fome.</p><p class="carta-sign">Abraço do Lauro Bolador</p></div>', 'Chegou uma carta!'], ['sadi', 'Indaial! Bora pegar a estrada de Santa Catarina.']],
    start: () => unlockRegion('sc'), deliver: { to: 'lauro', items: { pao_xis: 6 } },
    goal: () => 'Leve 6 pães de xis à casa do Lauro, em Santa Catarina',
    thanks: [['lauro', 'Chegou o pão! O Gustavo já tá ligando a câmera, ja.'], ['indavirus', 'Atenção, Indaial: bodegueiro do Sul entrega pão de xis caseiro! Reportagem exclusiva do Jornal Indavírus!']],
    reward: { cash: 60, xp: 60, friend: { lauro: 10, indavirus: 6 } } },
  // Terceira e última do Badin: o baile da comunidade. Doa R$ 100, vai à missa na igreja e serve no salão; depois o
  // baile de capela entra no calendário.
  { id: 'festa', chapter: 6, title: 'Baile da comunidade', giver: 'badin', needs: 'badin', visit: true, where: 'Serra Gaúcha: casa de pedra do Badin, igreja e salão da comunidade',
    guide: { region: 'serra', spot: 'house:badin', inside: 'casa:badin', insideSpot: 'home:badin' },
    intro: [['badin', 'A comunidade vai fazer um baile de capela, com missa e tudo: o primeiro baile no salão desde que a nona era moça!'], ['badin', 'Mas o padre precisa de doação pra banda e pra comida. Tu dá uma força? Cem pila pra comunidade, e tu ainda serve o vinho e a polenta no baile.']],
    goal: () => festaGoal(), done: () => !!G.missions.festa?.baile,
    reward: { cash: 150, xp: 100, rep: 6, decor: 'fogao_lenha', unlock: 'Baile de capela no calendário' }, outroBy: 'badin',
    outro: [['badin', 'Que baile! Até o padre dançou vanerão.'], ['badin', 'A comunidade decidiu: de tempos em tempos agora tem baile de capela. E a nona mandou um fogão a lenha que tava sobrando no porão!']] },
  { id: 'horta5', title: 'Mão boa pra terra', giver: 'valter', after: 'pomar', side: true, skipIfDone: true,
    intro: ['Tua horta tá linda, guri. Teu vô chegou a ter a horta mais caprichada da Fronteira.', 'Chega no nível 5 e o espantalho reforçado acaba com as pragas de vez.'],
    goal: () => 'Leve a horta ao nível 5 (agora: nível ' + hortaLevel() + ')', done: () => hortaLevel() >= 5,
    reward: { cash: 120, xp: 80 } },
  { id: 'reliquias', title: 'Relíquias da região', giver: 'jayme', side: true, when: () => secretsFound() >= 1,
    intro: [['jayme', 'Achou uma relíquia? A Fronteira, a Serra e Santa Catarina estão cheias de histórias perdidas.'], ['jayme', 'São doze, contando as páginas do caderno do teu vô. Junta todas e a bodega vira museu!']],
    goal: () => 'Encontre as 12 relíquias escondidas (' + secretsFound() + '/12)', done: () => secretsFound() >= SECRETS.length,
    reward: { cash: 250, xp: 150, rep: 8 } },
  { id: 'lendaria', chapter: 8, title: 'Bodega lendária', giver: 'valter', where: 'Na bodega: suba de nível atendendo bem',
    intro: ['Tu já é conhecido da Fronteira até Santa Catarina. Falta pouco pra virar lenda.', 'Chega no último nível da bodega e a gente faz a maior festa que esse galpão já viu.'],
    goal: () => 'Chegue ao nível ' + LEVELS.length + ' da bodega (agora: nível ' + bodegaLevel() + ')', done: () => bodegaLevel() >= LEVELS.length,
    reward: { cash: 500, rep: 10 } }
];
function tragoMorning() {
  const m = MISSIONS.find(x => x.id === 'trago');
  if (upgradeOwned('trago')) { G.missions.trago = { status: 'done', day: G.day }; save(); return; }
  talk([['valter', 'Bom dia, vivente! Passei pra tomar um trago de pura antes da lida e… cadê a cachaça?'], ['sadi', 'Ainda não tem mesa de tragos aqui, Valter.'], ['valter', 'Bodega sem trago de pura não é bodega, guri! Freguês da Fronteira vai embora reclamando.'], ['valter', 'O dono da Ferragem da Fronteira me deve um favor. Sai pela porta, vai na Ferragem, à direita da cancha, e pega a Mesa de tragos no caixa. Já tá paga!']], () => startMission(m), 'Vou lá');
}
function missionState(id) { return G.missions?.[id]; }
function missionDone(id) { return missionState(id)?.status === 'done'; }
function missionActive(id) { return missionState(id)?.status === 'active'; }
function missionReady(m) { return G.missions && !m.direct && !missionState(m.id) && (!m.after || missionDone(m.after)) && (!m.when || m.when()); }
// A missão que alguém tem para dar agora (o Sadi precisa encontrar a pessoa fora da bodega).
function missionForGiver(id) { if (!questsOn()) return null; id = questKey(id); return MISSIONS.find(m => !m.chapter && (m.giver || 'valter') === id && missionReady(m) && !(m.skipIfDone && m.done?.())) || null; }
// ---------- História: capítulos em sequência, que começam sozinhos ----------
function storyChapters() { return MISSIONS.filter(m => m.chapter).sort((a, b) => a.chapter - b.chapter); }
function currentChapter() { return storyChapters().find(m => !missionDone(m.id)) || null; }
function activeChapter() { const m = currentChapter(); return m && missionActive(m.id) ? m : null; }
function chapterWaiting() { const m = currentChapter(); return m && !missionState(m.id) && m.when && !m.when() ? m : null; }
// Capítulo que chama o Sadi: "visit" começa falando com quem dá a missão (em casa ou na rua); "letter" é uma carta
// que chega na bodega e só se lê lá dentro.
function chapterCalling() { const m = currentChapter(); return m && (m.visit || m.letter) && !m.direct && !missionState(m.id) && (!m.when || m.when()) ? m : null; }
function giverName(m) { return PEOPLE.find(p => p.id === m.giver)?.name || m.giver; }
function chapterCallText(m) { return m.letter ? 'Chegou uma carta na bodega: volte pra ler' : giverName(m) + ' quer falar com você · ' + (m.callWhere || m.where); }
// Quem a história precisa encontrar fica em casa esperando o Sadi.
function storyNeeds(id) { const m = activeChapter(); return !!m && m.needs === questKey(id); }
function startChapter(m) {
  G.missions[m.id] = { status: 'offered', day: G.day };
  talk([...speakerLines(m.intro, m.giver || 'valter'), ['dica', '<b>📖 Capítulo ' + m.chapter + ' · ' + m.title + '</b><br>' + m.goal() + (m.where ? '<br><i>Onde: ' + m.where + '</i>' : '') + '<br><br>Recompensa:' + rewardHTML(m.reward), 'História · capítulo ' + m.chapter]], () => startMission(m), 'Bora!');
}
// Falas soltas (texto puro) são de quem dá a missão.
function speakerLines(lines, id) { return (lines || []).map(l => typeof l === 'string' ? [id, l] : l); }
function offerMission(m, before = []) {
  const id = m.giver || 'valter';
  talk([...before, ...speakerLines(m.intro, id), ['dica', '<b>Missão: ' + m.title + '</b><br>' + m.goal() + '<br><br>Recompensa:' + rewardHTML(m.reward), 'Nova missão']], () => startMission(m), 'Aceitar missão');
}
// Encontro com um especial fora da bodega: na primeira vez, a apresentação; se tiver missão, ela vem na conversa.
const OUTSIDE_MEET = {
  valter: [['valter', 'Ô, vizinho! Fora do balcão tu até parece gente, hehe.']],
  manolima: [['manolima', 'Buenas, vivente! Mano Lima, o filósofo dos pampas. Conheci teu vô: bom de causo e ruim de truco.'], ['sadi', 'O senhor conheceu o vô?'], ['manolima', 'Tropeamos juntos. Passa na roda que eu te conto, com um trago na mão.']],
  baitaca: [['baitaca', 'Opa! Baitaca, do Rincão dos Pintos, lá de São Luiz Gonzaga. Tu é o guri que abriu bodega no galpão do velho Sadi?'], ['sadi', 'Sou eu mesmo!'], ['baitaca', 'Gente simples, de bodega simples. Qualquer hora eu apareço pra cantar.']],
  guri: [['guri', 'Bah, tchê! Guri de Uruguaiana, gaudério da fronteira. Tu que é o bodegueiro novo?'], ['sadi', 'Eu mesmo, Guri.'], ['guri', 'Então me guarda um xis taura, que eu passo lá!']],
  jayme: [['jayme', 'Buenas, vivente. Jayme Caetano Braun, pajador de Bossoroca.'], ['sadi', 'O poeta do Rio Grande?'], ['jayme', '“Quem anda pela coxilha encontra o que não procura…” Passa lá em casa, que verso se troca por mate.']],
  badin: [['badin', 'Badin, o colono, de Erechim! Tu é o Sadi da bodega? A nona já ouviu falar de ti.'], ['sadi', 'Bem ou mal?'], ['badin', 'Ainda não decidiu. Passa lá em casa, que ela decide rapidinho!']],
  marcio: [['marcio', 'É o quê? O Sadi da bodega aqui fora! Show de bola.'], ['marcelo', 'Podre de chique, Márcio! Passa na Casona, Sadi, é o quê?']],
  marcelo: [['marcelo', 'É o quê? O Sadi da bodega aqui fora! Show de bola.'], ['marcio', 'Passa na Casona, Sadi, que lá é podre de chique!']],
  mitodosul: [['mitodosul', 'Salve, salve! Mito do Sul, streamer. Bodegueiro de verdade, aqui na rua? O chat vai pirar!']],
  dianho: [['dianho', 'É os guri! Dianho, gângster de galpão, de Santa Cruz do Sul. Tu que é o Sadi? Tá todo Nicolas Cagezinho!']],
  lauro: [['lauro', 'Opa! Lauro Bolador, de Indaial. Bocha eu jogo, xis eu como, ja!']],
  indavirus: [['indavirus', 'Gustavo Pórco, do Jornal Indavírus! Bodegueiro gaúcho na rua é notícia, ja.']],
  peixinhonabrasa: [['peixinhonabrasa', 'Peixinho na brasa, Kaiser na mão! Tu é o Sadi da bodega? Morra de inveja, vagabundo, hehe!']],
  loligebien: [['loligebien', 'Prosit! Loli Gebien, o jovem alemão de Pomerode. Tamanco de madeira e chopp gelado, ja!']]
};
function specialWorldStory(i) {
  if (!questsOn()) return false;
  const call = chapterCalling(); if (call?.visit && call.giver === questKey(PEOPLE[i].id)) { startChapter(call); return true; }
  const id = PEOPLE[i].id, key = questKey(id), m = missionForGiver(id); G.metOutside ??= {};
  const first = !G.metOutside[key]; if (!m && !first) return false;
  G.metOutside[key] = G.day;
  let hello = [];
  if (first) { hello = G.metSpecial?.[id] && id !== 'valter' ? [[id, 'Ô, Sadi! Tu por aqui, fora da bodega? Que bom te ver, vivente.']] : OUTSIDE_MEET[id] || [[id, 'Buenas, Sadi! Prazer em te conhecer fora da bodega.']]; addFriendship(i, 3); }
  if (m) offerMission(m, hello); else talk(hello, null, 'Até mais');
  save(); return true;
}
function activeMissions() { return MISSIONS.filter(m => missionActive(m.id)); }
function startMission(m) { G.missions[m.id] = { status: 'active', day: G.day }; m.start?.(); teach('missoes'); showBanner((m.chapter ? '📖 Capítulo ' + m.chapter + ': ' : 'Missão: ') + m.title, m.goal(), 'info', { world: true }); save(); }
function completeMission(m) {
  G.missions[m.id] = { status: 'done', day: G.day }; grantReward(m.reward); m.onDone?.();
  const lines = [...speakerLines(m.outro, m.outroBy || m.giver || 'valter'), ['reward', m.reward, (m.chapter ? 'Capítulo ' + m.chapter + ' concluído · ' : 'Missão concluída · ') + m.title]];
  talk(lines, () => m.finale?.(), 'Receber'); save();
}
// Missão cumprida se conclui sozinha; as novas só saem na conversa (specialWorldStory), menos as de "direct".
// Saves antigos: capítulos anteriores ao último que o jogador já começou contam como concluídos.
function syncChapters() { const list = storyChapters(); let last = -1; list.forEach((m, i) => { const st = missionState(m.id); if (st && st.status !== 'offered') last = i; }); for (let i = 0; i < last; i++) if (!missionState(list[i].id)) G.missions[list[i].id] = { status: 'done', day: G.day }; }
function missionsTick() {
  migrateMissions(); if (G.missions) syncChapters();
  if (!G.missions || prologueActive() || tutorialActive()) return;
  // Mesa de tragos comprada antes do Valter pedir: o capítulo 1 conclui na hora, com a recompensa.
  const tr = MISSIONS.find(m => m.id === 'trago');
  if (tr && !missionDone('trago') && missionState('trago')?.status !== 'active' && tr.done()) { G.missions.trago = { status: 'done', day: G.day }; grantReward(tr.reward); showBanner('Capítulo 1 concluído · ' + tr.title, 'A Mesa de tragos já está na bodega.', 'level', { world: true }); save(); return; }
  if (!storyCalm()) return;
  for (const m of activeMissions()) if (!m.deliver && m.done?.()) { completeMission(m); return; }
  // Missão cujo objetivo já foi cumprido antes de alguém oferecer (ex.: o primeiro costelão): conclui sozinha, com a recompensa.
  for (const m of MISSIONS) if (m.skipIfDone && missionReady(m) && m.done?.()) { G.missions[m.id] = { status: 'done', day: G.day }; grantReward(m.reward); m.onDone?.(); showBanner('Missão já cumprida: ' + m.title, rewardParts(m.reward).map(p => p.join(' ')).join(' · '), 'level', { world: true }); save(); return; }
  // Conversa da história fechada sem querer (ou jogo recarregado no meio dela): o capítulo volta a ser oferecido.
  if (!talkState) for (const m of MISSIONS) if (missionState(m.id)?.status === 'offered') delete G.missions[m.id];
  const d = MISSIONS.find(m => m.direct && !missionState(m.id) && (!m.when || m.when())); if (d) { G.missions[d.id] = { status: 'offered', day: G.day }; d.direct(); return; }
  // O próximo capítulo começa sozinho: a história não depende de achar quem dá a missão.
  const ch = currentChapter(); if (!ch || ch.direct || missionState(ch.id) || ch.when && !ch.when()) return;
  // Visita: só começa com quem dá a missão por perto (na casa dele); senão, o aviso e o painel chamam o Sadi.
  if (ch.visit && worldOut?.map !== 'casa:' + ch.giver || ch.letter && worldOut) {
    G.calling ??= {}; if (!G.calling[ch.id]) { G.calling[ch.id] = G.day; showBanner(ch.letter ? 'Chegou uma carta na bodega!' : giverName(ch) + ' quer falar com você', ch.letter ? 'Volte pra bodega pra ler.' : (ch.callWhere || ch.where), 'info', { world: true }); AudioEngine.heart(); save(); }
    return;
  }
  startChapter(ch);
}

// ---------- Pedidos dos especiais (arcos no mundo aberto) ----------
// Cada especial pede, na própria casa, uma coisa de cada vez. Entregar dá dinheiro, amizade, XP e, às vezes, presente.
const HOUSE_QUESTS = {
  valter: [
    { want: { erva: 1000 }, ask: ['Ô, vizinho! Meu mate tá fraco que nem chá de hospital.', 'Me traz 1 kg da erva da tua erveira? Erva nova é outra coisa.'], thanks: ['Isso sim é erva! Verdinha, de carijo.', 'Toma uns trocos e uma muda: planta mais uma erveira, que tu não te arrepende.'], reward: { cash: 20, xp: 20, friend: { valter: 6 }, seeds: { erva: 1 } } },
    { want: { ovo: 8 }, ask: ['A patroa vai fazer ambrosia pro aniversário do neto.', 'Precisa de 8 ovos caipiras. Os teus são os melhores da Fronteira.'], thanks: ['A patroa mandou dizer que tu é o bodegueiro mais caprichoso do Rio Grande.', 'E mandou uns vidros de volta, pras tuas conservas.'], reward: { cash: 30, xp: 25, friend: { valter: 8 }, items: { vidro: 4 } } }
  ],
  // Mano Lima não faz pedidos de itens: depois de achar a Baia, ele abre o balcão de melhorias do facão.
  baitaca: [
    { want: { peixe: 2 }, ask: ['Opa, vivente! Fim de semana tem baile e eu canto até o galo cantar.', 'Pra aguentar, preciso de peixe frito. Me traz 2 peixes do rio Uruguai? O trapiche fica ali na beira.'], thanks: ['Que peixe bonito! Vai ser fritado com farinha e cantado em verso.', 'Toma: cachê de cantor do fundo da grota.'], reward: { cash: 40, xp: 30, friend: { baitaca: 10 } } },
    { want: { codorna: 3 }, ask: ['Tô compondo uma música sobre a tua bodega.', 'Pra inspiração, me traz 3 potes de ovos de codorna em conserva. Música boa tem tempero.'], thanks: ['Saiu o refrão: “Na bodega do Sadi tem conserva e tem amor”…', 'Ainda falta rima, mas a paga tá aqui.'], reward: { cash: 40, xp: 30, friend: { baitaca: 10 }, rep: 2 } }
  ],
  guri: [
    { want: { butia: 6 }, ask: ['Bah, tchê! Lá em Uruguaiana a gente faz licor de butiá.', 'Tem um butiazeiro na beira do rio, aqui na Fronteira. Me traz 6 butiás?'], thanks: ['Butiá maduro, cheirosinho! Daqui um mês tem licor.', 'Toma, gaudério. E leva uns vidros, que o primeiro licor é teu.'], reward: { cash: 25, xp: 25, friend: { guri: 8 }, items: { vidro: 2 } } },
    { want: { burger: 6 }, ask: ['Vai ter rodeio crioulo e a peonada vai ter fome.', 'Me traz 6 hambúrgueres do teu boi? Xis de rodeio é sagrado.'], thanks: ['Carne boa, de boi laçado! A peonada vai te aplaudir.', 'Leva a paga e uns sacos de ração pros teus bichos.'], reward: { cash: 45, xp: 30, friend: { guri: 10 }, items: { racao: 2 } } }
  ],
  jayme: [
    { want: { erva: 1000 }, ask: ['Vivente, a pajada pede cuia cheia.', 'Me traz 1 kg da tua erva e eu te pago com verso e com pila.'], thanks: ['“Erva da bodega do Sadi, verde que nem a coxilha…” Depois eu termino.', 'Toma o pila. O verso fica de lembrança.'], reward: { cash: 30, xp: 25, friend: { jayme: 8 } } },
    { want: { queijo: 6, pao_xis: 6 }, ask: ['O galpão crioulo da Fronteira vai homenagear os tropeiros.', 'Me traz 6 fatias de queijo e 6 pães de xis? Mesa farta honra a memória dos antigos.'], thanks: ['Mesa posta! O povo vai saber que a comida veio da tua bodega.', 'Toma, vivente. Quem alimenta a tradição merece paga.'], reward: { cash: 60, xp: 40, friend: { jayme: 10 }, rep: 3 } }
  ],
  badin: [
    { want: { ovo: 8 }, ask: ['Ô, Sadi! A nona vai fazer cuca de uva pro domingo.', 'Me traz 8 ovos? Ovo de granja ela não aceita nem que a vaca tussa.'], thanks: ['A nona aprovou! Disse que tu é “um bom rapaz”, que é o maior elogio que ela já deu.', 'Toma a paga e um salame da colônia, curado aqui em casa.'], reward: { cash: 35, xp: 30, friend: { badin: 8 }, items: { salame: 2 } } },
    { want: { bergamota: 3000 }, ask: ['Os sobrinhos vêm de Erechim e comem que nem gafanhoto.', 'Me traz 3 kg de bergamota do teu pomar? A daqui ainda tá verde.'], thanks: ['Bergamota docinha! Os piás vão brigar pela última.', 'Toma, e leva de presente uma muda de araucária. Daqui uns anos tu agradece.'], reward: { cash: 50, xp: 35, friend: { badin: 10 }, seeds: { araucaria: 1 } } }
  ],
  marcio: [
    { want: { cerveja: 6 }, ask: [['marcio', 'E o quê? Vai ter churras na Casona e faltou a cerveja!'], ['marcelo', 'É o quê? Show de bola se tu trouxer 6 canecas!']], thanks: [['marcio', 'Cerveja na Casona! Agora sim é churras.'], ['marcelo', 'Show de bola! Toma a paga, Sadi.']], reward: { cash: 45, xp: 30, friend: { marcio: 8, marcelo: 8 } } },
    { want: { burger: 6, pao_xis: 6 }, ask: [['marcio', 'O churras ficou tão bom que o pessoal quer xis no fim da noite.'], ['marcelo', 'Traz 6 hambúrgueres e 6 pães de xis? É o quê?']], thanks: [['marcelo', 'Xis da madrugada na Casona: lendário!'], ['marcio', 'Leva a paga e um poncho de lã que sobrou da última festa.']], reward: { cash: 70, xp: 40, friend: { marcio: 10, marcelo: 10 }, decor: 'poncho' } }
  ],
  mitodosul: [
    { want: { pao_xis: 4, salada: 4 }, ask: ['E aí, Sadi! Vou fazer live de Farming Simulator e quero comida de fazenda DE VERDADE na mesa.', 'Me traz 4 pães de xis e 4 saladas? Pra mostrar pro chat que roça é coisa séria.'], thanks: ['O chat foi à loucura! “Bodega do Sadi” nos assuntos do momento!', 'Toma a paga. E manda um abraço pro chat!'], reward: { cash: 40, xp: 30, friend: { mitodosul: 8 } } },
    { want: { pinhao: 2000 }, ask: ['Live de inverno pede pinhão.', 'Me traz 2 kg de pinhão da tua araucária? Vou cozinhar ao vivo.'], thanks: ['Pinhão cozido ao vivo: recorde de audiência!', 'Isso merece prêmio: toma!'], reward: { cash: 55, xp: 35, friend: { mitodosul: 10 }, rep: 2 } }
  ],
  dianho: [
    { want: { refri: 6 }, ask: ['É os guri! A revoada dos cupinxa vai ser aqui no galpão.', 'Me traz 6 refris? Revoada sem refri gelado não é revoada.'], thanks: ['Refri gelado pra revoada! Tá todo Nicolas Cagezinho.', 'Toma, que respeito se paga em dia.'], reward: { cash: 35, xp: 25, friend: { dianho: 8 } } },
    { want: { codorna: 3 }, ask: ['Os cupinxa gostam de petisco.', 'Me arruma 3 potes de ovos de codorna em conserva?'], thanks: ['Ovinho de codorna é o petisco oficial da revoada!', 'Toma. O Dianho nunca esquece quem ajuda.'], reward: { cash: 40, xp: 30, friend: { dianho: 10 } } }
  ],
  lauro: [
    { want: { peixe: 2 }, ask: ['Opa! Depois da bocha, o pessoal de Indaial gosta de peixe frito, ja.', 'Me traz 2 peixes do rio Uruguai? O Gustavo diz que peixe do Sul é mais gordinho.'], thanks: ['Peixe bonito! O Gustavo já quer filmar a fritura.', 'Toma a paga, e treina a bocha, que a revanche vem!'], reward: { cash: 40, xp: 30, friend: { lauro: 8 } } },
    { want: { burger: 6 }, ask: ['Vou fazer churrasquinho na canchinha.', 'Me traz 6 hambúrgueres? E não deixa o Gustavo saber que é pra mim.'], thanks: ['Carne de boi laçado! Isso é Lauro Bolador comendo bem.', 'Leva a paga e um saco de adubo que sobrou da horta da patroa.'], reward: { cash: 45, xp: 30, friend: { lauro: 10 }, seeds: { adubo: 3 } } }
  ],
  indavirus: [
    { want: { peixe: 3 }, ask: ['Atenção, Indaial! Reportagem especial: “O maior peixe do rio Uruguai”.', 'Só falta o peixe, ja. Me traz 3 peixes? O maior vai pra capa.'], thanks: ['Manchete garantida! “Bodegueiro gaúcho fisga o peixe do século”.', 'Toma o cachê do Jornal Indavírus.'], reward: { cash: 45, xp: 35, friend: { indavirus: 10 }, rep: 2 } },
    { want: { pitanga: 6 }, ask: ['Quadro de culinária do Jornal: “Doce de pitanga da vó”.', 'Me traz 6 pitangas? Tem pitangueira aqui em Santa Catarina, perto do café.'], thanks: ['Que cor bonita! Vai ficar lindo na câmera, ja.', 'Toma, e o endereço da bodega vai na reportagem.'], reward: { cash: 35, xp: 30, friend: { indavirus: 8 }, rep: 2 } }
  ],
  peixinhonabrasa: [
    { want: { peixe: 3 }, ask: ['Peixinho na brasa sem peixe é só brasa, né?', 'Me traz 3 peixes do rio? A Kaiser gelada eu já tenho.'], thanks: ['Brasa pronta, peixe no espeto! Hoje é festa.', 'Toma a paga, parceiro.'], reward: { cash: 45, xp: 30, friend: { peixinhonabrasa: 10 } } },
    { want: { cerveja: 6 }, ask: ['A Kaiser acabou e a família chegou.', 'Me traz 6 canecas de cerveja?'], thanks: ['Salvou o domingo! Agora sim: peixinho na brasa e cerveja.', 'Toma, e volta pro próximo peixe.'], reward: { cash: 45, xp: 30, friend: { peixinhonabrasa: 10 } } }
  ],
  loligebien: [
    { want: { cerveja: 6 }, ask: ['Ja! Oktoberfest em casa e o chopp acabou!', 'Me traz 6 canecas de cerveja? Prost!'], thanks: ['Prost! Agora sim a festa alemã tá completa, ja.', 'Toma, e aprende a dançar de tamanco.'], reward: { cash: 45, xp: 30, friend: { loligebien: 10 } } },
    { want: { pepino: 3 }, ask: ['Chucrute não tem, mas pepino em conserva serve, ja.', 'Me traz 3 potes de pepino em conserva?'], thanks: ['Pepino da bodega com salsicha de Pomerode: perfeito!', 'Toma a paga e um saco de adubo pra horta.'], reward: { cash: 50, xp: 35, friend: { loligebien: 10 }, seeds: { adubo: 3 } } }
  ]
};
// Onde mora cada um (para saber se a região está aberta e para a lista de pedidos).
const QUEST_HOMES = { valter: 'vila', manolima: 'vila', baitaca: 'vila', guri: 'vila', jayme: 'vila', badin: 'serra', marcio: 'serra', mitodosul: 'serra', dianho: 'serra', lauro: 'sc', indavirus: 'sc', peixinhonabrasa: 'sc', loligebien: 'sc' };
const REGION_NAMES = { vila: 'Fronteira', serra: 'Serra Gaúcha', sc: 'Santa Catarina' };
// Amizade para cada pedido aparecer: atenda bem na bodega e puxe prosa na rua.
const QUEST_FRIEND = [10, 30];
function friendshipOf(id) { const i = PEOPLE.findIndex(p => p.id === questKey(id)); return i >= 0 ? G.friends[i] || 0 : 0; }
function questKey(id) { return id === 'marcelo' ? 'marcio' : id; }
function questState(id) { G.quests ??= {}; return G.quests[questKey(id)] ??= { step: 0, active: false, next: 0 }; }
function questsOn() { return !!G.missions && !prologueActive() && !tutorialActive(); }
// O pedido atual de alguém: primeiro as missões que terminam na casa dele, depois o pedido da casa.
function questOffer(id) {
  if (!questsOn()) return null; id = questKey(id);
  const m = activeMissions().find(m => m.deliver?.to === id); if (m) return { kind: 'mission', m, want: m.deliver.items, reward: m.reward };
  const chain = HOUSE_QUESTS[id], s = questState(id), q = chain?.[s.step];
  if (!q || regionLocked(QUEST_HOMES[id]) || !s.active && (G.day < s.next || friendshipOf(id) < (QUEST_FRIEND[s.step] ?? 40))) return null;
  return { kind: 'quest', q, want: q.want, reward: q.reward, active: s.active };
}
function haveItem(k) { return bagQty(k) + (GOODS[k] ? G.stock[k] || 0 : 0); }
function canDeliver(want) { return Object.entries(want).every(([k, q]) => haveItem(k) >= q); }
function wantText(want) { return Object.entries(want).map(([k, q]) => `${bagText(k, q)} de ${bagName(k).toLowerCase()} <small>(tem ${bagText(k, haveItem(k))})</small>`).join(' · '); }
// Do inventário primeiro, depois da despensa da bodega.
function takeItems(want) {
  for (const [k, q] of Object.entries(want)) { const fromBag = Math.min(q, bagQty(k)); if (fromBag) bagTake(k, fromBag); if (q > fromBag) G.stock[k] = Math.max(0, G.stock[k] - (q - fromBag)); }
}
function questMarker(id) {
  if (missionForGiver(id) || chapterCalling()?.visit && chapterCalling().giver === questKey(id)) return 'new';
  const o = questOffer(id); if (!o) return null;
  if (o.kind === 'mission' || o.active) return canDeliver(o.want) ? 'deliver' : 'waiting';
  return 'new';
}
// Na casa: quem tem pedido abre a janela do pedido; os outros proseiam como sempre.
function houseResidentTalk(i, x, y) {
  const call = chapterCalling(); if (call?.visit && call.giver === questKey(PEOPLE[i].id) && storyCalm()) { startChapter(call); return; }
  if (specialWorldStory(i)) return;
  const id = PEOPLE[i].id, o = questOffer(id);
  if (!o) { worldTalk({ person: i, x, y, wait: 0, dx: 1 }); return; }
  teachFirst('pedidos', () => showQuest(i));
}
function showQuest(i) {
  const id = PEOPLE[i].id, o = questOffer(id); if (!o) return;
  const lines = o.kind === 'mission' ? [['sadi', 'Vim entregar: ' + o.m.title.toLowerCase() + '.']] : o.q.ask;
  const speech = lines.map(l => typeof l === 'string' ? `<p>${l}</p>` : l[0] === 'sadi' ? `<p><i>${l[1]}</i></p>` : `<p>${PEOPLE.find(p => p.id === l[0])?.name || l[0]}: ${l[1]}</p>`).join('');
  const ok = canDeliver(o.want), started = o.kind === 'mission' || o.active;
  openDialog(o.kind === 'mission' ? 'Missão · ' + o.m.title : 'Pedido de ' + PEOPLE[i].name, `<div class="rpg-speaker">${portraitHTML(i, 88)}<div>${speech}</div></div><div class="callout"><b>Pedido</b><br>${wantText(o.want)}</div><h3>Recompensa</h3>${rewardHTML(o.reward)}<div class="actions">${started
    ? `<button class="primary" data-act="questDeliver" data-id="${i}" ${ok ? '' : 'disabled'}>${ok ? 'Entregar' : 'Ainda falta'}</button><button data-act="close">Depois</button>`
    : `<button class="primary" data-act="questAccept" data-id="${i}">Aceitar pedido</button><button data-act="close">Agora não</button>`}</div>`, 'quest');
}
function questAccept(i) { const s = questState(PEOPLE[i].id); s.active = true; save(); closeDialog(true); worldSay('Pedido aceito. Ele fica na aba Missões do celular.'); }
function questDeliver(i) {
  const id = PEOPLE[i].id, o = questOffer(id); if (!o || !canDeliver(o.want)) return;
  takeItems(o.want); grantReward(o.reward); closeDialog(true);
  if (o.kind === 'mission') { G.missions[o.m.id] = { status: 'done', day: G.day }; o.m.onDone?.(); talk([...speakerLines(o.m.thanks, id), ['reward', o.reward, 'Missão concluída · ' + o.m.title]], () => o.m.finale?.(), 'Receber'); }
  else { const s = questState(id); s.step++; s.active = false; s.next = G.day + 1; G.questsDone = (G.questsDone || 0) + 1; talk([...speakerLines(o.q.thanks, id), ['reward', o.reward, 'Pedido entregue']], null, 'Receber'); }
  save();
}
function knownQuests() {
  return Object.keys(HOUSE_QUESTS).map(id => ({ id, o: questOffer(id) })).filter(x => x.o && x.o.kind === 'quest');
}
// O "!" sobre a casa (no mapa) e sobre quem tem pedido (dentro de casa).
function drawQuestBubble(x, y, kind) {
  const bob = Math.sin(frameClock * 4) * 3, color = kind === 'deliver' ? '#7ac850' : kind === 'new' ? '#ffd34a' : '#d8c8a8';
  ellipse(x, y + bob, 17, 17, '#2a1d12'); ellipse(x, y + bob, 14, 14, color);
  txt(kind === 'deliver' ? '✔' : kind === 'new' ? '!' : '…', x, y + bob + 1, 17, '#2a1d12', 'center', 'Arial', false);
}
function drawQuestMarkers(view) {
  return;   // sem "!" sobre as casas: as missões secundárias e os pedidos se descobrem conversando
  if (!questsOn() || !worldOut) return;
  for (const s of worldMap().spots()) {
    const id = s.house || (s.id.startsWith('home:') ? s.id.slice(5) : null); if (!id) continue;
    const kind = questMarker(id); if (kind) drawQuestBubble(s.x, s.y - (s.house ? 210 : 150), kind);
  }
}

// ---------- Relíquias escondidas ----------
const SECRETS = [
  { id: 'moeda', map: 'vila', x: 1580, y: 2320, name: 'Moeda do Império', text: 'Uma moeda de 1868, do tempo do Império, perdida perto do marco da fronteira. Alguém pagou um trago com ela.', reward: { cash: 30, xp: 20 } },
  { id: 'espora', map: 'vila', x: 2130, y: 1850, name: 'Espora de prata', text: 'Espora de prata lavrada, caída no pouso dos tropeiros. Deve ter vindo de Sorocaba e voltado sem o dono.', reward: { cash: 40, xp: 20 } },
  { id: 'garrafa', map: 'vila', x: 640, y: 1300, name: 'Garrafa com bilhete', text: 'Uma garrafa trazida pelo rio Uruguai. O bilhete diz: “Quem achar, toma um mate por mim”.', reward: { cash: 20, xp: 20, items: { vidro: 2 } } },
  { id: 'pagina1', map: 'vila', x: 3260, y: 470, page: true, name: 'Página do caderno do vô (1)', text: '“Xis do jeito certo: pão de trigo da casa, ovo do galinheiro e queijo da vaca. O resto é capricho.”', reward: { cash: 30, xp: 30 } },
  { id: 'cruz', map: 'vila', x: 2900, y: 1330, name: 'Cruz missioneira', text: 'Pequena cruz de dois braços, entalhada em pedra vermelha: a cruz das Missões, de São Miguel Arcanjo.', reward: { cash: 40, xp: 25, rep: 1 } },
  { id: 'rolha', map: 'serra', x: 2460, y: 1920, name: 'Rolha da primeira safra', text: 'Rolha de cortiça carimbada “1875”, o ano em que chegaram os primeiros colonos italianos à Serra.', reward: { cash: 35, xp: 20 } },
  { id: 'pagina2', map: 'serra', x: 400, y: 1720, page: true, name: 'Página do caderno do vô (2)', text: '“O Valter é o melhor amigo do meu filho. Quando eu faltar, que ele cuide do galpão junto com o guri.”', reward: { cash: 30, xp: 30 } },
  { id: 'gaitinha', map: 'serra', x: 2100, y: 1700, name: 'Gaita de boca do coreto', text: 'Uma gaitinha esquecida no coreto da praça. Ainda toca um “Prenda minha” desafinado.', reward: { cash: 30, xp: 20 } },
  { id: 'pinha', map: 'serra', x: 1455, y: 740, name: 'Pinha dourada', text: 'Uma pinha de araucária pintada de dourado: enfeite antigo de Natal da colônia.', reward: { cash: 35, xp: 20, seeds: { araucaria: 1 } } },
  { id: 'caneca', map: 'sc', x: 850, y: 1430, name: 'Caneca de chopp de Pomerode', text: 'Caneca de porcelana pintada à mão, da primeira Festa Pomerana. Ainda cheira a chopp.', reward: { cash: 40, xp: 20 } },
  { id: 'pagina3', map: 'sc', x: 2580, y: 920, page: true, name: 'Página do caderno do vô (3)', text: '“Bodega boa não se faz com dinheiro. Se faz com terra, com bicho e com gente.”', reward: { cash: 30, xp: 30 } },
  { id: 'bone', map: 'sc', x: 440, y: 1620, name: 'Boné perdido do Indavírus', text: 'Um boné escrito “Jornal Indavírus · Indaial”. O Gustavo procurou por semanas.', reward: { cash: 25, xp: 20, friend: { indavirus: 6 } } }
];
function secretsFound() { return SECRETS.filter(s => G.secrets?.[s.id]).length; }
function pagesFound() { return SECRETS.filter(s => s.page && G.secrets?.[s.id]).length; }
function secretSpots() {
  if (!worldOut || prologueActive()) return [];
  return SECRETS.filter(s => s.map === worldOut.map && !G.secrets?.[s.id]).map(s => ({ id: 'secret:' + s.id, x: s.x, y: s.y, radius: 70, label: 'Investigar o brilho no chão', act: () => findSecret(s) }));
}
function findSecret(s) {
  G.secrets ??= {}; if (G.secrets[s.id]) return; G.secrets[s.id] = G.day; grantReward(s.reward); AudioEngine.heart();
  const lines = [['dica', '<b>' + s.name + '</b><br>' + s.text + '<br><br>Relíquias: ' + secretsFound() + '/' + SECRETS.length + (s.page ? ' · páginas do caderno: ' + pagesFound() + '/3' : ''), 'Relíquia encontrada!'], ['reward', s.reward, 'Recompensa da relíquia']];
  if (!teachSeen('segredo')) { G.taught ??= {}; G.taught.segredo = true; lines.unshift(['dica', TEACH.segredo[1], 'Primeira vez · ' + TEACH.segredo[0]]); }
  talk(lines, null, 'Guardar'); save();
}
// O brilho só aparece de perto.
function drawSecrets() {
  if (!worldOut) return;
  for (const s of secretSpots()) {
    const d = Math.hypot(s.x - worldOut.x, s.y - worldOut.y); if (d > 260) continue;
    const a = (1 - d / 260) * (.55 + .45 * Math.sin(frameClock * 5 + s.x));
    const tw = 1 + .35 * Math.sin(frameClock * 6 + s.y);
    ctx.save(); ctx.globalAlpha = Math.max(0, a); ellipse(s.x, s.y, 22, 9, 'rgba(255,240,150,.35)'); ellipse(s.x, s.y, 9, 4, '#fff6b0');
    rect(s.x - 1.5, s.y - 22 * tw, 3, 30 * tw, '#fff8c8', 1); rect(s.x - 12 * tw, s.y - 9, 24 * tw, 3, '#fff8c8', 1);
    for (let k = 0; k < 4; k++) { const ang = frameClock * 2 + k * Math.PI / 2; rect(s.x + Math.cos(ang) * 20 - 2, s.y - 10 + Math.sin(ang) * 10 - 2, 4, 4, '#ffe27a', 1); } ctx.restore();
  }
}

// ---------- Frutas do mato ----------
const FORAGE = [
  { id: 'butiazeiro', map: 'vila', x: 760, y: 1560, item: 'butia', n: 6, name: 'Butiazeiro', of: 'do', color: '#f0a020' },
  { id: 'guabirobeira', map: 'serra', x: 1340, y: 1820, item: 'guabiroba', n: 6, name: 'Guabirobeira', of: 'da', color: '#e8b040' },
  { id: 'pitangueira', map: 'sc', x: 2300, y: 900, item: 'pitanga', n: 6, name: 'Pitangueira', of: 'da', color: '#d42a2a' }
];
const FORAGE_EVERY = 2;
function forageReady(f) { const last = G.forage?.[f.id]; return last == null || G.day - last >= FORAGE_EVERY; }
function forageSpots() {
  if (!worldOut || prologueActive()) return [];
  return FORAGE.filter(f => f.map === worldOut.map).map(f => ({ id: 'forage:' + f.id, x: f.x, y: f.y + 40, label: forageReady(f) ? 'Colher ' + bagName(f.item).toLowerCase() + ' ' + f.of + ' ' + f.name.toLowerCase() : f.name + ' · fruta de novo em ' + (FORAGE_EVERY - (G.day - G.forage[f.id])) + ' dia(s)', act: () => pickForage(f) }));
}
function pickForage(f) {
  if (!forageReady(f)) { worldSay((f.of === 'da' ? 'A ' : 'O ') + f.name.toLowerCase() + ' ainda está sem fruta madura.'); return; }
  teachFirst('mato', () => { G.forage ??= {}; G.forage[f.id] = G.day; bagAdd(f.item, f.n); AudioEngine.tick(); farmXP(2, f.n + ' ' + bagName(f.item).toLowerCase() + ' no inventário'); save(); });
}
function drawForage(layers, seen) {
  for (const f of FORAGE) {
    if (worldOut?.map !== f.map || !seen(f.x, f.y)) continue;
    layers.push({ y: f.y + 30, draw: () => {
      if(typeof drawForageArt==='function'&&drawForageArt(f))return;
      ellipse(f.x, f.y + 30, 34, 9, '#1c140c44'); rect(f.x - 4, f.y - 20, 8, 50, '#6a4424', 2);
      ellipse(f.x, f.y - 34, 38, 28, '#3f7a36'); ellipse(f.x - 16, f.y - 26, 22, 18, '#2f6a2a'); ellipse(f.x + 16, f.y - 28, 22, 18, '#4f8a3a');
      if (forageReady(f)) for (let k = 0; k < 7; k++) ellipse(f.x - 26 + (k * 37) % 52, f.y - 46 + (k * 13) % 30, 4, 4, f.color);
    } });
  }
}

// Serra e Santa Catarina também escondem relíquias e frutas do mato (a Fronteira já inclui as suas).
['serra', 'sc'].forEach(id => {
  const m = WORLD_MAPS[id], spots = m.spots, draw = m.draw;
  m.spots = function () { return [...spots.call(this), ...secretSpots(), ...forageSpots()]; };
  m.draw = function (view, seen, layers) { draw.call(this, view, seen, layers); drawForage(layers, seen); };
});

// ---------- Pescaria no trapiche ----------
const FISH_PER_DAY = 3;
function fishLeft() { return G.fish?.day === G.day ? FISH_PER_DAY - G.fish.n : FISH_PER_DAY; }
function goFishing() {
  if (fishLeft() <= 0) { worldSay('Por hoje chega de pescaria: o peixe ficou arisco. Amanhã tem mais.'); return; }
  teachFirst('pesca', () => startFarmGame({ title: 'Pescaria no trapiche', stages: [
    { kind: 'timing', label: 'Fisgar', text: 'A boia afundou! Aperte <span class="keycap">E</span> quando o marcador passar na faixa verde.', zone: [.36, .64], speed: .75, button: 'Fisgar', touchOnly: true, hitText: 'Fisgou!', missText: 'Escapou…' }
  ], done: r => {
    if (G.fish?.day !== G.day) G.fish = { day: G.day, n: 0 }; G.fish.n++;
    if (r[0]) { const n = Math.random() < .3 ? 2 : 1; catchRiverFish(n); }
    else worldSay('O peixe escapou. Restam ' + fishLeft() + ' lance(s) hoje.');
    save();
  } }));
}

// ---------- Calendário na frente da bodega ----------
function calendarDialog() {
  const c = calendar(), days = [];
  for (let d = G.day; d < G.day + 7; d++) {
    const fixed = fixedEventFor(d), planned = d === G.day ? G.event : d === G.day + 1 && G.nextEvent ? G.nextEvent : null, e = EVENTS[shownEventId(planned?.id || fixed)] || null, cd = calendar(d);
    const me = MAP_EVENTS[mapEventFor(d)];
    days.push(`<div class="calendar-day${d === G.day ? ' today' : ''}"><b>${cd.name}</b><small>dia ${dayNumber(d)}</small><span>${e ? e.icon : '🎲'}</span><em>${e ? e.name : 'a sortear'}</em>${me ? `<span class="cal-map">${me.icon} ${me.name}</span>` : ''}</div>`);
  }
  const missions = activeMissions().map(m => `<li><b>${m.title}</b>: ${m.goal()}</li>`).join('');
  const today = MAP_EVENTS[mapEventFor(G.day)];
  openDialog('Calendário de eventos', `<p>Hoje: <b>dia ${dayNumber()}</b>, ${c.label}.</p>${today ? `<div class="callout"><b>${today.icon} Evento no mapa: ${today.name}</b><br>${today.desc}</div>` : ''}<div class="calendar-grid">${days.join('')}</div>${missions ? '<h3>Missões em andamento</h3><ul>' + missions + '</ul>' : ''}`, 'worldStore');
}

// ---------- O caderno do vô completo ----------
function playCadernoScene() {
  if (!scenesEnabled()) return;
  playSteps([
    { view: 'bodega' }, { fade: 'in', time: .5 },
    { say: 'sadi', text: 'As três páginas do caderno do vô, juntas de novo.' },
    { overlay: 'note', text: '<b>Do caderno do vô</b><br><br>“Xis do jeito certo: pão de trigo da casa, ovo do galinheiro e queijo da vaca.”<br>“O Valter é o melhor amigo do meu filho. Quando eu faltar, que ele cuide do galpão junto com o guri.”<br>“Bodega boa não se faz com dinheiro. Se faz com terra, com bicho e com gente.”' },
    { say: 'sadi', text: 'Ele sabia que um dia o galpão ia acender de novo.' },
    { actor: 'valter', x: ENTRY.x, y: ENTRY.y, dx: -1 }, { do: () => AudioEngine.doorChime() }, { walk: 'valter', to: { x: 900, y: 670 } },
    { say: 'valter', text: 'Achou as páginas, guri? O velho escrevia bonito, né? Agora a bodega tem a mesma alma que tinha no tempo dele.' }
  ], 'caderno', null);
}

// ---------- Tique dos guias ----------
// Missões ativas no canto da tela, discretas (a opção de esconder fica na aba Missões do celular).
function trackerLines() {
  const lines = [], ch = activeChapter(), wait = chapterWaiting(), ev = mapEventToday(), t = ev?.def.tracker?.();
  if (ch) lines.push({ icon: '📖', title: 'Capítulo ' + ch.chapter + ' · ' + ch.title, goal: ch.goal(), kind: 'story' });
  else if (wait) lines.push({ icon: '📖', title: 'Próximo capítulo: ' + wait.title, goal: 'Começa ' + (wait.waitText?.() || 'em breve'), kind: 'story' });
  else { const call = chapterCalling(); if (call) lines.push({ icon: call.letter ? '✉️' : '📣', title: 'Capítulo ' + call.chapter + ' · ' + call.title, goal: chapterCallText(call), kind: 'story' }); }
  if (t) lines.push({ ...t, kind: 'event' });
  const side = activeMissions().filter(m => !m.chapter)[0]; if (side && lines.length < 2) lines.push({ title: side.title, goal: side.goal(), kind: 'side' });
  return lines.slice(0, 2);
}
function updateQuestTracker() {
  const el = $('questTracker'); if (!el) return;
  const show = started && G.missions && G.showTracker !== false && !prologueActive() && !G.lasso && !G.bocce && !G.penalties && !scene && !G.atCancha;
  const lines = show ? trackerLines() : []; el.classList.toggle('hidden', !lines.length);
  if (lines.length) setHTML(el, lines.map(l => `<div class="qt-line${l.kind ? ' ' + l.kind : ''}"><b>${l.icon || (l.kind === 'side' ? '◇' : '◆')} ${l.title}</b><span>${l.goal}</span></div>`).join(''));
}
function storyTick() {
  missionsTick(); teachTick(); mapEventsTick();
  if (morningActive()) teach('manha');
  if (worldOut?.map === 'serra' || worldOut?.map === 'sc') teach(worldOut.map);
}

// ---------- Aba Missões do celular ----------
function missionsPanel() {
  if (!G.missions) return '<div class="phone-intro"><h3>Missões</h3><p>As missões da história começam num jogo novo, depois do primeiro dia de bodega.</p></div>';
  const card = m => `<div class="mission-card"><b>${m.title}</b><p>${m.goal()}</p>${rewardHTML(m.reward)}</div>`, ch = activeChapter(), wait = chapterWaiting(), total = storyChapters().length;
  const story = ch ? `<div class="mission-card story"><b>📖 Capítulo ${ch.chapter} de ${total} · ${ch.title}</b><p>${ch.goal()}</p>${ch.where ? `<p class="small-note">Onde: ${ch.where}</p>` : ''}${rewardHTML(ch.reward)}</div>` : wait ? `<div class="mission-card story"><b>📖 Próximo capítulo · ${wait.title}</b><p>Começa ${wait.waitText?.() || 'em breve'}.</p></div>` : '', side = activeMissions().filter(m => !m.chapter).map(card).join('');
  const ev = mapEventToday(), evCard = ev ? `<div class="mission-card"><b>${ev.def.icon} ${ev.def.name}</b><p>${ev.def.tracker()?.goal || ev.def.desc}</p>${rewardHTML(ev.def.reward)}</div>` : '';
  const quests = knownQuests().filter(({ o }) => o.active).map(({ id, o }) => { const i = PEOPLE.findIndex(p => p.id === id); return `<div class="mission-card${o.active ? ' active' : ''}"><b>${PEOPLE[i].name} · ${REGION_NAMES[QUEST_HOMES[id]]}</b><p>${o.active ? (canDeliver(o.want) ? '✔ Pronto para entregar: ' : 'Aceito · falta juntar: ') : 'Novo pedido na casa: '}${wantText(o.want)}</p>${rewardHTML(o.reward)}</div>`; }).join('');
  const done = storyChapters().filter(m => missionDone(m.id)).length, travel = WORLD_DISCOVERIES ? WORLD_DISCOVERIES.filter(d => travelState().seen[d.id]).length : 0;
  return `<div class="phone-intro"><h3>Missões</h3><p>História: ${done} de ${total} capítulos · ${G.questsDone || 0} pedidos entregues.</p></div>` +
    `<button class="small" data-act="toggleTracker">${G.showTracker === false ? 'Mostrar as missões na tela' : 'Esconder as missões da tela'}</button>` +
    '<h3 class="phone-section">História</h3>' + (story || '<p class="small-note">A história terminou por enquanto. Bodega lendária!</p>') +
    (evCard ? '<h3 class="phone-section">Evento de hoje</h3>' + evCard : '') +
    '<h3 class="phone-section">Secundárias</h3>' + (side || '<p class="small-note">Nenhuma agora. Converse com o povo, em casa e na rua: alguns têm missões para dar.</p>') +
    '<h3 class="phone-section">Pedidos aceitos</h3>' + (quests || '<p class="small-note">Nenhum pedido aceito. Visite as casas: quem tem amizade contigo pede coisas da roça.</p>') +
    `<h3 class="phone-section">Coleções</h3><div class="mission-card"><b>Relíquias escondidas · ${secretsFound()}/${SECRETS.length}</b><p>Páginas do caderno do vô: ${pagesFound()}/3. Quando o chão brilhar de perto, aperte E.</p></div><div class="mission-card"><b>Caderno de viagem · ${travel}/${WORLD_DISCOVERIES.length}</b><p>Lugares e curiosidades do Rio Grande e de Santa Catarina. Cada descoberta nova dá recompensa.</p></div>`;
}
