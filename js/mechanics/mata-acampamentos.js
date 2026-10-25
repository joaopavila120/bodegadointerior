// Quem mora nos acampamentos da mata adentro: perto do fogo, a cada cinco trechos, aparece alguém pra prosear. Gente da
// Revolução Farroupilha (as almas, como o Garibaldi), um herói guarani das Missões e dois encantados das lendas guaranis.
// Os presentes nunca mexem em dano, vida ou resistência (isso é da ferraria do São Dunstano):
//   · Trecho 6, Jasy Jaterê: o piá loiro da varinha de ouro, dono da sesta e protetor da erva-mate. Dá mais erva e mel.
//   · Trecho 11, o Lanceiro Negro: a cavalaria mais valente dos farrapos, a promessa de liberdade e Porongos. De sentinela,
//     deixa um butiá no fogo de cada acampamento onde o Sadi descansa (um por dia).
//   · Trecho 16, Kurupi: o irmão do Jasy, que mora no mato fechado. Conta dos sete filhos de Tau e Kerana e ensina a andar
//     quieto (os bichos demoram mais pra notar o Sadi).
//   · Trecho 21, Sepé Tiaraju: os Sete Povos, o Tratado de Madri e o "Esta terra tem dono!". O lunar da testa clareia o
//     escuro da mata em volta do Sadi.
//   · Trecho 26, Bento Gonçalves: o porquê da guerra (o charque), a Ponte da Azenha, a prisão e a fuga a nado, Ponche
//     Verde. O lenço farrapo: desmaiar na mata não tira dinheiro.
//   · Trecho 31, Anita Garibaldi: Laguna, o Giuseppe e o navio de Mariath. Ela vai junto pra barra (mata-laguna.js).
// A primeira vez que o Sadi chega no fogo, a cena; depois, causos de novo a cada prosa. Cada um deixa uma figurinha.
'use strict';

const CAMP_FOLKS = {
  6: { id: 'jasy', name: 'Jasy Jaterê', origin: 'Encantado das lendas guaranis', perk: 'Erva e mel: cada pé de erva-mate dá um ramo a mais, e as colmeias às vezes dão um pote a mais.' },
  11: { id: 'lanceiro', name: 'Lanceiro Negro', origin: 'Alma da cavalaria farroupilha', ghost: true, card: 'lanceiros', portrait: 5, perk: 'Sentinela: em cada acampamento onde tu descansar, ele deixa um butiá no fogo (um por dia).' },
  16: { id: 'kurupi', name: 'Kurupi', origin: 'Encantado do mato fechado', perk: 'Passo de bicho: os bichos da mata demoram mais pra notar o Sadi.' },
  21: { id: 'sepe', name: 'Sepé Tiaraju', origin: 'Alma do guerreiro dos Sete Povos', ghost: true, card: 'sepe', portrait: 6, perk: 'O lunar de Sepé: uma luz fraca na testa clareia o escuro da mata em volta de ti.' },
  26: { id: 'bento', name: 'Bento Gonçalves', origin: 'Alma do presidente farroupilha', ghost: true, card: 'bento_goncalves', portrait: 0, perk: 'Lenço farrapo: se tu desmaiar na mata, quem te acha te leva pro fogo sem mexer no teu bolso.' },
  31: { id: 'anita', name: 'Anita Garibaldi', origin: 'Alma da heroína de Laguna', ghost: true, card: 'anita', portrait: 2, perk: 'Ela te espera na barra de Laguna, pra lutar junto.' }
};
const CAMP_FOLK_LIST = Object.values(CAMP_FOLKS);
for (const f of CAMP_FOLK_LIST) PEOPLE.push({ id: f.id, name: f.name, worldOnly: true, unique: true, origin: f.origin, sprite: (PEOPLE.find(p => p.id === 'jayme') || PEOPLE[0]).sprite });
function campFolk(n) { return CAMP_FOLKS[n] || null; }
function campFolkSpot(T) { return { x: T.camp.x - 235, y: T.camp.y + 10 }; }

