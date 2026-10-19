(async()=>{
 await loadPaintedInteriors();paintedImage('casona-away');await PAINTED_READY['casona-away'];
 const before={G,worldOut,ctx,atHome},results=[],failures=[];
 const check=(ok,label)=>{if(!ok)failures.push(label);else results.push(label);};
 try{
  G=fresh();G.day=4;G.prologue={done:true};G.tutorial.complete=true;G.tutorial.guided=false;G.phase='prep';
  atHome=()=>true;
  const canvas=document.createElement('canvas');canvas.width=1900;canvas.height=1550;ctx=canvas.getContext('2d');
  check(Object.keys(PAINTED_INTERIORS).length===23,'23 ambientes com arte exclusiva');
  check(new Set(Object.values(PAINTED_INTERIORS).map(m=>m.painted.id)).size===23,'Cada ambiente usa sua própria ilustração');
  check(PAINTED_ART['casona-away'].naturalWidth===PAINTED_ART.casona.naturalWidth,'Variante da missão da Casona carregada');
  for(const[id,M]of Object.entries(PAINTED_INTERIORS)){
   const im=PAINTED_ART[id];check(im?.naturalWidth>1000,'Imagem pronta: '+id);
   worldOut={map:M.id,...M.spawn(),dx:0,dy:1,back:{map:'vila',x:1600,y:900}};
   const start=M.spawn(),q=[start],visited=new Set([start.x+','+start.y]);
   check(M.canWalk(start.x,start.y),'Entrada transitável: '+id);
   for(let i=0;i<q.length&&q.length<40000;i++)for(const[dx,dy]of [[10,0],[-10,0],[0,10],[0,-10]]){
    const x=q[i].x+dx,y=q[i].y+dy,k=x+','+y;
    if(!visited.has(k)&&M.canWalk(x,y)){visited.add(k);q.push({x,y});}
   }
   check(q.length>100&&q.length<40000,'Área finita e conectada: '+id);
   for(const spot of M.spots())check(q.some(p=>Math.hypot(p.x-spot.x,p.y-spot.y)<42),'Interação acessível: '+id+'/'+spot.id);
   const ev=Object.values(SERVE_EVENTS).find(e=>e.map===M.id);
   if(ev)for(const p of [...ev.seats.map(([x,y])=>({x,y})),...serveBar(ev)])check(M.canWalk(p.x,p.y)&&q.some(v=>Math.hypot(v.x-p.x,v.y-p.y)<32),'Atendimento no evento acessível: '+id+'/'+Math.round(p.x)+','+Math.round(p.y));
   check(M.exitPoint&&M.canWalk(M.exitPoint.x,M.exitPoint.y)&&M.edge(M.exitPoint)?.map==='vila','Saída transitável: '+id+' '+JSON.stringify({point:M.exitPoint,walk:M.exitPoint&&M.canWalk(M.exitPoint.x,M.exitPoint.y),edge:M.exitPoint&&M.edge(M.exitPoint),same:M===WORLD_MAPS[M.id]}));
   if(M.keeperSpot)check(M.canWalk(...M.keeperSpot),'Vendedor em espaço livre: '+id);
   const matrix=ctx.getTransform().toString(),state=JSON.stringify(G),layers=[];
   M.draw({x:0,y:0,w:M.W,h:M.H},()=>true,layers);layers.sort((a,b)=>a.y-b.y).forEach(l=>l.draw());
   check(matrix===ctx.getTransform().toString()&&JSON.stringify(G)===state,'Desenho preserva estado: '+id);
  }
  worldOut={map:'vila',x:1600,y:900,dx:1,dy:0};
  check(personHeight(SADI_SIDE[0],true)===124,'Perfil do Sadi preservado no mundo aberto');
  check(personHeight(PEOPLE.find(p=>p.id==='badin').sprite,false)===124,'Altura dos visitantes preservada');
  worldOut=null;
  for(const map of [null,...Object.values(PAINTED_INTERIORS).map(M=>M.id),'casa:sadi']){
   worldOut=map?{map,x:710,y:740,dx:0,dy:1}:null;
   const height=map==='casa:sadi'?143:130;
   for(const carrying of [false,true])check(Math.abs(sadiPoseSpec(550,700,carrying).height-height)<.01,'Altura da pose e bandeja: '+map+'/'+carrying);
   check(Math.abs(personHeight(0,true)-height)<.01,'Altura de fallback: '+map);
  }
  for(const id of ['agro','gado','atacado','ferragem','acougue']){
   const M=WORLD_MAPS[id];worldOut={map:id,...M.spawn()};const spot=M.spots().find(s=>s.id.startsWith('item:caixa'));
   check(typeof spot?.act==='function','Caixa preserva ação de compra: '+id);
  }
  if(failures.length)throw Error(failures.join('\n'));
  return results;
 }finally{({G,worldOut,ctx,atHome}=before);}
})()
