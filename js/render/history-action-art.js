// Drawn poses for the forest cast, companions and ranged weapons.
// No gameplay state lives in the atlas; failed images keep the previous renderer.
'use strict';
const ACTION_ART = {}, actionFrameCache = new Map();
let actionFramePixels = 0;
const actionArtReady = Promise.all(Object.keys(ACTION_ART_CROPS).map(id => new Promise(resolve => {
  const image = ACTION_ART[id] = new Image();
  image.onload = () => resolve(true); image.onerror = () => resolve(false);
  image.src = 'assets/images/actions/' + id + '-v1.png';
}))).then(results => results.every(Boolean));

function actionSprite(id, index, x, y, size, flip = false) {
  const image = ACTION_ART[id], sheet = ACTION_ART_CROPS[id], r = sheet?.frames[index];
  if (!image?.naturalWidth || !r) return false;
  const scale = size / sheet.reference, transform = ctx.getTransform();
  const resolution = Math.min(3, Math.max(1, Math.hypot(transform.a, transform.b)));
  const h = Math.max(8, Math.ceil(r[3] * scale * resolution / 8) * 8), w = Math.ceil(r[2] * h / r[3]);
  const key = id + ':' + index + ':' + h;
  let tile = actionFrameCache.get(key);
  if (!tile) {
    tile = document.createElement('canvas'); tile.width = w; tile.height = h;
    const g = tile.getContext('2d'); g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
    g.drawImage(image, ...r.slice(0, 4), 0, 0, w, h);
    actionFrameCache.set(key, tile); actionFramePixels += w * h;
    while (actionFrameCache.size > 160 || actionFramePixels > 4 * 1024 * 1024) {
      const first = actionFrameCache.keys().next().value, old = actionFrameCache.get(first);
      actionFrameCache.delete(first); actionFramePixels -= old.width * old.height;
    }
  }
  ctx.save(); ctx.translate(x, y); if (flip) ctx.scale(-1, 1);
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(tile, -r[4] * scale, -r[5] * scale, r[2] * scale, r[3] * scale);
  ctx.restore(); return true;
}

