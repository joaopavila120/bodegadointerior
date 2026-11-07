(() => {
  const canvas=document.createElement('canvas');canvas.width=1240;canvas.height=750;
  const before=ctx;ctx=canvas.getContext('2d');
  try{
    ctx.fillStyle='#29372c';ctx.fillRect(0,0,1240,750);ctx.font='bold 24px Georgia';ctx.fillStyle='#f4e6c8';ctx.fillText('Lanceiros Negros — original e duas novas variantes',28,38);
    const labels=['Original','Veterano','Campeiro'];
    LANCEIRO_ART.forEach((id,row)=>{
      const y=260+row*230;ctx.fillStyle='#f4e6c8';ctx.font='bold 18px Georgia';ctx.fillText(labels[row],28,y-115);
      [0,5,9,11].forEach((pose,col)=>{actionSprite(id,pose,230+col*270,y,146);ctx.font='14px Georgia';ctx.fillStyle='#b8c4aa';ctx.fillText(['Parado','Caminhando','De costas','Ataque'][col],200+col*270,y+23);});
    });
    return canvas.toDataURL('image/png');
  }finally{ctx=before;}
})()
