// Folclore à noite: de vez em quando, depois de fechar, aparece uma entidade pelo mapa. Chegando perto, uma cena e um
// confronto; quem vence ganha recompensa e, na primeira vez, uma lembrança para a estante da bodega.
//   · Lobisomem (Fronteira, só nas sextas): esquivar do bote, afastar com o tição e espetar com a faca benta.
//   · Sanguanel (Serra, entre as parreiras): o duende da colônia italiana pega o chapéu e desafia com adivinhas.
//   · Boitatá (Fronteira, no banhado): a cobra de fogo que protege o campo; abafar o capim e fechar os olhos.
//   · Mula sem Cabeça (Serra, perto da igreja, só nas quintas): esconder as unhas, segurar firme e arrancar o freio de ferro.
'use strict';

// Lugares afastados de placas, casas e lojas, para o E pegar a entidade e não outra coisa.
const FOLK = {
  lobisomem: { map: 'vila', name: 'Lobisomem', icon: '🐺', spots: [[1500, 1720], [2940, 2320], [1260, 2140], [2220, 1300]], label: 'Um uivo no mato…', relic: 'ticao',
    ok: () => calendar().weekday === 4 },
  sanguanel: { map: 'serra', name: 'Sanguanel', icon: '🧢', spots: [[2280, 1240], [2040, 2080], [2760, 1060], [1860, 820]], label: 'Uma risadinha entre as parreiras…', relic: 'fita',
    ok: () => !regionLocked('serra') },
  boitata: { map: 'vila', name: 'Boitatá', icon: '🔥', spots: [[780, 1000], [720, 1060], [1080, 880]], label: 'Uma luz serpenteando no banhado…', relic: 'escama', ok: () => true },
  mula: { map: 'serra', name: 'Mula sem Cabeça', icon: '🐴', spots: [[600, 1120], [960, 2260]], label: 'Um tropel e um clarão perto da igreja…', relic: 'freio',
    ok: () => !regionLocked('serra') && calendar().weekday === 3 }
};
function folkState() { return (G.folk ??= {}); }
function frac(x) { return x - Math.floor(x); }
// Quem aparece hoje (no máximo um por noite, raro): nunca em noite de evento nem na noite do guri da vela.
function folkTonight() {
  if (G.phase !== 'closed' || !G.tutorial?.complete || prologueActive() || mapEventToday() || negrinhoTonight()) return null;
  const st = folkState(); if (st.day === G.day && st.done) return null;
  if (G.folkNight?.day === G.day) return G.folkNight.id;
  if (bodegaDays() < 6) return null;
  const pool = Object.keys(FOLK).filter(id => FOLK[id].ok()), h = frac(Math.sin(G.day * 91.7 + 3.1) * 43758.5453);
  const weekly = pool.find(id => id === 'lobisomem' || id === 'mula');   // sexta é do lobisomem, quinta é da mula
  if (!pool.length || h > (weekly ? .4 : .2)) return null;
  return weekly && h < .25 ? weekly : pool[Math.floor(frac(Math.sin(G.day * 12.3) * 999) * pool.length)];
}
function folkSpot(id) {
  const F = FOLK[id], M = WORLD_MAPS[F.map], list = F.spots.filter(([x, y]) => M.canWalk(x, y)), [x, y] = list[G.day % list.length] || F.spots[0];
  return { x: x + Math.sin(frameClock * .7) * 20, y };
}
function folkSpots(map) {
  const id = folkTonight(); if (!id || FOLK[id].map !== map || worldOut?.map !== map) return [];
  const p = folkSpot(id); return [{ id: 'folk', x: p.x, y: p.y, radius: 120, label: FOLK[id].label, act: () => meetFolk(id) }];
}

