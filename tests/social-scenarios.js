(() => {
 const results=[],check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const reset=()=>{G=fresh();G.xp=99999;G.levelSeen=7;G.contacts=Object.fromEntries([...ALWAYS_TALK].map(id=>[id,1]));started=true;paused=false;modal=null;phoneOpen=false;keys.clear();G.spawnShop=G.spawnGroup=999;AudioEngine.on=false;['start','overlay','phone'].forEach(id=>$(id).classList.add('hidden'));};
 const index=id=>PEOPLE.findIndex(p=>p.id===id);
 reset();
 check(['indavirus','lauro','peixinhonabrasa','manolima'].every(id=>index(id)>=0&&CHARACTER_ART[PEOPLE[index(id)].sprite.file].naturalWidth>0),'quatro novos personagens carregam suas artes');
 check(!$('startingCharacter'),'tela inicial não oferece escolha de personagem');
 $('startingName').value='Bodega do teste';
 const confirmBefore=window.confirm;try{window.confirm=()=>true;startGame(true);}finally{window.confirm=confirmBefore;}
 check(scene?.id==='intro'&&!modal,'jogo novo abre com a introdução: o galpão vazio');
 const runScene=(until,max=400)=>{for(let n=0;n<max&&scene&&!until();n++){if(scene.step?.say||scene.step?.overlay)sceneNext();else sceneTick(1/20);}};
 runScene(()=>scene.step?.say);check(scene.view==='galpao'&&$('sceneTalkName').textContent==='Sadi','o Sadi conta a história em caixa de diálogo');
 runScene(()=>scene.step?.overlay==='letter');check(!$('sceneLetter').classList.contains('hidden'),'ele acha a carta do vô');
 runScene(()=>scene.step?.overlay==='photo');check(!$('scenePhoto').classList.contains('hidden')&&$('scenePhoto').textContent.includes('1968'),'e uma foto do vô no armazém');
 runScene(()=>scene.step?.overlay==='news');check($('sceneNews').textContent.includes('Velho galpão vai virar bodega'),'o Jornal da Comunidade anuncia a bodega');
 runScene(()=>scene.view==='bodega'&&scene.step?.say==='sadi');check(rpgBoxes.sceneTalk.text.includes('mercadoria'),'a bodega aparece montada, mas sem mercadoria');
 runScene(()=>scene.step?.say==='valter');check(scene.view==='bodega'&&scene.actors.valter,'o primeiro vizinho aparece na porta');
 runScene(()=>scene.step?.say==='valter'&&scene.step.text.includes('Mimosa'));check(rpgBoxes.sceneTalk.text.includes('boi'),'o Valter dá de presente um boi e a Mimosa, vaca de leite');
 runScene(()=>false);check(!scene&&!document.body.classList.contains('intro-playing'),'a introdução termina e devolve o jogo');
 check(G.avatarId==='sadi'&&G.bodegaName==='Bodega do teste'&&modal==='tutorial'&&prologueActive(),'novo jogo começa com Sadi, aplica nome e abre o prólogo da roça');
 check($('dialogTitle').textContent.includes('A roça do vô')&&$('dialogContent').textContent.includes('Armazém Querência'),'boas-vindas apresentam o primeiro passo da roça');G.prologue.done=true;gameGuide();check(['Mão boa na bocha','Rei do truco','Agenda cheia','Desceu na gruta','Rei do rio'].every(text=>$('dialogContent').textContent.includes(text))&&!$('dialogContent').querySelector('.guide-grid'),'guia mostra só o nível e as conquistas, com as da caverna e do mundo');
 closeDialog(true);G.xp=99999;G.levelSeen=7;
 playAs('indavirus');check(G.avatarId==='sadi','sem amizade máxima não dá para jogar com Indavirus');
 G.friends[index('indavirus')]=100;socialCheck();const indaGifts=(G.giftQueue||[]).filter(g=>g.person===index('indavirus'));check(indaGifts.length===4&&!decorState().alho,'presentes ficam guardados para a visita depois do expediente');indaGifts.forEach(deliverGift);G.giftQueue=[];
 check(G.playable.indavirus&&hasContact(index('indavirus'))&&decorState().alho===true,'amizade máxima libera contato, presente e personagem');
 G.phase='prep';playAs('indavirus');check(G.avatarId==='indavirus','jogar como Indavirus pelo contato');
 G.phase='open';
 check(!visitorAvailable(index('indavirus')),'personagem único escolhido pelo jogador não chega como cliente');
 const lauro=spawnGroup({person:index('lauro'),size:4});
 check(!lauro.members.includes(index('indavirus'))&&lauro.size===4,'parceiro indisponível não é duplicado ao formar quatro pessoas');
 const repeated=spawnGroup({members:Array(4).fill(index('lauro')),size:4});
 const all=[...lauro.members,...repeated.members];check(all.filter(i=>i===index('lauro')).length===1,'nem pedidos explícitos de grupo duplicam freguês único');
 reset();G.phase='open';const pair=spawnGroup({person:index('indavirus'),size:2});
 check(pair.members[1]===index('lauro'),'Indavirus e Lauro formam dupla quando disponíveis');
 reset();G.phase='open';
 for(let trial=0;trial<80;trial++){
  G.groups=[];G.shop=[];G.tables.forEach(t=>{t.group=null;t.dirty=false;});
  for(let i=0;i<3;i++){spawnGroup({size:4});spawnShop();}
  const visitors=[...G.groups.flatMap(g=>g.members),...G.shop.map(c=>c.person)].filter(i=>PEOPLE[i].unique);
  if(new Set(visitors).size!==visitors.length)throw Error('Freguês único duplicado em visita '+trial);
 }
 check(true,'80 lotes de chegadas respeitam exclusividade entre fila, balcão e mesas');
 reset();G.phase='open';const repeatAllowed=spawnGroup({members:[0,0,0,0],size:4});check(repeatAllowed.members.every(i=>i===0),'personagens comuns podem repetir');
 reset();G.phase='open';for(const k of ['refri','codorna','cachaca','cerveja'])G.stock[k]=10;const group=spawnGroup({members:[0,1,2,3],size:4,fixedOrders:['refri','codorna','cachaca','cerveja','refri']});
 for(let t=0;t<12;t+=.05)customersTick(.05);
 check(group.state==='seated'&&group.diners.length===4&&G.tables[group.table].seats===4&&new Set(group.diners.map(d=>d.person)).size===4,'grupo de quatro chega e cada lugar recebe seu próprio pedido');
 check(group.diners[0].orders.length===2&&group.diners.every(d=>d.maxPatience===ORDER_WAIT),'pedidos maiores mantêm prazo individual normal');
 const item=pid=>({kind:'product',pid,ready:true,cost:GOODS[pid].cost});
 const balance=G.cash;group.diners[0].patience=50;group.diners[1].patience=20;
 G.hands[0]=item('refri');interactTable(group.table);
 check(G.cash===balance&&group.diners[0].orders.length===1&&group.diners[1].patience===20,'entrega parcial não paga nem renova cronômetro dos outros');
 G.hands[0]=item('refri');interactTable(group.table);
 check(G.cash>balance&&G.regulars[0]===1&&G.regulars[1]===0&&group.state==='seated','completar um pedido paga só aquele freguês enquanto a mesa segue ativa');
 group.diners[1].patience=.1;group.diners[2].patience=60;tickDiners(group,.2);
 check(group.diners[1].status==='lost'&&group.diners[2].status==='waiting'&&group.state==='seated'&&G.stats.lost===1,'desistência individual preserva o atendimento dos outros três');
 const remaining=group.diners[2].patience;addDinerRound(group);
 check(group.diners[2].patience===remaining&&group.diners[0].patience===ORDER_WAIT&&group.diners[1].status==='lost','rodada extra conserva prazos pendentes e não reativa desistência');
 refreshHUD();draw();check(!$('tableOrders')&&group.diners.length===4,'pedidos individuais ficam no cenário, sem lista lateral');
 save();const saved=readSave();check(saved.groups[0].diners[2].patience===remaining&&saved.groups[0].diners[1].status==='lost','salvamento mantém pedidos e cronômetros individuais');
 reset();G.phase='open';const truco=spawnGroup({size:4,targetTable:1});for(let t=0;t<24;t+=.05)customersTick(.05);
 check(truco.orders.length===4&&truco.orders.every(k=>GOODS[k]||RECIPES[k]),'mesa de truco usa pedidos individuais do cardápio comum');
 reset();G.up.horse=true;G.up.bootsBagual=true;G.gear='horse';const migrated=normalizeSave(JSON.parse(JSON.stringify(G)));
 check(migrated.gear==='bootsBagual'&&!migrated.up.horse&&!GEAR.horse&&!UPGRADES.some(u=>u.id==='horse'),'cavalo removido: saves antigos equipam as melhores botas');
 G=migrated;const cash=G.cash;buyUpgrade('horse');equipGear('horse');check(G.gear==='bootsBagual'&&G.cash===cash,'cavalo não pode ser comprado nem equipado');

 phoneTab='contacts';renderPhone();check($('phoneContent').textContent.includes('Contatos da bodega')&&document.querySelectorAll('[data-contact]').length===ALWAYS_TALK.size,'aba Contatos lista só os especiais, com retratos e afeto; preferências');
 phoneTab='upgrades';renderPhone();check(phoneTab==='supplier'&&document.querySelector('[data-act="tab"][data-id="upgrades"]').classList.contains('hidden'),'sem aba Melhorias no celular: comprar é na Ferragem da Fronteira');
 {const lauroI=index('lauro');window.NO_SCENES=false;G.arcs={};G.arcQueue=[];G.phase='open';deliveryConversation(lauroI,{});check(scene?.id==='arcMeet'&&arcState('lauro').met,'primeiro atendimento do Lauro abre a conversa de apresentação');sceneSkip();
  G.friends[lauroI]=80;G.arcQueue=[{arc:'lauro',i:0}];arcCheck();check(!G.arcQueue.length&&playNextArc(null)===false&&!scene,'capítulos 1 a 3 dos arcos desligados: nada entra na fila nem toca');
  phoneOpen=true;phoneTab='contacts';renderPhone();check(!$('phoneContent').textContent.includes('Lauro na câmera:'),'aba Contatos sem progresso de arco');phoneOpen=false;
  const mm=index('marcio');deliveryConversation(mm,{});check(scene?.id==='arcMeet'&&arcState('marciomarcelo').met,'Márcio e Marcelo dividem o mesmo arco');sceneSkip();window.NO_SCENES=true;}
 {const d=index('dianho'),m=index('mitodosul'),l=index('loligebien');let ok=true,beer=0;for(let n=0;n<200;n++){for(const k of ['cerveja','cachaca','bitter'])if(ALCOHOL.includes(fitOrder(d,k)))ok=false;for(const k of ['refri','cerveja','cafe','cigarro'])if(DRINKS.includes(fitOrder(m,k))||fitOrder(m,k)==='cigarro')ok=false;if(fitOrder(l,'refri')==='cerveja')beer++;}
  check(ok&&beer>120,'Dianho não bebe álcool, o Mito do Sul não pede bebida nem cigarro e o Loli pede chopp');
  check(['dianho','mitodosul','loligebien','jayme','baitaca'].every(id=>isSpecial(index(id))&&ARCS[id]&&GIFTS[id]&&portraitHTML(index(id)).includes('portraits/256/')),'novos especiais têm retrato, presente e arco');
  check(!isSpecial(index('gaudencio'))&&PEOPLE[index('gaudencio')].removed&&!visitorPool().includes(index('gaudencio'))&&!specialPeople().includes(index('gaudencio')),'o Gaudêncio saiu do jogo: nem especial, nem freguês');
  check(isSpecial(index('valter'))&&ARCS.valter&&GIFTS.valter&&PEOPLE[index('valter')].name==='Valter'&&ARCS.valter.chapters[2].reward.herd===1,'Valter virou especial: amigo de lida do pai do Sadi, com arco que dá um boi');}
 {window.NO_SCENES=false;G.levelStory=1;G.xp=LEVELS[2].xp;G.phase='closed';check(nextLevelStory()===2,'subir de nível libera o capítulo da história');
  const seen=[];for(let k=0;k<3&&nextLevelStory();k++){playLevelStory(null);let n=0;while(scene&&n++<900){if(scene.step?.say){seen.push(scene.step.say);sceneNext();sceneNext();}else if(scene.step?.overlay){sceneNext();}else sceneTick(1/20);}}
  check(G.levelStory===3&&seen.includes('valter')&&!$('sceneNote').classList.contains('hidden')===false,'capítulos por nível tocam um de cada vez (notícia e caderno do vô)');
  G.xp=LEVELS[6].xp;G.levelStory=6;playLevelStory(null);let n=0,photo=false;while(scene&&n++<1500){if(scene.step?.overlay==='photo')photo=true;if(scene.step?.say||scene.step?.overlay){sceneNext();sceneNext();}else sceneTick(1/20);}
  check(photo&&G.levelStory===7&&!nextLevelStory(),'final da Bodega lendária com a foto do vô');window.NO_SCENES=true;}
 for(const id of ['indavirus','lauro','peixinhonabrasa']){const p=index(id);G.friends[p]=100;G.conversations[p]=4;check(!!personalizedProse(p)&&nextProse(p).id?.includes(id),'voz própria permanece com afinidade alta: '+id);}
 const mano=index('manolima');for(let i=0;i<16;i++){G.conversations[mano]=i;G.friends[mano]=100;const line=nextProse(mano);if(!line.id?.includes('manolima'))throw Error('Mano perdeu a voz própria');}check(true,'Mano Lima mantém voz própria sem cair nas falas genéricas');
 for(const id of ['guri','manolima','peixinhonabrasa','indavirus','lauro']){const lines=customDialogues[id]||DEFAULT_DIALOGUES[id];check(lines?.length>=12&&!lines.some(l=>/imigração|lobisome do Arvoredo te/.test(l.reply)),'falas novas de '+id);}
 check(/Kaiser/.test(DEFAULT_DIALOGUES.peixinhonabrasa.map(l=>l.reply).join())&&/Indaial/.test(DEFAULT_DIALOGUES.indavirus.map(l=>l.reply).join())&&/Uruguaiana/.test(DEFAULT_DIALOGUES.guri.map(l=>l.reply).join())&&/M'Bororé/.test(DEFAULT_DIALOGUES.manolima.map(l=>l.reply).join()),'falas fazem referência a cada personagem real');
 for(const phase of ['prep','open','closing','closed']){
  reset();G.phase=phase;G.elapsed=30;G.report=phase==='closed'?{...G.stats,end:G.cash,profit:0}:null;
  cardsMenu();check(modal==='cards','truco disponível em '+phase);$('trucoWager').value='0';startTruco();
  const before=G.elapsed;simulate(1);check(!!G.game&&G.elapsed===before,'truco pausa atendimento em '+phase);
  G.game.phase='over';G.game.wagerSettled=true;leaveCards();check(G.phase===phase&&!G.game,'truco retorna à mesma fase '+phase);closeDialog(true);
  bocceMenu();$('bocceWager').value='0';startBocceGame();simulate(1);check(!!G.bocce&&G.elapsed===before,'bocha disponível e pausa em '+phase);
  settleBocce(1);leaveBocce();check(!G.bocce&&G.phase===phase&&(phase==='closed'?modal==='report':modal===null),'bocha retorna sem encerrar o dia em '+phase);closeDialog(true);
 }
 reset();return results;
})()
