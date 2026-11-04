(() => {
  const results=[],check=(ok,message)=>{if(!ok)throw Error(message);results.push(message);};
  G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.phase='prep';G.day=40;
  scene=null;phoneOpen=false;closeDialog(true);skipWorldTalk();started=true;paused=true;
  for(const[id,a]of Object.entries(ISLAND_ATLAS)){
    const im=ISLAND_ART[id];check(im?.naturalWidth===a.size[0]&&im.naturalHeight===a.size[1],id+' image loaded');
    for(const[x,y,w,h]of a.rects)check(w>0&&h>0&&x>=0&&y>=0&&x+w<=im.naturalWidth&&y+h<=im.naturalHeight,id+' valid crop');
  }
  check(personHeight(0,true)===130,'bodega character scale unchanged');
  check(new Set(WORLD_MAPS.ilha.spots().map(s=>s.id)).size===WORLD_MAPS.ilha.spots().length,'island interactions keep unique IDs');
  const walk=WORLD_MAPS.ilha.canWalk.bind(WORLD_MAPS.ilha);
  for(const p of [ILHA.arrive,{x:3200,y:1870},{x:3200,y:1660},{x:3745,y:1496},...WORLD_MAPS.ilha.spots().filter(s=>s.info)])check(walk(p.x,p.y),'island destination walkable '+(p.id||[p.x,p.y]));
  // Flood the actual collision map, including vegetation and new footprints.
  function reachable(map,start,targets,step){
    const cols=Math.ceil(map.W/step),rows=Math.ceil(map.H/step),visited=new Uint8Array(cols*rows),q=[];
    const sx=Math.round(start.x/step),sy=Math.round(start.y/step);q.push(sy*cols+sx);visited[q[0]]=1;
    for(let i=0;i<q.length;i++){
      const p=q[i],x=p%cols,y=Math.floor(p/cols);
      for(const[dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){
        const xx=x+dx,yy=y+dy,n=yy*cols+xx;if(xx<0||yy<0||xx>=cols||yy>=rows||visited[n])continue;
        // Check midpoints too: a coarse grid must not jump through a wall.
        if(map.canWalk(xx*step,yy*step)&&map.canWalk((x+dx*.5)*step,(y+dy*.5)*step)){visited[n]=1;q.push(n);}
      }
    }
    for(const p of targets){const xx=Math.round(p.x/step),yy=Math.round(p.y/step);check(visited[yy*cols+xx]===1,'route to '+map.id+' '+(p.id||[p.x,p.y]));}
  }
  const spots=WORLD_MAPS.ilha.spots();
  reachable(WORLD_MAPS.ilha,ILHA.arrive,spots.filter(s=>['ilha:capela','ilha:ranchos','ilha:armazem-sal','ilha:farol'].includes(s.id)).concat([{x:3200,y:2080}]),20);
  reachable(WORLD_MAPS.ilha,{x:3200,y:1870},spots.filter(s=>s.id.startsWith('ilha:predio:')||['ilha:cisterna','ilha:masmorra'].includes(s.id)),20);
  reachable(WORLD_MAPS.masmorra,WORLD_MAPS.masmorra.spawn(),[{x:1400,y:190},{x:800,y:1200},{x:1980,y:700}],10);
  check(!masmFloor(600,1200)&&!masmFloor(1290,600),'closed cells and dungeon walls stay solid');
  check(masmFloor(1400,308)&&masmFloor(375,450)&&masmFloor(2420,950),'touching corridors have no invisible seam');
  worldOut={map:'masmorra',x:1400,y:1375,dx:1,dy:0};mataNight=null;
  const surface=islandDungeonSurface();check(surface?.width===MASM.W&&surface.height===MASM.H,'bounded dungeon cache created');
  for(let i=0;i<30;i++)drawMasmorra({x:900,y:900,w:1000,h:900},()=>true,[]);
  check(surface===islandDungeonSurface(),'dungeon cache reused between frames');
  const clue=ilhaState().pista;ilhaState().pista=40;drawMasmorra({x:900,y:0,w:1000,h:900},()=>true,[]);
  check(surface===islandDungeonSurface(),'collecting clue does not rebuild static dungeon');ilhaState().pista=clue;
  check(WORLD_MAPS.ilha.spots().find(s=>s.id==='ilha:masmorra').act===masmorraEntra,'stairs still enter dungeon');
  check(WORLD_MAPS.masmorra.spots().find(s=>s.id==='masmorra:subir').act===masmorraSai,'stairs still exit dungeon');
  return results;
})()
