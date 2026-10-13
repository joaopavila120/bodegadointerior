(() => {
 const previous={G,worldOut,worldWalkers,playerAnimation,frameClock,modal,paused};
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 try{
  G=fresh();G.prologue=null;worldWalkers=[];
  for(const id of ['vila','serra','sc']){
   const M=WORLD_MAPS[id],buildings=worldDressingBuildings(id);
   check(buildings.every(r=>r.x>=0&&r.y>=0&&r.x+r.w<M.W&&r.y+r.h<M.H),'Construction outside map: '+id);
   for(let i=0;i<buildings.length;i++)for(const b of buildings.slice(i+1)){
    const a=buildings[i];check(!(a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y),'Overlapping buildings: '+id);
   }
   for(const line of M.walkLines)for(let i=1;i<line.length;i++){
    const a=line[i-1],b=line[i],steps=Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/10);
    for(let j=0;j<=steps;j++)check(M.canWalk(a[0]+(b[0]-a[0])*j/steps,a[1]+(b[1]-a[1])*j/steps),'Pedestrian route blocked: '+id);
   }
   const dressing=worldDressing(M),trees=dressing.props.filter(p=>p.sheet==='nature'&&p.index<3);
   check(trees.length>=10&&trees.every(p=>p.h>290),'Missing mature trees: '+id);
   check(dressing===worldDressing(M)&&worldDoorPaths(M)===worldDoorPaths(M),'Landscaping must reuse its cache');
   const roads=worldDoorPaths(M);
   for(const r of buildings){const p=front(r,38);check(roads.some(([x,y,w,h])=>p.x>=x&&p.x<=x+w&&p.y>=y&&p.y<=y+h),'Missing doorstep path: '+id+'/'+(r.id||r.x));}
  }
  for(const id of ['agro','gado','atacado','acougue','ferragem']){
   const door=WORLD_MAPS.vila.spots().find(s=>s.id===id);
   worldOut={map:'vila',x:door.x,y:door.y,dx:0,dy:1};door.act();
   check(worldOut.map===id&&WORLD_MAPS[id].canWalk(worldOut.x,worldOut.y),'Shop entrance failed: '+id);
   const M=WORLD_MAPS[id],back=M.edge({x:worldOut.x,y:M.bounds.y+M.bounds.h+30});
   check(back?.map==='vila'&&Math.abs(back.x-door.x)<1,'Shop return failed: '+id);
  }
  G=fresh();worldOut={map:'vila',x:1620,y:845,dx:1,dy:0};playerAnimation=null;
  const frames=new Set();
  for(let i=0;i<8;i++)frames.add(playerSideSprite(0,1,0,{stride:1,sidePhase:(i+.1)*Math.PI/4}));
  check(frames.size===8&&[...frames].every(f=>SADI_SIDE.includes(f)),'Side walk must use eight distinct poses');
  const pose={stride:0,phase:5};
  check(playerSideSprite(0,1,0,pose)===SADI_SIDE[8]&&playerSideSprite(0,-1,0,pose)===SADI_SIDE[8],'Idle must preserve side orientation');
  check(!playerSideSprite(1,1,0,pose)&&!playerSideSprite(0,0,1,pose),'Side poses must not affect NPCs or vertical walking');
  const original=characterFrame,transforms=[];
  try{characterFrame=(s,p)=>{transforms.push(ctx.getTransform().a);return original(s,p);};
   personDraw(0,1620,845,false,true,1,false,0,0);personDraw(0,1620,845,false,true,-1,false,0,0);
  }finally{characterFrame=original;}
  check(transforms.length===2&&transforms[0]*transforms[1]<0,'Left and right must mirror correctly');
  worldOut=null;check(!playerSideSprite(0,1,0,pose),'Kitchen animation must stay independent');
  return ['edificações sem sobreposição, pedestres e caminhos até as portas livres nas três regiões','cinco lojas com entradas e retornos funcionais','oito poses laterais, espelhamento e pose de descanso do Sadi sem afetar os demais personagens'];
 }finally{({G,worldOut,worldWalkers,playerAnimation,frameClock,modal,paused}=previous);}
})()