// ---------- As falas ----------
const CAMP_FOLK_MEET = {
  jasy: [
    ['sadi', 'Que assobio é esse no meio da mata?'],
    ['jasy', 'Fiu-fiu! Achei um gaúcho acordado na hora da sesta!'],
    ['sadi', 'Um piá loiro, de varinha de ouro… no meio do mato?'],
    ['jasy', 'Piá nada! Sou o Jasy Jaterê. Os guaranis contam que eu ando pela mata na hora da sesta, assobiando.'],
    ['jasy', 'Quem olha pra minha varinha dourada fica bobo e me segue mato adentro. Por isso as mães mandam os filhos dormir depois do almoço, hehe.'],
    ['sadi', 'Então é melhor eu nem olhar pra essa varinha…'],
    ['jasy', 'Fica tranquilo: tu tá trabalhando, não é piá fugindo da sesta. E eu vi tu colhendo erva com cuidado, sem quebrar a erveira.'],
    ['jasy', 'Eu sou o protetor da erva-mate. Onde tem erveira nativa, tem um pouco de mim.'],
    ['jasy', 'Pra quem respeita a erveira, eu mostro os pés mais carregados. E as abelhinhas jataí são minhas amigas: vão te dar mais mel.']
  ],
  lanceiro: [
    ['lanceiro', 'Boa peleia com o cachaço, moço. Eu vi de longe, encostado na lança.'],
    ['sadi', 'Um fantasma de lança na mão… o senhor é dos farrapos também?'],
    ['lanceiro', 'Sou dos Lanceiros Negros, a cavalaria mais valente da Revolução Farroupilha.'],
    ['lanceiro', 'A maioria de nós era gente escravizada. Os farrapos prometeram a liberdade pra quem lutasse. E a gente lutou: carga de lança, no campo aberto.'],
    ['sadi', 'E a liberdade veio?'],
    ['lanceiro', 'Em novembro de 1844, em Porongos, o nosso acampamento foi atacado de surpresa pelos imperiais. Muitos companheiros morreram ali, quase sem arma na mão.'],
    ['lanceiro', 'Até hoje se discute se foi traição. O que eu sei é que a paz veio meses depois, e a promessa não foi cumprida pra todos.'],
    ['sadi', 'Bah… isso ninguém me contou na escola.'],
    ['lanceiro', 'Por isso eu fico aqui, perto do fogo: pra quem passa saber. Lembrar também é lutar.'],
    ['lanceiro', 'E daqui pra frente eu fico de sentinela nos fogos da picada. Onde tu descansar, vai ter um butiá te esperando.']
  ],
  kurupi: [
    ['kurupi', 'Hmmm… cheiro de facão. E de erva boa.'],
    ['sadi', 'Quem tá aí no mato?'],
    ['kurupi', 'Sou o Kurupi. Nas lendas guaranis, um dos sete filhos de Tau e Kerana. Irmão do Jasy Jaterê.'],
    ['sadi', 'O piá da varinha de ouro? Ele me falou dos irmãos!'],
    ['kurupi', 'Falou bem ou mal? Hehe. Eu moro no mato fechado, onde a luz não entra. Conheço cada bicho daqui pelo cheiro.'],
    ['kurupi', 'E tu anda pesado, gaúcho. Pisa no galho seco, respira alto. O teiú te ouve de longe.'],
    ['kurupi', 'Vou te ensinar a andar quieto, como bicho do mato. Assim eles demoram mais pra te notar.'],
    ['kurupi', 'E presta atenção: lá embaixo, na descida, mora um lagarto velho de papo amarelo. Parente do meu irmão Teju Jagua. Não chega perto do rabo dele.']
  ],
  sepe: [
    ['sepe', 'Mba’éichapa, caminhante! Tu venceu o guardião da descida.'],
    ['sadi', 'Um guerreiro… com uma luz na testa?'],
    ['sepe', 'Sou Sepé Tiaraju, dos Sete Povos das Missões. O povo diz que Deus me deu esse lunar na testa.'],
    ['sepe', 'Eu sou de antes dos farrapos. Em 1750, Espanha e Portugal assinaram o Tratado de Madri e trocaram as nossas terras sem perguntar pra quem vivia nelas.'],
    ['sepe', 'Mandaram os guaranis largar os Sete Povos: as igrejas, as lavouras, os ervais. A gente disse não. Foi a Guerra Guaranítica.'],
    ['sadi', 'E foi aí que o senhor disse aquela frase…'],
    ['sepe', 'Esta terra tem dono! Morri lutando em fevereiro de 1756, perto de onde hoje é São Gabriel.'],
    ['sepe', 'Três dias depois, na batalha de Caiboaté, mais de mil guaranis morreram. Mas o meu nome ficou na boca do povo.'],
    ['sepe', 'Leva um pouco do meu lunar. No escuro da mata, ele te alumia o caminho.']
  ],
  bento: [
    ['bento', 'Alto lá! Quem vem pela picada?'],
    ['sadi', 'Sadi, da bodega! E o senhor… é o Bento Gonçalves? O da estátua?'],
    ['bento', 'Bento Gonçalves da Silva, estancieiro de Triunfo, presidente da República Rio-Grandense. Às ordens.'],
    ['sadi', 'Por que começou a Revolução, afinal?'],
    ['bento', 'O Império cobrava imposto alto do nosso charque, e o charque do Prata entrava mais barato. E os presidentes da província vinham do Rio, sem ouvir a gente.'],
    ['bento', 'Em 20 de setembro de 1835 a gente entrou em Porto Alegre pela Ponte da Azenha. Foi o começo.'],
    ['bento', 'No ano seguinte, depois de vencer no Seival, o Netto proclamou a República. Eu tava preso: me pegaram na Ilha do Fanfa.'],
    ['sadi', 'Preso?!'],
    ['bento', 'Me levaram até a Bahia, pro Forte do Mar. Fugi a nado e voltei pro Sul pra ser presidente.'],
    ['bento', 'Foram dez anos de guerra. Terminou num acordo, em Ponche Verde, em 1845: o Rio Grande voltou pro Império, mas não de joelhos.'],
    ['bento', 'Toma esse lenço. Farrapo que se preza peleia de lenço no pescoço, e quem te achar caído vai saber que tu é dos nossos.']
  ],
  anita: [
    ['anita', 'Tu é o gaúcho que o Giuseppe mandou? Ele não fala de outra coisa!'],
    ['sadi', 'A Anita Garibaldi? Da figurinha?'],
    ['anita', 'Ana Maria de Jesus Ribeiro, mas pode chamar de Anita. Nasci aqui pertinho, no sul de Santa Catarina, perto de Laguna.'],
    ['anita', 'Em 1839 os farrapos tomaram Laguna, e eu vi aquele italiano de camisa vermelha descendo do barco. Larguei tudo e fui junto.'],
    ['anita', 'Lutei nos barcos, carreguei munição debaixo de tiro e aprendi a montar e a atirar no meio da guerra.'],
    ['sadi', 'E o navio que o Garibaldi falou?'],
    ['anita', 'Em 15 de novembro de 1839 a esquadra do Império, do capitão Frederico Mariath, entrou na barra de Laguna. Eles eram muito mais. A gente perdeu.'],
    ['anita', 'O fantasma do navio dele ainda volta pra barra, toda noite. E o Giuseppe nunca descansou por causa disso.'],
    ['anita', 'A barra fica logo depois desse trecho. Vai, que eu e o Giuseppe te esperamos lá. Dessa vez, a gente vai junto.']
  ]
};
const CAMP_FOLK_LORE = {
  jasy: [
    [['jasy', 'Nas lendas guaranis, Tau e Kerana tiveram sete filhos encantados. Eu sou um deles: o único que não é bicho feio, hehe.']],
    [['jasy', 'Meus irmãos? O Teju Jagua, um lagarto enorme; a Mbói Tu’i, cobra com cabeça de papagaio; o Moñái; o Kurupi; o Ao Ao; e o Luisõ, que vocês chamam de lobisomem.']],
    [['jasy', 'Os guaranis tomavam erva-mate muito antes de existir gaúcho. O chimarrão é presente nosso, viu?']],
    [['jasy', 'Sesta é coisa séria! Depois do almoço, pelo menos um cochilinho, gaúcho.']]
  ],
  lanceiro: [
    [['lanceiro', 'O nosso comandante era o Joaquim Teixeira Nunes. Lança comprida, cavalo bom e coragem: a nossa carga abria qualquer linha.']],
    [['lanceiro', 'Muitos de nós vieram das charqueadas, onde o trabalho era o mais pesado de todos.']],
    [['lanceiro', 'Hoje tem monumento, tem música, tem nome de rua. Demorou, mas a gente não foi esquecido.']],
    [['lanceiro', 'No 20 de Setembro, quando acenderem o fogo, lembra da gente também.']]
  ],
  kurupi: [
    [['kurupi', 'O Teju Jagua, meu irmão mais velho, é um lagarto enorme com sete cabeças de cachorro. Dizem que guarda as frutas e as cavernas.']],
    [['kurupi', 'A Mbói Tu’i, minha irmã, é uma cobra com cabeça de papagaio. Cuida dos banhados e da bicharada da água.']],
    [['kurupi', 'O Luisõ é o mais triste de nós. Vocês chamam ele de lobisomem. Na lua cheia, cuidado da serra pra baixo.']],
    [['kurupi', 'Mato fechado é casa de muito bicho. Corta só o cipó que precisa, gaúcho.']]
  ],
  sepe: [
    [['sepe', 'Os Sete Povos eram São Borja, São Nicolau, São Luiz Gonzaga, São Miguel, São Lourenço, São João Batista e Santo Ângelo.']],
    [['sepe', 'As ruínas de São Miguel ainda estão de pé. Vai lá ver um dia: são patrimônio da humanidade.']],
    [['sepe', 'Nas Missões, os guaranis plantavam erva-mate em ervais. Foi lá que a erveira foi cultivada pela primeira vez.']],
    [['sepe', 'O Simões Lopes Neto escreveu sobre o meu lunar. E o povo me chama de São Sepé, mesmo sem a Igreja ter dito nada.']]
  ],
  bento: [
    [['bento', 'O charque era a carne salgada e seca ao sol. Ia pro Brasil inteiro. Era o nosso ouro, e o Império taxava como quisesse.']],
    [['bento', 'Me elegeram presidente da República enquanto eu tava preso. Coisa de farrapo.']],
    [['bento', 'A bandeira verde, vermelha e amarela que tu vê no Rio Grande hoje era a bandeira da nossa República.']],
    [['bento', 'O Garibaldi? Bom marinheiro. Doido de levar barco por terra, mas deu certo.']]
  ],
  anita: [
    [['anita', 'Fui presa em Curitibanos e fugi a cavalo, sozinha, pela mata, procurando o Giuseppe. Achei ele dias depois.']],
    [['anita', 'Nosso primeiro filho, o Menotti, nasceu no meio da guerra, lá pros lados de Mostardas.']],
    [['anita', 'Depois fomos pro Uruguai e pra Itália. Lutei lá também. Por isso me chamam de heroína de dois mundos.']],
    [['anita', 'Morri cedo, em 1849, fugindo com o Giuseppe pela Itália. Mas Laguna nunca saiu do meu coração.']]
  ]
};

