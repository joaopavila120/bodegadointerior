(() => {
 const old={G,worldOut,worldWalkers,started,modal,paused,worldTalkAt},results=[];
 const saved=localStorage.getItem(saveKey(false));
 const check=(ok,message)=>{if(!ok)throw Error(message);};
 try{
  G=fresh();started=true;worldWalkers=[];modal=null;paused=false;
  check(WORLD_DISCOVERIES.length===5&&WORLD_DISCOVERIES.filter(d=>d.secret).length===3&&!WORLD_DISCOVERIES.some(d=>d.bench),'Ficam só as curiosidades com identidade própria (sem as que eram só um banco)');
  check(!WORLD_ART['tourism-landmarks'],'Atlas das miniaturas ainda é carregado');
  results.push('miniaturas removidas sem colisões invisíveis nem carregamento do atlas antigo');
  for(const id of ['vila','serra','sc']){
   const M=WORLD_MAPS[id],step=20,cols=Math.ceil(M.W/step)+1,rows=Math.ceil(M.H/step)+1;
   const start={vila:[1620,1460],serra:[1800,980],sc:[1500,1000]}[id];
   const key=(x,y)=>y*cols+x,visited=new Set(),queue=[[start[0]/step,start[1]/step]];
   visited.add(key(...queue[0]));
   for(let head=0;head<queue.length;head++){
    const [cx,cy]=queue[head];
    for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
     const x=cx+dx,y=cy+dy,k=key(x,y);
     if(x<0||y<0||x>=cols||y>=rows||visited.has(k)||!M.canWalk(x*step,y*step)||!M.canWalk((x+cx)*step/2,(y+cy)*step/2))continue;
     visited.add(k);queue.push([x,y]);
    }
   }
   worldOut={map:id,x:start[0],y:start[1],dx:0,dy:1};G.prologue=null;
   const targets=M.spots();
   for(const p of targets){
    check(M.canWalk(p.x,p.y),'Ponto bloqueado: '+p.id);
    check(queue.some(([x,y])=>Math.hypot(x*step-p.x,y*step-p.y)<22),'Ponto isolado das estradas: '+p.id);
   }
   results.push('lugares e entradas alcançáveis andando em '+id);
  }
  for(const [map,id] of [['vila','ctg'],['sc','oktoberfest'],['serra','igreja']]){
   const door=WORLD_MAPS[map].spots().find(s=>s.id===id);
   worldOut={map,x:door.x,y:door.y,dx:0,dy:1};door.act();
   check(worldOut.map===id&&WORLD_MAPS[id].canWalk(worldOut.x,worldOut.y),'Entrada do interior falhou: '+id);
   const M=WORLD_MAPS[id],back=M.edge(M.exitPoint||{x:worldOut.x,y:M.bounds.y+M.bounds.h+30});
   check(back?.map===map&&Math.abs(back.x-door.x)<1,'Interior devolve ao mapa errado: '+id);
  }
  check(WORLD_MAPS.ctg.items.length===SALAO_ITEMS.length+HALL_THEMES.ctg.extra.length&&WORLD_MAPS.ctg.items.every(i=>!WORLD_MAPS.salao.items.includes(i)&&!SALAO_ITEMS.includes(i)),'CTG deve reutilizar layout sem compartilhar objetos mutáveis');
  check(WORLD_MAPS.oktoberfest.items.some(i=>i.kind==='chope')&&WORLD_MAPS.salao.items.some(i=>/polenta/i.test(i.label||'')),'Oktoberfest com chope e barris; salão da Serra com tacho de polenta e pipas de vinho');
  results.push('igreja, CTG e Oktoberfest têm entrada e retorno corretos');
  const secret=WORLD_DISCOVERIES.find(d=>d.id==='cardeal'),p=discoveryPoint(secret);
  worldOut={map:secret.map,x:p.x+60,y:p.y,dx:0,dy:1};
  check(worldNearest()?.id!=='discovery:cardeal','Segredo aparece à distância de um lugar normal');
  discoverWorldPlace(secret.id);check(!G.travel.seen[secret.id],'Descoberta remota foi registrada');
  worldOut.x=p.x;check(worldNearest()?.id==='discovery:cardeal','Segredo não aparece ao chegar perto');
  discoverWorldPlace(secret.id);check(G.travel.seen.cardeal?.day===1,'Segredo não foi registrado');
  const first=JSON.stringify(G.travel);G.day=2;discoverWorldPlace(secret.id);
  check(JSON.stringify(G.travel)===first,'Visita repetida alterou a primeira descoberta');
  check(readSave(false)?.travel.seen.cardeal?.day===1,'Caderno não sobrevive ao salvamento');
  const legacy=fresh();delete legacy.travel;check(normalizeSave(legacy).travel.seen,'Save antigo não recebeu o caderno');
  for(const d of WORLD_DISCOVERIES){worldOut={map:d.map,...discoveryPoint(d),dx:0,dy:1};discoverWorldPlace(d.id);}
  check(tourismJournalHTML().includes('5/5'),'Guia não mostra todas as descobertas');
  check(tourismJournalHTML().includes('Os gatos de Edith Gaertner'),'Segredo descoberto não aparece no guia');
  results.push('pistas por proximidade, registro único, caderno persistente e saves antigos');
 } finally {
  showRpgBox('worldTalk',null);G=old.G;worldOut=old.worldOut;worldWalkers=old.worldWalkers;started=old.started;modal=old.modal;paused=old.paused;worldTalkAt=old.worldTalkAt;
  if(saved===null)localStorage.removeItem(saveKey(false));else localStorage.setItem(saveKey(false),saved);
  draw();
 }
 return results;
})()
