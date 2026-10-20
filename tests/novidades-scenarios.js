// Novidades: caverna com minérios, forja, bornal e o susto do São Dunstano (que também passeia na Serra contando a vida
// dele); pescaria de verdade e o dourado; o arco do Peixinho na Brasa; a cuiudada da caça aos javalis; a tropilha fugida
// da Estela; Teiniaguá e Anhangá; dormir sem o "Abrir a bodega"; o domingo de costelão; o tapete; a Cadela Baia sumida e
// os pedidos de itens espaçados.
(() => {
 const results=[],check=(ok,text)=>{if(!ok)throw Error(text);results.push(text);};
 const confirmBefore=window.confirm,scenesBefore=window.NO_SCENES,randomBefore=Math.random;
 try{
  window.confirm=()=>true;window.NO_SCENES=true;localStorage.removeItem(KEY);
  action('new');sceneSkip();closeDialog(true);
  G.prologue.done=true;G.prologue.step=PROLOGUE_STEPS.length;G.tutorial.day=4;G.calOffset=3;G.day=30;G.tutorial.complete=true;G.phase='prep';G.valterQueue=[];G.teachQueue=[];
  G.taught={manha:true,pesca:true,pedidos:true,missoes:true,javali:true,cavalo:true};G.regions={serra:true,sc:true};G.cash=5000;
  G.missions={};for(const m of storyChapters())if(m.chapter<13)G.missions[m.id]={status:'done',day:1};
  const talkAll=()=>{let k=0;while(modal==='talk'&&k++<40)talkNext();};
  const skip=()=>{let k=0;while(scene&&k++<80)sceneSkip();};
  const withScenes=f=>{const ns=window.NO_SCENES;window.NO_SCENES=false;try{return f();}finally{window.NO_SCENES=ns;}};
  const dayFor=id=>{let d=G.day+1;while(mapEventFor(d)!==id)d++;return d;};

  // ---------- dormir, domingo, tapete, Baia, pedidos ----------
  {goInside();G.phase='closed';G.report=null;G.testMode=true;G.nextEvent=null;closeDialog(true);worldOut={map:'casa:sadi',...HOME_BED_POINT};homeBedMenu();action('homeSleep');talkAll();check(modal!=='event'&&!/Abrir a bodega/.test($('dialogContent').textContent)&&G.phase==='prep','dormir não abre o quadro com “Abrir a bodega”: dá pra explorar antes');G.testMode=false;closeDialog(true);}
  {let d=G.day;while(calendar(d+1).weekday!==6)d++;G.day=d;G.nextEvent=null;G.phase='closed';G.report=null;G.costelaoTaught=true;G.stock.costela_crua=6;closeDialog(true);nextDay('automatic');
   check(G.event.id==='costelao'&&!$('domingoCard').classList.contains('hidden')&&$('domingoCard').textContent.includes('Domingo é dia de costelão!'),'domingo de costelão começa com a tela preta “Domingo é dia de costelão!”');$('domingoCard').classList.add('hidden');talkAll();closeDialog(true);
   G.day++;G.nextEvent=null;G.phase='closed';G.report=null;$('domingoCard').classList.add('hidden');nextDay('automatic');check(G.event.id!=='costelao'&&$('domingoCard').classList.contains('hidden'),'nos outros dias, nada de tela preta');talkAll();closeDialog(true);}
  {goOutside();switchMap({map:'casa:marcio',x:700,y:840});closeDialog(true);check(WORLD_MAPS['casa:marcio'].canWalk(1000,700)&&WORLD_MAPS['casa:marcio'].canWalk(900,720),'dá pra pisar em cima do tapete');}
  {G.missions.baia={status:'calling',day:G.day};G.baiaArc=null;check(baiaAway()&&!baiaAtHome()&&!baiaWalksToday(),'Cadela Baia sumida: nem em casa nem passeando com o Mano Lima');
   G.missions.abertura={status:'done',day:1};const cos=MISSIONS.find(m=>m.id==='costelao');delete G.missions.costelao;const mi=PEOPLE.findIndex(p=>p.id==='manolima');G.friends[mi]=40;
   check(mainArcPending('manolima')&&missionForGiver('manolima')?.id!=='costelao','primeiro a Cadela Baia: o costelão do Mano Lima espera');G.missions.baia={status:'done',day:1};G.baiaArc={stage:'done'};check(!mainArcPending('manolima'),'achada a Baia, as outras missões do Mano Lima liberam');}
  {G.quests={};G.questOpen=[];G.questNextDay=0;for(const p of PEOPLE)if(p.unique)G.friends[PEOPLE.indexOf(p)]=40;const now=()=>Object.keys(HOUSE_QUESTS).filter(id=>questOffer(id)?.kind==='quest');
   const first=now();check(first.length===1,'pedidos de itens chegam um de cada vez');G.day++;check(now().length===1,'no dia seguinte ainda não chega outro');G.day+=3;check(now().length===2,'uns dias depois, chega o segundo');G.day+=3;check(now().length===2,'e no máximo dois esperando resposta');
   const i=PEOPLE.findIndex(p=>p.id===first[0]);questAccept(i);closeDialog(true);check(!G.questOpen.some(o=>o.id===first[0])&&questState(first[0]).active,'aceito, o pedido sai da fila de novos');}

  // ---------- caverna: minérios, forja, equipamento, bornal ----------
  {G.missions.baia={status:'done',day:1};G.cave={facao:true,floor:1,deepest:20,hp:100,up:{},dunstanTaught:true};caveRun=null;worldOut=null;goOutside();switchMap({map:'serra',x:CAVE.door.x,y:CAVE.door.y+160});closeDialog(true);
   const floors={};for(let f=2;f<=20;f++)floors[f]=buildCaveFloor(f).rocks.map(r=>r.loot);
   check(Object.entries(floors).every(([f,l])=>l.includes(+f>10?'agata':'ametista')),'todo andar tem o minério principal');
   check(Object.entries(floors).every(([f,l])=>l.every(k=>!CAVE_ORES[k]||+f>=CAVE_ORES[k].from&&+f<=CAVE_ORES[k].to)),'cada minério só aparece na faixa dele');
   check(['cobre','ferro','opala','ouro'].every(k=>Object.values(floors).some(l=>l.includes(k))),'cobre, ferro, opala e ouro aparecem conforme desce');
   check(Object.keys(CAVE_ORES).every(k=>!SELLABLE.includes(k)&&BAG_RAW[k]),'minérios novos: só São Dunstano compra');
   enterCave(1);closeDialog(true);talkAll();switchMap({map:'caverna',x:830,y:800});closeDialog(true);dunstanShop();{const html=$('dialogContent').innerHTML,heads=[...$('dialogContent').querySelectorAll('h3.forja-sec')].map(h=>h.textContent);check(modal==='dunstanShop'&&$('dialogContent').querySelectorAll('[data-act="dunstanTab"]').length===2&&heads.length===4&&/Armas/.test(heads[0])&&/Bolicho/.test(heads[3])&&html.includes('forja-ores')&&html.includes('data-act="bolichoBuy"')&&html.includes('data-act="forjaMake"')&&!html.includes('data-act="dunstanSell"'),'ferraria num menu só (armas, afiar, equipamento e bolicho, com os minérios no topo); vender fica na aba do lado');}
   const d0=caveDmg();bagAdd('ametista',9);action('forjaMake','ametista');check(caveWeapon().id==='facao'&&bagQty('ametista')===9,'sem 10 ametistas, nada de espada');
   bagAdd('ametista',1);const c0=G.cash;action('forjaMake','ametista');check(caveWeapon().id==='ametista'&&!bagQty('ametista')&&G.cash===c0-200&&caveDmg()===34&&caveDmg()>d0,'10 ametistas + R$ 200: espada de ametista na mão');
   bagAdd('ametista',2);action('forjaAfiar');check(weaponRefine()===1&&caveDmg()===37,'afiar na pedra com minério: +3 de dano');
   action('forjaEquip','facao');check(caveDmg()===d0,'troca de volta pro facão do vô');action('forjaEquip','ametista');
   bagAdd('cobre',3);action('dunstanTab','equipamento');facaoBuy('chapeu');check(caveUp('chapeu')&&!bagQty('cobre'),'chapéu de aba larga custa cobre além do dinheiro');
   facaoBuy('pala');check(!caveUp('pala'),'pala só depois do poncho');facaoBuy('poncho');bagAdd('ferro',4);facaoBuy('pala');check(caveUp('pala')&&caveMaxHp()===180,'pala de lã crioula: 180 de vida');
   facaoBuy('botas');facaoBuy('guaiaca');facaoBuy('bornal');check(caveUp('botas')&&caveUp('guaiaca')&&caveBagMax()===10,'botas, guaiaca e bornal maior');
   action('dunstanTab','bolicho');for(const id of ['chimarrao','canha','boleadeira','patua','ticao','aguabenta'])action('bolichoBuy',id+':1');action('bolichoBuy','chimarrao:3');
   check(caveBag().chimarrao===4&&caveBag().canha===1&&caveBeltItems().length===5,'bolicho do santo: itens gaúchos no bornal, cinco no cinto');
   bagAdd('cobre',5);bagAdd('opala',2);action('dunstanTab','vender');check($('dialogContent').querySelectorAll('[data-act="dunstanSell"]').length>=CAVE_MINERALS.length&&!$('dialogContent').innerHTML.includes('data-act="forjaMake"'),'a aba do lado só vende minério');const c1=G.cash;action('dunstanSell','cobre:all');action('dunstanSell','opala:1');check(G.cash===c1+5*CAVE_ORES.cobre.value+CAVE_ORES.opala.value,'São Dunstano compra os minérios novos');closeDialog(true);
   enterCave(6);closeDialog(true);const run=caveFloorRun(),p=worldOut,st=caveState();
   st.hp=50;check(caveUse('chimarrao')&&st.hp===90,'cuia de chimarrão: +40 de vida');
   const base=caveDmg();caveUse('canha');check(caveBuff('canha')&&caveDmg()===Math.round(base*1.4),'trago de canha: +40% de dano por um tempo');
   const b=run.beasts[0];b.x=p.x+80;b.y=p.y;b.hp=b.max=500;caveUse('boleadeira');check(b.stun>0,'boleadeira atordoa o bicho perto');const bx=b.x;caveBeastTick(b,.5,run,p);check(b.x===bx,'atordoado, ele não sai do lugar');
   caveUse('patua');const hp=st.hp;run.inv=0;caveHurt(20,{x:p.x-10,y:p.y});check(st.hp===hp&&!caveBuffs().patua,'patuá benzido segura a pancada inteira');
   run.inv=0;caveHurt(20,{x:p.x-10,y:p.y});check(st.hp===hp-17,'chapéu de aba larga: 15% menos dano');
   check(caveUse('ticao')&&run.torch,'tição de angico clareia o andar');
   b.kind='lobisomem';caveUse('aguabenta');check(caveHitDmg(b)===caveDmg()*2&&caveHitDmg({kind:'javali'})===caveDmg(),'água benta: dano em dobro só nas assombrações');
   const n=run.drops.length;caveKill({kind:'javali',x:p.x,y:p.y});const coin=run.drops.slice(n).find(d=>d.k==='moeda');check(coin&&coin.q>=Math.round((CAVE_BEASTS.javali.cash[0]+2)*1.3)-1,'guaiaca: mais moedas dos bichos');
   check(movementBonus()>=.15,'botas de garrão: mais ligeiro na caverna');
   closeDialog(true);document.dispatchEvent(new KeyboardEvent('keydown',{key:'b',bubbles:true}));check(modal==='caveBag'&&$('dialogTitle').textContent==='Bornal da caverna','B na caverna abre o bornal dela');closeDialog(true);
   st.hp=40;const ch=caveBag().chimarrao;document.dispatchEvent(new KeyboardEvent('keydown',{key:'1',bubbles:true}));check(caveBag().chimarrao===ch-1&&st.hp===80,'tecla 1 usa o primeiro item do cinto');
   caveUpdateControls();check(!$('caveBelt').classList.contains('hidden')&&$('caveBelt').querySelectorAll('button').length===caveBeltItems().length,'cinto de itens na tela da caverna');
   const r=run.rocks[0];r.hp=1;r.loot='ferro';worldOut.x=r.x-60;worldOut.y=r.y+10;worldOut.dx=1;worldOut.dy=0;run.cd=0;run.dash=null;caveAttack();const dr=run.drops.find(d=>d.k==='ferro');check(!!dr,'pedra com veio de ferro solta o minério');const fe=bagQty('ferro');worldOut.x=dr.x;worldOut.y=dr.y;caveTick(.05);check(bagQty('ferro')===fe+1&&caveTripNow().ferro===1,'pegou o ferro: vai pro inventário e pro saldo da descida');
   check(caveLootTiles(caveTripNow()).some(t=>t[2]==='Ferro'),'o saldo da descida mostra o ferro');
   caveLeave();talkAll();}
  // o susto da primeira descida e o fantasma que passeia pela estrada da Serra
  withScenes(()=>{G.cave=null;worldOut=null;goOutside();switchMap({map:'serra',x:CAVE.door.x,y:CAVE.door.y+160});closeDialog(true);caveState().facao=true;enterCave(1);
   check(scene?.id==='caverna-dunstano'&&scene.view==='world'&&scene.steps.some(s=>s.ghost),'primeira descida: o susto com a aparição do fantasma');skip();
   check(modal==='talk'&&$('dialogTitle').textContent.includes('Dunstano')&&/bornal|B/.test(JSON.stringify(talkState.lines)),'depois ele ensina a caverna, a forja e o bornal');talkAll();check(caveState().dunstanTaught&&hasCard('dunstano'),'aprendeu e ganhou a figurinha do santo');caveLeave();talkAll();
   G.phase='closed';let d=G.day;while(caveRand(d*733+11)()>=.3)d++;G.day=d;switchMap({map:'serra',x:1600,y:1000});closeDialog(true);for(let i=0;i<3;i++)outsideTick(.05);
   const w=dunstanOut;check(!!w&&WORLD_MAPS.serra.canWalk(w.x,w.y),'em algumas noites o São Dunstano caminha pela estrada da Serra');
   worldOut.x=w.x;worldOut.y=w.y;const sp=walkerSpots().find(s=>s.id==='walker:dunstano');check(!!sp,'dá pra prosear com ele na estrada');sp.act();
   const lore=DUNSTAN_LORE.flat().map(l=>l[1]).join(' ');const falas=lore+' '+WORLD_TALK.dunstano.map(l=>l.reply).join(' ')+' '+DUNSTAN_TEACH.flat().join(' ');
   check(modal==='talk'&&['909','São Bento','ourives','tenaz','ferradura','973','988','19 de maio'].every(t=>lore.includes(t)),'na estrada, ele conta a vida dele: 909, a forja, a tenaz, a coroação, 988');
   check(!/Inglaterra|ingl[eê]s|Glastonbury|Cantu[aá]ria|Gante|Flandres|Bath|Londres|Edgar|Eadwig/.test(falas),'o santo não fala de onde veio: ele só é');talkAll();
   G.phase='prep';outsideTick(.05);check(!dunstanOut,'de dia ele não sai da gruta');});

  // ---------- pescaria e o dourado ----------
  {goOutside();switchMap({map:'vila',x:470,y:917});closeDialog(true);
   check(FISH_KINDS.dourado.far>FISH_KINDS.dourado.near*5,'o dourado mora longe, na correnteza');
   let far=0;for(let i=0;i<4000;i++)if(pickFish(.9)==='dourado')far++;let near=0;for(let i=0;i<4000;i++)if(pickFish(.1)==='dourado')near++;check(far>near*3&&far<4000*.2,'dourado é raro: bem mais longe do que perto do trapiche');
   G.fish=null;goFishing();fishKey(true);for(let i=0;i<40;i++)fishTick(.05);fishKey(false);const castFar=fishing.castX;check(fishing.phase==='fly','solta o E: a boia voa');for(let i=0;i<14;i++)fishTick(.05);check(fishing.phase==='wait','e fica boiando');
   fishing.biteIn=0;fishTick(.05);check(fishing.phase==='bite'&&/AFUNDOU/.test(fishing.msg),'quando afunda de vez, avisa');for(let i=0;i<30;i++)fishTick(.05);check(fishing.phase==='done'&&!fishing.ok,'demorou pra fisgar: o peixe leva a isca');closeDialog(true);fishing=null;
   goFishing();fishKey(true);fishKey(false);for(let i=0;i<14;i++)fishTick(.05);fishing.kind='dourado';fishing.biteIn=0;fishTick(.05);fishKey(true);check(fishing.phase==='fight','fisgou: começa a briga');
   for(let i=0;i<200&&fishing.phase==='fight';i++){fishing.holding=true;fishTick(.05);}check(fishing.phase==='done'&&!fishing.ok&&/Arrebentou/.test(fishing.msg),'segurando o molinete o tempo todo, a linha arrebenta');closeDialog(true);fishing=null;
   goFishing();fishKey(true);fishKey(false);for(let i=0;i<14;i++)fishTick(.05);fishing.kind='dourado';fishing.biteIn=0;fishTick(.05);fishKey(true);fishKey(false);
   for(let i=0;i<200&&fishing.phase==='fight';i++){fishing.holding=false;fishing.run=0;fishing.runIn=9;fishTick(.05);}check(fishing.phase==='done'&&!fishing.ok&&/frouxa/.test(fishing.msg),'linha frouxa demais: ele cospe o anzol');closeDialog(true);fishing=null;
   G.fish=null;const dg=bagQty('dourado');goFishing();fishKey(true);fishKey(false);for(let i=0;i<14;i++)fishTick(.05);fishing.kind='dourado';fishing.biteIn=0;fishTick(.05);fishKey(true);
   let k=0;while(fishing.phase==='fight'&&k++<6000){fishing.holding=!fishing.run&&fishing.tension<.55;fishTick(.05);}
   check(fishing.ok&&bagQty('dourado')===dg+1&&fishing.kg>=2&&G.fishRecords?.dourado,'soltando na carreira e recolhendo no cansaço: o dourado, o rei do rio');closeDialog(true);fishing=null;
   check(/<svg[^>]*filter/.test(itemIconHTML('dourado'))&&bagIcon('opala').includes('forge-supplies-v1.png'),'o dourado e os minérios têm ícone pintado no inventário');}
  // arco do Peixinho na Brasa: o dourado e cinco cervejas
  withScenes(()=>{const pi=PEOPLE.findIndex(p=>p.id==='peixinhonabrasa');G.friends[pi]=5;delete G.missions.peixinho;G.quests={};G.questOpen=[];G.questNextDay=0;
   check(!missionForGiver('peixinhonabrasa')&&mainArcPending('peixinhonabrasa')&&!questOffer('peixinhonabrasa'),'antes do arco do Peixinho, nada de pedido de itens dele');
   G.friends[pi]=20;const m=missionForGiver('peixinhonabrasa');check(m?.id==='peixinho'&&m.intro.some(l=>/pela-saco/.test(l[1])),'com amizade, o Peixinho pede o dourado e 5 cervejas pros piá');
   offerMission(m,[]);talkAll();closeDialog(true);if(!missionActive('peixinho'))startMission(m);check(missionActive('peixinho')&&/dourado/.test(m.goal()),'missão aceita: o painel mostra o dourado e as cervejas');
   G.stock.cerveja=10;bagAdd('dourado',1);switchMap({map:'casa:peixinhonabrasa',x:600,y:700});closeDialog(true);check(questMarker('peixinhonabrasa')==='deliver','com tudo na mão, dá pra entregar');
   showQuest(pi);action('questDeliver',String(pi));talkAll();check(scene?.id==='peixinho-na-brasa'&&scene.steps.some(s=>s.actor==='gremio2_1')&&scene.view==='world','a cena: o peixinho na brasa com os piá… e os pela-saco chorando');skip();talkAll();
   check(missionDone('peixinho')&&!mainArcPending('peixinhonabrasa'),'arco do Peixinho concluído');});

  // ---------- caça aos javalis com a cuiudada ----------
  withScenes(()=>{goInside();G.day=dayFor('javali');G.nextEvent=null;G.phase='closed';G.report={};const st=mapEvState('javali');st.intro=true;G.cave=G.cave||null;
   goOutside();switchMap({map:'vila',x:1500,y:900});closeDialog(true);for(let i=0;i<3&&!scene;i++)outsideTick(.05);
   check(scene?.id==='caca-reuniao'&&scene.world?.fires?.length&&['valter','anselmo','arlindo','ramiro'].every(id=>scene.steps.some(s=>s.actor===id)),'de noite, a cuiudada reunida em volta do fogo na frente da bodega');skip();
   check(cuiudosGathered()&&cuiudoSpots().length===javaliList().length,'um cuiudo com lampião perto de cada javali');
   spawnWalkers(WORLD_MAPS.vila);check(!worldWalkers.some(w=>CUIUDOS_CREW.includes(PEOPLE[w.person]?.id)),'quem está caçando não passeia pela estrada ao mesmo tempo');
   const js=javaliSpots()[0];check(/espingarda/.test(js.label),'perto de cada javali, a espingarda do tiro aos javalis');js.act();talkAll();check(shootActive(),'tiro aos javalis');
   shootTick(2.5);const o=shoot.targets[4];Object.assign(o,{kind:'javali',hp:1,state:'up',rise:1,t:5});const p=shootPose(o);shoot.aim={x:p.x,y:p.y-26*p.js};shootFire();check(shoot.cheer>0&&shoot.fx.some(f=>/Sadi|guri|tiro|falo/.test(f.text)),'acertou: os cuiudos torcem na beira do campo');drawShoot();
   shoot.kills=SHOOT.need;shootTick(60);check(scene?.id==='caca-agradecimento'&&st.done&&scene.steps.some(s=>s.say==='anselmo'),'meta batida: a vizinhança agradece em volta do fogo');skip();check(modal==='talk'&&/javalis/.test($('dialogContent').textContent+$('dialogTitle').textContent),'e depois o placar com a recompensa');talkAll();check(G.cacaThanked===1,'a cena completa é a da primeira vez');});

  // ---------- tropilha fugida da Estela ----------
  withScenes(()=>{goInside();G.day=dayFor('cavalos');G.nextEvent=null;G.phase='prep';const st=mapEvState('cavalos');check(!!MAP_EVENTS.cavalos&&MAP_EVENTS.cavalos.giver==='estela','novo evento: a tropilha fugida, pedido da Estela');
   playEventScene(MAP_EVENTS.cavalos);check(scene?.id==='evento-cavalos'&&scene.view==='world'&&scene.steps.some(s=>s.actor==='estela'),'a Estela chega a galope na frente da bodega e pede ajuda');skip();talkAll();st.intro=true;
   G.phase='closed';G.report={};goOutside();switchMap({map:'vila',x:1500,y:900});closeDialog(true);check(cavaloSpots().length>=CAVALOS_NEED&&estelaSpot().length===1,'de noite, os cavalos pastando pela Fronteira e a Estela esperando');
   spawnWalkers(WORLD_MAPS.vila);check(!worldWalkers.some(w=>PEOPLE[w.person]?.id==='estela'),'a Estela não passeia em dobro');
   const h=cavaloList()[0];startHorseLasso(h);const L=G.lasso,b=L.bois[0];check(L.mode==='cavalo'&&b.cavalo,'laçada de cavalo');
   b.mode='graze';b.t=9;G.player.x=b.x-200;G.player.y=b.y;L.charging=false;lassoTick(.05);check(b.mode==='flee','chegou perto: o cavalo se espanta');
   b.mode='graze';b.t=9;b.face=1;b.kickCd=0;G.player.x=b.x-70;G.player.y=b.y;L.immune=0;lassoTick(.05);check(b.mode==='kick','por trás: ele arma o coice');for(let i=0;i<12;i++)lassoTick(.05);check(L.hits===1,'coice!');
   b.rope=1;horseRoped(L,b);check(b.bolt>0&&b.state==='free','primeiro laço: ele dispara');b.rope=CAVALO_HITS;st.kills=CAVALOS_NEED-1;horseRoped(L,b);check(b.state==='caught'&&L.caught===1,'segundo laço: laçou');
   for(let i=0;i<120&&G.lasso;i++)lassoTick(.05);check(!G.lasso&&st.done&&scene?.id==='cavalos-agradecimento'&&scene.steps.some(s=>s.horse!=null),'três cavalos de volta: a Estela agradece e leva a tropilha');skip();talkAll();});

  // ---------- Teiniaguá e Anhangá ----------
  withScenes(()=>{goInside();let d=G.day+1;const neg=x=>{const k=G.day;G.day=x;const r=negrinhoTonight();G.day=k;return r;};while(mapEventFor(d)||neg(d))d++;G.day=d;G.phase='closed';G.report={};goOutside();
   for(const id of ['teiniagua','anhanga']){G.folk={};G.folkNight={day:G.day,id};const map=FOLK[id].map;switchMap({map,x:1600,y:1000});closeDialog(true);const sp=folkSpots(map)[0];check(sp&&WORLD_MAPS[map].canWalk(sp.x,sp.y),'de noite, '+FOLK[id].name+' aparece no mapa');
    worldOut.x=sp.x;worldOut.y=sp.y;interact();check(scene?.id==='folk-'+id,'cena do encontro: '+FOLK[id].name);skip();
    if(id==='teiniagua'){check(modal==='salamanca','as provas da Salamanca: ouro, amor e poder');for(const [,,ok] of SALAMANCA_PROVAS)action('salamancaAnswer',String(ok));}
    else{check(modal==='farmGame','soltar o filhote do laço e ficar quieto');let k=0;while(farmGame&&k++<200){const s=farmStage();if(s.kind==='alternate')farmGameKey(k%2?'a':'d');else{farmGame.pos=(s.zone[0]+s.zone[1])/2;farmGameKey('e');}}}
    check(G.relics?.[FOLK[id].relic],'vencendo, a lembrança vai pra estante: '+FOLK[id].relic);talkAll();}
   for(let i=0;i<120&&!(hasCard('teiniagua')&&hasCard('anhanga'));i++)cardsTick();check(hasCard('teiniagua')&&hasCard('anhanga')&&!!collectibleArt('anhanga'),'e as figurinhas da lenda');goInside();check(lembrancas().includes('carbunculo')&&lembrancas().includes('galhada'),'carbúnculo e galhada na estante da bodega');});
  // ---------- missões dos encontros: sino, corrente, reportagem e rio ----------
  {G.cave={facao:true,floor:1,deepest:12,hp:100,up:{},dunstanTaught:true};caveRun=null;worldOut=null;goOutside();switchMap({map:'igreja',x:600,y:700});closeDialog(true);
   delete G.missions.sino;worldTalk({person:PADRE_ROMIO,x:600,y:470});check(modal==='talk'&&/sino/.test(JSON.stringify(talkState?.lines||'')),'Padre Romio: o sino da capela rachou');talkAll();check(missionActive('sino'),'aceitou: cobre e ferro pro São Dunstano');
   const ab=CAVE_ITEMS.find(i=>i.id==='aguabenta').cost,c0=bagQty('cobre'),f0=bagQty('ferro');bagAdd('cobre',SINO_NEEDS.cobre);bagAdd('ferro',SINO_NEEDS.ferro);
   goOutside();switchMap({map:'serra',x:CAVE.door.x,y:CAVE.door.y+160});closeDialog(true);enterCave(1);closeDialog(true);talkAll();switchMap({map:'caverna',x:830,y:800});closeDialog(true);dunstanShop();
   check(/forjaSino/.test($('dialogContent').innerHTML),'na ferraria, o santo oferece fundir o sino');action('forjaSino');talkAll();check(sinoForged()&&bagQty('cobre')===c0&&bagQty('ferro')===f0,'sino fundido com cobre e ferro');
   caveLeave();closeDialog(true);talkAll();switchMap({map:'igreja',x:600,y:700});closeDialog(true);worldTalk({person:PADRE_ROMIO,x:600,y:470});talkAll();
   check(missionDone('sino')&&CAVE_ITEMS.find(i=>i.id==='aguabenta').cost===Math.round(ab/2),'sino entregue: água benta pela metade no bolicho');}
  {const di=PEOPLE.findIndex(p=>p.id==='dianho');delete G.missions.corrente;startMission(MISSIONS.find(m=>m.id==='corrente'));closeDialog(true);
   goOutside();switchMap({map:'serra',x:CAVE.door.x,y:CAVE.door.y+160});closeDialog(true);enterCave(CORRENTE_FLOOR);closeDialog(true);talkAll();const b=caveFloorRun().beasts.find(b=>b.carrier);
   check(b&&b.kind==='lobisomem','no andar 7, o lobisomem com a corrente do Dianho');b.hp=0;caveKill(b);check(bagQty('corrente')===1,'derrubado: a corrente vai pro inventário');
   caveLeave();closeDialog(true);talkAll();check(questOffer('dianho')?.kind==='mission'&&canDeliver(questOffer('dianho').want),'na casa do Dianho, dá pra entregar a corrente');questDeliver(di);talkAll();check(missionDone('corrente')&&!bagQty('corrente'),'corrente devolvida');}
  {delete G.missions.reportagem;startMission(MISSIONS.find(m=>m.id==='reportagem'));closeDialog(true);
   const neg=x=>{const k=G.day;G.day=x;const r=negrinhoTonight();G.day=k;return r;};let d=G.day+1;while(mapEventFor(d)||neg(d))d++;G.day=d;G.phase='closed';G.report={};G.folk={};G.folkNight=null;G.saci={};
   goOutside();switchMap({map:'vila',x:1600,y:900});closeDialog(true);const f=folkTonight();check(f&&reportWants(f)&&/hoje/.test(reportGoal()),'com a reportagem, toda noite aparece uma assombração que falta filmar');
   saciEncounterKey='';saciTick(.01);check(saciEncounter?.map==='vila','e o Saci aparece na Fronteira');
   for(let i=0;i<5;i++)outsideTick(.05);check(reportCrew.map==='vila'&&reportCrew.list.every(c=>worldCanWalk(c.x,c.y)),'o Gustavo e o Lauro andam junto, de noite');
   const s=saciEncounter;s.state='pipe';s.t=99;const aim=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>({dx,dy,x:s.x-dx*240,y:s.y-dy*170})).find(q=>worldCanWalk(q.x,q.y));
   const toward={dx:aim.dx,dy:aim.dy};Object.assign(worldOut,{x:aim.x,y:aim.y,dx:-aim.dx,dy:-aim.dy});outsideInteract();check(!reportFilmed().saci,'de costas pro Saci, a câmera não pega');
   Object.assign(worldOut,toward);outsideInteract();check(reportFilmed().saci,'Saci enquadrado na frente: E filma');
   for(const k of Object.keys(FOLK).filter(k=>reportWants(k)).slice(0,REPORT_FOLK))reportFilmed()[k]=G.day;
   withScenes(()=>{closeDialog(true);talkState=null;missionsTick();});talkAll();check(missionDone('reportagem')&&G.touristsUntil===G.day+3,'filmados o Saci e duas assombrações: o especial vai ao ar');
   {const a=arrivalInterval('group');G.touristsUntil=0;check(a<arrivalInterval('group'),'e vêm turistas pra bodega');G.touristsUntil=G.day+3;}}
  {delete G.missions.rio;G.rio=null;const ar=PEOPLE.findIndex(p=>p.id==='arami');switchMap({map:'vila',x:1600,y:900});closeDialog(true);
   worldTalk({person:ar,x:1600,y:900});check(modal==='talk','Arami: o caminho do rio');talkAll();check(missionActive('rio')&&bagQty('muda_butia')===1&&bagQty('muda_araucaria')===1,'aceitou: as mudas de butiá e de araucária');
   check(WORLD_MAPS.vila.spots().some(s=>s.id==='rio:arami'),'de noite, o Arami espera na beira do rio');
   for(const p of RIO_PLANTS){worldOut.x=p.x;worldOut.y=p.y;interact();}check(rioPlantedAll()&&!bagQty('muda_butia'),'mudas plantadas na margem');
   for(const h of RIO_HERBS){worldOut.x=h.x;worldOut.y=h.y;interact();check(modal==='rioErva','erva do mato pra reconhecer: '+h.name);action('rioErva',h.id+':'+h.options.find(o=>o!==h.name));check(!rioState().herbs[h.id],'nome errado não vale: '+h.name);
    worldOut.x=h.x;worldOut.y=h.y;interact();action('rioErva',h.id+':'+h.name);}
   check(rioHerbsAll(),'as três ervas reconhecidas');const l0=douradoLuck();worldOut.x=RIO_ARAMI.x;worldOut.y=RIO_ARAMI.y+20;interact();talkAll();
   check(missionDone('rio')&&l0===1&&douradoLuck()>1,'o Arami ensina a ler o rio: mais chance de dourado');G.phase='prep';G.report=null;goInside();}
  // ---------- ferraduras do cavalo na bigorna ----------
  {mountState().owned=true;G.mount.stabled=false;delete G.mount.shoes;G.cash=Math.max(G.cash,800);worldOut=null;goOutside();switchMap({map:'serra',x:CAVE.door.x,y:CAVE.door.y+160});closeDialog(true);enterCave(1);closeDialog(true);talkAll();switchMap({map:'caverna',x:830,y:800});closeDialog(true);
   const c0=bagQty('cobre');bagAdd('cobre',HORSESHOES.cobre.needs.cobre);dunstanTab='loja';dunstanShop();check(/ferraduraForjar/.test($('dialogContent').innerHTML),'com o cavalo crioulo, a ferraria faz ferraduras');
   const cash=G.cash;action('ferraduraForjar','cobre');check(!farmGame&&modal==='talk','sem minijogo: o santo faz na hora');talkAll();
   check(horseshoes()==='cobre'&&bagQty('cobre')===c0&&G.cash===cash-HORSESHOES.cobre.cost,'ferraduras de cobre no cavalo, com cobre e dinheiro');closeDialog(true);
   caveLeave();closeDialog(true);talkAll();switchMap({map:'vila',x:1600,y:735});closeDialog(true);keys.clear();
   const run=()=>{worldOut.x=1600;worldOut.y=735;keys.add('d');outsideTick(.05);keys.clear();return worldOut.x-1600;};const shod=run();delete G.mount.shoes;const b=movementBonus(),bare=run();G.mount.shoes='cobre';
   check(playerMounted()&&Math.abs(shod/bare-(1+b+.1)/(1+b))<.02,'montado e ferrado: o cavalo anda 10% mais ligeiro');
   {const n0=AudioEngine.noise;let clop=0;AudioEngine.noise=function(...a){clop++;return n0.apply(this,a);};try{keys.add('d');for(let i=0;i<20;i++)outsideTick(.05);keys.clear();const moving=clop;G.mount.stabled=true;clop=0;keys.add('d');for(let i=0;i<20;i++)outsideTick(.05);keys.clear();check(moving>=3&&clop===0,'som de casco leve só andando montado');}finally{AudioEngine.noise=n0;G.mount.stabled=false;}}G.mount.owned=false;delete G.mount.shoes;goInside();}
  // ---------- economia (docs/plano-economia.md) ----------
  {G.cave={facao:true,floor:1,deepest:20,hp:100,up:{},dunstanTaught:true};caveRun=null;worldOut=null;goOutside();switchMap({map:'serra',x:CAVE.door.x,y:CAVE.door.y+160});closeDialog(true);
   enterCave(3);closeDialog(true);talkAll();let run=caveFloorRun();const b=run.beasts[0],r=run.rocks[0];b.hp=0;caveKill(b);r.hp=0;caveBreak(r);
   caveLeave();closeDialog(true);talkAll();enterCave(3);closeDialog(true);talkAll();run=caveFloorRun();
   check(run.beasts[0].hp<=0&&run.rocks[0].hp<=0&&run.beasts.slice(1).some(x=>x.hp>0),'a caverna guarda o dia: bicho derrubado e pedra quebrada não voltam ao descer de novo');
   G.day++;caveRun=null;run=caveFloorRun();check(run.beasts.every(x=>x.hp>0)&&run.rocks.every(x=>x.hp>0),'no outro dia, o andar volta inteiro');G.day--;caveRun=null;caveLeave();closeDialog(true);talkAll();
   check(CAVE_BEASTS.javali.cash[1]<=4&&CAVE_ORES.ouro.value===40&&BAG_RAW.ametista.value===12,'caverna paga menos moeda e o minério vendido vale menos');}
  {const ids=['gruta','fundo','baudovo','cacador','afiado','salamanca','folclore','saci','dourado','cavaleiro','album'];check(ids.every(id=>ACHIEVEMENTS.some(a=>a.id===id))&&ACHIEVEMENTS.every(a=>{try{a.test();return true;}catch(e){return false;}}),'conquistas novas: caverna, folclore, Saci, dourado, cavalo e álbum');
   const k0=G.cave.killsTotal||0;G.cave.killsTotal=99;check(!G.achievements?.cacador,'caçador ainda não');G.cave.killsTotal=100;checkAchievements();check(!!G.achievements.cacador,'100 bichos derrubados: Caçador de assombração');G.cave.killsTotal=k0;}
  {const xp=G.xp;G.xp=0;check(price('xis_salada')===22&&fameBonus()===1,'nível 1: preço de tabela');
   G.xp=LEVELS[3].xp;check(bodegaLevel()===4&&price('xis_salada')===24.5&&price('cerveja')===9,'fama da bodega: +4% por nível (no nível 4, o xis sai a R$ 24,50)');
   const vi=PEOPLE.findIndex(p=>p.id==='valter'),gi=PEOPLE.findIndex(p=>p.id==='guri');G.xp=0;check(staffWage(gi)===Math.round(STAFF_TRAITS.guri.wage*.6),'salário de ajudante no nível 1: 60%');
   G.xp=LEVELS[4].xp;check(staffWage(gi)===STAFF_TRAITS.guri.wage,'no nível 5, o salário cheio');
   G.staffUnlockedDay=G.day;check(staffWage(vi)===Math.round(STAFF_TRAITS.valter.wage*.5),'o Valter cobra a metade na primeira semana');G.staffUnlockedDay=G.day-7;check(staffWage(vi)===STAFF_TRAITS.valter.wage,'depois, o salário dele');
   G.xp=0;const j1=MAP_EVENTS.javali.reward.cash;G.xp=LEVELS[2].xp;check(j1===90&&MAP_EVENTS.javali.reward.cash===110,'eventos do mapa pagam 10% a mais por nível');
   check(LEVELS.at(-1).xp===5600&&MISSIONS.find(m=>m.id==='lendaria').reward.cash===1000&&MISSIONS.find(m=>m.id==='gaita').reward.cash===250,'níveis mais perto e capítulos que pagam');G.xp=xp;}
  {worldOut=null;goInside();G.phase='open';G.openedDay=G.day;G.elapsed=DAY;G.shop=[];G.groups=[];G.stats=stats(G.cash);G.stats.served=12;finishDay(true);while(scene)sceneSkip();check(G.report.xp>=12,'o dia dá 1 XP por freguês atendido, além do lucro');closeDialog(true);G.tvAwardPending=false;closeDialog(true);G.phase='prep';G.report=null;}
  // ---------- a missão do São Dunstano e o chefe do andar 20: a Salamanca do Jarau ----------
  {goInside();G.phase='prep';G.report=null;goOutside();switchMap({map:'serra',x:CAVE.door.x,y:CAVE.door.y+160});closeDialog(true);
   const st=caveState();st.facao=true;st.dunstanTaught=true;st.deepest=9;for(const k of ['enchanted','salamanca','salamancaFled','jarauMet','jarauCalled'])delete st[k];delete G.missions.jarau;
   G.cave.salamanca=3;missionsTick();check(!G.cave.salamanca,'save da versão sem missão: a vitória antiga não conta');
   check(!missionForGiver('dunstano'),'antes do andar 10, o santo não tem a missão');
   enterCave(SALAMANCA_FLOOR);closeDialog(true);talkAll();let run=caveFloorRun();
   check(run.sleeping&&!salamancaBoss(run)&&!run.ladder.shown&&run.rocks.length===4,'sem a missão do santo, o Diabo dorme no salão e a escada não aparece');
   caveLeave();closeDialog(true);talkAll();goOutside();switchMap({map:'serra',x:CAVE.door.x,y:CAVE.door.y+160});closeDialog(true);
   st.deepest=12;enterCave(1);closeDialog(true);talkAll();const sb=showBanner,seenB=[];showBanner=(t,...r)=>{seenB.push(t);return sb(t,...r);};try{caveTick(.02);}finally{showBanner=sb;}check(st.jarauCalled===G.day&&seenB.some(t=>/São Dunstano/.test(t)),'desceu fundo: o santo chama o Sadi na ferraria');
   switchMap({map:'caverna',x:600,y:780});closeDialog(true);dunstanTalk();check(modal==='talk'&&talkState?.lines.some(l=>/Salamanca do Jarau/.test(l[1])),'o São Dunstano conta a lenda e oferece a missão');
   talkAll();check(jarauActive()&&/opalas/.test(jarauGoal()),'missão aceita: primeiro, opala e ouro pro encantamento');
   const op=bagQty('opala'),ou=bagQty('ouro');bagTake('opala',op);bagTake('ouro',ou);dunstanTab='loja';dunstanShop();
   check($('dialogContent').querySelector('[data-act="forjaEncantar"]')?.disabled,'na ferraria, o encantamento espera o minério');closeDialog(true);
   // sem o encantamento, o Diabo cospe o Sadi de volta pro refúgio
   withScenes(()=>{enterCave(SALAMANCA_FLOOR);check(scene?.id==='salamanca-sem-encanto','sem o encantamento: cena do Diabo rindo do facão');while(scene)sceneSkip();});
   check(caveState().floor===1&&modal==='talk'&&talkState?.lines.some(l=>/cuspiu/.test(l[1])),'e o santo recebe o Sadi de volta no refúgio');talkAll();
   bagAdd('opala',3);bagAdd('ouro',2);const cash=G.cash;dunstanShop();action('forjaEncantar');check(caveEnchanted()&&G.cash===cash&&bagQty('opala')===0&&bagQty('ouro')===0&&modal==='talk','opala e ouro: o santo encanta o facão (sem cobrar)');talkAll();closeDialog(true);
   dunstanShop();check(/Facão encantado/.test($('dialogContent').innerHTML)&&!$('dialogContent').querySelector('[data-act="forjaEncantar"]'),'na ferraria, o facão aparece encantado');closeDialog(true);
   check(/andar 20/.test(jarauGoal()),'depois: descer até o andar 20');
   // chegada no salão: cena com o Diabo e a Teiniaguá
   caveLeave();closeDialog(true);talkAll();goOutside();switchMap({map:'serra',x:CAVE.door.x,y:CAVE.door.y+160});closeDialog(true);st.deepest=20;
   withScenes(()=>{enterCave(SALAMANCA_FLOOR);check(scene?.id==='salamanca-chegada'&&scene.steps.some(x=>x.say==='diabo')&&scene.steps.some(x=>x.say==='teiniagua')&&scene.steps.some(x=>x.say==='sadi'),'chegou no andar 20: cena entre o Sadi e o Diabo Vermelho');while(scene)sceneSkip();});
   check(modal==='talk'&&/Como vencer/.test($('dialogContent').innerHTML),'depois da cena, a dica da luta');talkAll();
   run=caveFloorRun();let b=salamancaBoss(run),p=worldOut;p.dx=1;p.dy=0;check(b&&b.hp===b.max&&st.jarauMet===G.day,'a luta começa');
   caveUpdateControls();check(!$('caveLassoButton').classList.contains('hidden'),'botão do laço na tela, só com o Diabo');
   check(CAVE_BEASTS.diabo.from>20,'o Diabo não aparece nos outros andares');
   delete st.enchanted;check(caveHitDmg(b)===1,'sem encantamento, o facão mal arranha o Diabo');st.enchanted=G.day;
   b.x=p.x+90;b.y=p.y;run.cd=0;run.dash=null;let h=b.hp;caveAttack();check(h-b.hp===Math.round(caveDmg()*DIABO.hide),'encantado, o facão fere o Diabo (fora do laço, o couro de brasa aguenta metade)');
   // laço: inteiro ele arrebenta; tonto, fica preso
   b.x=p.x+250;b.y=p.y;run.lassoCd=0;document.dispatchEvent(new KeyboardEvent('keydown',{key:'q',bubbles:true}));check(!(b.stun>0)&&run.rope?.snap&&run.lassoCd>0,'Q no Diabo inteiro: ele arrebenta o laço');
   const pil=caveCenter(6,9);run.freeze=0;Object.assign(b,{x:pil.x-400,y:pil.y,state:'windup',t:0,vx:1,vy:0});p.x=pil.x-140;p.y=pil.y+220;for(let i=0;i<20&&b.state!=='dazed';i++)caveTick(.05);
   check(b.state==='dazed'&&run.fires.length>0&&run.fires.every(f=>Math.hypot(f.x-b.x,f.y-b.y)>160),'a investida bate no pilar: Diabo tonto, e o tranco apaga o fogo perto dele');
   run.lassoCd=0;salamancaLasso();check(b.stun===DIABO.hold&&run.rope&&!run.rope.snap,'tonto, o laço segura ele');
   p.x=b.x-90;p.y=b.y;run.cd=0;run.freeze=0;h=b.hp;caveAttack();check(h-b.hp===Math.round(caveDmg()*DIABO.bonus),'laçado, ele apanha mais');
   b.stun=0;caveBag().boleadeira=1;caveUse('boleadeira');check(!(b.stun>0),'a boleadeira não segura o Diabo: só o laço');
   // coice de fogo, investida, brasas e reforço
   run.freeze=0;Object.assign(b,{state:'idle',t:9,stompCd:0,summon:99});b.x=p.x+100;b.y=p.y;caveTick(.02);check(b.state==='stomp','muito perto: ele prepara o coice de fogo');
   run.inv=0;st.hp=caveMaxHp();for(let i=0;i<16;i++)caveTick(.05);check(st.hp<caveMaxHp()&&b.state==='idle','o coice acerta quem fica perto');st.hp=caveMaxHp();
   b.x=p.x+300;b.y=p.y-60;Object.assign(b,{state:'idle',t:0,stompCd:9});Math.random=()=>.1;caveTick(.02);check(b.state==='windup','ele se prepara pra investida');
   b.state='idle';b.t=0;Math.random=()=>.9;run.brasas=[];caveTick(.02);check(run.brasas.length>=3,'chuva de brasas: alvos vermelhos no chão');
   run.inv=0;const sh=st.hp;b.x=p.x+600;b.state='dazed';b.t=99;run.fires=[];for(let i=0;i<30;i++){run.inv=0;caveTick(.05);}check(run.brasas.length===0&&st.hp<sh,'a brasa que cai em cima do Sadi machuca');st.hp=caveMaxHp();
   b.state='idle';b.t=0;b.summon=0;Math.random=()=>.3;caveTick(.02);check(run.beasts.some(x=>x.minion),'o Diabo chama reforço');for(const m of run.beasts)if(m.minion)m.hp=0;Math.random=randomBefore;
   // metade da vida: a Teiniaguá tenta o Sadi
   run.freeze=0;b.state='idle';b.t=9;b.hp=Math.floor(b.max*.5)-1;caveTick(.02);check(modal==='salamanca'&&$('dialogContent').querySelectorAll('[data-act="salamancaEscolha"]').length===3,'na metade da vida, a Teiniaguá oferece ouro, poder ou nada');
   const hp2=b.hp;st.hp=50;action('salamancaEscolha','nada');check(run.courage&&b.hp===hp2&&st.hp===80&&!modal,'recusou: coragem de gaúcho, o Diabo não se cura');
   b.stun=0;b.state='idle';run.cd=0;run.freeze=0;b.x=p.x+90;b.y=p.y;h=b.hp;caveAttack();check(h-b.hp===Math.round(Math.round(caveDmg()*DIABO.hide)*1.25),'coragem: +25% de dano');
   b.x=p.x+600;b.y=p.y;run.torch=false;let lit=0;{const P=CanvasRenderingContext2D.prototype,di=P.drawImage;P.drawImage=function(...a){lit++;return di.apply(this,a);};try{drawDiabo(b);}finally{P.drawImage=di;}}check(lit===0,'fase escura: de longe, só os olhos do Diabo');
   // vida baixa: a fuga pela fenda
   run.freeze=0;b.hp=Math.floor(b.max*.1);b.state='idle';caveTick(.02);check(b.state==='flee','vida baixa: ele corre pra fenda');
   const c=caveCenter(...SALAMANCA_CELL.crack);b.x=c.x-120;b.y=c.y;p.x=b.x-150;p.y=b.y+40;b.stun=0;run.lassoCd=0;salamancaLasso();const bx=b.x;for(let i=0;i<20;i++)caveTick(.05);check(b.x===bx&&b.hp>0,'fugindo, o laço segura: ele não foge');
   b.stun=0;for(let i=0;i<80&&salamancaBoss(run);i++)caveTick(.05);check(!salamancaBoss(run)&&st.salamancaFled===G.day&&modal==='talk','sem laço, ele foge pela fenda e só volta amanhã');talkAll();
   caveRun=null;run=caveFloorRun();check(run.fled&&!salamancaBoss(run)&&!run.ladder.shown&&/fugiu/.test(jarauGoal()),'no mesmo dia o salão fica vazio');
   G.day++;caveRun=null;run=caveFloorRun();b=salamancaBoss(run);check(b&&b.hp===b.max,'no outro dia ele volta com a vida cheia');
   // vitória: cena com a Teiniaguá livre e o São Dunstano
   const xp=G.xp,c2=G.cash;p=worldOut;b.x=p.x+90;b.y=p.y;b.hp=1;run.cd=0;run.freeze=0;p.dx=1;p.dy=0;
   withScenes(()=>{caveAttack();check(scene?.id==='salamanca-vitoria'&&scene.steps.some(x=>x.say==='dunstano')&&scene.steps.some(x=>x.actor==='dunstano'),'derrubou o Diabo: cena de vitória com o São Dunstano');while(scene)sceneSkip();});
   check(missionDone('jarau')&&st.salamanca===G.day&&run.ladder.shown&&modal==='talk'&&G.xp>xp&&G.cash>=c2+500,'missão concluída: Teiniaguá livre, escada aberta e recompensa');talkAll();
   checkAchievements();check(!!G.achievements.jarau,'conquista: A Salamanca do Jarau');
   caveRun=null;st.floor=5;run=caveFloorRun();check(run.torch,'a luz do carbúnculo clareia os outros andares');st.floor=20;caveRun=null;run=caveFloorRun();check(!salamancaBoss(run)&&!run.sleeping&&run.ladder.shown,'o salão fica livre, com a escada à vista');
   G.day--;caveLeave();closeDialog(true);talkAll();goInside();}
  // ---------- a lição da torrada vem no mesmo dia em que o salame é liberado ----------
  {goInside();Object.assign(G,{phase:'open',openedDay:G.day,elapsed:60,groups:[],shop:[],toastLesson:null});G.up.salame=false;goOutside();unlockGood('salame');
   check(G.toastLesson?.day===G.day,'liberou o salame: a lição da torrada é pro mesmo dia');simulate(.05);check(!G.toastLesson.actor&&modal!=='toastLesson','na rua, a lição espera o Sadi voltar pra bodega');
   goInside();closeDialog(true);simulate(.05);check(G.toastLesson.actor&&modal==='toastLesson','dentro da bodega aberta, a lição da torrada vem na hora');closeDialog(true);G.toastLesson.done=true;G.groups=[];G.phase='prep';}
  // ---------- a Mãe do Ouro: a bola de fogo das noites da Serra ----------
  {goInside();G.phase='closed';G.report=null;goOutside();delete G.maeOuro;maeOuroKey='';maeOuro=null;
   const M=WORLD_MAPS.serra;let nights=0,firstDay=0,walk=true;
   for(let d=300;d<400;d++){G.day=d;switchMap({map:'serra',x:CAVE.door.x,y:CAVE.door.y+160});closeDialog(true);maeOuroKey='';maeOuroTick(.01);if(maeOuro){nights++;walk=walk&&M.canWalk(maeOuro.x,maeOuro.y);if(!firstDay)firstDay=d;}}
   check(nights>20&&nights<60&&walk,'a Mãe do Ouro aparece em algumas noites da Serra, nunca em todas, sempre no campo');
   G.day=firstDay;maeOuroKey='';maeOuroTick(.01);let b=maeOuro;const p=worldOut;check(b&&b.state==='roam'&&Math.hypot(b.x-p.x,b.y-p.y)>500,'de longe, ela ronda o campo');
   G.phase='prep';check(!maeOuroHere(),'de dia, nada de bola de fogo');G.phase='closed';
   p.x=b.x+300;p.y=b.y;$('floatNotes').innerHTML='';maeOuroTick(.05);check(b.state==='lure'&&/Mãe do Ouro/.test($('floatNotes').textContent),'chegou perto: ela foge na frente, e o Sadi descobre que é a Mãe do Ouro');
   let closest=1e9;for(let i=0;i<200&&b.state==='lure';i++){const d=Math.hypot(b.x-p.x,b.y-p.y)||1;if(d>250){p.x+=(b.x-p.x)/d*13;p.y+=(b.y-p.y)/d*13;}closest=Math.min(closest,d);maeOuroTick(.05);}
   check(b.state==='sink'&&closest>60,'seguida de perto uns segundos (sem deixar alcançar), ela afunda na terra');
   for(let i=0;i<40&&b.state==='sink';i++)maeOuroTick(.05);check(b.state==='glow'&&M.canWalk(b.x,b.y),'onde ela sumiu fica um brilho no chão, num lugar onde dá pra pisar');
   p.x=b.x+30;p.y=b.y;check(worldNearest()?.id==='maeouro'&&/Cavar/.test(worldNearest().label),'E no brilho: cavar');
   const c0=G.cash;Math.random=()=>.9;try{interact();}finally{Math.random=randomBefore;}check(G.cash>c0&&modal==='talk'&&!maeOuro&&G.maeOuro.day===G.day,'cavou: moedas enterradas');talkAll();
   maeOuroKey='';maeOuroTick(.01);check(!maeOuro,'uma por noite');
   checkAchievements();check(!!G.achievements.maedoouro,'conquista: Seguiu a Mãe do Ouro');
   // perder de vista: ela volta a rondar
   G.day++;const forced=maeOuroForced;maeOuroForced=()=>true;maeOuroKey='';maeOuroTick(.01);b=maeOuro;p.x=b.x+300;p.y=b.y;maeOuroTick(.05);check(b.state==='lure','outra noite, outra bola de fogo');
   p.x=b.x+1500>M.W?b.x-1500:b.x+1500;for(let i=0;i<130&&b.state==='lure';i++)maeOuroTick(.05);check(b.state==='roam','perdeu de vista: ela volta a rondar o campo');
   // os outros prêmios: figurinha e minério
   const prize=k=>{Math.random=()=>k;try{return maeOuroPrize();}finally{Math.random=randomBefore;}};
   const ore=prize(.4);check(ore.kind==='ore'&&BAG_RAW[ore.id]&&ore.n>0,'ou minério da caverna (ouro, opala…)');
   const cardP=prize(.1);check(cardP.kind==='card'&&looseCards().some(c=>c.id===cardP.id)&&!hasCard(cardP.id),'ou uma figurinha nova do álbum');
   Object.assign(b,{state:'glow',x:p.x,y:p.y});Math.random=()=>.1;let got=null;try{const before=new Set(Object.keys(G.cards||{}));maeOuroDig();got=Object.keys(G.cards||{}).find(k=>!before.has(k));}finally{Math.random=randomBefore;}
   check(got&&modal==='talk','cavou: uma figurinha embrulhada num pano');talkAll();closeDialog(true);maeOuroForced=forced;G.phase='prep';goInside();}
  // ---------- cobrar o fiado na rua ----------
  {goInside();Object.assign(G,{phase:'prep',shop:[],groups:[]});goOutside();const cuscoBefore=G.cusco;G.cusco=null;
   const [i,j]=minorPeople();G.fiado=[];G.friends[i]=0;
   G.fiado.push({id:9001,person:i,amount:30,day:G.day-3,due:G.day-1,status:'open',charged:0});
   worldWalkersKey='';walkersTick(0);let w=worldWalkers.find(x=>x.person===i);check(w,'quem deve anda pela Fronteira');
   let s=walkerSpots().find(x=>x.id==='walker:'+i);check(/Cobrar o fiado/.test(s.label)&&s.label.includes(money(30)),'o E vira “Cobrar o fiado”, com o valor');
   const c0=G.cash;Math.random=()=>0;try{s.act();}finally{Math.random=randomBefore;}check(G.cash===c0+30&&G.fiado[0].status==='paid'&&worldTalkOpen(),'cara a cara: pagou na hora');skipWorldTalk();
   G.fiado.push({id:9002,person:i,amount:20,day:G.day-3,due:G.day,status:'open',charged:0});const e2=G.fiado.at(-1);
   s=walkerSpots().find(x=>x.id==='walker:'+i);Math.random=()=>.999;try{s.act();}finally{Math.random=randomBefore;}
   check(e2.status==='open'&&e2.due>=G.day+3&&!/Cobrar/.test(walkerSpots().find(x=>x.id==='walker:'+i).label),'pediu prazo: conta adiada, e só se cobra de novo outro dia');skipWorldTalk();
   G.fiado.push({id:9003,person:j,amount:25,day:G.day-6,due:G.day-4,status:'open',charged:0});const e3=G.fiado.at(-1);
   worldWalkersKey='';walkersTick(0);w=worldWalkers.find(x=>x.person===j);check(w,'outro devedor na rua');
   const o=fiadoRuaOdds(e3);Math.random=()=>o.pay+o.run/2;try{walkerSpots().find(x=>x.id==='walker:'+j).act();}finally{Math.random=randomBefore;}
   check(e3.status==='open'&&e3.hideUntil===G.day+2&&w.flee,'atrasado: inventou desculpa e saiu correndo');skipWorldTalk();
   for(let k=0;k<80;k++)walkersTick(.05);check(!worldWalkers.includes(w),'o fujão some do mapa');
   worldWalkersKey='';walkersTick(0);check(!worldWalkers.some(x=>x.person===j&&x.kind==='debtor'),'e não aparece por uns dias');
   e3.hideUntil=0;e3.charged=0;G.cusco={day:1,mode:'follow'};worldWalkersKey='';walkersTick(0);w=worldWalkers.find(x=>x.person===j);
   const c1=G.cash;Math.random=()=>o.pay+o.run/2;try{walkerSpots().find(x=>x.id==='walker:'+j).act();}finally{Math.random=randomBefore;}
   check(e3.status==='paid'&&G.cash===c1+25&&!w.flee,'com o cusco junto, o fujão é cercado e paga de vergonha');skipWorldTalk();
   G.cusco=cuscoBefore;G.fiado=[];goInside();}
  // ---------- torneio de pesca no trapiche ----------
  {goInside();G.regions={serra:true,sc:true};const day0=G.day;let d=G.day;for(;d<G.day+300;d++)if(mapEventFor(d)==='pesca')break;
   check(mapEventFor(d)==='pesca','o torneio de pesca entra no calendário');
   G.day=d;G.mapEv=null;G.fish=null;Object.assign(G,{phase:'prep',elapsed:0});const st=torneioToday();st.intro=true;
   check(torneioOn()&&fishLeft()===FISH_PER_DAY+TORNEIO.extra,'no dia do torneio, lances a mais no trapiche');
   check(torneioRivals().length===3&&!torneioLeader(),'de manhã, ninguém pescou ainda');
   G.phase='open';G.elapsed=DAY*.5;const lead=torneioLeader();check(lead&&lead.who!=='sadi'&&lead.kg<=3,'de tarde os rivais vão marcando peixe');
   fishing={phase:'fight',kind:'traira',t:0};Math.random=()=>.999;try{fishEnd(true,'',true);}finally{Math.random=randomBefore;fishing=null;}
   check(st.best>3&&torneioLeader().who==='sadi','uma traíra das grandes: o Sadi passa na frente');
   goOutside();switchMap({map:'vila',x:900,y:900});closeDialog(true);const ps=WORLD_MAPS.vila.spots().find(x=>x.id==='torneio:peixinho');check(ps&&/placar/.test(ps.label),'no trapiche, o Peixinho mostra o placar');
   ps.act();check(worldTalkOpen()&&/Sadi/.test($('worldTalkReply').textContent+$('worldTalkUI').textContent),'placar com o Sadi');skipWorldTalk();goInside();
   G.elapsed=DAY*.8;mapEventsTick();check(st.ended&&st.winner==='sadi'&&!torneioOn(),'escureceu: o placar fecha com o Sadi na frente');
   G.phase='closed';closeDialog(true);
   withScenes(()=>{mapEventsTick();check(scene?.id==='torneio-pesca'&&scene.steps.some(x=>x.say==='peixinhonabrasa'),'de noite: peixinho na brasa na casa do Peixinho');while(scene)sceneSkip();});
   check(modal==='talk'&&G.trophies?.pesca&&st.done,'campeão: prêmio e troféu');const cardAsk=talkState?.then;talkAll();closeDialog(true);
   check(lembrancas().includes('pesca')&&(hasCard('peixinhonabrasa')||cardAsk),'troféu de pesca na estante de casa e figurinha no álbum');
   // perdeu: prêmio de participação
   G.mapEv=null;delete G.trophies.pesca;const st2=torneioToday();st2.intro=true;Object.assign(G,{phase:'open',elapsed:DAY*.3});
   fishing={phase:'fight',kind:'jundia',t:0};Math.random=()=>0;try{fishEnd(true,'',true);}finally{Math.random=randomBefore;fishing=null;}
   G.elapsed=DAY*.8;mapEventsTick();const c2=G.cash;G.phase='closed';mapEventsTick();
   check(st2.done&&st2.winner!=='sadi'&&G.cash>c2&&!G.trophies.pesca,'perdeu: prêmio de participação, sem troféu');
   G.day=day0;G.mapEv=null;G.phase='prep';G.elapsed=0;}
  // ---------- o sonho do Sadi não trava ----------
  {worldOut=null;const seen=[],P=CanvasRenderingContext2D.prototype,di=P.drawImage;P.drawImage=function(...a){seen.push(this.filter);return di.apply(this,a);};try{drawSceneSonho();}finally{P.drawImage=di;}
   check(seen.length>20&&!seen.some(f=>/sepia/.test(f)),'o sonho do Sadi pinta o sépia por cima do quadro, sem filtro em cada desenho');}
  // ---------- quero-queros no mundo aberto ----------
  {goInside();G.phase='prep';G.report=null;goOutside();const count={vila:0,serra:0,sc:0};let day=0,open=true;
   for(const map of Object.keys(count))for(let d=200;d<300;d++){G.day=d;switchMap({map,x:1500,y:900});closeDialog(true);const b=qqBirds();if(b.length){count[map]++;open=open&&b.every(q=>WORLD_MAPS[map].canWalk(q.x,q.y));if(map==='vila'&&!day)day=d;}}
   check(count.vila>15&&count.vila<60&&count.serra<count.vila&&count.sc<count.serra&&open,'quero-queros pelo mapa, mas não todo dia (mais na Fronteira, menos na Serra e em SC), sempre no campo');
   check(QQ_SCALE<1,'no mundo aberto o quero-quero é menor que na laçada');
   G.day=day;switchMap({map:'vila',x:1500,y:900});closeDialog(true);const b=qqBirds()[0];b.aggr=1;const sx=b.x+150,sy=b.y+10;worldOut.x=sx;worldOut.y=sy;Math.random=()=>.5;
   for(let i=0;i<4;i++)simulate(.05);check(b.state==='warn'&&b.tx===sx,'chegou perto: ele grita e marca o rasante');
   for(let i=0;i<60&&b.state!=='fly';i++)simulate(.03);check(b.state==='fly'&&Math.hypot(worldOut.x-sx,worldOut.y-sy)>5,'o rasante empurra o Sadi e o quero-quero pousa mais adiante');Math.random=randomBefore;
   G.up.bodoque=true;b.state='ground';b.calm=99;worldOut.x=b.x+200;worldOut.y=b.y;$('floatNotes').innerHTML='';qqSlingNote=0;slingStart();document.dispatchEvent(new KeyboardEvent('keydown',{key:'f'}));
   check(!slingActive()&&!sling.aim&&/só sai na laçada/.test($('floatNotes').textContent),'no mundo aberto o bodoque não funciona: só na laçada');goInside();}
 }finally{window.confirm=confirmBefore;window.NO_SCENES=scenesBefore;Math.random=randomBefore;if(phoneOpen)togglePhone(false);if(farmGame)cancelFarmGame();scene=null;fishing=null;G.lasso=null;$('lassoUI')?.classList.add('hidden');closeDialog(true);worldOut=null;}
 return results;
})()
