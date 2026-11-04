(() => {
  const c=document.createElement('canvas');c.width=1120;c.height=1060;
  const main=ctx;ctx=c.getContext('2d');
  try{
    ctx.fillStyle='#343c32';ctx.fillRect(0,0,c.width,c.height);
    ctx.font='bold 20px sans-serif';ctx.fillStyle='#ffe4b3';ctx.fillText('Sadi atual  /  sabre e laço',28,32);
    for(const[wi,tool]of ['sabre','laco'].entries())for(let dir=0;dir<3;dir++){
      const base=210+wi*480+dir*148;
      ctx.textAlign='left';ctx.font='14px sans-serif';ctx.fillStyle='#ffe4b3';ctx.fillText(tool+' · '+['frente','lado','costas'][dir],25,base-128);
      const f=SADI_POSE_CROPS.idle[dir],scale=124/f[3];ctx.imageSmoothingEnabled=false;
      ctx.drawImage(SADI_POSE_ART.idle,...f.slice(0,4),90-f[4]*scale,base-124,f[2]*scale,124);
      for(let frame=0;frame<4;frame++){
        const x=300+frame*220;ctx.strokeStyle='#758471';ctx.beginPath();ctx.moveTo(x-70,base);ctx.lineTo(x+100,base);ctx.stroke();
        actionSprite('tool:sadi-'+tool,dir*4+frame,x,base,124);
      }
    }
    return c.toDataURL('image/png');
  }finally{ctx=main;}
})()
