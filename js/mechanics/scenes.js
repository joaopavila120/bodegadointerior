// Cenas da história, contadas como um curta: cada cena é uma lista de passos (falas na caixa
// estilo RPG, caminhadas, fades, carta do vô, jornal, montagem). Clique, E, Espaço ou Enter avançam;
// Esc ou "Pular" encerra a cena. A interface do jogo some e entram faixas de cinema.
'use strict';

let scene = null, sceneForcesCampo = false, NEWS_DEFAULT = null;
// Vistas de cena de outros arquivos (ex.: a beira do rio, em map-events.js).
const SCENE_VIEWS = {};
// Os testes automáticos desligam as cenas do meio do jogo (a introdução continua testável).
function scenesEnabled() { return !window.NO_SCENES; }

const SCENES = {
  // Jogo novo: a chegada ao galpão herdado, a carta e a foto do vô, a faxina, a bodega montada e vazia, e o Valter, que
  // propõe a roça: horta atrás do galpão, um boi e a vaca de leite de presente. O prólogo começa no fim da cena.
  intro: () => [
    { caption: 'Interior do Rio Grande do Sul…', time: 2.4 },
    { view: 'galpao' }, { actor: 'sadi', x: ENTRY.x, y: ENTRY.y - 10, dx: -1 }, { fade: 'in', time: 1 },
    { say: 'sadi', text: 'Faz uns quinze anos que eu não piso aqui…' },
    { do: () => AudioEngine.creak() },
    { walk: 'sadi', to: { x: 800, y: 640 } },
    { say: 'sadi', text: 'Herdei esse galpão do meu velho vô, que foi pra outra morada.' },
    { do: () => fxPuffs(820, 600, 8, 120, '#d8c8a8') },
    { say: 'sadi', text: 'Ainda tem o cheiro de fumaça de fogo de chão.' },
    { walk: 'sadi', to: { x: 700, y: 610 } },
    { say: 'sadi', text: 'Ué… uma caixa velha. Tem uma carta aqui dentro.' },
    { overlay: 'letter' },
    { say: 'sadi', text: 'E uma foto do vô, atrás de um balcão…' },
    { overlay: 'photo' },
    { say: 'sadi', text: 'O vô era a minha cara… e tinha uma venda aqui! Esse galpão foi de tudo: construíram na época das tropeadas, depois virou CTG… e agora tá abandonado.' },
    { say: 'sadi', text: 'Vou revitalizar e realizar meu sonho: abrir minha própria bodega!' },
    { do: () => { fxPuffs(680, 640, 10, 160, '#d8c8a8'); AudioEngine.scrub(); setTimeout(() => AudioEngine.scrub(), 200); setTimeout(() => AudioEngine.scrub(), 400); } },
    { say: 'sadi', text: 'Primeiro, tirar a poeira de quinze anos…' },
    { do: () => [0, 260, 520].forEach(t => setTimeout(() => AudioEngine.thud(), t)) },
    { say: 'sadi', text: '…depois um balcão firme, que bodega sem balcão não é bodega.' },
    { fade: 'out', time: 1 }, { caption: 'Algumas semanas depois…', time: 2 },
    { overlay: 'news' },
    { view: 'bodega' }, { do: () => { G.player = { ...G.player, x: 800, y: 640, dx: 0, dy: 1, walk: false }; } }, { fade: 'in', time: .6 },
    { build: true },
    { say: 'sadi', text: 'Bodega pronta! Balcão, chapa, mesas… só falta uma coisa: mercadoria. Gastei tudo na reforma.' },
    { actor: 'valter', x: ENTRY.x, y: ENTRY.y, dx: -1 }, { do: () => AudioEngine.doorChime() },
    { walk: 'valter', to: { x: 900, y: 670 } },
    { say: 'valter', text: 'Ô de casa! Bodega nova e prateleira vazia, vivente?' },
    { say: 'sadi', text: 'Pois é, Valter. Não sobrou um pila pro estoque.' },
    { say: 'valter', text: 'Teu vô quase não comprava nada: o que ele vendia saía da terra e do curral. Do lado do galpão tem chão bom pra uma horta.' },
    { say: 'valter', text: 'De presente de inauguração te deixei no curral um boi gordo e a Mimosa, uma vaca de leite. As galinhas e as codornas do teu vô seguem lá, faceiras.' },
    { say: 'valter', text: 'Trouxe também erva da minha erveira e uns potes de conserva de codorna da patroa, pra tu não começar do zero.' },
    { say: 'sadi', text: 'Bah, Valter, nem sei como agradecer!' },
    { say: 'valter', text: 'Agradece trabalhando, guri! Primeiro: sementes. O Armazém Querência fica descendo a estrada. Compra alface e trigo, que eu te ensino o resto.' }
  ],
  // Fim do primeiro dia: o vizinho Valter traz uma TV de presente.
  tv: () => [
    { view: 'bodega' }, { fade: 'in', time: .4 },
    { actor: 'valter', x: ENTRY.x, y: ENTRY.y, dx: -1 }, { do: () => AudioEngine.doorChime() },
    { walk: 'valter', to: { x: clamp(G.player.x + 90, 120, W - 120), y: clamp(G.player.y, 470, 840) } },
    { say: 'valter', text: 'Opa, vizinho! Fechou o primeiro dia? Trouxe uma coisa pra ti.' },
    { say: 'valter', text: 'Uma TV! Bodega que se preze precisa passar os Gre-Nal. Ela fica guardada e vai pra parede em dia de jogo.' },
    { say: 'valter', text: 'Me criei junto com o teu pai, guri. Ver esse galpão aceso de novo me deixou faceiro.' },
    { say: 'valter', text: 'E amanhã cedo, antes de abrir: rega a horta, ração no cocho, ovo dos ninhos e leite da Mimosa. O pão sai do forno e o queijo do tacho.' },
    { say: 'sadi', text: 'Bah, Valter, muito obrigado! O primeiro Gre-Nal aqui é por conta da casa.' },
    { say: 'dica', text: 'Amizade rende presente! Atendendo bem, jogando truco ou bocha com os fregueses conhecidos, a amizade cresce e eles trazem presentes no fim do dia.' },
    { walk: 'valter', to: { x: ENTRY.x, y: ENTRY.y } }
  ],
  // Primeiro sábado: o costelão da inauguração e o boi que o pai deu.
  sabado: () => [
    { view: 'campo' }, { actor: 'sadi', x: 560, y: 640 }, { do: () => { scene.boi = { x: 740, y: 630, coat: 1 }; } }, { fade: 'in', time: 1 },
    { say: 'sadi', text: 'Pra comemorar minha inauguração, vou vender costelão amanhã!' },
    { say: 'sadi', text: 'Como incentivo, meu velho pai me deu um boi pra começar. Vou pôr ele no meu curral… mas antes preciso laçar ele.' },
    { fade: 'out', time: .7 }
  ],
  // Depois da primeira laçada: montando o costelão, e a dupla de Erechim confirma presença.
  montagem: () => [
    { view: 'campo' }, { do: () => { sceneForcesCampo = true; const c = campoState(); c.lit = false; c.fuel = 0; c.espetos = [null, null, null, null]; scene.stations = CAMPO_FIXED.filter(f => !f.unlock || G.up[f.unlock]); } },
    { actor: 'sadi', x: 540, y: 640 }, { fade: 'in', time: .8 },
    { say: 'sadi', text: 'Agora é montar o costelão: fogo de chão, espetos, tábua e a tigela da maionese.' },
    { build: true },
    { actor: 'marcio', x: W + 60, y: 660, dx: -1 }, { actor: 'marcelo', x: W + 120, y: 690, dx: -1 },
    { walk: ['marcio', 'marcelo'], to: [{ x: 680, y: 650 }, { x: 760, y: 680 }] },
    { say: 'marcio', text: 'E o quê? Vai ter carnage e cervejada? Presença de Márcio e Marcelo confirmada no evento!' },
    { say: 'marcelo', text: 'É o quê? Show de bola!' },
    { fade: 'out', time: .8 }
  ]
};

