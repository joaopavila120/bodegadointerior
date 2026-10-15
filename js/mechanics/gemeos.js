// Arco "A Casona dividida": o Márcio e o Marcelo brigaram por causa da Daiane, a prenda de Bento Gonçalves, e na mesma
// noite cada um botou o sonzão no último pra provocar o outro: a vizinhança chamou a Brigada e o sonzão foi apreendido.
// Agora a Casona tem uma fita crepe no meio da sala e o Marcelo sumiu. O Sadi:
//   1. entra na Casona e o Márcio conta a briga (cena);
//   2. procura o Marcelo pela Serra (dica: quando fica brabo, ele vai chutar bola sozinho) e acha ele no campinho (cena);
//   3. convence o Marcelo escolhendo as falas certas (errou demais, ele cansa e só conversa no outro dia);
//   4. convence o Márcio do mesmo jeito;
//   5. de noite, na laje, faz a mediação (cena com escolhas): os dois fazem as pazes e o sonzão volta pra casa.
'use strict';

const GEMEOS_CAMPINHO = { x: 2960, y: 1290 }, GEMEOS_PATIENCE = 3;
function gemeosState() { G.gemeos ??= { stage: 0 }; return G.gemeos; }
function gemeosStage() { return G.gemeos?.stage || 0; }
// Começa depois de uns dias de bodega, com a Serra aberta e um pouco de amizade com os gêmeos.
function gemeosReady() {
  if (gemeosStage() || prologueActive() || !G.tutorial?.complete || regionLocked('serra') || bodegaDays() < 9) return false;
  const f = id => G.friends[PEOPLE.findIndex(p => p.id === id)] || 0; return Math.max(f('marcio'), f('marcelo')) >= 10;
}
function gemeosFighting() { const s = gemeosStage(); return s >= 1 && s < 5; }

