
// Depois do prólogo: missões da história, pedidos nas casas dos especiais, relíquias, frutas do mato, pescaria, calendário e a dificuldade progressiva da bodega.
(() => {
 const results=[],check=(ok,text)=>{if(!ok)throw Error(text);results.push(text);};
 const confirmBefore=window.confirm,scenesBefore=window.NO_SCENES,difficultyBefore=window.difficulty;
 try{
  window.confirm=()=>true;window.NO_SCENES=false;localStorage.removeItem(KEY);
  action('new');sceneSkip();closeDialog(true);
  G.prologue.done=true;G.prologue.step=PROLOGUE_STEPS.length;G.tutorial.day=4;G.calOffset=3;G.day=5;G.tutorial.complete=true;G.phase='prep';G.valterQueue=[];G.taught={manha:true};
  const tick=n=>{for(let i=0;i<n;i++)simulate(.05);};
  const talkAll=()=>{let k=0;while(modal==='talk'&&k++<30)talkNext();};
  const badin=PEOPLE.findIndex(p=>p.id==='badin');
  check(calendar(G.tutorial.day).name==='Sexta'&&calendar().name==='Sábado'&&fixedEventFor(G.tutorial.day+2)==='costelao','o primeiro dia de bodega é sexta, o segundo sábado e o terceiro domingo de costelão');
  check(regionLocked('serra')&&regionLocked('sc'),'jogo novo: Serra e Santa Catarina começam fechadas');
  // segundo dia: o Valter chega atrás de um trago de pura e manda buscar a mesa na Ferragem
  tick(2);check(modal==='talk'&&G.missions.trago,'na manhã do segundo dia o Valter aparece atrás de um trago de pura');talkAll();check(missionActive('trago')&&!G.up.trago,'missão do trago: a mesa não vem mais no tutorial');
  goOutside();check(!!worldGuidePoint(),'a seta aponta a Ferragem da Fronteira');
  const fe=WORLD_MAPS.vila.spots().find(s=>s.id==='ferragem');check(WORLD_MAPS.vila.canWalk(fe.x,fe.y),'dá para chegar na Ferragem');worldOut.x=fe.x;worldOut.y=fe.y;interact();check(worldOut.map==='ferragem','entra na Ferragem da Fronteira');
  storeShop('ferragem');check($('dialogContent').textContent.includes('Missão · Trago de pura'),'o caixa da loja mostra o que a missão pede');
  {const cash=G.cash;action('upgrade','trago');check(G.up.trago&&G.cash===cash&&!!document.querySelector('#dialogContent .bought-tag'),'a Mesa de tragos sai de graça e o botão confirma a compra');}closeDialog(true);
  tick(2);check(modal==='talk','com a mesa instalada, o Valter agradece com a recompensa');talkAll();check(missionDone('trago'),'missão do trago concluída');
  // a história segue em capítulos que começam sozinhos (sem "!" sobre as casas)
  switchMap({map:'vila',x:1600,y:735});tick(4);check(modal==='talk'&&G.missions.abertura?.status==='offered','o capítulo 2 começa sozinho, sem precisar achar o Valter');
  {let k=0;while(modal==='talk'&&!$('dialogContent').textContent.includes('Capítulo 2')&&k++<10)talkNext();check($('dialogContent').innerHTML.includes('reward-list'),'o capítulo mostra o objetivo e a recompensa');}
  talkAll();check(missionActive('abertura')&&activeChapter()?.id==='abertura','o capítulo fica em andamento');
  check(TEACH.missoes&&trackerLines()[0]?.kind==='story'&&trackerLines()[0].title.includes('Três noites seguidas'),'a história aparece primeiro no canto da tela');
  check(!MISSIONS.filter(m=>m.chapter).some(m=>missionForGiver(m.giver||'valter')?.id===m.id),'capítulo da história não vira oferta de casa');
  G.showTracker=false;refreshHUD();check($('questTracker').classList.contains('hidden'),'no celular dá para esconder as missões da tela');G.showTracker=true;
  G.openStreak=3;tick(2);check(modal==='talk','três noites seguidas: vem a conversa de conclusão');talkAll();
  check(missionDone('abertura')&&!regionLocked('serra')&&regionLocked('sc'),'abrir três noites seguidas conclui a missão do Valter e abre a Serra');
  tick(4);check(modal==='talk'&&!!G.missions.conhecer,'capítulo 3 começa sozinho: conhecer o Badin, na Serra');talkAll();check(missionActive('conhecer'),'capítulo 3 em andamento');
  // casa do Badin: primeiro encontro, o campeonato de bocha (abre Santa Catarina) e o queijo pra nona (abre a despensa)
  goOutside();switchMap({map:'serra',x:1800,y:200});check(worldOut.map==='serra'&&!worldGuidePoint(),'a Serra já abre; fora dos tutoriais não tem seta (o jogador explora)');
  check(atHome('badin'),'quem a história precisa encontrar espera em casa');
  const hb=WORLD_MAPS.serra.spots().find(s=>s.id==='house:badin');worldOut.x=hb.x;worldOut.y=hb.y;interact();check(worldOut.map==='casa:badin','entra na casa do Badin');
  const home=WORLD_MAPS['casa:badin'].spots().find(s=>s.id==='home:badin');check(!!home,'o Badin está em casa');
  worldOut.x=home.x;worldOut.y=home.y;interact();check(modal==='talk'&&$('dialogContent').textContent.includes('Badin'),'primeiro encontro fora da bodega: o Badin se apresenta');talkAll();
  for(let k=0;k<4&&!missionActive('campeonato');k++){tick(3);talkAll();}
  check(missionDone('conhecer')&&missionActive('campeonato'),'conhecido o Badin, o capítulo 4 começa: organizar um campeonato de bocha');
  G.cash=Math.max(G.cash,100);createSportTournament('bocha');closeDialog(true);recordSportMatch(false);check(sportState().bracket.finished,'perdendo na primeira partida, o campeonato se encerra');
  tick(2);talkAll();check(missionDone('campeonato')&&!regionLocked('sc'),'ganhando ou perdendo, o campeonato conclui a missão e abre Santa Catarina');
  for(let k=0;k<3&&!missionActive('queijo');k++){tick(3);talkAll();}check(missionActive('queijo'),'capítulo 5: o Badin pede o queijo pra nona');
  worldOut.x=home.x;worldOut.y=home.y;interact();talkAll();if(modal!=='quest')interact();check(modal==='quest'&&$('dialogTitle').textContent.includes('Queijo pra nona')&&$('dialogContent').textContent.includes('Recompensa'),'o pedido mostra o que levar e a recompensa');
  G.stock.queijo=10;showQuest(badin);const cash=G.cash;action('questDeliver',String(badin));
  check(G.cash-cash===50&&!G.stock.queijo&&modal==='talk'&&$('dialogContent').textContent.includes('Badin'),'entregue o queijo: R$ 50 e o agradecimento é do próprio Badin');talkAll();
  check(missionDone('queijo')&&G.badinShop&&G.up.salame&&!STORE_GOODS.acougue.includes('salame'),'duas missões do Badin: ele passa a vender salame (que saiu do açougue e das melhorias)');
  for(let k=0;k<3&&!missionActive('indaial');k++){tick(3);talkAll();}check(missionActive('indaial'),'capítulo 6 começa em seguida');
  {const it=WORLD_MAPS['casa:badin'].spots().find(s=>/Despensa/.test(s.label));worldOut.x=it.x;worldOut.y=it.y;interact();check(modal==='worldStore'&&$('dialogContent').innerHTML.includes('seed:uva')&&$('dialogContent').innerHTML.includes('data-id="salame"'),'na despensa da colônia: salame e muda de uva');
   action('hortaDo','seed:uva');check(hortaState().seeds.uva===CROPS.uva.pack,'compra muda de parreira');closeDialog(true);}
  {const f=G.friends[badin];G.friends[badin]=0;check(questMarker('badin')===null,'sem amizade, o pedido da casa ainda não aparece');G.friends[badin]=Math.max(f,QUEST_FRIEND[0]);check(questMarker('badin')==='new','com amizade, o Badin tem um pedido novo');}
  worldOut.x=home.x;worldOut.y=home.y;interact();check(modal==='quest'&&$('dialogContent').innerHTML.includes('questAccept'),'o pedido da casa aparece para aceitar');
  action('questAccept',String(badin));check(questState('badin').active&&questMarker('badin')==='waiting','pedido aceito: o Badin espera');
  bagAdd('ovo',8);worldOut.x=home.x;worldOut.y=home.y;interact();check($('dialogContent').innerHTML.includes('questDeliver'),'com os ovos no inventário, dá para entregar');
  action('questDeliver',String(badin));check($('dialogContent').textContent.includes('Badin')&&!$('dialogContent').textContent.includes('Valter'),'o agradecimento do pedido é de quem pediu');talkAll();check(questState('badin').step===1&&!questState('badin').active&&bagQty('salame')===2&&G.questsDone===1,'pedido entregue: salame de recompensa e o próximo pedido fica para outro dia');
  // relíquias e frutas do mato, nos três mapas
  switchMap({map:'serra',x:1800,y:985});check(WORLD_MAPS.serra.spots().some(s=>s.id==='secret:rolha')&&WORLD_MAPS.serra.spots().some(s=>s.id==='forage:guabirobeira'),'a Serra também esconde relíquias e tem guabirobeira');
  switchMap({map:'vila',x:1600,y:700});const sec=SECRETS.find(s=>s.id==='pagina1');worldOut.x=sec.x;worldOut.y=sec.y;check(worldNearest()?.id==='secret:pagina1','perto do brilho no chão dá para investigar');
  interact();check(modal==='talk','achou uma relíquia: explicação e recompensa');talkAll();check(secretsFound()===1&&pagesFound()===1&&!WORLD_MAPS.vila.spots().some(s=>s.id==='secret:pagina1'),'a relíquia achada sai do mapa e conta no caderno do vô');
  check(SECRETS.every(s=>WORLD_MAPS[s.map].canWalk(s.x,s.y)),'todas as relíquias ficam em lugar alcançável');
  check(FORAGE.every(f=>WORLD_MAPS[f.map].canWalk(f.x,f.y+40)),'todas as frutas do mato ficam em lugar alcançável');
  const bt=WORLD_MAPS.vila.spots().find(s=>s.id==='forage:butiazeiro');worldOut.x=bt.x;worldOut.y=bt.y;interact();talkAll();
  check(bagQty('butia')===6&&/de novo em/.test(WORLD_MAPS.vila.spots().find(s=>s.id==='forage:butiazeiro').label),'o butiazeiro dá 6 butiás e frutifica de novo depois');
  // pescaria no trapiche
  const rv=WORLD_MAPS.vila.spots().find(s=>s.id==='river');worldOut.x=rv.x;worldOut.y=rv.y;interact();talkAll();check(modal==='farmGame'&&farmGame.stages.length===1,'no trapiche, a pescaria é uma fisgada só');
  farmGame.pos=(farmStage().zone[0]+farmStage().zone[1])/2;farmGameKey('e');check(bagQty('peixe')>=1&&fishLeft()===FISH_PER_DAY-1,'fisgou: peixe no inventário e um lance a menos no dia');
  // calendário físico na frente da bodega
  const cal=WORLD_MAPS.vila.spots().find(s=>s.id==='calendario');worldOut.x=cal.x;worldOut.y=cal.y;interact();talkAll();
  check($('dialogTitle').textContent==='Calendário de eventos'&&document.querySelectorAll('#dialogContent .calendar-day').length===7,'o calendário mostra a semana com os eventos');closeDialog(true);
  // eventos pequenos acontecem sem aviso e não aparecem no calendário
  {const ev=G.event,tm=G.testMode;G.testMode=false;G.event={id:'radio',seen:true,fired:{}};check(eventInfo()===EVENTS.normal&&EVENTS.radio.quiet&&EVENTS.baile.quiet&&!EVENTS.chuva.quiet&&!EVENTS.campeonato.quiet&&!EVENTS.grenal.quiet&&!EVENTS.costelao.quiet,'rádio, baile, feira e geada acontecem sem aviso; truco, chuva, futebol e costelão aparecem');
   calendarDialog();check(!$('dialogContent').textContent.includes('Final do campeonato')&&!$('dialogContent').textContent.includes('Baile na comunidade'),'o calendário não mostra os eventos pequenos');closeDialog(true);G.event=ev;G.testMode=tm;}
  // aba de missões do celular
  phoneTab='missions';togglePhone(true);{const t=$('phoneContent').textContent;check(t.includes('História')&&t.includes('Capítulo')&&t.includes('Secundárias')&&t.includes('Pedidos aceitos')&&$('phoneContent').querySelector('.mission-card.story .reward-list'),'o celular separa a história (com o capítulo da vez) das secundárias e dos pedidos');}togglePhone(false);
  // dificuldade progressiva
  const d1=difficulty(G.tutorial.day+1),d10=difficulty(G.tutorial.day+15);
  check(d1.pace>d10.pace&&d1.patience>d10.patience&&d1.missing<d10.missing&&d1.maxItems<d10.maxItems,'a bodega fica mais movimentada e exigente com os dias');
  // xis só com ingrediente na cozinha
  goInside();G.phase='open';for(const p of ['pao_xis','salada','burger','ovo','queijo'])G.stock[p]=50;G.stock.salame=0;
  const xisOrders=()=>{let n=0;for(let i=0;i<200;i++)if(tableOrders({table:0,person:0,size:1}).some(k=>RECIPES[k]))n++;return n;};
  check(xisOrders()>0,'com tudo na cozinha, a mesa pede xis');G.stock.burger=0;check(xisOrders()===0,'sem hambúrguer, ninguém pede xis');
  {const d={person:0,later:['xis_salada']};orderNext(d,null);check(!d.orders.length,'xis que acabou no meio do pedido: a pessoa passa a vez');}
  {G.stock.cerveja=0;const rep=G.rep;const d={person:0,later:['cerveja']};orderNext(d,null);check(!d.orders.length&&G.rep===rep-1,'bebida em falta: o freguês reclama e a reputação cai');}
  // freguês de balcão pode pedir o que está em falta
  G.day=G.tutorial.day+9;G.shop=[];G.stock.cigarro=0;window.difficulty=()=>({...difficultyBefore(),missing:1});let c=null;for(let i=0;i<20&&!c;i++)c=spawnShop();window.difficulty=difficultyBefore;
  check(c?.missing&&!orderable(c.pid),'no balcão também aparece quem pede o que está em falta');
  check(TEACH.falta[1].includes('Atacado'),'a primeira falta ensina a ligar pro Atacado (mais caro que produzir)');
  {G.stock.cerveja=0;G.deliveries=[];const cash0=G.cash;action('phoneBuy','cerveja');check(G.deliveries.length===1&&round(cash0-G.cash)===round(goodPack('cerveja')*GOODS.cerveja.cost*PHONE_MARKUP),'pelo celular o Atacado entrega, mas cobra mais caro');G.deliveries=[];}
  // gente na rua: sem pisca-pisca, com os personagens menores e, às vezes, visita de outra região
  G.phase='prep';G.regions={serra:true,sc:true};goOutside();worldWalkersKey='';walkersTick(.05);
  {const key=worldWalkersKey,list=worldWalkers.map(w=>w.person).join();for(let i=0;i<30;i++)walkersTick(.05);check(key===worldWalkersKey&&list===worldWalkers.map(w=>w.person).join(),'quem anda na rua não é sorteado de novo a cada quadro (fim do pisca-pisca)');}
  check(worldWalkers.some(w=>w.kind==='minor'&&!isSpecial(w.person)),'personagens menores, sem casa, também andam pela rua');
  check(WORLD_MAPS.vila.residents.some(id=>atHome(id))&&WORLD_MAPS.vila.residents.some(id=>worldWalkers.some(w=>PEOPLE[w.person].id===id)),'uns moradores ficam em casa, outros andam pela rua');
  {const day0=G.day;let who=null;for(let d=day0;d<day0+300&&who===null;d++){G.day=d;const i=PEOPLE.map((p,i)=>i).find(i=>isSpecial(i)&&wanderMap(i)==='vila');if(i!==undefined)who=i;}
   check(who!==null&&homeRegion(who)!=='vila','raramente alguém de outra região passa o dia na Fronteira');worldWalkersKey='';walkersTick(.05);const w=worldWalkers.find(w=>w.person===who);
   G.metOutside={...(G.metOutside||{}),[questKey(PEOPLE[who].id)]:1};G.worldTalks=null;worldTalk(w);check(rpgBoxes.worldTalk.parts[0].text.includes('pelas bandas da Fronteira'),'e o Sadi pergunta o que ele faz por aquelas bandas');showRpgBox('worldTalk',null);G.day=day0;}
  // Gaudêncio fora do jogo; Casona só com o andar de cima; Dianho com a bandeira da Irlanda do Norte
  {const gi=PEOPLE.findIndex(p=>p.id==='gaudencio');check(!isSpecial(gi)&&!visitorPool().includes(gi)&&!WORLD_MAPS['casa:gaudencio']&&!WORLD_MAPS.serra.spots().some(s=>s.house==='gaudencio'),'o Gaudêncio saiu do jogo (o retrato fica só nas imagens)');}
  check(WORLD_MAPS['casa:marcio'].name==='Casona de Márcio e Marcelo'&&!WORLD_MAPS.casonaTerreo,'a Casona tem só o andar de cima');
  check(WORLD_MAPS['casa:dianho'].items.some(i=>i.ulster),'a casa do Dianho tem a bandeira da Irlanda do Norte');
  // quadros dos amigos
  {const bi=badin;G.friends[bi]=QUADRO_AT-1;addFriendship(bi,2);check(quadroUnlocked(bi),'amizade libera o quadro do especial');toggleQuadro('badin');check(G.quadro==='badin','o quadro vai para a parede');const li=PEOPLE.findIndex(p=>p.id==='lauro');G.friends[li]=QUADRO_AT;toggleQuadro('lauro');check(G.quadro==='lauro','só cabe um quadro: o novo substitui o anterior');}
  check(typeof drawHorse==='undefined'&&typeof ridingHorse==='undefined','o cavalo saiu do jogo');
  // inventário (B) mostra também o que está na bodega; mesa de compota diz o que falta
  closeDialog(true);showBag();check($('dialogContent').textContent.includes('Itens na bodega'),'B mostra o inventário e os itens na bodega');closeDialog(true);
  G.bag={ovo_codorna:{q:13,c:0},conserva_codorna:{q:5,c:0}};conservasMenu();check($('dialogContent').textContent.includes('vidro vazio')&&$('dialogContent').textContent.includes('Pote pronto não é vidro vazio'),'a mesa de compota mostra que falta vidro vazio (pote pronto é outra coisa)');closeDialog(true);
  // horta mais lenta
  {const h=hortaState();h.xp=0;window.NO_SCENES=true;hortaGainXP(HORTA_LEVELS[1].xp-1);check(hortaLevel()===1,'a horta sobe de nível mais devagar');hortaGainXP(1);check(hortaLevel()===2,'e avisa quando sobe');window.NO_SCENES=false;}
  // dormir no caixa antes de abrir
  goInside();G.phase='prep';G.giftQueue=[];G.arcQueue=[];sportState().challenge=null;G.challengeVisit=null;{const d=G.day,rep=G.rep;sleepDay();check(G.day===d+1&&G.phase==='prep'&&G.rep<rep&&modal!=='event','dormir sem abrir passa o dia (a freguesia estranha) e não abre menu de evento');}
  // parreira e vinho de garrafão
  {const h=hortaState();h.tiles[1]={crop:'uva',growth:CROPS.uva.days,water:null,fert:false,dry:0};G.bag={};hortaHarvest(h.tiles[1],{x:0,y:0});check(bagQty('uva')===CROPS.uva.yield,'a parreira dá cachos de uva');
   G.phase='prep';worldOut=null;goInside();bagAdd('garrafao',1);conservasMenu();check($('dialogContent').textContent.includes('Vinho de garrafão'),'a mesa de compota faz vinho de garrafão');makeConserva('vinho');closeDialog(true);
   check(G.up.vinho&&G.stock.vinho===1&&furniture().some(f=>f.id==='shop:vinho')&&!phoneAtacadoHTML().includes('data-id="vinho"'),'o primeiro garrafão libera o vinho no balcão (só sai da roça, não do telefone)');}
  // forno, tacho e compota só fora do expediente
  check(['forno','tacho','conservas'].every(id=>furniture().some(f=>f.id===id)),'antes de abrir: forno, tacho e mesa de compota na cozinha');
  G.phase='open';check(!['forno','tacho','conservas'].some(id=>furniture().some(f=>f.id===id)),'com a bodega aberta, forno, tacho e compota somem');G.phase='prep';
  // mensagens e lembretes flutuantes
  $('floatNotes').replaceChildren();say('Regador vazio: encha no poço.');check($('floatNotes').textContent.includes('Regador vazio')&&!$('toasts').textContent,'as mensagens flutuam no meio da tela, não no canto');
  G.reminders={};G.morning=250;hortaState().tiles[2]={crop:'alface',growth:0,water:null,fert:false,dry:0};reminderTick();check($('floatNotes').textContent.includes('horta está com sede'),'depois das 10h, lembrete flutuante para regar a horta');check(!doorReminder(),'sem o quadro fixo de abrir a bodega');
  // costelão já feito: a missão do Mano Lima não aparece, conclui sozinha
  delete G.missions.costelao;G.costelaoTaught=true;check(missionForGiver('manolima')?.id!=='costelao','com o costelão já feito, o Mano Lima não oferece a missão dele');G.teachQueue=[];G.valterQueue=[];tick(3);talkAll();check(missionDone('costelao'),'e ela conclui sozinha, com a recompensa');
  // eventos de mapa no calendário
  G.tutorial.day=10;G.calOffset=9;check(mapEventFor(15)==='javali'&&calendar(15).name==='Quarta'&&mapEventFor(18)==='fandango'&&calendar(18).name==='Sábado','primeira quarta: invasão de javalis; segundo sábado: fandango no CTG');
  while(scene)sceneSkip();talkAll();G.day=15;G.phase='prep';G.mapEv=null;G.teachQueue=[];G.valterQueue=[];goInside();tick(3);check(scene?.id==='evento-javali','de manhã, uma cena: o Valter entra na bodega e explica a caçada');while(scene)sceneSkip();check(modal==='talk'&&$('dialogContent').textContent.includes('javali'),'depois da cena, o cartão do evento');talkAll();
  calendarDialog();check($('dialogContent').textContent.includes('Invasão de javalis'),'o calendário mostra o evento de mapa');closeDialog(true);
  G.phase='closed';goOutside();check(javaliSpots().length>=JAVALI_NEED&&javaliSpots().every(s=>WORLD_MAPS.vila.canWalk(s.x,s.y)),'de noite, os javalis aparecem pela Fronteira');
  {const sp=javaliSpots()[0];startHunt(Number(sp.id.split(':')[1]));const Lz=G.lasso,b=Lz.bois[0];check(Lz.mode==='javali'&&!activeQueros(Lz).length,'a caçada é a laçada, mas sem quero-quero');
   b.mode='charge';b.x=G.player.x-120;b.y=G.player.y;b.vx=1;b.vy=0;b.left=300;for(let t=0;t<4&&!Lz.hits;t++)lassoTick(.05);check(Lz.hits===1&&Lz.knock>0,'o javali dá cabeçada e joga o Sadi longe');
   Lz.immune=0;for(let r=0;r<JAVALI_HITS;r++){b.rope=r+1;javaliRoped(Lz,b);}for(let t=0;t<40&&G.lasso;t++)lassoTick(.05);check(!G.lasso&&mapEvState('javali').kills===1&&worldOut?.map==='vila','três laços: javali abatido, de volta ao mapa');}
  {const cash=G.cash;for(let k=0;k<JAVALI_NEED-1;k++){const sp=javaliSpots()[0];startHunt(Number(sp.id.split(':')[1]));const Lz=G.lasso,b=Lz.bois[0];for(let r=0;r<JAVALI_HITS;r++){b.rope=r+1;javaliRoped(Lz,b);}for(let t=0;t<40&&G.lasso;t++)lassoTick(.05);}
   check(mapEvState('javali').done&&modal==='talk'&&G.cash>cash,'três javalis: o Valter entrega a recompensa');talkAll();}
  G.day=18;G.phase='prep';G.mapEv=null;goInside();tick(3);check(scene?.id==='evento-fandango','no sábado do fandango, cena: o Jayme entra e chama para o balcão do CTG');while(scene)sceneSkip();check(modal==='talk'&&/fandango/i.test($('dialogContent').textContent),'e o cartão do fandango');talkAll();
  G.phase='closed';G.report={};goOutside();
  {const c=WORLD_MAPS.vila.spots().find(s=>s.id==='ctg');check(/fandango/.test(c.label)&&WORLD_MAPS.vila.canWalk(c.x,c.y)&&VILA.ctg.w>=900,'o CTG, maior, avisa que tem fandango');worldOut.x=c.x;worldOut.y=c.y;interact();
   const f=WORLD_MAPS.ctg.spots().find(s=>s.id==='fandango');check(worldOut.map==='ctg'&&f&&WORLD_MAPS.ctg.canWalk(f.x,f.y),'dentro do CTG, o Jayme chama para o balcão');worldOut.x=f.x;worldOut.y=f.y;interact();talkAll();
   check(serveActive()&&SERVE_EVENTS.fandango.items.join()==='trago,chope'&&serveSpots().some(s=>s.id==='serve:bar:trago')&&serveSpots().some(s=>s.id==='serve:bar:chope')&&serveSpots().filter(s=>s.id.startsWith('serve:bar')).every(s=>WORLD_MAPS.ctg.canWalk(s.x,s.y)),'no fandango, o Sadi serve trago e chope do CTG enquanto o povo dança');
   {const s=G.serve;serveStartPour('chope');check(!$('pourUI').classList.contains('hidden'),'no balcão do CTG, o chope sai da chopeira como na bodega');keys.add('e');outsideTick(1.2);keys.delete('e');outsideTick(.05);
    check(s.hand==='chope'&&s.handPerfect&&$('pourUI').classList.contains('hidden'),'segurar E e soltar na faixa verde: chope no ponto na mão');
    serveStartPour('trago');keys.add('e');outsideTick(2);keys.delete('e');outsideTick(.05);check(s.hand==='chope','com a mão ocupada, não tira outro');
    s.hand=null;serveStartPour('trago');keys.add('e');outsideTick(1.9);keys.delete('e');outsideTick(.05);check(!s.hand&&$('pourUI').classList.contains('hidden'),'passou do ponto: derrama');}
   const stock=JSON.stringify(G.stock);for(let k=0;k<500&&!G.serve.done;k++){outsideTick(.25);const n=G.serve.patrons.findIndex(p=>p.want);if(n>=0){serveTake(G.serve.patrons[n].want);servePatron(n);}}
   check(mapEvState('fandango').done&&modal==='talk'&&$('dialogContent').textContent.includes('servidos')&&JSON.stringify(G.stock)===stock,'acabou o tempo: placar e recompensa, sem gastar o estoque da bodega');talkAll();}
  // Mano Lima: recusar a lição de truco (com o presente já entregue) não deixa ele parado, e o Sadi dorme
  {worldOut=null;G.phase='closed';G.levelStory=LEVELS.length;G.levelSeen=LEVELS.length;G.giftsGiven={...(G.giftsGiven||{}),'manolima:tutorial':1};G.giftQueue=[];G.arcQueue=[];G.challengeVisit=null;
   sportState().challenge={person:PEOPLE.findIndex(p=>p.id==='manolima'),wager:0,tutorial:true,type:'truco'};const d=G.day;sleepDay();
   for(let k=0;k<300&&modal!=='sportChallenge';k++)simulate(.05);check(modal==='sportChallenge'&&$('floatNotes').textContent.includes('chegou na bodega'),'antes de dormir, o Mano Lima chega com o convite (e o jogo avisa)');action('sportDecline');
   for(let k=0;k<400&&G.day===d;k++){simulate(.05);if(modal==='giftVisit')action('giftAccept');}check(G.day===d+1&&!G.challengeVisit,'recusando, ele vai embora e o dia passa');closeDialog(true);}
  // encerrar o expediente com freguês no balcão
  {G.phase='prep';G.event={id:'normal',seen:true,fired:{}};openDay();closeDialog(true);let c=null;for(let k=0;k<20&&!c;k++)c=spawnShop({pid:'cigarro'});for(let k=0;k<300;k++)customersTick(.05);G.hands=[null,null];
   const f=furniture().find(f=>f.id==='service');G.player={x:f.x+f.w/2,y:f.y-20,dx:0,dy:1};interact();check(modal==='caixa'&&$('dialogContent').innerHTML.includes('caixaClose'),'com freguês no balcão e mãos vazias, E abre o caixa');
   action('caixaClose');check(G.phase==='closing','e dá para encerrar o expediente com gente esperando');G.shop=[];G.groups=[];G.phase='prep';}
  // eventos novos: pênaltis, rodeio, Oktoberfest e Festa da Uva (cada um começa com uma cena)
  {G.regions={serra:true,sc:true};G.badinShop=true;G.trophies={};G.relics={};
   const dayOf=id=>{for(let d=G.day;d<G.day+90;d++)if(mapEventFor(d)===id)return d;};
   check(['penalti','oktoberfest','rodeio','uva'].every(dayOf),'pênaltis, Oktoberfest, rodeio e Festa da Uva entram no calendário');
   const night=id=>{G.day=dayOf(id);G.phase='closed';G.mapEv=null;mapEvState(id).intro=true;closeDialog(true);};
   G.day=dayOf('rodeio');G.phase='prep';G.mapEv=null;worldOut=null;closeDialog(true);mapEventsTick();check(scene?.id==='evento-rodeio'&&scene.steps.some(s=>s.say==='guri'),'o rodeio começa com a cena do Guri na bodega');while(scene)sceneSkip();talkAll();
   night('penalti');goOutside();switchMap({map:'serra',x:2760,y:1464});const camp=WORLD_MAPS.serra.spots().find(s=>s.id==='campinho');check(/Campeonato de pênaltis/.test(camp.label),'de noite, o campinho da Serra vira campeonato');camp.act();talkAll();
   for(let r=0;r<3;r++){const m=G.penalties;check(m?.cup?.round===r,'fase '+(r+1)+' do campeonato de pênaltis');m.score=[5,2];m.used=[5,5];m.winner=0;m.phase='over';settlePenalties();leavePenalties();talkAll();}
   check(mapEvState('penalti').won&&G.trophies.penalti,'ganhando as três fases, troféu de pênaltis');
   night('rodeio');switchMap({map:'vila',x:2540,y:2330});const ctg=WORLD_MAPS.vila.spots().find(s=>s.id==='ctg');worldOut.x=ctg.x;worldOut.y=ctg.y;interact();
   const rs=WORLD_MAPS.ctg.spots().find(s=>s.id==='rodeio');check(worldOut.map==='ctg'&&rs&&WORLD_MAPS.ctg.canWalk(rs.x,rs.y),'no CTG, o Guri chama para a prova de laço');worldOut.x=rs.x;worldOut.y=rs.y;interact();talkAll();
   {const Lz=G.lasso,b=Lz.bois[0];check(Lz.mode==='rodeio'&&!activeQueros(Lz).length,'prova de laço: um terneiro, sem quero-quero');for(let k=0;k<RODEO_HITS;k++){Lz.throw={sx:0,sy:0,tx:b.x,ty:b.y-28,time:1,total:.5};lassoTick(.05);for(let t=0;t<10;t++)lassoTick(.05);}
    check(Lz.caught===1&&Lz.doneTime>0,'três laços param o relógio');for(let t=0;t<200&&G.lasso;t++)lassoTick(.05);}
   check(modal==='talk'&&$('dialogContent').querySelector('.score-board')&&G.trophies.rodeio,'placar do rodeio e troféu para o melhor tempo');talkAll();
   night('oktoberfest');switchMap({map:'sc',x:2030,y:700});const ok=WORLD_MAPS.sc.spots().find(s=>s.id==='oktoberfest');worldOut.x=ok.x;worldOut.y=ok.y;interact();
   const os=WORLD_MAPS.oktoberfest.spots().find(s=>s.id==='okto');check(worldOut.map==='oktoberfest'&&os&&WORLD_MAPS.oktoberfest.canWalk(os.x,os.y),'no salão da Oktoberfest, o Loli espera');worldOut.x=os.x;worldOut.y=os.y;interact();talkAll();
   check(serveActive()&&SERVE_EVENTS.oktoberfest.items.join()==='chope','na Oktoberfest, o Sadi serve só chope');
   {const s=G.serve;outsideTick(2);const n=s.patrons.findIndex(p=>p.want);s.hand='trago';servePatron(n);check(s.served===0,'pedido errado não conta');for(let k=0;k<500&&!s.done;k++){outsideTick(.25);const m=s.patrons.findIndex(p=>p.want);if(m>=0){serveTake('chope');servePatron(m);}}}
   talkAll();check(mapEvState('oktoberfest').done&&mapEvState('oktoberfest').served>=SERVE_EVENTS.oktoberfest.target,'Oktoberfest concluída servindo chope');
   night('uva');switchMap({map:'serra',x:1000,y:1000});const sl=WORLD_MAPS.serra.spots().find(s=>s.id==='salao');worldOut.x=sl.x;worldOut.y=sl.y;interact();
   const us=WORLD_MAPS.salao.spots().find(s=>s.id==='uva');check(worldOut.map==='salao'&&us&&WORLD_MAPS.salao.canWalk(us.x,us.y),'no salão da Serra, o Badin organiza o concurso de vinho');
   G.stock.vinho=0;G.bag={};worldOut.x=us.x;worldOut.y=us.y;interact();check(modal==='aviso'||$('dialogTitle').textContent.includes('vinho'),'sem vinho de garrafão não dá para concorrer');closeDialog(true);
   G.up.vinho=true;G.stock.vinho=2;interact();talkAll();for(let k=0;k<3;k++){farmGame.pos=.5;farmGameKey('e');}check(G.stock.vinho===1&&$('dialogContent').querySelector('.score-board')&&G.trophies.uva,'o melhor vinho leva o troféu da Festa da Uva');talkAll();
   // baile de capela: missa na capela e baile no salão, servindo vinho e polenta
   night('capela');switchMap({map:'serra',x:1000,y:1000});const ig=WORLD_MAPS.serra.spots().find(s=>s.id==='igreja');check(/Missa e baile de capela/.test(ig.label),'na noite do baile de capela, a igreja chama para a missa');worldOut.x=ig.x;worldOut.y=ig.y;interact();
   check(scene?.id==='missa'&&scene.steps.some(s=>s.say==='padre'),'primeiro, a cena da missa com o padre');while(scene)sceneSkip();check(worldOut.map==='salao'&&modal==='talk','depois da missa, todo mundo vai pro baile no salão');talkAll();
   check(serveActive()&&SERVE_EVENTS.capela.items.join()==='vinho,polenta','no baile de capela, o Sadi serve vinho e polenta');{const s=G.serve;for(let k=0;k<500&&!s.done;k++){outsideTick(.25);const m=s.patrons.findIndex(p=>p.want);if(m>=0){serveTake(s.patrons[m].want);servePatron(m);}}}talkAll();check(mapEvState('capela').done,'baile de capela concluído');
   // 23h30: casas trancadas e ninguém na rua
   G.phase='closed';G.report={};switchMap({map:'vila',x:1600,y:735});worldWalkersKey='';walkersTick(.1);check(lateNight()&&!worldWalkers.length,'depois das 23h30 ninguém anda na rua');
   {const hv=WORLD_MAPS.vila.spots().find(s=>s.house);worldOut.x=hv.x;worldOut.y=hv.y;check(/trancada/.test(outsideHint()),'a casa aparece trancada');interact();check(worldOut.map==='vila','e não dá para entrar');}
   {const lj=WORLD_MAPS.vila.spots().find(s=>s.id==='agro');worldOut.x=lj.x;worldOut.y=lj.y;check(/fechada/.test(outsideHint()),'a loja aparece fechada depois das 23h30');interact();check(worldOut.map==='vila','e não abre até de manhã');}
   // o guri da vela, raro, na beira do rio
   switchMap({map:'vila',x:700,y:1400});G.phase='closed';G.negrinhoNight=G.day;const ng=negrinhoSpot()[0];check(ng&&WORLD_MAPS.vila.canWalk(ng.x,ng.y),'numa noite rara, uma vela anda na beira do rio');worldOut.x=ng.x;worldOut.y=ng.y;interact();
   check(scene?.id==='negrinho'&&scene.steps.some(s=>s.overlay==='note'),'encontrá-lo abre uma cena sobre o que se perdeu');while(scene)sceneSkip();talkAll();check(G.relics.cuia_vo&&!negrinhoTonight(),'ele entrega a cuia do vô e não aparece mais');
   goInside();G.phase='prep';draw();check(lembrancas().join()==='rodeio,penalti,uva,cuia','troféus e a cuia ficam na prateleira de lembranças da bodega');
   // pesca com E, mais fácil
   goOutside();switchMap({map:'vila',x:470,y:917});G.fish=null;goFishing();talkAll();const st=farmGame?.stages[0];check(st&&st.zone[1]-st.zone[0]>=.25&&st.speed<1&&document.querySelector('#farmGame .touch-only'),'pesca: faixa maior, marcador mais lento e acerto com E');closeDialog(true);worldOut=null;
   // o que se ganha ou colhe já fica liberado no balcão
   G.up.pinhao=false;bagAdd('pinhao',1000);check(unlocked('pinhao'),'pinhão colhido já libera a venda');G.up.salame=false;bagAdd('salame',2);check(unlocked('salame'),'salame ganho do Badin já libera a venda');
   storeShop('gado');check($('dialogContent').innerHTML.includes('icons/bodoque.png'),'a Casa do Campeiro usa o ícone do bodoque');closeDialog(true);}
  // última cerveja: dois fregueses não pedem a mesma, e quem espera um produto que acabou desiste na hora
  {worldOut=null;G.phase='open';G.groups=[];G.stock.cerveja=1;G.hands=[null,null];G.deliveries=[];G.floor=[];G.kitchen.parking=G.kitchen.parking.map(()=>null);G.kitchen.press=null;const mk=()=>({id:G.next++,person:0,size:1,state:'seated',table:G.tables[0].id,x:900,y:600,diners:[{person:0,orders:[],later:['cerveja'],delivered:[],patience:60,maxPatience:60,status:'thinking',think:0}]});
   const a=mk(),b=mk();G.groups.push(a,b);tickDiners(a,.05);tickDiners(b,.05);check(a.diners[0].orders[0]==='cerveja'&&!b.diners[0].orders.length,'com uma cerveja só, o segundo freguês não pede a mesma');
   b.diners[0]={person:0,orders:['cerveja'],later:[],delivered:[],patience:60,maxPatience:60,status:'waiting'};G.stock.cerveja=0;tickDiners(b,.05);check(b.diners[0].status!=='waiting','acabou a cerveja: quem esperava desiste na hora, sem ficar parado');
   b.diners[0]={person:0,orders:['cerveja'],later:[],delivered:[],patience:60,maxPatience:60,status:'waiting'};G.hands[0]={kind:'product',pid:'cerveja',cost:1};tickDiners(b,.05);check(b.diners[0].status==='waiting','com a caneca já tirada na mão, ele espera');G.hands=[null,null];G.groups=[];}
  // freguesia fiel: abrir dias seguidos rende um extra no fechamento
  {G.openStreak=2;G.lastOpenDay=G.day-1;G.openedDay=G.day;G.phase='open';G.elapsed=0;G.shop=[];G.groups=[];finishDay(true);while(scene)sceneSkip();check(G.openStreak===3&&G.report.loyal===15,'freguesia fiel: três dias seguidos abertos, +R$ 15 no fechamento');closeDialog(true);}
  // Mesa de tragos comprada antes do Valter pedir: o capítulo 1 conclui sozinho
  {const before=G.missions,up=G.up.trago,owned=G.upOwned;G.missions={};G.up.trago=false;G.upOwned={};check(currentChapter()?.id==='trago'&&/Mesa de tragos/.test(trackerLines()[0]?.goal||''),'antes do Valter, o canto da tela já diz para comprar a Mesa de tragos');
   G.up.trago=true;G.upOwned={trago:true};worldOut=null;G.phase='prep';closeDialog(true);talkState=null;while(scene)sceneSkip();missionsTick();check(missionDone('trago'),'comprar a Mesa de tragos antes do Valter conclui o capítulo 1');G.missions=before;G.up.trago=up;G.upOwned=owned;closeDialog(true);}
  // ajudantes: depois de uma semana o Valter conta; amigos contratados atendem e recebem salário
  {G.staffUnlocked=false;G.staff={};G.phase='prep';worldOut=null;closeDialog(true);talkState=null;while(scene)sceneSkip();staffIntroTick();
   check(scene?.id==='ajudantes'&&G.staffUnlocked,'depois de uma semana, o Valter conta que dá para contratar ajudantes');while(scene)sceneSkip();talkAll();
   caixaMenu();check($('dialogContent').innerHTML.includes('data-act="staffMenu"'),'no caixa do balcão: Ajudantes');action('staffMenu');
   const gi=PEOPLE.findIndex(p=>p.id==='guri'),li=PEOPLE.findIndex(p=>p.id==='loligebien');G.friends[gi]=10;action('staffHire','balcao:guri');check(!G.staff.balcao,'sem amizade, ninguém topa');
   G.friends[gi]=HIRE_AT;G.friends[li]=HIRE_AT+10;action('staffHire','balcao:guri');action('staffHire','garcom:loligebien');check(G.staff.balcao?.person===gi&&G.staff.garcom?.person===li&&!visitorAvailable(gi),'amigos contratados como balconista e garçom (e não vêm como fregueses)');closeDialog(true);
   G.event={id:'normal',seen:true,fired:{}};G.phase='open';G.elapsed=0;G.shop=[];G.groups=[];G.stock.cigarro=10;let c=null;for(let k=0;k<20&&!c;k++)c=spawnShop({pid:'cigarro'});for(let k=0;k<600&&c.state==='queue';k++)customersTick(.05);
   check(c.state==='leave'&&G.stats.staffServed>=1,'o balconista atende o freguês do balcão sozinho');
   G.stock.cerveja=10;const g={id:G.next++,person:0,size:1,state:'seated',table:G.tables[0].id,x:900,y:600,diners:[{person:0,orders:['cerveja'],later:[],delivered:[],patience:200,maxPatience:200,status:'waiting'}]};G.groups.push(g);const before=G.stock.cerveja;for(let k=0;k<800&&g.diners[0].status==='waiting';k++)customersTick(.05);
   check(g.diners[0].status!=='waiting'&&G.stock.cerveja===before-1,'o garçom tira a cerveja e leva à mesa');G.groups=[];
   G.up.coffee=true;G.up.amendoim=true;G.stock.cafe=10;G.stock.amendoim=10;G.shop=[];let cf=null;for(let k=0;k<20&&!cf;k++)cf=spawnShop({pid:'cafe'});const cafeBefore=G.stock.cafe;for(let k=0;k<900&&cf.state==='queue';k++)customersTick(.05);
   check(cf.state==='leave'&&G.stock.cafe===cafeBefore-1,'o balconista passa o café na cambona e serve no balcão');G.shop=[];
   const table=(orders)=>{const t={id:G.next++,person:0,size:1,state:'seated',table:G.tables[0].id,x:900,y:600,diners:[{person:0,orders,later:[],delivered:[],patience:300,maxPatience:300,status:'waiting'}]};G.groups=[t];return t;};
   const g2=table(['cafe','amendoim']),snack=G.stock.amendoim;for(let k=0;k<1400&&g2.diners[0].status==='waiting';k++)customersTick(.05);
   check(g2.diners[0].status!=='waiting'&&G.stock.amendoim===snack-1,'o garçom leva café e amendoim à mesa');
   for(const k of RECIPES.xis_salada.parts)G.stock[k]=Math.max(G.stock[k]||0,5);const g3=table(['xis_salada','cerveja']),d3=g3.diners[0];for(let k=0;k<900&&!d3.delivered.some(i=>i.pid==='cerveja');k++)customersTick(.05);
   check(d3.orders.join()==='xis_salada'&&d3.delivered.some(i=>i.pid==='cerveja')&&d3.status==='waiting','o garçom leva a cerveja e deixa o xis para o Sadi');G.groups=[];
   G.openedDay=G.day;G.phase='open';G.shop=[];finishDay(true);while(scene)sceneSkip();check(G.report.wages===staffWages()&&G.report.wages>0&&G.staff.balcao.days===1,'o salário sai no fechamento e conta um dia de casa');closeDialog(true);
   action('staffMenu');action('staffFire','garcom');check(!G.staff.garcom&&visitorAvailable(li),'dispensado, volta a ser freguês');closeDialog(true);G.staff={};}
  // história do vô: gaita, baú, carta e o último trago
  check(storyChapters().map(m=>m.id).slice(-4).join()==='gaita,bau,carta,lendaria'&&MISSIONS.find(m=>m.id==='lendaria').chapter===11,'a história do vô fecha o jogo: gaita, baú, carta e a bodega lendária');
  {const before=G.missions,vo=G.vo,upTo=n=>Object.fromEntries(storyChapters().filter(m=>m.chapter<n).map(m=>[m.id,{status:'done',day:1}]));G.missions={...before,...upTo(8),gaita:{status:'active',day:G.day}};G.vo={};check(/Valter/.test(gaitaGoal())&&storyNeeds('valter'),'capítulo 8: a gaita está com o Valter');G.vo.gaita='found';check(/Pomerode/.test(gaitaGoal())&&storyNeeds('loligebien'),'depois vai pro Seu Otto, o avô do Loli, em Pomerode');
   G.missions={...before,...upTo(9),bau:{status:'active',day:G.day}};worldOut=null;goOutside();switchMap({map:'vila',x:2330,y:1860});const pz=WORLD_MAPS.vila.spots().find(s=>s.id==='pouso');check(pz.label==='Abrir o baú do vô','capítulo 9: o baú fica no Pouso de tropeiros');worldOut.x=pz.x;worldOut.y=pz.y;interact();check(scene?.id==='bau'&&scene.steps.some(s=>s.overlay==='photo'),'no baú, a foto da bodega em 1968 e a carta');while(scene)sceneSkip();check(G.vo.bau&&G.relics.foto1968,'a foto vai pra estante');
   G.missions=before;G.voDream=true;G.phase='closed';G.report={};goInside();closeDialog(true);talkState=null;G.mapEv={day:G.day,id:mapEventFor(),intro:true};storyTick();check(scene?.id==='ultimoTrago'&&scene.steps.some(s=>s.say==='vo'),'no fim, o sonho com o vô: o último trago');while(scene)sceneSkip();talkAll();G.missions=before;G.vo=vo;}
  // folclore à noite: lobisomem nas sextas, Sanguanel na Serra, Boitatá no banhado
  {check(Object.keys(FOLK).join()==='lobisomem,sanguanel,boitata,mula','quatro entidades do folclore');G.folk={};G.folkNight={day:G.day,id:'boitata'};G.phase='closed';G.report={};G.mapEv=null;while(mapEventFor(G.day))G.day++;G.folkNight.day=G.day;worldOut=null;goOutside();switchMap({map:'vila',x:1600,y:735});
   const sp=folkSpots('vila')[0];check(sp&&WORLD_MAPS.vila.canWalk(sp.x,sp.y),'de noite, uma luz no banhado');worldOut.x=sp.x;worldOut.y=sp.y;interact();check(scene?.id==='folk-boitata','chegando perto, a cena do Boitatá');while(scene)sceneSkip();
   check(modal==='farmGame','e o confronto');let n=0;while(farmGame&&n++<80){const st=farmStage();if(st.kind==='alternate')farmGameKey(n%2?'a':'d');else{farmGame.pos=(st.zone[0]+st.zone[1])/2;farmGameKey('e');}}
   check(G.relics.escama&&G.boitataBless===G.day+1&&!folkSpots('vila').length,'vencendo: a escama vai pra estante e a horta amanhece sem praga');talkAll();
   G.folk={};G.folkNight={day:G.day,id:'sanguanel'};switchMap({map:'serra',x:1600,y:735});const sg=folkSpots('serra')[0];worldOut.x=sg.x;worldOut.y=sg.y;interact();while(scene)sceneSkip();check(modal==='folkQuiz','o Sanguanel desafia com adivinhas');
   action('folkAnswer','0');action('folkAnswer','1');action('folkAnswer','2');check(G.relics.fita,'acertando, ele devolve o chapéu e deixa a fita');talkAll();G.folkNight=null;worldOut=null;}
  // mula sem cabeça nas quintas, perto da igreja da Serra
  {G.folk={};G.folkNight={day:G.day,id:'mula'};G.phase='closed';worldOut=null;goOutside();switchMap({map:'serra',x:1600,y:735});const sp=folkSpots('serra')[0];check(sp&&WORLD_MAPS.serra.canWalk(sp.x,sp.y)&&/igreja/.test(sp.label),'de noite, um tropel perto da igreja');
   worldOut.x=sp.x;worldOut.y=sp.y;interact();check(scene?.id==='folk-mula','a cena da Mula sem Cabeça');while(scene)sceneSkip();check(modal==='farmGame','e o confronto');let n=0;while(farmGame&&n++<80){const st=farmStage();if(st.kind==='alternate')farmGameKey(n%2?'a':'d');else{farmGame.pos=(st.zone[0]+st.zone[1])/2;farmGameKey('e');}}
   check(G.relics.freio&&lembrancas().includes('freio')&&!folkSpots('serra').length,'tirando o freio, o encanto quebra e o freio vai pra estante');talkAll();G.folkNight=null;worldOut=null;}
  // 20 de Setembro: o sábado da semana de setembro, acampamento na Fronteira e a história contada pelo Valter
  {const day=G.day,cal=G.calOffset;G.calOffset=0;const d=[...Array(140).keys()].find(k=>mapEventFor(k)==='farroupilha');check(d&&calendar(d).month===8&&calendar(d).weekday===5,'o 20 de Setembro cai no sábado da semana de setembro');
   G.day=d;G.phase='closed';G.report={};G.mapEv={day:G.day,id:'farroupilha',intro:true};worldOut=null;goOutside();switchMap({map:'vila',x:1500,y:1900});const ac=WORLD_MAPS.vila.spots().find(s=>s.id==='acampamento');check(ac&&WORLD_MAPS.vila.canWalk(ac.x,ac.y),'de noite, o acampamento farroupilha na Fronteira');
   worldOut.x=ac.x;worldOut.y=ac.y;interact();check(scene?.id==='farroupilha'&&scene.steps.some(s=>s.say==='valter'&&/1835/.test(s.text))&&scene.steps.some(s=>/Viva o 20 de Setembro/.test(s.text||'')),'o Valter conta a história e todo mundo comemora');while(scene)sceneSkip();
   check(mapEvState('farroupilha').done&&modal==='talk','comemorado, com recompensa');talkAll();G.day=day;G.calOffset=cal;G.mapEv=null;worldOut=null;}
  // festa na laje da Casona: só especiais, chope na chopeira enquanto os gêmeos assam
  {const day=G.day,cal=G.calOffset;G.calOffset=0;const d=[...Array(60).keys()].find(k=>mapEventFor(k)==='casona');check(d,'a festa na laje está no calendário');G.day=d;G.phase='closed';G.report={};G.mapEv={day:G.day,id:'casona',intro:true};G.serve=null;
   worldOut=null;goOutside();switchMap({map:'serra',x:2300,y:900});const hc=WORLD_MAPS.serra.spots().find(s=>s.id==='house:marcio');check(/laje/.test(hc.label)&&!hc.house,'de noite, a Casona leva pra laje');worldOut.x=hc.x;worldOut.y=hc.y;interact();check(worldOut.map==='casona:laje','embaixo da Casona: a laje');
   const M=WORLD_MAPS['casona:laje'];check(M.items.filter(i=>i.kind==='table').length===1&&M.items.some(i=>i.kind==='grill'),'só uma churrasqueira e uma mesa');const hm=M.spots().find(s=>s.id==='casona');worldOut.x=hm.x;worldOut.y=hm.y;interact();talkAll();
   check(serveActive()&&G.serve.patrons.every(p=>isSpecial(p.person)&&!['marcio','marcelo'].includes(PEOPLE[p.person].id)),'só convidados especiais, os gêmeos na churrasqueira');check(serveBar(SERVE_EVENTS.casona).map(b=>b.item).join()==='chope'&&SERVE_EVENTS.casona.seats.every(([x,y])=>M.canWalk(x,y)),'só chope, e todo mundo em lugar que dá pra chegar');
   G.serve=null;G.day=day;G.calOffset=cal;G.mapEv=null;worldOut=null;}
  // save em arquivo: baixar e carregar de volta
  {save();const raw=localStorage.getItem(saveKey(saveMode())),cash=G.cash;let dl=null;const click=HTMLAnchorElement.prototype.click;HTMLAnchorElement.prototype.click=function(){dl=this.download;};exportSave();HTMLAnchorElement.prototype.click=click;check(/^bodega-do-sadi-dia-\d+\.json$/.test(dl||''),'baixa o jogo num arquivo');
   const alertBefore=window.alert;window.alert=()=>{};check(loadSaveText('{"nada":1}')===false,'arquivo estranho é recusado');window.alert=alertBefore;G.cash=1;save();check(loadSaveText(raw)===true&&G.cash===cash,'carregando o arquivo, o jogo volta como estava');}
  check(!JSON.stringify(PEOPLE).includes('Boleador')&&GIFTS.lauro.some(g=>/Bolador/.test(g.text+JSON.stringify(DECOR)))||!JSON.stringify(DECOR).includes('Boleador'),'Lauro Bolador (não mais Boleador)');
 }finally{window.confirm=confirmBefore;window.NO_SCENES=scenesBefore;window.difficulty=difficultyBefore;if(phoneOpen)togglePhone(false);if(farmGame)cancelFarmGame();closeDialog(true);worldOut=null;}
 return results;
})()
