(()=>{
  const saved={ctx,mataArtRect},checks=[],check=(v,s)=>{if(!v)throw Error(s);checks.push(s);};
  try{
    check(typeof mataBugioTick==='undefined'&&typeof drawBugioVulto==='undefined'&&typeof bugioHowl==='undefined','bugio removed including sound');
    const im=MATA_ART['mata-fauna-walk'];check(im.naturalWidth>0,'animated atlas loaded');
    for(const row of MATA_FAUNA_WALK_RECTS)for(const [x,y,w,h]of row)check(x>=0&&y>=0&&x+w<=im.naturalWidth&&y+h<=im.naturalHeight,'frame within atlas');
    const c=document.createElement('canvas');c.width=800;c.height=480;ctx=c.getContext('2d');
    let calls=[];mataArtRect=function(id,r,x,y,w,h){calls.push({id,r,x,y,w,h,flip:ctx.getTransform().a,alpha:ctx.globalAlpha});return saved.mataArtRect(id,r,x,y,w,h);};
    for(const [species,draw]of [[0,drawQuati],[1,drawTatu]]){
      calls=[];
      for(let f=0;f<4;f++)draw({x:100,y:180,frame:f,state:'walk',dx:1});
      check(new Set(calls.map(p=>p.r.join(','))).size===4,'four actual walking frames '+species);
      check(calls.every(p=>p.id==='mata-fauna-walk'),'uses new sprite sheet '+species);
      calls=[];
      for(const f of [0,1,2,3,10])draw({x:100,y:180,frame:f,state:'sniff',dx:1});
      check(new Set(calls.map(p=>p.r.join(','))).size===1,'stationary pose does not walk '+species);
      calls=[];draw({x:100,y:180,frame:1,state:'walk',dx:1});draw({x:100,y:180,frame:1,state:'walk',dx:-1});
      check(calls[0].flip*calls[1].flip<0,'mirrors when turning '+species);
      check(mataFaunaPose(species,{state:species?'run':'flee',frame:2})===3,'faster escape cycle '+species);
    }
    calls=[];drawQuati({state:'escaped'});drawTatu({state:'hidden'});check(!calls.length,'hidden animals are not rendered');
    calls=[];drawQuati({x:100,y:180,frame:1,state:'flee',fleeT:3.5,dx:1,tree:null});
    check(Math.abs(calls[0].alpha-.5)<.01,'ground escape still fades');
    let birdImages=0;const drawImage=ctx.drawImage;ctx.drawImage=function(...a){birdImages++;return drawImage.apply(this,a);};
    drawCharao(200,100,1,false);drawCharao(200,100,-1,true,1);
    check(birdImages===0,'bird restored to original canvas animation for perch and flight');
    return checks;
  }finally{({ctx,mataArtRect}=saved);}
})()