const FOLK_ART_SIZE = { anita: 128, lanceiro: 128, bento: 132, sepe: 128, jasy: 91, kurupi: 112, mariath: 140, marinheiro: 128, 'garibaldi-ghost': 132 };
{
  const allies = navioAlliesTick, captain = mariathTick;
  navioAlliesTick = function(N, dt, p) {
    const a = navioFx.lanceiro, x = a?.x, y = a?.y, state = a?.state;
    allies(N, dt, p);
    if (a) {
      a.walkArt = Math.hypot(a.x - x, a.y - y) > .05;
      a.dyArt = Math.abs(a.y - y) > Math.abs(a.x - x) ? Math.sign(a.y - y) * 2 : 0;
      if (state === 'charge' && a.state === 'idle') a.strikeUntil = frameClock + .25;
    }
  };
  mariathTick = function(b, dt, N, p) {
    const x = b.x, y = b.y; captain(b, dt, N, p);
    b.walkArt = Math.hypot(b.x - x, b.y - y) > .05 && b.state === 'idle';
    b.dyArt = Math.abs(b.y - y) > Math.abs(b.x - x) ? Math.sign(b.y - y) * 2 : 0;
  };
}
function historyPose(moving, dx = 1, dy = 0, action = false, phase = frameClock * 7) {
  if (action) return 11;
  if (!moving) return 0;
  const direction = walkDirection(dx, dy), step = [1, 2, 3, 0][Math.floor(phase) % 4];
  // Back has two opposing strides and a planted passing pose.
  return direction === 2 ? [9, 8, 10, 8][Math.floor(phase) % 4] : direction * 4 + step;
}
function historyFigure(id, x, y, alpha, dx, moving, dy, action = false, phase) {
  if (!ACTION_ART[id]?.naturalWidth) return false;
  const ghost = CAMP_FOLK_LIST.find(f => f.id === id)?.ghost || ['mariath', 'marinheiro', 'garibaldi-ghost'].includes(id);
  const index = historyPose(moving, dx, dy, action, phase), size = FOLK_ART_SIZE[id];
  ellipse(x, y + 2, 21, 6, `rgba(22,35,33,${.27 * alpha})`);
  ctx.save(); ctx.globalAlpha *= alpha * (ghost ? .84 : 1);
  // Small breathing motion, no expensive per-frame glow filters or stretched legs.
  const bob = ghost ? Math.sin(frameClock * 1.7 + x * .01) * 1.5 : 0;
  actionSprite(id, index, x, y + bob, size, dx < 0 && (index >= 4 && index < 8 || index === 11));
  ctx.restore(); return true;
}
{
  const previous = drawCampFolk;
  drawCampFolk = function(id, x, y, alpha = 1, dx = 1, moving = false, dy = 0, action = false) {
    // Support gestures also appear during that character's dialogue.
    const speaking = ['jasy', 'kurupi', 'sepe', 'bento'].includes(id) && (scene?.step?.say === id || talkState?.lines[talkState.i]?.[0] === id);
    if (!scene && inTrecho() && campArtWalk?.id === id) {
      moving = campArtWalk.walk; dx = moving ? campArtWalk.dx : dx; dy = moving ? campArtWalk.dy : 0;
    }
    if (!historyFigure(id, x, y, alpha, dx, moving, dy, action || speaking)) previous(id, x, y, alpha, dx);
  };
  const captain = drawMariath, sailor = drawMarinheiro;
  drawMariath = function(x, y, alpha = 1, dx = 1, state = 'idle', hurt = 0, moving = false, dy = 0) {
    const strike = ['lunge', 'cut', 'cutwind'].includes(state);
    if (!historyFigure('mariath', x, y, alpha * (hurt > 0 ? .6 : 1), dx, moving, dy, strike)) captain(x, y, alpha, dx, state, hurt);
  };
  drawMarinheiro = function(b) {
    if (!historyFigure('marinheiro', b.x, b.y, b.hurt > 0 ? .6 : 1, b.dx, b.state === 'chase', 0, b.state === 'lunge', b.frame)) return sailor(b);
    mataHpBar(b, 'Marinheiro', 145);
  };
  const garibaldi=drawGaribaldi;
  drawGaribaldi=function(x,y,alpha=1,dx=0,moving=false,dy=0){
    const speaking=!moving&&(scene?.step?.say==='garibaldi'||talkState?.lines[talkState.i]?.[0]==='garibaldi');
    if(!historyFigure('garibaldi-ghost',x,y,alpha,dx,moving,dy,speaking))garibaldi(x,y,alpha,dx,moving);
  };
}

// Camp residents take short walks on safe ground. Interaction spots use the same
// live position, and they stop as the player approaches to talk.
let campArtWalk = null;
{
  const spot = campFolkSpot, tick = outsideTick;
  campFolkSpot = function(T) { return campArtWalk?.game === G && campArtWalk.n === T.n ? { x: campArtWalk.x, y: campArtWalk.y } : spot(T); };
  outsideTick = function(dt) {
    tick(dt);
    if (!inTrecho()) { campArtWalk = null; return; }
    if (paused || modal || scene || worldTalkOpen()) { if (campArtWalk) campArtWalk.walk = false; return; }
    const T = trechoLayout(), f = T.camp && campFolk(T.n);
    if (!f || !mataFolk(f.id) || !trechoCampSafe(T)) { campArtWalk = null; return; }
    if (campArtWalk?.game !== G || campArtWalk?.n !== T.n) {
      const home = spot(T); campArtWalk = { ...home, home, game: G, n: T.n, id: f.id, walk: false, dx: 1, dy: 0, wait: 2, target: null, route: 0 };
    }
    const a = campArtWalk; a.walk = false;
    if (Math.hypot(worldOut.x - a.x, worldOut.y - a.y) < 155) return;
    a.wait -= dt; if (a.wait > 0) return;
    if (!a.target) {
      const offsets = [[25, -18], [62, 22], [20, 40], [0, 0]], [ox, oy] = offsets[a.route++ % offsets.length];
      const target = { x: a.home.x + ox, y: a.home.y + oy };
      if (!mataFree(target.x, target.y)) { a.wait = 3; return; }
      a.target = target;
    }
    const dx = a.target.x - a.x, dy = a.target.y - a.y, d = Math.hypot(dx, dy), step = Math.min(d, 42 * dt);
    if (d < 2) { a.target = null; a.wait = 3 + a.route % 3; return; }
    const nx = a.x + dx / d * step, ny = a.y + dy / d * step;
    if (!mataFree(nx, ny)) { a.target = null; a.wait = 3; return; }
    Object.assign(a, { x: nx, y: ny, dx, dy, walk: true });
  };
}