function playScene(id, onEnd) { playSteps(SCENES[id](), id, onEnd); }
// Cena montada na hora (arcos dos personagens).
function playSteps(steps, id, onEnd) {
  if (modal) closeDialog(true); if (phoneOpen) togglePhone(false);
  scene = { id, steps, i: -1, t: 0, step: null, actors: {}, view: 'black', fade: 1, built: 0, onEnd };
  keys.clear(); document.body.classList.add('intro-playing'); $('sceneSkip').classList.remove('hidden');
  AudioEngine.sceneQuiet = true; sceneAdvance();
}
// Executa os passos instantâneos até chegar num que espera (fala, caminhada, fade, tempo…).
function sceneAdvance() {
  const s = scene;
  while (s && scene === s) {
    s.i++; s.t = 0; s.step = null; const st = s.steps[s.i];
    if (!st) { endScene(); return; }
    if (st.view) { s.view = st.view; continue; }
    if (st.actor) { const { actor, ...extra } = st; s.actors[actor] = { ...extra, dx: st.dx ?? 1, walk: false }; continue; }
    if (st.do) { st.do(); continue; }
    s.step = st;
    if (st.say) showRpgBox('sceneTalk', { ...sceneSpeaker(st.say), player: '', reply: st.text });
    if (st.overlay) { if (st.overlay === 'photo') $('scenePhotoFace').innerHTML = portraitFromSprite(avatarSprite(), 150);
      if (st.overlay === 'note') $('sceneNoteText').innerHTML = st.text;
      if (st.overlay === 'news') { NEWS_DEFAULT ??= [$('sceneNewsHead').textContent, $('sceneNewsBody').textContent]; $('sceneNewsHead').textContent = st.headline || NEWS_DEFAULT[0]; $('sceneNewsBody').textContent = st.body || NEWS_DEFAULT[1]; } $(SCENE_OVERLAYS[st.overlay]).classList.remove('hidden'); AudioEngine.paper(); }
    if (st.build) s.built = 0;
    return;
  }
}
const SCENE_OVERLAYS = { letter: 'sceneLetter', news: 'sceneNews', photo: 'scenePhoto', note: 'sceneNote' };
function hideSceneOverlays() { for (const id of Object.values(SCENE_OVERLAYS)) $(id).classList.add('hidden'); }
function sceneSpeaker(who) {
  if (who === 'dica') return { portrait: '<span class="portrait portrait-phone" style="width:104px;height:104px">💡</span>', name: 'Dica' };
  if (who === 'fornecedor') return { portrait: '<span class="portrait portrait-phone" style="width:104px;height:104px">📞</span>', name: 'Atacado · telefone' };
  if (who === 'sadi') return { portrait: portraitFromSprite(avatarSprite(), 104), name: PEOPLE.find(p => p.id === G.avatarId)?.name || 'Sadi' };
  const i = PEOPLE.findIndex(p => p.id === who); return { person: i, name: PEOPLE[i]?.name || who };
}
function sceneNext() {
  const s = scene, st = s?.step; if (!st) return;
  if (st.say) { if (rpgTyping('sceneTalk')) { finishRpgTyping('sceneTalk'); return; } showRpgBox('sceneTalk', null); sceneAdvance(); }
  else if (st.overlay) { hideSceneOverlays(); sceneAdvance(); }
}
function sceneSkip() { if (scene) endScene(); return true; }
function endScene() {
  const done = scene?.onEnd; scene = null; sceneForcesCampo = false; AudioEngine.sceneQuiet = false;
  showRpgBox('sceneTalk', null); hideSceneOverlays();
  document.body.classList.remove('intro-playing'); $('sceneSkip').classList.add('hidden');
  AudioEngine.loop('wind', 0, { type: 'bandpass', freq: 500, q: .5 });
  if (done) done();
}
function sceneKey(e) {
  const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
  if (['e', ' ', 'Enter'].includes(key)) { e.preventDefault(); if (!e.repeat) sceneNext(); }
  else if (key === 'Escape') sceneSkip();
}

