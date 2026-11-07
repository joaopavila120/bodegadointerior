(() => {
  const c=document.createElement('canvas');c.width=1050;c.height=330;const keep=ctx;ctx=c.getContext('2d');
  try{
    ctx.fillStyle='#29372c';ctx.fillRect(0,0,c.width,c.height);ctx.fillStyle='#f4e6c8';ctx.font='bold 23px Georgia';ctx.fillText('Giuseppe Garibaldi — ataque de sabre',24,34);
    ['Preparação','Golpe','Finalização','Recuperação'].forEach((label,i)=>{actionSprite('garibaldi-attack',i,155+i*240,278,165);ctx.fillStyle='#d9ddbe';ctx.font='17px Georgia';ctx.fillText(label,95+i*240,310);});
    return c.toDataURL('image/png');
  }finally{ctx=keep;}
})()
