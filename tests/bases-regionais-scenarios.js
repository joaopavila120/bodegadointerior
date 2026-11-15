(()=>{
  const results=[],check=(v,m)=>{if(!v)throw Error(m);results.push(m);};
  G=fresh();G.day=40;G.prologue={done:true};G.tutorial.complete=true;
  G.ilha={folks:{joaomaria:1,canabarro:1}};
  G.pampa={area:1,folk:{neto:1,anita:1,lanceiro:1,canabarro:1},republica:1};
  const doors=[266,285,320,230,315,218];
  for(let i=0;i<BASE_LOTES.length;i++){
    const l=BASE_LOTES[i],im=baseArte(l),scale=Math.min(l.w/im.naturalWidth,l.h/im.naturalHeight);
    check(doors[i]*scale>=110&&doors[i]*scale<=145,l.id+': doorway fits adult scale');
  }
  for(const map of ['ilha','pampa']){
    worldOut={map,x:map==='ilha'?3000:1900,y:map==='ilha'?4720:830,dx:0,dy:1};
    const M=WORLD_MAPS[map],lotes=baseLotesAqui();
    // Flood the playable courtyard at 20px spacing; no wall or house may cut off a resident.
    const step=20,origin={x:worldOut.x,y:worldOut.y},queue=[[0,0]],seen=new Set(['0:0']);
    const bounds=map==='ilha'?[2200,3500,4450,4930]:[550,190,3700,1950];
    for(let i=0;i<queue.length;i++){
      const [gx,gy]=queue[i];
      for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]]){
        const nx=gx+dx,ny=gy+dy,key=nx+':'+ny,x=origin.x+nx*step,y=origin.y+ny*step;
        if(seen.has(key)||x<bounds[0]||y<bounds[1]||x>bounds[2]||y>bounds[3])continue;
        if(!M.canWalk(x,y)||!M.canWalk(x-dx*step/2,y-dy*step/2))continue;
        seen.add(key);queue.push([nx,ny]);
      }
    }
    const reaches=p=>queue.some(([gx,gy])=>Math.hypot(origin.x+gx*step-p.x,origin.y+gy*step-p.y)<32);
    for(const l of lotes){
      const f=baseFrente(l),p=basePe(l);
      check(M.canWalk(f.x,f.y),l.id+': doorstep clear');
      check(reaches(f),l.id+': connected to arrival path');
      check(!M.canWalk(p.x+p.w/2,p.y+p.h/2),l.id+': building solid');
    }
    for(const m of baseMoradores())check(reaches(m),map+': resident accessible '+m.id);
    // A pre-update position inside the old lot must not trap the player in the enlarged facade.
    const l=lotes[0],p=basePe(l);
    worldOut={map,x:p.x+p.w/2,y:p.y+p.h/2,dx:0,dy:1};
    outsideTick(0);
    check(M.canWalk(worldOut.x,worldOut.y),map+': old save moved to clear porch');
  }
  return results;
})()
