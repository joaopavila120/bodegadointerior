(()=>{
  const previous={G,worldOut,caveRun,ctx,paused,scene,modal};
  const checks=[],check=(ok,msg)=>{if(!ok)throw Error(msg);checks.push(msg);};
  try{
    G=fresh();G.day=4;G.prologue={done:true};G.tutorial.complete=true;G.regions={serra:true,sc:true};paused=true;scene=null;modal=null;
    check(Object.values(ENV_ART).every(i=>i.naturalWidth),'all new art loaded');
    for(const id of ['vila','serra','sc']){
      worldOut={map:id,x:1000,y:1000};const M=WORLD_MAPS[id],items=environmentGardens(M);
      check(items.length>0,'composed gardens: '+id);
      check(items.length<=18&&items.filter(p=>p.i===4).length<=2,'limited garden and barrel groups: '+id);
      check(items.every((p,i)=>items.slice(i+1).every(q=>Math.hypot(p.x-q.x,p.y-q.y)>=210)),'garden groups are spaced apart: '+id);
      if(id==='sc')check(items.filter(p=>p.i===2).length<=worldDressing(M).buildings.length,'SC has at most one small flower bed per building');
      check(items===environmentGardens(M),'garden cache: '+id);
      for(const p of items){
        check(M.canWalk(p.x,p.y),'low decoration on land: '+id);
        const a={x:p.x-p.w/2,y:p.y-p.h,w:p.w,h:p.h};
        check(!worldDressing(M).roads.some(([x,y,w,h])=>a.x<x+w&&a.x+a.w>x&&a.y<y+h&&a.y+a.h>y),'clear roads: '+id);
      }
    }
    const canvas=document.createElement('canvas');canvas.width=1760;canvas.height=1120;ctx=canvas.getContext('2d');
    let previousGround=null;
    for(const n of [2,5,10,11,20,25]){
      G.cave={facao:true,floor:n,hp:100,up:{}};caveRun=null;worldOut={map:'caverna',...caveCenter(...CAVE.start)};
      const run=caveFloorRun(),grid=JSON.stringify(run.grid),rocks=JSON.stringify(run.rocks),beasts=JSON.stringify(run.beasts);
      drawCaveFloor({x:0,y:0,w:1760,h:1120});const ground=environmentCaveGround;
      for(let i=0;i<5;i++)drawCaveFloor({x:0,y:0,w:1760,h:1120});
      check(ground===environmentCaveGround,'static floor reused: '+n);
      if(previousGround)check(previousGround.width===0,'previous floor released: '+n);
      previousGround=ground;
      for(let y=0;y<CAVE.rows;y++)for(let x=0;x<CAVE.cols;x++)if(run.grid[y][x])drawCaveWall(x,y,run);
      for(const r of run.rocks)drawCaveRock(r);
      check(JSON.stringify(run.grid)===grid&&JSON.stringify(run.rocks)===rocks&&JSON.stringify(run.beasts)===beasts,'render preserves collision and gameplay: '+n);
      for(const p of environmentCaveDetails(run))check(caveWall(p.x,p.y),'mine details stay inside existing solid walls: '+n);
      check(cavePlayerFree(worldOut.x,worldOut.y),'spawn remains accessible: '+n);
    }
    check(environmentWallFaces.size<=6,'six cached wall faces maximum');
    const before=environmentCaveGround;G.cave.floor=1;caveRun=null;drawCaveFloor({x:0,y:0,w:800,h:600});
    check(environmentCaveGround===before,'first floor remains on its own renderer');
    check(ENV_SPRITES.size<=96,'bounded decorative sprite cache');
    return checks;
  }finally{({G,worldOut,caveRun,ctx,paused,scene,modal}=previous);}
})()
