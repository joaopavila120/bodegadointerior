(() => {
  const old={G,worldOut,worldWalkers,worldWalkersKey,caveRun,caveTrip,caveDefeat,saciEncounter,saciEncounterKey,saciEncounterGame,started,paused,modal,scene,phoneOpen,ctx,frameClock,pickVisitor,random:Math.random};
  const results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  const finishTalk=()=>{let n=0;while(modal==='talk'&&n++<30)talkNext();};
  try{
    G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.day=5;G.regions={serra:true,sc:true};G.phase='prep';G.cash=500;
    G.cave={facao:true,floor:1,deepest:15,hp:100,up:{},dunstanTaught:true};
    started=true;paused=false;modal=null;scene=null;phoneOpen=false;caveDefeat=null;skipWorldTalk();keys.clear();
    worldOut={map:'caverna',x:520,y:800,dx:1,dy:0};caveRun=null;caveTrip=null;
    check(!caveFloorRun().rocks.length&&!caveFloorRun().beasts.length,'Refúgio não contém minérios nem monstros');
    for(let floor=2;floor<=16;floor++){
      const run=buildCaveFloor(floor),gems=run.rocks.filter(r=>['ametista','agata'].includes(r.loot));
      check(gems.length>0&&gems.every(r=>r.loot===(floor>10?'agata':'ametista')),'Minério correto no andar '+floor);
      if(floor>10)check(run.beasts.every(b=>b.max>=Math.round(CAVE_BEASTS[b.kind].hp*1.3)),'Bichos mais resistentes no andar '+floor);
    }
    check(!caveDash()&&!caveUp('dash'),'Jogo começa sem dash');
    caveUpdateControls();check($('caveDashButton').classList.contains('hidden'),'Botão de dash permanece oculto antes da compra');
    bagAdd('ametista',3);bagAdd('agata',2);const stock=bagQty('ametista'),cash=G.cash;
    storeSell('ametista');check(G.cash===cash&&bagQty('ametista')===stock&&!SELLABLE.includes('ametista'),'Armazém não compra minérios, inclusive por ação direta');
    check(!dunstanSell('ametista:all'),'Venda não funciona fora da janela de negociação');
    dunstanTalk();check(worldTalkOpen()&&!!$('dunstanTradeButton')&&hasCard('dunstano'),'Santo conversa, oferece negociação e entrega sua carta');
    action('dunstanShop');check(modal==='dunstanShop'&&!worldTalkOpen(),'Botão da conversa abre a ferraria');
    action('dunstanSell','ametista:1');check(bagQty('ametista')===2&&G.cash===cash+18,'Venda unitária paga o mineral correto');
    action('dunstanSell','agata:all');check(!bagQty('agata')&&G.cash===cash+74,'Venda de todas as ágatas');
    const paid=G.cash;action('dunstanSell','agata:all');check(G.cash===paid,'Duplo clique não duplica pagamento');
    facaoBuy('dash');const price=CAVE_UPGRADES.find(u=>u.id==='dash').cost;
    check(caveUp('dash')&&G.cash===paid-price,'São Dunstano vende a esquiva');
    facaoBuy('dash');check(G.cash===paid-price,'Melhoria já comprada não cobra novamente');
    closeDialog(true);caveUpdateControls();check(!$('caveDashButton').classList.contains('hidden')&&caveDash(),'Dash e botão liberados após comprar');
    check(normalizeSave(JSON.parse(JSON.stringify(G))).cave.up.dash,'Compra do dash persiste');
    for(const card of CARDS.filter(c=>c.set==='bodega')){
      const file=PORTRAIT_FILES[card.person];if(file)check(collectibleArt(card.id).includes('portraits/'+file+'.jpg'),'Carta usa portraits: '+card.id);
    }
    for(const id of ['teiniagua','onca','saci','dunstano'])check(!!cardDef(id)&&!!collectibleArt(id),'Nova carta com arte e descrição: '+id);
    G.cave.floor=3;caveRun=null;const run=caveFloorRun();
    for(const kind of ['teiniagua','onca']){caveKill({kind,x:500,y:500});check(hasCard(kind),'Primeira vitória entrega figurinha de '+kind);}
    // Dano superior e animação de derrota sem novas ações ou cobranças.
    G.cave.floor=11;G.cave.hp=100;caveRun=null;Object.assign(worldOut,caveCenter(...CAVE.start));
    caveHurt(8,{x:worldOut.x-30,y:worldOut.y});check(G.cave.hp===90,'Profundezas causam 25% mais dano');
    caveFloorRun().inv=0;G.cash=500;const elapsed=G.elapsed;caveHurt(1000,{x:worldOut.x-20,y:worldOut.y});
    check(caveDefeatActive()&&inCave()&&G.cash===450,'Derrota inicia no andar, cobra uma única perda e não teleporta imediatamente');
    caveFaint();caveHurt(500,{x:0,y:0});check(G.cash===450,'Derrota repetida não cobra de novo');
    action('guide');simulate(1);check(modal===null&&G.elapsed===elapsed&&!caveDash(),'Interações, mundo e dash bloqueados durante a queda');
    caveDefeatTick(1);check(inCave()&&Number($('caveDefeat').firstElementChild.style.opacity)===0,'Queda aparece antes da frase');
    const surface=document.createElement('canvas');surface.width=500;surface.height=300;ctx=surface.getContext('2d');
    check(drawCaveDefeatedPlayer(180,230),'Pose de queda é desenhável');ctx=old.ctx;
    caveDefeatTick(1.6);check($('caveDefeat').textContent==='às vezes é morto quem peleia'&&Number($('caveDefeat').firstElementChild.style.opacity)===1,'Frase completa sobre a tela preta');
    caveDefeatTick(2);check(!caveDefeatActive()&&worldOut.map==='serra'&&G.cave.hp===caveMaxHp()&&bagQty('ametista')===2,'Recupera na entrada e mantém minérios');finishTalk();
    // Dois moradores catarinenses com pedidos exclusivos de chopp.
    worldOut={map:'sc',x:1200,y:800,dx:0,dy:1};G.phase='prep';G.roadEncounterSeed=123456;
    for(const p of OKTO_VISITORS){
      G.phase='prep';for(G.day=1;G.day<100&&!roadEncounterPlan(p.id,['sc']);G.day++);spawnWalkers(WORLD_MAPS.sc);
      const i=PEOPLE.findIndex(q=>q.id===p.id);check(worldWalkers.some(w=>w.person===i),'Morador anda em SC: '+p.id);
      check(visitorPool().includes(i)&&!isSpecial(i),'Morador pode visitar a bodega sem ser especial: '+p.id);
      check(['cigarro','erva','refri','cachaca','cafe','xis','salame'].every(k=>fitOrder(i,k)==='cerveja'),'Só pede chopp: '+p.id);
      G.phase='open';G.shop=[];G.stock.cerveja=25;pickVisitor=()=>i;
      const c=spawnShop();check(c?.pid==='cerveja'&&!c.extra?.length,'Pedido real de balcão é apenas chopp: '+p.id);G.shop=[];
    }
    pickVisitor=old.pickVisitor;G.phase='prep';G.groups=[];G.shop=[];
    const counts={vila:0,serra:0,sc:0};
    for(let day=1;day<=40;day++){G.day=day;for(const map of Object.keys(counts)){worldOut={map,x:1200,y:800};spawnWalkers(WORLD_MAPS[map]);counts[map]+=worldWalkers.filter(w=>ROAD_RIDERS.some(p=>p.id===PEOPLE[w.person].id)).length;}}
    check(Object.values(counts).every(n=>n>0),'Cavaleiros podem visitar as três regiões');
    {const ar=PEOPLE.findIndex(p=>p.id==='arami');let day=0,night=0;
     for(let d=1;d<=40;d++){G.day=d;for(const map of Object.keys(counts)){worldOut={map,x:1200,y:800};G.phase='prep';spawnWalkers(WORLD_MAPS[map]);day+=worldWalkers.filter(w=>w.person===ar).length;G.phase='closed';spawnWalkers(WORLD_MAPS[map]);night+=worldWalkers.filter(w=>w.person===ar).length;}}
     G.phase='prep';check(day===0&&night>0,'O Arami, cavaleiro charrua, só aparece de noite');}
    check(ROAD_RIDERS.every(p=>!visitorPool().some(i=>PEOPLE[i].id===p.id)&&WORLD_TALK[p.id].length>=4),'Cavaleiros têm prosa própria e ficam no mundo aberto');
    G.phase='closed';worldOut={map:'vila',x:1200,y:800};
    let found=false;for(let day=1;day<=50&&!found;day++){G.day=day;saciTick(.01);found=!!saciEncounter;}
    check(found,'Saci pode aparecer nas noites');
    const w=saciEncounter;w.age=5.9;saciTick(.2);check(w.mode==='whirl','Saci alterna para redemoinho');
    w.age=11.9;saciTick(.2);check(w.mode==='hop','Saci volta a saltitar com uma perna');
    saciTalk();check(hasCard('saci')&&worldTalkOpen(),'Conversa com Saci libera a figurinha');skipWorldTalk();
    G.phase='prep';saciTick(.01);check(!saciEncounter&&!visitorPool().includes(SACI_PERSON),'Saci não aparece de dia nem na bodega');
    G.bag={};const totalBefore=haveItem('peixe');
    for(let i=0;i<4;i++){Math.random=()=>((i+.2)/4);const fish=catchRiverFish(1);check(fish===RIVER_FISH[i].key&&bagQty(fish)===1&&itemIconHTML(fish).includes('uruguai-fish-v1'),'Pesca entrega espécie e sprite: '+fish);}
    Math.random=old.random;check(haveItem('peixe')===totalBefore+4&&canDeliver({peixe:3}),'Missões aceitam as quatro espécies');
    takeItems({peixe:3});check(haveItem('peixe')===1,'Entrega consome os peixes sem duplicar o estoque');
    const remaining=RIVER_FISH.find(f=>bagQty(f.key)>0),beforeSale=G.cash;storeSell(remaining.key);
    check(haveItem('peixe')===0&&G.cash===beforeSale+remaining.value,'Peixes novos podem ser vendidos no Armazém');
  }finally{
    Math.random=old.random;pickVisitor=old.pickVisitor;keys.clear();skipWorldTalk();closeDialog(true);$('caveDefeat')?.classList.add('hidden');$('dunstanTradeButton')?.remove();
    ({G,worldOut,worldWalkers,worldWalkersKey,caveRun,caveTrip,caveDefeat,saciEncounter,saciEncounterKey,saciEncounterGame,started,paused,modal,scene,phoneOpen,ctx,frameClock}=old);caveUpdateControls();
  }
  return results;
})()
