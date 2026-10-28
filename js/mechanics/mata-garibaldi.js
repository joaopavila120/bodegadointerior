// O refúgio do Garibaldi: na clareira perto da entrada da Mata de Araucárias, o fantasma de Giuseppe Garibaldi acampa
// num rancho de pedra e madeira, com fogo de chão e o barbaquá. Ele lutou com os farrapos e hoje guarda o pinheiral.
//   · Primeira vez na mata: a cena de chegada, com ele explicando a descida até o mar (e a conta que ficou em Laguna).
//   · Loja (melhorias da mata e o bornal), compra o que o Sadi traz e conta causo da Farroupilha.
//   · Barbaquá: seca os ramos de erva-mate nativa, que viram erva pro saco da bodega.
//   · Fogo de chão: descanso. Mesa de mapas (dentro do refúgio): vai direto pros acampamentos já acesos.
// Produto novo no balcão da bodega: mel de jataí.
'use strict';

const RANCHO = { x: 500, y: 1230, w: 280, h: 160 }, RANCHO_GHOST = { x: 440, y: 1490 }, RANCHO_FOGO = { x: 360, y: 1540 }, RANCHO_BARBAQUA = { x: 900, y: 1470 }, RANCHO_MARCO = { x: 760, y: 1570 };
function garibaldiFront() { return { x: 640, y: 1460 }; }
PEOPLE.push({ id: 'garibaldi', name: 'Giuseppe Garibaldi', worldOnly: true, unique: true, origin: 'Fantasma do pinheiral', sprite: (PEOPLE.find(p => p.id === 'jayme') || PEOPLE[0]).sprite });
const GARIBALDI_PERSON = PEOPLE.findIndex(p => p.id === 'garibaldi');

// ---------- Produtos novos na bodega ----------
GOODS.mel = { name: 'Mel de jataí', cost: 3, price: 18, initial: 0, cat: 'Balcão', unlock: 'mel', farmOnly: true, sealed: true };
FIXED.push({ id: 'shop:mel', x: 1518, y: 355, w: 52, h: 57, label: 'Mel de jataí', unlock: 'mel' });
if (typeof FARM_SOURCES !== 'undefined') Object.assign(FARM_SOURCES, { mel: 'colmeias de jataí da mata' });
// Arte do mel, como os outros produtos do balcão.
for (const key of ['mel']) if (!ITEM_ART[key]) { const im = new Image(); im.src = 'assets/images/items/' + key + '.png'; ITEM_ART[key] = im; ITEM_SPRITE_KEYS.push(key); }

// ---------- O fantasma ----------
// Pintado uma vez num canvas: boina, cabelo e barba, camisa vermelha, poncho no ombro e o corpo que vira névoa.
let garibaldiArt = null;
function garibaldiCanvas() {
  if (garibaldiArt) return garibaldiArt;
  const c = document.createElement('canvas'); c.width = 140; c.height = 190; const main = ctx; ctx = c.getContext('2d');
  try {
    ctx.translate(70, 178);
    ctx.fillStyle = '#5a6a7a'; ctx.beginPath(); ctx.moveTo(-26, -40); ctx.quadraticCurveTo(-30, -6, -12, 8); ctx.lineTo(14, 8); ctx.quadraticCurveTo(30, -6, 26, -40); ctx.closePath(); ctx.fill();
    rect(-26, -104, 52, 66, '#c8382a', 10); for (let k = 0; k < 4; k++) rect(-2, -98 + k * 15, 4, 4, '#f0e6d0', 2);
    for (const s of [-1, 1]) { ctx.fillStyle = '#b8302a'; ctx.beginPath(); ctx.moveTo(s * 22, -100); ctx.lineTo(s * 40, -62); ctx.lineTo(s * 30, -56); ctx.lineTo(s * 14, -86); ctx.closePath(); ctx.fill(); ellipse(s * 36, -56, 7, 6, '#e0b890'); }
    ctx.fillStyle = '#7a4a2a'; ctx.beginPath(); ctx.moveTo(-30, -104); ctx.lineTo(8, -104); ctx.lineTo(34, -46); ctx.lineTo(-20, -40); ctx.lineTo(-34, -70); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#5a3418'; ctx.lineWidth = 2; for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.moveTo(-26 + k * 10, -100); ctx.lineTo(-12 + k * 12, -44); ctx.stroke(); }
    rect(-6, -114, 12, 10, '#d8a880', 3); ellipse(0, -126, 15, 17, '#e0b890');
    ctx.fillStyle = '#9a7040'; ctx.beginPath(); ctx.ellipse(0, -112, 16, 16, 0, 0, Math.PI); ctx.fill(); ellipse(0, -100, 12, 9, '#9a7040'); rect(-9, -119, 18, 4, '#8a6034', 2);
    for (const s of [-1, 1]) { ellipse(s * 14, -130, 6, 9, '#8a6034'); ellipse(s * 6, -128, 2.2, 2.2, '#2a1a10'); }
    ellipse(0, -142, 17, 7, '#2a2a34'); ellipse(0, -140, 18, 4, '#3a3a44'); ellipse(0, -122, 3, 2, '#c89070');
    // Vira fantasma: azulado por cima e a parte de baixo some na névoa.
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalCompositeOperation = 'source-atop'; ctx.fillStyle = 'rgba(150,200,255,.28)'; ctx.fillRect(0, 0, 140, 190);
    ctx.globalCompositeOperation = 'destination-out'; const g = ctx.createLinearGradient(0, 110, 0, 190); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,1)'); ctx.fillStyle = g; ctx.fillRect(0, 110, 140, 80);
  } finally { ctx = main; }
  return (garibaldiArt = c);
}
function drawGaribaldi(x, y, alpha = 1, dx = 1) {
  const bob = Math.sin(frameClock * 1.6) * 5, c = garibaldiCanvas();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 80 + bob, 120, .22 * alpha, '140,190,255'); ctx.restore();
  ellipse(x, y + 4, 30, 8, `rgba(10,20,30,${.25 * alpha})`);
  ctx.save(); ctx.globalAlpha = .84 * alpha; ctx.translate(x, y - 14 + bob); if (dx < 0) ctx.scale(-1, 1); ctx.drawImage(c, -70, -178, 140, 190); ctx.restore();
  ctx.save(); ctx.globalAlpha = .35 * alpha; for (let k = 0; k < 3; k++) { const t = (frameClock * .4 + k / 3) % 1; ellipse(x + Math.sin(t * 6 + k) * 14, y + 6 - t * 40 + bob, 22 - t * 10, 7, '#c8dcf0'); } ctx.restore();
}
// Retrato: o Garibaldi do álbum (camisa vermelha, barba, boina), com o brilho azul de fantasma.
function garibaldiPortrait(size = 104) {
  const k = size / 176, x0 = 296, y0 = 14;
  return `<span class="portrait garibaldi-portrait" style="width:${size}px;height:${size}px;background-image:url('assets/images/expansion/cards-history-v1.png');background-size:${1024 * k}px ${1536 * k}px;background-position:${-x0 * k}px ${-y0 * k}px"></span>`;
}