// ---------- Desenho ----------
function drawLobisomem(x, y, dx = 1, s = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dx < 0 ? -s : s, s);
  ellipse(0, 2, 40, 9, '#0a080866');
  for (const lx of [-16, 10]) { rect(lx, -40, 12, 40, '#2a221c', 4); rect(lx - 3, -6, 18, 6, '#1a1410', 3); }
  ellipse(0, -78, 34, 46, '#3a2e26'); ellipse(-6, -88, 26, 30, '#4a3a30');
  rect(-44, -100, 14, 54, '#3a2e26', 6); rect(30, -100, 14, 54, '#3a2e26', 6); for (const cx of [-40, 34]) for (let k = 0; k < 3; k++) rect(cx + k * 4, -48, 2, 8, '#e8e0d0');
  ellipse(6, -132, 24, 22, '#3a2e26'); ellipse(26, -126, 16, 10, '#4a3a30'); ellipse(38, -128, 4, 4, '#111');
  poly([[-8, -150], [-2, -176], [6, -150]], '#2a221c'); poly([[8, -150], [16, -174], [20, -148]], '#2a221c');
  ellipse(12, -136, 4, 3, '#ff3a2a'); ellipse(22, -137, 3, 2.5, '#ff3a2a'); rect(26, -120, 12, 3, '#f4ecd8');
  ctx.restore();
}
function drawSanguanel(x, y, dx = 1) {
  ctx.save(); ctx.translate(x, y); ctx.scale(.6, .6); ctx.filter = 'brightness(.8) saturate(1.3)'; personDraw(2, 0, 0, true, false, dx); ctx.filter = 'none';
  poly([[-22, -118], [22, -118], [6, -170]], '#c8202a'); ellipse(6, -172, 7, 7, '#c8202a'); rect(-24, -122, 48, 8, '#a8181e', 3);
  ctx.restore();
}
function drawBoitata(x, y, t = frameClock) {
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(x, y - 30, 180, .3, '255,140,40'); ctx.restore();
  for (let k = 14; k >= 0; k--) { const px = x - k * 16, py = y - 30 + Math.sin(t * 4 + k * .6) * 14, r = 16 - k * .7; ellipse(px, py, r, r * .8, k % 2 ? '#ff8a2a' : '#ffc040'); }
  ellipse(x + 10, y - 34, 18, 14, '#ffd860'); ellipse(x + 16, y - 38, 5, 5, '#ffffff'); ellipse(x + 16, y - 28, 5, 5, '#ffffff');
}
// Mula sem Cabeça: corpo escuro galopando, fogo saindo do pescoço e o freio de ferro pendurado.
function drawMula(x, y, dx = 1, t = frameClock) {
  ctx.save(); ctx.translate(x, y); ctx.scale(dx < 0 ? -1 : 1, 1);
  ellipse(0, 2, 56, 10, '#0a080866'); const g = Math.sin(t * 10) * 8;
  for (const [lx, o] of [[-34, g], [-18, -g], [18, g], [32, -g]]) rect(lx + o * .3 - 4, -50, 9, 50, '#241a14', 3);
  ellipse(0, -66, 52, 26, '#2e221a'); ellipse(-6, -72, 40, 14, '#3a2c22'); rect(-58, -76, 8, 34, '#1a120e', 4);
  rect(36, -106, 22, 44, '#2e221a', 8); rect(40, -94, 16, 4, '#8a8a90'); ellipse(48, -78, 7, 7, 'rgba(0,0,0,0)'); ctx.strokeStyle = '#8a8a90'; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(54, -86, 8, -1, 2); ctx.stroke();
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(47, -118, 70, .4, '255,150,50'); ctx.restore();
  for (let k = 0; k < 5; k++) { const fx = 47 + Math.sin(t * 12 + k) * 6, fy = -112 - k * 8; ellipse(fx, fy, 10 - k * 1.6, 12 - k * 1.8, k % 2 ? '#ffb030' : '#ff6a20'); }
  ctx.restore();
}
function drawFolk(id, x, y, dx = 1) { if (id === 'lobisomem') drawLobisomem(x, y, dx, .9); else if (id === 'sanguanel') drawSanguanel(x, y, dx); else if (id === 'mula') drawMula(x, y, dx); else drawBoitata(x, y); }

