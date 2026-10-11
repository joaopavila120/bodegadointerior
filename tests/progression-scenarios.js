// Nível, metas, economia, fiado, especiais raros, calendário e noite.
(() => {
 const results=[],check=(v,m)=>{if(!v)throw Error(m);results.push(m);};
 const random=Math.random;
 const reset=()=>{G=fresh();G.day=2;G.tutorial.guided=false;G.tutorial.complete=true;G.cash=500;G.rep=100;started=true;paused=false;modal=null;phoneOpen=false;AudioEngine.on=false;keys.clear();bannerQueue=[];clearTimeout(bannerTimer);bannerTimer=null;['start','overlay','phone'].forEach(id=>$(id).classList.add('hidden'));};
 const index=id=>PEOPLE.findIndex(p=>p.id===id);
 const shown=text=>$('banner').textContent.includes(text)||bannerQueue.some(b=>b.title.includes(text));
 try{
  // Nível e melhorias
  reset();check(bodegaLevel()===1&&levelInfo().name==='Bodega de esquina','bodega começa no nível 1');
  const cash=G.cash;buyUpgrade('coffee');check(!G.up.coffee&&G.cash===cash,'melhoria de nível 2 bloqueada no nível 1');
  gainXP(300);progressCheck();check(bodegaLevel()===2&&G.levelSeen===2&&shown('Bodega do bairro'),'subir de nível anuncia na tela');
  buyUpgrade('coffee');check(G.up.coffee,'nível 2 libera a cafeteira');
  check(creditLimit(1)<creditLimit(7),'limite do fiado cresce com o nível');

  // Despesas e validade
  reset();G.phase='open';G.elapsed=DAY;G.stock.salada=12;const before=G.cash;finishDay();closeDialog(true);
  check(G.report.rent===0&&G.report.power>=6&&G.stock.salada===12,'fim do dia cobra só a luz (sem aluguel: o galpão é herança); o estoque não vence');
  check(G.cash<=before-G.report.power+.01,'despesas saem do caixa');
  reset();G.rep=60;G.phase='open';G.elapsed=DAY*.3;openDay();check(G.rep<54&&G.phase==='closing','fechar as portas cedo derruba a reputação');
  reset();G.rep=60;pay([{pid:'cerveja',key:'cerveja',cost:1}],0,.9);const up=G.rep-60;G.rep=60;repChange(-2.5);check(up>0&&up<1&&G.rep===57.5,'atender bem sobe devagar; cliente que desiste pesa bem mais');
  reset();G.rep=60;settleSport('bocha',{opponent:PEOPLE.findIndex(p=>p.id==='lauro')},false);check(G.rep<60,'perder na bocha também tira reputação');
  reset();G.rep=100;const fast=arrivalInterval('shop');G.rep=20;check(fast<arrivalInterval('shop')&&repTips()<1,'reputação alta traz mais gente; baixa espanta e reduz gorjeta');
  reset();G.day=1;G.phase='open';G.elapsed=DAY;finishDay();closeDialog(true);check(G.report.rent===0,'primeiro dia sem aluguel');

  // Conquistas
  reset();G.totalServed=100;checkAchievements();check(G.achievements.freguesia&&G.xp>=120,'conquista concede XP');
  checkAchievements();check(Object.keys(G.achievements).length===1||G.achievements.freguesia===2,'conquista não se repete');
  gameGuide();check($('dialogContent').textContent.includes('Freguesia fiel')&&$('dialogContent').textContent.includes('Bodega lendária'),'guia mostra metas e níveis');closeDialog(true);

  // Personagens especiais raros
  reset();G.phase='open';let specials=0;for(let i=0;i<2000;i++)if(isSpecial(pickVisitor()))specials++;
  check(specials>80&&specials<400,'especiais são raros entre os visitantes ('+specials+'/2000)');
  reset();G.phase='open';const badinIdx=index('badin');G.friends[badinIdx]=100;let withFriend=0,badinVisits=0;for(let i=0;i<2000;i++){const v=pickVisitor();if(isSpecial(v))withFriend++;if(v===badinIdx)badinVisits++;}
  check(withFriend>specials&&specialChance()>SPECIAL_CHANCE&&badinVisits>withFriend/6,'amizade faz o especial aparecer mais seguido ('+withFriend+' especiais, '+badinVisits+' do Badin)');
  reset();G.phase='open';G.elapsed=DAY*.3;const daily=pickVisitor();check(isSpecial(daily)&&!G.metSpecial?.[PEOPLE[daily].id],'todo dia entra um personagem especial que ainda não veio');announceArrivals([daily]);check(G.dailySpecialDay===G.day&&[...Array(50)].every(()=>dailySpecial()===null),'depois da visita do dia, os especiais voltam a ser raros');
  reset();G.phase='open';const mano=index('manolima');  const c=(()=>{const original=pickVisitor;pickVisitor=()=>mano;try{return spawnShop();}finally{pickVisitor=original;}})();
  check(c&&G.metSpecial.manolima===2&&shown('Mano Lima entrou na bodega'),'primeira visita de especial mostra aviso em destaque');
  // Afeto só com especiais; contato com 15
  reset();deliveryConversation(0,{});check(!G.friends[0],'fregueses comuns não somam afeto');
  G.friends[index('badin')]=15;socialCheck();check(hasContact(index('badin'))&&contactPeople().includes(index('badin')),'com 15 de afeto o especial vira contato');
  G.friends[index('badin')]=50;socialCheck();const chapeu=G.giftQueue.find(g=>g.key==='badin:50');check(chapeu&&!decorState().chapeu,'com 50 de afeto o presente fica para a visita');deliverGift(chapeu);check(decorState().chapeu===true&&G.giftsGiven['badin:50'],'com 50 de afeto chega um presente');
  const giftCash=G.cash;G.giftsGiven={};G.giftQueue=[];socialCheck();deliverGift(G.giftQueue.find(g=>g.key==='badin:50'));check(G.cash===giftCash+DECOR.find(d=>d.id==='chapeu').cost,'presente repetido de peça já comprada vira dinheiro');
  phoneOpen=true;phoneTab='contacts';renderPhone();check(document.querySelector('[data-act="invite"]')&&$('phoneContent').textContent.includes('???'),'contatos mostram convites e escondem quem não apareceu');phoneOpen=false;
  reset();G.up.bergamota=true;const random0=Math.random;Math.random=()=>.2;queueGift(index('lauro'),{at:25});Math.random=random0;const goods=G.giftQueue[0];check(goods?.goods&&goods.goods.qty>0,'presentes também são mercadorias: '+goods?.goods?.name);const before0=G.stock[goods.goods.key];deliverGift(goods);check(G.stock[goods.goods.key]===before0+goods.goods.qty,'mercadoria presenteada entra no estoque');
  check(giftGoodsOptions().some(g=>g.key==='bergamota')&&(G.up.bergamota=false,!giftGoodsOptions().some(g=>g.key==='bergamota')),'bergamota do pé só com a melhoria da bergamota');
  reset();G.day=4;G.phase='closed';G.giftQueue=[];prepareAfterHours();check(sportState().challenge?.type==='truco'&&PEOPLE[sportState().challenge.person].id==='manolima','na primeira segunda o Mano Lima vem ensinar truco');answerSportChallenge(false);check(G.giftQueue.some(g=>g.key==='manolima:tutorial'),'mesmo sem a lição, o Mano Lima deixa a bandeira');
  G.phase='closed';G.report={};nextDay();check(G.challengeVisit?.kind==='gift'&&!modal,'o presente chega em pessoa ao encerrar o dia');for(let n=0;n<600&&!G.challengeVisit?.arrived;n++)challengeVisitTick(.05);
  check(modal==='giftVisit'&&$('dialogContent').textContent.includes('Bandeira'),'quem presenteia caminha até você e mostra o presente');action('giftAccept');check(decorState().bandeira===true&&!G.giftQueue.length,'presente recebido');G.challengeVisit=null;

  // Fiado
  reset();G.phase='open';Math.random=()=>.05;const debtor=index('rosa');const original=pickVisitor;pickVisitor=()=>debtor;const f=spawnShop({pid:'codorna'});pickVisitor=original;Math.random=random;
  check(f.fiado,'freguês comum pode pedir fiado');
  for(let n=0;n<300;n++)customersTick(.05);readyProduct('codorna');const fiadoCash=G.cash;serveShop(f);
  check(G.cash===fiadoCash&&fiadoOpen().length===1&&fiadoTotal()===price('codorna'),'entrega fiado anota no caderninho sem entrar dinheiro');
  phoneOpen=true;phoneTab='fiado';renderPhone();check($('phoneContent').textContent.includes(PEOPLE[debtor].name)&&document.querySelector('[data-act="fiadoCharge"]'),'aba Fiado lista as contas');phoneOpen=false;
  G.day=fiadoOpen()[0].due;Math.random=()=>0;const paidCash=G.cash;processFiado();Math.random=random;
  check(!fiadoOpen().length&&G.cash>paidCash+price('codorna')&&G.fiadoPaid===1,'conta vencida paga com juros de amizade');
  reset();G.fiado=[{id:1,person:0,amount:10,day:2,due:3,status:'open',charged:0}];G.day=9;{let n=0;Math.random=()=>n++%2?0:.99;}processFiado();Math.random=random;check(G.fiado[0].status==='lost'&&G.stats.fiadoLost===10,'conta muito atrasada pode virar calote');
  reset();G.phase='open';Math.random=()=>.05;pickVisitor=()=>index('rosa');const r=spawnShop({pid:'codorna'});pickVisitor=original;for(let n=0;n<300;n++)customersTick(.05);Math.random=()=>.1;refuseFiado();Math.random=random;check(!r.fiado&&r.state==='queue','recusar o fiado pode fazer o freguês pagar à vista');

  // Pedidos das mesas saem um por vez
  reset();G.day=8;G.phase='open';Math.random=()=>.3;const table=spawnGroup({size:3});Math.random=random;for(let n=0;n<600&&table.state!=='seated';n++)customersTick(.05);
  check(table.state==='seated'&&table.diners.every(d=>d.orders.length<=1),'cada pessoa pede no máximo um item por vez');
  check(table.diners.filter(d=>d.status==='waiting').length===1&&table.diners.slice(1).every(d=>d.status==='thinking'),'os outros da mesa pensam antes do primeiro pedido');
  for(let n=0;n<200;n++)customersTick(.05);check(table.diners.every(d=>d.status==='waiting'),'depois de alguns segundos todos pedem');
  const first=table.diners[0];first.later=['refri'];const item=first.orders[0];G.hands[G.slot]={kind:'product',pid:item,key:item,cost:1,ready:true};deliverToDiner(table,held(),G.tables[table.table]);
  check(first.status==='thinking'&&!first.orders.length,'o próximo item só sai depois da entrega anterior');
  for(let n=0;n<340;n++)customersTick(.05);check(first.status==='waiting'&&first.orders.join()==='refri','depois de um tempo a pessoa pede o próximo item');
  G.phase='closing';first.status='thinking';first.later=['cerveja'];customersTick(.05);check(first.status==='served'&&!first.later.length,'com as portas fechadas ninguém faz pedido novo');
  // Ícones das melhorias e placa do fiado
  check(UPGRADES.every(u=>upgradeIconHTML(u.id).includes('upgrade-icon')),'toda melhoria tem ícone');
  reset();check(fiadoChance()===.18,'sem placa, 18% pedem fiado');G.xp=99999;G.levelSeen=7;G.cash=500;buyUpgrade('placaFiado');check(G.up.placaFiado&&fiadoChance()===.04,'placa Fiado só amanhã derruba os pedidos de fiado');
  storeShop('ferragem');{const html=$('dialogContent').innerHTML;check($('dialogContent').querySelectorAll('.upgrade-icon').length>=UPGRADES.filter(u=>!u.shop&&!FERRAGEM_SKIP.includes(u.id)).length&&html.includes('Fiado só amanhã')&&html.includes('data-act="upgradeToggle"'),'a Ferragem mostra as melhorias com ícones e guarda os móveis (a placa do fiado)');}closeDialog(true);
  storeShop('ferragem');check($('dialogContent').innerHTML.includes('data-act="upgrade"')&&$('dialogContent').textContent.includes('Mesa de tragos'),'a Ferragem da Fronteira vende as melhorias');closeDialog(true);
  // Calendário e eventos
  check(calendar(1).name==='Sexta'&&fixedEventFor(2)==='normal'&&fixedEventFor(3)==='costelao'&&fixedEventFor(6)==='grenal'&&!EVENTS.truco&&!EVENTS.motos&&!EVENTS.rodeio&&fixedEventFor(10)==='costelao'&&!EVENTS.farroupilha&&!EVENTS.junina&&nameOf('cachaca')==='Dose de cachaça','calendário tem Gre-Nal, truco e rodeio; sem Farroupilha, junina ou quentão');
  // Modo de testes escolhe o evento
  reset();G.testMode=true;G.phase='closed';planDay();check($('testEvent'),'modo de testes mostra a escolha de evento');$('testEvent').value='feira';action('chooseTestEvent');check(plannedEvent().id==='feira','modo de testes define o evento do próximo dia');closeDialog(true);
  {const before=G,confirmBefore=window.confirm;window.confirm=()=>true;localStorage.removeItem(TEST2_KEY);startGame(true,'eventos');G.day=7;save();action('testNew','eventos');check(G.eventMode&&G.day===1,'botão Novo recomeça o modo sem tutorial do zero');
   check(G.eventMode&&!G.testMode&&!tutorialActive()&&!scene&&modal==='event'&&!hasCash(G.cash+1),'testes sem tutorial: começa direto, sem dinheiro infinito');
   closeDialog(true);G.phase='closed';planDay();check($('testEvent'),'testes sem tutorial também escolhem o evento do dia');save();check(localStorage.getItem(TEST2_KEY)&&readSave('eventos')?.eventMode&&!readSave('eventos').testMode,'progresso separado dos outros modos');
   closeDialog(true);localStorage.removeItem(TEST2_KEY);window.confirm=confirmBefore;started=true;G=before;}
  {const before=G;const old=fresh();old.testMode=true;old.rep=100;old.xp=99999;old.friends=old.friends.map(()=>100);localStorage.setItem(TEST_KEY,JSON.stringify(old));startGame(false,true);check(G.testMode&&G.day===1&&G.testRules===TEST_RULES&&!tutorialActive()&&modal==='event','save antigo do modo dinheiro infinito recomeça, sem tutorial');
   check(G.rep===100&&bodegaLevel()===LEVELS.length&&PEOPLE.every((p,i)=>!isSpecial(i)||G.friends[i]===MAX_FRIENDSHIP&&hasContact(i))&&!G.giftQueue.length,'modo dinheiro infinito: nível, reputação e amizade no máximo, sem fila de presentes');
   G.day=4;save();startGame(false,true);check(G.day===4,'save atual do modo dinheiro infinito continua normalmente');closeDialog(true);localStorage.removeItem(TEST_KEY);started=true;G=before;}
  reset();G.testMode=true;G.phase='closed';G.herd=0;planDay();check([...$('testEvent').options].some(o=>o.value==='lasso'),'seleção de eventos tem a laçada');$('testEvent').value='lasso';action('chooseTestEvent');check(G.lasso&&G.herd===1&&!modal,'modo de testes leva direto à laçada de gado');G.lasso=null;$('lassoUI').classList.add('hidden');
  reset();G.phase='closed';planDay();check(!$('testEvent'),'partida normal não escolhe evento');closeDialog(true);

  // Noite
  reset();G.phase='open';G.elapsed=0;check(nightLevel()===0,'tarde sem escuridão');G.elapsed=DAY;check(nightLevel()===1&&gameTimeText()==='23:00','às 23h é noite fechada');
  G.decor.lampiao_esq=true;draw();check(litLamps()===1,'lampião exposto acende à noite');
  // Cavalo removido
  check(!GEAR.horse&&!UPGRADES.some(u=>u.id==='horse')&&typeof horseArt==='undefined','cavalo removido do jogo');
 }finally{Math.random=random;reset();}
 return results;
})()
