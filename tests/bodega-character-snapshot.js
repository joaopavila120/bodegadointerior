(() => {
  const before={G,worldOut,ctx,frameClock},out={};
  try{
    G=fresh();worldOut=null;frameClock=100;
    const c=document.createElement('canvas');c.width=400;c.height=260;ctx=c.getContext('2d');
    for(const p of PEOPLE.filter(p=>!p.removed))for(const [label,walk,dx,dy,seated]of [['idle',false,0,1,false],['front',true,0,1,false],['side',true,1,0,false],['back',true,0,-1,false],['seated',false,0,1,true]]){
      ctx.clearRect(0,0,400,260);walkTracks.length=0;secondaryTracks.length=0;
      personDraw(p.sprite,200,220,walk,false,dx,seated,0,dy);
      let hash=2166136261;for(const n of ctx.getImageData(0,0,400,260).data)hash=Math.imul(hash^n,16777619)>>>0;
      out[p.id+':'+label]=hash;
    }
  }finally{({G,worldOut,ctx,frameClock}=before);}
  return out;
})()