function sceneTick(dt) {
  const s = scene, st = s.step; s.t += dt;
  AudioEngine.loop('wind', ['galpao', 'campo'].includes(s.view) ? .03 : 0, { type: 'bandpass', freq: 500, q: .5 });
  const sadi = s.actors.sadi; if (sadi && s.view !== 'bodega' && s.view !== 'world') G.player = { ...G.player, x: sadi.x, y: sadi.y, dx: sadi.dx, walk: sadi.walk };
  fxTick(dt);
  if (!st) return;
  if (st.fade) { const k = clamp(s.t / st.time, 0, 1); s.fade = st.fade === 'in' ? 1 - k : k; if (k >= 1) sceneAdvance(); }
  else if (st.walk) {
    const ids = [].concat(st.walk), targets = [].concat(st.to); let moving = false;
    ids.forEach((id, n) => { const a = s.actors[id], to = targets[n], d = Math.hypot(to.x - a.x, to.y - a.y); a.walk = d > 3; if (d > 3) { moving = true; const k = Math.min(d, (a.speed || 150) * dt); a.dx = to.x < a.x ? -1 : 1; a.dy = Math.abs(to.y - a.y) > Math.abs(to.x - a.x) ? Math.sign(to.y - a.y) : 0; a.x += (to.x - a.x) / d * k; a.y += (to.y - a.y) / d * k; } });
    if (!moving) sceneAdvance();
  }
  else if ((st.wait && s.t >= st.wait) || (st.caption && s.t >= st.time)) sceneAdvance();
  else if (st.build) {
    // as estações surgem uma a uma, com poeira e martelada
    const list = s.view === 'bodega' ? furniture() : s.stations, due = Math.min(list.length, Math.floor((s.t - .4) / .14));
    while (s.built < due) { const f = list[s.built++]; fxPuffs(f.x + f.w / 2, f.y + f.h / 2, 5, 90, '#e8dcc0'); if (s.built % 3 === 1) AudioEngine.thud(); }
    if (s.built >= list.length && s.t > .4 + list.length * .14 + .7) { AudioEngine.ready(); sceneAdvance(); }
  }
}

