(() => {
 const before={G,worldOut,ctx,frameClock,modal},results=[];
 const check=(ok,label)=>{if(!ok)throw Error(label);results.push(label);};
 try{
  G=fresh();G.prologue={done:true};worldOut={map:'casa:sadi',...homeMap.spawn(),dx:0,dy:1};
  check(CAMPEIRA_ART['home-interior-v3'].naturalWidth===1536,'New home art loaded');
  const ids=quadroPeople().slice(0,5).map(i=>{G.friends[i]=40;return PEOPLE[i].id;});
  G.quadro=ids[0];check(homePortraits().join()===ids[0],'Old selected portrait preserved');
  for(const id of ids.slice(1,4))toggleQuadro(id);
  check(homePortraits().length===4,'Four portraits can be displayed');
  toggleQuadro(ids[4]);check(homePortraits().length===4&&!homePortraits().includes(ids[4]),'Full gallery preserves existing selection');
  toggleQuadro(ids[0]);toggleQuadro(ids[4]);check(homePortraits().includes(ids[4])&&!homePortraits().includes(ids[0]),'Portrait can be stored and replaced');
  G=JSON.parse(JSON.stringify(G));check(homePortraits().length===4,'Portraits persist in save data');
  G.trophies={rodeio:1,penalti:1,uva:1};G.relics={cuia_vo:1,foto1968:1,retrato:1,ticao:1,fita:1,escama:1,freio:1};
  const items=homeKeepsakePositions();check(items.length===10&&new Set(items.map(p=>p.x+':'+p.y)).size===10,'Every collectible has its own shelf position');
  const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=950;ctx=canvas.getContext('2d');
  const state=JSON.stringify(G),matrix=ctx.getTransform().toString();drawHomeCollections();
  check(JSON.stringify(G)===state&&ctx.getTransform().toString()===matrix,'Display preserves state and canvas');
  // Reset the bitmap as well as its pixels: local file images taint a canvas.
  worldOut=null;canvas.width=1400;ctx=canvas.getContext('2d');drawLembrancas();drawFriendPortrait(ids[0],{x:100,y:100,w:50,h:60});
  check(!ctx.getImageData(0,0,1400,950).data.some(v=>v),'Portraits and collectibles no longer draw in bodega');
  worldOut={map:'casa:sadi',...homePoint(940,400)};
  const spot=homeMap.spots().find(p=>p.label==='Coleções e retratos');check(spot&&homeMap.canWalk(spot.x,spot.y),'Collection interaction is reachable');
  spot.act();check(modal==='homeCollections'&&$('dialogContent').textContent.includes('10 lembranças')&&$('dialogContent').textContent.includes('Retratos da sua casa'),'Collection menu opens');closeDialog(true);
  for(const [x,y]of[[550,620],[1000,550],[1350,720],[730,640]]){const p=homePoint(x,y);check(homeMap.canWalk(p.x,p.y),'Cleared floor walkable: '+x+','+y);}
  const people=PEOPLE.filter(p=>!p.removed&&(WALK_ART_CROPS[p.id]||SECONDARY_POSES.has(p.sprite))&&p.id!=='sadi');
  for(const p of people){
   worldOut=null;check(!worldCharacterSpec(p.sprite,0,0,true,1,0),'Bodega keeps original rendering: '+p.id);
   worldOut={map:'vila',x:1000,y:1000};const idle=worldCharacterSpec(p.sprite,400,500,false,1,-1);
   check(!!idle,'World character has a resting pose: '+p.id);
   const front=idle.kind==='secondary'?SECONDARY_POSES.get(p.sprite).start:0;
   check(idle.index===front&&!idle.flip,'Resting pose faces forward: '+p.id);
   for(const [dx,dy]of[[0,1],[1,0],[0,-1],[-1,0]]){
    frameClock+=.5;const pose=worldCharacterSpec(p.sprite,400,500,true,dx,dy);
    check(pose.reference===idle.reference&&pose.height===idle.height,'Scale remains constant through movement: '+p.id);
   }
  }
 }finally{closeDialog(true);({G,worldOut,ctx,frameClock,modal}=before);}
 return results;
})()
