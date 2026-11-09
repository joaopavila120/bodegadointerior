// As fogueiras do caminho até a fortaleza, como os acampamentos da mata adentro: perto do fogo bicho nenhum ataca, e
// descansar enche a vida. A primeira vez que o Sadi descansa numa, ela fica acesa: do acampamento do Griggs, no trapiche,
// dá pra ir direto pra qualquer fogueira acesa (e de cada uma, voltar pro trapiche).
//   · Trecho 2 da cerração, a fogueira do monge: João Maria, o monge andarilho que benzia as fontes e plantava cruz de
//     cedro pelos sertões de Santa Catarina, do Paraná e do Rio Grande nos anos 1840. Depois da prosa, benze uma reza
//     de sal e arruda pro bornal a cada dia que o Sadi descansa numa fogueira da ilha.
//   · Trecho 5 da cerração: uma fogueira de pouso, sem ninguém.
//   · No alto da ilha, na frente da fortaleza: o acampamento do general David Canabarro (Laguna e a República Juliana,
//     em 1839; Ponche Verde, em 1845). Conta quem é o Grenfell e que só o arpão tira ele da muralha. Os soldados dele
//     deixam cartucho de carabina a cada dia que o Sadi descansa numa fogueira da ilha.
// Como na mata, os presentes nunca mexem em dano, vida ou resistência.
'use strict';

const ILHA_FOGOS = [
  { id: 'monge', map: 'ilhamato', n: 2, name: 'Fogueira do monge', folk: 'joaomaria' },
  { id: 'pouso', map: 'ilhamato', n: 5, name: 'Fogueira da cerração' },
  { id: 'cerco', map: 'ilha', x: 2720, y: 1860, rx: 270, ry: 170, name: 'Acampamento do Canabarro', folk: 'canabarro' }
];
const ILHA_FOGO_PRESENTE = { cartuchos: 4 };
function ilhaFogoCamp(f) { return f.map === 'ilha' ? f : ilhaMatoLayout(f.n).camp; }
// A fogueira do mapa (e do trecho) onde o Sadi está, ou null.
function ilhaFogoAqui() {
  const m = worldOut?.map; if (m === 'ilha') return ILHA_FOGOS.find(f => f.map === 'ilha');
  if (m === 'ilhamato') { const n = ilhaState().trecho || 1; return ILHA_FOGOS.find(f => f.n === n) || null; }
  return null;
}
function ilhaFogoSeguro(x, y) { const f = ilhaFogoAqui(), c = f && ilhaFogoCamp(f); return !!c && ((x - c.x) / (c.rx * 1.05)) ** 2 + ((y - c.y) / (c.ry * 1.05)) ** 2 < 1; }
function ilhaFogoPartes(c) { return { fogo: { x: c.x - 60, y: c.y + 30 }, barraca: { x: c.x + 110, y: c.y - 10 }, folk: { x: c.x - 220, y: c.y + 10 } }; }
function ilhaFogoSolido(x, y) {
  const f = ilhaFogoAqui(); if (!f) return false; const P = ilhaFogoPartes(ilhaFogoCamp(f));
  return Math.hypot(x - P.fogo.x, (y - P.fogo.y) * 1.6) < 42 || x > P.barraca.x - 72 && x < P.barraca.x + 72 && y > P.barraca.y - 34 && y < P.barraca.y + 4;
}
function ilhaFogoAceso(id) { return !!ilhaState().fogos?.[id]; }
// Quem mora na fogueira (o Canabarro, depois da volta pro pinheiral, fica com o Giuseppe).
function ilhaFogoFolk(f) { return f.folk === 'canabarro' && ilhaState().contou ? null : f.folk || null; }