// ---------- Desenho ----------
function drawSceneActors(list = []) {
  const s = scene;
  for (const [id, a] of Object.entries(s.actors)) list.push({ y: a.y, draw: () => id === 'sadi' ? personDraw(avatarSprite(), a.x, a.y, a.walk, true, a.dx) : personDraw(PEOPLE[PEOPLE.findIndex(p => p.id === id)].sprite, a.x, a.y, a.walk, false, a.dx) });
  list.sort((a, b) => a.y - b.y).forEach(l => l.draw());
}
// Galpão abandonado: chão vazio, poeira no ar, luz pela janela, teias e a caixa velha.
function drawGalpao() {
  beginWorld();
  if (roomArt.complete && roomArt.naturalWidth) { ctx.imageSmoothingEnabled = false; ctx.drawImage(roomArt, 0, 0, W, H); ctx.imageSmoothingEnabled = true; }
  rect(0, 0, W, H, 'rgba(40,28,16,.38)');
  ctx.save(); ctx.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 3; i++) { const x0 = roomX(1110 + i * 110), x1 = x0 + roomX(70); ctx.fillStyle = `rgba(255,226,160,${.07 + .02 * Math.sin(frameClock * .7 + i)})`; ctx.beginPath(); ctx.moveTo(x0, roomY(130)); ctx.lineTo(x1, roomY(130)); ctx.lineTo(x1 - 260, H); ctx.lineTo(x0 - 330, H); ctx.closePath(); ctx.fill(); }
  ctx.restore();
  for (let i = 0; i < 46; i++) { const x = (i * 137.3 + frameClock * (6 + i % 5)) % W, y = (i * 71.9 + Math.sin(frameClock * .6 + i) * 30 + 900) % H; ellipse(x, y, 1.6, 1.6, `rgba(255,236,190,${.25 + .2 * Math.sin(frameClock * 2 + i)})`); }
  ctx.strokeStyle = 'rgba(230,225,210,.25)'; ctx.lineWidth = 1;
  for (const [cx, cy, sx] of [[0, 0, 1], [W, 0, -1]]) for (let k = 1; k <= 4; k++) { ctx.beginPath(); ctx.arc(cx, cy, k * 22, sx > 0 ? 0 : Math.PI / 2, sx > 0 ? Math.PI / 2 : Math.PI); ctx.stroke(); }
  // caixa velha do vô
  ellipse(640, 618, 34, 8, '#1c140c55'); wood(608, 572, 64, 44, true); rect(604, 566, 72, 10, '#7a5230', 2, '#3a2616'); rect(616, 584, 48, 3, '#3a2616');
  drawSceneActors();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
