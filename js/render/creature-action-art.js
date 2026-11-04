// Island and forest atlases: lazy images, shared bounded frame cache, no combat-rule changes.
'use strict';
const CREATURE_ART = {}, creatureLoads = {}, creatureMotion = new WeakMap(), creaturePulses = new WeakMap();
const CREATURE_KIND = { bruxaMor: 'bruxa-mor', bernunciaMae: 'bernuncia-mae' };
const CREATURE_SIZE = { bruxa: 142, 'bruxa-mor': 198, pirata: 132, afogado: 135, mariposa: 72, minhocao: 245, bernuncia: 225, 'bernuncia-mae': 365, mula: 190, queixada: 112, jararaca: 104, cascavel: 106, cachaco: 280, papo: 330, nereu: 124, griggs: 132 };
function creatureImage(id) {
  if (!CREATURE_CROPS[id]) return null;
  if (!CREATURE_ART[id]) {
    const im = CREATURE_ART[id] = new Image();
    ACTION_ART['creature:' + id] = im; ACTION_ART_CROPS['creature:' + id] = CREATURE_CROPS[id];
    creatureLoads[id] = new Promise(resolve => {
      im.onload = () => resolve(true); im.onerror = () => resolve(false);
      im.src = 'assets/images/creatures/' + id + '-v1.png';
    });
  }
  return CREATURE_ART[id];
}
function loadCreatureArt(ids = Object.keys(CREATURE_CROPS)) {
  return Promise.all(ids.map(id => (creatureImage(id), creatureLoads[id]))).then(r => r.every(Boolean));
}
function creatureSprite(id, frame, x, y, size = CREATURE_SIZE[id], flip = false) {
  if (!creatureImage(id)?.naturalWidth) return false;
  return actionSprite('creature:' + id, frame, x, y, size, flip);
}
function creatureWalking(b) {
  const prev = creatureMotion.get(b), time = frameClock;
  if (prev?.time === time) return prev.walk;
  const d = prev ? Math.hypot(b.x - prev.x, b.y - prev.y) : 0;
  const walk = prev ? d > .03 && d < 150 : ['roam', 'chase', 'stalk', 'charge', 'dash', 'retreat', 'swarm'].includes(b.state);
  creatureMotion.set(b, { x: b.x, y: b.y, time, walk }); return walk;
}
function creaturePose(b) {
  const pulse = creaturePulses.get(b);
  if (pulse?.until > frameClock) return pulse.frame;
  const s = b.state, k = b.kind;
  if (k === 'mula' && s === 'rest' && b.t > .55 && !(b.stun > 0)) return 6;
  if (b.stun > 0 || ['rest', 'dazed', 'stuck', 'hide', 'solta', 'afunda', 'mergulho'].includes(s)) return 7;
  if (k === 'pirata') return b.flash > 0 ? 5 : b.shot ? 6 : s === 'aim' ? 4 : creatureWalking(b) ? Math.floor(b.frame || 0) % 4 : 7;
  if (k === 'afogado') return s === 'rise' ? 4 : s === 'grab' ? (Math.floor(frameClock * 7) % 2 ? 5 : 6) : creatureWalking(b) ? Math.floor(b.frame || 0) % 4 : 7;
  if (k === 'mariposa') return b.cool > 1.15 ? 5 : Math.floor((b.frame || 0) * 2) % 4;
  if (k === 'minhocao') return s === 'erupcao' ? 5 : s === 'exposto' ? (b.attack > .9 ? 6 : 4) : Math.floor(b.frame || 0) % 4;
  if (['bruxa', 'bruxaMor'].includes(k)) return ['chama', 'roda'].includes(s) ? 6 : ['cast', 'leque'].includes(s) ? (b.t < .18 ? 5 : 4) : Math.floor(b.frame || 0) % 4;
  if (['windup', 'warn', 'coil', 'tailwind', 'chiado', 'fuca', 'ronco', 'presa', 'stomp', 'cast'].includes(s)) return 4;
  if (['charge', 'dash', 'lunge', 'strike', 'bite'].includes(s)) return 5;
  if (['rabo', 'filhotes', 'sweep', 'tail'].includes(s)) return 6;
  if (b.attack > 0) return 5;
  return creatureWalking(b) ? Math.floor(b.frame || 0) % 4 : 7;
}
function creatureBeastDraw(b) {
  const id = CREATURE_KIND[b.kind] || b.kind;
  if (!CREATURE_CROPS[id] || !creatureImage(id)?.naturalWidth) return false;
  // Keep hidden enemies hidden and preserve their original ground/water cues.
  if (b.kind === 'afogado' && b.state === 'submerso' || b.kind === 'minhocao' && ['cavando', 'tremor'].includes(b.state) || b.kind === 'papo' && ['under', 'emergewarn'].includes(b.state)) return false;
  let size = CREATURE_SIZE[id], y = b.y, reveal = 1;
  if (b.kind === 'bernuncia' && b.scale) size *= b.scale;
  if (b.kind === 'bernunciaMae' && b.scale) size *= b.scale / 1.9;
  if (b.kind === 'afogado') reveal = b.state === 'rise' ? clamp(b.rise || 0, 0, 1) : b.state === 'afunda' ? clamp(b.t, 0, 1) : 1;
  if (b.kind === 'minhocao') reveal = b.state === 'erupcao' ? clamp(1 - b.t / .35, 0, 1) : b.state === 'mergulho' ? clamp(b.t / .5, 0, 1) : 1;
  if (b.kind === 'papo' && b.state === 'dig') reveal = clamp(b.t / .6, 0, 1);
  if (['bruxa', 'bruxaMor'].includes(b.kind)) y -= 19 + Math.sin(frameClock * 2.4 + b.x * .01) * 4;
  if (b.kind === 'mariposa') y -= 42 + Math.sin(frameClock * 3 + b.x * .01) * 4;
  const shadow = b.kind === 'mariposa' ? 12 : Math.min(52, size * .18);
  ellipse(b.x, b.y + 2, shadow, Math.max(4, shadow * .25), '#111b184d');
  ctx.save();
  if (b.hurt > 0) ctx.globalAlpha *= .6;
  if (b.kind === 'pirata') ctx.globalAlpha *= .9;
  if (reveal < 1) { ctx.beginPath(); ctx.rect(b.x - 420, b.y - 440, 840, 442); ctx.clip(); y += (1 - reveal) * (b.kind === 'minhocao' ? 230 : size); }
  creatureSprite(id, creaturePose(b), b.x, y, size, b.dx < 0);
  ctx.restore();
  if (b.stun > 0 || ['dazed', 'stuck'].includes(b.state)) txt('✦', b.x, b.y - Math.min(size, 190) - 15, 18, '#ffe28a');
  if (!b.boss && !b.lenda && reveal === 1) mataHpBar(b, CAVE_BEASTS[b.kind].name, ['jararaca', 'cascavel'].includes(id) ? 75 : id.startsWith('bernuncia') ? 130 : Math.min(size + 25, 195));
  return true;
}

