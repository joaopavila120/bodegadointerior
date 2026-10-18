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
    action('dunstanSell','ametista:1');check(bagQty('ametista')===2&&G.cash===cash+BAG_RAW.ametista.value,'Venda unitária paga o mineral correto');
    action('dunstanSell','agata:all');check(!bagQty('agata')&&G.cash===cash+BAG_RAW.ametista.value+2*BAG_RAW.agata.value,'Venda de todas as ágatas');
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
    {const M=WORLD_MAPS.vila,edge=p=>Math.min(p.x,M.W-p.x)<760&&Math.min(p.y,M.H-p.y)<820;let corners=true,roads=true;const seen=new Set();
     for(let day=1;day<=120;day++){G.day=day;saciEncounterKey='';saciTick(.01);const s=saciEncounter;if(!s)continue;corners=corners&&edge(s)&&M.canWalk(s.x,s.y);roads=roads&&qqRoadDist(M,s.x,s.y)>80;seen.add((s.x<M.W/2?'L':'R')+(s.y<M.H/2?'T':'B'));}
     check(corners&&roads&&seen.size>=3,'Saci fica nos cantos do mapa, longe das estradas');}
    G.day=1;for(let day=1;day<=50;day++){G.day=day;saciEncounterKey='';saciTick(.01);if(saciEncounter)break;}
    const w=saciEncounter;w.state='wander';w.t=99;worldOut.x=w.x+150;worldOut.y=w.y;saciTick(.05);check(w.state==='flee'&&w.mode==='whirl'&&w.escapes===1,'Sem cusco: chegou perto, ele vira redemoinho e foge pra outro canto');
    for(let i=0;i<500&&w.state==='flee';i++)saciTick(.05);check(w.state==='wander'&&Math.hypot(worldOut.x-w.x,worldOut.y-w.y)>300,'e reaparece pulando noutro canto');
    worldOut.x=w.x+60;worldOut.y=w.y;saciTryCatch();check(w.state==='flee'&&w.escapes===2,'E com ele atento: foge de novo');
    for(let i=0;i<500&&w.state==='flee';i++)saciTick(.05);w.state='pipe';w.t=3;worldOut.x=w.x+60;worldOut.y=w.y;saciTryCatch();
    check(w.state==='caught'&&modal==='talk'&&hasCard('saci'),'De mansinho, enquanto ele pita: pegou o Saci (e a figurinha)');
    for(let k=0;k<5&&modal==='talk';k++)talkNext();check(modal==='saciWish'&&w.opts.length===3&&new Set(w.opts.map(o=>o.kind)).size===3&&$('dialogContent').querySelectorAll('[data-act="saciWish"]').length===3,'O desejo: sempre três opções diferentes');
    {const o=w.opts.find(o=>o.kind==='caveItem')||w.opts[0],before=o.kind==='caveItem'?caveBag()[o.id]||0:0;action('saciWish',String(w.opts.indexOf(o)));check(w.state==='gone'&&!modal&&(o.kind!=='caveItem'||caveBag()[o.id]>before)&&G.saci.lastWish===G.day,'Escolheu: ganha o desejo e o Saci some');}
    {const d=G.day;let any=false;for(let k=1;k<SACI_RULES.rest;k++){G.day=d+k;saciEncounterKey='';saciTick(.01);any=any||!!saciEncounter;}check(!any,'Depois de um desejo, ele some por uns dias');G.day=d;}
    G.saci={};for(let day=60;day<=200;day++){G.day=day;saciEncounterKey='';saciTick(.01);if(saciEncounter)break;}
    {const s=saciEncounter;G.cusco={day:1,mode:'follow'};worldOut.x=s.x+(s.x<WORLD_MAPS.vila.W/2?500:-500);worldOut.y=s.y;if(!WORLD_MAPS.vila.canWalk(worldOut.x,worldOut.y)){worldOut.x=s.x;worldOut.y=s.y+(s.y<1500?450:-450);}
     Object.assign(cusco,{x:worldOut.x-60,y:worldOut.y+14,map:'vila',walk:false});let i=0;for(;i<900&&s.state!=='held';i++){cuscoTick(.03);saciTick(.03);}
     check(s.state==='held'&&Math.hypot(cusco.x-s.x,cusco.y-s.y)<70,'Com o cusco: ele late, corre atrás e encurrala o Saci');
     worldOut.x=s.x+80;worldOut.y=s.y;saciTryCatch();check(s.state==='caught','Encurralado, é só chegar e apertar E');while(modal==='talk')talkNext();closeDialog(true);G.cusco=null;cusco.map=null;}
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