// ---------- O desenho ----------
// Um boneco pintado à mão, com pés no chão (0,0) e uns 140 de altura, virado pra direita. As almas ficam azuladas e
// somem numa névoa nos pés, como o Garibaldi.
const FOLK_LOOKS = {
  lanceiro: { skin: '#5a3a26', hair: '#1a1410', style: 'short', mustache: true, hat: 'brim', hatColor: '#1c1a18', shirt: '#e8e0cc', coat: '#2a3a5a', pants: '#d8d0bc', boots: '#2a1a10', lenco: '#c8302a', item: 'lance' },
  sepe: { skin: '#a06a42', hair: '#141010', style: 'long', band: '#b8302a', shirt: '#ece2c8', trim: '#a0502a', pants: '#ece2c8', barefoot: true, item: 'spear', lunar: true },
  bento: { skin: '#e0b090', hair: '#3a2a1a', style: 'short', sideburns: true, mustache: true, coat: '#1e2a48', epaulettes: true, sash: true, shirt: '#f0ece0', pants: '#efe8d8', boots: '#1a1410', item: 'sword' },
  anita: { skin: '#d8a880', hair: '#1e1410', style: 'braid', shirt: '#f2ecdc', vest: '#6a4428', skirt: '#4a3428', boots: '#2a1a10', lenco: '#c8302a' },
  jasy: { skin: '#d8a070', hair: '#f0d070', style: 'curly', hat: 'straw', shirt: '#efe6cc', pants: '#efe6cc', barefoot: true, item: 'staff', small: true },
  kurupi: { skin: '#6a6a3a', hair: '#3a5a24', style: 'leaves', shirt: null, leafSkirt: true, barefoot: true, item: 'stick', small: true, eyes: '#ffe060', scaly: true }
};
function paintFolk(L) {
  // Proporções dos bonecos do jogo: cabeça grande, corpo curto. Contorno escuro e o lado direito na sombra.
  const s = L.small ? .78 : 1, ink = '#1c130c'; ctx.save(); ctx.scale(s, s); ctx.lineJoin = 'round'; ctx.lineCap = 'round';
  const shape = (pts, fill, line = 1.6) => { ctx.beginPath(); pts.forEach(([x, y, cx, cy], i) => i ? (cx != null ? ctx.quadraticCurveTo(cx, cy, x, y) : ctx.lineTo(x, y)) : ctx.moveTo(x, y)); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); if (line) { ctx.strokeStyle = ink; ctx.lineWidth = line; ctx.stroke(); } };
  const shade = (x, y, w, h, a = .22) => { ctx.fillStyle = `rgba(10,6,2,${a})`; ctx.fillRect(x, y, w, h); };
  // Pernas e pés (ou a saia).
  if (L.skirt) {
    shape([[-13, -58], [13, -58], [21, -12, 20, -30], [-21, -12, 0, -6], [-21, -12], [-13, -58, -20, -30]], L.skirt);
    ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1.2; for (const x of [-8, 0, 8]) { ctx.beginPath(); ctx.moveTo(x * .6, -54); ctx.lineTo(x * 1.3, -14); ctx.stroke(); }
    for (const x of [-8, 8]) shape([[x - 5, -14], [x + 5, -14], [x + 7, -2], [x - 6, -2]], L.boots);
  } else for (const side of [-1, 1]) {
    const hx = side * 8;
    shape([[hx - 6, -56], [hx + 6, -56], [hx + 5, -12], [hx - 5, -12]], L.pants || L.skin);
    if (L.scaly) for (let k = 0; k < 4; k++) ellipse(hx, -48 + k * 10, 2, 1.5, '#4a4a26');
    if (L.barefoot) shape([[hx - 5, -13], [hx + 5, -13], [hx + 9, -2], [hx - 5, -2]], L.skin, 1.2);
    else shape([[hx - 6, -22], [hx + 6, -22], [hx + 6, -6], [hx + 11, -6], [hx + 11, 0], [hx - 6, 0]], L.boots);
  }
  if (L.leafSkirt) for (let k = 0; k < 8; k++) shape([[-17 + k * 4.6, -62], [-14 + k * 4.6, -38], [-11 + k * 4.6, -62]], k % 2 ? '#4a7a2a' : '#3a6a24', 1);
  // Braços atrás do tronco.
  const sleeve = L.coat || L.shirt || L.skin, arm = side => { const x = side * 19; shape([[x - 5, -96], [x + 5, -96], [x + 6 * side + 1, -62], [x + side * 2 - 5, -62]], sleeve); ellipse(x + side * 3, -59, 5, 5, L.skin); ctx.strokeStyle = ink; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.ellipse(x + side * 3, -59, 5, 5, 0, 0, Math.PI * 2); ctx.stroke(); };
  arm(-1); arm(1);
  // Tronco: camisa, colete ou casaca, faixa e cinto.
  const torso = L.shirt || L.skin;
  shape([[-19, -100], [19, -100], [16, -54, 20, -76], [-16, -54], [-19, -100, -20, -76]], torso);
  if (L.scaly) for (let k = 0; k < 9; k++) ellipse(-10 + (k % 3) * 10, -92 + Math.floor(k / 3) * 13, 2.2, 1.6, '#4a4a26');
  if (L.vest) { shape([[-19, -99], [-5, -99], [-6, -55], [-16, -55], [-19, -99, -20, -76]], L.vest); shape([[19, -99], [5, -99], [6, -55], [16, -55], [19, -99, 20, -76]], L.vest); }
  if (L.coat) { shape([[-20, -101], [-3, -101], [-5, -48], [-19, -48], [-20, -101, -22, -74]], L.coat); shape([[20, -101], [3, -101], [5, -48], [19, -48], [20, -101, 22, -74]], L.coat); for (let k = 0; k < 4; k++) ellipse(-5, -94 + k * 10, 1.6, 1.6, '#e8c050'); }
  if (L.collar) shape([[-15, -101], [15, -101], [9, -88], [0, -94], [-9, -88]], L.collar, 1);
  if (L.trim) { rect(-16, -60, 32, 5, L.trim, 2); for (let k = 0; k < 5; k++) rect(-14 + k * 6.5, -59, 3, 3, '#e8d090', 1); }
  if (L.sash) { ctx.save(); ctx.beginPath(); ctx.moveTo(-19, -100); ctx.lineTo(19, -100); ctx.lineTo(16, -54); ctx.lineTo(-16, -54); ctx.closePath(); ctx.clip(); ctx.translate(0, -78); ctx.rotate(-.6); rect(-30, -6, 60, 4, '#2a8a3a'); rect(-30, -2, 60, 4, '#d42a2a'); rect(-30, 2, 60, 4, '#f0d020'); ctx.restore(); }
  shade(4, -100, 15, 46, .16);
  if (L.epaulettes) for (const x of [-18, 18]) { ellipse(x, -99, 8, 4.5, '#e8c050'); for (let k = 0; k < 4; k++) rect(x - 6 + k * 4, -97, 2, 6, '#c8a030'); }
  rect(-17, -58, 34, 5, '#3a2414', 2);
  if (L.lenco) shape([[-11, -101], [11, -101], [0, -85]], L.lenco, 1.2);
  // Cabeça grande, de frente, com o cabelo e o rosto.
  rect(-5, -106, 10, 8, L.skin, 2);
  if (L.style === 'long') shape([[-18, -128], [18, -128], [17, -92], [-17, -92]], L.hair, 1.2);
  ellipse(0, -121, 17, 19, L.skin); ctx.strokeStyle = ink; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.ellipse(0, -121, 17, 19, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = 'rgba(10,6,2,.14)'; ctx.beginPath(); ctx.ellipse(6, -119, 10, 16, 0, -Math.PI / 2, Math.PI / 2); ctx.fill();
  if (L.style === 'long' || L.style === 'braid' || L.style === 'short') { ctx.fillStyle = L.hair; ctx.beginPath(); ctx.ellipse(0, -128, 18, 13, 0, Math.PI * 1.02, Math.PI * 1.98); ctx.lineTo(16, -122); ctx.quadraticCurveTo(4, -132, -16, -122); ctx.closePath(); ctx.fill(); }
  if (L.style === 'braid') { for (let k = 0; k < 6; k++) ellipse(-15 + Math.sin(k * 1.4), -108 + k * 8, 4.2, 5, L.hair); ellipse(-15, -60, 3, 3, '#c8302a'); }
  if (L.style === 'curly') for (let k = 0; k < 9; k++) ellipse(-14 + k * 3.5, -136 + Math.sin(k * 2) * 2.5, 5.5, 5.5, L.hair);
  if (L.style === 'leaves') for (let k = 0; k < 11; k++) { const a = Math.PI + k / 10 * Math.PI; ctx.fillStyle = k % 2 ? L.hair : '#5a7a2a'; ctx.beginPath(); ctx.ellipse(Math.cos(a) * 17, -123 + Math.sin(a) * 19, 8, 4, a, 0, Math.PI * 2); ctx.fill(); }
  if (L.band) rect(-17, -133, 34, 5, L.band, 2);
  if (L.sideburns) for (const x of [-16, 12]) rect(x, -128, 4, 15, L.hair, 2);
  const eye = L.eyes || '#1a120c';
  for (const x of [-6, 6]) { if (!L.eyes) ellipse(x, -120, 3, 2.6, '#f4ece0'); ellipse(x + .6, -120, L.eyes ? 3 : 1.7, L.eyes ? 3 : 2, eye); ctx.strokeStyle = L.hair; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(x - 3.5, -125); ctx.lineTo(x + 3.5, -125.5); ctx.stroke(); }
  ctx.strokeStyle = 'rgba(60,30,20,.5)'; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(0, -118); ctx.lineTo(1.5, -113); ctx.stroke();
  if (L.mustache) shape([[-8, -110], [0, -112], [8, -110], [5, -107], [0, -109], [-5, -107]], L.hair, 0);
  else { ctx.strokeStyle = 'rgba(90,40,30,.6)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.moveTo(-3, -108); ctx.quadraticCurveTo(0, -106, 3, -108); ctx.stroke(); }
  if (L.lunar) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; ellipse(0, -131, 3.5, 3.5, '#fff6c0'); ctx.restore(); }
  // Chapéus.
  if (L.hat === 'brim') { shape([[-28, -134], [28, -134], [24, -129, 0, -126], [-24, -129], [-28, -134, -2, -140]], L.hatColor); shape([[-13, -135], [-11, -152], [11, -152], [13, -135]], L.hatColor); rect(-12, -140, 24, 3, '#6a4a2a'); }
  if (L.hat === 'straw') { shape([[-26, -134], [26, -134], [22, -129, 0, -126], [-22, -129], [-26, -134, 0, -140]], '#d8c070'); shape([[-12, -135], [-10, -150], [10, -150], [12, -135]], '#e0c878'); rect(-11, -139, 22, 3, '#a8402a'); }
  if (L.hat === 'bicorne') { shape([[-30, -134], [30, -134], [0, -158, 26, -156], [-30, -134, -26, -156]], '#14141c'); ctx.strokeStyle = '#e8c050'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-28, -135); ctx.quadraticCurveTo(0, -140, 28, -135); ctx.stroke(); ellipse(6, -146, 4, 4, '#2a8a3a'); ellipse(6, -146, 2, 2, '#f0d020'); }
  if (L.hat === 'cap') { shape([[-16, -134], [16, -134], [14, -142, 0, -148], [-14, -142]], '#f0f0ea', 1.2); rect(-16, -136, 32, 4, '#2a3a6a', 2); }
  // O que leva na mão (a direita).
  if (L.item === 'lance') { rect(22, -186, 4, 184, '#6a4a2a', 2); shape([[24, -210], [29, -186], [19, -186]], '#c8ccd0', 1); shape([[26, -182], [46 + Math.sin(frameClock * 4) * 3, -176], [26, -168]], '#c8302a', 1); }
  if (L.item === 'spear') { rect(22, -172, 4, 170, '#7a5a34', 2); shape([[24, -192], [29, -172], [19, -172]], '#d8d0b8', 1); for (let k = 0; k < 3; k++) ellipse(28, -166 + k * 6, 3, 2, k % 2 ? '#2a7a3a' : '#c8302a'); }
  if (L.item === 'sword') { ctx.strokeStyle = '#c8ccd0'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-17, -56); ctx.quadraticCurveTo(-24, -32, -18, -12); ctx.stroke(); rect(-20, -60, 7, 5, '#e8c050', 2); }
  if (L.item === 'staff') { rect(23, -118, 4, 116, '#e8c050', 2); ellipse(25, -121, 6, 6, '#fff0a0'); }
  if (L.item === 'stick') { ctx.strokeStyle = '#5a3a20'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(25, -2); ctx.lineTo(23, -56); ctx.lineTo(29, -84); ctx.lineTo(23, -104); ctx.stroke(); }
  ctx.restore();
}
const folkCanvas = new Map();
function folkArt(id) {
  if (folkCanvas.has(id)) return folkCanvas.get(id);
  const L = FOLK_LOOKS[id], ghost = CAMP_FOLK_LIST.find(f => f.id === id)?.ghost, c = document.createElement('canvas'); c.width = 240; c.height = 460; const main = ctx; ctx = c.getContext('2d');
  try {
    ctx.translate(120, 440); ctx.scale(2, 2); paintFolk(L);
    if (ghost) {
      // Vira alma: azulado por cima e a parte de baixo some na névoa.
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(150,200,255,.3)'; ctx.fillRect(0, 0, 240, 460);
      ctx.globalCompositeOperation = 'destination-out'; const g = ctx.createLinearGradient(0, 330, 0, 440); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)'); ctx.fillStyle = g; ctx.fillRect(0, 330, 240, 130);
    }
  } finally { ctx = main; }
  folkCanvas.set(id, c); return c;
}
function drawCampFolk(id, x, y, alpha = 1, dx = 1) {
  const f = CAMP_FOLK_LIST.find(q => q.id === id), c = folkArt(id), bob = f?.ghost ? Math.sin(frameClock * 1.6 + x) * 4 : 0;
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  if (f?.ghost) glow(x, y - 80 + bob, 120, .2 * alpha, '140,190,255');
  if (id === 'jasy') glow(x + 15 * dx, y - 80, 70, (.25 + .08 * Math.sin(frameClock * 6)) * alpha, '255,220,120');
  if (id === 'kurupi') for (const ex of [-6, 6]) glow(x + ex * .78 * dx, y - 120 * .78, 7, .7 * alpha, '255,220,90');
  ctx.restore();
  ellipse(x, y + 3, 26, 7, `rgba(10,14,8,${.3 * alpha})`);
  ctx.save(); ctx.globalAlpha = (f?.ghost ? .86 : 1) * alpha; ctx.translate(x, y - (f?.ghost ? 10 : 0) + bob); if (dx < 0) ctx.scale(-1, 1); ctx.drawImage(c, -60, -220, 120, 230); ctx.restore();
  if (f?.ghost) { ctx.save(); for (let k = 0; k < 3; k++) { const t = (frameClock * .4 + k / 3) % 1, px = x + Math.sin(t * 6 + k) * 12, py = y - t * 40, r = 26 - t * 10, g = ctx.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, `rgba(200,220,240,${.28 * alpha * (1 - t)})`); g.addColorStop(1, 'rgba(200,220,240,0)'); ctx.fillStyle = g; ctx.fillRect(px - r, py - r, r * 2, r * 2); } ctx.restore(); }
  if (id === 'jasy') for (let k = 0; k < 4; k++) { const a = frameClock * 3 + k * 1.6; ellipse(x + 15 * dx + Math.cos(a) * 14, y - 80 + Math.sin(a) * 10, 1.6, 1.6, '#fff6b0'); }
}
// Retrato: os da história usam a figurinha do álbum; os encantados, o próprio desenho.
const folkPortraits = new Map();
function folkPortrait(id, size = 104) {
  const f = CAMP_FOLK_LIST.find(q => q.id === id);
  if (f?.portrait != null) { const col = f.portrait % 4, row = Math.floor(f.portrait / 4), k = size / 180, x0 = col * 256 + 38, y0 = row * 384 + (id === 'lanceiro' ? 40 : 18); return `<span class="portrait folk-portrait" style="width:${size}px;height:${size}px;background-image:url('assets/images/expansion/cards-history-v1.png');background-size:${1024 * k}px ${1536 * k}px;background-position:${-x0 * k}px ${-y0 * k}px"></span>`; }
  if (!folkPortraits.has(id)) { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.fillStyle = id === 'jasy' ? '#e8e0b8' : '#5a6a48'; g.fillRect(0, 0, 96, 96); g.drawImage(folkArt(id), 60, FOLK_LOOKS[id].small ? 196 : 126, 120, 120, 0, 0, 96, 96); try { folkPortraits.set(id, c.toDataURL()); } catch (_) { return '<span class="portrait portrait-phone" style="width:' + size + 'px;height:' + size + 'px">' + (id === 'jasy' ? '✨' : '🌿') + '</span>'; } }
  return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px;display:grid;place-items:center;overflow:hidden"><img src="${folkPortraits.get(id)}" width="${size}" height="${size}" alt=""></span>`;
}

