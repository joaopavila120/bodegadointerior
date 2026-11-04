(() => {
  const c=document.createElement('canvas');c.width=1500;c.height=950;
  const main=ctx,oldWorld=worldOut;ctx=c.getContext('2d');worldOut=null;
  try{
    ctx.fillStyle='#364035';ctx.fillRect(0,0,c.width,c.height);
    const label=(s,x,y,size=17)=>{ctx.font=size+'px sans-serif';ctx.textAlign='left';ctx.fillStyle='#ffe7bb';ctx.fillText(s,x,y);};
    label('Grazi e Teiniaguá · princesa na história, gaúcha após a libertação',25,30,23);
    for(const[n,id]of ['grazi','princesa','gaucha_chique'].entries()){
      const p=PEOPLE.find(p=>p.id===id),pose=SECONDARY_POSES.get(p.sprite),base=210+n*225;
      label(id==='grazi'?p.name:id==='princesa'?'Teiniaguá · princesa':'Teiniaguá · gaúcha',25,base-165,20);
      for(let j=0;j<12;j++){
        const dir=Math.floor(j/4),x=180+j*108;
        if(j%4===0)label(['frente','lado','costas'][dir],x-26,base-140,14);
        expansionSprite(pose.key,j,x,base,124,false,pose.directionHeights[dir]);
        label(j%4===0?'parada':'passo '+j%4,x-25,base+20,12);
      }
    }
    label('Comparação com os clientes atuais',25,765,20);
    for(const[n,id]of ['lucia','sadi','grazi','princesa','gaucha_chique'].entries()){
      const p=id==='sadi'?{sprite:0,name:'Sadi'}:PEOPLE.find(p=>p.id===id),x=160+n*270;
      personDraw(p.sprite,x,910,false,id==='sadi',0,false,0,1);label(p.name,x-50,935,15);
    }
    return c.toDataURL('image/png');
  }finally{ctx=main;worldOut=oldWorld;}
})()
