(() => {
  const old = {G,worldOut,worldWalkers,worldWalkersKey,modal,paused,scene,ctx,frameClock,caveRun,caveTrip,olmiroWalker,olmiroKey};
  const results=[],check=(ok,message)=>{if(!ok)throw Error(message);results.push(message);};
  const finishTalk=()=>{let n=0;while(modal==='talk'&&n++<20)talkNext();};
  try {
    G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.regions={serra:true,sc:true};G.cash=2000;G.phase='prep';scene=null;paused=false;worldWalkers=[];
    const surface=document.createElement('canvas');surface.width=1600;surface.height=1000;ctx=surface.getContext('2d');
    for(const [key,m] of Object.entries(EXPANSION_CROPS)) {
      const im=EXPANSION_ART[key];check(im.naturalWidth>0,'Atlas carregado: '+key);
      for(const c of m.frames)check(c[0]>=0&&c[1]>=0&&c[2]>0&&c[3]>0&&c[0]+c[2]<=im.naturalWidth&&c[1]+c[3]<=im.naturalHeight,'Recorte válido: '+key);
    }
    check(CARDS.every(c=>collectibleArt(c.id)),'Todas as cartas têm retrato ou arte própria');
    check(PEOPLE.filter(p=>!p.removed&&!isSpecial(PEOPLE.indexOf(p))&&!p.worldOnly).every(p=>SECONDARY_POSES.has(p.sprite)),'Todos os secundários ativos têm animação');
    check(visitorPool().includes(PADRE_ROMIO)&&!visitorPool().some(i=>PEOPLE[i].id==='olmiro'),'Romio visita a bodega; Olmiro só aparece no mundo aberto');
    check(sceneSpeaker('padre').name==='Padre Romio','Romio celebra a missa');
    check(!!characterFrame(PEOPLE[PADRE_ROMIO].sprite,124),'Romio tem retrato válido');
    personDraw(PEOPLE[PADRE_ROMIO].sprite,400,400,false,false,1,true);
    goOutside();caveState().facao=true;enterCave(1);
    check(modal==='talk'&&$('dialogTitle').textContent.includes('Dunstano')&&!$('talkUI').classList.contains('hidden')&&$('overlay').classList.contains('hidden'),'São Dunstano apresenta o primeiro andar pela barra de diálogo');finishTalk();
    check(PEOPLE[DUNSTAN_PERSON].worldOnly&&!visitorPool().includes(DUNSTAN_PERSON),'Dunstano é um personagem exclusivo da caverna');
    const origin={x:DUNSTAN.x,y:DUNSTAN.y};DUNSTAN.wait=0;dunstanTick(.3);
    check(DUNSTAN.walk&&Math.hypot(DUNSTAN.x-origin.x,DUNSTAN.y-origin.y)>5,'Dunstano caminha no refúgio');
    dunstanTalk();check(worldTalkOpen()&&rpgBoxes.worldTalk.parts.at(-1).name==='São Dunstano','Dunstano conversa na barra do mundo');
    check(WORLD_TALK.dunstano.some(l=>l.reply===rpgBoxes.worldTalk.parts.at(-1).text),'Dunstano usa suas próprias falas');
    const still=DUNSTAN.x;dunstanTick(.3);check(DUNSTAN.x===still&&!DUNSTAN.walk,'Dunstano para durante a conversa');skipWorldTalk();
    for(let n=0;n<1800;n++){dunstanTick(.05);if(n%100===0)check(worldCanWalk(DUNSTAN.x,DUNSTAN.y),'Rota do ferreiro não atravessa a bancada');}
    check([0,1,2,3].map(n=>secondaryStep(3,n,true)).join(',')==='0,1,2,1','Ciclo genérico alterna contato e passagem das pernas');
    frameClock=20;secondaryGait('test',300,300,true,1,0);frameClock+=.1;const moving=secondaryGait('test',315,300,true,1,0);
    check(moving.phase>1&&moving.dx>0,'Passo acompanha a distância percorrida');frameClock+=.1;
    check(secondaryGait('test',315,300,false,1,0).phase===1,'Personagem parado não marcha no lugar');
    for(const kind of Object.keys(CAVE_DEATH_VOICES)){
      const pcm=caveDeathPCM(kind);let peak=0,energy=0,finite=true;for(const s of pcm){finite=finite&&Number.isFinite(s);peak=Math.max(peak,Math.abs(s));energy+=s*s;}
      check(finite&&peak<.7&&energy/pcm.length>.00001,'Som audível sem clipping: '+kind);
    }
    const safe=caveFloorRun();check(!safe.beasts.length&&safe.ladder.shown&&safe.floor===1,'Primeiro andar passivo com saída para o combate');
    const hp=caveState().hp;caveHurt(999,{x:0,y:0});check(caveState().hp===hp,'Refúgio não causa dano');
    const forge=WORLD_MAPS.caverna.spots().find(s=>s.id==='cave:forge');check(forge&&worldCanWalk(forge.x,forge.y),'Ferraria acessível');
    worldOut.x=forge.x;worldOut.y=forge.y;forge.act();const cash=G.cash;facaoBuy('afiado');check(caveDmg()===18&&G.cash===cash-120,'Melhoria comprada na ferraria');closeDialog(true);
    check(!WORLD_MAPS['casa:manolima'].items.some(i=>i.kind==='balcaoMano'),'Bancada removida da casa de Mano Lima');
    for(const point of WORLD_MAPS.caverna.spots())check(worldCanWalk(point.x,point.y),'Interação alcançável: '+point.id);
    caveDescend();check(caveState().floor===2&&caveFloorRun().beasts.length>0,'Combate começa no segundo andar');
    const encountered=new Set();for(let floor=2;floor<25;floor++)for(const b of buildCaveFloor(floor).beasts)encountered.add(b.kind);
    check(['teiniagua','onca','anhanga'].every(k=>encountered.has(k)),'Novas criaturas aparecem na progressão');
    for(const kind of Object.keys(CAVE_BEASTS)) {
      const run=caveFloorRun(),p=caveCenter(4,11),b={kind,x:p.x+80,y:p.y,hp:100,max:100,dx:-1,state:'roam',t:0,vx:0,vy:0,hurt:0,frame:0};
      caveBeastTick(b,.05,run,p);check(Number.isFinite(b.x)&&Number.isFinite(b.y),'IA válida: '+kind);
      b.attack=.3;drawCaveBeast(b);b.attack=0;b.state='roam';drawCaveBeast(b);
    }
    caveFloorRun().hurt=.3;check(drawExpansionPerson(0,400,400,false,true,1,false,0,0),'Pose de dano do Sadi');
    caveFloorRun().hurt=0;caveFloorRun().swing={t:.1,ang:0};check(drawExpansionPerson(0,400,400,false,true,1,false,0,0),'Pose de ataque do Sadi');
    caveLeave();finishTalk();switchMap({map:'gado',x:600,y:800});closeDialog(true);
    const before=G.cash;G.cash=10;buyRidingHorse();check(!mountState().owned&&G.cash===10,'Sem dinheiro não compra cavalo');G.cash=before;
    storeShop('gado');buyRidingHorse();check(G.mount.owned&&G.cash===before-HORSE_COST,'Compra o cavalo na Casa do Campeiro');
    buyRidingHorse();check(G.cash===before-HORSE_COST,'Não paga pelo cavalo duas vezes');check(!playerMounted(),'Desmontado no interior da loja');closeDialog(true);
    switchMap({map:'vila',x:1600,y:735});check(playerMounted(),'Monta automaticamente ao sair');
    G.mount.stabled=true;keys.add('d');outsideTick(.05);const foot=worldOut.x-1600;
    worldOut.x=1600;G.mount.stabled=false;outsideTick(.05);const riding=worldOut.x-1600;keys.clear();
    check(foot>0&&Math.abs(riding/foot-1.65)<.01,'Cavalo aumenta a velocidade em 65%');
    check(mountedPose('sadi-mounted-v1',400,400,1,0,true),'Desenha Sadi montado');
    const saveData=normalizeSave(JSON.parse(JSON.stringify(G)));check(saveData.mount.owned&&!saveData.mount.stabled,'Compra da montaria persiste no save');
    switchMap({map:'curral',...HORSE_POST});check(worldCanWalk(HORSE_POST.x,HORSE_POST.y),'Local para guardar o cavalo é acessível');
    stableHorse();check(!playerMounted()&&G.mount.stabled,'Guarda no campo');stableHorse();check(playerMounted()&&!G.mount.stabled,'Retira do campo');
    enterCave(1);finishTalk();check(!playerMounted()&&caveUp('afiado'),'Entra a pé na caverna e preserva a melhoria');
    caveLeave();finishTalk();G.roadEncounterSeed=123456;let visit=null;for(G.day=1;G.day<100&&!visit;G.day++)visit=roadEncounterPlan('olmiro');G.day--;switchMap({map:visit.map,x:1600,y:1000});olmiroTick(.1);check(!!olmiroWalker,'Olmiro percorre a estrada montado nos dias de visita');
    G.day=1;switchMap({map:'igreja',x:600,y:700});check(WORLD_MAPS.igreja.spots().some(s=>s.id==='romio'),'Romio pode ser encontrado na capela');
    const index=PEOPLE.findIndex(p=>p.id==='olmiro');check(!minorPeople().includes(index),'Olmiro não aparece como pedestre');
  } finally {
    closeDialog(true);talkState=null;keys.clear();
    G=old.G;worldOut=old.worldOut;worldWalkers=old.worldWalkers;worldWalkersKey=old.worldWalkersKey;modal=old.modal;paused=old.paused;scene=old.scene;ctx=old.ctx;frameClock=old.frameClock;caveRun=old.caveRun;caveTrip=old.caveTrip;olmiroWalker=old.olmiroWalker;olmiroKey=old.olmiroKey;
  }
  return results;
})()
