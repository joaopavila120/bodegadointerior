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
  G.missions={};for(const m of storyChapters())if(m.chapter<14)G.missions[m.id]={status:'done',day:1};
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
   delete G.missions.sino;startChapter(MISSIONS.find(m=>m.id==='sino'));check(MISSIONS.find(m=>m.id==='sino').chapter===6&&modal==='talk'&&/sino/.test(JSON.stringify(talkState?.lines||'')),'capítulo 6, Padre Romio: o sino da capela rachou');talkAll();check(missionActive('sino'),'cobre e ferro pro São Dunstano');
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
  // ---------- torneio de pesca: o primeiro é missão do Peixinho, depois vira evento do calendário ----------
  {goInside();G.regions={serra:true,sc:true};const day0=G.day;delete G.missions.torneio;
   const calDay=()=>{for(let d=G.day;d<G.day+200;d++)if(mapEventFor(d)==='pesca')return d;return 0;};
   check(!calDay(),'antes da missão, o torneio não está no calendário');
   const pi=PEOPLE.findIndex(p=>p.id==='peixinhonabrasa');G.missions.peixinho={status:'done',day:1};G.metOutside??={};G.metOutside.peixinhonabrasa=1;
   check(missionForGiver('peixinhonabrasa')?.id==='torneio','depois do dourado, o Peixinho tem a missão do torneio');
   specialWorldStory(pi);check(modal==='talk'&&talkState?.lines.some(l=>/torneio de pesca/.test(l[1])),'visitando o Peixinho, ele convida pro torneio');talkAll();
   const ms=G.missions.torneio;check(missionActive('torneio')&&ms.on>G.day&&mapEventFor(ms.on)==='pesca'&&/trapiche/.test(MISSIONS.find(m=>m.id==='torneio').goal()),'missão aceita: o torneio fica marcado pro próximo dia livre do calendário');
   const first=ms.on;G.day=first+1;G.mapEv=null;mapEventsTick();check(ms.on>first&&mapEventFor(ms.on)==='pesca','perdeu o dia: o Peixinho remarca o torneio');
   G.day=ms.on;G.mapEv=null;G.fish=null;Object.assign(G,{phase:'prep',elapsed:0});mapEventsTick();const st=torneioToday();
   check(st&&st.intro&&!MAP_EVENTS.pesca.tracker(),'no dia, o convite já valeu: sem cena na bodega, e o placar vem pelo cartão da missão');
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
   check(modal==='talk'&&G.trophies?.pesca&&st.done&&missionDone('torneio')&&talkState?.lines.some(l=>/calendário/.test(l[1])),'campeão: prêmio, troféu e a missão concluída (o torneio vai pro calendário)');const cardAsk=talkState?.then;talkAll();closeDialog(true);
   check(lembrancas().includes('pesca')&&(hasCard('peixinhonabrasa')||cardAsk),'troféu de pesca na estante de casa e figurinha no álbum');
   G.day++;const next=calDay();check(next>G.day-1&&dayNumber(next)%21===31%21,'depois do primeiro, o torneio é evento do calendário a cada três semanas');
   // num torneio do calendário, perdeu: prêmio de participação
   G.day=next;G.mapEv=null;delete G.trophies.pesca;const st2=torneioToday();st2.intro=true;Object.assign(G,{phase:'open',elapsed:DAY*.3});
   fishing={phase:'fight',kind:'jundia',t:0};Math.random=()=>0;try{fishEnd(true,'',true);}finally{Math.random=randomBefore;fishing=null;}
   G.elapsed=DAY*.8;mapEventsTick();const c2=G.cash;G.phase='closed';mapEventsTick();
   check(st2.done&&st2.winner!=='sadi'&&G.cash>c2&&!G.trophies.pesca,'perdeu: prêmio de participação, sem troféu');talkAll();closeDialog(true);
   G.day=day0;G.mapEv=null;G.phase='prep';G.elapsed=0;}
  // ---------- Mata de Araucárias: o mapa novo à direita da Serra ----------
  {goInside();G.phase='prep';G.report=null;goOutside();const M=WORLD_MAPS.mata,S=WORLD_MAPS.serra;
   check(M&&M.name==='Mata de Araucárias'&&REGION_NAMES.mata,'mapa novo: Mata de Araucárias');
   const into=S.edge({x:SERRA.W-1,y:SERRA.roadY+SERRA.roadH/2});check(into?.map==='mata'&&M.canWalk(into.x,into.y),'seguindo a estrada da Serra até o fim, entra na mata');
   check(!S.edge({x:SERRA.W-1,y:SERRA.roadY+600})||S.edge({x:SERRA.W-1,y:SERRA.roadY+600})?.map!=='mata','só pela estrada (não por qualquer ponto da borda)');
   const back=M.edge({x:5,y:MATA.entryY});check(back?.map==='serra'&&S.canWalk(back.x,back.y),'pela picada da esquerda, volta pra Serra');
   check(M.canWalk(M.spawn().x,M.spawn().y)&&!M.canWalk(20,MATA.entryY+300),'a borda esquerda só abre na picada');
   const midY=MATA.poolY-400;check(!M.canWalk(mataRiverX(midY),midY),'o arroio corta o mapa: não dá pra andar na água');
   check(M.canWalk(mataRiverX(MATA.bridgeY),MATA.bridgeY)&&M.canWalk(mataRiverX(MATA.stonesY),MATA.stonesY),'atravessa pela ponte e pelas pedras');
   const t=mataPlants().trees.find(x=>!x.big);check(t&&!M.canWalk(t.x,t.y)&&mataPlants().trees.length>200,'pinheiral fechado: o tronco das araucárias segura o passo');
   check(mataPlants().trees.every(x=>x.big||mataTrailDist(x.x,x.y-x.h*.7)>0),'as copas não tapam as picadas');
   // dá pra chegar em todas as clareiras e nos dois lados do arroio
   const st=30,seen=new Set(),key=(x,y)=>Math.round(x/st)+':'+Math.round(y/st),q=[[M.spawn().x,M.spawn().y]];seen.add(key(...q[0]));
   while(q.length){const [x,y]=q.pop();for(const [dx,dy] of [[st,0],[-st,0],[0,st],[0,-st]]){const nx=x+dx,ny=y+dy,k=key(nx,ny);if(seen.has(k)||!M.canWalk(nx,ny))continue;seen.add(k);q.push([nx,ny]);}}
   const reach=(x,y)=>[0,30,60,90].some(r=>[[0,0],[r,0],[-r,0],[0,r],[0,-r]].some(([dx,dy])=>seen.has(key(x+dx,y+dy))));
   check(MATA.clearings.every(c=>reach(c.x,c.y))&&reach(mataRiverX(MATA.bridgeY)+150,MATA.bridgeY)&&reach(MATA.big.x-60,MATA.big.y+70),'dá pra chegar em todas as clareiras, nos dois lados do arroio');
   check(M.spots().filter(s=>s.info).length===3&&M.spots().filter(s=>s.info).every(s=>s.text&&reach(s.x,s.y)),'placas de informação na trilha');
   switchMap({map:'mata',...M.spawn()});closeDialog(true);drawOutside();check(worldOut.map==='mata','a mata desenha sem erro');goInside();}
  // ---------- o pinheiral do Garibaldi (trecho 1): a cena de chegada, a gralha, quatis e tatus; sempre manso ----------
  {goInside();G.phase='prep';G.report=null;goOutside();delete G.mataSeen;delete G.mataGralha;delete G.mata;delete G.missions.fantasma;const M=WORLD_MAPS.mata,facaoBefore=caveState().facao,pausedBefore=paused;caveState().facao=true;
   check(mataTrails().some(t=>t.id==='leste')&&M.canWalk(MATA.W-60,770),'ao lado da centenária, a picada do leste vai até a borda direita');
   check(!WORLD_MAPS.serra.edge({x:SERRA.W-1,y:SERRA.roadY+45}),'antes do causo do Olmiro, a estrada da Serra termina num pinheiral fechado');
   // capítulo 2, logo depois do trago de pura: de noite, na rua, o Olmiro chega a cavalo (como num jogo novo: só o trago feito)
   const mis0=G.missions;G.missions={trago:{status:'done',day:1}};G.phase='closed';paused=false;switchMap({map:'vila',x:1200,y:1300});closeDialog(true);
   withScenes(()=>{missionsTick();check(scene?.id==='olmiro-fantasma'&&scene.steps.some(s=>s.say==='olmiro'&&/camisa vermelha/.test(s.text)),'depois do trago de pura, de noite na rua: o Olmiro conta do fantasma de camisa vermelha');while(scene)sceneSkip();});
   check(missionActive('fantasma')&&MISSIONS.find(m=>m.id==='fantasma').chapter===2&&modal==='talk'&&/Capítulo 2/.test($('dialogContent').innerHTML),'vira o capítulo 2 da história');talkAll();
   G.phase='prep';G.elapsed=0;paused=pausedBefore;
   check(WORLD_MAPS.serra.edge({x:SERRA.W-1,y:SERRA.roadY+45})?.map==='mata','e a Mata de Araucárias abre no fim da estrada da Serra');
   check(!MISSIONS.find(m=>m.id==='lendaria').when(),'a Bodega lendária espera a Batalha de Laguna');
   withScenes(()=>{switchMap({map:'mata',...M.spawn()});check(scene?.id==='mata-garibaldi'&&scene.steps.some(s=>s.say==='garibaldi'&&/farrapos/.test(s.text))&&scene.steps.some(s=>s.say==='garibaldi'&&/Laguna/.test(s.text))&&sceneSpeaker('garibaldi').name==='Giuseppe Garibaldi','primeira vez na mata: a cena de chegada com o Garibaldi, que conta da descida até a barra de Laguna');while(scene)sceneSkip();});
   check(G.mataSeen===G.day&&G.mata.metGaribaldi&&hasCard('garibaldi')&&modal==='talk'&&talkState?.lines.some(l=>/Pinheiral/.test(l[1])&&/Restinga/.test(l[1])&&/sempre escuro/.test(l[1])),'depois da cena: a figurinha do Garibaldi e a dica das três regiões, sempre escuras');talkAll();
   check(worldOut.map==='mata'&&Math.hypot(worldOut.x-garibaldiFront().x,worldOut.y-garibaldiFront().y)<5,'e o Sadi fica na frente do refúgio');
   withScenes(()=>{missionsTick();});check(missionDone('fantasma')&&!missionState('laguna'),'chegou na mata e achou o Garibaldi: capítulo 2 concluído');talkAll();
   garibaldiTalk();check(modal==='talk'&&talkState.lines.some(l=>/Olmiro/.test(l[1]))&&talkState.lines.some(l=>/Mariath/.test(l[1]))&&!talkState.lines.some(l=>/Itália|Nice/.test(l[1])),'na segunda prosa, o Garibaldi conta a história dele');talkAll();
   check(G.mata.historia&&missionActive('laguna')&&MISSIONS.find(m=>m.id==='laguna').side&&/Laguna/.test(MISSIONS.find(m=>m.id==='laguna').goal()),'e começa a missão secundária: descer até a barra de Laguna');
   G.missions={...mis0,fantasma:G.missions.fantasma,laguna:G.missions.laguna};
   switchMap({map:'serra',x:SERRA.W-120,y:SERRA.roadY+45});closeDialog(true);withScenes(()=>{switchMap({map:'mata',...M.spawn()});check(!scene,'da segunda vez em diante, sem cena');});closeDialog(true);
   withScenes(()=>{worldOut.x=MATA.big.x-200;worldOut.y=MATA.big.y+200;outsideTick(.02);check(scene?.id==='mata-gralha'&&scene.steps.some(s=>s.say==='gralha'&&/esqueço/.test(s.text))&&scene.steps.some(s=>s.walk==='gralha'),'perto da araucária centenária: a gralha-azul conta que planta o pinhão porque esquece');while(scene)sceneSkip();});
   check(G.mataGralha&&sceneSpeaker('gralha').name==='Gralha-azul','a gralha fala com retrato próprio, uma vez só');
   check(/<svg/.test(gralhaPortrait())&&!/data:/.test(gralhaPortrait()),'o retrato da gralha não exporta canvas (aberto pelo arquivo, isso travava a cena)');
   worldOut.x=1300;worldOut.y=1055;mataFauna=null;mataFaunaTick(.01);check(mataFauna.quatis.length===4&&mataFauna.tatus.length>=2&&[...mataFauna.quatis,...mataFauna.tatus].every(a=>M.canWalk(a.x,a.y)),'de dia: um bando de quatis e uns tatus pelo pinheiral');
   const q=mataFauna.quatis[0];worldOut.x=q.x+150;worldOut.y=q.y;mataFaunaTick(.05);check(mataFauna.quatis.every(x=>x.state==='flee'),'chegou perto: os quatis disparam');
   for(let i=0;i<300&&mataFauna.quatis.length;i++)mataFaunaTick(.05);check(!mataFauna.quatis.length,'e sobem na araucária');
   const t=mataFauna.tatus[0];Object.assign(t,{state:'walk',t:2,dig:0,hidden:0});worldOut.x=t.x+100;worldOut.y=t.y;mataFaunaTick(.05);check(t.state==='run','o tatu sai correndo');for(let i=0;i<80&&t.state!=='hidden';i++)mataFaunaTick(.05);check(t.state==='hidden','e se enterra');
   mataCombatTick(.01);check(!mataCombatOn()&&!mataNight,'o pinheiral do Garibaldi é manso de dia');
   G.phase='closed';mataCombatTick(.01);check(!mataCombatOn()&&!mataNight&&WORLD_MAPS.serra.edge({x:SERRA.W-1,y:SERRA.roadY+45})?.map==='mata','e de noite também: nenhum bicho brabo no trecho 1');G.phase='prep';
   caveState().facao=false;check(!M.edge({x:MATA.W-1,y:770}),'sem o facão do vô, não se vai mata adentro');
   caveState().facao=true;check(M.edge({x:MATA.W-1,y:770})?.trecho===2,'com o facão, a picada do leste leva ao trecho 2');
   caveState().facao=facaoBefore;goInside();}
  // ---------- os bichos da mata adentro: jararaca, queixadas, cobra-coral, teiú, ouriço-cacheiro e corpo-seco ----------
  {goInside();Object.assign(G,{phase:'prep',elapsed:0});G.report=null;G.mataSeen=G.mataSeen||1;G.mataGralha=G.mataGralha||1;goOutside();const M=WORLD_MAPS.mata,facaoBefore=caveState().facao;caveState().facao=true;
   switchMap({map:'serra',x:SERRA.W-120,y:SERRA.roadY+45});closeDialog(true);switchMap({map:'mata',...M.spawn()});closeDialog(true);worldOut.x=1300;worldOut.y=1055;
   // papagaios-charão, só no pinheiral do Garibaldi
   mataParrots={next:0,flock:null};mataParrotTick(.01);let f=mataParrots.flock;check(f&&f.birds.length===7&&f.state==='arrive','de dia, um bando de papagaios-charão chega voando');
   for(let i=0;i<200&&f.state==='arrive';i++)mataParrotTick(.05);check(f.state==='perch'&&f.tree.kind===1&&f.birds.every(b=>Math.abs(b.y-mataParrotTop(f.tree))<40&&Math.abs(b.x-f.tree.x)<f.tree.w*.4),'e pousa na copa de uma araucária');
   worldOut.x=f.tree.x+60;worldOut.y=f.tree.y+30;mataParrotTick(.05);check(f.state==='leave','passou embaixo: o bando levanta voo na gritaria');
   for(let i=0;i<200&&mataParrots.flock;i++)mataParrotTick(.05);check(!mataParrots.flock&&mataParrots.next>10,'e some, voltando mais tarde');
   check(typeof mataBugioTick==='undefined'&&typeof drawBugioVulto==='undefined','bugio removido, sem som nem aparições');
   G.phase='closed';mataParrotTick(.05);check(!mataParrots.flock,'de noite, nada de papagaio');G.phase='prep';
   // Cada bicho testado sozinho, numa picada do trecho 3.
   switchMap({map:'trecho',trecho:3,x:90,y:trechoEnds(3).yIn});closeDialog(true);const T=trechoLayout(),st=caveState(),q=T.trails[0].pts[Math.floor(T.trails[0].pts.length*.3)];
   const B=(kind,x,y,o={})=>({kind,x,y,home:{x,y},tx:x,ty:y,hp:CAVE_BEASTS[kind].hp,max:CAVE_BEASTS[kind].hp,dx:1,state:'roam',t:0,vx:0,vy:0,hurt:0,frame:0,cool:0,attack:0,...o});
   const arena=(...beasts)=>{mataNight={day:G.day,key:trechoKey(),trecho:3,beasts,drops:[],herds:[],shots:[],cd:0,inv:0,hurt:0,swing:null};st.hp=caveMaxHp();Object.assign(worldOut,{x:q[0],y:q[1],dx:1,dy:0});mataBuffs.veneno=0;return mataNight;};
   // jararaca: marca o bote e ataca onde o Sadi estava
   const j=B('jararaca',q[0]+100,q[1],{state:'hide'});arena(j);mataJararacaTick(j,.05,worldOut);check(j.state==='warn'&&Math.hypot(j.tx-worldOut.x,j.ty-worldOut.y)<2,'chegou perto: a jararaca marca o bote (alvo vermelho)');
   for(let i=0;i<25&&j.state!=='rest';i++)mataJararacaTick(j,.05,worldOut);check(st.hp<caveMaxHp(),'ficou parado no alvo: levou o bote');
   st.hp=caveMaxHp();mataNight.inv=0;Object.assign(j,{state:'hide',cool:0});mataJararacaTick(j,.05,worldOut);worldOut.x-=180;for(let i=0;i<25&&j.state!=='rest';i++)mataJararacaTick(j,.05,worldOut);check(st.hp===caveMaxHp(),'saiu do alvo a tempo: a jararaca erra');
   worldOut.x=j.x+400;check((()=>{let a=1;const P=CanvasRenderingContext2D.prototype,st0=P.drawImage;P.drawImage=function(...x){a=Math.min(a,this.globalAlpha);return st0.apply(this,x);};try{j.state='hide';drawJararaca(j);}finally{P.drawImage=st0;}return a<.5;})(),'de longe, a jararaca quase some no chão');
   // queixadas: miram juntas e passam em disparada (no chão aberto do trecho 1)
   switchMap({map:'mata',x:1300,y:1055});closeDialog(true);
   const qx=[0,1,2,3,4].map(k=>B('queixada',1040+(k%3-1)*46+(k>2?23:0),1045+(k>2?38:0),{herd:0,ox:(k%3-1)*46+(k>2?23:0),oy:(k>2?38:0)-10}));
   const NQ={day:G.day,beasts:qx,drops:[],herds:[{id:0,tx:1040,ty:1055,state:'roam',t:2,cool:0,vx:1,vy:0}],shots:[],cd:0,inv:0,hurt:0,swing:null},h=NQ.herds[0];mataNight=NQ;st.hp=caveMaxHp();worldOut.x=1300;worldOut.y=1055;
   mataQueixadaTick(NQ,.05,worldOut);check(h.state==='gather'&&h.vx>.9,'chegou perto: o bando mira junto (faixa vermelha)');
   for(let i=0;i<20&&h.state==='gather';i++)mataQueixadaTick(NQ,.05,worldOut);check(h.state==='stampede'&&qx.every(b=>b.state==='lunge'),'e dispara');
   const x0=qx.map(b=>b.x);for(let i=0;i<6;i++)mataQueixadaTick(NQ,.05,worldOut);check(qx.filter((b,k)=>b.x>x0[k]+40).length>=3,'correm todos juntos na mesma direção');
   for(let i=0;i<30&&h.state==='stampede';i++){NQ.inv=0;mataQueixadaTick(NQ,.05,worldOut);}check(st.hp<caveMaxHp(),'quem fica no caminho é atropelado');
   for(let i=0;i<60&&h.state!=='roam';i++)mataQueixadaTick(NQ,.05,worldOut);check(h.state==='roam','depois se juntam de novo pra outra investida');
   mataNight=null;switchMap({map:'trecho',trecho:3,x:90,y:trechoEnds(3).yIn});closeDialog(true);
   // cobra-coral: se enrola, pica e envenena; o chá de marcela corta o veneno
   const co=B('coral',q[0]+60,q[1],{state:'chase'});arena(co);coralTick(co,.05,worldOut);check(co.state==='coil','chegou perto: a cobra-coral se enrola (círculo vermelho)');
   for(let i=0;i<20&&co.state!=='rest';i++)coralTick(co,.05,worldOut);check(st.hp<caveMaxHp()&&mataBuffs.veneno>0,'a picada da coral envenena');
   mataNight.beasts=[];const hv=st.hp,pausedBefore=paused;paused=false;try{for(let i=0;i<20;i++)outsideTick(.1);}finally{paused=pausedBefore;}check(st.hp<hv,'envenenado, a vida vai indo devagar');
   mataBag().marcela=1;check(mataUseItem('marcela')&&!(mataBuffs.veneno>0),'o chá de marcela corta o veneno');
   // teiú: anda aos arrancos e dá rabada em volta
   const te=B('teiu',q[0]+80,q[1],{state:'tailwind',t:.01});arena(te);teiuTick(te,.05,worldOut);check(te.state==='tail'&&st.hp<caveMaxHp(),'o anel amarelo avisa: a rabada do teiú pega quem fica perto');
   const te2=B('teiu',q[0]+200,q[1]);arena(te2);teiuTick(te2,.05,worldOut);check(te2.state==='dash','o teiú vem aos arrancos');
   // ouriço-cacheiro: eriça e solta espinhos; espinho em pé espeta a mão; baixinho apanha em dobro
   const ou=B('ourico',q[0]+70,q[1],{state:'walk'});arena(ou);ouricoTick(ou,.05,worldOut,mataNight);check(ou.state==='bristle','chegou perto: o ouriço eriça os espinhos');
   for(let i=0;i<20&&ou.state==='bristle';i++)ouricoTick(ou,.05,worldOut,mataNight);check(mataNight.shots.length>=MATA_BICHO.espinhos,'e solta uma chuva de espinhos');
   for(let i=0;i<30;i++)mataShotsTick(mataNight,.05);check(st.hp<caveMaxHp(),'os espinhos machucam');
   st.hp=caveMaxHp();Object.assign(ou,{state:'bristle',t:5,hp:ou.max});Object.assign(worldOut,{x:ou.x-70,y:ou.y,dx:1,dy:0});mataNight.cd=0;mataNight.inv=0;mataAttack();check(st.hp<caveMaxHp()&&ou.max-ou.hp<caveDmg(),'bater nele de espinho em pé: espeta a mão e o golpe pega pela metade');
   Object.assign(ou,{state:'rest',t:5,hp:ou.max});Object.assign(worldOut,{x:ou.x-70,y:ou.y,dx:1,dy:0});mataNight.cd=0;mataAttack();check(ou.max-ou.hp>=caveDmg()*2-1,'baixinho, depois de soltar os espinhos, apanha em dobro');
   // corpo-seco: levanta do montinho, agarra, e a terra cospe ele de volta uma vez
   const cs=B('corposeco',q[0]+140,q[1],{state:'buried'});arena(cs);const hb=cs.hp;cs.x=q[0]+70;mataNight.cd=0;mataAttack();check(cs.hp===hb,'enterrado, o corpo-seco não sente o facão');cs.x=q[0]+140;
   corpoSecoTick(cs,.05,worldOut);check(cs.state==='rise','chegou perto do montinho: o corpo-seco levanta');for(let i=0;i<40&&cs.state!=='walk';i++)corpoSecoTick(cs,.05,worldOut);check(cs.state==='walk','e anda curvado atrás do Sadi');
   Object.assign(cs,{x:q[0]+60,y:q[1],cool:0});corpoSecoTick(cs,.05,worldOut);for(let i=0;i<20&&cs.state==='reach';i++)corpoSecoTick(cs,.05,worldOut);check(mataGrab?.b===cs&&cs.state==='grab','os braços compridos agarram o Sadi');
   const hg=st.hp;for(let i=0;i<8;i++)mataGrabTick(.1);check(st.hp<hg&&movementBonus()<=-.5,'agarrado: não sai do lugar e a vida vai indo');
   const tg=mataGrab.t;mataNight.cd=0;mataAttack();check(!mataGrab||mataGrab.t<tg-.5,'cada facãozada solta mais ligeiro');
   mataGrab=null;Object.assign(cs,{state:'walk',hp:1,x:q[0]+70,y:q[1]});trechoDay().ticao=false;mataNight.cd=0;mataAttack();check(cs.hp>0&&cs.state==='down','derrubado, o corpo-seco desmorona…');
   cs.t=0;corpoSecoTick(cs,.05,worldOut);check(cs.state==='rise','…e a terra cospe ele de volta');
   Object.assign(cs,{state:'walk',hp:1});Object.assign(worldOut,{x:cs.x-70,y:cs.y,dx:1,dy:0});mataNight.cd=0;mataAttack();check(cs.hp<=0,'da segunda vez, vira pó');
   check(!Object.entries(CAVE_BEASTS).some(([id,b])=>['queixada','jararaca','coral','teiu','ourico','corposeco'].includes(id)&&b.from<99),'os bichos da mata não aparecem na caverna');
   caveState().facao=facaoBefore;mataNight=null;mataGrab=null;mataBuffs.veneno=0;G.phase='prep';goInside();}
  // ---------- mata adentro: o refúgio do Garibaldi, os trechos, os acampamentos e os chefes ----------
  {goInside();Object.assign(G,{phase:'prep',elapsed:0});G.report=null;G.mataSeen=G.mataSeen||1;G.mataGralha=G.mataGralha||1;delete G.mata;goOutside();
   const M=WORLD_MAPS.mata,TM=WORLD_MAPS.trecho,facaoBefore=caveState().facao,day0=G.day,cash0=G.cash;caveState().facao=true;G.cash=5000;
   switchMap({map:'serra',x:SERRA.W-120,y:SERRA.roadY+45});closeDialog(true);switchMap({map:'mata',...M.spawn()});closeDialog(true);
   // o fantasma do Garibaldi
   worldOut.x=RANCHO_GHOST.x+200;worldOut.y=RANCHO_GHOST.y;outsideTick(.05);check(modal==='talk'&&G.mata.metGaribaldi&&talkState?.lines.some(l=>/Laguna/.test(l[1])),'chegou perto do refúgio: o Garibaldi se apresenta e explica a mata adentro');talkAll();
   check(hasCard('garibaldi'),'a figurinha do Garibaldi vai pro álbum');
   garibaldiTalk();check(modal==='talk'&&/garibaldi-ghost/.test($('talkUI').innerHTML),'o Garibaldi fala com seu retrato de fantasma');talkAll();
   G.mata.historia=G.mata.historia||G.day;garibaldiTalk();check($('garibaldiTradeButton'),'como o São Dunstano, a prosa com o Garibaldi tem o botão da loja');
   action('garibaldiOpenShop');check(modal==='garibaldiShop'&&!talkState&&!$('garibaldiTradeButton'),'o botão encerra a prosa e abre a loja do rancho');closeDialog(true);
   garibaldiTalk();talkAll();check(!$('garibaldiTradeButton'),'terminada a prosa, o botão some');
   check(!GARIBALDI_LORE.flat().some(l=>/Itália|italian|Nice/i.test(l[1])),'o Garibaldi conta da Farroupilha, sem falar de onde veio');
   check(GARIBALDI_LORE.flat().some(l=>/Tramandaí/.test(l[1]))&&GARIBALDI_LORE.flat().some(l=>/Ponche Verde/.test(l[1])),'causos: os lanchões por terra até o Tramandaí e a Paz de Ponche Verde');
   // a loja do refúgio
   garibaldiTab='loja';garibaldiShop();check(modal==='garibaldiShop'&&$('dialogContent').querySelector('[data-act="forjaMake"]')&&$('dialogContent').querySelector('[data-act="facaoBuy"][data-id="chapeu"]')&&!$('dialogContent').querySelector('[data-act="garibaldiBuy"]')&&typeof MATA_UPS==='undefined','refúgio: as mesmas armas e o mesmo equipamento da ferraria do São Dunstano, sem ferramenta da mata');
   {const had=caveUp('bornal');G.cash+=300;action('facaoBuy','bornal');check(!had&&caveUp('bornal')&&mataBagMax()===6&&modal==='garibaldiShop','comprou o bornal de couro cru no rancho: vale na caverna e dobra o bornal da mata');delete caveState().up.bornal;}
   action('garibaldiTab','bornal');action('garibaldiItem','marcela');check(mataBag().marcela===1,'bornal da mata: chá de marcela');closeDialog(true);
   bagAdd('erva_verde',3);const e0=G.stock.erva||0;barbaquaSecar();check((G.stock.erva||0)===e0+3*BARBAQUA_G&&BARBAQUA_G===200&&!bagQty('erva_verde'),'barbaquá: cada ramo de erva nativa vira 200 g no saco de erva da bodega');talkAll();
   G.stock.pinhao=2000;caveState().hp=10;ranchoRest();check(G.stock.pinhao===2000&&caveState().hp===caveMaxHp(),'fogo de chão descansa sem preparar pinhão');
   check(!GOODS.sapecado&&!furniture().some(f=>f.id==='shop:sapecado'),'pinhão sapecado removido do balcão');
   // trecho 2: sempre noite, sempre bicho
   const e=M.edge({x:MATA.W-1,y:770});check(e?.map==='trecho'&&e.trecho===2,'a picada do leste leva ao trecho 2');
   switchMap(e);closeDialog(true);let T=trechoLayout();check(inTrecho()&&T.n===2&&mataState().deepest===2&&TM.canWalk(worldOut.x,worldOut.y),'entrou no trecho 2');
   const sig=JSON.stringify(T.trails[0].pts.slice(0,20).map(p=>p.map(Math.round)));trechoCache=null;check(JSON.stringify(trechoLayout().trails[0].pts.slice(0,20).map(p=>p.map(Math.round)))===sig,'o mesmo trecho no mesmo dia');
   G.day++;check(JSON.stringify(trechoLayout().trails[0].pts.slice(0,20).map(p=>p.map(Math.round)))!==sig,'no outro dia, outra picada');G.day=day0;trechoCache=null;T=trechoLayout();
   let off=null;for(let k=0;k<600&&!off;k++){const x=200+Math.random()*2800,y=200+Math.random()*1600;if(trechoTrailDist(T,x,y)>150&&!trechoInClearing(T,x,y,1.2)&&(!T.river||Math.abs(x-trechoRiverX(T,y))>200))off={x,y};}
   check(off&&!TM.canWalk(off.x,off.y),'mata fechada: fora das picadas e clareiras é mato cerrado');
   mataNight=null;mataCombatTick(.01);check(mataCombatOn()&&mataNight.beasts.length>0&&trechoDarkness(T)>=.6,'mata adentro é braba desde o trecho 2, e lá dentro é sempre noite');
   const kinds=()=>mataNight.beasts.map(b=>b.kind).sort().join();const dayKinds=kinds();G.phase='closed';mataNight=null;mataCombatTick(.01);check(kinds()===dayKinds,'de dia ou de noite, os mesmos bichos');G.phase='prep';
   check(!T.gates&&!TM.spots().some(s=>/^gate:/.test(s.id)),'sem cipó, banhado, arroio cheio nem barranco: nada de ferramenta pra passar');
   {const blocked=[],st0={deepest:mataState().deepest,xp:mataState().xp};for(const n of [2,3,5,7,12,14,22,25]){switchMap({map:'trecho',trecho:n,x:90,y:trechoEnds(n).yIn});closeDialog(true);const t=trechoLayout();if(!t.trails[0].pts.filter(([x])=>x>60&&x<t.W-60).every(([x,y])=>TM.canWalk(x,y)))blocked.push(n);}check(!blocked.length,'a picada principal anda de ponta a ponta (só os chefes seguram) '+blocked.join());Object.assign(mataState(),st0);switchMap({map:'trecho',trecho:2,x:90,y:trechoEnds(2).yIn});closeDialog(true);T=trechoLayout();}
   const pin=T.resources.find(r=>r.kind==='pinha'),p0=G.stock.pinhao||0;trechoCollect(T,pin);check(G.stock.pinhao>p0&&G.stock.pinhao-p0<=400&&trechoDay().got.includes(pin.id)&&!TM.spots().some(s=>s.id==='res:'+pin.id),'juntou um punhado de pinhão: direto pro estoque da bodega');
   check(T.resources.filter(r=>r.kind==='pinha').length<=4,'pouca pinha por trecho');
   const er=T.resources.find(r=>r.kind==='erva');if(er){const ev0=bagQty('erva_verde');trechoCollect(T,er);check(bagQty('erva_verde')>ev0&&bagQty('erva_verde')-ev0<=2,'colheu um ou dois ramos de erva-mate nativa');}
   const col=T.resources.find(r=>r.kind==='colmeia');G.up.mel=false;const m0=G.stock.mel||0;trechoCollect(T,col);check(G.stock.mel>m0&&G.up.mel&&furniture().some(f=>f.id==='shop:mel'),'colmeia de jataí: mel (sem fumaceiro), produto novo no balcão');
   // trecho 3
   const e3=TM.edge({x:T.W-1,y:T.yOut});check(e3?.trecho===3,'segue pro trecho 3');switchMap(e3);closeDialog(true);T=trechoLayout();
   mataNight=null;mataCombatTick(.01);const b=mataNight.beasts.find(x=>x.hp>0);b.hp=0;mataKill(b);mataNight=null;mataCombatTick(.01);check(mataNight.beasts[b.idx].hp<=0,'bicho derrubado não volta no mesmo dia');
   check(TM.edge({x:1,y:T.yIn})?.trecho===2,'pela esquerda, volta pro trecho 2');
   // trecho 6: o primeiro acampamento e o Jasy Jaterê (sem placa de trecho pelo caminho)
   check(TRECHO.camps.join()==='6,11,16,21,26,31'&&TRECHO.last===31,'acampamentos espaçados: um a cada cinco trechos, até o 31');
   check(!['mata','encosta','restinga'].some(b=>/\d/.test(TRECHO_BIOME_NAMES[b]))&&(()=>{let n=0;const old=mataPlaca;mataPlaca=()=>{n++;};try{switchMap({map:'trecho',trecho:4,x:90,y:trechoEnds(4).yIn});closeDialog(true);drawOutside();}finally{mataPlaca=old;}return n===0;})(),'nenhuma placa diz em que trecho o Sadi está');
   switchMap({map:'trecho',trecho:6,x:90,y:trechoEnds(6).yIn});closeDialog(true);T=trechoLayout();check(T.camp&&TM.spots().some(s=>s.id==='camp:fogo'),'trecho 6: acampamento no meio da picada');
   worldOut.x=T.camp.x;worldOut.y=T.camp.y;check(trechoCampSafe(T),'perto do fogo do acampamento, os bichos não chegam');const sh=caveState().hp;mataNight=mataNight||{beasts:[],drops:[],shots:[],inv:0};mataHurt(30,{x:worldOut.x+10,y:worldOut.y});check(caveState().hp===sh,'nem machucam');
   const at=campFolkSpot(T);worldOut.x=at.x+120;worldOut.y=at.y;outsideTick(.02);check(modal==='talk'&&talkState.lines.some(l=>l[0]==='jasy'&&/erva-mate/.test(l[1])),'no fogo do trecho 4 aparece o Jasy Jaterê, protetor da erva-mate');talkAll();
   check(mataFolk('jasy')&&TM.spots().some(s=>s.id==='folk:jasy'),'depois dá pra prosear com ele de novo');talkAll();
   caveState().hp=10;trechoRest(T);check(caveState().hp===caveMaxHp()&&mataState().camps[6],'descansou no fogo de chão: vida cheia e acampamento marcado');talkAll();
   mataGoRancho();check(worldOut.map==='mata','voltou pro refúgio');mataCampsDialog();check(modal==='mataCamps'&&$('dialogContent').querySelector('[data-act="mataCamp"][data-id="6"]:not([disabled])')&&!$('dialogContent').querySelector('[data-act="mataCamp"][data-id="11"]')&&/Jasy/.test($('dialogContent').textContent),'mesa de mapas: o fogo do Jasy aberto, e os mais fundos ainda nem aparecem');
   action('mataCamp','6');check(inTrecho()&&trechoN()===6&&Math.hypot(worldOut.x-T.camp.x,worldOut.y-T.camp.y)<260,'foi direto pro acampamento');
   check(mataLevel(0)===1&&mataLevel(100)===2&&mataLevel(300)===3&&mataRank(4)==='Guardião da mata','nível de mateiro: piá do mato, mateiro, caboclo, guardião da mata');
   // trecho 8: tocos; trecho 14: a mata escura da encosta
   switchMap({map:'trecho',trecho:8,x:90,y:trechoEnds(8).yIn});closeDialog(true);T=trechoLayout();
   check(T.tocos,'trecho 8: clareira de tocos');G.stock.pinhao=1500;trechoPlant(T);check(mataState().plant[8]&&G.stock.pinhao===500,'plantou pinhão entre os tocos');talkAll();
   G.day=day0+3;trechoCache=null;T=trechoLayout();check(trechoPlantGrown(8)&&T.resources.filter(r=>r.kind==='pinha'&&Math.hypot(r.x-T.tocos.x,r.y-T.tocos.y)<T.tocos.rx).length>=1,'três dias depois, as mudas cresceram e a clareira dá pinhão');
   trechoPlant(T);check(mataState().plant[8].thanked&&modal==='talk'&&talkState?.lines.some(l=>l[0]==='gralha'),'e a gralha-azul agradece');talkAll();G.day=day0;trechoCache=null;
   switchMap({map:'trecho',trecho:14,x:90,y:trechoEnds(14).yIn});closeDialog(true);T=trechoLayout();
   check(T.biome==='encosta'&&trechoDarkness(T)>.7&&TM.edge({x:T.W-1,y:T.yOut})?.trecho===15,'trecho 14: a encosta é escura, mas a saída aparece sem lampião');
   {const l0=trechoLight()[1],had=caveUp('lampiao');caveState().up.lampiao=true;check(trechoLight()[1]>l0,'o lampião da ferraria abre a luz na mata também');if(!had)delete caveState().up.lampiao;}
   mataBag().ticao=1;check(mataUseItem('ticao')&&trechoDarkness(T)<.5,'o tição de nó de pinho clareia o trecho');
   // baús de mateiro nos ramais
   {let Tc=null;for(let dd=0;dd<8&&!Tc;dd++)for(let n=3;n<=9&&!Tc;n++){G.day=day0+dd;trechoCache=null;switchMap({map:'trecho',trecho:n,x:90,y:trechoEnds(n).yIn});closeDialog(true);const t=trechoLayout();if(t.chests.length)Tc=t;}
    check(Tc&&Tc.chests.every(c=>Tc.clearings.some(q=>q.id.startsWith('coleta')&&((c.x-q.x)/q.rx)**2+((c.y-q.y)/q.ry)**2<1)),'baú de mateiro: só no fundo dos ramais');
    const c=Tc.chests[0],cash0=G.cash;TM.spots().find(s=>s.id==='bau:'+c.id).act();check(G.cash>cash0&&trechoDay(Tc.n).got.includes(c.id)&&modal==='talk'&&talkState?.lines.some(l=>/Baú de mateiro/.test(l[1]))&&!TM.spots().some(s=>s.id==='bau:'+c.id),'abriu o baú: moeda e coisa pro bornal, e fica aberto até amanhã');talkAll();
    const avg=n=>{let s=0;for(let k=0;k<60;k++)s+=trechoChestLoot(n).cash;return s/60;};check(avg(30)>avg(3)+40&&Object.values(trechoChestLoot(30).items).reduce((a,b)=>a+b,0)>=3,'quanto mais fundo, melhor o baú');
    G.day=day0;trechoCache=null;}
   // quem mora em cada região
   G.phase='prep';mataState().cachaco=G.day;mataState().papo=G.day;
   check(trechoStrength(30).hp>trechoStrength(12).hp&&trechoStrength(12).hp>trechoStrength(3).hp&&trechoStrength(30).hp<2.6,'quanto mais fundo, os bichos um pouco mais fortes');
   for(const [n,want,not] of [[16,['teiu','corposeco','onca'],['cascavel']],[24,['teiu','cascavel','coral','corposeco'],['jararaca','ourico']]]){switchMap({map:'trecho',trecho:n,x:90,y:trechoEnds(n).yIn});closeDialog(true);mataNight=null;mataCombatTick(.01);const k=mataNight.beasts.map(b=>b.kind);check(want.every(w=>k.includes(w))&&!not.some(w=>k.includes(w)),'trecho '+n+': '+want.join(', '));}
   let lua=day0;while(!mataLuaCheia(lua))lua++;G.day=lua;switchMap({map:'trecho',trecho:16,x:90,y:trechoEnds(16).yIn});closeDialog(true);mataNight=null;mataCombatTick(.01);check(mataNight.beasts.some(x=>x.kind==='lobisomem'),'na lua cheia, da encosta pra baixo, sai o lobisomem');
   switchMap({map:'trecho',trecho:5,x:90,y:trechoEnds(5).yIn});closeDialog(true);mataNight=null;mataCombatTick(.01);check(!mataNight.beasts.some(x=>x.kind==='lobisomem'),'no pinheiral, não');
   G.day=lua+6;trechoCache=null;switchMap({map:'trecho',trecho:16,x:90,y:trechoEnds(16).yIn});closeDialog(true);mataNight=null;mataCombatTick(.01);check(!mataNight.beasts.some(x=>x.kind==='lobisomem'),'fora da lua cheia, nada de lobisomem');G.day=day0;
   delete mataState().cachaco;delete mataState().papo;
   // o Javali Cachaço (trecho 11, o fim do pinheiral)
   switchMap({map:'trecho',trecho:11,x:90,y:trechoEnds(11).yIn});closeDialog(true);T=trechoLayout();mataNight=null;mataCombatTick(.01);let boss=trechoBoss();
   check(boss?.kind==='cachaco'&&mataNight.beasts.filter(x=>!x.boss).length===0,'trecho 11: só o Javali Cachaço, no meio da clareira');
   check(!TM.edge({x:T.W-1,y:T.yOut}),'enquanto o cachaço manda, a picada não segue');
   worldOut.x=T.camp.x-200;worldOut.y=T.camp.y+40;mataCombatTick(.01);check(modal==='talk'&&boss.met,'chegou na clareira: o cachaço aparece');talkAll();
   Object.assign(boss,{state:'charge',t:5,vx:0,vy:1,x:T.camp.x+60,y:T.camp.y+T.camp.ry-120});worldOut.x=T.camp.x-300;for(let i=0;i<40&&boss.state==='charge';i++)mataCombatTick(.05);check(boss.state==='dazed','a investida bate no mato: ele fica tonto');
   Object.assign(boss,{state:'ronco',t:0});mataCombatTick(.05);check(mataNight.beasts.filter(x=>x.kind==='javali'&&x.minion&&x.hp>0).length===2,'o ronco chama a vara de javalis');
   Object.assign(boss,{state:'fuca',t:0});mataCombatTick(.05);check(mataNight.shots.filter(s=>s.kind==='torrao').length>=3,'fuçando, joga torrão (o círculo avisa onde cai)');
   for(const x of mataNight.beasts)if(!x.boss)x.hp=0;mataNight.shots=[];boss.hp=1;Object.assign(boss,{state:'dazed',t:5,x:worldOut.x+80,y:worldOut.y});worldOut.dx=1;worldOut.dy=0;mataNight.cd=0;mataAttack();
   check(mataState().cachaco&&mataState().camps[11]&&modal==='talk','vencido: o acampamento acende');talkAll();
   check(TM.edge({x:T.W-1,y:T.yOut})?.trecho===12,'a picada pra encosta abre');
   const r0=caveReach(),d0=caveDmg(),h0=caveMaxHp(),at11=campFolkSpot(T);worldOut.x=at11.x+120;worldOut.y=at11.y;outsideTick(.02);check(modal==='talk'&&talkState.lines.some(l=>l[0]==='lanceiro'&&/Porongos/.test(l[1])),'no fogo do 11, o Lanceiro Negro conta de Porongos');talkAll();
   check(mataFolk('lanceiro')&&hasCard('lanceiros')&&caveReach()===r0&&caveDmg()===d0&&caveMaxHp()===h0,'figurinha dos Lanceiros; e nada de mexer em arma ou vida (isso é da ferraria)');
   delete mataState().sentinela;const bu0=bagQty('butia');trechoRest(T);talkAll();check(bagQty('butia')===bu0+1,'de sentinela no fogo, o lanceiro deixa um butiá');
   // o Lagarto do papo-amarelo (trecho 21, o fim da encosta)
   switchMap({map:'trecho',trecho:21,x:90,y:trechoEnds(21).yIn});closeDialog(true);T=trechoLayout();mataNight=null;mataCombatTick(.01);boss=trechoBoss();
   check(boss?.kind==='papo','trecho 21: o Lagarto do papo-amarelo guarda a descida');worldOut.x=T.camp.x-200;worldOut.y=T.camp.y+40;mataCombatTick(.01);talkAll();
   Object.assign(boss,{state:'dig',t:0});mataCombatTick(.05);check(boss.state==='under','ele se enterra');const hb0=boss.hp;mataNight.cd=0;mataAttack();check(boss.hp===hb0,'debaixo da terra, o facão não pega');
   boss.t=0;mataCombatTick(.05);check(boss.state==='emergewarn'&&Math.hypot(boss.tx-worldOut.x,boss.ty-worldOut.y)<2,'o círculo vermelho marca onde ele vai sair');
   caveState().hp=caveMaxHp();mataNight.inv=0;boss.t=0;mataCombatTick(.05);check(boss.state==='stuck'&&caveState().hp<caveMaxHp(),'ficou no círculo: o lagarto sai do chão por baixo; depois fica preso');
   Object.assign(boss,{state:'chiado',t:0,x:worldOut.x+150,y:worldOut.y});mataNight.inv=0;caveState().hp=caveMaxHp();for(let i=0;i<10;i++)mataCombatTick(.05);check(mataBossFx.dizzy>0&&caveState().hp<caveMaxHp(),'o chiado do papo inchado empurra e deixa tonto');
   boss.hp=boss.max*.4;Object.assign(boss,{state:'stuck',t:2});mataCombatTick(.05);check(mataNight.beasts.filter(x=>x.kind==='teiu'&&x.minion).length===2,'brabo, ele chama teiús');
   for(const x of mataNight.beasts)if(!x.boss)x.hp=0;boss.hp=1;Object.assign(boss,{state:'stuck',t:5,x:worldOut.x+80,y:worldOut.y});mataNight.cd=0;mataAttack();
   check(mataState().papo&&mataState().camps[21]&&modal==='talk','vencido: o acampamento acende e a restinga abre');talkAll();
   const dk0=trechoLight()[1],at21=campFolkSpot(T);worldOut.x=at21.x+120;worldOut.y=at21.y;outsideTick(.02);check(modal==='talk'&&talkState.lines.some(l=>l[0]==='sepe'&&/Esta terra tem dono/.test(l[1])),'no fogo do 21, o Sepé Tiaraju: “Esta terra tem dono!”');talkAll();
   check(hasCard('sepe')&&trechoLight()[1]>dk0,'figurinha do Sepé, e o lunar dele clareia o escuro da mata');
   // a restinga, o Bento e a praia
   switchMap({map:'trecho',trecho:26,x:90,y:trechoEnds(26).yIn});closeDialog(true);T=trechoLayout();const at26=campFolkSpot(T);worldOut.x=at26.x+120;worldOut.y=at26.y;outsideTick(.02);check(modal==='talk'&&talkState.lines.some(l=>l[0]==='bento'&&/charque/.test(l[1])),'no fogo do 26, o Bento Gonçalves conta por que começou a guerra');talkAll();
   check(hasCard('bento_goncalves'),'figurinha do Bento');
   Object.assign(worldOut,{x:90,y:T.yIn});mataNight=null;mataCombatTick(.01);caveState().hp=1;mataNight.inv=0;const cb=G.cash;mataHurt(30,{x:worldOut.x+10,y:worldOut.y});check(worldOut.map==='mata'&&G.cash===cb&&modal==='talk'&&/lenço farrapo/.test($('dialogContent').textContent),'com o lenço farrapo do Bento, desmaiar não tira dinheiro');talkAll();delete G.mata.faintDay;
   switchMap({map:'trecho',trecho:29,x:90,y:trechoEnds(29).yIn});closeDialog(true);T=trechoLayout();check(T.beach&&!TM.canWalk(800,trechoShoreY(800)+10)&&T.flora.trees.some(t=>t.art==='butia'),'trecho 29: butiazais, a praia e o mar');
   const bu=T.resources.find(r=>r.kind==='butia');if(bu){const b0=bagQty('butia');trechoCollect(T,bu);check(bagQty('butia')>b0&&bagQty('butia')-b0<=2,'na restinga, colhe um ou dois butiás');}
   // o butiá cura em qualquer briga: no bornal da mata e no cinto da caverna
   mataNight=null;mataCombatTick(.01);bagAdd('butia',2);caveState().hp=50;const nb=bagQty('butia');check(mataBeltItems()[0]?.id==='butia'&&mataUseItem('butia')&&caveState().hp===50+BUTIA_HEAL&&bagQty('butia')===nb-1,'butiá no bornal da mata: cura um pouco');
   check(caveBeltItems()[0]?.id==='butia','o butiá também entra no cinto da caverna');
   {const back={...worldOut};caveState().floor=1;caveRun=null;delete G.cave.faintDay;enterCave(1);let err='';try{simulate(.016);caveBeltRefresh();}catch(e){err=e.message;}check(!err&&$('caveBelt').querySelector('[data-id="butia"]'),'com butiá no bornal, a caverna roda e mostra o butiá no cinto '+err);caveLeave('',true);closeDialog(true);switchMap(back);closeDialog(true);}
   switchMap({map:'trecho',trecho:31,x:90,y:trechoEnds(31).yIn});closeDialog(true);T=trechoLayout();const at31=campFolkSpot(T);worldOut.x=at31.x+120;worldOut.y=at31.y;outsideTick(.02);check(modal==='talk'&&talkState.lines.some(l=>l[0]==='anita'&&/Mariath/.test(l[1])),'no fogo do 31, a Anita conta da batalha de Laguna');talkAll();
   check(hasCard('anita')&&mataFolk('anita'),'figurinha da Anita');
   // a Barra de Laguna: a carreta e o navio
   const eL=TM.edge({x:T.W-1,y:T.yOut});check(eL?.map==='laguna','depois do último trecho, a Barra de Laguna');switchMap(eL);closeDialog(true);
   check(!WORLD_MAPS.laguna.spots().some(s=>s.id==='laguna:seival'),'o Seival ainda tá na carreta');lagunaArrival();check(modal==='talk'&&talkState.lines.some(l=>/Seival/.test(l[1])),'o Garibaldi e a Anita pedem ajuda pra pôr o Seival na água');talkAll();talkAll();
   check(lagunaState().carregado&&WORLD_MAPS.laguna.spots().some(s=>s.id==='laguna:seival'),'com o barco na água, dá pra abordar o navio');
   withScenes(()=>{delete lagunaState().carregado;lagunaArrival();check(scene?.id==='laguna-chegada'&&scene.steps.some(s=>s.say==='garibaldi'&&/oito rodas/.test(s.text))&&scene.steps.some(s=>s.actor==='barco'),'cena: os bois puxam a carreta e o Garibaldi ergue o barco até o mar');while(scene)sceneSkip();});talkAll();
   navioBoard();check(worldOut.map==='navio'&&WORLD_MAPS.navio.canWalk(worldOut.x,worldOut.y),'no convés do navio imperial');mataNight=null;mataCombatTick(.01);boss=navioBoss();
   check(boss&&mataCombatOn(),'o capitão Mariath em guarda');Object.assign(worldOut,{x:900,y:700});mataCombatTick(.01);check(modal==='talk'&&talkState.lines.some(l=>l[0]==='mariath'&&/Marinha Imperial/.test(l[1])),'o capitão se apresenta: Frederico Mariath, da Marinha Imperial');talkAll();
   Object.assign(boss,{state:'idle',t:0,fogo:0,x:420,y:650});mataCombatTick(.05);check(boss.state==='fogo'&&navioFx.lanes.length===3&&navioFx.lanes.some(l=>Math.abs(l.y-worldOut.y)<2),'“Fogo!”: os canhões marcam três faixas do convés');
   caveState().hp=caveMaxHp();mataNight.inv=0;for(let i=0;i<40;i++)mataCombatTick(.05);check(caveState().hp<caveMaxHp(),'quem fica na faixa leva a bala');
   Object.assign(boss,{state:'idle',t:0,fogo:9,board:0,x:420,y:650});Object.assign(worldOut,{x:900,y:700});mataCombatTick(.05);boss.t=0;mataCombatTick(.05);check(mataNight.beasts.filter(x=>x.kind==='marinheiro'&&x.hp>0).length===3,'“Abordagem!”: marinheiros sobem pela escotilha');
   navioFx.anita=0;navioFx.ball=null;for(let i=0;i<25;i++)mataCombatTick(.05);check(mataNight.beasts.filter(x=>x.kind==='marinheiro'&&x.hp>0).length<3,'do Seival, a Anita dispara o canhãozinho');
   check(navioFx.lanceiro&&(()=>{let n=0;const old=drawCampFolk;drawCampFolk=(id)=>{if(id==='lanceiro'||id==='bento')n++;};try{drawOutside();}finally{drawCampFolk=old;}return n>=2;})(),'na batalha estão o Lanceiro Negro, no convés, e o Bento Gonçalves, no Seival');
   {let err='';try{for(const id of ['lobisomem','sanguanel','mula','boitata'])drawFolk(id,200,200,1);}catch(e){err=e.message;}check(!err,'as lendas da vila (lobisomem, mula...) continuam com o desenho delas, sem trocar pelos bonecos da mata '+err);}
   const sl=B=>({kind:'marinheiro',x:navioFx.lanceiro.x+40,y:navioFx.lanceiro.y,hp:40,max:40,minion:true,dx:1,state:'chase',t:1,hurt:0,frame:0,cool:5,attack:0});const mar=sl();mataNight.beasts.push(mar);Object.assign(navioFx.lanceiro,{state:'idle',t:0});for(let i=0;i<10&&mar.hp>0;i++)navioAlliesTick(mataNight,.05,worldOut);check(mar.hp<=0,'o Lanceiro Negro carrega de lança nos marinheiros');
   caveState().hp=20;navioFx.bento=0;navioAlliesTick(mataNight,.05,worldOut);check(caveState().hp===35,'o Bento grita ânimo do Seival e o Sadi recupera um pouco de vida');
   caveState().hp=1;mataNight.inv=0;mataHurt(30,{x:worldOut.x-10,y:worldOut.y});check(worldOut.map==='laguna'&&modal==='talk'&&talkState.lines.some(l=>l[0]==='garibaldi'),'caiu no mar: o Garibaldi puxa o Sadi pra areia');talkAll();
   check(G.mata.faintDay===G.day&&(navioBoard(),worldOut.map==='laguna')&&!WORLD_MAPS.laguna.edge({x:1,y:LAGUNA.entryY})&&!WORLD_MAPS.mata.edge({x:MATA.W-1,y:770}),'desmaiou: no mesmo dia não volta pro navio nem pra mata adentro');talkAll();closeDialog(true);
   delete G.mata.faintDay;
   navioBoard();mataNight=null;mataCombatTick(.01);boss=navioBoss();boss.met=true;for(const x of mataNight.beasts)if(!x.boss)x.hp=0;boss.hp=1;Object.assign(boss,{state:'stagger',t:5,x:worldOut.x+80,y:worldOut.y});worldOut.dx=1;worldOut.dy=0;mataNight.cd=0;mataAttack();
   talkAll();talkAll();check(lagunaState().won&&worldOut.map==='laguna'&&hasCard('canabarro')&&!mataCombatOn(),'vencido: o navio some e Laguna fica em paz');
   withScenes(()=>{missionsTick();});check(missionDone('laguna')&&modal==='talk','a Batalha de Laguna termina');talkAll();
   check(MISSIONS.find(m=>m.id==='lendaria').when(),'e a Bodega lendária pode começar');
   checkAchievements();check(['mata5','cachaco','papo','laguna'].every(id=>G.achievements[id]),'conquistas da mata adentro');
   // morrer na mata: a mesma queda da caverna, a tela escurece, e acorda no refúgio
   withScenes(()=>{switchMap({map:'trecho',trecho:3,x:90,y:trechoEnds(3).yIn});closeDialog(true);mataNight=null;mataCombatTick(.01);delete G.mata.faintDay;caveState().hp=1;mataNight.inv=0;mataHurt(30,{x:worldOut.x-10,y:worldOut.y});
     check(mataDefeatActive()&&!$('caveDefeat').classList.contains('hidden')&&worldOut.map==='trecho','caiu na mata: o mundo congela e a tela escurece, como na caverna');
     let t=performance.now();for(let i=0;i<100&&mataDefeatActive();i++){t+=50;frameStep(t);}
     check(!mataDefeatActive()&&$('caveDefeat').classList.contains('hidden')&&worldOut.map==='mata'&&modal==='talk','e acorda no refúgio do Garibaldi');});talkAll();
   check(!WORLD_MAPS.mata.edge({x:MATA.W-1,y:770}),'e mata adentro só no outro dia');G.day++;check(WORLD_MAPS.mata.edge({x:MATA.W-1,y:770})?.map==='trecho','no dia seguinte, a picada abre de novo');G.day--;delete G.mata.faintDay;
   // pouca vida: o coração bate e a borda da tela fica vermelha
   switchMap({map:'trecho',trecho:3,x:90,y:trechoEnds(3).yIn});closeDialog(true);mataNight=null;mataCombatTick(.01);caveState().hp=5;let beats=0;const hb=AudioEngine.caveHeartbeat;AudioEngine.caveHeartbeat=()=>{beats++;};const pb=paused;paused=false;try{for(let i=0;i<20;i++)outsideTick(.1);}finally{AudioEngine.caveHeartbeat=hb;paused=pb;}check(beats>=1,'com pouca vida, o coração bate forte na mata');caveState().hp=caveMaxHp();
   // na caverna: desmaiou, a gruta fica pra amanhã
   switchMap({map:'serra',x:CAVE.door.x,y:CAVE.door.y+120});closeDialog(true);caveState().faintDay=G.day;enterCave(1);check(worldOut.map==='serra','desmaiou na caverna: no mesmo dia, a gruta não deixa descer');caveState().faintDay=G.day-1;
   // tudo desenha sem erro
   for(const n of [2,8,14,18]){switchMap({map:'trecho',trecho:n,x:90,y:trechoEnds(n).yIn});closeDialog(true);drawOutside();}check(inTrecho(),'os trechos desenham sem erro');
   switchMap({map:'laguna',x:90,y:LAGUNA.entryY});closeDialog(true);drawOutside();switchMap({map:'navio',x:NAVIO.ladder.x,y:NAVIO.ladder.y-40});closeDialog(true);drawOutside();check(worldOut.map==='navio','Laguna e o navio desenham sem erro');
   caveState().facao=facaoBefore;G.cash=cash0;mataNight=null;trechoCache=null;G.phase='prep';G.day=day0;goInside();}
  // ---------- butiazeiros e bergamoteiras do campo dão fruta, como o butiazeiro da beira do rio ----------
  {goInside();Object.assign(G,{phase:'prep',elapsed:0});G.report=null;goOutside();const day0=G.day;
   const all=['vila','serra','sc'].flatMap(id=>fruitTrees(WORLD_MAPS[id]));check(all.some(f=>f.item==='butia')&&all.some(f=>f.item==='bergamota'),'o campo tem butiazeiros e bergamoteiras');
   for(const item of ['butia','bergamota']){
    const f=all.find(x=>x.item===item);switchMap({map:f.map,x:f.x,y:f.y+60});closeDialog(true);worldOut.x=f.x;worldOut.y=f.y+40;delete G.forage?.[f.id];
    const sp=WORLD_MAPS[f.map].spots().find(x=>x.id==='forage:'+f.id);check(sp&&/Colher/.test(sp.label),'E na '+f.name.toLowerCase()+': colher');
    const before=item==='butia'?bagQty('butia'):(G.stock.bergamota||0);G.taught.mato=true;sp.act();talkAll();closeDialog(true);
    const after=item==='butia'?bagQty('butia'):(G.stock.bergamota||0);check(after===before+f.q,'colheu '+(item==='butia'?'6 butiás':'2 kg de bergamota'));
    check(/fruta de novo/.test(WORLD_MAPS[f.map].spots().find(x=>x.id==='forage:'+f.id).label),'depois de colher, espera a fruta amadurecer');
    let fruits=0;const fd=food;food=(...a)=>{fruits++;};try{drawFruitTree(f,f.x,f.y,f.w,f.h,environmentSprite);}finally{food=fd;}check(fruits===0,'colhida, a árvore fica sem fruta');
    G.day+=forageWait(f);fruits=0;food=(...a)=>{fruits++;};try{drawFruitTree(f,f.x,f.y,f.w,f.h,environmentSprite);}finally{food=fd;}check(fruits>0&&forageReady(f),'dias depois, carregada de novo');G.day=day0;
   }
   goInside();}
  // ---------- o sonho do Sadi não trava ----------
  {worldOut=null;const seen=[],P=CanvasRenderingContext2D.prototype,di=P.drawImage;P.drawImage=function(...a){seen.push(this.filter);return di.apply(this,a);};try{drawSceneSonho();}finally{P.drawImage=di;}
   check(seen.length>20&&!seen.some(f=>/sepia/.test(f)),'o sonho do Sadi pinta o sépia por cima do quadro, sem filtro em cada desenho');}
  // ---------- quero-queros no mundo aberto ----------
  {goInside();G.phase='prep';G.report=null;goOutside();const count={vila:0,serra:0,sc:0};let day=0,open=true;
   for(const map of Object.keys(count))for(let d=200;d<300;d++){G.day=d;switchMap({map,x:1500,y:900});closeDialog(true);const b=qqBirds();if(b.length){count[map]++;open=open&&b.every(q=>WORLD_MAPS[map].canWalk(q.x,q.y));if(map==='vila'&&!day)day=d;}}
   check(count.vila>80&&count.serra>55&&count.sc>40&&count.serra<=count.vila&&count.sc<=count.serra&&open,'quero-queros quase todo dia pelo mapa (mais na Fronteira, um pouco menos na Serra e em SC), sempre no campo');
   check(QQ_SCALE<1,'no mundo aberto o quero-quero é menor que na laçada');
   G.day=day;switchMap({map:'vila',x:1500,y:900});closeDialog(true);const b=qqBirds()[0];b.aggr=1;const sx=b.x+150,sy=b.y+10;worldOut.x=sx;worldOut.y=sy;Math.random=()=>.5;
   for(let i=0;i<4;i++)simulate(.05);check(b.state==='warn'&&b.tx===sx,'chegou perto: ele grita e marca o rasante');
   for(let i=0;i<60&&b.state!=='fly';i++)simulate(.03);check(b.state==='fly'&&Math.hypot(worldOut.x-sx,worldOut.y-sy)>5,'o rasante empurra o Sadi e o quero-quero pousa mais adiante');Math.random=randomBefore;
   G.up.bodoque=true;b.state='ground';b.calm=99;worldOut.x=b.x+200;worldOut.y=b.y;$('floatNotes').innerHTML='';qqSlingNote=0;slingStart();document.dispatchEvent(new KeyboardEvent('keydown',{key:'f'}));
   check(!slingActive()&&!sling.aim&&/só sai na laçada/.test($('floatNotes').textContent),'no mundo aberto o bodoque não funciona: só na laçada');goInside();}
 }finally{window.confirm=confirmBefore;window.NO_SCENES=scenesBefore;Math.random=randomBefore;if(phoneOpen)togglePhone(false);if(farmGame)cancelFarmGame();scene=null;fishing=null;G.lasso=null;$('lassoUI')?.classList.add('hidden');closeDialog(true);worldOut=null;}
 return results;
})()
