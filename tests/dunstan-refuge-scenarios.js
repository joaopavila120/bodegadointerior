(async()=>{
  await dunstanRoomReady;
  const previous={G,worldOut,caveRun,started,paused,modal,scene,phoneOpen,dunstan:{...DUNSTAN}},results=[];
  const check=(ok,label)=>{if(!ok)throw Error(label);results.push(label);};
  try{
    G=fresh();G.prologue={done:true};G.cave={facao:true,floor:1,deepest:1,hp:100,up:{},dunstanTaught:true};
    started=true;paused=false;modal=null;scene=null;phoneOpen=false;caveRun=null;
    const M=WORLD_MAPS.caverna;worldOut={map:'caverna',...caveCenter(...CAVE.start),dx:0,dy:1};M.onEnter();
    check(dunstanRoomImage.naturalWidth===1573,'Refuge art loaded');
    check(M.canWalk(worldOut.x,worldOut.y),'Old entrance relocates onto clear floor');
    const run=caveFloorRun();check(!run.beasts.length&&!run.rocks.length&&run.ladder.shown,'First floor remains peaceful');
    const q=[{x:worldOut.x,y:worldOut.y}],visited=new Set();
    for(let i=0;i<q.length&&q.length<30000;i++)for(const [dx,dy]of[[10,0],[-10,0],[0,10],[0,-10]]){
      const p={x:q[i].x+dx,y:q[i].y+dy},k=p.x+','+p.y;
      if(!visited.has(k)&&M.canWalk(p.x,p.y)){visited.add(k);q.push(p);}
    }
    check(q.length>100&&q.length<30000,'Walkable floor is bounded');
    for(const spot of M.spots())check(M.canWalk(spot.x,spot.y)&&q.some(p=>Math.hypot(p.x-spot.x,p.y-spot.y)<30),'Reachable: '+spot.id);
    for(const [x,y,w,h]of DUNSTAN_ROOM_SOLIDS){const p=dunstanRoomPoint(x+w/2,y+h/2);check(!M.canWalk(p.x,p.y),'Furniture has collision');}
    const visitedStops=new Set();
    DUNSTAN.wait=0;
    for(let i=0;i<3000;i++){dunstanTick(.05);if(!M.canWalk(DUNSTAN.x,DUNSTAN.y))throw Error('Saint crossed furniture');visitedStops.add(DUNSTAN.step);}
    check(visitedStops.size===DUNSTAN_ROUTE.length,'Saint completes his walking circuit');
    const play=playSteps,enabled=scenesEnabled;let steps;
    try{playSteps=s=>{steps=s;};scenesEnabled=()=>true;dunstanFirstMeeting();}
    finally{playSteps=play;scenesEnabled=enabled;}
    const actors={};
    for(const step of steps){
      if(step.actor){actors[step.actor]={x:step.x,y:step.y};check(M.canWalk(step.x,step.y),'Intro actor on clear floor: '+step.actor);}
      if(step.walk){const a=actors[step.walk],b=step.to;for(let i=0;i<=30;i++){const t=i/30;check(M.canWalk(a.x+(b.x-a.x)*t,a.y+(b.y-a.y)*t),'Intro walk stays clear');}actors[step.walk]=b;}
    }
    const state=JSON.stringify(G),matrix=ctx.getTransform().toString(),layers=[];
    M.draw({x:0,y:0,w:M.W,h:M.H},()=>true,layers);layers.sort((a,b)=>a.y-b.y).forEach(l=>l.draw());
    check(matrix===ctx.getTransform().toString()&&JSON.stringify(G)===state,'Rendering preserves canvas and game state');
    Object.assign(worldOut,{x:50,y:50});caveUnstickPlayer();check(M.canWalk(worldOut.x,worldOut.y),'Invalid old save recovers to safe entrance');
    for(const floor of [2,11]){G.cave.floor=floor;caveRun=null;const p=M.spawn();check(p.x===200&&p.y===920&&M.canWalk(p.x,p.y),'Original entrance on floor '+floor);check(caveFloorRun().beasts.length>0,'Combat remains on floor '+floor);}
  }finally{G=previous.G;worldOut=previous.worldOut;caveRun=previous.caveRun;started=previous.started;paused=previous.paused;modal=previous.modal;scene=previous.scene;phoneOpen=previous.phoneOpen;Object.assign(DUNSTAN,previous.dunstan);}
  return results;
})()
