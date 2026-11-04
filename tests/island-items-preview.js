(() => {
  const c=document.createElement('canvas');c.width=1400;c.height=1120;
  const main=ctx;ctx=c.getContext('2d');
  try{
    ctx.fillStyle='#303a31';ctx.fillRect(0,0,c.width,c.height);
    ctx.font='bold 20px sans-serif';ctx.fillStyle='#ffe4b3';ctx.fillText('Itens da ilha · ícones em tamanho de jogo',30,32);
    ISLAND_ITEM_IDS.forEach((id,i)=>{const x=65+i*90;islandItemDraw(id,x,115,64);ctx.font='11px sans-serif';ctx.fillStyle='#fff1d3';ctx.textAlign='center';ctx.fillText(id,x,137);});
    for(const[wi,weapon]of ['carabina','arpao'].entries())for(let dir=0;dir<3;dir++){
      const base=300+wi*470+dir*148;
      ctx.textAlign='left';ctx.font='bold 15px sans-serif';ctx.fillStyle='#ffe4b3';ctx.fillText(weapon+' · '+['frente','lado','costas'][dir],25,base-100);
      for(let frame=0;frame<4;frame++){
        const x=300+frame*260;ctx.strokeStyle='#758471';ctx.beginPath();ctx.moveTo(x-85,base);ctx.lineTo(x+140,base);ctx.stroke();
        actionSprite('island:sadi-'+weapon,dir*4+frame,x,base,124);
      }
    }
    return c.toDataURL('image/png');
  }finally{ctx=main;}
})()
