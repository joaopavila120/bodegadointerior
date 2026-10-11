// Costelão de domingo, maionese, laçada de sábado e rebanho.
(() => {
 const results=[],check=(v,m)=>{if(!v)throw Error(m);results.push(m);};
 const random=Math.random;
 const reset=()=>{G=fresh();G.xp=99999;G.levelSeen=7;G.levelStory=7;G.tutorial.guided=false;G.tutorial.complete=true;G.cash=2000;G.rep=100;started=true;paused=false;modal=null;phoneOpen=false;AudioEngine.on=false;keys.clear();bannerQueue=[];['start','overlay','phone','weighUI','mixUI','lassoUI'].forEach(id=>$(id).classList.add('hidden'));};
 const sunday=()=>{reset();G.day=3;G.event={id:'costelao',seen:true,fired:{}};G.phase='prep';G.costelaoTaught=true;G.stock.costela_crua=9;G.avg.costela_crua=40;campoState().fuel=100;campoState().lit=true;};
 const roast=()=>{for(let t=0;t<COOK_SIDE+.2;t+=.05){campoState().fuel=100;campoTick(.05);if(campoState().espetos.some(e=>e&&e.heat[e.fire]>=1))break;}};
 const chop=()=>{use('lenha');for(let k=0;k<CHOP_HITS;k++){keys.add('e');holdTick(.05);for(let t=0;t<CHOP_TIME*.7;t+=.05)holdTick(.05);keys.delete('e');holdTick(.05);}};
 const approach=id=>{if(modal==='costelaoStep')closeDialog(true);const f=furniture().find(f=>f.id===id);if(!f)throw Error('Ausente: '+id);for(let x=f.x-60;x<=f.x+f.w+60;x+=6)for(let y=f.y-60;y<=f.y+f.h+60;y+=6){if(!canWalk(x,y)||distRect({x,y},f)>45)continue;G.player={x,y,dx:1,dy:0};if(nearest()?.id===id)return;}throw Error('Inacessível: '+id);};
 const use=id=>{approach(id);interact();};
 const tick=(s,fn)=>{for(let t=0;t<s;t+=.05)fn(.05);};
 const weigh=()=>{approach('tabua');interact();keys.add('e');holdTick(G.task.requested/G.task.maxWeight*2.5);keys.delete('e');finishWeigh();};
 const mayo=()=>{use('bin:ovo');use('maionese');use('bin:azeite');use('maionese');interact();for(let i=0;i<=Math.ceil(1/MIX_STEP);i++)mixKey(i%2?'a':'d');};
 try{
  reset();check(calendar(1).name==='Sexta'&&eventForDay(3).id==='costelao','o jogo começa na sexta e o costelão é no domingo (dia 3)');
  sunday();check(isCampo()&&furniture().every(f=>CAMPO_FIXED.includes(f))&&furniture().some(f=>f.id==='service:1')&&!availableTables().length,'domingo troca para o cenário aberto, sem mesas e com dois balcões');
  check(!furniture().some(f=>f.id==='shop:pepino'),'pepino em conserva só aparece depois de desbloqueado');G.up.pepino=true;check(furniture().some(f=>f.id==='shop:pepino'),'pepino desbloqueado tem banca no costelão');
  for(const f of furniture())if(f.id!=='fogo')approach(f.id);G.up.pepino=false;check(true,'todas as estações do campo são alcançáveis');
  check(['costela_crua','costela_assada','costela','maionese','azeite','costela_queimada'].every(k=>ITEM_ART[k].naturalWidth>0)&&CAMPO_ART.every(([im])=>im.naturalWidth>0),'sprites do costelão carregam');
  // espeto: pôr, assar, virar, retirar
  use('costela_crua');check(held()?.key==='costela_crua'&&G.stock.costela_crua===8,'pega a manta crua');
  use('espeto:0');const e=campoState().espetos[0];check(e&&!held()&&e.fire===0,'manta vai para o espeto');
  roast();check(e.heat[0]>=1&&e.heat[1]===0,'só o lado virado para o fogo assa');
  interact();check(e.fire===1,'E vira a manta');roast();check(espetoReady(e),'os dois lados no ponto deixam a costela pronta');
  interact();check(held()?.key==='costela_assada'&&held().ready&&held().perfect&&!campoState().espetos[0],'retira a costela no ponto');
  use('tabua');check(G.stock.costela===MANTA_GRAMS&&!held(),'tábua recebe 2 kg de costela');
  // queimar
  use('costela_crua');use('espeto:1');for(let t=0;t<COOK_SIDE*BURN_AT+.3;t+=.05){campoState().fuel=100;campoTick(.05);}check(campoState().espetos[1].burned,'esquecer a manta no fogo queima');
  interact();check(held()?.burned&&itemArtKey('costela_assada',held())==='costela_queimada','costela queimada sai para a lixeira');use('trash');check(!held(),'lixeira recebe a costela queimada');
  // lenha: o fogo gasta e sem lenha a costela quase não assa
  campoState().fuel=0;use('costela_crua');use('espeto:2');const slow=campoState().espetos[2];for(let t=0;t<COOK_SIDE;t+=.05)campoTick(.05);check(slow.heat[0]<.15,'sem lenha a costela quase não assa');
  use('lenha');check(G.task?.type==='chop'&&!$('chopUI').classList.contains('hidden'),'cepo abre o minijogo do machado');
  keys.add('e');holdTick(.05);for(let t=0;t<CHOP_TIME*.3;t+=.05)holdTick(.05);keys.delete('e');holdTick(.05);check(G.task.hits===0,'golpe fraco não conta');
  for(let k=0;k<CHOP_HITS;k++){keys.add('e');holdTick(.05);for(let t=0;t<CHOP_TIME*.7;t+=.05)holdTick(.05);keys.delete('e');holdTick(.05);}
  check(!G.task&&held()?.key==='lenha'&&ITEM_ART.lenha.naturalWidth>0,'três golpes na faixa verde racham a lenha');
  use('fogo');check(!held()&&campoState().fuel===LENHA_FUEL,'lenha rachada aviva o fogo');
  campoState().lit=false;check(fireHeat()===0,'fogo apagado não assa nada');
  approach('fogo');keys.add('e');interact();check(G.task?.type==='light','segurar E no fogo com lenha começa a acender');tick(LIGHT_TIME+.1,holdTick);keys.clear();
  check(fireLit()&&!G.task&&campoState().fuel===LENHA_FUEL+KINDLING,'o fogo acende e os gravetos dão um tanto de lenha');
  campoState().fuel=.01;campoTick(.1);check(!fireLit(),'quando a lenha acaba o fogo apaga');campoState().lit=true;
  campoState().espetos[2]=null;G.stock.costela_crua++;campoState().fuel=100;
  // venda por peso
  G.phase='open';const c=spawnShop({pid:'costela',grams:1000,fiado:false});for(let n=0;n<300;n++)customersTick(.05);
  approach('tabua');interact();check(G.task?.type==='weigh'&&G.task.key==='costela','segurar E na tábua corta a costela');
  keys.add('e');holdTick(G.task.requested/G.task.maxWeight*2.5);keys.delete('e');finishWeigh();check(held()?.pid==='costela'&&held().weight>900,'pesa a costela pedida');
  const cash=G.cash;use('service');check(G.cash>cash&&G.costelaSold>=900&&c.state==='leave','costela vendida por peso no balcão');
  for(let n=0;n<300;n++)customersTick(.05);const one=spawnShop({pid:'refri',fiado:false}),two=spawnShop({pid:'refri',fiado:false});for(let n=0;n<300;n++)customersTick(.05);
  check(customerOrderBubbles().length===2,'dois balcões mostram dois pedidos ao mesmo tempo');
  use('bottle:refri');use('service:1');check(two.state==='leave'&&one.state==='queue','o segundo balcão atende o segundo freguês');use('bottle:refri');use('service');check(one.state==='leave','o primeiro balcão atende o primeiro');
  // maionese
  use('bin:ovo');use('maionese');use('bin:azeite');use('maionese');const b=campoState().bowl;check(b.ovo&&b.azeite,'ovo e azeite vão para a tigela');
  interact();check(G.task?.type==='mix'&&!$('mixUI').classList.contains('hidden'),'tigela cheia começa a bater');
  mixKey('e');check(G.task.progress===0,'E não bate a maionese: só A e D');mixKey('a');mixKey('a');check(Math.abs(G.task.progress-MIX_STEP)<1e-9,'repetir a mesma tecla não conta');for(let i=0;i<=Math.ceil(1/MIX_STEP);i++)mixKey(i%2?'a':'d');
  check(!G.task&&G.stock.maionese===3&&!b.ovo,'alternar A e D dá o ponto: 3 porções');
  interact();check(held()?.pid==='maionese'&&G.stock.maionese===2,'pega uma porção de maionese');interact();check(!held()&&G.stock.maionese===3,'com a maionese na mão, E na tigela devolve a porção');interact();G.hands=[null,null];
  // pedido em dobro: costela + maionese
  G.shop=[];G.stock.costela=4000;const combo=spawnShop({pid:'costela',grams:500,extra:['maionese'],fiado:false});for(let n=0;n<300;n++)customersTick(.05);
  check(orderList(combo).join()==='costela,maionese'&&customerOrderBubbles()[0]?.items.length===2,'domingo: freguês pede costela e maionese juntas');
  weigh();use('service');check(combo.state==='queue'&&combo.pid==='maionese','entregou a costela, falta a maionese');const cash2=G.cash;use('maionese');use('service');check(combo.state==='leave'&&G.cash>cash2,'com a maionese o pedido em dobro é pago');
  // mantas do açougue, mais caras
  G.bag={};storeShop('acougue');check(!document.querySelector('#dialogContent [data-id="manta"]')&&!document.querySelector('#dialogContent [data-id="burger"]'),'o Açougue não vende manta nem hambúrguer: a carne do boi vem da carneação');closeDialog(true);
  // clientes do campo
  check(['costela','maionese','refri'].includes(campoOrder())&&!spawnGroup(),'no campo só chegam fregueses ao balcão: costela, maionese ou refri');
  // tutorial do primeiro costelão
  reset();G.day=3;G.event={id:'costelao',seen:true,fired:{}};G.phase='prep';G.stock.costela_crua=0;resetCampoDay();openDay();
  check(modal==='costelao'&&costelaoTutorialActive()&&G.stock.costela_crua>=2,'primeiro costelão abre com tutorial e mantas de treino');closeDialog(true);
  simulate(1);check(!G.shop.length,'no tutorial ninguém chega antes da hora');check(modal==='costelaoStep'&&$('dialogTitle').textContent.includes('Rache a lenha'),'a primeira etapa do costelão para o jogo e mostra a orientação');closeDialog(true);
  check(costelaoStep().id==='rachar'&&!fireLit()&&campoState().fuel===0,'o costelão começa com o fogo apagado: rachar lenha');
  chop();check(costelaoStep().id==='fogo','etapa: lenha no fogo');use('fogo');check(costelaoStep().id==='acender','etapa: acender o fogo');
  approach('fogo');keys.add('e');interact();tick(LIGHT_TIME+.1,holdTick);keys.clear();check(fireLit()&&costelaoStep().id==='espeto','etapa: costela no espeto');
  use('costela_crua');use('espeto:0');check(costelaoStep().id==='virar','etapa: virar');
  check(costelaoTarget()===null&&modal!=='costelaoStep','enquanto o lado assa, a seta some');approach('espeto:0');roast();check(costelaoTarget()==='espeto:0','lado no ponto: a seta volta para virar');interact();check(costelaoStep().id==='retirar'&&costelaoTarget()===null,'virou: a seta some até ficar pronto');
  roast();check(costelaoTarget()==='espeto:0','pronto: a seta aponta para retirar');interact();check(costelaoTarget()==='tabua','e depois para a tábua');check(costelaoStep().id==='tabua','etapa: tábua');use('tabua');check(costelaoStep().id==='cortar','etapa: cortar');
  simulate(.05);const first=G.shop[0];check(first?.pid==='costela'&&first.grams===500&&first.training,'primeiro freguês pede 500 g sem prazo');
  for(let n=0;n<300;n++)customersTick(.05);weigh();use('service');
  check(costelaoStep().id==='maionese','etapa: maionese');G.stock.ovo=0;simulate(.05);check(G.stock.ovo>=1,'sem ovo na despensa, o Valter traz ovos: o tutorial do costelão não trava');mayo();
  check(costelaoStep().id==='servir','etapa: servir maionese');simulate(.05);for(let n=0;n<300;n++)customersTick(.05);use('maionese');use('service');
  check(!costelaoTutorialActive()&&G.costelaoTaught,'tutorial do costelão concluído');
  G.stock.costela_crua=6;G.stock.maionese=3;G.shop=[];for(let i=0;i<6;i++)spawnShop();check(campoState().firstOrders===3&&G.shop.length===3&&G.shop.every(c=>c.pid==='costela'&&c.extra?.[0]==='maionese'),'primeiro costelão: só três pedidos de costela com maionese');
  G.shop=[];campoTick(.05);check(G.elapsed===DAY,'atendidos os três, o primeiro costelão fecha');
  // laçada de sábado
  // fim do primeiro dia: o vizinho traz a TV em cena
  reset();window.NO_SCENES=false;G.day=1;G.phase='open';G.elapsed=DAY;finishDay();check(scene?.id==='tv'&&G.tv,'no fim do primeiro dia o vizinho entra com a TV');
  {let n=0,said=[];while(scene&&n++<900){if(scene.step?.say){said.push(rpgBoxes.sceneTalk?.text||'');sceneNext();sceneNext();}else sceneTick(1/20);}check(said.join(' ').includes('teu pai')&&said.join(' ').includes('presentes')&&modal==='report'&&!G.tvAwardPending,'ele conta que se criou com o pai do Sadi, a dica dos presentes aparece e segue o relatório');}
  closeDialog(true);window.NO_SCENES=true;
  // laçada a qualquer hora (na cerca do campo), um boi por vez; o boi laçado vira carne na hora
  reset();G.day=2;G.phase='closed';G.event={id:'normal',seen:true,fired:{}};G.report={};nextDay('automatic');check(G.day===3&&!G.lasso&&!scene&&modal!=='lassoIntro','o sábado não exige mais laçada: o dia segue');closeDialog(true);
  reset();G.herd=1;G.phase='prep';G.stock.burger=0;G.stock.costela_crua=0;startLasso();check(G.lasso.bois.length===1&&activeQueros(G.lasso).length<=1,'primeira laçada: um boi e um quero-quero só');
  {const L1=G.lasso;L1.queros=[];const b1=L1.bois[0];for(let k=0;k<LASSO_HITS;k++){G.player={x:b1.x-200,y:b1.y+40,dx:1,dy:0};L1.fx=1;L1.fy=0;lassoCharge();let best=0,bd=1e9;for(let t=0;t<1.4;t+=.01){L1.charge=t;const a=lassoAim(),d=Math.hypot(a.x-b1.x,a.y-(b1.y-28));if(d<bd){bd=d;best=t;}}L1.charge=best;b1.speed=0;b1.dx=b1.dy=0;b1.t=99;lassoRelease();for(let t=0;t<1;t+=.05){b1.t=99;lassoTick(.05);}}}
  finishLasso();check(!G.lasso&&G.herd===0&&!farmGame&&modal!=='farmGame','boi laçado: sem minigame de carnear');
  check(G.stock.costela_crua===MANTAS_PER_BOI&&G.stock.burger+bagQty('burger')===24&&G.carneacoes===1,'o boi vira na hora as mantas do costelão e o hambúrguer');
  check(G.stock.burger===stationCapacity('burger')&&bagQty('burger')===24-stationCapacity('burger'),'carneando na bodega, a carne vai direto para a despensa; o que não cabe fica no inventário');
  reset();G.day=2;G.phase='prep';G.herd=5;G.lassoTaught=true;G.stock.burger=0;startLasso();const L=G.lasso;L.queros=[];check(L&&L.bois.length===5&&isCampo()&&!$('lassoUI').classList.contains('hidden'),'campo com o rebanho para laçar');
  finishLasso();check(G.lasso,'não termina sem laçar nenhum boi');
  const boi=L.bois.find(b=>b.state==='free');
  for(let k=0;k<LASSO_HITS;k++){G.player={x:boi.x-200,y:boi.y+40,dx:1,dy:0};L.fx=1;L.fy=0;lassoCharge();
   let best=0,bd=1e9;for(let t=0;t<1.4;t+=.01){L.charge=t;const a=lassoAim(),d=Math.hypot(a.x-boi.x,a.y-(boi.y-28));if(d<bd){bd=d;best=t;}}L.charge=best;
   for(const other of L.bois)if(other!==boi&&other.state==='free'){other.x=1300;other.y=860;}boi.speed=0;boi.dx=boi.dy=0;boi.t=99;lassoRelease();for(let t=0;t<1;t+=.05){boi.t=99;lassoTick(.05);}
  }
  check(boi.state!=='free'&&L.caught===1,'seis laços certeiros enchem a barra e laçam o boi');
  // quero-quero: rasante acerta, deixa tonto, e Shift esquiva
  L.queros=makeQueros();L.queros.length=1;const q=L.queros[0];G.player={x:700,y:700,dx:1,dy:0};q.state='warn';q.t=0;q.x=500;q.y=700;q.h=180;q.tx=700;q.ty=700;
  let hitAt=null;for(let t=0;t<.6;t+=.02){querosTick(L,.02);if(L.knock>0&&!hitAt)hitAt={x:G.player.x};}check(hitAt&&!(L.stun>0)&&L.immune>0,'rasante do quero-quero acerta sem atordoar');
  lassoCharge();check(!L.charging,'empurrado pelo rasante não gira o laço');const x0=G.player.x;for(let t=0;t<QUERO_KNOCK;t+=.02)lassoTick(.02);check(G.player.x>x0+100,'o rasante joga o peão para trás');L.knock=0;L.immune=0;lassoKeyDown({key:' ',repeat:false,preventDefault(){}});check(L.dash>0,'Espaço dá o pique para esquivar');L.dash=0;L.dashCool=0;lassoKeyDown({key:'q',repeat:false,preventDefault(){}});check(L.charging,'Q gira o laço');lassoKeyUp({key:'q'});check(!L.charging&&L.throw,'soltar Q arremessa');L.throw=null;L.dash=0;L.queros=[];
  const stock=G.stock.costela_crua;finishLasso();check(!G.lasso&&G.herd===4&&!farmGame&&G.stock.costela_crua===stock+MANTAS_PER_BOI,'um boi laçado basta: a carne vai direto para a despensa');
  // primeiro domingo de costelão: a cena da montagem, com Márcio e Marcelo
  reset();window.NO_SCENES=false;G.costelaoTaught=false;G.day=2;G.phase='closed';G.event={id:'normal',seen:true,fired:{}};G.report={};nextDay('automatic');check(G.event.id==='costelao'&&scene?.id==='montagem','no primeiro domingo de costelão vem a cena da montagem');
  {let n=0;while(scene&&n++<800){if(scene.step?.say){if(scene.step.say==='marcio')check(rpgBoxes.sceneTalk.text.includes('Presença de Márcio e Marcelo'),'Márcio e Marcelo confirmam presença no costelão');sceneNext();sceneNext();}else sceneTick(1/20);}}
  check(!scene&&modal!=='event'&&G.event.id==='costelao'&&G.phase==='prep','a cena termina e o domingo começa sem menu: abrir é no caixa');closeDialog(true);window.NO_SCENES=true;
  reset();G.herd=0;goOutside();enterInterior('curral');{const ps=WORLD_MAPS.curral.spots().find(s=>s.id==='cerca');check(ps.label.includes('Casa do Campeiro'),'sem bois a cerca indica a Casa do Campeiro');worldOut.x=ps.x;worldOut.y=ps.y;interact();check(!G.lasso,'sem boi não tem laçada');}worldOut=null;
  buyBoi();buyBoi();check(G.herd===2&&G.cash===2000-2*BOI_COST&&G.herdValue===2*BOI_COST,'compra de bois: o preço entra no custo da carne');closeDialog(true);
  storeShop('gado');check(document.querySelector('#dialogContent [data-id="boi"]'),'a Casa do Campeiro vende bois');closeDialog(true);
  // quero-queros de visita enquanto a costela assa
  sunday();campoBirds=[];G.player={x:525,y:640,dx:1,dy:0};campoState().espetos[0]={heat:[0,0],fire:0,burned:false,cost:1,turns:0};Math.random=()=>.001;campoBirdsTick(.05);Math.random=random;
  check(campoBirds.length===1,'com a costela assando pode chegar um quero-quero');const bird=campoBirds[0];for(let t=0;t<6;t+=.05)campoBirdsTick(.05);check(bird.state==='ground','o quero-quero pousa no campo');
  Math.random=()=>.9;bird.aggr=1;G.player={x:bird.x+40,y:bird.y-10,dx:1,dy:0};campoBirdsTick(.05);check(bird.state==='warn','passar perto do quero-quero provoca um rasante');const px=G.player.x;for(let t=0;t<1.2;t+=.05)campoBirdsTick(.05);check(Math.abs(G.player.x-px)>40,'o rasante joga o peão para trás');
  for(let t=0;t<8;t+=.05)campoBirdsTick(.05);check(!campoBirds.includes(bird),'e o quero-quero vai embora');Math.random=random;campoState().espetos[0]=null;
  campoState().espetos[0]={heat:[0,0],fire:0,burned:false,cost:1,turns:0};G.player={x:525,y:640,dx:1,dy:0};campoBirds=[];spawnCampoBird();const calm=campoBirds[0];for(let t=0;t<6;t+=.05)campoBirdsTick(.05);calm.aggr=0;calm.state='ground';calm.t=9;G.player={x:calm.x+40,y:calm.y-10,dx:1,dy:0};campoBirdsTick(.05);check(calm.state==='ground'&&calm.calm>0,'quero-quero manso só grita e se afasta');campoBirds=[];campoState().espetos[0]=null;
  // sobras do costelão
  sunday();G.phase='open';G.stock.costela=1500;G.stock.costela_crua=2;campoState().espetos[1]={heat:[1,0],fire:1,burned:false,cost:40,turns:1};finishDay(true);
  check(!G.stock.costela&&!G.stock.costela_crua&&!campoState().espetos[1]&&!G.report.waste,'carne que sobra no fim do costelão sai sem contar como prejuízo');check(G.report.power===0&&G.report.supplies===COSTELAO_SUPPLIES&&!G.report.rent,'no costelão não há luz: vão lenha e sal');closeDialog(true);
  // sem carne e sem dinheiro, o domingo vira dia normal (menos no primeiro costelão)
  reset();G.costelaoTaught=true;G.day=2;G.phase='closed';G.lassoDay=2;G.event={id:'normal',seen:true,fired:{}};G.stock.costela_crua=0;G.stock.costela=0;G.cash=20;G.herd=0;nextDay('automatic');closeDialog(true);
  check(G.day===3&&G.event.id==='costelao','o domingo de costelão continua no calendário');openDay();check(modal==='costelaoMeat'&&$('dialogContent').innerHTML.includes('costelaoSkip'),'sem manta, sem boi e sem dinheiro: o caixa oferece pular o costelão');
  action('costelaoSkip');check(G.event.id==='normal'&&G.event.noCostelao&&G.phase==='open'&&$('floatNotes').textContent.includes('Sem costelão hoje'),'pulando, a bodega abre como um dia normal');closeDialog(true);
  reset();G.costelaoTaught=true;G.day=2;G.phase='closed';G.lassoDay=2;G.event={id:'normal',seen:true,fired:{}};G.stock.costela_crua=0;G.stock.costela=0;G.cash=20;G.herd=1;nextDay('automatic');closeDialog(true);openDay();
  check(modal==='costelaoMeat'&&$('dialogContent').innerHTML.includes('lassoStart')&&!$('dialogContent').innerHTML.includes('costelaoSkip'),'com boi na cerca, o caixa manda laçar antes de abrir');closeDialog(true);
  G.herd=0;G.cash=500;openDay();check(modal==='costelaoMeat'&&$('dialogContent').textContent.includes('Casa do Campeiro')&&G.phase==='prep','sem boi mas com dinheiro: comprar um boi na Casa do Campeiro e laçar');closeDialog(true);
  reset();G.costelaoTaught=false;G.day=2;G.phase='closed';G.lassoDay=2;G.event={id:'normal',seen:true,fired:{}};G.stock.costela_crua=0;G.cash=0;nextDay('automatic');check(G.event.id==='costelao','o primeiro costelão acontece sempre (o tutorial dá a carne)');closeDialog(true);
  // mate sem reposição no campo
  sunday();approach('mate');keys.add('e');interact();tick(1.2,holdTick);keys.clear();check(G.boost>0,'campo tem estação de mate, sem reposição de erva');
  save();check(readSave().herd===G.herd&&readSave().version===15,'rebanho e campo persistem no salvamento');
  // laçou um boi: a laçada encerra sozinha e leva a carne de um boi
  {reset();G.herd=3;G.lassoTaught=true;G.day=2;G.phase='closed';startLasso();const L=G.lasso;L.queros=[];const b=L.bois[0];b.rope=LASSO_HITS;b.state='caught';L.caught=1;b.x=CURRAL.x+40;b.y=CURRAL.y+60;
   for(let n=0;n<80&&G.lasso;n++)lassoTick(.05);check(!G.lasso&&G.lassoDay===2&&!farmGame,'laçou um boi: a laçada encerra sozinha');check(G.stock.costela_crua>0&&G.stock.burger>0,'e a carne do boi já vai para a despensa');closeDialog(true);}
  // bodoque: trancado até comprar; pedrada no tempo certo espanta o quero-quero
  {sunday();openDay();closeDialog(true);campoBirds=[];G.player={x:600,y:760,dx:1,dy:0,walk:false};campoBirds.push({x:700,y:760,tx:700,ty:760,h:0,state:'ground',face:1,flap:0,t:20,hop:9,peck:0,calm:0,aggr:0});
   slingStart();check(!sling.aim&&!slingOwned(),'sem comprar, o bodoque fica trancado');G.cash=500;buyUpgrade('bodoque');check(slingOwned(),'bodoque comprado no celular');
   slingStart();check(sling.aim&&sling.aim.ref===campoBirds[0],'segurar F mira o quero-quero mais próximo');sling.aim.t=sling.aim.dur*.3;slingRelease();check(campoBirds[0].state==='ground','soltar cedo erra a pedrada');
   sling.cool=0;slingStart();sling.aim.t=sling.aim.dur*.75;slingRelease();check(campoBirds[0].state==='out','soltar no verde espanta o quero-quero');}
 }finally{Math.random=random;keys.clear();if(G)G.lasso=null;$('lassoUI').classList.add('hidden');reset();}
 return results;
})()
