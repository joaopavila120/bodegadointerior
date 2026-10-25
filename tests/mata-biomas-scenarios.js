(()=>{
  const results=[],check=(v,s)=>{if(!v)throw Error(s);results.push(s);};
  G=fresh();G.day=4;G.prologue={done:true};G.tutorial.complete=true;G.mataSeen=1;G.cash=5000;
  caveState().facao=true;mataState().metGaribaldi=1;mataState().xp=1200;
  worldOut={map:'mata',...garibaldiFront(),dx:0,dy:1};started=true;paused=true;
  check(TRECHO.last===31&&TRECHO.camps.join()==='6,11,16,21,26,31','progressão: 31 trechos e acampamentos a cada cinco');
  for(const [n,b] of [[2,'mata'],[11,'mata'],[12,'encosta'],[21,'encosta'],[22,'restinga'],[31,'restinga'],[32,'laguna']])check(trechoBiome(n)===b,'região do trecho '+n);
  check(TRECHO_BOSSES[11]==='cachaco'&&TRECHO_BOSSES[21]==='papo','chefes no fim do pinheiral e da encosta');
  check(!GOODS.sapecado&&typeof fogoSapecar==='undefined'&&!FIXED.some(f=>f.id==='shop:sapecado'),'sapecar pinhão removido');
  check(WORLD_MAPS.mata.canWalk(garibaldiFront().x,garibaldiFront().y),'porta do refúgio acessível');
  check(enterInterior('casa:garibaldi')&&worldOut.map==='casa:garibaldi','entra no refúgio');closeDialog(true);
  const room=WORLD_MAPS['casa:garibaldi'];
  check(room.canWalk(worldOut.x,worldOut.y),'nasce em piso caminhável');
  for(const [x,y] of [[760,825],[760,730],[760,650],[1100,420],[785,420],[380,445]]){const p=garibaldiRoomPoint(x,y);check(room.canWalk(p.x,p.y),'interação do refúgio acessível '+x+','+y);}
  for(const [x,y,w,h] of GARIBALDI_ROOM_SOLIDS){const p=garibaldiRoomPoint(x+w/2,y+h/2);check(!room.canWalk(p.x,p.y),'mobiliário sólido');}
  check(room.edge(garibaldiRoomPoint(760,975)).map==='mata','saída devolve à mata');
  garibaldiTab='bornal';garibaldiShop();check(modal==='garibaldiShop'&&$('dialogContent').querySelector('.mata-item-art'),'bornal da loja com arte própria');garibaldiTab='loja';garibaldiShop();check($('dialogContent').querySelector('[data-act="forjaMake"] , [data-act="forjaEquip"]'),'loja do rancho com as armas da ferraria');closeDialog(true);
  caveState().hp=10;ranchoRest();check(caveState().hp===caveMaxHp(),'acampamento recupera vida');
  bagAdd('erva_verde',3);const e=G.stock.erva||0;barbaquaSecar();check(G.stock.erva===e+3*BARBAQUA_G&&!bagQty('erva_verde'),'barbaquá continua secando erva');closeDialog(true);
  for(const day of [4,17])for(let n=2;n<=TRECHO.last;n++){
    G.day=day;mataState().trecho=n;worldOut.map='trecho';const T=trechoLayout();
    check(T.biome===trechoBiome(n),'geração regional '+day+'/'+n);
    if(T.biome==='restinga')check(T.flora.trees.every(t=>['butia','jeriva','folha'].includes(t.art)),'restinga: butiazais e palmeiras '+n);
    if(T.biome==='encosta')check(T.flora.trees.some(t=>t.art==='xaxim'||t.art==='folha'),'encosta: mata de folha larga e xaxim '+n);
    // Flood-fill actual movement, including solids and the river crossing, not just the trail's drawing.
    const cw=T.open.cw,ch=T.open.ch,visited=new Uint8Array(cw*ch),q=[];
    const start=Math.floor(T.yIn/20)*cw+4;q.push(start);visited[start]=1;
    for(let at=0;at<q.length;at++){
      const k=q[at],x=k%cw,y=Math.floor(k/cw);
      for(const [dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+dx,ny=y+dy,j=ny*cw+nx;if(nx<0||ny<0||nx>=cw||ny>=ch||visited[j])continue;if(!WORLD_MAPS.trecho.canWalk(nx*20+10,ny*20+10))continue;visited[j]=1;q.push(j);}
    }
    const reached=(x,y,r=80)=>q.some(k=>Math.hypot(k%cw*20+10-x,Math.floor(k/cw)*20+10-y)<r);
    check(reached(T.W-70,T.yOut),'rota entrada/saída '+day+'/'+n);
    if(T.camp)check(reached(T.camp.x-60,T.camp.y+70),'acampamento alcançável '+n);
    for(const r of T.resources)check(reached(r.x,r.y+(r.kind==='butia'?0:0),110),'recurso alcançável '+day+'/'+n+'/'+r.id);
    if(T.beach){check(!WORLD_MAPS.trecho.canWalk(800,trechoShoreY(800)+10),'mar bloqueado '+n);check(reached(T.trails.find(t=>t.id==='praia').pts.at(-1)[0],TRECHO.shoreY-150,120),'desce até a praia '+n);}
  }
  G.day=4;
  for(const [id,im]of Object.entries(MATA_ART))check(im.complete&&im.naturalWidth>0,'arte carregada '+id);
  check(MATA_GEAR_IDS.every(id=>mataGearHTML(id).includes('<svg')),'todos os equipamentos com sprite');
  for(const [name,rects]of [['mata-nature',MATA_NATURE_RECTS],['mata-gear',MATA_GEAR_RECTS],['mata-fauna',MATA_FAUNA_RECTS],['mata-cliffs',MATA_CLIFF_RECTS]])for(const [x,y,w,h]of rects)check(x>=0&&y>=0&&x+w<=MATA_ART[name].naturalWidth&&y+h<=MATA_ART[name].naturalHeight,'recorte dentro do atlas '+name);
  mataState().trecho=15;worldOut.map='trecho';const T=trechoLayout();
  const oldPaint=paintTrechoTerrain;let paints=0;
  paintTrechoTerrain=function(...args){paints++;return oldPaint(...args);};
  try{trechoTiles.clear();const view={x:500,y:800,w:600,h:450};drawTrechoTerrain(T,view);const first=paints;drawTrechoTerrain(T,view);check(first>0&&paints===first,'terreno reutilizado sem repintar cada quadro');check(trechoTiles.size<=TRECHO_TILE_LIMIT,'cache de terreno limitado');}finally{paintTrechoTerrain=oldPaint;}
  const p=T.resources.find(r=>r.kind==='pinha'||r.kind==='erva');if(p){const qty=(G.stock.pinhao||0)+bagQty('erva_verde');trechoCollect(T,p);const once=(G.stock.pinhao||0)+bagQty('erva_verde');trechoCollect(T,p);check(once>qty&&(G.stock.pinhao||0)+bagQty('erva_verde')===once,'coleta não duplica recurso');}
  // A barra de Laguna e o convés do navio.
  const L=WORLD_MAPS.laguna,Nv=WORLD_MAPS.navio;
  check(L.canWalk(90,LAGUNA.entryY)&&!L.canWalk(800,lagunaShoreY(800)+20)&&!L.canWalk(LAGUNA.barraX+60,900),'Laguna: entra pela restinga, o mar e a barra não se andam');
  check(Nv.canWalk(Nv.spawn().x,Nv.spawn().y)&&!Nv.canWalk(1100,300)&&!Nv.canWalk(NAVIO.masts[0][0],NAVIO.masts[0][1]),'navio: convés caminhável, mar e mastro não');
  return results;
})()