// ---------- Falas com escolha ----------
// Cada pergunta tem uma resposta certa; as outras arrancam uma reação e a pergunta volta. Errou demais: ele cansa.
const GEMEOS_ROUNDS = {
  marcelo: [
    { q: 'Veio me buscar a mando do Márcio, é? Pode voltar por onde veio.', a: [
      ['Ninguém me mandou. Vim porque tu é meu amigo.', 'Hmpf… Show de bola. Senta aí, então.', true],
      ['O Márcio disse que tu é um cabeça-dura.', 'Ah, ele disse, é? Então ele que venha me dizer na cara!'],
      ['Bah, tu chuta mal, hein.', 'Muito engraçado, Sadi. Bem o que eu precisava hoje.']] },
    { q: 'A Daiane dançou comigo no baile da Festa da Uva. Comigo! E o Márcio jura que ela confundiu os gêmeos.', a: [
      ['Por causa de uma dança vocês vão jogar fora trinta anos de irmão?', '…Dito assim parece bobagem, né?', true],
      ['Ela confundiu mesmo: vocês são iguaizinhos.', 'Iguais nada! Eu sou o bonito, tchê.'],
      ['Então fica com a Daiane e esquece o Márcio.', 'Bah… não é bem assim também, Sadi.']] },
    { q: 'E o sonzão? A Brigada levou por culpa dele, que botou a vaneira no último às três da manhã!', a: [
      ['E tu botou o teu no último também. A culpa é meio a meio.', '…É. Eu botei o funk do Mito do Sul em cima. Meio a meio.', true],
      ['A culpa é toda do Márcio, tu tem razão.', 'Viu? Até o Sadi concorda! …Só que assim ele nunca vai pedir desculpa.'],
      ['Sonzão se compra outro.', 'Outro?! Aquele era herança do tio Lori, guri!']] }
  ],
  marcio: [
    { q: 'Achou o Marcelo, é o quê? Aposto que tá falando mal de mim.', a: [
      ['Ele sente tua falta. Tá chutando bola sozinho no campinho.', '…Sozinho? Ele odeia jogar sozinho. Sempre foi eu no gol.', true],
      ['Falou mesmo. Disse que ele é o bonito.', 'Bonito?! Somos iguais, é o quê!'],
      ['Não achei ninguém, só passei pra tomar um café.', 'Café não tem: a cafeteira ficou do lado dele da fita.']] },
    { q: 'E se eu for lá e ele não quiser falar comigo?', a: [
      ['Ele quer. Ele mesmo disse: conversa, se tu quiser também.', '…Então tá. Hoje de noite, na laje. Tu vai junto, Sadi.', true],
      ['Leva a Daiane junto, aí ele não pode dizer não.', 'Tá louco? Aí é que vira guerra!'],
      ['Aí tu passa uma fita crepe no meio da laje também.', '…Não tem graça, Sadi. Nenhuma.']] }
  ],
  laje1: [
    { q: 'Os dois na laje, um em cada canto, olhando pro chão. Ninguém fala nada. Puxe o assunto:', a: [
      ['Lembram quando vocês caíram juntos do telhado da Casona, tentando arrumar a antena?', null, true],
      ['Quem pedir desculpa primeiro ganha um xis.', 'Márcio: Não tô com fome. · Marcelo: Nem eu. (silêncio)'],
      ['Bom, já que ninguém fala, eu vou embora.', 'Márcio e Marcelo: Não! Fica, Sadi… (e se olham de canto)']] }
  ],
  laje2: [
    { q: 'Riram, mas falta resolver o sonzão. O que tu propõe?', a: [
      ['Amanhã vocês vão juntos na Brigada buscar o sonzão e racham a multa.', null, true],
      ['Eu compro um sonzão novo pra vocês.', 'Os dois: Não, Sadi! O sonzão do tio Lori não tem outro igual.'],
      ['Deixa ele lá na Brigada, a vizinhança agradece.', 'Márcio: A vizinhança agradece… · Marcelo: …mas a laje chora.']] }
  ]
};
let gemeosRound = null;
function gemeosAsk(who, set, onDone) {
  gemeosRound = { who, set, n: 0, wrong: 0, onDone, said: null };
  gemeosQuestion();
}
function gemeosQuestion() {
  const r = gemeosRound, Q = GEMEOS_ROUNDS[r.set][r.n], i = PEOPLE.findIndex(p => p.id === r.who), speaker = r.who === 'sadi' ? '' : `<div class="rpg-speaker">${portraitHTML(i, 88)}<div><p><b>${PEOPLE[i].name}</b></p><p>${Q.q}</p></div></div>`;
  const reply = r.said ? `<div class="callout choice-reply">${r.said}</div>` : '', order = Q.order ??= shuffle(Q.a.map((_, k) => k));
  const opts = order.map(k => `<button class="choice" data-act="gemeosChoice" data-id="${k}">${Q.a[k][0]}</button>`).join('');
  openDialog(r.who === 'sadi' ? 'Na laje da Casona' : 'Conversa com ' + PEOPLE[i].name, `${speaker || `<p>${Q.q}</p>`}${reply}<p class="small-note">O que o Sadi diz?</p><div class="choice-list">${opts}</div>`, 'gemeosChoice');
}
function gemeosChoice(k) {
  const r = gemeosRound; if (!r) return; const Q = GEMEOS_ROUNDS[r.set][r.n], [said, reply, good] = Q.a[Number(k)] || [];
  if (!said) return;
  if (good) {
    AudioEngine.heart(); r.n++; r.said = reply ? '<b>' + (r.who === 'sadi' ? '' : PEOPLE[PEOPLE.findIndex(p => p.id === r.who)].name + ':</b> ') + reply : null;
    if (r.n >= GEMEOS_ROUNDS[r.set].length) { const done = r.onDone, last = r.said; gemeosRound = null; closeDialog(true); done?.(true, last); return; }
    gemeosQuestion(); return;
  }
  AudioEngine.bad(); r.wrong++; r.said = (r.who === 'sadi' ? '' : '<b>' + PEOPLE[PEOPLE.findIndex(p => p.id === r.who)].name + ':</b> ') + reply;
  if (r.who !== 'sadi' && r.wrong >= GEMEOS_PATIENCE) { const done = r.onDone, who = r.who; gemeosRound = null; closeDialog(true); done?.(false, who); return; }
  gemeosQuestion();
}