// ---------- A prosa ----------
function campFolkMeet(T, f) {
  const st = mataState(); if (st.folks[f.id]) return; st.folks[f.id] = G.day; mataXP(20); save();
  const done = () => {
    if (f.card) giveCard(f.card, 'mata');
    const rw = { xp: 40, cash: 30 };
    grantReward(rw);
    talk([['card', `<b>🔥 ${f.name}</b><br>${f.perk}`, TRECHO_BIOME_NAMES[T.biome]], ['reward', rw, 'Prosa no acampamento']], null, 'Valeu');
  };
  const lines = CAMP_FOLK_MEET[f.id];
  if (!scenesEnabled()) { talk(lines.map(l => [...l]), done, 'Continuar'); return; }
  const at = campFolkSpot(T), me = { x: T.camp.x - 150, y: T.camp.y + 96 };
  playSteps([...sceneWorld({ map: 'trecho', x: T.camp.x - 150, y: T.camp.y - 20, night: .25, fires: [], lights: [{ x: T.camp.x - 60, y: T.camp.y, r: 320, a: .3, color: '255,150,60' }] }),
    { actor: 'sadi', x: worldOut.x, y: worldOut.y, dx: -1 }, { fade: 'in', time: .6 },
    { walk: 'sadi', to: me },
    { actor: f.id, x: at.x, y: at.y, dx: 1, alpha: 0, draw: (a, y) => drawCampFolk(f.id, a.x, y, a.alpha ?? 1, a.dx) },
    { do: () => { if (f.id === 'jasy') { for (let k = 0; k < 3; k++) AudioEngine.note?.(2200 + k * 300, .12, 'sine', .03, k * .15); } else AudioEngine.caveGhost?.(); const a = scene.actors[f.id], up = () => { if (!scene || scene.actors[f.id] !== a) return; a.alpha = Math.min(1, a.alpha + .05); if (a.alpha < 1) setTimeout(up, 40); }; up(); } }, { wait: 1.2 },
    ...lines.map(([who, text]) => ({ say: who, text })),
    { fade: 'out', time: .5 }], 'mata-' + f.id, () => { Object.assign(worldOut, { x: me.x, y: me.y, dx: -1, dy: 0, walk: false }); done(); });
}
function campFolkTalk(f) {
  const st = mataState(), lore = CAMP_FOLK_LORE[f.id]; st.lore2 ??= {}; const k = (st.lore2[f.id] || 0) % lore.length; st.lore2[f.id] = (st.lore2[f.id] || 0) + 1; save();
  talk(lore[k].map(l => [...l]), null, 'Valeu, ' + f.name.split(' ')[0]);
}