// Campo: rebanho, quero-queros no céu e no chão e, na montagem, as estações aparecendo.
function drawSceneCampo() {
  const s = scene; beginWorld(); drawCampoBackground();
  if (s.stations) for (const f of s.stations.slice(0, s.built >= 0 && s.step?.build ? s.built : s.i > s.steps.findIndex(x => x.build) ? s.stations.length : 0)) furnitureDraw(f);
  if (s.boi) { ellipse(s.boi.x, s.boi.y + 2, 40, 9, '#1c140c44'); drawBoi(s.boi.coat, Math.floor(frameClock * 2) % 2 ? 2 : 0, s.boi.x, s.boi.y, 1.6, true); }
  for (let i = 0; i < 2; i++) { const x = ((frameClock * 90 + i * 700) % (W + 300)) - 150, y = 210 + i * 60 + Math.sin(frameClock * 2 + i) * 14; drawQuero(Math.floor(frameClock * 9 + i) % 2 ? 1 : 2, x, y, 1.6, false); }
  drawQuero(0, 1180 + Math.sin(frameClock * .4) * 30, 690, 1.6, Math.sin(frameClock * .4) < 0, Math.sin(frameClock * 3) > .8 ? .4 : 0);
  drawSceneActors(); drawFx(); ctx.setTransform(1, 0, 0, 1, 0, 0);
}
function drawScene() {
  if (!scene) return;
  const s = scene, cw = canvas.width, ch = canvas.height;
  if (s.step?.caption) {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, ch);
    ctx.globalAlpha = clamp(Math.min(s.t / .5, (s.step.time - s.t) / .5), 0, 1); ctx.fillStyle = '#f1e6c8'; ctx.font = `italic ${Math.round(ch / 20)}px Georgia, serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(s.step.caption, cw / 2, ch / 2); ctx.globalAlpha = 1;
  } else {
    if (s.view === 'galpao') drawGalpao(); else if (s.view === 'campo') drawSceneCampo();
    else if (s.view === 'bodega') { draw(); ctx.setTransform(1, 0, 0, 1, 0, 0); }
    else if (SCENE_VIEWS[s.view]) SCENE_VIEWS[s.view]();
    else { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, ch); }
    if (s.fade > 0) { ctx.fillStyle = `rgba(0,0,0,${s.fade})`; ctx.fillRect(0, 0, cw, ch); }
  }
  const bar = Math.round(ch * .07); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, cw, bar); ctx.fillRect(0, ch - bar, cw, bar);
}

// Na bodega montada, quem participa da cena entra na mesma ordem de profundidade do salão.
function sceneLayers(layers) {
  if (scene?.view !== 'bodega') return;
  for (const [id, a] of Object.entries(scene.actors)) if (id !== 'sadi') layers.push({ y: a.y, draw: () => personDraw(PEOPLE[PEOPLE.findIndex(p => p.id === id)].sprite, a.x, a.y, a.walk, false, a.dx) });
}
// Jogo novo começa pela introdução; no fim, o tutorial do primeiro dia.
function startIntro() { playScene('intro', () => { G.player = { ...G.player, x: 520, y: 720, dx: 0, dy: 1, walk: false }; save(); welcome(); }); }
