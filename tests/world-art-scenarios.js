(() => {
  const oldG = G, oldOut = worldOut, oldWalkers = worldWalkers, oldKeys = [...keys], oldWalkerKey = worldWalkersKey;
  const results = [], check = (ok, message) => { if (!ok) throw Error(message); };
  try {
    G = fresh(); worldWalkers = [];
    for (const [key, im] of Object.entries(WORLD_ART)) {
      check(im.complete && im.naturalWidth, 'Atlas ausente: ' + key);
      for (const [x,y,w,h] of WORLD_ART_CROPS[key] || []) check(w>0 && h>0 && x>=0 && y>=0 && x+w<=im.naturalWidth && y+h<=im.naturalHeight, 'Recorte inválido: '+key);
    }
    const smoothing = ctx.imageSmoothingEnabled;
    check(CHARACTER_ART['sadi-back'].naturalWidth, 'Sprite de costas ausente');
    worldOut={map:'vila',x:1620,y:1530,dx:0,dy:1,walk:false};
    keys.clear();keys.add('w');outsideTick(.1);
    check(worldOut.y<1530&&worldOut.dy<0&&playerFacingSprite(avatarSprite(),worldOut.dy)===SADI_BACK,'Caminhar para cima usa costas');
    keys.clear();outsideTick(.1);
    check(!worldOut.walk&&playerFacingSprite(avatarSprite(),worldOut.dy)===SADI_BACK,'Parar preserva a orientação');
    keys.add('s');outsideTick(.1);keys.clear();
    check(playerFacingSprite(avatarSprite(),worldOut.dy)===avatarSprite(),'Caminhar para baixo usa a frente');
    check(walkCharacterId(0)==='sadi'&&walkDirection(0,-1)===2&&walkDirection(0,1)===0,'Directional frame selection');
    for(const id of ['vila','serra','sc']){
      const M=WORLD_MAPS[id];
      const homes=id==='vila'?VILA.houses:id==='sc'?SC.houses:[SERRA.badin,SERRA.casona,SERRA.mito,SERRA.dianho];
      const obstacles=typeof M.obstacles==='function'?M.obstacles():M.obstacles;
      for(const h of homes)check(!obstacles.some(b=>b!==h&&h.x<b.x+b.w&&h.x+h.w>b.x&&h.y<b.y+b.h&&h.y+h.h>b.y),'Casa sobre outro objeto em '+id);
      for(const spot of M.spots().filter(s=>s.house)){
        check(WORLD_MAPS['casa:'+spot.house]?.spawn,'Casa sem interior: '+spot.house);
        check(M.canWalk(spot.x,spot.y),'Porta bloqueada: '+spot.house);
      }
    }
    check(!SERRA.obstacles.includes(SERRA.gaudencio),'Non-enterable house must not block the map');
    const field=SERRA.campinho;
    check(!worldDressing(WORLD_MAPS.serra).props.some(p=>p.x+p.w/2>field.x&&p.x-p.w/2<field.x+field.w&&p.y>field.y&&p.y-p.h<field.y+field.h),'Vegetação cobre o campinho');
    results.push('movimento direcional do jogador, portas das casas e áreas livres de decoração');
    worldSprite('buildings',0,0,0,300,240);
    check(ctx.imageSmoothingEnabled === smoothing, 'Arte alterou estado global de interpolação');
    for (const [id, M] of Object.entries(WORLD_MAPS)) {
      const p = M.spawn?.() || {x:M.W/2,y:M.H/2};
      worldOut = {map:id,...p,dx:0,dy:1,walk:false};
      drawOutside();
      if (M.indoor && M.bounds) {
        check(M.canWalk(p.x,p.y), 'Entrada bloqueada em '+id);
        worldOut.back={map:'serra',x:1800,y:1200};
        const exit=M.edge({x:p.x,y:M.bounds.y+M.bounds.h+30});
        check(exit?.map, 'Saída ausente em '+id);
      }
    }
    check(WORLD_MAPS.vila.edge({x:VILA.W-1,y:VILA.roadY+45})?.map==='serra','Ligação Fronteira / Serra');
    check(WORLD_MAPS.serra.edge({x:1800,y:1})?.map==='sc','Ligação Serra / SC');
    check(WORLD_MAPS.sc.edge({x:1500,y:SC.H-1})?.map==='serra','Volta de SC');
    results.push('arte de todos os mapas, entradas dos interiores e conexões entre regiões');
    results.push('atlases carregados, recortes válidos e estado do canvas preservado');
    // Pan across all three regions: cache reuse is deterministic, unlike FPS.
    const paint=paintWorldDressingSurface,mainContext=ctx;
    let bakes=0;
    try {
      paintWorldDressingSurface=(...args)=>{bakes++;return paint(...args);};
      for(const id of ['vila','serra','sc']){
        const M=WORLD_MAPS[id];
        drawWorldDressingSurface(M,{x:0,y:0,w:M.W,h:M.H});
        check(worldGroundTileCache.size<=WORLD_GROUND_TILE_LIMIT,'Cache de terreno cresceu sem limite');
      }
      const M=WORLD_MAPS.sc,view={x:1200,y:700,w:1100,h:900};
      drawWorldDressingSurface(M,view);
      const warmed=bakes,tiles=[...worldGroundTileCache];
      drawWorldDressingSurface(M,view);
      check(bakes===warmed,'Terreno estático foi redesenhado sem necessidade');
      check(tiles.every(([key,tile])=>worldGroundTileCache.get(key)===tile),'Blocos prontos não foram reutilizados');
      check(ctx===mainContext,'Cache deixou o desenho preso no canvas auxiliar');
      // Static terrain remains warm while time and lighting advance.
      G.phase='closed';G.day++;
      drawWorldDressingSurface(M,view);
      check(bakes===warmed,'Mudança de dia invalidou terreno que não muda');
      check([...worldGroundTileCache.values()].every(c=>c.width<=516&&c.height<=516),'Blocos excedem o limite de resolução');
    } finally {paintWorldDressingSurface=paint;}
    results.push('terreno reutilizado entre quadros e dias, cache limitado ao navegar entre regiões');
    worldOut={map:'vila',x:1420,y:2260,dx:0,dy:1,walk:false};
    for(let y=2200;y<2370;y+=10)for(let x=510;x<690;x+=10){
      if(WORLD_MAPS.vila.canWalk(x,y))check(frontierOnLand(x,y),'Curva do rio permite caminhar sobre a água');
    }
    check(WORLD_MAPS.vila.canWalk(300,917)&&WORLD_MAPS.vila.canWalk(530,917),'Trapiche perdeu seu acesso');
    check(!WORLD_MAPS.vila.canWalk(300,1000),'Água ao lado do trapiche ficou transitável');
    const bakeFrontier=paintFrontierTerrain;
    let frontierBakes=0;
    try {
      paintFrontierTerrain=(...args)=>{frontierBakes++;return bakeFrontier(...args);};
      for(const x of [0,1200,2400])for(const y of [0,900,1800])drawFrontierTerrain({x,y,w:1200,h:900});
      check(frontierTerrainTiles.size<=FRONTIER_TILE_LIMIT,'Cache da margem cresceu sem limite');
      const view={x:1100,y:1900,w:900,h:700};drawFrontierTerrain(view);
      const warmed=frontierBakes;drawFrontierTerrain(view);
      check(frontierBakes===warmed,'A paisagem da Fronteira foi recomposta a cada quadro');
      check(ctx===mainContext,'Cache da Fronteira não restaurou o contexto');
    } finally {paintFrontierTerrain=bakeFrontier;}
    results.push('margem irregular sem caminhada na água, trapiche acessível e paisagem em cache limitado');
    const bakeRegional=paintRegionalTerrain,random=Math.random;
    let regionalBakes=0;
    try{
      hortaState();ranchState();
      paintRegionalTerrain=(...args)=>{regionalBakes++;return bakeRegional(...args);};
      Math.random=()=>{throw Error('Terreno consumiu o sorteio da gameplay');};
      for(const id of ['serra','sc','horta','curral']){
        const M=WORLD_MAPS[id];worldOut={map:id,x:800,y:750,dx:0,dy:1,walk:false};
        const snapshot=JSON.stringify(G);
        const view={x:0,y:0,w:M.W,h:M.H};
        check(drawRegionalTerrain(M,view),'Terreno regional não foi desenhado: '+id);
        check(JSON.stringify(G)===snapshot,'Desenhar o terreno alterou o jogo: '+id);
        check(regionalTerrainTiles.size<=REGIONAL_TILE_LIMIT,'Cache regional cresceu sem limite');
        const local={x:500,y:500,w:800,h:500};drawRegionalTerrain(M,local);
        const warmed=regionalBakes,tiles=[...regionalTerrainTiles];
        drawRegionalTerrain(M,local);
        check(regionalBakes===warmed,'Terreno foi refeito a cada quadro em '+id);
        check(tiles.every(([key,tile])=>regionalTerrainTiles.get(key)===tile),'Terreno pronto foi descartado em '+id);
        check(ctx===mainContext,'Terreno regional perdeu o contexto principal');
      }
      check(regionalBakes>0,'Teste não recompôs nenhum terreno');
      check([...regionalTerrainTiles.values()].every(c=>c.width<=518&&c.height<=518),'Blocos regionais grandes demais');
      const before=regionalTerrainTiles.size;
      check(!drawRegionalTerrain(WORLD_MAPS.cancha,{x:0,y:0,w:800,h:600})&&regionalTerrainTiles.size===before,'Terreno externo invadiu um interior');
      drawRegionalCampoGround();const campoTile=regionalCampoGround;drawRegionalCampoGround();
      check(campoTile&&regionalCampoGround===campoTile,'Campo não reutiliza o terreno pronto');
      for(const [x,y,walk] of [[SERRA.roadX+40,SERRA.arroio+30,true],[SERRA.roadX-60,SERRA.arroio+30,false],[SERRA.roadX+40,SERRA.arroio-30,true]])
        check(WORLD_MAPS.serra.canWalk(x,y)===walk,'Arroio ou ponte perdeu a colisão');
    }finally{paintRegionalTerrain=bakeRegional;Math.random=random;}
    results.push('Serra, SC, horta, curral e campo com terreno reutilizado, cache limitado e gameplay preservada');
  } finally { G=oldG; worldOut=oldOut; worldWalkers=oldWalkers;worldWalkersKey=oldWalkerKey;keys.clear();oldKeys.forEach(k=>keys.add(k)); draw(); }
  return results;
})()