// Existing cave sheets already contain gait and strike poses. The legend arena
// previously bypassed these sheets and displayed its original static drawing.
function classicBeastDraw(b) {
  const spec = CAVE_BEAST_ART[b.kind]; if (!spec || b.kind === 'mula') return false;
  const [key, start, height] = spec;
  if (!expansionImage(key)?.naturalWidth) return false;
  const attack = b.attack > 0 || ['charge', 'dash', 'lunge', 'cast', 'stomp'].includes(b.state);
  const moving = creatureWalking(b), step = attack ? 3 : ['windup', 'rest'].includes(b.state) || !moving ? 0 : [0, 1, 2, 1][Math.floor(b.frame || 0) % 4];
  ellipse(b.x, b.y + 1, 26, 7, '#171a164d'); ctx.save();
  if (b.hurt > 0) ctx.globalAlpha *= .6;
  expansionSprite(key, start + step, b.x, b.y, height, b.dx < 0, expansionRowHeight(key, start, 4)); ctx.restore();
  if (b.stun > 0) txt('✦', b.x, b.y - height - 15, 18, '#ffe28a');
  if (!b.boss && !b.lenda) mataHpBar(b, CAVE_BEASTS[b.kind].name, height + 20);
  return true;
}
{
  const old = drawCaveBeast;
  drawCaveBeast = function(b) {
    if (!creatureBeastDraw(b) && !classicBeastDraw(b)) return old(b);
    if (b.carrier && b.hp > 0) drawCorrente(b);
  };
  const folk = drawFolk;
  drawFolk = function(id, x, y, dx = 1) {
    if (id === 'mula' && creatureImage('mula')?.naturalWidth) { creatureSprite('mula', Math.floor(frameClock * 6) % 4, x, y, CREATURE_SIZE.mula, dx < 0); return; }
    if (CAVE_BEAST_ART[id] && id !== 'mula') { const [key, start, h] = CAVE_BEAST_ART[id]; if (expansionImage(key)?.naturalWidth) { expansionSprite(key, start + [0, 1, 2, 1][Math.floor(frameClock * 5) % 4], x, y, h, dx < 0, expansionRowHeight(key, start, 4)); return; } }
    folk(id, x, y, dx);
  };
  // Registries retain their hit detection, telegraphs, drops and death handlers.
  for (const [kind, mob] of Object.entries(ILHA_MOBS)) {
    const draw = mob.draw, tick = mob.tick;
    if (CREATURE_SIZE[CREATURE_KIND[kind] || kind]) mob.draw = b => creatureBeastDraw(b) || draw(b);
    mob.tick = function(b, dt, p, N) {
      const state = b.state; tick(b, dt, p, N);
      if (['cast', 'leque', 'chama', 'roda', 'rabo', 'filhotes'].includes(state) && b.state !== state) creaturePulses.set(b, { until: frameClock + .18, frame: ['rabo', 'filhotes'].includes(state) ? 6 : 5 });
    };
  }
  const sailor = drawMarinheiro;
  drawMarinheiro = function(b) {
    if (b.kind !== 'marujo') return sailor(b);
    const moving = creatureWalking(b), strike = ['windup', 'lunge'].includes(b.state) || b.attack > 0;
    if (!historyFigure('marinheiro', b.x, b.y, b.hurt > 0 ? .6 : 1, b.dx, moving, 0, strike, b.frame)) return sailor(b);
    mataHpBar(b, CAVE_BEASTS.marujo.name, 145);
  };
}

