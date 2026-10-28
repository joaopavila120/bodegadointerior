(() => {
  const results = [], check = (ok, message) => { if (!ok) throw Error(message); results.push(message); };
  action('new'); sceneSkip(); closeDialog(true);
  G.prologue.done = true; G.tutorial.complete = true; G.phase = 'prep'; G.day = 30;
  G.regions = { serra: true, sc: true }; G.valterQueue = []; G.teachQueue = []; G.mount = { owned: false };
  G.missions = {}; for (const m of storyChapters()) if (m.chapter < 15) G.missions[m.id] = { status: 'done', day: 1 };
  started = true; paused = false; scene = null; talkState = null; closeDialog(true);
  check(Object.keys(ACTION_ART).length === 18 && Object.values(ACTION_ART).every(im => im.naturalWidth), '18 atlases loaded');
  check(Object.values(ACTION_ART_CROPS).reduce((n, s) => n + s.frames.length, 0) === 208, '208 complete poses');
  check(personHeight(0, true) === 130 && !sadiRangedPose(), 'bodega scale and idle preserved');
  for (const id of Object.keys(FOLK_ART_SIZE)) {
    check(historyFigure(id, 500, 300, 1, 1, true, 0, false, 1), id + ' draws a walking pose');
    check(historyPortrait(id).includes('actions/' + id), id + ' has matching portrait');
  }
  check(historyPose(false, -1) === 0, 'standing characters return to front');
  check(new Set([0, 1, 2, 3].map(p => historyPose(true, 1, 0, false, p))).size === 4, 'four side gait phases');
  check(historyPose(true, 0, -1, false, 0) === 9 && historyPose(false, 1, 0, true) === 11, 'back stride and role pose');
  for (const [kind, states] of Object.entries({ coral: ['coil', 'bite', 'rest'], teiu: ['windup', 'lunge', 'tail', 'rest'], ourico: ['bristle', 'shoot', 'rest'], corposeco: ['rise', 'reach', 'grab', 'down'] })) {
    for (const state of states) check(forestBeastSprite({ kind, state, x: 500, y: 500, frame: 2, t: .1, hp: 20, max: 30, dx: 1, hurt: 0 }), kind + ' ' + state);
  }
  const needleRun = { shots: [] }, hedgehog = { kind: 'ourico', state: 'bristle', x: 500, y: 500, t: .01, cool: 0, hurt: 0, attack: 0 };
  ouricoTick(hedgehog, .02, { x: 550, y: 500 }, needleRun);
  check(needleRun.shots.length === 15 && forestBeastPose(hedgehog) === 6, 'quill animation matches actual 15-projectile attack');
  check(companionPose(false, true, false, false, 0, 0) === 8 && companionPose(false, true, false, false, 0, 1) === 9, 'sleep breathes without growing to standing height');
  check([.6, .3, .1].map(t => companionPose(false, false, false, false, t)).join() === '13,14,15', 'dog growl, lunge and recovery');
  G.cusco = { day: 1, mode: 'follow' }; goOutside(); closeDialog(true);
  Object.assign(cusco, { x: worldOut.x - 60, y: worldOut.y, map: worldOut.map, walk: false });
  cuscoPet(); check(cusco.petUntil > frameClock, 'petting triggers drawn belly-up pose');
  drawCusco(cusco.x, cusco.y); drawCusco(cusco.x + 100, cusco.y, 1, true, false, false, BAIA.colors);

  // Actual gameplay movement and the interaction spot share the same camp actor.
  mataState().folks.jasy = 1;
  switchMap({ map: 'trecho', trecho: 6, x: 90, y: trechoEnds(6).yIn }); closeDialog(true);
  const T = trechoLayout(), home = { x: T.camp.x - 235, y: T.camp.y + 10 };
  Object.assign(worldOut, { x: home.x + 300, y: home.y + 100 });
  for (let i = 0; i < 90; i++) { frameClock += .04; outsideTick(.04); }
  check(campArtWalk && Math.hypot(campArtWalk.x - home.x, campArtWalk.y - home.y) > 1, 'camp resident walks on valid ground: ' + JSON.stringify({actor:campArtWalk && {...campArtWalk,game:null},home,camp:T.camp,modal,scene:!!scene,paused,folks:G.mata?.folks,worldTalk:worldTalkOpen()}));
  const spot = trechoSpots().find(s => s.id === 'folk:jasy');
  check(spot && spot.x === campArtWalk.x && spot.y === campArtWalk.y, 'talk prompt follows resident');
  Object.assign(worldOut, { x: spot.x + 100, y: spot.y }); outsideTick(.05);
  check(!campArtWalk.walk, 'resident stops when approached');
  switchMap({ map: 'laguna', x: LAGUNA.anita.x - 100, y: LAGUNA.anita.y }); closeDialog(true);
  WORLD_MAPS.laguna.spots().find(s => s.id === 'laguna:anita').act();
  check(talkState?.lines.length > 0, 'Anita conversation uses current character definition');
  talkState = null; talkEnd(); closeDialog(true);

  G.cave = { facao: true, floor: 3, deepest: 3, hp: 100, vo: true, up: {}, dunstanTaught: true };
  enterCave(3); closeDialog(true); scene = null; paused = false;
  const run = caveFloorRun(); run.hurt = 0; run.swing = null; run.beasts = [];
  G.up.bodoque = true; G.up.revolver38 = true; G.rangedPick = 'revolver38'; G.drum38 = 6; G.balas38 = 6;
  Object.assign(ranged, { cd: 0, reload: 0, hold: 0, shots: [] }); Object.assign(worldOut, { dx: 1, dy: 0 });
  rangedFire(); const shot = ranged.shots[0], muzzle = rangedMuzzle(worldOut, 0);
  check(shot && G.drum38 === 5 && sadiRangedPose()?.id === 'sadi-revolver', 'live revolver shot consumes one round and starts pose');
  const drawn = rangedDrawPoint(shot);
  check(Math.abs(drawn.x - muzzle.x) < .1 && Math.abs(drawn.y - muzzle.y) < .1, 'projectile starts at drawn muzzle');
  check(shot.x === worldOut.x + 30 && shot.y === worldOut.y - 62, 'visual muzzle preserves tested collision path');
  frameClock += .08; check(sadiRangedPose()?.stage === 1, 'revolver recoils');
  G.rangedPick = 'bodoque'; check(sadiRangedPose()?.id === 'sadi-revolver', 'swapping weapon does not replace firing sprite mid-shot');
  frameClock += .4; ranged.cd = 0; rangedFire();
  check(sadiRangedPose()?.id === 'sadi-bodoque' && G.drum38 === 5, 'bodoque has its own pose and consumes no ammo');
  frameClock += .08; check(sadiRangedPose()?.stage === 2, 'bodoque releases elastic');
  for (const [dx, dy, direction, flip] of [[1, 0, 1, false], [-1, 0, 1, true], [0, -1, 2, false], [0, 1, 0, false]]) {
    startSadiShot('revolver38', Math.atan2(dy, dx));
    const pose = sadiRangedPose(); check(pose?.direction === direction && pose.flip === flip, 'fire direction ' + dx + ',' + dy);
  }
  frameClock += .5; G.rangedPick = 'revolver38'; G.drum38 = 0; G.balas38 = 0; ranged.cd = 0;
  const n = ranged.shots.length; rangedFire(); check(ranged.shots.length === n && !sadiRangedPose(), 'empty revolver never plays a firing pose');
  G.drum38 = 1; G.balas38 = 6; ranged.cd = 0; rangedFire();
  check(ranged.reload > 0 && sadiRangedPose()?.id === 'sadi-revolver', 'last-round recoil survives auto reload');
  run.hurt = .2; check(!sadiRangedPose(), 'damage animation takes priority'); run.hurt = 0;
  const old = ACTION_ART.cusco; ACTION_ART.cusco = null;
  drawCusco(500, 500); check(!actionSprite('cusco', 0, 500, 500, 54), 'missing sheet uses original dog safely'); ACTION_ART.cusco = old;
  for (let i = 0; i < 600; i++) actionSprite('cusco', i % 16, 500, 500, 30 + i % 80);
  check(actionFrameCache.size <= 160 && actionFramePixels <= 4 * 1024 * 1024, 'sprite cache stays within memory budget');
  paused = true;
  return results;
})()
