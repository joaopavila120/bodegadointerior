// Prólogo da roça (jogo novo): erva do vô, horta, forno, campo e curral, laço com carne automática, queijo, compras, compota e o desafiante na cancha.
(() => {
 const results=[],check=(ok,text)=>{if(!ok)throw Error(text);results.push(text);};
 const confirmBefore=window.confirm,scenesBefore=window.NO_SCENES;
 try{
  window.confirm=()=>true;window.NO_SCENES=false;localStorage.removeItem(KEY);
  action('new');check(scene?.id==='intro','jogo novo começa pela abertura');
  check(SCENES.intro().some(s=>s.say==='valter'&&/boi/.test(s.text))&&!SCENES.intro().some(s=>s.say==='fornecedor'),'na abertura o Valter propõe a roça e dá o boi; não há mais ligação do atacado');
  sceneSkip();
  check(prologueActive()&&G.prologue.step===0&&modal==='tutorial','depois da abertura começa o prólogo, com o primeiro objetivo');
  check(G.stock.pao_xis===0&&G.stock.burger===0&&G.stock.queijo===0&&G.stock.erva===0&&G.stock.codorna===0,'bodega vazia: nem erva nem conserva, tudo sai da roça');
  check(hortaState().trees[0]?.crop==='erva'&&cellReady(hortaState().trees[0]),'na horta já tem o pé de erva-mate do vô, pronto para colher');
  check(G.herd===1&&ranchState().cows===1&&ranchState().hens>=2&&ranchState().quails===2,'no curral: o boi do Valter, a vaca de leite, as galinhas e as duas codornas');
  check(JSON.stringify(G.missions)==='{}'&&G.regions?.serra===false&&G.regions?.sc===false,'jogo novo: missões vazias e só a Fronteira aberta');
  check(!tutorialActive()&&!morningActive(),'durante o prólogo não há tutorial da bodega nem relógio da manhã');
  closeDialog();
  const tick=n=>{for(let i=0;i<n;i++)simulate(.05);};
  const talk=()=>{let k=0;while(modal==='talk'&&k++<30)talkNext();};
  const step=()=>PROLOGUE_STEPS[G.prologue.step]?.id;
  openDay();check(G.phase==='prep','a bodega não abre antes de a prateleira encher');
  goOutside();check(worldOut?.map==='vila','a porta da bodega leva direto ao pátio');
  enterInterior('gado');check(worldOut.map==='vila','a Casa do Campeiro fica fechada durante o tutorial');
  houseVisit('valter');check(worldOut.map==='vila','as casas ficam fechadas durante o tutorial');
  worldOut.x=VILA.W-25;worldOut.y=VILA.roadY+40;keys.add('d');simulate(.1);keys.clear();check(worldOut.map==='vila','não dá para trocar de mapa durante o tutorial');
  check(worldWalkers.length===0,'os personagens especiais ainda não aparecem nas ruas');
  check(!WORLD_MAPS.vila.spots().some(s=>/^(secret|forage):/.test(s.id)),'relíquias e frutas do mato só aparecem depois do prólogo');
  worldOut.x=1600;worldOut.y=700;check(!!worldGuidePoint(),'a seta guia aponta o caminho do objetivo');
  enterInterior('agro');check(worldOut.map==='agro','o Armazém Querência abre para comprar sementes');
  hortaDo('seed:alface');hortaDo('seed:trigo');closeDialog(true);tick(2);check(modal==='talk','sementes compradas: o Valter explica o próximo passo');talk();check(step()==='erva','depois das sementes, colher a erva do vô');
  switchMap({map:'vila',...front(VILA.agro)});const hs=hortaSpots()[0];worldOut.x=hs.x;worldOut.y=hs.y;interact();check(worldOut.map==='horta','a horta, do lado da bodega, abre no passo da erva');
  check(!!worldGuidePoint(),'dentro da horta a seta aponta o pé de erva-mate');
  const pit=GARDEN.pits[0];worldOut.x=pit.x;worldOut.y=pit.y+60;worldOut.dx=0;worldOut.dy=-1;interact();
  check(G.stock.erva===2000&&prologueFlagSet('erva'),'colhida a erva-mate: 2 kg no inventário');
  tick(2);talk();check(step()==='plantar','depois da erva, plantar');
  const h=hortaState(),at=(c,r)=>{worldOut.x=GARDEN.gx+c*GARDEN.ts+GARDEN.ts/2;worldOut.y=GARDEN.gy+(r+1)*GARDEN.ts+30;worldOut.dx=0;worldOut.dy=-1;};
  hortaSelectTool(hortaTools().findIndex(t=>t.id==='alface'));at(0,0);interact();at(1,0);interact();
  hortaSelectTool(hortaTools().findIndex(t=>t.id==='trigo'));at(2,0);interact();at(3,0);interact();
  tick(2);talk();check(step()==='regar','plantou dois canteiros de cada: agora regar');
  hortaSelectTool(1);for(let c=0;c<4;c++){at(c,0);interact();}
  const day=G.day;tick(2);talk();check(scene?.id==='pulo'&&G.day===day+3,'regado tudo: o jogo pula três dias');sceneSkip();
  check(h.tiles.slice(0,4).every(cellReady)&&ranchState().nests.ovo>0&&ranchState().nests.ovo_codorna>0,'três dias depois: a horta está pronta e os ninhos com ovos e ovinhos');talk();check(step()==='colher','depois do pulo, colher');
  for(let c=0;c<4;c++){at(c,0);interact();}
  check(bagQty('trigo')===6&&G.stock.salada===8,'a colheita vai para o inventário (a alface já vira salada)');tick(2);talk();check(step()==='pao','colhido: o pão no forno a lenha');
  goInside();check(G.stock.salada===8&&G.stock.erva===2000&&bagQty('trigo')===6,'na bodega a alface vira salada, a erva vai para o balcão e o trigo fica para o forno');
  check(prologueBodegaTarget()==='forno','a seta da cozinha aponta o forno');
  const near=id=>{const f=furniture().find(f=>f.id===id);G.player={x:f.x+f.w/2,y:f.y-20,dx:0,dy:1};return nearest()?.id;};
  check(near('forno')==='forno','dá para chegar ao forno a lenha');interact();check(modal==='farmGame'&&farmGame.stages.length===1&&farmStage().kind==='alternate','o forno é só sovar a massa, sem segunda etapa');
  for(let i=0;i<80&&farmGame;i++)farmGameKey(i%2?'d':'a');check(G.stock.pao_xis===FORNO.paes&&bagQty('trigo')===3&&!modal,'sovada a massa: 3 trigo viram 8 pães de xis');
  tick(2);talk();check(step()==='laco','depois do pão, laçar o boi');
  goOutside();const cp=WORLD_MAPS.vila.spots().find(s=>s.id==='campo');worldOut.x=cp.x;worldOut.y=cp.y;interact();check(worldOut.map==='curral','a entrada do campo leva ao campo com o curral');
  const spot=id=>WORLD_MAPS.curral.spots().find(s=>s.id===id),go=id=>{const s=spot(id);worldOut.x=s.x;worldOut.y=s.y;interact();};
  check(['cerca','fogo','cocho','ninhos','codorneira','vaca'].every(id=>WORLD_MAPS.curral.canWalk(spot(id).x,spot(id).y)),'dá para chegar na cerca, no fogo, no cocho, nos ninhos, na codorneira e na vaca');
  check(/^Laçar/.test(spot('cerca').label),'na cerca do boi aparece a opção Laçar');
  go('cerca');check(!!G.lasso,'na cerca se laça a qualquer hora');G.lasso.caught=G.lasso.need;finishLasso();
  check(!G.lasso&&G.herd===0&&modal!=='farmGame','boi laçado: sem minigame de carnear');
  check(G.stock.costela_crua===MANTAS_PER_BOI&&G.stock.burger===24&&worldOut.map==='curral','o boi vira na hora mantas de costela e 24 hambúrgueres no inventário');
  check(modal==='talk'&&$('dialogContent').innerHTML.includes('reward-card'),'a carne aparece num cartão de recompensa');
  talk();tick(2);talk();check(step()==='curral'&&bagQty('racao')===2,'o Valter deixa ração e manda cuidar do curral');
  go('cocho');go('ninhos');go('codorneira');check(ranchState().fedDay===G.day&&G.stock.ovo>0&&bagQty('ovo_codorna')>0,'ração no cocho, ovos dos ninhos e ovinhos da codorneira');
  go('vaca');check(modal==='farmGame'&&farmGame.stages.length===1,'ordenhar é alternar as mãos');for(let i=0;i<80&&farmGame;i++)farmGameKey(i%2?'d':'a');check(bagQty('leite')===8&&ranchState().milkedDay===G.day,'vaca tratada dá 8 litros de leite');
  go('vaca');check(bagQty('leite')===8&&modal!=='farmGame','a vaca só é ordenhada uma vez por dia');
  tick(2);talk();check(step()==='queijo','depois do curral, o queijo no tacho');
  {bagTake('leite',bagQty('leite'));tick(2);check(bagQty('leite')>=TACHO.leite,'faltou leite no passo do queijo: o Valter repõe e o tutorial não trava');bagAdd('leite',8-bagQty('leite'));}
  const ex=WORLD_MAPS.curral.spawn();worldOut.x=ex.x;worldOut.y=RANCH.H-20;keys.add('s');simulate(.1);keys.clear();check(worldOut.map==='vila','a porteira do campo volta para a Fronteira');
  goInside();check(G.stock.burger>0&&G.stock.ovo>0&&G.stock.costela_crua>0,'carne e ovos vão para a despensa');
  check(near('tacho')==='tacho','dá para chegar ao tacho');interact();check(modal==='tacho'&&$('dialogContent').innerHTML.includes('Queijo em fatias')&&!/colonial/i.test($('dialogContent').innerHTML),'o tacho faz só o queijo em fatias (sem queijo colonial)');
  action('makeQueijo','fatias');check(farmGame?.stages.length===1,'o queijo é só mexer o tacho, sem segunda etapa');for(let i=0;i<80&&farmGame;i++)farmGameKey(i%2?'d':'a');
  check(G.stock.queijo===TACHO.fatias&&bagQty('leite')===4,'4 litros de leite viram 10 fatias de queijo');
  tick(2);talk();check(step()==='compras','depois do queijo, as compras no Atacado');
  goOutside();enterInterior('atacado');check(worldOut.map==='atacado','o Atacado abre no passo das compras');
  storeShop('atacado');check(!$('dialogContent').innerHTML.includes('data-id="pao_xis"')&&$('dialogContent').innerHTML.includes('data-id="cerveja"')&&$('dialogContent').innerHTML.includes('Vidros de conserva'),'o Atacado vende bebida e vidros, não o que sai da roça');check($('dialogContent').textContent.includes('Missão · Compras no Atacado')&&$('dialogContent').querySelectorAll('.shop-checklist li').length===4,'no caixa, o aviso da missão lista o que comprar e quanto');
  ['cerveja','refri','cigarro'].forEach(storeBuy);storeExtra('vidro');closeDialog(true);tick(2);talk();
  check(step()==='compota'&&bagQty('vidro')>0,'compras feitas: falta a compota de ovinhos');
  goInside();check(near('conservas')==='conservas','a mesa de compota fica na cozinha');interact();check(modal==='worldStore'&&$('dialogTitle').textContent==='Mesa de compota','a mesa abre as receitas de compota');
  makeConserva('codorna');check(G.stock.codorna>0,'ovinhos e vidro viram conserva de codorna direto no balcão');closeDialog(true);
  tick(2);talk();
  check(!prologueActive()&&tutorialActive()&&G.tutorial.day===G.day,'prateleira cheia: o tutorial da bodega começa neste dia');
  refreshHUD();check(!tutorialStockMissing().length&&tutorialDirtyTables().length===2,'na bodega: tudo na despensa e as mesas para limpar, como no tutorial de sempre');
  check(PROLOGUE_TEACH.every(teachSeen),'o que o Valter ensinou no prólogo não se repete como primeira vez');
  // depois do prólogo: lojas, decoração e colheitas que liberam a venda
  G.prologue.done=true;G.tutorial.complete=true;
  storeShop('gado');check(!$('dialogContent').innerHTML.includes('decor/bandeira.png')&&$('dialogContent').innerHTML.includes('Vaca de leite'),'a Casa do Campeiro vende a vaca, mas não a decoração');closeDialog(true);
  G.phase='prep';caixaMenu();check($('dialogContent').innerHTML.includes('data-act="personalizar"'),'no caixa do balcão: Personalizar bodega');action('personalizar');check(modal==='personalizar'&&$('dialogContent').innerHTML.includes('decor/bandeira.png')&&$('dialogContent').innerHTML.includes('data-act="decorBuy"'),'Personalizar bodega vende a decoração, com ícones');
  G.cash=500;buyDecor('bandeira');check(decorOwned('bandeira')&&decorState().bandeira===true&&modal==='personalizar'&&$('dialogContent').innerHTML.includes('data-act="decorToggle" data-id="bandeira"'),'comprar no balcão já enfeita a bodega e dá para guardar');closeDialog(true);
  phoneTab='decor';togglePhone(true);check($('phoneContent').textContent.includes('À venda no balcão')&&!$('phoneContent').innerHTML.includes('data-act="decorBuy"'),'no celular, a aba Estética só mostra e guarda: comprar é no balcão');togglePhone(false);
  phoneTab='upgrades';togglePhone(true);check(phoneTab==='supplier'&&document.querySelector('[data-act="tab"][data-id="upgrades"]').classList.contains('hidden'),'o celular não tem mais a aba Melhorias');togglePhone(false);
  storeShop('ferragem');const up=$('dialogContent').innerHTML;closeDialog(true);
  check(!/Bergamota do pomar|Pinhão a granel|Amendoim torrado|Conserva de pepino/.test(up)&&/Xis bacon/.test(up),'a Ferragem não vende bergamota, pinhão, amendoim e pepino: vêm da roça');
  check(unlocked('amendoim'),'amendoim torrado começa liberado');
  G.up.bergamota=false;G.bag={bergamota:{q:3000,c:0}};goOutside();goInside();check(unlocked('bergamota')&&G.stock.bergamota===3000,'a primeira bergamota colhida libera a venda no balcão');
  G.ranch.milkedDay=null;G.bag={leite:{q:4,c:0}};near('tacho');interact();action('makeQueijo','colonial');for(let i=0;i<80&&farmGame;i++)farmGameKey(i%2?'d':'a');
  check(!G.up.queijo_colonial&&!G.stock.queijo_colonial&&!furniture().some(f=>f.id==='shop:queijo_colonial')&&!unlocked('queijo_colonial'),'queijo colonial saiu do jogo: nem no tacho nem no balcão');
  check(G.valterQueue?.includes('bergamota'),'o Valter comenta as novidades da roça');
  G.valterQueue=[];
  // o desafiante de bocha espera na cancha
  G.phase='closed';worldOut=null;const lauro=PEOPLE.findIndex(p=>p.id==='lauro');
  sportState().challenge={person:lauro,wager:0,tutorial:true,type:'bocha'};showSportChallenge();check($('dialogContent').textContent.includes('Ir com o Lauro até a cancha'),'o convite do Lauro chama para a cancha');
  action('sportAccept');check(sportState().waiting?.person===lauro&&!G.bocce,'aceitando, o Lauro vai esperar na cancha');
  const d2=G.day;nextDay('automatic');check(G.day===d2&&G.phase==='closed','o dia não vira com o Lauro esperando');
  refreshHUD();check($('tutorialHint').textContent.includes('te espera na cancha'),'o quadro avisa que o Lauro espera na cancha');
  goOutside();const c=WORLD_MAPS.vila.spots().find(s=>s.id==='cancha');worldOut.x=c.x;worldOut.y=c.y;interact();check(worldOut.map==='cancha','do pátio, entra na cancha');
  const w=WORLD_MAPS.cancha.spots().find(s=>s.id==='waiting');check(!!w,'o Lauro está lá dentro');worldOut.x=w.x;worldOut.y=w.y;interact();
  check(G.bocce?.tutorial&&!sportState().waiting,'perto do Lauro, começa a bocha de treino');
 }finally{window.confirm=confirmBefore;window.NO_SCENES=scenesBefore;if(G?.bocce)G.bocce=null;$('bocceScreen')?.classList.add('hidden');document.body.classList.remove('playing-bocce');closeDialog(true);worldOut=null;}
 return results;
})()