// ---------- Ligações ----------
{
  // Chegou no fogo do acampamento: a primeira vez, quem mora ali aparece.
  const tick = outsideTick; outsideTick = function (dt) {
    tick(dt); if (!inTrecho() || scene || modal || worldTalkOpen()) return;
    const T = trechoLayout(), f = T.camp && campFolk(T.n); if (!f || mataFolk(f.id) || !trechoCampSafe(T)) return;
    const at = campFolkSpot(T); if (Math.hypot(worldOut.x - at.x, worldOut.y - at.y) < 330) campFolkMeet(T, f);
  };
  const spots = trechoSpots; trechoSpots = function () {
    const list = spots(), T = trechoLayout(), f = T.camp && campFolk(T.n);
    if (f && mataFolk(f.id) && (!T.boss || trechoBossDone(T.boss))) { const at = campFolkSpot(T); list.push({ id: 'folk:' + f.id, x: at.x, y: at.y, radius: 110, label: 'Prosear com ' + (f.id === 'lanceiro' ? 'o Lanceiro Negro' : f.name), act: () => campFolkTalk(f) }); }
    return list;
  };
  const draw = drawTrecho; drawTrecho = function (view, seen, layers) {
    draw(view, seen, layers); const T = trechoLayout(), f = T.camp && campFolk(T.n);
    if (f && mataFolk(f.id) && !scene) { const at = campFolkSpot(T); if (seen(at.x, at.y, 300)) layers.push({ y: at.y, draw: () => drawCampFolk(f.id, at.x, at.y, 1, worldOut.x < at.x ? -1 : 1) }); }
  };
  // O Lanceiro de sentinela: descansando num acampamento, um butiá no fogo (um por dia).
  const rest = trechoRest; trechoRest = function (T) {
    rest(T); const st = mataState();
    if (mataFolk('lanceiro') && st.sentinela !== G.day) { st.sentinela = G.day; bagAdd('butia', 1); effect('+1 butiá do lanceiro', worldOut.x, worldOut.y - 160, '#ffd27a', 16); save(); }
  };
  // Falas com retrato próprio.
  const speaker = sceneSpeaker; sceneSpeaker = function (who) { const f = CAMP_FOLK_LIST.find(q => q.id === who); return f ? { portrait: folkPortrait(f.id), name: f.name } : speaker(who); };
  const box = showRpgBox; showRpgBox = function (prefix, line) {
    if (line && !line.portrait && line.person != null) { const id = PEOPLE[line.person]?.id, f = CAMP_FOLK_LIST.find(q => q.id === id); if (f) line = { ...line, portrait: folkPortrait(f.id) }; }
    return box(prefix, line);
  };
}
