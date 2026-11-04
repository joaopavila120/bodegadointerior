(() => {
  const out = {}, prev=ctx, prevOut=worldOut;
  const groups={
    ilha:['bruxa','bruxa-mor','pirata','afogado','mariposa','minhocao','bernuncia','bernuncia-mae'],
    mata:['mula','queixada','jararaca','cascavel','cachaco','papo','nereu','griggs']
  };
  try{
    worldOut=null;
    for(const[name,ids]of Object.entries(groups)){
      const c=document.createElement('canvas');c.width=1440;c.height=1160;ctx=c.getContext('2d');
      ctx.fillStyle='#394139';ctx.fillRect(0,0,c.width,c.height);
      for(let n=0;n<ids.length;n++){
        const id=ids[n],x=(n%2)*720,y=Math.floor(n/2)*290;
        ctx.fillStyle='#f3e3b9';ctx.font='20px sans-serif';ctx.textAlign='center';ctx.fillText(id,x+360,y+32);
        const frames=['nereu','griggs'].includes(id)?[0,5,11]:[1,4,5],size=['bruxa','bruxa-mor','pirata','afogado','nereu','griggs'].includes(id)?165:190;
        frames.forEach((f,j)=>creatureSprite(id,f,x+130+j*230+(id.startsWith('bernuncia')?48:0),y+253,size));
      }
      out[name]=c.toDataURL('image/png');
    }
    return out;
  }finally{ctx=prev;worldOut=prevOut;}
})()
