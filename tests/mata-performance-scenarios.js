(()=>{
  const checks=[],check=(v,s)=>{if(!v)throw Error(s);checks.push(s);};
  G=fresh();G.day=4;G.prologue={done:true};G.tutorial.complete=true;G.mataSeen=1;
  caveState().facao=true;mataState().metGaribaldi=1;mataState().xp=1200;
  started=true;closeDialog(true);paused=false;scene=null;phoneOpen=false;
  $('start').classList.add('hidden');const results=[];
  for(const n of [6,8,11,12,14,16,20,21,22,25,28,31]){
    mataState().trecho=n;worldOut={map:'trecho',x:90,y:900,dx:0,dy:1};trechoCache=null;mataNight=null;mataFauna=null;
    let start=performance.now();const T=trechoLayout(),generation=performance.now()-start;
    const q=T.trails[0].pts[Math.floor(T.trails[0].pts.length*.4)];worldOut.x=q[0];worldOut.y=q[1];
    start=performance.now();trechoBeastsStart();const spawn=performance.now()-start;
    let tick=0,drawTime=0,cold=0,error=null;
    try{
      start=performance.now();for(let i=0;i<120;i++){mataNight.inv=99;mataFaunaTick(1/60);mataCombatTick(1/60);}tick=(performance.now()-start)/120;
      paused=true;start=performance.now();draw();cold=performance.now()-start;
      start=performance.now();for(let i=0;i<60;i++)draw();drawTime=(performance.now()-start)/60;
      closeDialog(true);skipWorldTalk();scene=null;paused=false;
      check(!mataFauna,'no peaceful fauna deep in the forest: '+n);
      check(MATA_SPRITE_CACHE.size<=MATA_SPRITE_LIMIT&&mataSpritePixels<=MATA_SPRITE_PIXEL_LIMIT,'bounded sprite memory: '+n);
    }catch(e){error=e.message;}
    results.push({n,generation:Math.round(generation),spawn:Math.round(spawn),tick:+tick.toFixed(2),cold:Math.round(cold),draw:+drawTime.toFixed(2),error});
    paused=false;closeDialog(true);skipWorldTalk();scene=null;
  }
  for(const r of results)check(!r.error,'active fauna/combat/render '+r.n+': '+r.error);
  // Quatis só no trecho 1 (o pinheiral do Garibaldi): fogem e terminam sem recomeçar.
  worldOut={map:'mata',x:1300,y:1055,dx:0,dy:1};
  mataFauna={day:G.day,quatis:[{x:worldOut.x+20,y:worldOut.y,k:0,frame:0,state:'walk',lead:true,dx:1,tree:null}],tatus:[],goal:{x:worldOut.x+200,y:worldOut.y},bandoBack:0};
  for(let i=0;i<300;i++)mataFaunaTick(1/60);
  check(!mataFauna.quatis.length&&mataFauna.bandoBack>0,'flee finishes without restarting');
  // A tree at the destination must still allow climbing.
  const tree={x:worldOut.x+20,y:worldOut.y};
  const climber={...tree,k:0,frame:0,state:'flee',tree,dx:1};
  mataFauna={day:G.day,quatis:[climber],tatus:[],bandoBack:0};
  mataFaunaTick(1/60);check(climber.state==='climb','tree escape still climbs');
  for(let i=0;i<120;i++)mataFaunaTick(1/60);
  check(!mataFauna.quatis.length,'climbed group despawns');
  // Blocked ground escape remains bounded, without trying new paths every frame.
  const free=mataFree;let probes=0;
  try{
    mataFree=()=>{probes++;return false;};
    mataFauna={day:G.day,quatis:[{x:worldOut.x+20,y:worldOut.y,k:0,frame:0,state:'flee',tree:null}],tatus:[],bandoBack:0};
    for(let i=0;i<300;i++)mataFaunaTick(1/60);
    check(!mataFauna.quatis.length&&probes<60,'blocked escape is bounded');
  }finally{mataFree=free;}
  const spot=mataSpotNear;let attempts=0;
  try{
    mataSpotNear=()=>{attempts++;return null;};
    mataFauna={day:G.day,quatis:[],tatus:[],bandoBack:0};
    for(let i=0;i<120;i++)mataFaunaTick(1/60);
    check(attempts===1,'failed spawn retries after delay');
  }finally{mataSpotNear=spot;}
  // Cache reuses a crop, evicts old sizes, and accounts for all retained pixels.
  const saved=ctx;ctx=document.createElement('canvas').getContext('2d');
  try{
    for(let i=0;i<300;i++)mataArtRect('mata-nature',MATA_NATURE_RECTS[0],0,0,30+i,30);
    const before=[...MATA_SPRITE_CACHE.values()].at(-1),size=MATA_SPRITE_CACHE.size;
    mataArtRect('mata-nature',MATA_NATURE_RECTS[0],5,5,329,30);
    check([...MATA_SPRITE_CACHE.values()].at(-1)===before&&MATA_SPRITE_CACHE.size===size,'reuses scaled sprite');
    check(size<=MATA_SPRITE_LIMIT&&mataSpritePixels<=MATA_SPRITE_PIXEL_LIMIT,'sprite eviction is bounded');
    check([...MATA_SPRITE_CACHE.values()].reduce((n,c)=>n+c.width*c.height,0)===mataSpritePixels,'sprite memory accounting');
  }finally{ctx=saved;}
  paused=true;return {checks:checks.length,metrics:results};
})()