// ---------- Cenas ----------
// Noite no campo (lobisomem e Boitatá) ou entre as parreiras da Serra (Sanguanel).
function drawSceneFolk() {
  const s = scene, id = s.folk; beginWorld();
  rect(0, 0, W, H, '#0a1028'); for (let i = 0; i < 60; i++) ellipse((i * 197.3) % W, (i * 41.7) % 280, 1.3, 1.3, `rgba(240,236,210,${.3 + .3 * Math.sin(frameClock * 1.6 + i)})`);
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(1300, 120, 150, .2, '220,230,255'); ctx.restore(); ellipse(1300, 120, id === 'lobisomem' ? 42 : 30, id === 'lobisomem' ? 42 : 30, '#f1ecd6');
  rect(0, 300, W, H - 300, id === 'sanguanel' ? '#1e2a16' : '#1a2614');
  if (id === 'sanguanel') for (const y of [380, 480, 600, 740]) { rect(0, y, W, 4, '#4a3a22'); for (let x = 20; x < W; x += 90) { rect(x, y - 40, 5, 44, '#4a3a22'); ellipse(x + 20, y - 30, 26, 16, '#2a4a22'); for (const [ox, oy] of [[12, -18], [20, -12], [16, -6]]) ellipse(x + ox, y + oy, 4, 4, '#4a1a5a'); } }
  else if (id === 'mula') { rect(560, 140, 260, 170, '#14141e'); poly([[540, 140], [690, 60], [840, 140]], '#101018'); rect(676, 10, 28, 60, '#101018'); rect(668, 24, 44, 10, '#101018'); rect(660, 220, 60, 90, '#2a2010'); ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(690, 260, 60, .2, '255,200,110'); ctx.restore(); }
  else { for (let x = 0; x < W; x += 80) ellipse(x + 30, 300, 52, 26 + (x % 3) * 8, '#0e1a10'); if (id === 'boitata') { rect(0, 560, W, 120, '#14243a'); for (let i = 0; i < 14; i++) rect((i * 113 + frameClock * 16) % W, 580 + (i * 29) % 90, 46, 2, 'rgba(255,170,90,.18)'); } }
  rect(0, 0, W, H, 'rgba(4,6,18,.25)');
  const list = Object.entries(s.actors).map(([aid, a]) => ({ y: a.y, draw: () => aid === 'sadi' ? personDraw(avatarSprite(), a.x, a.y, a.walk, true, a.dx) : drawFolk(aid, a.x, a.y, a.dx) }));
  list.sort((a, b) => a.y - b.y).forEach(l => l.draw());
  ctx.setTransform(1, 0, 0, 1, 0, 0);
}
SCENE_VIEWS.folk = drawSceneFolk;
{
  const speaker = sceneSpeaker;
  sceneSpeaker = function (who) {
    const icon = { lobisomem: '🐺', sanguanel: '🧝', boitata: '🔥', mula: '🐴' }[who];
    return icon ? { portrait: `<span class="portrait portrait-phone" style="width:104px;height:104px">${icon}</span>`, name: FOLK[who].name } : speaker(who);
  };
}
const FOLK_SCENES = {
  lobisomem: [['sadi', 'Que uivo foi esse…?'], ['lobisomem', 'AUUUUUU!'], ['sadi', 'Bah! É o lobisomem! O vô dizia: sexta-feira de lua, sétimo filho homem…'], ['sadi', '…e que pra quebrar o encanto basta uma gota de sangue, com faca benta. Coragem, Sadi!']],
  sanguanel: [['sadi', 'Quem tá aí no meio do parreiral?'], ['sanguanel', 'Hihihi! Bona sera, bodegheiro!'], ['sanguanel', 'Sou o Sanguanel. Peguei o teu chapéu e trancei a franja do teu poncho, hihi!'], ['sanguanel', 'Quer o chapéu de volta? Acerta as minhas adivinhas!']],
  mula: [['sadi', 'Que tropel é esse, perto da igreja…?'], ['mula', '…'], ['sadi', 'A Mula sem Cabeça! Fogo saindo do pescoço, igualzinho o vô contava…'], ['sadi', 'Ele dizia: esconde as unhas, não mostra os dentes… e quem arranca o freio de ferro quebra o encanto!']],
  boitata: [['sadi', 'Que clarão é aquele no banhado?'], ['boitata', '…'], ['sadi', 'O Boitatá… a cobra de fogo que guarda o campo. O vô dizia: não olha nos olhos dele.'], ['sadi', 'E se o capim pegar fogo, abafa com terra. Bora!']]
};
function meetFolk(id) {
  if (scene) return; const st = folkState(); st.day = G.day; st.id = id; showRpgBox('worldTalk', null); keys.clear(); const saved = { ...G.player };
  const steps = [{ view: 'folk' }, { do: () => { scene.folk = id; } }, { actor: 'sadi', x: 420, y: 600, dx: 1 }, { actor: id, x: id === 'boitata' ? 1500 : 1300, y: 600, dx: -1 }, { fade: 'in', time: 1 }];
  steps.push({ walk: id, to: { x: id === 'sanguanel' ? 760 : 900, y: 600 } });
  for (const [who, text] of FOLK_SCENES[id]) steps.push({ say: who, text });
  steps.push({ fade: 'out', time: .6 });
  playSteps(steps, 'folk-' + id, () => { G.player = saved; folkConfront(id); });
}
function folkConfront(id) {
  if (id === 'sanguanel') { G.folkQuiz = { n: 0, right: 0 }; folkQuestion(); return; }
  const stages = id === 'lobisomem' ? [
    { kind: 'timing', label: 'Esquivar do bote', text: 'Ele vai pular! Aperte <span class="keycap">E</span> com o marcador na faixa verde.', zone: [.4, .6], speed: 1.2, button: 'Esquivar', hitText: 'Escapou do bote!', missText: 'A unha pegou de raspão…' },
    { kind: 'alternate', label: 'Afastar com o tição', text: 'Agite o tição em brasa: alterne <span class="keycap">A</span> e <span class="keycap">D</span>.', doneText: 'Ele recuou do fogo!', pitch: 900 },
    { kind: 'timing', label: 'Faca benta', text: 'Agora! Uma gota só: aperte <span class="keycap">E</span> na faixa verde.', zone: [.44, .58], speed: 1.4, button: 'Espetar', hitText: 'Uma gota… o encanto quebrou!', missText: 'Errou o golpe!' }
  ] : id === 'mula' ? [
    { kind: 'timing', label: 'Esconder as unhas', text: 'Ela enxerga o brilho das unhas e dos dentes: aperte <span class="keycap">E</span> na hora certa para se esconder.', zone: [.4, .6], speed: 1.15, button: 'Esconder', hitText: 'Ela passou reto!', missText: 'Ela te viu!' },
    { kind: 'alternate', label: 'Segurar firme', text: 'Agarre a crina e segure: alterne <span class="keycap">A</span> e <span class="keycap">D</span>.', doneText: 'Segurou firme!', pitch: 700 },
    { kind: 'timing', label: 'Arrancar o freio', text: 'Agora! Aperte <span class="keycap">E</span> na faixa verde e arranque o freio de ferro.', zone: [.44, .58], speed: 1.35, button: 'Arrancar', hitText: 'O freio saiu: o encanto quebrou!', missText: 'O freio escapou da mão…' }
  ] : [
    { kind: 'alternate', label: 'Abafar o capim', text: 'O capim pegou fogo! Jogue terra: alterne <span class="keycap">A</span> e <span class="keycap">D</span>.', doneText: 'Fogo abafado!', pitch: 600 },
    { kind: 'timing', label: 'Fechar os olhos', text: 'Ele vai passar do teu lado: aperte <span class="keycap">E</span> para fechar os olhos na hora certa.', zone: [.42, .6], speed: 1.1, button: 'Fechar os olhos', hitText: 'Ele passou, e tu não olhou!', missText: 'Olhou pro clarão!' }
  ];
  startFarmGame({ title: FOLK[id].icon + ' ' + FOLK[id].name, stages, done: r => folkResult(id, ['lobisomem', 'mula'].includes(id) ? r.filter(Boolean).length >= 2 : r.every(Boolean)), cancel: () => folkResult(id, false) });
}
const SANGUANEL_RIDDLES = [
  ['O que é, o que é: quanto mais se tira, maior fica?', ['O buraco', 'A polenta', 'O vinho'], 0],
  ['Tem dentes mas não morde, penteia mas não tem cabelo?', ['O alho', 'O pente', 'A gaita'], 1],
  ['Nasce na parreira, dorme na pipa e alegra a festa?', ['O salame', 'O queijo', 'O vinho'], 2]
];
function folkQuestion() {
  const q = G.folkQuiz, [ask, opts] = SANGUANEL_RIDDLES[q.n];
  openDialog('🧢 Adivinha do Sanguanel · ' + (q.n + 1) + '/3', `<p><b>“${ask}”</b></p><div class="actions">${opts.map((o, k) => `<button data-act="folkAnswer" data-id="${k}">${o}</button>`).join('')}</div>`, 'folkQuiz');
}
function folkAnswer(k) {
  const q = G.folkQuiz; if (!q) return; if (Number(k) === SANGUANEL_RIDDLES[q.n][2]) { q.right++; AudioEngine.tick(); } else AudioEngine.bad();
  q.n++; if (q.n < SANGUANEL_RIDDLES.length) { folkQuestion(); return; }
  closeDialog(true); G.folkQuiz = null; folkResult('sanguanel', q.right >= 2);
}
const FOLK_WIN = {
  lobisomem: '<b>🐺 O lobisomem virou gente</b><br>No chão, ofegando, um homem magro: o Bento, sétimo filho de uma família do Rincão. “Desde guri carrego essa sina. Tu me livrou por esta lua, bodegueiro.” Ele deixou o tição apagado como lembrança.',
  sanguanel: '<b>🧢 O Sanguanel devolveu o chapéu</b><br>“Bravo, bodegheiro! Ninguém acerta as minhas adivinhas!” Ele destrançou o poncho e deixou uma fita vermelha, que dizem que dá sorte.',
  boitata: '<b>🔥 O Boitatá seguiu o caminho dele</b><br>A cobra de fogo passou pelo banhado e sumiu na várzea. Dizem que, onde ela passa, a lavoura amanhece sem praga. Ficou uma escama dourada no capim.'
};
FOLK_WIN.mula = '<b>🐴 O encanto quebrou</b><br>No lugar da mula, uma moça assustada, de vestido de festa: “Sete anos correndo de quinta pra sexta… Obrigada, moço.” O freio de ferro ficou na tua mão.';
const FOLK_LOSE = {
  lobisomem: '<b>🐺 O lobisomem fugiu pro mato</b><br>Ele sumiu uivando… Dizem que volta numa próxima sexta de lua.',
  sanguanel: '<b>🧢 O Sanguanel sumiu rindo</b><br>“Hihihi!” Ele devolveu o chapéu… mas levou uns trocados do teu bolso.',
  mula: '<b>🐴 A mula sumiu no escuro</b><br>Só ficou o cheiro de enxofre e o tropel morrendo na estrada. Dizem que ela volta numa próxima quinta.',
  boitata: '<b>🔥 O clarão te deixou zonzo</b><br>Tu olhou pro Boitatá e ficou vendo estrelas. Ele seguiu o caminho dele pelo banhado.'
};
function folkResult(id, win) {
  const st = folkState(); st.done = true; st.day = G.day; st[id] ??= { seen: 0, wins: 0 }; st[id].seen++;
  let rw = { xp: 10 };
  if (win) {
    const first = !st[id].wins; st[id].wins++; rw = first ? { xp: 70, rep: 3, cash: 30 } : { xp: 40, cash: 20 };
    if (first) { G.relics ??= {}; G.relics[FOLK[id].relic] = G.day; }
    if (id === 'boitata') G.boitataBless = G.day + 1;
  } else if (id === 'sanguanel') { const lost = Math.min(10, Math.max(0, Math.floor(G.cash))); if (lost) spendCash(lost); }
  grantReward(rw); save(); refreshHUD();
  talk([['card', (win ? FOLK_WIN : FOLK_LOSE)[id] + (win && st[id].wins === 1 ? '<br><br><i>A lembrança vai para a estante da tua casa.</i>' : ''), FOLK[id].name], ['reward', rw, FOLK[id].name]], null, 'Seguir');
}

// ---------- Ligações ----------
{
  for (const map of ['vila', 'serra']) {
    const M = WORLD_MAPS[map], spots = M.spots, draw = M.draw;
    M.spots = function () { return [...spots.call(this), ...folkSpots(map)]; };
    M.draw = function (view, seen, layers) {
      draw.call(this, view, seen, layers);
      const id = folkTonight(); if (!id || FOLK[id].map !== map) return;
      const p = folkSpot(id); if (seen(p.x, p.y, 400)) layers.push({ y: p.y, draw: () => drawFolk(id, p.x, p.y, Math.sin(frameClock * .7) > 0 ? 1 : -1) });
    };
  }
  const night = mapEventsTick; mapEventsTick = function () { night(); const id = folkTonight(); if (id && worldOut?.map === FOLK[id].map) remindOnce('folk', { mula: '🐴 Um tropel e um clarão pros lados da igreja…', lobisomem: '🐺 Um uivo cortou a noite, lá pros lados do mato…', sanguanel: '🧢 Uma risadinha esquisita entre as parreiras…', boitata: '🔥 Uma luz serpenteando no banhado…' }[id]); };
}
