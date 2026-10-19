(() => {
 const results=[],check=(ok,label)=>{if(!ok)throw Error(label);results.push(label);};
 const original={G,worldOut,started,paused,modal},confirmBefore=window.confirm;
 try {
  G=fresh();G.day=4;G.prologue={done:true};G.tutorial.complete=true;G.tutorial.guided=false;G.phase='closed';started=true;paused=true;
  for(const [key,meta] of Object.entries(CAMPEIRA_CROPS)){
   check(CAMPEIRA_ART[key].naturalWidth===meta.width,'loaded '+key);
   check(meta.frames.every(([x,y,w,h])=>x>=0&&y>=0&&w>0&&h>0&&x+w<=meta.width&&y+h<=meta.height),'valid crops '+key);
  }
  const home=WORLD_MAPS['casa:sadi'],spawn=home.spawn(),queue=[spawn],visited=new Set();
  for(let i=0;i<queue.length;i++){const p=queue[i];for(const [dx,dy] of [[10,0],[-10,0],[0,10],[0,-10]]){const x=p.x+dx,y=p.y+dy,k=x+','+y;if(!visited.has(k)&&home.canWalk(x,y)){visited.add(k);queue.push({x,y});}}}
  for(const spot of home.spots())check(queue.some(p=>Math.hypot(p.x-spot.x,p.y-spot.y)<30),'reachable '+spot.label);
  check(queue.some(p=>Math.hypot(p.x-home.exitPoint.x,p.y-home.exitPoint.y)<20)&&home.edge(home.exitPoint)?.map==='vila','walk through doorway back to village');
  const door=front(PLAYER_HOME);check(WORLD_MAPS.vila.canWalk(door.x,door.y),'front door walkable');
  check(!WORLD_MAPS.vila.canWalk(PLAYER_HOME.x+250,PLAYER_HOME.y+200),'home collision');
  check(SERRA.igreja.y+SERRA.igreja.h===SERRA.salao.y+SERRA.salao.h,'church next to hall');
  worldOut=null;const day=G.day;sleepDay();check(G.day===day,'cannot sleep away from home');closeDialog(true);
  caixaMenu();check(!$('dialogContent').innerHTML.includes('caixaSleep'),'no sleeping at register');closeDialog(true);
  worldOut={map:'casa:sadi',...HOME_BED_POINT};outsideInteract();check(modal==='homeBed','E at bed opens sleep menu');
  G.giftQueue=[];G.arcQueue=[];sportState().challenge=null;sportState().waiting=null;G.challengeVisit=null;
  action('homeSleep');check(G.day===day+1&&G.phase==='prep'&&worldOut?.map==='casa:sadi'&&nearHomeBed(),'sleep advances day and wakes at home');
  G.phase='prep';sportState().waiting={person:0};const rep=G.rep;window.confirm=()=>true;sleepDay();check(G.rep===rep&&G.phase==='prep','pending match does not charge skipped-day penalty');sportState().waiting=null;closeDialog(true);
  window.confirm=()=>false;sleepDay();check(G.rep===rep&&G.day===day+1,'cancel sleep preserves day');
  window.confirm=()=>true;sleepDay();check(G.day===day+2&&G.rep<rep&&nearHomeBed(),'confirmed skipped day returns to bed');closeDialog(true);
  for(const item of CAVE_ITEMS)check(caveItemIcon(item).includes('forge-supplies')&&!caveItemIcon(item).includes('undefined'),'supply art '+item.id);
  for(const item of CAVE_UPGRADES)check(forgeUpgradeIcon(item.id).includes('forge-equipment'),'equipment art '+item.id);
  check(caveItemIcon(CAVE_ITEMS[0])===caveItemIcon(CAVE_ITEMS[0]),'stable belt markup');
  return results;
 }finally{window.confirm=confirmBefore;closeDialog(true);({G,worldOut,started,paused,modal}=original);}
})()
