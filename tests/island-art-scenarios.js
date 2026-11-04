(() => {
  const results = [], check = (ok, message) => { if (!ok) throw Error(message); results.push(message); };
  window.confirm = () => true; action('new'); sceneSkip(); closeDialog(true); skipWorldTalk();
  G.prologue.done = true; G.tutorial.complete = true; G.phase = 'prep'; G.day = 40;
  G.regions = { serra: true, sc: true }; G.valterQueue = []; G.teachQueue = [];
  G.missions = {}; for (const m of storyChapters()) if (m.chapter < 15) G.missions[m.id] = { status: 'done', day: 1 };
  started = true; paused = false; scene = null; talkState = null;
  check(Object.keys(CREATURE_CROPS).length === 16, '16 atlases registered');
  check(Object.values(CREATURE_CROPS).reduce((n, a) => n + a.frames.length, 0) === 136, '136 complete poses');
  for (const [id, sheet] of Object.entries(CREATURE_CROPS)) {
    check(CREATURE_ART[id]?.naturalWidth > 0 && sheet.frames.every(r => r[0] >= 0 && r[1] >= 0 && r[0]+r[2] <= sheet.size[0] && r[1]+r[3] <= sheet.size[1]), id + ' loaded with valid bounds');
    for (let f=0;f<sheet.frames.length;f++) creatureSprite(id,f,500,500);
  }
  const b = kind => ({ kind, state: 'chase', hp: 40, max: 40, x: 700, y: 700, dx: 1, frame: 1, t: .2, cool: 0, attack: 0, hurt: 0, home: {x:700,y:700} });
  for (const [kind, states] of Object.entries({ bruxa:['hover','cast'], bruxaMor:['hover','roda','chama','leque'], pirata:['chase','aim'], afogado:['rise','chase','grab','afunda'], mariposa:['swarm'], minhocao:['erupcao','exposto','mergulho'], bernuncia:['chase','windup','lunge'], bernunciaMae:['chase','rabo','filhotes'], mula:['roam','windup','charge','rest'], queixada:['roam','windup','charge'], jararaca:['hide','warn','strike'], cascavel:['hide','warn','strike'], cachaco:['idle','windup','charge','presa','dazed'], papo:['idle','windup','lunge','tailwind','sweep','dig'] })) {
    for (const state of states) {
      const beast = {...b(kind),state,rise:.6};
      check(creatureBeastDraw(beast), kind + ' ' + state + ' draws');
    }
  }
  const mule=b('mula'); mule.state='windup';check(creaturePose(mule)===4,'mule warns before charge');
  mule.state='charge';check(creaturePose(mule)===5,'mule charges with impact frame');
  mule.state='rest';check(creaturePose(mule)===7,'mule recovers visibly');
  mule.t=.7;check(creaturePose(mule)===6,'mule rears briefly after its charge');
  const pirate={...b('pirata'),flash:.1};check(creaturePose(pirate)===5,'pirate flash uses firing pose');
  for(const [kind,state] of [['afogado','submerso'],['minhocao','cavando'],['minhocao','tremor'],['papo','under']])check(!creatureBeastDraw({...b(kind),state}),kind+' preserves hidden-state cues');
  for(const kind of ['javali','onca','sanguanel','boitata','lobisomem','teiniagua','anhanga'])check(classicBeastDraw({...b(kind),lenda:true,state:'dash'}),kind+' uses existing animation in legend fights');
  const chainDraw=drawCorrente;let chains=0;
  try{drawCorrente=()=>chains++;drawCaveBeast({...b('lobisomem'),carrier:true});check(chains===1,'quest chain remains visible on the animated werewolf');}finally{drawCorrente=chainDraw;}
  const corpse={...b('corposeco'),state:'reach'};check(forestBeastSprite(corpse),'existing forest atlases stay active');
  const soldier={...b('marujo'),state:'roam'};drawCaveBeast(soldier);soldier.state='lunge';drawCaveBeast(soldier);

  // Exercise the actual curse transition and retain its projectile/damage behavior.
  worldOut={map:'ilhamato',trecho:2,x:1700,y:950,dx:1,dy:0};
  const witch={...b('bruxa'),x:2050,y:950,state:'cast',t:.01,blink:1,foge:0,max:110,hp:110}, run={ish:[],beasts:[],grab:null};
  ILHA_MOBS.bruxa.tick(witch,.02,worldOut,run);
  check(run.ish.length===1&&witch.state==='hover'&&creaturePose(witch)===5,'real curse fires and briefly holds casting pose');
  check(ILHA_MOBS.minhocao.immune({state:'cavando'})&&ILHA_MOBS.afogado.immune({state:'submerso'}),'hidden enemy immunities unchanged');

  for(const [id,map]of [['nereu','sc'],['griggs','ilha']]){
    worldOut={map,x:100,y:100,dx:1,dy:0}; const p=islandResident(id),x=p.x;p.wait=0;
    for(let j=0;j<20;j++){frameClock+=.04;islandResidentTick(.04);}
    check(Math.abs(p.x-x)>1,id+' walks safely near home');
    check(WORLD_MAPS[map].canWalk(p.x,p.y),id+' remains on walkable ground');
    const s=WORLD_MAPS[map].spots().find(s=>s.id===(id==='nereu'?'sc:nereu':'ilha:griggs'));
    check(s&&Math.abs(s.x-p.x)<100,id+' interaction follows visible position');
    Object.assign(worldOut,{x:p.x-70,y:p.y});islandResidentTick(.04);check(!p.walk,id+' stops when approached');
    check(islandPortrait(id).includes('/creatures/'+id+'-v1.png'),id+' matching portrait');
  }
  worldOut=null;check(personHeight(0,true)===130,'bodega Sadi size unchanged');
  const start=performance.now();
  for(let n=0;n<50;n++)for(const kind of ['bruxa','bruxaMor','pirata','afogado','mariposa','minhocao','bernuncia','bernunciaMae','mula'])creatureBeastDraw({...b(kind),state:'chase'});
  results.push('cached mixed-monster drawing: '+((performance.now()-start)/50).toFixed(2)+' ms / 9 monsters');
  check(actionFrameCache.size<=160&&actionFramePixels<=4*1024*1024,'shared frame cache stays bounded');
  paused=true;return results;
})()
