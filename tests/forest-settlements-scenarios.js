(() => {
  const results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  action('new');sceneSkip();closeDialog(true);skipWorldTalk();
  G.prologue.done=true;G.tutorial.complete=true;G.phase='prep';G.day=30;
  G.regions={serra:true,sc:true};G.valterQueue=[];G.teachQueue=[];G.mount={owned:false};
  G.missions={};for(const m of storyChapters())if(m.chapter<15)G.missions[m.id]={status:'done',day:1};
  started=true;paused=false;scene=null;talkState=null;G.mataSeen=true;G.mataGralha=true;
  mataState().metGaribaldi=true;G.mata.folks={};
  worldOut={map:'mata',x:200,y:985,dx:0,dy:1};
  const M=WORLD_MAPS.mata;
  check(settlementResidents().length===0,'unknown friends do not spawn');
  const inside=(id,t)=>{const c=SETTLEMENT_CLEARINGS[id];return ((t.x-c.x)/c.rx)**2+((t.y-c.y)/c.ry)**2<.6;};
  check(M.spots().filter(s=>s.id.startsWith('settlement:')).length===0,'before the encounters there is no community and no door');
  check(mataPlants().trees.some(t=>inside('aldeia',t))&&mataPlants().trees.some(t=>inside('farroupilha',t))&&!settlementSolid(SETTLEMENT_PROPS[0].x,SETTLEMENT_PROPS[0].y-40),'before the encounters both places are closed forest');
  campFolkMeet({biome:'mata'},campFolk(6));
  check(G.mata.folks.jasy===G.day&&settlementResidents().length===1,'actual first encounter unlocks a single resident');
  {const ids=M.spots().filter(s=>s.id.startsWith('settlement:')).map(s=>s.id);check(ids.length===3&&ids.includes('settlement:aldeia')&&!ids.includes('settlement:farroupilha'),'meeting Jasy opens only the indigenous village (community and two doors)');}
  check(!mataPlants().trees.some(t=>inside('aldeia',t))&&mataPlants().trees.some(t=>inside('farroupilha',t)),'the village clearing opens while the farrapo camp is still forest');
  let foundHomeNotice=false;
  for(let n=0;n<45&&modal==='talk';n++){foundHomeNotice||=$('dialogContent').textContent.includes('Aldeia do Pinhal');talkNext();}
  check(foundHomeNotice,'encounter tells player where the new friend now lives');
  closeDialog(true);talkState=null;scene=null;
  const j=settlementResidents()[0];check(j.id==='jasy'&&settlementHome(j.id)===FOREST_SETTLEMENTS.aldeia,'Jasy joins indigenous clearing');
  const j0=[j.x,j.y];for(let i=0;i<300;i++)settlementPeopleTick(.05);
  check(Math.hypot(j.x-j0[0],j.y-j0[1])>100&&j.walk,'resident really walks away from his home');
  const spot=M.spots().find(s=>s.id==='resident:jasy');
  check(spot.x===j.x&&spot.y===j.y,'talk interaction follows walking sprite');
  Object.assign(worldOut,{x:j.x+90,y:j.y});settlementPeopleTick(.05);
  check(!j.walk,'resident stops for approaching player');
  spot.act();check(modal==='talk'&&talkState.lines.some(l=>l[0]==='jasy'),'existing character conversation remains available');
  closeDialog(true);talkState=null;skipWorldTalk();
  for(const f of CAMP_FOLK_LIST)G.mata.folks[f.id]=1;
  check(settlementResidents().length===6&&new Set(settlementResidents().map(p=>p.id)).size===6,'old encounter flags unlock six unique residents');
  check(M.spots().filter(s=>s.id.startsWith('settlement:')).length===6&&!mataPlants().trees.some(t=>inside('farroupilha',t)),'with farrapos met, the camp and its doors appear');
  for(const f of CAMP_FOLK_LIST){
    const p=settlementResidents().find(p=>p.id===f.id),r=p.route,bad=[];
    for(let i=0;i<r.length;i++){
      const a=r[Math.max(0,i-1)],b=r[i],n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[1]-a[1])/10));
      for(let t=0;t<=n;t++){const x=a[0]+(b[0]-a[0])*t/n,y=a[1]+(b[1]-a[1])*t/n;if(!M.canWalk(x,y)){bad.push([Math.round(x),Math.round(y)]);break;}}
    }
    check(!bad.length,f.id+' entire patrol avoids water, trunks and buildings: '+JSON.stringify(bad.slice(0,8)));
    check(r.some(q=>Math.hypot(q[0]-r[0][0],q[1]-r[0][1])>500)&&r.length>25,f.id+' has a forest route, not an idle bob');
    const x=p.x,y=p.y;Object.assign(worldOut,{x:100,y:985});p.wait=0;
    for(let n=0;n<80;n++)settlementPeopleTick(.05);
    check(Math.hypot(p.x-x,p.y-y)>30,f.id+' advances through route');
  }
  const people=settlementResidents(),before=people.map(p=>[p.x,p.y]);paused=true;settlementPeopleTick(1);
  check(people.every((p,i)=>p.x===before[i][0]&&p.y===before[i][1]&&!p.walk),'pause freezes all residents');paused=false;
  worldOut.map='serra';settlementPeopleTick(1);check(people.every((p,i)=>p.x===before[i][0]&&p.y===before[i][1]),'residents do not tick in unrelated maps');worldOut.map='mata';
  for(const room of SETTLEMENT_ROOMS){
    const prop=SETTLEMENT_PROPS.find(p=>p.id===room.prop),door=settlementDoor(prop),R=WORLD_MAPS[room.id];
    check(M.canWalk(door.x,door.y)&&!M.canWalk(prop.x,prop.y-prop.depth/2),room.id+' accessible entrance and solid building base');
    Object.assign(worldOut,door);M.spots().find(s=>s.id==='settlement:'+prop.id).act();
    check(worldOut.map===room.id&&R.canWalk(worldOut.x,worldOut.y),room.id+' actual E entrance spawns on floor');
    check([825,790,750,710,670,630,590,550,510,470].every(y=>{const q=settlementRoomPoint(760,y);return R.canWalk(q.x,q.y);}),room.id+' doorway joins clear central floor');
    const wall=settlementRoomPoint(100,500),solid=room.solids[0],furniture=settlementRoomPoint(solid[0]+solid[2]/2,solid[1]+solid[3]/2);
    check(!R.canWalk(wall.x,wall.y)&&!R.canWalk(furniture.x,furniture.y),room.id+' walls and furniture block movement');
    check(MATA_MAPS.has(room.id)&&MATA_MUSIC_MAPS.has(room.id),room.id+' shares forest cache lifetime and music');
    R.spots().find(s=>s.id.endsWith(':exit')).act();
    check(worldOut.map==='mata'&&worldOut.x===door.x&&worldOut.y===door.y,room.id+' E exit returns to matching outside door');
    check(R.edge(settlementRoomPoint(760,970)).map==='mata',room.id+' walking through doorway also exits');
  }
  // Flood fill from the original entrance, including both river crossings.
  const step=20,start=M.spawn(),key=(x,y)=>Math.round(x/step)+':'+Math.round(y/step),seen=new Set([key(start.x,start.y)]),todo=[[start.x,start.y]];
  while(todo.length){const [x,y]=todo.pop();for(const [dx,dy] of [[step,0],[-step,0],[0,step],[0,-step]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(!seen.has(k)&&M.canWalk(nx,ny)){seen.add(k);todo.push([nx,ny]);}}}
  const reachable=(x,y)=>[-20,0,20].some(dx=>[-20,0,20].some(dy=>seen.has(key(x+dx,y+dy))));
  for(const p of SETTLEMENT_PROPS.filter(p=>p.room)){const q=settlementDoor(p);check(reachable(q.x,q.y),p.id+' reachable from Serra entrance');}
  check(reachable(garibaldiFront().x,garibaldiFront().y)&&reachable(3500,770)&&reachable(mataRiverX(1010),1010)&&reachable(mataRiverX(2010),2010),'old refuge, next forest segment and both crossings remain reachable');
  const old=G;G=fresh();check(settlementResidents().length===0,'new game clears resident runtime state');G=JSON.parse(JSON.stringify(old));
  check(settlementResidents().length===6,'reloaded save restores unlocked residents without new flags');
  const n=settlementResidents().length;for(let i=0;i<100;i++)M.spots();check(settlementResidents().length===n,'repeated spot refreshes never duplicate friends');
  Object.assign(worldOut,{x:100,y:985});const a=settlementResidents()[0];a.wait=0;const ax=a.x,ay=a.y;outsideTick(.05);
  check(Math.hypot(a.x-ax,a.y-ay)>0,'normal game tick drives resident animation and movement');
  const outside=worldOut;worldOut=null;check(personHeight(0,true)===130,'bodega character proportions unchanged');worldOut=outside;
  return results;
})()
