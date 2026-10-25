(()=>{
  const previous={G,worldOut,ctx,sceneForcesCampo};
  const checks=[],check=(ok,msg)=>{if(!ok)throw Error(msg);checks.push(msg);};
  try{
    G=fresh();worldOut=null;sceneForcesCampo=false;
    const c=document.createElement('canvas');c.width=W;c.height=H;ctx=c.getContext('2d');
    check(Object.values(BODEGA_ART).every(im=>im.naturalWidth),'new room and furniture loaded');
    // Existing farm stations lazily initialize their bag state on first draw.
    for(const f of furniture())furnitureDraw(f);
    const before=JSON.stringify(G),geometry=JSON.stringify(furniture());
    check(drawBodegaRoom(),'new room rendered');const cached=bodegaRoomFrame;
    drawBodegaRoom();check(bodegaRoomFrame===cached,'background cached between frames');
    for(const f of furniture())furnitureDraw(f);
    check(JSON.stringify(G)===before&&JSON.stringify(furniture())===geometry,'art leaves save, equipment and interaction geometry unchanged');
    check(decorCount()===0&&!DECOR.some(decorVisible),'initial room adds no purchased decorations');
    G.decor=Object.fromEntries(DECOR.map(d=>[d.id,true]));
    const saved=JSON.stringify(G.decor);drawBodegaRoom();drawDecor();
    check(DECOR.every(decorVisible)&&JSON.stringify(G.decor)===saved,'all cosmetic improvements remain independently visible');
    G.decor.comoda=false;
    check(!decorVisible(DECOR.find(d=>d.id==='kit_chimarrao')),'dependent decor still follows its cabinet');
    G.decor=Object.fromEntries(DECOR.map(d=>[d.id,false]));drawBodegaRoom();drawDecor();
    check(!DECOR.some(decorVisible)&&decorCount()===DECOR.length,'stored decorations retain ownership without being baked into the room');
    for(const id of ['normal','chuva','gremio']){G.event={id,seen:true,fired:{}};drawRainWindow();drawNightWindow();drawDecorLights();}
    check(true,'weather and night overlays render');
    for(let i=0;i<8;i++)check(bodegaFurniture(i,0,0,90,100),'new furniture crop '+i);
    const size=bodegaFurnitureFrames.size;
    for(let n=0;n<20;n++)for(let i=0;i<8;i++)bodegaFurniture(i,0,0,90,100);
    check(size===bodegaFurnitureFrames.size&&size<=64,'furniture cache reused and bounded');
    worldOut={map:'casa:sadi'};check(!bodegaFurniture(4,0,0,90,100),'other interiors keep their own furniture');
    worldOut=null;G.event={id:'costelao'};check(!bodegaFurniture(4,0,0,90,100),'costelao keeps its own scenery');
    return checks;
  }finally{({G,worldOut,ctx,sceneForcesCampo}=previous);}
})()