// ---------- O rancho ----------
function drawRancho() {
  const r = RANCHO, x = r.x, y = r.y, w = r.w, h = r.h;
  ellipse(x + w / 2, y + h + 6, w * .62, 18, 'rgba(10,14,8,.35)');
  rect(x, y + 40, w, h - 40, '#c09a68', 4, '#6a4a28'); rect(x, y + h - 22, w, 22, '#a07a50', 2);
  for (let k = 0; k < 7; k++) rect(x + 8 + (k * 41) % (w - 20), y + 54 + (k * 23) % 70, 18, 6, 'rgba(110,80,50,.35)', 3);
  for (const px of [x - 4, x + w - 8, x + w / 2 - 70, x + w / 2 + 62]) rect(px, y + 34, 12, h - 30, '#5a3a20', 3);
  ctx.fillStyle = '#3a2414'; rect(x + w / 2 - 26, y + h - 78, 52, 78, '#3a2414', 3, '#5a3a20'); rect(x + 30, y + 64, 40, 30, '#2a1a10', 3, '#5a3a20');
  // Telhado de santa-fé (palha) passando das paredes.
  ctx.fillStyle = '#b8a060'; ctx.beginPath(); ctx.moveTo(x - 34, y + 50); ctx.lineTo(x + 30, y - 50); ctx.lineTo(x + w - 30, y - 50); ctx.lineTo(x + w + 34, y + 50); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#8a7438'; ctx.lineWidth = 2; for (let k = 0; k < 26; k++) { const t = k / 25, bx = x - 34 + t * (w + 68), tx = x + 30 + t * (w - 60); ctx.beginPath(); ctx.moveTo(bx, y + 50); ctx.lineTo(tx, y - 50); ctx.stroke(); }
  rect(x + 24, y - 56, w - 48, 10, '#7a6430', 4); ctx.strokeStyle = '#6a5428'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(x - 34, y + 50); ctx.lineTo(x + w + 34, y + 50); ctx.stroke();
  rect(x + w / 2 - 92, y + 6, 184, 26, '#e8d6a8', 4, '#5a3a20'); txt('RANCHO DO GARIBALDI', x + w / 2, y + 19, 12, '#6a1a14', 'center', 'Georgia', false);
}
// Barbaquá: o jirau de varas sobre o buraco do fogo, com os ramos de erva secando na fumaça.
function drawBarbaqua() {
  const { x, y } = RANCHO_BARBAQUA;
  ellipse(x, y + 6, 96, 16, 'rgba(10,14,8,.35)'); ellipse(x - 66, y - 2, 26, 12, '#3a2414');
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x - 66, y - 10, 60, .3 + .08 * Math.sin(frameClock * 8), '255,140,60'); ctx.restore(); ellipse(x - 66, y - 8, 10, 7, '#ff9a30');
  for (const [px, py] of [[-70, 0], [70, 0], [-60, -18], [60, -18]]) rect(x + px - 4, y + py - 84, 8, 88, '#5a3a20', 2);
  rect(x - 80, y - 92, 160, 10, '#6a4a28', 3); for (let k = 0; k < 9; k++) rect(x - 76 + k * 19, y - 96, 4, 18, '#7a5a34', 1);
  for (let k = 0; k < 12; k++) ellipse(x - 70 + (k * 13) % 140, y - 100 - (k % 3) * 4, 12, 6, k % 2 ? '#4a7a34' : '#5a8a3a');
  for (let k = 0; k < 3; k++) { const t = (frameClock * .35 + k / 3) % 1; ctx.globalAlpha = .45 * (1 - t); ellipse(x - 20 + k * 20 + Math.sin(t * 5 + k) * 10, y - 110 - t * 80, 14 + t * 18, 9 + t * 10, '#d8d4cc'); ctx.globalAlpha = 1; }
}
function drawRanchoFogo() { const { x, y } = RANCHO_FOGO; if (!worldSprite('rural', 6, x - 70, y - 110, 140, 110)) sceneFire(x, y); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 30, 170, .32 + .06 * Math.sin(frameClock * 9), '255,150,60'); ctx.restore(); }
function drawMarco() { drawMarcoAt(RANCHO_MARCO.x, RANCHO_MARCO.y); }
// O poste com uma fita colorida pra cada acampamento aceso (o do refúgio e o da praia de Laguna).
function drawMarcoAt(x, y) {
  ellipse(x, y + 2, 16, 5, 'rgba(10,14,8,.35)'); rect(x - 5, y - 110, 10, 112, '#5a3a20', 2);
  const st = G?.mata ? mataState() : null; TRECHO.camps.forEach((n, k) => { const on = st?.camps[n]; ctx.fillStyle = on ? ['#d83a2a', '#2a8ad8', '#e8c030', '#3aa04a', '#e0cbb0', '#9a5ad8'][k] : 'rgba(200,190,160,.5)'; ctx.beginPath(); ctx.moveTo(x + 5, y - 106 + k * 14); ctx.lineTo(x + 34 + Math.sin(frameClock * 3 + k) * 3, y - 101 + k * 14); ctx.lineTo(x + 5, y - 96 + k * 14); ctx.closePath(); ctx.fill(); });
}

