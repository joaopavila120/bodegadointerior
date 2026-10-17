(() => {
  const old={G,worldOut,worldWalkers,worldWalkersKey,olmiroWalker,olmiroKey,ctx,caveRun,scene,paused,modal,random:Math.random,drawCaveWall};
  const results=[],check=(ok,message)=>{if(!ok)throw Error(message);results.push(message);};
  try {
    G=fresh();G.roadEncounterSeed=123456;G.prologue={done:true};G.tutorial.complete=true;G.regions={serra:true,sc:true};G.phase='prep';scene=null;paused=false;modal=null;
    const ids=['olmiro',...ROAD_RIDERS.map(p=>p.id)];
    for(const id of ids){
      const counts={vila:0,serra:0,sc:0,absent:0};let stable=true;
      for(G.day=1;G.day<=1800;G.day++){const plan=roadEncounterPlan(id);counts[plan?.map||'absent']++;stable=stable&&JSON.stringify(plan)===JSON.stringify(roadEncounterPlan(id));}
      check(stable,'Presença estável no mesmo dia: '+id);
      const total=1800-counts.absent;
      check(counts.absent>550&&counts.absent<900,'Há dias sem visita de '+id);
      check(['vila','serra','sc'].every(m=>counts[m]/total>.28&&counts[m]/total<.38),'Regiões equilibradas: '+id);
    }
    const first=[];for(G.day=1;G.day<=30;G.day++)first.push(roadEncounterPlan('olmiro'));
    const saved=normalizeSave(JSON.parse(JSON.stringify(G)));G=saved;
    let sameSave=true;for(G.day=1;G.day<=30;G.day++)sameSave=sameSave&&JSON.stringify(roadEncounterPlan('olmiro'))===JSON.stringify(first[G.day-1]);check(sameSave,'Save preserva os dias de encontro');
    G.roadEncounterSeed=654321;const second=[];for(G.day=1;G.day<=30;G.day++)second.push(roadEncounterPlan('olmiro'));
    check(JSON.stringify(first)!==JSON.stringify(second),'Jogos novos têm encontros diferentes');
    G.roadEncounterSeed=123456;
    for(const id of ['hans','helga','romio']){
      const map=id==='romio'?'serra':'sc';let visits=0,home=true;
      for(G.day=1;G.day<=100;G.day++){const plan=roadEncounterPlan(id,[map]);if(plan){home=home&&plan.map===map;visits++;}}
      check(home,'Morador permanece na região de origem: '+id);
      check(visits>30&&visits<80,'Morador aparece só em parte dos dias: '+id);
    }
    for(const map of ['vila','serra','sc']){
      const M=WORLD_MAPS[map],R=caveRand(3456),segments=new Set(),directions=new Set(),positions=new Set();let accessible=true;
      for(let k=0;k<500;k++){const w=randomRoadWalker(M,R);segments.add(M.walkLines.indexOf(w.line)+':'+w.seg);directions.add(w.dir);positions.add(Math.round(w.x)+':'+Math.round(w.y));accessible=accessible&&M.canWalk(w.x,w.y);}
      check(accessible,'Encontros em caminhos acessíveis: '+map);
      check(segments.size===M.walkLines.reduce((n,line)=>n+line.length-1,0),'Todas as estradas recebem encontros: '+map);
      check(directions.size===2&&positions.size>450,'Posições e sentidos variados: '+map);
    }
    const synthetic={walkLines:[[[0,0],[100,0]],[[0,100],[900,100]]]},R=caveRand(42);let short=0;
    for(let k=0;k<3000;k++)if(randomRoadWalker(synthetic,R).line===synthetic.walkLines[0])short++;
    check(short>240&&short<360,'Sorteio proporcional ao comprimento evita concentração em trechos curtos');
    let plan;for(G.day=1;G.day<100;G.day++){plan=roadEncounterPlan('olmiro');if(plan)break;}
    worldOut={map:plan.map,x:0,y:0};olmiroKey='';Math.random=()=>.2;olmiroTick(0);const start={x:olmiroWalker.x,y:olmiroWalker.y};
    olmiroTick(.1);check(Math.hypot(olmiroWalker.x-start.x,olmiroWalker.y-start.y)>0,'Olmiro continua caminhando entre quadros');
    worldOut={map:'igreja',x:600,y:700};olmiroTick(0);check(!olmiroWalker,'Olmiro não acompanha o jogador para interiores');
    worldOut={map:plan.map,x:0,y:0};Math.random=()=>.8;olmiroTick(0);check(Math.hypot(olmiroWalker.x-start.x,olmiroWalker.y-start.y)>100,'Revisitar a região varia o ponto de encontro');
    for(G.day=1;G.day<100&&roadEncounterPlan('olmiro');G.day++);olmiroTick(0);check(!olmiroWalker,'Olmiro fica ausente nos dias sem visita');
    Math.random=old.random;
    // Render regressions: no live filters, no atlas scaling in the frame loop,
    // and invisible walls never enter the depth-sorted draw queue.
    const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=800;const target=canvas.getContext('2d');let filters=0;
    ctx=new Proxy(target,{get(t,k){const value=Reflect.get(t,k,t);return typeof value==='function'?value.bind(t):value;},set(t,k,v){if(k==='filter'&&v!=='none')filters++;return Reflect.set(t,k,v,t);}});
    G.day=5;G.cave={floor:11,up:{},hp:100,dunstanTaught:true};worldOut={map:'caverna',x:500,y:600,dx:0,dy:1};caveRun=null;
    const run=caveFloorRun(),tiles=[];for(const deep of [false,true])for(const variant of [0,1])tiles.push(caveWallTile(variant,deep));
    for(let frame=0;frame<3;frame++)for(let y=0;y<CAVE.rows;y++)for(let x=0;x<CAVE.cols;x++)if(run.grid[y][x])drawCaveWall(x,y,run);
    check(filters===0,'Paredes profundas não aplicam filtros durante o desenho');
    check(caveWallTiles.size===4&&tiles.every(t=>t.width===CAVE.cell&&t.height===CAVE.cell+26),'Cache limitado a quatro texturas pequenas');
    check(caveWallTile(0,true)===tiles[2]&&caveWallTile(1,true)===tiles[3],'Paredes reaproveitam as mesmas texturas');
    // Browsers intentionally block pixel readback of local-file image canvases.
    if(location.protocol!=='file:')check(tiles[0].toDataURL()!==tiles[2].toDataURL(),'Andares profundos preservam a cor vermelha');
    for(const view of [{x:0,y:0,w:500,h:400},{x:417,y:345,w:500,h:400}]){
      const walls=[],layers=[];drawCaveWall=(x,y)=>walls.push([x,y]);WORLD_MAPS.caverna.draw(view,()=>true,layers);layers.sort((a,b)=>a.y-b.y).forEach(l=>l.draw());
      const expected=[];for(let y=0;y<CAVE.rows;y++)for(let x=0;x<CAVE.cols;x++)if(run.grid[y][x]&&x*CAVE.cell<=view.x+view.w+12&&(x+1)*CAVE.cell>view.x-12&&y*CAVE.cell-26<=view.y+view.h+12&&(y+1)*CAVE.cell>view.y-12)expected.push(x+':'+y);
      check(walls.map(([x,y])=>x+':'+y).sort().join()===expected.sort().join(),'Culling preserva todas as paredes visíveis e suas bordas');
      check(walls.length<run.grid.flat().filter(Boolean).length/2,'Paredes fora da câmera não são desenhadas');
    }
    return results;
  } finally {
    Math.random=old.random;({G,worldOut,worldWalkers,worldWalkersKey,olmiroWalker,olmiroKey,ctx,caveRun,scene,paused,modal,drawCaveWall}=old);
  }
})()
