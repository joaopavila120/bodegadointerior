(()=>{
  const previous={G,worldOut,ctx,playerAnimation,frameClock,started,paused};
  const raf=window.requestAnimationFrame,caf=window.cancelAnimationFrame;
  const check=(ok,label)=>{if(!ok)throw Error(label);results.push(label);},results=[],pending=new Map();let next=0;
  try{
    G=fresh();G.day=4;G.tutorial.complete=true;G.prologue={done:true};started=true;paused=true;
    worldOut={map:'vila',x:400,y:920,dx:1,dy:0};
    window.requestAnimationFrame=fn=>{pending.set(++next,fn);return next;};window.cancelAnimationFrame=id=>pending.delete(id);
    startFishing();const first=fishing,oldFrame=[...pending.values()][0];
    startFishing();check(pending.size===1,'reopening leaves exactly one fishing loop');
    const current=fishing;oldFrame(performance.now());check(fishing===current&&pending.size===1,'stale callbacks cannot draw or advance a new session');
    const drawState=JSON.stringify({worldOut,hands:G.hands,player:G.player}),animation=playerAnimation;
    fishDraw();check(playerAnimation===animation&&JSON.stringify({worldOut,hands:G.hands,player:G.player})===drawState,'fishing drawing does not touch world animation or carried items');
    const cv=$('fishCanvas'),surface=fishing.surface,msg=$('fishMsg').firstChild,pixels=()=>cv.toDataURL();
    const before=pixels();for(let i=0;i<8;i++)fishDraw();
    check(before===pixels(),'identical simulation state renders identical complete frames');
    check(fishing.surface===surface&&$('fishMsg').firstChild===msg,'frame buffer and message node reused');
    fishKey(true);fishTick(.4);const charge=fishing.charge;fishKey(true);
    check(fishing.charge===charge,'duplicate press cannot restart the charge');
    fishKey(false);check(fishing.phase==='fly','release casts');
    for(let i=0;i<15;i++)fishTick(.05);check(fishing.phase==='wait','cast reaches the water');
    fishing.biteIn=0;fishTick(.05);fishKey(true);check(fishing.phase==='fight','bite can be hooked');
    const splashes=fishing.splash.length;fishing.run=1;fishDraw();fishDraw();
    check(fishing.splash.length===splashes,'drawing does not create random simulation particles');
    window.dispatchEvent(new Event('blur'));check(!fishing.holding,'losing focus releases the reel');
    closeDialog(true);const id=fishAnimationFrame,callback=pending.get(id);pending.delete(id);callback(performance.now());
    check(fishing===null&&pending.size===0,'closing ends the cast and its loop');
    const canvas=document.createElement('canvas');canvas.width=800;canvas.height=700;ctx=canvas.getContext('2d');
    for(const map of ['serra','sc']){
      worldOut={map,x:1000,y:1000};const M=WORLD_MAPS[map],before=JSON.stringify(worldDressing(M).props),obstacles=JSON.stringify(M.obstacles);
      const kinds=new Set();for(const p of worldDressing(M).props.filter(p=>p.sheet==='nature'&&p.index<3)){
        const i=regionalFloraIndex(map,p.index,p.x,p.y);kinds.add(i);worldTreeSprite(p.index,p.x,p.y,p.w,p.h);
      }
      check(map==='serra'?kinds.size===1&&kinds.has(null):kinds.has(null)&&kinds.has(0)&&kinds.has(1),'native trees remain predominant with occasional ipes: '+map);
      if(map==='sc'){
        const ipes=regionalIpes();check(ipes.length>=2&&ipes.length<=5,'SC has at most five ipes');
        check(ipes.every((p,i)=>ipes.slice(i+1).every(q=>Math.hypot(p.x-q.x,p.y-q.y)>=600)),'ipes are spread across the map');
      }
      paintRegionalTerrain(M,{x:900,y:700,w:512,h:512});
      check(JSON.stringify(worldDressing(M).props)===before&&JSON.stringify(M.obstacles)===obstacles,'regional art preserves clearings and collision: '+map);
    }
    check(regionalFloraIndex('vila',1,40,50)===null,'Fronteira keeps its approved tree art');
    for(const id of ['vila','serra','sc']){
      const M=WORLD_MAPS[id];worldOut={map:id,x:1000,y:1000};
      const before=JSON.stringify(M.obstacles),trees=regionalExtraTrees(M),layout=JSON.stringify(trees);
      check(trees.length>=4&&trees.length<=12&&new Set(trees.map(t=>t.i)).size===4,'four tree varieties with restrained density: '+id+' ('+trees.length+' trees)');
      check(trees===regionalExtraTrees(M),'tree placement is cached: '+id);
      regionalExtraTreeCache.delete(id);
      check(layout===JSON.stringify(regionalExtraTrees(M)),'tree placement survives cache rebuild: '+id);
      for(const t of trees){
        const r={x:t.x-t.w/2,y:t.y-t.h,w:t.w,h:t.h};
        const overlaps=b=>r.x<b.x+b.w&&r.x+r.w>b.x&&r.y<b.y+b.h&&r.y+r.h>b.y;
        check(M.canWalk(t.x,t.y)&&!worldDressingBuildings(id).some(overlaps)&&!worldDressingRoads(id).some(([x,y,w,h])=>overlaps({x,y,w,h})),'new tree leaves buildings and paths clear: '+id);
      }
      check(before===JSON.stringify(M.obstacles),'decorative trees preserve collision: '+id);
    }
    for(const map of ['serra','sc']){
      const b=worldDressingBuildings(map)[0];
      check(!regionalTreeClear(map,b.x+b.w/2,b.y+b.h+50,280,400),'tree crowns cannot hide a facade: '+map);
      const [x,y,w,h]=regionalRoads(WORLD_MAPS[map])[0];
      check(!regionalTreeClear(map,x+w/2,y+h+50,280,400),'tree crowns leave the road visible: '+map);
    }
    {const original=worldOut;worldOut={map:'mata',...WORLD_MAPS.mata.spawn()};
      const spot=mataSpotNear,free=mataFree,fauna=mataFauna;
      try{mataFauna={};mataSpotNear=()=>({x:500,y:500});mataFree=(x,y)=>x>=495&&x<=505&&y>=495&&y<=505;
        mataBandoSpawn(()=>.5,worldOut);check(mataFauna.quatis.length===4&&mataFauna.quatis.every(q=>mataFree(q.x,q.y)),'followers spawn on land even beside narrow paths');
      }finally{mataSpotNear=spot;mataFree=free;mataFauna=fauna;worldOut=original;}}
    for(const map of ['serra','sc'])for(let i=0;i<6;i++)check(Number.isInteger(regionalDetailIndex(map,i)),'matching low decoration '+map+':'+i);
    check(ENV_SPRITES.size<=96,'regional sprites use the existing bounded cache');
    return results;
  }finally{
    window.requestAnimationFrame=raf;window.cancelAnimationFrame=caf;fishing=null;fishAnimationFrame=0;closeDialog(true);
    ({G,worldOut,ctx,playerAnimation,frameClock,started,paused}=previous);
  }
})()