function historyPortrait(id, size = 104) {
  const sheet = ACTION_ART_CROPS[id], r = sheet?.frames[0];
  if (!r || !ACTION_ART[id]?.naturalWidth) return '';
  // The spear is taller than its bearer; frame the head rather than the point.
  const h = sheet.reference * .39, x = r[0] + r[4] - h / 2, y = r[1] + r[5] - sheet.reference;
  return `<span class="portrait portrait-phone" style="width:${size}px;height:${size}px;overflow:hidden"><svg width="${size}" height="${size}" viewBox="${x} ${y} ${h} ${h}"><image href="assets/images/actions/${id}-v1.png" width="${sheet.size[0]}" height="${sheet.size[1]}"/></svg></span>`;
}
{
  const folk = folkPortrait, captain = mariathPortrait, actor = sceneActorDraw, garibaldi=garibaldiPortrait;
  folkPortrait = (id, size = 104) => historyPortrait(id, size) || folk(id, size);
  mariathPortrait = (size = 104) => historyPortrait('mariath', size) || captain(size);
  garibaldiPortrait = (size = 104) => historyPortrait('garibaldi-ghost', size) || garibaldi(size);
  sceneActorDraw = function(id, a) {
    if(!a.draw&&(a.as||id)==='garibaldi'&&ACTION_ART['garibaldi-ghost']?.naturalWidth){drawGaribaldi(a.x,a.y,a.alpha??1,a.dx,!!a.walk,a.dy||0);return;}
    if (!a.draw && FOLK_ART_SIZE[a.as || id] && ACTION_ART[a.as || id]?.naturalWidth) {
      const role = a.as || id, gesture = ['jasy', 'kurupi', 'sepe', 'bento'].includes(role) && scene?.step?.say === id;
      historyFigure(role, a.x, a.y, a.alpha ?? 1, a.dx, !!a.walk, a.dy || 0, gesture); return;
    }
    actor(id, a);
  };
}

function forestBeastPose(b) {
  if (b.kind === 'coral') return b.state === 'coil' ? (b.t > .2 ? 4 : 5) : b.state === 'bite' ? 6 : b.state === 'rest' ? 7 : Math.floor(b.frame || 0) % 4;
  if (b.kind === 'teiu') return ['tailwind', 'windup'].includes(b.state) ? 4 : b.state === 'lunge' ? 5 : b.state === 'tail' ? 6 : ['rest', 'pause'].includes(b.state) ? 7 : Math.floor(b.frame || 0) % 4;
  if (b.kind === 'ourico') return b.state === 'bristle' ? (b.t > .35 ? 4 : 5) : b.state === 'shoot' ? 6 : b.state === 'rest' ? 7 : Math.floor(b.frame || 0) % 4;
  return ['buried', 'down'].includes(b.state) ? 7 : b.state === 'rise' ? 4 : ['reach', 'grab'].includes(b.state) ? 5 : b.state === 'stagger' ? 6 : Math.floor(b.frame || 0) % 4;
}
const FOREST_BEAST_ART_SIZE = { coral: 108, teiu: 164, ourico: 64, corposeco: 148 };
function forestBeastSprite(b) {
  const size = FOREST_BEAST_ART_SIZE[b.kind];
  if (!size || !ACTION_ART[b.kind]?.naturalWidth) return false;
  ctx.save();
  if (b.hurt > 0) ctx.globalAlpha *= .55 + Math.abs(Math.sin(frameClock * 40)) * .45;
  const rising = b.kind === 'corposeco' && b.state === 'rise';
  if (rising) { ctx.beginPath(); ctx.rect(b.x - 120, b.y - 180, 240, 182); ctx.clip(); }
  // Buried: a low earthy body silhouette. Rising: reveal the drawn emerging pose.
  const sink = rising ? clamp(b.t / 1.2, 0, 1) * 118 : 0;
  actionSprite(b.kind, forestBeastPose(b), b.x, b.y + sink, size, b.dx < 0);
  ctx.restore(); mataHpBar(b, CAVE_BEASTS[b.kind].name, b.kind === 'corposeco' ? 164 : b.kind === 'coral' ? 96 : 90);
  return true;
}
{
  const coral = drawCoral, teiu = drawTeiu, ourico = drawOurico, corpo = drawCorpoSeco;
  drawCoral = b => forestBeastSprite(b) || coral(b);
  drawTeiu = b => forestBeastSprite(b) || teiu(b);
  drawOurico = b => forestBeastSprite(b) || ourico(b);
  drawCorpoSeco = b => forestBeastSprite(b) || corpo(b);
}