// ---------- O monge João Maria (desenhado como os encantados da mata) ----------
const JOAO_MARIA_LOOK = { skin: '#e2b48c', hair: '#ece8de', style: 'long', mustache: true, shirt: '#7a6040', skirt: '#6a5236', boots: '#8a6a40' };
let joaoMariaCanvas = null, joaoMariaURL = null;
function joaoMariaArte() {
  if (joaoMariaCanvas) return joaoMariaCanvas;
  const c = document.createElement('canvas'); c.width = 240; c.height = 460; const main = ctx; ctx = c.getContext('2d');
  try {
    ctx.translate(120, 440); ctx.scale(2, 2); paintFolk(JOAO_MARIA_LOOK);
    // A barba branca comprida e o cajado com a cruz de cedro.
    ctx.lineJoin = 'round'; ctx.fillStyle = '#f0ece4'; ctx.strokeStyle = '#1c130c'; ctx.lineWidth = 1.4;
    ctx.beginPath(); ctx.moveTo(-14, -114); ctx.quadraticCurveTo(-16, -94, -6, -80); ctx.lineTo(0, -74); ctx.lineTo(6, -80); ctx.quadraticCurveTo(16, -94, 14, -114); ctx.quadraticCurveTo(0, -104, -14, -114); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = 'rgba(150,140,120,.6)'; ctx.lineWidth = 1; for (const x of [-6, 0, 6]) { ctx.beginPath(); ctx.moveTo(x, -106); ctx.lineTo(x * .6, -82); ctx.stroke(); }
    ctx.fillStyle = '#8a5a30'; ctx.fillRect(23, -150, 4, 148); ctx.fillRect(15, -140, 20, 4); ctx.strokeStyle = '#1c130c'; ctx.lineWidth = 1.2; ctx.strokeRect(23, -150, 4, 148); ctx.strokeRect(15, -140, 20, 4);
  } finally { ctx = main; }
  return joaoMariaCanvas = c;
}
function drawJoaoMaria(x, y, dx = 1) {
  const falando = talkState?.lines?.[talkState.i]?.[0]?.name === 'João Maria';
  if (ACTION_ART_CROPS.joaomaria && historyFigure('joaomaria', x, y, 1, dx, false, 0, falando)) { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 90, 80, .1, '255,230,170'); ctx.restore(); return; }
  const c = joaoMariaArte(); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 90, 90, .12, '255,230,170'); ctx.restore();
  ellipse(x, y + 3, 24, 7, 'rgba(10,14,8,.3)'); ctx.save(); ctx.translate(x, y); if (dx < 0) ctx.scale(-1, 1); ctx.drawImage(c, -60, -220, 120, 230); ctx.restore();
}
function joaoMariaPortrait(size = 104) {
  const sheet = ACTION_ART_CROPS.joaomaria, r = sheet?.frames[0];
  if (r) { const h = sheet.reference * .39, x = r[0] + r[4] - h / 2, y = r[1] + r[5] - sheet.reference; return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px;overflow:hidden"><svg width="${size}" height="${size}" viewBox="${x} ${y} ${h} ${h}"><image href="assets/images/future-characters/${sheet.image}" width="${sheet.size[0]}" height="${sheet.size[1]}"/></svg></span>`; }
  if (!joaoMariaURL) { const c = document.createElement('canvas'); c.width = c.height = 96; const g = c.getContext('2d'); g.fillStyle = '#5a4a36'; g.fillRect(0, 0, 96, 96); g.drawImage(joaoMariaArte(), 60, 126, 120, 120, 0, 0, 96, 96); try { joaoMariaURL = c.toDataURL(); } catch (_) { return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px">✝️</span>`; } }
  return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px;display:grid;place-items:center;overflow:hidden"><img src="${joaoMariaURL}" width="${size}" height="${size}" alt=""></span>`;
}

// ---------- O general David Canabarro e o monge João Maria (sprites prontos em assets/images/future-characters) ----------
{
  const monge = typeof FUTURE_CHARACTER_SPRITES === 'object' && FUTURE_CHARACTER_SPRITES['monge-joao-maria'];
  if (monge) { ACTION_ART_CROPS.joaomaria = monge; FOLK_ART_SIZE.joaomaria = monge.displayHeight || 126; const im = ACTION_ART.joaomaria = new Image(); im.src = 'assets/images/future-characters/' + monge.image; }
  const meta = typeof FUTURE_CHARACTER_SPRITES === 'object' && FUTURE_CHARACTER_SPRITES['david-canabarro'];
  if (meta) {
    ACTION_ART_CROPS.canabarro = meta; FOLK_ART_SIZE.canabarro = meta.displayHeight || 132; SPIRIT_IDS.add('canabarro');
    const im = ACTION_ART.canabarro = new Image(); im.src = 'assets/images/future-characters/' + meta.image;
  }
}
function canabarroPortrait(size = 104) {
  const sheet = ACTION_ART_CROPS.canabarro, r = sheet?.frames[0]; if (!r) return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px">🎖️</span>`;
  const h = sheet.reference * .39, x = r[0] + r[4] - h / 2, y = r[1] + r[5] - sheet.reference;
  return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px;overflow:hidden"><svg width="${size}" height="${size}" viewBox="${x} ${y} ${h} ${h}"><image href="assets/images/future-characters/${sheet.image}" width="${sheet.size[0]}" height="${sheet.size[1]}"/></svg></span>`;
}
function drawCanabarro(x, y, dx = 1) {
  const falando = talkState?.lines?.[talkState.i]?.[0]?.name === ILHA_FOLKS.canabarro.name;
  if (!historyFigure('canabarro', x, y, 1, dx, false, 0, falando)) { ellipse(x, y + 3, 24, 7, 'rgba(10,14,8,.3)'); rect(x - 16, y - 110, 32, 110, '#22283a', 8); }
}

// ---------- A prosa ----------
const ILHA_FOLKS = {
  joaomaria: { name: 'João Maria', origin: 'O monge andarilho dos sertões do Sul', portrait: joaoMariaPortrait, draw: drawJoaoMaria,
    perk: 'Reza do monge: a cada dia que tu descansar numa fogueira da ilha (ou no fogo do trapiche), ele benze uma reza de sal e arruda pro teu bornal.' },
  canabarro: { name: 'David Canabarro', origin: 'Alma do general farroupilha', portrait: canabarroPortrait, draw: drawCanabarro,
    perk: 'Munição farrapa: a cada dia que tu descansar numa fogueira da ilha (ou no fogo do trapiche), os soldados dele deixam ' + ILHA_FOGO_PRESENTE.cartuchos + ' cartuchos de carabina.' }
};
function ilhaFolkSpeaker(id) { const f = ILHA_FOLKS[id]; return { name: f.name, portrait: f.portrait(72) }; }
const ILHA_FOLK_MEET = {
  joaomaria: [
    ['sadi', 'Um velho de barba branca, sozinho no meio da cerração… e o fogo dele nem treme com o vento.'],
    ['joaomaria', 'Paz e bem, filho. Senta, que o fogo é de todos.'],
    ['joaomaria', 'Me chamam de João Maria. Ando a pé por estes sertões de Santa Catarina, do Paraná e do Rio Grande, de pouso em pouso.'],
    ['joaomaria', 'Não peço nada a ninguém: benzo a água das fontes, ensino remédio do mato e planto cruz de cedro onde o povo precisa de reza.'],
    ['sadi', 'E o que um homem santo faz numa ilha cheia de bruxa?'],
    ['joaomaria', 'Santo não, filho: sou um velho que anda. Vim porque a cerração anda comendo a ilha, e pescador nenhum dorme mais.'],
    ['joaomaria', 'Tu vai subir até a fortaleza? Então volta pro fogo sempre que precisar. Cada vez que tu descansar, eu benzo uma reza pro teu bornal.']
  ],
  canabarro: [
    ['sadi', 'Fogo aceso na porta da fortaleza… e um oficial farrapo de casaca!'],
    ['canabarro', 'Devagar, gaúcho, que a muralha tem olho. General David Canabarro, do exército da República Rio-Grandense.'],
    ['canabarro', 'Em 1839, eu e o Garibaldi tomamos Laguna e fizemos a República Juliana. Agora vim atrás do Bento, que nem tu.'],
    ['canabarro', 'Quem manda lá dentro é o Grenfell, inglês, almirante do Império. Foi ele que encurralou o Bento na Ilha do Fanfa, em 1836.'],
    ['canabarro', 'O Grenfell não briga no chão quando pode brigar de cima: sobe na muralha e manda os canhões atirarem. Lá em cima, nem facão nem bala alcança.'],
    ['canabarro', 'Leva o arpão do Griggs. Arpoa o inglês e puxa ele da muralha que nem peixe: no chão, ele é gente como a gente.'],
    ['sadi', 'Pois eu puxo.'],
    ['canabarro', 'E munição não te falta: os meus deixam cartucho de carabina em toda fogueira que tu descansar nesta ilha.']
  ]
};
const ILHA_FOLK_LORE = {
  joaomaria: [
    [['joaomaria', 'Onde eu paro, deixo uma cruz de cedro e uma fonte benzida. O povo chama de olho-d\'água de São João Maria.'], ['sadi', 'São João Maria?'], ['joaomaria', 'Coisa do povo, filho. Quem faz o milagre é a fé de quem bebe a água.']],
    [['joaomaria', 'Remédio do mato não falha: marcela pro estômago, carqueja pro fígado, arruda pra quebranto.'], ['joaomaria', 'O Griggs, lá no trapiche, sabe pouco de reza, mas sabe muito de arruda. Leva sal e arruda pra ele.']],
    [['joaomaria', 'As bruxas da ilha eram moças daqui, dizem. A cerração é que endureceu o coração delas.'], ['joaomaria', 'Não tem raiva delas, filho. Tem cuidado.']]
  ],
  canabarro: [
    [['canabarro', 'Laguna foi bonita enquanto durou: o Seival e o Rio Pardo atravessando o campo em cima de carreta, puxados a boi.'], ['canabarro', 'Quatro meses de República Juliana. Depois o Império voltou com tudo, e a Anita saiu de lá a cavalo, no meio do fogo.']],
    [['sadi', 'O Lanceiro Negro me falou de Porongos, general.'], ['canabarro', 'Porongos é ferida que não fecha, gaúcho. Até hoje se discute o que aconteceu naquela madrugada.'], ['canabarro', 'Os lanceiros foram os mais valentes desta guerra. Mereciam ter visto a paz.']],
    [['canabarro', 'Fui eu que assinei a paz de Ponche Verde, em 1845, depois de dez anos de guerra. Anistia pra todo farrapo.'], ['canabarro', 'Só que tem marinheiro do Império que nunca aceitou a paz. E esses voltaram na cerração.']]
  ]
};
function ilhaFolkFala(lines) { return lines.map(([who, text]) => [ILHA_FOLKS[who] ? ilhaFolkSpeaker(who) : who, text]); }
function ilhaFolkMeet(f) {
  const st = ilhaState(), fk = ILHA_FOLKS[f.folk]; st.folks ??= {}; if (st.folks[f.folk]) return; st.folks[f.folk] = G.day; keys.clear(); mataXP(20); save();
  const rw = { xp: 40, cash: 30 };
  talk(ilhaFolkFala(ILHA_FOLK_MEET[f.folk]), () => { grantReward(rw); talk([['card', `<b>🔥 ${fk.name}</b><br>${fk.perk}`, f.name], ['reward', rw, 'Prosa na fogueira']], f.folk === 'joaomaria' ? () => mongeEnsina() : null, 'Valeu'); }, 'Continuar');
}
function ilhaFolkTalk(f) {
  const st = ilhaState(), lore = ILHA_FOLK_LORE[f.folk]; st.lore ??= {}; const k = (st.lore[f.folk] || 0) % lore.length; st.lore[f.folk] = (st.lore[f.folk] || 0) + 1; save();
  talk(ilhaFolkFala(lore[k]), null, 'Valeu, ' + ILHA_FOLKS[f.folk].name.split(' ')[0]);
}

// ---------- Descansar, acender e ir de fogueira em fogueira ----------
// Um presente de cada amigo por dia, em qualquer fogueira da ilha (e no fogo do trapiche).
function ilhaFogoPresentes() {
  const st = ilhaState(), folks = st.folks || {}, bag = mataBag(), out = [];
  if (folks.joaomaria && st.rezaDia !== G.day && (bag.reza || 0) < mataBagMax()) { st.rezaDia = G.day; bag.reza = (bag.reza || 0) + 1; mataBeltRefresh(); out.push('+1 🙏 reza do monge'); }
  if (folks.canabarro && st.cartuchoDia !== G.day && rangedOwned('carabina')) { st.cartuchoDia = G.day; carabinaAdd(ILHA_FOGO_PRESENTE.cartuchos); out.push('+' + ILHA_FOGO_PRESENTE.cartuchos + ' cartuchos de carabina'); }
  out.forEach((t, i) => effect(t, worldOut.x, worldOut.y - 160 - i * 26, '#ffe2a6', 16)); if (out.length) save();
}
function ilhaFogoDescansa(f) {
  const st = ilhaState(), novo = !ilhaFogoAceso(f.id); st.fogos ??= {}; st.fogos[f.id] = G.day;
  caveState().hp = caveMaxHp(); mataBuffs.veneno = 0; AudioEngine.ready?.(); effect('Vida cheia', worldOut.x, worldOut.y - 130, '#d8ffac', 18); save();
  ilhaFogoPresentes();
  if (novo) talk([['card', `<b>🔥 ${f.name}</b><br>Fogo aceso, um mate e a vida cheia. Agora esta fogueira fica acesa: do acampamento do John Griggs, no trapiche, dá pra vir direto pra cá.`, 'Ilha da Fortaleza']], null, 'Bah, que beleza');
}
function ilhaFogoVai(f) {
  const c = ilhaFogoCamp(f), P = ilhaFogoPartes(c), to = { x: P.fogo.x + 90, y: P.fogo.y + 60, title: f.name, text: 'Pela trilha dos farrapos, escondida na cerração.' };
  mataNight = null; switchMap(f.map === 'ilha' ? { map: 'ilha', ...to } : { map: 'ilhamato', n: f.n, ...to });
}
function ilhaFogoEscolhe() {
  const acesos = ILHA_FOGOS.filter(f => ilhaFogoAceso(f.id));
  if (!acesos.length) { talk([[griggsSpeaker(), 'Ainda não tem fogueira acesa no caminho, gaúcho. Descansa numa quando achar, que daí eu te mostro a trilha dos farrapos até ela.']], null, 'Tá certo'); return; }
  talkChoose([[griggsSpeaker(), 'A trilha dos farrapos passa escondida na cerração. Pra qual fogueira tu vai?']], [...acesos.map(f => [f.name + (f.map === 'ilhamato' ? ' · trecho ' + f.n : ' · alto da ilha'), () => ilhaFogoVai(f)]), ['Agora não']], acesos.length);
}
function drawIlhaFogo(f, seen, layers) {
  const c = ilhaFogoCamp(f); if (!c || !seen(c.x, c.y, 600)) return; const P = ilhaFogoPartes(c);
  layers.push({ y: c.y + 20, draw: () => drawTrechoCamp({ camp: c }) });
  if (ilhaFogoFolk(f) && !scene) { const fk = ILHA_FOLKS[f.folk]; layers.push({ y: P.folk.y, draw: () => fk.draw(P.folk.x, P.folk.y, worldOut.x < P.folk.x ? -1 : 1) }); }
}
function ilhaFogoSpots(f, list) {
  const P = ilhaFogoPartes(ilhaFogoCamp(f));
  list.push({ id: 'fogo:' + f.id, x: P.fogo.x, y: P.fogo.y + 70, radius: 110, label: 'Descansar na fogueira', act: () => ilhaFogoDescansa(f) });
  if (ilhaFogoAceso(f.id)) list.push({ id: 'fogo:volta:' + f.id, x: P.barraca.x, y: P.barraca.y + 40, radius: 100, label: 'Voltar pro trapiche (trilha dos farrapos)', act: () => { mataNight = null; switchMap({ map: 'ilha', ...ILHA.arrive, title: 'Trapiche da ilha', text: 'Pela trilha dos farrapos, de volta pro barco do seu Nereu.' }); } });
  if (ilhaFogoFolk(f) && ilhaState().folks?.[f.folk]) list.push({ id: 'folk:' + f.folk, x: P.folk.x, y: P.folk.y, radius: 110, label: 'Prosear com ' + ILHA_FOLKS[f.folk].name, act: () => ilhaFolkTalk(f) });
}

// ---------- Ligações ----------
{
  const fogoMapa = f => f.map === 'ilha' ? WORLD_MAPS.ilha : WORLD_MAPS.ilhamato;
  for (const M of [WORLD_MAPS.ilha, WORLD_MAPS.ilhamato]) {
    const walk = M.canWalk, spots = M.spots, draw = M.draw;
    M.canWalk = function (x, y) { return walk.call(this, x, y) && !(worldOut?.map === this.id && ilhaFogoSolido(x, y)); };
    M.spots = function () { const list = spots.call(this), f = ilhaFogoAqui(); if (f && fogoMapa(f) === this) ilhaFogoSpots(f, list); if (this.id === 'ilha') list.push({ id: 'ilha:fogueiras', x: GRIGGS.tent.x, y: GRIGGS.tent.y + 50, radius: 90, label: 'Ir pra uma fogueira acesa (trilha dos farrapos)', act: ilhaFogoEscolhe }); return list; };
    M.draw = function (view, seen, layers) {
      draw.call(this, view, seen, layers); const f = ilhaFogoAqui(); if (!f || fogoMapa(f) !== this) return; drawIlhaFogo(f, seen, layers);
      // O clarão do fogo por cima do escuro da cerração.
      const c = ilhaFogoCamp(f), P = ilhaFogoPartes(c);
      layers.push({ y: 9e9, draw: () => { if (scene) return; ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(P.fogo.x, P.fogo.y - 20, 330, .2 + .04 * Math.sin(frameClock * 9), '255,150,60'); glow(P.fogo.x, P.fogo.y - 30, 120, .3, '255,190,110'); ctx.restore(); } });
    };
  }
  // Perto do fogo, bicho nenhum ataca nem nota o Sadi.
  const safeNow = ilhaSafeNow; ilhaSafeNow = function (p) { return safeNow(p) || ilhaFogoSeguro(p.x, p.y); };
  const safe = ilhaSafe; ilhaSafe = function (x, y) { return safe(x, y) || worldOut?.map === 'ilha' && ilhaFogoSeguro(x, y); };
  const hurt = mataHurt; mataHurt = function (dmg, from) { if (ilhaAqui() && worldOut && ilhaFogoSeguro(worldOut.x, worldOut.y)) return; return hurt(dmg, from); };
  // O fogo do trapiche também conta pros presentes do dia.
  const rest = ilhaDescansa; ilhaDescansa = function () { rest(); ilhaFogoPresentes(); };
  // Chegou perto de quem mora no fogo: a primeira prosa.
  const tick = outsideTick; outsideTick = function (dt) {
    tick(dt); if (!ilhaAqui() || scene || modal || worldTalkOpen()) return;
    const f = ilhaFogoAqui(); if (!f || !ilhaFogoFolk(f) || ilhaState().folks?.[f.folk]) return;
    const P = ilhaFogoPartes(ilhaFogoCamp(f)); if (Math.hypot(worldOut.x - P.folk.x, worldOut.y - P.folk.y) < 330) ilhaFolkMeet(f);
  };
}
