(() => {
  const before={G,worldOut,frameClock,playerAnimation,ctx},results=[];
  const check=(ok,label)=>{if(!ok)throw Error(label);results.push(label);};
  try {
    G=fresh();worldOut={map:'casa:badin',x:600,y:700,dx:0,dy:1};frameClock=40;
    const canvas=document.createElement('canvas');canvas.width=1400;canvas.height=1000;ctx=canvas.getContext('2d');
    const specials=PEOPLE.filter(p=>!p.removed&&ALWAYS_TALK.has(p.id));
    check(specials.length===14,'Cobertura dos 14 personagens especiais');
    for(const [id,sprite] of [['sadi',0],...specials.map(p=>[p.id,p.sprite])]){
      check(walkCharacterId(sprite)===id,'Identidade da animação: '+id);
      const im=WALK_ART[id],frames=WALK_ART_CROPS[id];
      check(im.naturalWidth>0&&frames.length===12,'Folha completa carregada: '+id);
      for(const[x,y,w,h,axis]of frames)check(x>=0&&y>=0&&w>40&&h>200&&x+w<=im.naturalWidth&&y+h<=im.naturalHeight&&axis>0&&axis<w,'Recorte íntegro: '+id);
      for(let d=0;d<3;d++)check(new Set([0,1,2,3].map(n=>walkPoseFrame(id,d,(n+.1)*Math.PI/2))).size===4,'Quatro poses por direção: '+id+'/'+d);
      check(!drawDirectionalPerson(sprite,500,600,false,false,1,true,0,0),'Sentado mantém pose própria: '+id);
      for(const[dx,dy]of [[0,1],[0,-1],[1,0],[-1,0]]){
        frameClock+=.5;check(drawDirectionalPerson(sprite,500,600,true,false,dx,false,0,dy),'Caminhada desenhada: '+id+'/'+dx+','+dy);
      }
    }
    const data=JSON.stringify(G),matrix=ctx.getTransform().toString();
    personDraw(PEOPLE.find(p=>p.id==='badin').sprite,500,600,true,false,-1,false,0,0);
    check(JSON.stringify(G)===data&&ctx.getTransform().toString()===matrix,'Desenho preserva save e transformação do canvas');
    check(walkFrameCache.size<=540&&walkTracks.length<=96,'Caches de animação limitados');
    for(const map of Object.values(WORLD_MAPS).filter((m,i,a)=>m.indoor&&m.bounds&&a.indexOf(m)===i)){
      worldOut={map:map.id,...map.spawn(),dx:0,dy:1};const p=map.spawn();
      check(map.canWalk(p.x,p.y),'Entrada livre: '+map.id);
      const layers=[];map.draw({x:0,y:0,w:map.W,h:map.H},()=>true,layers);layers.sort((a,b)=>a.y-b.y).forEach(l=>l.draw());
      check(map.items.every(i=>typeof FURN[i.kind]==='function'),'Todos os objetos têm renderer: '+map.id);
    }
    check(WORLD_MAPS.atacado.items.some(i=>i.kind==='crates')&&!WORLD_MAPS.atacado.items.some(i=>i.kind==='hay'),'Atacado usa engradados');
    check(WORLD_MAPS.ferragem.items.filter(i=>i.kind==='storeShelf').every(i=>i.goods==='ferragem'),'Ferragem exibe melhorias e ferramentas');
    for(const k of ['interior-details-v2','interior-fittings-v2','interior-flags-v2','interior-materials-v2'])check(WORLD_ART[k].naturalWidth>0,'Atlas de interior: '+k);
    return results;
  } finally {({G,worldOut,frameClock,playerAnimation,ctx}=before);}
})()