function companionPose(walking, sleepy, alert, pet = false, attack = 0, clock = frameClock) {
  if (attack > 0) return attack > .42 ? 13 : attack > .16 ? 14 : 15;
  if (pet) return 10 + Math.floor(clock * 4) % 2;
  if (walking) return 4 + Math.floor(clock * (alert ? 12 : 9)) % 4;
  if (alert) return Math.floor(clock * 4) % 3 === 0 ? 13 : 12;
  if (sleepy) return 8 + Math.floor(clock * 1.1) % 2;
  return 2 + Math.floor(clock * 2.5) % 2;
}
{
  const previous = drawCusco;
  drawCusco = function(x, y, dir = 1, walking = false, sleepy = false, alert = false, colors = null) {
    const id = colors ? 'baia' : 'cusco';
    if (!ACTION_ART[id]?.naturalWidth) return previous(x, y, dir, walking, sleepy, alert, colors);
    const dog = colors ? baia : cusco;
    const attack = !colors && cusco.map === worldOut?.map ? Math.max(0, (cusco.attackUntil || 0) - frameClock) : 0;
    const pet = dog.petMap === worldOut?.map && dog.petUntil > frameClock && !walking;
    const index = companionPose(walking, sleepy, alert, pet, attack);
    // Alternate sit / idle drawings look the other way in the source atlas.
    const flip = (dir < 0) !== [1, 3].includes(index);
    ellipse(x, y + 1, 24, 6, '#241b1844');
    actionSprite(id, index, x, y, colors ? 56 : 54, flip);
  };
  const petCusco = cuscoPet, petBaia = baiaPet;
  cuscoPet = function() { petCusco(); cusco.petUntil = frameClock + 3; cusco.petMap = worldOut?.map; };
  baiaPet = function() { petBaia(); baia.petUntil = frameClock + 3; baia.petMap = worldOut?.map; };
}

