(() => {
  const oldG=G,oldOut=worldOut,oldClock=frameClock,main=ctx,results=[];
  const check=(ok,label)=>{if(!ok)throw Error(label);results.push(label);};
  try{
    G=fresh();worldOut=null;
    const canvas=document.createElement('canvas');canvas.width=1600;canvas.height=900;ctx=canvas.getContext('2d');
    for(const key of RURAL_ART_SHEETS){
      const im=WORLD_ART[key];check(im.naturalWidth>0,'Arte rural carregada: '+key);
      for(const [x,y,w,h] of WORLD_ART_CROPS[key])check(x>=0&&y>=0&&w>0&&h>0&&x+w<=im.naturalWidth&&y+h<=im.naturalHeight,'Recorte dentro da folha: '+key);
    }
    for(const key of Object.keys(BAG_RAW)){
      const div=document.createElement('div');div.innerHTML=bagIcon(key);
      check(!!div.querySelector('img,svg image')&&!div.querySelector('.bag-emoji'),'Inventário com sprite: '+key);
      check(!!itemImageForSize(key,40),'Item desenhável: '+key);
    }
    for(const [level,key] of [[0,null],[1,'mateCuiudo'],[2,'mateTopetudo'],[3,'mateLendario']]){
      G.up={};if(key)G.up[key]=true;
      check(ruralItemSpec('mate')[1]===level,'Cuia acompanha a melhoria '+level);
      check(drawRuralMate(300,300,25),'Cuia desenhada '+level);
    }
    const frames=[0,1,2,3].map(i=>ruralItemImage('mate:'+i));
    check(new Set(frames).size===4,'Os quatro mates têm artes diferentes');
    G.up={trago:true,coffee:true,placaFiado:true};G.bag={trigo:{q:3,c:0},leite:{q:5,c:0},vidro:{q:7,c:0}};
    G.kitchen.parking[0]={kind:'ingredient',key:'pao_xis'};
    G.trophies={rodeio:1,penalti:1,uva:1};G.relics={cuia_vo:1,foto1968:1,retrato:1,ticao:1,fita:1,escama:1,freio:1};
    const before=JSON.stringify([G.stock,G.bag,G.kitchen,G.cash,G.trophies,G.relics]);
    const transform=ctx.getTransform().toString();
    for(const f of FIXED)furnitureDraw(f);
    drawLembrancas();drawFiadoSign(100,100,110,88);
    for(const dir of [-1,1]){
      drawMula(100,300,dir);drawNegrinho(200,300,dir,true,.4);drawJavali(400,300,dir,1,1.4);drawJavali(600,300,dir,1,1.4,true);
      drawLobisomem(800,300,dir);drawSanguanel(950,300,dir);
    }
    drawBoitata(1200,300);
    check(ctx.getTransform().toString()===transform&&ctx.globalAlpha===1&&ctx.globalCompositeOperation==='source-over','Sprites preservam o estado do canvas');
    check(JSON.stringify([G.stock,G.bag,G.kitchen,G.cash,G.trophies,G.relics])===before,'Arte preserva estoque, itens apoiados, dinheiro e conquistas');
    const spec=ruralItemImage('butia');check(spec===ruralItemImage('butia'),'Recorte de inventário reutilizado');
    const warm=()=>{drawMula(100,300);drawNegrinho(200,300);drawBoitata(500,300);drawJavali(800,300,1,frameClock);drawRuralMate(900,300);};
    warm();const count=worldSpriteCache.size;
    for(let i=0;i<25;i++){frameClock=i*.1;warm();}
    check(worldSpriteCache.size===count,'Animação não gera novos recortes a cada quadro');
    const im=WORLD_ART['rural-workstations-v2'];
    try{WORLD_ART['rural-workstations-v2']=new Image();furnitureDraw(FIXED.find(f=>f.id==='forno'));check(true,'Estações mantêm fallback enquanto arte carrega');}
    finally{WORLD_ART['rural-workstations-v2']=im;}
  }finally{G=oldG;worldOut=oldOut;frameClock=oldClock;ctx=main;}
  return results;
})()