function islandPortrait(id, size = 104) {
  if (!creatureImage(id)?.naturalWidth) return '';
  const sheet = CREATURE_CROPS[id], r = sheet.frames[0], h = sheet.reference * .4;
  return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px;overflow:hidden"><svg width="${size}" height="${size}" viewBox="${r[0] + r[4] - h / 2} ${r[1]} ${h} ${h}"><image href="assets/images/creatures/${id}-v1.png" width="${sheet.size[0]}" height="${sheet.size[1]}"/></svg></span>`;
}
const islandResidents = {};
function islandResident(id) {
  const map = id === 'nereu' ? 'sc' : 'ilha', home = id === 'nereu' ? SC_ITAJAI.nereu : GRIGGS;
  if (islandResidents[id]?.game !== G) islandResidents[id] = { game: G, map, x: home.x, y: home.y, home: { x: home.x, y: home.y }, dx: 0, dy: 1, walk: false, wait: 2, direction: -1 };
  return islandResidents[id];
}
function islandResidentTick(dt) {
  for (const id of ['nereu', 'griggs']) {
    const p = islandResident(id); if (worldOut?.map !== p.map) continue;
    creatureImage(id); p.walk = false;
    if (paused || scene || modal || phoneOpen || worldTalkOpen() || Math.hypot(worldOut.x - p.x, worldOut.y - p.y) < 145) continue;
    if (p.wait > 0) { p.wait -= dt; continue; }
    // Short safe patrols keep the boatman on the pier and Griggs at his camp.
    const target = p.home.x + p.direction * (id === 'nereu' ? 28 : 50), step = 26 * dt, next = p.x + Math.sign(target - p.x) * Math.min(step, Math.abs(target - p.x));
    if (WORLD_MAPS[p.map].canWalk(next, p.y)) { p.dx = Math.sign(next - p.x); p.dy = 0; p.walk = Math.abs(next - p.x) > .01; p.x = next; }
    else { p.direction *= -1; p.wait = 1; }
    if (Math.abs(target - p.x) < 1) { p.direction *= -1; p.wait = 2.5; }
  }
}
function islandPersonDraw(id, x, y, dx, moving = false, dy = 0, action = false) {
  if (!creatureImage(id)?.naturalWidth) return false;
  const pose = historyPose(moving, dx, dy, action), flip = dx < 0 && (pose >= 4 && pose < 8 || pose === 11);
  ellipse(x, y + 2, 18, 6, '#17232244'); ctx.save();
  if (id === 'griggs') ctx.globalAlpha *= .86;
  creatureSprite(id, pose, x, y, CREATURE_SIZE[id], flip); ctx.restore(); return true;
}
{
  const tick = outsideTick;
  outsideTick = function(dt) { tick(dt); islandResidentTick(dt); };
  const nereu = drawNereu, griggs = drawGriggs, np = nereuPortrait, gp = griggsPortrait;
  drawNereu = function(x, y, dx = -1) {
    const p = worldOut?.map === 'sc' ? islandResident('nereu') : null;
    const rowing = worldOut?.map === 'ilha' && Math.floor(frameClock * 2) % 2 === 0;
    if (!islandPersonDraw('nereu', p?.x ?? x, p?.y ?? y, p?.dx ?? dx, p?.walk || false, p?.dy || 0, rowing)) nereu(x, y, dx);
  };
  drawGriggs = function(x, y, dx = 1) {
    const p = worldOut?.map === 'ilha' ? islandResident('griggs') : null;
    const working = !p?.walk && Math.floor(frameClock * 2) % 8 === 0;
    if (!islandPersonDraw('griggs', p?.x ?? x, p?.y ?? y, p?.dx ?? dx, p?.walk || false, p?.dy || 0, working)) griggs(x, y, dx);
  };
  nereuPortrait = size => islandPortrait('nereu', size) || np(size);
  griggsPortrait = size => islandPortrait('griggs', size) || gp(size);
  for (const [map, id, spotId] of [['sc', 'nereu', 'sc:nereu'], ['ilha', 'griggs', 'ilha:griggs']]) {
    const M = WORLD_MAPS[map], spots = M.spots;
    M.spots = function() {
      const list = spots.call(this), s = list.find(s => s.id === spotId), p = islandResident(id);
      if (s) { s.x += p.x - p.home.x; s.y += p.y - p.home.y; } return list;
    };
  }
}