// ---------- Cenas ----------
function drawGemeosRoom(split = true) {
  beginWorld();
  rect(0, 0, W, H, '#2a2018'); rect(120, 90, W - 240, 330, '#e8d8b0'); rect(120, 404, W - 240, 16, '#5a3a22');
  for (const x of [260, 1180]) { rect(x, 150, 150, 120, '#7a9ab8', 6, '#5a3a20'); rect(x + 72, 150, 6, 120, '#5a3a20'); }
  rect(120, 420, W - 240, H - 420, '#a87a4a'); for (let y = 440; y < H; y += 46) rect(120, y, W - 240, 2, '#8a6038');
  // TV e sofá do lado do Márcio; a cafeteira do lado do Marcelo; e a marca de pó onde ficava o sonzão.
  rect(300, 300, 220, 120, '#1a1a1e', 6, '#3a3a40'); rect(310, 310, 200, 96, '#2a3a5a');
  rect(250, 600, 300, 70, '#2a6a3a', 14, '#1a4a2a'); rect(250, 570, 300, 34, '#327a44', 12);
  rect(1060, 330, 150, 70, '#8a5a2a', 4, '#3a2414'); rect(1090, 300, 40, 40, '#2a2a2e', 6); ellipse(1110, 296, 14, 5, '#3a3a40');
  ctx.save(); ctx.setLineDash([10, 8]); ctx.strokeStyle = '#6a5a48'; ctx.lineWidth = 3; ctx.strokeRect(1240, 300, 140, 110); ctx.restore(); txt('?', 1310, 356, 40, '#6a5a48', 'center', 'Georgia', false);
  if (split) {
    rect(W / 2 - 6, 90, 12, H - 90, '#e8d8a0'); for (let y = 100; y < H; y += 40) rect(W / 2 - 6, y, 12, 2, '#c8b880');
    rect(W / 2 - 230, 450, 200, 40, '#f4ecd8', 6, '#5a3a20'); txt('LADO DO MÁRCIO', W / 2 - 130, 470, 16, '#5a3418', 'center', 'Georgia', false);
    rect(W / 2 + 30, 450, 210, 40, '#f4ecd8', 6, '#5a3a20'); txt('LADO DO MARCELO', W / 2 + 135, 470, 16, '#5a3418', 'center', 'Georgia', false);
  }
  drawSceneActors(); ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function drawGemeosCampinho() {
  beginWorld(); const s = scene;
  rect(0, 0, W, 260, '#a8d0e8'); for (let x = -40; x < W; x += 170) ellipse(x, 262, 150, 50, '#5a8a4a');
  rect(0, 260, W, H - 260, '#5f9a3e'); for (let x = 0; x < W; x += 120) rect(x, 260, 60, H - 260, 'rgba(255,255,255,.04)');
  ctx.strokeStyle = '#f4f4ea'; ctx.lineWidth = 5; ctx.strokeRect(160, 320, W - 320, 520); ctx.beginPath(); ctx.moveTo(W / 2, 320); ctx.lineTo(W / 2, 840); ctx.stroke(); ctx.beginPath(); ctx.arc(W / 2, 580, 80, 0, Math.PI * 2); ctx.stroke();
  for (const gx of [160, W - 160]) { rect(gx - 4, 470, 8, 160, '#f4f4ea'); rect(gx - (gx < W / 2 ? 0 : 60), 466, 64, 8, '#f4f4ea'); }
  const k = performance.now() / 1000 * .9, tri = k % 2 < 1 ? k % 1 : 1 - k % 1, b = s.kick ? { x: 820 + tri * 420, y: 700, h: Math.abs(Math.sin(k * Math.PI)) * 60 } : { x: 820, y: 700, h: 0 }; ellipse(b.x, b.y + 4, 14, 5, '#00000033'); ellipse(b.x, b.y - (b.h || 0), 13, 13, '#f8f8f0'); ellipse(b.x - 3, b.y - (b.h || 0) - 2, 4, 4, '#2a2a2a');
  drawSceneActors(); ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function drawGemeosLaje() {
  beginWorld(); const s = scene;
  rect(0, 0, W, H, '#0e1428'); for (let i = 0; i < 50; i++) ellipse((i * 211.3) % W, (i * 37.7) % 220, 1.3, 1.3, `rgba(240,236,210,${.3 + .3 * Math.sin(frameClock * 1.5 + i)})`);
  rect(0, 300, W, H - 300, '#8a8a84'); for (let x = 0; x < W; x += 140) rect(x, 300, 2, H - 300, '#7a7a74'); for (let y = 360; y < H; y += 120) rect(0, y, W, 2, '#7a7a74');
  for (const x of [140, 1460]) { rect(x - 16, 180, 32, 520, '#b8b0a0'); }
  for (let x = 140; x < 1460; x += 50) { const y = 200 + Math.sin(x / 140) * 20; ellipse(x, y, 6, 7, ['#ffd860', '#ff8a5a', '#8ad8ff'][Math.round(x / 50) % 3]); }
  rect(240, 430, 260, 80, '#6a6a6e', 6, '#3a3a3e'); for (let k = 0; k < 6; k++) rect(260 + k * 40, 440, 24, 8, '#b84a2a'); for (let k = 0; k < 4; k++) { const a = (frameClock * .8 + k * .25) % 1; ellipse(330 + k * 30, 420 - a * 100, 10 + a * 20, 8 + a * 12, `rgba(220,220,215,${.5 * (1 - a)})`); }
  rect(980, 560, 280, 90, '#8a5a2a', 6, '#3a2414');
  if (s.som) { rect(1300, 470, 120, 100, '#1a1a1e', 8, '#3a3a40'); ellipse(1335, 520, 22, 22, '#3a3a40'); ellipse(1385, 520, 22, 22, '#3a3a40'); rect(1310, 452, 100, 18, '#f0e080', 3); txt('VOLUME MÁX: 6', 1360, 461, 10, '#3a2414', 'center', 'Arial', false); for (let k = 0; k < 3; k++) { const a = (frameClock * 1.5 + k * .33) % 1; txt('♪', 1360 + Math.sin(k * 2) * 40, 440 - a * 90, 22, `rgba(255,240,180,${1 - a})`, 'center', 'Georgia', false); } }
  drawSceneActors(); ctx.setTransform(1, 0, 0, 1, 0, 0);
}
SCENE_VIEWS.gemeosSala = () => drawGemeosRoom(true); SCENE_VIEWS.gemeosSalaInteira = () => drawGemeosRoom(false); SCENE_VIEWS.gemeosCampinho = drawGemeosCampinho; SCENE_VIEWS.gemeosLaje = drawGemeosLaje;

// 1. A Casona dividida: o Márcio sozinho conta a briga.
function gemeosStart() {
  const st = gemeosState(); st.stage = 1; st.day = G.day; save();
  const saved = { ...G.player }; showRpgBox('worldTalk', null); keys.clear();
  playSteps([{ caption: 'A Casona dividida', time: 1.8 }, { view: 'gemeosSala' }, { actor: 'sadi', x: 1000, y: 760, dx: -1 }, { actor: 'marcio', x: 520, y: 700, dx: 1 }, { fade: 'in', time: .6 },
    { say: 'sadi', text: 'Ô de casa! …Márcio? Que fita crepe é essa no meio da sala?' },
    { say: 'marcio', text: 'É o quê? Daqui pra lá é do Marcelo. Daqui pra cá é meu. Não pisa na linha.' },
    { say: 'marcio', text: 'Tudo por causa da Daiane, a prenda de Bento. No baile da Festa da Uva ela dançou com ele… mas foi porque confundiu os gêmeos!' },
    { say: 'marcio', text: 'Aí ele botou o funk no último. Eu botei a vaneira no último por cima. Três da manhã.' },
    { say: 'marcio', text: 'A vizinhança chamou a Brigada. Levaram o sonzão do tio Lori, Sadi. Apreendido. Perturbação do sossego.' },
    { say: 'sadi', text: 'E o Marcelo?' },
    { say: 'marcio', text: 'Sumiu. Pegou a bola e saiu batendo a porta. Quando ele fica brabo vai chutar bola sozinho por aí… mas eu é que não vou atrás.' },
    { walk: 'sadi', to: { x: 900, y: 730 } },
    { say: 'sadi', text: '(Bah. Alguém tem que juntar esses dois de novo.)' }, { fade: 'out', time: .6 }], 'gemeos-1', () => {
    G.player = saved; save();
    talk([['dica', 'Procure o <b>Marcelo</b> pela Serra. Dica do Márcio: quando fica brabo, ele vai <b>chutar bola sozinho</b>.', 'A Casona dividida']], null, 'Procurar o Marcelo');
  });
}
// 2. O Marcelo no campinho, chutando bola sozinho.
function gemeosFindMarcelo() {
  const st = gemeosState(); if (st.stage >= 3) return;
  if (st.tired === G.day) { const i = PEOPLE.findIndex(p => p.id === 'marcelo'); worldTalkAt = { x: worldOut.x, y: worldOut.y }; showRpgBox('worldTalk', { person: i, name: 'Marcelo', reply: 'Hoje não, Sadi. Volta amanhã, que hoje eu tô com a cabeça quente.' }); return; }
  const ask = () => gemeosAsk('marcelo', 'marcelo', ok => {
    if (!ok) { st.tired = G.day; save(); talk([['marcelo', 'Quer saber? Deixa, Sadi. Hoje não tem conversa. Volta amanhã.']], null, 'Tentar amanhã'); return; }
    st.stage = 3; save();
    talk([['marcelo', 'Tá bom, Sadi. Eu converso com ele. Mas só se o Márcio quiser também, hein. Vai lá na Casona e pergunta.'], ['dica', 'Agora convença o <b>Márcio</b>, na Casona.', 'A Casona dividida']], null, 'Ir até a Casona');
  });
  if (st.stage === 2) { ask(); return; }
  st.stage = 2; save(); const saved = { ...G.player }; showRpgBox('worldTalk', null); keys.clear();
  playSteps([{ view: 'gemeosCampinho' }, { actor: 'marcelo', x: 740, y: 700, dx: 1 }, { actor: 'sadi', x: 1300, y: 760, dx: -1 }, { fade: 'in', time: .6 },
    { do: () => { scene.kick = true; } },
    { wait: 1.6 }, { walk: 'sadi', to: { x: 1080, y: 730 } },
    { say: 'marcelo', text: 'Goool… sozinho não tem graça nenhuma.' },
    { say: 'sadi', text: 'Marcelo! Tava te procurando pela Serra inteira.' }, { fade: 'out', time: .4 }], 'gemeos-2', () => { G.player = saved; save(); ask(); });
}
// 3. Convencer o Márcio na Casona.
function gemeosConvinceMarcio() {
  const st = gemeosState();
  if (st.tiredMarcio === G.day) { twinSay('marcio', 'Hoje não, Sadi. Amanhã a gente vê.'); return; }
  gemeosAsk('marcio', 'marcio', ok => {
    if (!ok) { st.tiredMarcio = G.day; save(); talk([['marcio', 'É o quê? Chega por hoje, Sadi. Amanhã.']], null, 'Tentar amanhã'); return; }
    st.stage = 4; save(); gemeosLaje();
  });
}
// 4. Na laje: a mediação, com escolhas no meio da cena.
function gemeosLaje() {
  const saved = { ...G.player }; showRpgBox('worldTalk', null); keys.clear();
  const part = (steps, after) => playSteps([{ view: 'gemeosLaje' }, ...steps], 'gemeos-laje', after);
  const cast = [{ actor: 'marcio', x: 360, y: 640, dx: 1 }, { actor: 'marcelo', x: 1180, y: 700, dx: -1 }, { actor: 'sadi', x: 780, y: 760, dx: 1 }];
  playSteps([{ caption: 'De noite, na laje da Casona', time: 1.8 }, { view: 'gemeosLaje' }, ...cast, { fade: 'in', time: .8 },
    { say: 'marcio', text: '…' }, { say: 'marcelo', text: '…' }, { say: 'sadi', text: '(Ninguém fala nada. Vou ter que puxar o assunto.)' }], 'gemeos-laje', () => {
    gemeosAsk('sadi', 'laje1', () => part([...cast.map(a => ({ ...a })), { fade: 'in', time: .2 },
      { say: 'marcio', text: 'A antena! Tu caiu em cima de mim, é o quê!' }, { say: 'marcelo', text: 'Eu caí em cima de ti porque tu me puxou! Ficamos os dois de gesso um mês. Show de bola.' },
      { say: 'marcio', text: '…' }, { say: 'marcelo', text: 'Sabe da Daiane? Tá namorando um gringo de Caxias que toca acordeom.' },
      { say: 'marcio', text: 'Bah… então nenhum dos dois, é o quê?' }, { do: () => AudioEngine.heart() }, { say: 'marcelo', text: 'Nenhum dos dois! Hahaha!' }], () => {
      gemeosAsk('sadi', 'laje2', () => part([{ actor: 'marcio', x: 700, y: 680, dx: 1 }, { actor: 'marcelo', x: 860, y: 680, dx: -1 }, { actor: 'sadi', x: 780, y: 790, dx: 1 }, { fade: 'in', time: .2 },
        { say: 'marcio', text: 'Racha a multa comigo, irmão?' }, { say: 'marcelo', text: 'Racho. E desculpa pelo funk às três da manhã.' }, { say: 'marcio', text: 'Desculpa pela vaneira. E pela fita crepe.' },
        { do: () => AudioEngine.heart() }, { say: 'marcelo', text: 'Bora tirar aquela fita da sala hoje mesmo!' }, { fade: 'out', time: .8 },
        { caption: 'Dois dias depois…', time: 1.8 }, { view: 'gemeosLaje' }, { do: () => { scene.som = true; } }, { actor: 'marcio', x: 1160, y: 640, dx: 1 }, { actor: 'marcelo', x: 1500, y: 640, dx: -1 }, { actor: 'sadi', x: 1000, y: 760, dx: 1 }, { fade: 'in', time: .6 },
        { say: 'marcio', text: 'O sonzão voltou da Brigada! Com um adesivo novo: volume máximo, seis.' }, { say: 'marcelo', text: 'Seis tá ótimo. Show de bola!' }, { say: 'marcio', text: 'É o quê? Valeu, Sadi. A Casona é inteira de novo.' }, { fade: 'out', time: .8 }], () => gemeosEnd(saved)));
    }));
  });
}
function gemeosEnd(saved) {
  const st = gemeosState(); st.stage = 5; st.doneDay = G.day; G.player = saved;
  const rw = { cash: 60, xp: 150, rep: 4, friend: { marcio: 15, marcelo: 15 } }; grantReward(rw); save(); refreshHUD();
  talk([['card', '<b>🔊 A Casona inteira de novo</b><br>A fita crepe saiu da sala, o sonzão do tio Lori voltou da Brigada (no volume seis) e os gêmeos racharam a multa.', 'A Casona dividida · fim'], ['reward', rw, 'A Casona dividida']], null, 'Show de bola!');
}

// ---------- Mapa, painel e Casona ----------
function gemeosTracker() {
  const s = gemeosStage(), t = (goal) => ({ icon: '🔊', title: 'A Casona dividida', goal, kind: 'side' });
  if (!s && gemeosReady()) return t('Os gêmeos da Casona brigaram: passe na Casona, na Serra');
  if (s === 1 || s === 2) return t('Ache o Marcelo pela Serra: brabo, ele vai chutar bola sozinho');
  if (s === 3) return t('Convença o Márcio, na Casona');
  if (s === 4) return t('Na laje da Casona: faça os gêmeos se acertarem');
  return null;
}
function gemeosSpots(map) {
  const s = gemeosStage(), list = [];
  if (map === 'serra' && (s === 1 || s === 2)) list.push({ id: 'gemeos:marcelo', x: GEMEOS_CAMPINHO.x, y: GEMEOS_CAMPINHO.y + 30, radius: 110, label: 'Marcelo · chutando bola sozinho', act: gemeosFindMarcelo });
  if (map === 'casa:marcio' && s === 3) list.push({ id: 'gemeos:marcio', x: 960, y: 700, radius: 90, label: 'Conversar com o Márcio', act: gemeosConvinceMarcio });
  if (map === 'casa:marcio' && s === 4) list.push({ id: 'gemeos:laje', x: 960, y: 700, radius: 90, label: 'Subir pra laje com o Márcio', act: gemeosLaje });
  return list;
}
function drawGemeosWorld(layers, seen) {
  const s = gemeosStage(); if (s !== 1 && s !== 2) return; const { x, y } = GEMEOS_CAMPINHO; if (!seen(x, y)) return;
  const i = PEOPLE.findIndex(p => p.id === 'marcelo'), t = frameClock, bx = x + 50 + Math.abs(Math.sin(t * 1.4)) * 90, bh = Math.abs(Math.sin(t * 2.8)) * 26;
  layers.push({ y, draw: () => personDraw(PEOPLE[i].sprite, x, y, false, false, 1) });
  layers.push({ y: y + 2, draw: () => { ellipse(bx, y + 4, 10, 4, '#00000033'); ellipse(bx, y - 8 - bh, 10, 10, '#f8f8f0'); ellipse(bx - 2, y - 10 - bh, 3, 3, '#2a2a2a'); } });
}
// Fita crepe no meio da sala e a marca de pó do sonzão enquanto os gêmeos estão brigados.
function drawCasonaSplit(layers) {
  if (!gemeosFighting()) return;
  layers.push({ y: 545, draw: () => { rect(1004, 540, 12, 320, '#e8d8a0'); for (let y = 548; y < 860; y += 30) rect(1004, y, 12, 2, '#c8b880'); txt('MÁRCIO ←', 950, 566, 12, '#5a3418', 'center', 'Georgia', false); txt('→ MARCELO', 1072, 566, 12, '#5a3418', 'center', 'Georgia', false); } });
}

{
  // Brigado, o Marcelo não passeia pela rua: até as pazes, ele só aparece no campinho.
  const sw = spawnWalkers; spawnWalkers = function (M) { sw(M); if (gemeosFighting()) worldWalkers = worldWalkers.filter(w => PEOPLE[w.person]?.id !== 'marcelo'); };
  const wk = walkersKey; walkersKey = function (M) { return wk(M) + ':g' + gemeosStage(); };
  // Brigados, os gêmeos não fazem festa na laje.
  const casonaReq = MAP_EVENTS.casona?.requires; if (casonaReq) MAP_EVENTS.casona.requires = () => casonaReq() && !gemeosFighting();
  const tl = trackerLines; trackerLines = function () { const base = tl(), g = gemeosTracker(); if (!g) return base; if (base.length < 2) base.push(g); else if (base[1].kind !== 'story') base[1] = g; return base; };
  const home = atHome; atHome = function (id) { if (id === 'marcelo' && gemeosFighting() && gemeosStage() < 4) return false; return home(id); };
  const avail = visitorAvailable; visitorAvailable = function (i, extra = []) { if (PEOPLE[i]?.id === 'marcelo' && gemeosFighting()) return false; return avail(i, extra); };
  const serra = WORLD_MAPS.serra, ssp = serra.spots, sdraw = serra.draw;
  serra.spots = function () { return [...ssp.call(this), ...gemeosSpots('serra')]; };
  serra.draw = function (view, seen, layers) { sdraw.call(this, view, seen, layers); drawGemeosWorld(layers, seen); };
  const C = WORLD_MAPS.casona, csp = C.spots, cdraw = C.draw, enter = C.onEnter;
  C.spots = function () { const g = gemeosSpots('casa:marcio'); return [...g, ...csp.call(this).filter(sp => !(g.length && sp.id === 'home:marcio'))]; };
  const twin = anyTwin; anyTwin = function () { return gemeosFighting() && gemeosStage() < 4 ? 'marcio' : twin(); };
  C.draw = function (view, seen, layers) { cdraw.call(this, view, seen, layers); drawCasonaSplit(layers); };
  // Na Casona, assim que não tiver nenhuma conversa aberta, o Márcio conta a briga.
  C.onEnter = function () { if (gemeosReady()) return; enter?.call(this); };
  const tick = outsideTick; outsideTick = function (dt) { tick(dt); if (worldOut?.map === 'casa:marcio' && gemeosReady() && !scene && !modal && !worldTalkOpen() && !G.lasso) gemeosStart(); };
  // O sonzão some da sala enquanto ele está na Brigada.
  const som = C.items?.find(i => i.kind === 'som');
  if (som) { Object.defineProperty(som, 'text', { get: () => gemeosFighting() ? 'Só a marca de pó no chão: a Brigada levou o sonzão por perturbação do sossego.' : 'Sonzão da Casona, herança do tio Lori. Agora com um adesivo: volume máximo, seis.', configurable: true }); }
  const furnSom = FURN.som; if (furnSom) FURN.som = function (i) { if (gemeosFighting()) { ctx.save(); ctx.setLineDash([8, 6]); ctx.strokeStyle = '#8a7a64'; ctx.lineWidth = 2; ctx.strokeRect(i.x, i.y, i.w, i.h); ctx.restore(); return; } return furnSom(i); };
}
