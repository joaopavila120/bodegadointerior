(() => {
  const results=[],check=(ok,message)=>{if(!ok)throw Error(message);results.push(message);};
  G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.phase='prep';G.day=40;G.cash=10000;
  scene=null;phoneOpen=false;closeDialog(true);skipWorldTalk();started=true;paused=false;
  check(ISLAND_ITEM_IDS.length===15&&ISLAND_ITEM_ATLAS.frames.length===15,'13 item icons and 2 collection props');
  for(const id of ISLAND_ITEM_IDS){
    const icon=islandItemIcon(id),f=islandItemFrame(id,64);
    check(icon.includes(ISLAND_ITEM_FILE)&&icon.includes('data-island-item="'+id+'"'),id+' uses its own clipped icon');
    check(f?.width>0&&f.height>0&&f.width<=64&&f.height<=64,id+' fits inventory box');
  }
  for(const id of ['prata','sal','arruda','garapuvu','corrente_ferro','sabre_peca'])check(bagIcon(id).includes('data-island-item="'+id+'"'),id+' inventory integration');
  for(const id of ['arpao','carabina','cartuchos'])check(rangedIcon(id).includes(ISLAND_ITEM_FILE),id+' shop integration');
  check(forgeWeaponIcon('sabre').includes(ISLAND_ITEM_FILE),'sabre has art in forge equipment list');
  for(const id of ['sabre_preto','sabre_dourado'])check(forgeWeaponIcon(id).includes(ISLAND_ITEM_FILE)&&forgeWeaponIcon(id).includes('filter:'),id+' uses the sabre art tinted in its own color');
  check(mataGearHTML('bomba',42).includes(ISLAND_ITEM_FILE)&&mataGearHTML('reza',42).includes(ISLAND_ITEM_FILE),'bomb and blessing belt art');
  for(const[id,a]of Object.entries(ISLAND_WEAPON_POSES)){
    check(a.frames.length===12&&ACTION_ART['island:'+id]?.naturalWidth===a.size[0],id+' twelve poses loaded');
    for(const[x,y,w,h,px,py]of a.frames)check(x>=0&&y>=0&&x+w<=a.size[0]&&y+h<=a.size[1]&&px>0&&px<w&&py>0&&py<=h,id+' crop/anchor valid');
  }
  worldOut={map:'ilha',x:3200,y:3500,dx:1,dy:0};caveState().facao=true;mataNightStart();mataNight.beasts=[];mataNight.hurt=0;mataNight.swing=null;
  G.up.carabina=true;G.up.arpao=true;G.up.revolver38=true;ilhaState().cartuchos=4;G.rangedPick='carabina';
  Object.assign(ranged,{cd:0,reload:0,hold:0,shots:[]});
  rangedFire();const shot=ranged.shots[0],tip=rangedMuzzle(worldOut,0,0,'carabina'),drawn=rangedDrawPoint(shot);
  check(shot?.id==='carabina'&&carabinaBalas()===3,'live carbine shot consumes exactly one cartridge');
  check(shot.x===worldOut.x+30&&shot.y===worldOut.y-62&&ranged.cd===RANGED.carabina.cd,'carbine damage path and cooldown unchanged');
  check(Math.hypot(drawn.x-tip.x,drawn.y-tip.y)<.1,'carbine projectile starts at rifle muzzle');
  const start=frameClock;
  for(const[t,stage]of [[0,0],[.09,1],[.3,2],[.7,3]]){frameClock=start+t;check(sadiRangedPose()?.stage===stage&&sadiRangedPose()?.id==='island:sadi-carabina','carbine animation stage '+stage);}
  G.rangedPick='arpao';check(sadiRangedPose()?.weapon==='carabina','swapping keeps carbine pose and muzzle latched');
  frameClock=start+.9;check(!sadiRangedPose(),'carbine settles back to normal movement');
  ranged.cd=0;ranged.shots=[];rangedFire();check(ranged.shots[0]?.id==='arpao'&&carabinaBalas()===3,'harpoon throw uses no cartridges');
  const harpoonPoint=rangedDrawPoint(ranged.shots[0]),hand=islandWeaponMuzzle(worldOut,0,1,'arpao');
  check(Math.abs(harpoonPoint.x-hand.x-64)<.1&&Math.abs(harpoonPoint.y-hand.y)<.1,'harpoon tip starts ahead of the throwing hand');
  check(islandHarpoonFrame()?.width===64,'harpoon projectile uses a cached shaft without a second rope coil');
  const thrown=frameClock;
  for(const[t,stage]of [[0,1],[.2,2],[.4,3],[.7,0]]){frameClock=thrown+t;check(sadiRangedPose()?.stage===stage&&sadiRangedPose()?.id==='island:sadi-arpao','harpoon release/follow/haul/ready '+stage);}
  for(const id of ['arpao','carabina'])for(const[dx,dy,direction,flip]of [[1,0,1,false],[-1,0,1,true],[0,1,0,false],[0,-1,2,false]]){
    startSadiShot(id,Math.atan2(dy,dx));const p=sadiRangedPose();
    check(p?.direction===direction&&p.flip===flip,id+' direction '+dx+','+dy);
    drawExpansionPerson(0,500,500,false,true,dx,false,null,dy);drawRangedHand();
  }
  frameClock+=1;G.rangedPick='carabina';ilhaState().cartuchos=0;ranged.cd=0;const n=ranged.shots.length;rangedFire();
  check(ranged.shots.length===n&&!sadiRangedPose(),'empty carbine never shows firing or reload animation');
  startSadiShot('carabina',0);mataNight.hurt=.2;check(!sadiRangedPose(),'damage pose wins over shooting');mataNight.hurt=0;
  const oldMap=worldOut.map;worldOut.map='sc';check(!sadiRangedPose(),'changing map clears visible firing pose');worldOut.map=oldMap;
  const oldGame=G;G=fresh();check(!sadiRangedPose(),'new game does not inherit shot');G=oldGame;
  const outside=worldOut;worldOut=null;check(personHeight(0,true)===130,'bodega scale unchanged');worldOut=outside;
  const im=ACTION_ART['island:sadi-carabina'];ACTION_ART['island:sadi-carabina']={naturalWidth:0};
  check(!sadiRangedPose(),'missing carbine pose falls back without using revolver sprite');drawRangedHand();ACTION_ART['island:sadi-carabina']=im;
  for(const k of ['prata','sal','arruda','garapuvu','corrente_ferro','sabre_peca'])bagAdd(k,20);
  check(griggsReceitasHTML().includes('data-island-item="facao_prata"')&&griggsReceitasHTML().includes('data-island-item="sabre"'),'Griggs crafting icons include silver machete and sabre');
  griggsShop();check(modal==='griggsShop'&&$('dialogContent').querySelectorAll('.island-item-art').length>=10,'Griggs shop renders new icons');closeDialog(true);
  for(let i=0;i<300;i++)islandItemFrame(ISLAND_ITEM_IDS[i%15],16+i%144);
  check(islandItemFrames.size<=96,'icon cache bounded');
  paused=true;return results;
})()
