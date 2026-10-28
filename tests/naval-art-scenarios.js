(()=>{
  const checks=[],check=(ok,msg)=>{if(!ok)throw Error(msg);checks.push(msg);};
  action('new');sceneSkip();closeDialog(true);skipWorldTalk();
  G.prologue.done=true;G.tutorial.complete=true;G.phase='prep';G.day=30;G.valterQueue=[];G.teachQueue=[];
  G.missions={};for(const m of storyChapters())if(m.chapter<15)G.missions[m.id]={status:'done',day:1};
  G.regions={serra:true,sc:true};G.mount={owned:false};G.mataSeen=1;G.mataGralha=1;
  caveState().facao=true;mataState().metGaribaldi=true;for(const f of CAMP_FOLK_LIST)G.mata.folks[f.id]=1;
  lagunaState().carregado=1;started=true;paused=false;scene=null;phoneOpen=false;talkState=null;
  check(navalHasDeck()&&Object.values(NAVAL_ART).every(im=>im.naturalWidth),'four naval assets load');
  const sheet=ACTION_ART_CROPS['garibaldi-ghost'];
  check(sheet.frames.length===12&&ACTION_ART['garibaldi-ghost'].naturalWidth,'Giuseppe has twelve drawn poses');
  check(FOLK_ART_SIZE['garibaldi-ghost']===FOLK_ART_SIZE.bento,'Giuseppe uses the same character proportions as Bento');
  check(garibaldiPortrait().includes('actions/garibaldi-ghost-v1.png'),'new portrait matches the sprite');
  const draw=actionSprite,poses=[];
  actionSprite=function(id,index,...args){if(id==='garibaldi-ghost')poses.push(index);return draw(id,index,...args);};
  try{
    frameClock=0;drawGaribaldi(400,400,1,-1,false,0);
    drawGaribaldi(400,400,1,1,true,0);drawGaribaldi(400,400,1,0,true,-1);drawGaribaldi(400,400,1,0,true,1);
    check(poses.join() === '0,5,9,1','front idle, side, back and front walking all use distinct correct poses');
    talkState={lines:[['garibaldi','teste']],i:0};drawGaribaldi(400,400,1,1);check(poses.at(-1)===11,'dialogue uses speaking gesture');talkState=null;
  }finally{actionSprite=draw;}
  worldOut={map:'casa:garibaldi',x:750,y:580,dx:0,dy:1};
  Object.assign(GARIBALDI_GUEST,{...garibaldiRoomPoint(790,560),step:1,pause:0});outsideTick(.05);
  check(GARIBALDI_GUEST.walk&&GARIBALDI_GUEST.dx>0,'refuge walk drives new animation');
  Object.assign(GARIBALDI_GUEST,{...garibaldiRoomPoint(790,650),step:0,pause:0});outsideTick(.05);
  check(GARIBALDI_GUEST.dy<0&&historyPose(true,GARIBALDI_GUEST.dx,GARIBALDI_GUEST.dy)===9,'refuge walk upwards uses back sprite');
  navioBoard();closeDialog(true);scene=null;const M=WORLD_MAPS.navio;
  check(worldOut.map==='navio'&&M.canWalk(worldOut.x,worldOut.y),'boarding point remains on new deck');
  check(!M.canWalk(100,650)&&!M.canWalk(1250,960),'sea and hull side are not walkable');
  for(const [x,y] of NAVIO.masts)check(!M.canWalk(x,y),'mast collision '+x);
  for(const [x,y] of NAVIO.barrels)check(!M.canWalk(x,y),'barrel collision '+x);
  check(!M.canWalk(NAVIO.hatch.x,NAVIO.hatch.y),'new hatch keeps existing collision');
  for(const [x,y] of NAVAL_CANNONS)check(!M.canWalk(x,y-15),'cannon carriage blocks feet '+x);
  // All vital battle points remain connected to boarding, around all furniture.
  const start=[worldOut.x,worldOut.y],seen=new Set(),q=[start],step=10,key=(x,y)=>Math.round(x/step)+':'+Math.round(y/step);seen.add(key(...start));
  while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(seen.has(k)||!M.canWalk(nx,ny))continue;seen.add(k);q.push([nx,ny]);}}
  for(const [x,y] of [[420,650],[930,720],[860,580],[1000,580],[1360,790],[1800,650],[700,750],[1150,750],[1560,750]])check(seen.has(key(x,y)),'combat route reachable '+x+','+y);
  const cached=navioDeckCanvas();for(let i=0;i<30;i++)navioDeckCanvas();check(navioDeckCanvas()===cached&&cached.width*cached.height<1800000,'static deck reused within memory bound');
  navioStart();const boss=navioBoss();boss.met=true;
  Object.assign(boss,{state:'idle',t:0,fogo:0});mataCombatTick(.05);
  check(boss.state==='fogo'&&navioFx.lanes.length===3,'cannon telegraphs still trigger');
  const alphas=[],mast=drawNavioMast;drawNavioMast=(x,y,a)=>alphas.push(a);
  try{const layers=[];drawNavioMap({x:200,y:220,w:1700,h:920},()=>true,layers);layers.sort((a,b)=>a.y-b.y).forEach(l=>l.draw());}finally{drawNavioMast=mast;}
  check(alphas.length===3&&alphas.every(a=>a===.18),'all sails fade during attack telegraphs');
  navioFx.lanes=[];boss.state='idle';worldOut.x=1150;worldOut.y=550;const visibility=[];drawNavioMast=(x,y,a)=>visibility.push([x,a]);
  try{const layers=[];drawNavioMap({x:200,y:220,w:1700,h:920},()=>true,layers);layers.forEach(l=>l.draw());}finally{drawNavioMast=mast;}
  check(visibility.find(p=>p[0]===1150)[1]===.27,'sail becomes translucent when player walks behind it');
  const ball={k:0,target:{x:420,y:650}};let pos=navalBallPoint(ball);check(pos.x===NAVIO.ladder.x+245&&pos.y===1003,'Anita shot is drawn from the new cannon');ball.k=1;pos=navalBallPoint(ball);check(Math.abs(pos.x-420)<.01&&Math.abs(pos.y-610)<.01,'shot ends at original target');
  navalWater({x:0,y:0,w:100,h:100});const tile=NAVAL_WATER_CACHE.tile;navalWater({x:200,y:100,w:100,h:100});check(NAVAL_WATER_CACHE.tile===tile,'water pattern stays cached');
  M.spots().find(s=>s.id==='navio:descer').act();closeDialog(true);check(worldOut.map==='laguna'&&WORLD_MAPS.laguna.canWalk(worldOut.x,worldOut.y),'return ladder still returns to beach');
  switchMap({map:'serra',x:1000,y:1000});check(navioDeck===null&&NAVAL_WATER_CACHE.tile===null,'naval caches released when leaving forest maps');
  const current=worldOut;worldOut=null;check(personHeight(0,true)===130,'bodega proportions unchanged');worldOut=current;
  return checks;
})()