// ---------- Conversa, loja e trabalhos do rancho ----------
const GARIBALDI_LORE = [
  [['garibaldi', 'Em 1839, a gente pôs dois lanchões em cima de carretas de oito rodas e puxou com uns duzentos bois, por terra, até a foz do Tramandaí. Pra tomar Laguna.'], ['sadi', 'Barco andando de carreta?!'], ['garibaldi', 'Onde não tem rio, o farrapo inventa um.']],
  [['garibaldi', 'Os lanchões se chamavam Seival e Rio Pardo. Foram feitos num estaleiro escondido, lá pros lados de Camaquã, na Lagoa dos Patos.'], ['garibaldi', 'A saída da lagoa pro mar era guardada pelo Império. Por isso o caminho foi por terra.']],
  [['garibaldi', 'No mar, uma tempestade virou o Rio Pardo perto de Araranguá. Perdi muitos companheiros naquela noite.'], ['garibaldi', 'O Seival chegou. E em julho de 1839 a gente tomou Laguna, onde nasceu a República Juliana.']],
  [['garibaldi', 'Foi em Laguna que conheci a Anita. Montava melhor que muito gaúcho e lutou do meu lado até o fim.'], ['garibaldi', 'Se tu chegar no litoral, procura ela nos acampamentos. Ela conhece aquela barra como ninguém.']],
  [['garibaldi', 'Antes do Sul, eu já era marinheiro. Aqui achei uma causa pra lutar e amigos pra vida inteira.'], ['garibaldi', 'Me chamam de herói de dois mundos. Um deles é esse aqui, de pinheiro, campo e mar.']],
  [['garibaldi', 'Aprendi a tomar chimarrão com os farrapos. E o poncho? Me esquentou em muita noite de acampamento como essa.']],
  [['garibaldi', 'A camisa vermelha virou a marca dos meus voluntários, mais tarde. Mas o coração de farrapo eu ganhei aqui no Sul.']],
  [['garibaldi', 'A guerra durou dez anos, de 1835 a 1845, e terminou num acordo: a Paz de Ponche Verde. Ninguém ganhou tudo.'], ['garibaldi', 'Mas o 20 de Setembro ficou: até hoje o gaúcho acende o fogo de chão e lembra.']],
  [['garibaldi', 'Lá na Serra tem até uma cidade com o meu nome. Dizem que o vinho de lá é bom… nunca provei: fantasma não bebe.'], ['sadi', 'Nem um trago?'], ['garibaldi', 'Querer eu quero. Poder é que não posso, hehe.']],
  [['garibaldi', 'O pinheiral é mais velho que qualquer república. Cuida dele, que ele cuida de ti.']]
];
const GARIBALDI_SHOP_LINES = ['Chega mais pro fogo, gaúcho. O que vai levar pra mata?', 'Ferramenta boa abre picada. Coragem sozinha só abre ferida.', 'Mata adentro, quem não se prepara vira causo.', 'Velho farrapo não dorme em casa: dorme no rancho, perto do fogo.'];
function garibaldiTalk() {
  if (!G.mata?.metGaribaldi) { garibaldiMeet(); return; }
  const st = mataState(), k = (st.lore || 0) % GARIBALDI_LORE.length; st.lore = (st.lore || 0) + 1; caveState().hp = caveMaxHp(); mataBuffs.veneno = 0; save();
  talk([...GARIBALDI_LORE[k].map(l => [...l]), ['garibaldi', 'Senta, toma um mate. A vida volta inteira perto do fogo.']], null, 'Valeu, Garibaldi'); garibaldiTradeButton();
}
// Como o São Dunstano: na prosa com o Garibaldi aparece o botão da loja dele.
function garibaldiTradeButton() { $('garibaldiTradeButton')?.remove(); $('talkUI')?.insertAdjacentHTML('beforeend', '<button id="garibaldiTradeButton" class="small" data-act="garibaldiOpenShop">Armas, equipamento e bornal</button>'); }
// Primeira vez na mata: o Garibaldi aparece na neblina da entrada, explica a descida até o mar e leva o Sadi pro refúgio.
function garibaldiIntro() {
  // O Garibaldi dá o bodoque já no encontro (e ensina a usar na cena e na dica).
  const st = mataState(), hadSling = !!G.up.bodoque; G.mataSeen = G.day; st.metGaribaldi = G.day; G.up.bodoque = true; save();
  const f = garibaldiFront(), done = () => {
    Object.assign(worldOut, { map: 'mata', x: f.x, y: f.y, dx: 0, dy: 1, walk: false }); giveCard('garibaldi', 'mata');
    talk([['dica', '<b>🌲 Mata adentro</b><br>· O pinheiral do Garibaldi (trecho 1) é sempre manso. A picada do leste leva <b>mata adentro</b>: lá a mata é tão fechada que é sempre escuro, como noite, e é sempre braba. O Sadi entra de facão na mão (Espaço/F).<br>· Três regiões, uma atrás da outra: o <b>Pinheiral</b>, a <b>Encosta da Serra</b> e a <b>Restinga</b>, cada uma com muitos trechos de picada. No fim das duas primeiras, um bicho grande guarda a passagem. Depois da restinga, a <b>Barra de Laguna</b>.<br>· Não tem placa: cada trecho é gerado no dia, e amanhã a picada é outra.<br>· Não tem ferramenta pra comprar: a picada é aberta, e só os bichos grandes seguram a descida. Nos ramais, às vezes, um baú de mateiro.<br>· Arma, vida e resistência são as da ferraria do São Dunstano, e o Garibaldi vende as mesmas no refúgio.<br>· De tempos em tempos tem um acampamento: o fogo espanta os bichos, e sempre tem alguém pra prosear.<br>· Pinhão, erva-mate nativa e mel de jataí viram produto da bodega. O <b>nível de mateiro</b> sobe com tudo isso.<br>· No bornal da mata, as teclas <b>1 a 5</b> usam os itens.<br>· O Garibaldi te deu um <b>bodoque</b>: <b>R</b> atira pedra no bicho mais perto, na tua frente (não gasta bala). O <b>revólver 38</b> e as balas, ele e o São Dunstano vendem; bala também aparece nos baús e, às vezes, onde cai um bicho. <b>X</b> troca de arma.', 'Refúgio do Garibaldi']], null, 'Bora pra mata');
  };
  if (!scenesEnabled()) { done(); return; }
  const g = { x: 560, y: 960 }, ghost = (a, y) => drawGaribaldi(a.x, y, a.alpha ?? 1, a.dx, !!a.walk), facao = caveState().facao;
  const fog = layers => layers.push({ y: 9e6, draw: () => { ctx.save(); for (let k = 0; k < 10; k++) { const x = 120 + k * 120 + Math.sin(frameClock * .3 + k) * 50, y = 880 + (k % 3) * 90, r = 150 + (k % 4) * 30, g = ctx.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, 'rgba(232,240,244,.16)'); g.addColorStop(1, 'rgba(232,240,244,0)'); ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); } ctx.restore(); } });
  playSteps([...sceneWorld({ map: 'mata', x: 420, y: 930, night: worldNight() ? .5 : .15, props: fog }),
    { actor: 'sadi', x: 60, y: MATA.entryY, dx: 1 }, { fade: 'in', time: 1 },
    { walk: 'sadi', to: { x: 330, y: 975 } },
    { say: 'sadi', text: 'Bah, que pinheiral fechado… e essa neblina?' },
    { actor: 'garibaldi', x: g.x, y: g.y, dx: -1, alpha: 0, ghost: true, draw: ghost }, { do: () => AudioEngine.caveGhost?.() },
    { do: () => { const a = scene.actors.garibaldi, up = () => { if (!scene || scene.actors.garibaldi !== a) return; a.alpha = Math.min(1, a.alpha + .05); if (a.alpha < 1) setTimeout(up, 40); }; up(); } }, { wait: 1.4 },
    sceneSet('sadi', { hop: 16 }), { do: () => { sceneShout('Bah!', 330, 820, '#ffe28a', 22); AudioEngine.ouch?.(); } },
    { say: 'sadi', text: 'Um fantasma… de camisa vermelha?!' }, sceneSet('sadi', { hop: 0 }),
    { say: 'garibaldi', text: 'Calma, gaúcho! Giuseppe Garibaldi, às ordens. Marinheiro de muitos mares, farrapo de coração.' },
    { say: 'garibaldi', text: 'Lutei com os farrapos nessa terra, na Revolução Farroupilha, de 1835 a 1845. Faz quase duzentos anos.' },
    { say: 'sadi', text: 'O Garibaldi das figurinhas? O que levou barco por terra?' },
    { say: 'garibaldi', text: 'Esse mesmo! Em 1839 a gente puxou dois lanchões em carretas de oito rodas, com uns duzentos bois, até o mar. Pra chegar em Laguna.' },
    { say: 'garibaldi', text: 'Esse pinheiral é o meu refúgio. Aqui é paz: nem bicho brabo, nem gente braba.' },
    { say: 'garibaldi', text: 'Mas pra lá da picada do leste a mata desce a serra, trecho atrás de trecho, até a restinga e o mar. É tão fechada que lá dentro é sempre noite. E é braba: javali, cobra, onça… e coisa pior.' },
    ...(facao ? [{ say: 'sadi', text: 'Pois eu trouxe o facão do meu vô.' }, { say: 'garibaldi', text: 'Então já entra de facão na mão. Lá, quem baixa a guarda vira causo.' }]
      : [{ say: 'garibaldi', text: 'E tu tá sem facão? Dizem que tem um cravado na boca da gruta, lá na Serra. Sem ele, nem adianta seguir.' }]),
    { say: 'sadi', text: 'E o que tem lá no fim?' },
    { say: 'garibaldi', text: 'A barra de Laguna. Lá eu tenho uma conta antiga pra acertar: o navio do Império ainda ronda aquela barra.' },
    { say: 'garibaldi', text: 'No caminho, nos acampamentos, tu vai topar com gente da minha época… e com uns que são bem mais velhos que eu.' },
    { say: 'garibaldi', text: hadSling ? 'E esse bodoque aí na guaiaca? Pois na mata ele serve pra mais que espantar quero-quero.' : 'Antes que eu esqueça, toma: um bodoque. Forquilha de goiabeira e borracha de câmara. Foi de um piá de Laguna.' },
    { do: () => { AudioEngine.ready?.(); if (!hadSling) sceneShout('🪨 Ganhou um bodoque', 330, 800, '#ffe28a', 20); } },
    { say: 'garibaldi', text: 'Bicho que tu não quer de perto, tu derruba de longe: vira pro lado dele e aperta R. A pedra vai sozinha no bicho mais perto, na tua frente.' },
    { say: 'garibaldi', text: 'Não precisa de bala, pedra tem em todo canto. É fraquinho, mas ajuda. Pra coisa mais braba, eu e o São Dunstano vendemos um revólver 38, com as balas.' },
    { say: 'garibaldi', text: 'Vem, que eu te mostro o refúgio. Tenho ferramenta pra mata e um barbaquá pra secar erva.' },
    sceneSet('garibaldi', { speed: 110 }), sceneSet('sadi', { speed: 110 }), scenePan(560, 1260, 140),
    { walk: ['garibaldi', 'sadi'], to: [{ x: 600, y: 1240 }, { x: 520, y: 1200 }] },
    { fade: 'out', time: .7 }], 'mata-garibaldi', done);
}
function garibaldiMeet() { garibaldiIntro(); }
let garibaldiTab = 'loja';
const GARIBALDI_TABS = [['loja', '⚔️ Armas e equipamento'], ['bornal', '🎒 Bornal'], ['vender', '💰 Vender']];
function garibaldiShop() {
  if (!['mata', 'casa:garibaldi', 'laguna'].includes(worldOut?.map)) return; skipWorldTalk();
  const st = mataState(), lv = mataLevel(), next = MATEIRO_RANKS[lv], box = $('dialogContent').closest('.dialog'), keep = modal === 'garibaldiShop' ? box.scrollTop : 0;
  const head = `<div class="rpg-speaker">${garibaldiPortrait(72)}<div><p><b>Giuseppe Garibaldi</b></p><p>${pick(GARIBALDI_SHOP_LINES)}</p></div></div>
    <div class="forja-top"><span>🌲 Nível de mateiro: <b>${mataRank()}</b> · ${st.xp}${next ? ' / ' + next[0] + ' xp' : ' xp'}</span><span>Mais fundo: ${st.deepest > 1 ? TRECHO_BIOME_NAMES[trechoBiome(Math.min(st.deepest, TRECHO.last + 1))] : 'o pinheiral do refúgio'}</span><span>❤ ${Math.round(caveState().hp)}/${caveMaxHp()}</span></div>
    <div class="phone-cat">${GARIBALDI_TABS.map(([id, label]) => `<button class="${garibaldiTab === id ? 'active' : ''}" data-act="garibaldiTab" data-id="${id}">${label}</button>`).join('')}</div>`;
  openDialog('Rancho do Garibaldi', head + (garibaldiTab === 'bornal' ? garibaldiBornalHTML() : garibaldiTab === 'vender' ? garibaldiVenderHTML() : garibaldiLojaHTML()), 'garibaldiShop');
  box.scrollTop = keep;
}
// As mesmas armas e o mesmo equipamento da ferraria do São Dunstano: é tudo uma coisa só, vale na caverna e na mata.
function garibaldiLojaHTML() {
  const old = caveWeapon().id === 'facao' ? CAVE_UPGRADES.filter(u => ['afiado', 'aco'].includes(u.id)) : [];
  const sec = (title, note, html) => `<h3 class="forja-sec">${title} <small>${note}</small></h3><div class="store-list">${html}</div>`;
  return '<p class="small-note">O Garibaldi troca com o São Dunstano: as armas e o equipamento são os mesmos da ferraria, e o que tu compra num lugar vale no outro.</p>' +
    sec('⚔️ Armas', 'minério + dinheiro · a nova já vai pra mão', dunstanWeaponsHTML()) +
    sec('✨ Afiar', 'a arma que está na mão', dunstanAfiarHTML() + old.map(upgradeCardHTML).join('')) +
    sec('🧥 Equipamento', 'fica contigo pra sempre', CAVE_UPGRADES.filter(u => !['afiado', 'aco'].includes(u.id)).map(upgradeCardHTML).join(''));
}
function garibaldiBornalHTML() {
  const bag = mataBag(), max = mataBagMax();
  return `<p class="small-note">Na mata, as teclas <b>1 a 5</b> usam o que tá no bornal (até ${max} de cada${caveUp('bornal') ? '' : '; o bornal de couro cru da ferraria dobra'}).</p><div class="store-list">` + MATA_ITEMS.map(i => {
    const have = bag[i.id] || 0, room = max - have;
    return forjaCard(`${mataGearHTML(i.id)}`, i.name + ` <small>· ${have}/${max}</small>`, i.desc, '', `<button class="primary" data-act="garibaldiItem" data-id="${i.id}" ${room > 0 && hasCash(i.cost) ? '' : 'disabled'}>${room > 0 ? 'Comprar · ' + money(i.cost) : 'Cheio'}</button>`);
  }).join('') + '</div>';
}
const GARIBALDI_BUYS = { erva_verde: 2, pinhao: 6, mel: 10 };
function garibaldiVenderHTML() {
  const ramos = Math.floor(bagQty('erva_verde')), pin = Math.floor((G.stock.pinhao || 0) / 1000), mel = Math.floor(G.stock.mel || 0);
  const row = (icon, name, have, unit, price, id) => forjaCard(icon, name, 'Tu tem ' + have + '. O Garibaldi paga ' + money(price) + ' ' + unit + '.', '', `<button class="primary" data-act="garibaldiSell" data-id="${id}" ${have > 0 ? '' : 'disabled'}>Vender ${id === 'erva_verde' ? 'tudo' : '1'}</button>`);
  return '<p class="small-note">O pinhão e o mel vendem melhor no balcão da bodega. Aqui é pra quando a bodega tá cheia.</p><div class="store-list">' +
    row(mataGearHTML('erva_verde'), 'Ramos de erva-mate nativa', ramos + ' ramos', 'por ramo', GARIBALDI_BUYS.erva_verde, 'erva_verde') +
    row(itemIconHTML('pinhao'), 'Pinhão', pin + ' kg', 'por kg', GARIBALDI_BUYS.pinhao, 'pinhao') +
    row(mataGearHTML('mel'), 'Mel de jataí', mel + ' potes', 'por pote', GARIBALDI_BUYS.mel, 'mel') + '</div>';
}
function garibaldiItem(id) {
  const i = MATA_ITEMS.find(x => x.id === id), bag = mataBag(); if (!i || (bag[id] || 0) >= mataBagMax() || !hasCash(i.cost)) return;
  spendCash(i.cost); bag[id] = (bag[id] || 0) + 1; AudioEngine.coins?.(); save(); refreshHUD(); mataBeltRefresh(); garibaldiShop();
}
function garibaldiSell(id) {
  if (id === 'erva_verde') { const q = Math.floor(bagQty('erva_verde')); if (!q) return; bagTake('erva_verde', q); G.cash = round(G.cash + q * GARIBALDI_BUYS.erva_verde); }
  else if (id === 'pinhao') { if ((G.stock.pinhao || 0) < 1000) return; G.stock.pinhao -= 1000; G.cash = round(G.cash + GARIBALDI_BUYS.pinhao); }
  else if (id === 'mel') { if (!(G.stock.mel >= 1)) return; G.stock.mel -= 1; G.cash = round(G.cash + GARIBALDI_BUYS.mel); }
  AudioEngine.coins?.(); save(); refreshHUD(); garibaldiShop();
}
const BARBAQUA_G = 200;   // cada ramo de erva nativa vira 200 g de erva seca
function barbaquaSecar() {
  const q = Math.floor(bagQty('erva_verde')); if (!q) { worldSay('O barbaquá seca os ramos de erva-mate nativa. Colhe erva nas clareiras da mata adentro (e na do mirante).'); return; }
  bagTake('erva_verde', q); bagAdd('erva', q * BARBAQUA_G); mataXP(q); AudioEngine.ignite?.(); fxPuffs(RANCHO_BARBAQUA.x, RANCHO_BARBAQUA.y - 110, 12, 90, '#d8d4cc');
  talk([['garibaldi', 'Erva no barbaquá: fogo baixo e fumaça de nó de pinho. É assim que a erva fica com gosto de mato.'], ['card', '<b>🌿 Erva seca no barbaquá</b><br>' + q + (q > 1 ? ' ramos viraram ' : ' ramo virou ') + formatWeight(q * BARBAQUA_G) + ' de erva-mate, direto no saco de erva da bodega.', 'Barbaquá']], null, 'Bah, que cheiro');
  save(); refreshHUD();
}
function ranchoRest() {
  caveState().hp = caveMaxHp(); mataBuffs.regen = 0; mataBuffs.veneno = 0; AudioEngine.ready?.(); save();
  worldSay('Fogo aceso, mate na mão. Tu descansou e recuperou a vida.');
}