// Shot latches are transient visual state, never saved. Hold the fired weapon even
// when the player swaps it or the final cartridge starts an automatic reload.
const sadiShot = { until: 0, start: 0, weapon: null, angle: 0, map: null, game: null, field: false };
function startSadiShot(weapon, angle, field = false) {
  Object.assign(sadiShot, { until: frameClock + .4, start: frameClock, weapon, angle, map: worldOut?.map || null, game: G, field });
}
function rangedMuzzle(p, angle, stage = 0) {
  const sadi = avatarSprite() === 0 || walkCharacterId(avatarSprite()) === 'sadi';
  if (!sadi || !ACTION_ART[rangedWeapon() === 'bodoque' ? 'sadi-bodoque' : 'sadi-revolver']?.naturalWidth || playerMounted() || playerCarrying()) return null;
  const direction = walkDirection(Math.cos(angle), Math.sin(angle)), side = direction === 1, sign = Math.cos(angle) < 0 ? -1 : 1;
  const scale = (worldOut && !worldMap().indoor ? 124 : 130) / 124 * sadiScale();
  return { x: p.x + (side ? (stage === 1 ? 43 : 53) * sign : 0) * scale, y: p.y - (side ? (stage === 1 ? 119 : 96) : direction === 2 ? 126 : 85) * scale };
}
// Perspective offset fades into the existing projectile path. Collision remains
// at its tested ground projection, including narrow cave corridors and corners.
function rangedDrawPoint(shot) {
  const k = Math.max(0, 1 - (shot.artAge || 0) / .1);
  return { x: shot.x + (shot.artX || 0) * k, y: shot.y + (shot.artY || 0) * k };
}
function sadiRangedPose() {
  if (!started || scene || G.bocce || playerMounted() || playerCarrying()) return null;
  if (worldOut && (inCave() ? caveDefeatActive() : mataNight?.faint)) return null;
  if (worldOut && rangedCombat()) {
    const run = rangedFight(); if (run?.hurt > 0 || run?.swing) return null;
  }
  let weapon, angle, stage;
  if (slingActive() && sling.aim && slingAlive(sling.aim)) {
    const p = slingTargetPos(sling.aim); weapon = 'bodoque'; angle = Math.atan2(p.y - (G.player.y - 62), p.x - G.player.x); stage = sling.aim.t < .12 ? 0 : 1;
  } else if (sadiShot.game === G && sadiShot.until > frameClock && sadiShot.map === (worldOut?.map || null) && (sadiShot.field ? slingActive() : rangedCombat())) {
    weapon = sadiShot.weapon; angle = sadiShot.angle;
    const elapsed = frameClock - sadiShot.start;
    stage = weapon === 'bodoque' ? (elapsed < .045 ? 1 : elapsed < .19 ? 2 : 3) : (elapsed < .035 ? 0 : elapsed < .13 ? 1 : elapsed < .24 ? 2 : 3);
  } else return null;
  const id = weapon === 'bodoque' ? 'sadi-bodoque' : 'sadi-revolver';
  if (!ACTION_ART[id]?.naturalWidth) return null;
  const dx = Math.cos(angle), dy = Math.sin(angle), direction = walkDirection(dx, dy);
  return { id, direction, stage, index: direction * 4 + stage, flip: direction === 1 && dx < 0, angle };
}
{
  const fire = rangedFire, tick = rangedTick;
  rangedFire = function() {
    const count = ranged.shots.length, weapon = rangedWeapon(); fire();
    if (ranged.shots.length > count) {
      startSadiShot(weapon, ranged.ang);
      const shot = ranged.shots[ranged.shots.length - 1], tip = rangedMuzzle(worldOut, ranged.ang);
      if (tip) Object.assign(shot, { artX: tip.x - shot.x, artY: tip.y - shot.y, artAge: 0 });
    }
  };
  rangedTick = function(dt) { tick(dt); for (const shot of ranged.shots) shot.artAge = (shot.artAge || 0) + dt; };
  const release = slingRelease;
  slingRelease = function() {
    const target = sling.aim && slingTargetPos(sling.aim);
    release();
    if (target) startSadiShot('bodoque', Math.atan2(target.y - (G.player.y - 62), target.x - G.player.x), true);
  };
  const person = drawExpansionPerson;
  drawExpansionPerson = function(sprite, x, y, walking, chef, dx, seated, mood, dy) {
    const sadi = sprite === 0 || walkCharacterId(sprite) === 'sadi';
    const pose = chef && sadi && !seated && sadiRangedPose();
    if (pose) {
      ellipse(x, y + 1, 18, 7, '#271c1755');
      actionSprite(pose.id, pose.index, x, y, (worldOut && !worldMap().indoor ? 124 : 130) * sadiScale(), pose.flip);
      return true;
    }
    return person(sprite, x, y, walking, chef, dx, seated, mood, dy);
  };
  const hand = drawRangedHand;
  drawRangedHand = function() {
    const pose = (avatarSprite() === 0 || walkCharacterId(avatarSprite()) === 'sadi') && sadiRangedPose();
    if (!pose || !worldOut) return hand();
    // Flash stays at the weapon tip; do not draw an extra detached gun over the pose.
    const muzzle = rangedMuzzle(worldOut, pose.angle, pose.stage);
    if (muzzle) { ranged.tipX = muzzle.x; ranged.tipY = muzzle.y; }
  };
}