// ---------- Ligações ----------
{
  const M = WORLD_MAPS.mata, spots = M.spots, draw = M.draw, walk = M.canWalk;
  M.spots = function () {
    const list = spots.call(this);
    list.push({ id: 'garibaldi', x: RANCHO_GHOST.x, y: RANCHO_GHOST.y, radius: 110, label: G.mata?.metGaribaldi ? 'Prosear com o Garibaldi (e descansar)' : 'Quem tá perto do fogo?', act: garibaldiTalk },
      { id: 'rancho', x: RANCHO.x + RANCHO.w / 2, y: RANCHO.y + RANCHO.h + 30, radius: 90, label: 'Entrar no refúgio do Garibaldi', act: () => enterInterior('casa:garibaldi') },
      { id: 'barbaqua', x: RANCHO_BARBAQUA.x, y: RANCHO_BARBAQUA.y + 46, radius: 100, label: 'Barbaquá · secar a erva' + (bagQty('erva_verde') ? ' (' + Math.floor(bagQty('erva_verde')) + ' ramos)' : ''), act: barbaquaSecar },
      { id: 'fogo', x: RANCHO_FOGO.x, y: RANCHO_FOGO.y + 40, radius: 90, label: 'Descansar no acampamento', act: ranchoRest },
      { id: 'marco', x: RANCHO_MARCO.x, y: RANCHO_MARCO.y + 30, radius: 80, label: 'Marco das trilhas · ir pros acampamentos', act: mataCampsDialog });
    return list;
  };
  M.canWalk = function (x, y) {
    if (x > RANCHO.x - 30 && x < RANCHO.x + RANCHO.w + 30 && y > RANCHO.y + 20 && y < RANCHO.y + RANCHO.h + 12) return false;
    if (((x - RANCHO_BARBAQUA.x) / 96) ** 2 + ((y - RANCHO_BARBAQUA.y) / 30) ** 2 < 1) return false;
    if (Math.hypot(x - RANCHO_FOGO.x, (y - RANCHO_FOGO.y) * 1.6) < 50) return false;
    return walk.call(this, x, y);
  };
  M.draw = function (view, seen, layers) {
    draw.call(this, view, seen, layers);
    if (!seen(RANCHO.x + RANCHO.w / 2, RANCHO.y + RANCHO.h / 2, 700)) return;
    layers.push({ y: RANCHO.y + RANCHO.h, draw: drawRancho }, { y: RANCHO_BARBAQUA.y + 4, draw: drawBarbaqua }, { y: RANCHO_FOGO.y, draw: drawRanchoFogo }, { y: RANCHO_MARCO.y, draw: drawMarco });
    if (!scene) layers.push({ y: RANCHO_GHOST.y, draw: () => drawGaribaldi(RANCHO_GHOST.x, RANCHO_GHOST.y, 1, worldOut.x < RANCHO_GHOST.x ? -1 : 1) });
  };
  // Chegou perto do rancho a primeira vez: a cena com o Garibaldi.
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (worldOut?.map === 'mata' && !G.mata?.metGaribaldi && G.mataSeen && !scene && !modal && !worldTalkOpen() && Math.hypot(worldOut.x - RANCHO_GHOST.x, worldOut.y - RANCHO_GHOST.y) < 330) garibaldiMeet(); };
  // Desmaiou na mata: acorda no rancho, com o Garibaldi.
  mataFaint = function () {
    const N = mataNight; if (!N || N.faint) return; N.faint = true; keys.clear();
    // Com o lenço farrapo do Bento, quem acha o Sadi caído leva ele pro fogo sem mexer no bolso.
    const lost = mataFolk('bento') ? 0 : Math.min(50, Math.round(G.cash * .1)); G.cash = round(G.cash - lost); caveState().hp = caveMaxHp(); AudioEngine.caveFaintSound?.(); save();
    const p = garibaldiFront(); switchMap({ map: 'mata', x: p.x, y: p.y, title: 'Refúgio do Garibaldi' }); mataNight = null; mataBuffs.veneno = 0;
    talk([['card', `<b>😵 Desmaiou na mata</b><br>Acordou no refúgio do Garibaldi, com a cabeça doendo${lost ? ` e o bolso mais leve (−${money(lost)})` : ': o lenço farrapo no pescoço segurou o bolso'}. O fantasma te arrastou de volta pela picada.`, 'Mata de Araucárias'], ['garibaldi', 'Coragem tu tem, gaúcho. Falta juízo: descansa perto do fogo e volta com calma.']], null, 'Levantar');
  };
  // Falas: o retrato do Garibaldi (e o da gralha, nas conversas fora de cena).
  const box = showRpgBox; showRpgBox = function (prefix, line) {
    if (line && !line.portrait && line.person === GARIBALDI_PERSON) line = { ...line, portrait: garibaldiPortrait() };
    if (line && !line.portrait && line.name === 'gralha') line = { ...line, name: 'Gralha-azul', portrait: gralhaPortrait() };
    return box(prefix, line);
  };
  const speaker = sceneSpeaker; sceneSpeaker = function (who) { return who === 'garibaldi' ? { portrait: garibaldiPortrait(), name: 'Giuseppe Garibaldi' } : speaker(who); };
  const act = action; action = function (name, id) {
    if (name === 'garibaldiOpenShop') { talkSkip(); garibaldiShop(); return; }
    if (name === 'garibaldiTab') { garibaldiTab = id; garibaldiShop(); return; }
    if (name === 'garibaldiItem') { garibaldiItem(id); return; }
    if (name === 'garibaldiSell') { garibaldiSell(id); return; }
    return act(name, id);
  };
  // Arma e equipamento no rancho: as mesmas funções da ferraria, que conferem se a loja tá aberta e depois redesenham
  // a loja. Com o rancho aberto, a loja é o rancho.
  const viaRancho = fn => function (...a) {
    if (modal !== 'garibaldiShop' || !['mata', 'casa:garibaldi', 'laguna'].includes(worldOut?.map)) return fn.apply(this, a);
    const open = dunstanShopOpen, shop = dunstanShop; dunstanShopOpen = () => true; dunstanShop = garibaldiShop;
    try { return fn.apply(this, a); } finally { dunstanShopOpen = open; dunstanShop = shop; }
  };
  const end = talkEnd; talkEnd = function () { $('garibaldiTradeButton')?.remove(); return end(); };
  forjaMake = viaRancho(forjaMake); forjaEquip = viaRancho(forjaEquip); forjaAfiar = viaRancho(forjaAfiar); facaoBuy = viaRancho(facaoBuy);
  // Conquistas da mata.
  const at = ACHIEVEMENTS.findIndex(a => a.id === 'lendaria');
  ACHIEVEMENTS.splice(at < 0 ? ACHIEVEMENTS.length : at, 0,
    { id: 'mata5', name: 'Mata adentro', desc: 'Entrar fundo no Pinheiral, mata adentro.', xp: 120, test: () => (G.mata?.deepest || 0) >= 5 },
    { id: 'caboclo', name: 'Caboclo do pinheiral', desc: 'Chegar ao nível de mateiro Caboclo.', xp: 150, test: () => (G.mata?.xp || 0) >= MATEIRO_RANKS[2][0] },
    { id: 'replantio', name: 'Plantador de pinheiro', desc: 'Replantar uma clareira de tocos e ver as mudas crescerem.', xp: 120, test: () => Object.values(G.mata?.plant || {}).some(p => p.thanked) },
    { id: 'cachaco', name: 'O cachaço do pinheiral', desc: 'Vencer o Javali Cachaço, no fim do Pinheiral.', xp: 250, test: () => !!G.mata?.cachaco },
    { id: 'papo', name: 'Papo-amarelo', desc: 'Vencer o Lagarto do papo-amarelo, no fim da Encosta da Serra.', xp: 350, test: () => !!G.mata?.papo },
    { id: 'prosa', name: 'Prosa de acampamento', desc: 'Conhecer quem mora em todos os acampamentos da mata adentro.', xp: 300, test: () => ['jasy', 'lanceiro', 'kurupi', 'sepe', 'bento', 'anita'].every(id => G.mata?.folks?.[id]) },
    { id: 'laguna', name: 'A Batalha de Laguna', desc: 'Vencer o navio imperial na barra de Laguna, ao lado do Garibaldi e da Anita.', xp: 600, test: () => !!G.mata?.laguna?.won });
}
