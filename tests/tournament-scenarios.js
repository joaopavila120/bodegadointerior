(() => {
 const results=[],check=(v,label)=>{if(!v)throw Error(label);results.push(label);};
 const reset=()=>{G=fresh();G.xp=99999;G.levelSeen=7;G.contacts=Object.fromEntries([...ALWAYS_TALK].map(id=>[id,1]));G.day=3;G.tutorial.complete=true;G.up.trago=true;started=true;paused=false;modal=null;phoneOpen=false;AudioEngine.on=false;keys.clear();['start','overlay','phone'].forEach(id=>$(id).classList.add('hidden'));};
 const advance=n=>{for(let t=0;t<n;t+=.05){for(const table of G.tables)if(table.fight)resolveFight(table,true);simulate(.05);if(modal==='celebration')closeDialog(true);}};
 reset();G.phase='open';const first=spawnGroup({size:2,targetTable:0,members:[0,1]});const second=spawnGroup({size:1,members:[PEOPLE.findIndex(p=>p.id==='badin')],fixedOrders:['xis_salada','refri']});
 check(first.table===0&&second.table===1&&second.state==='walkTable','fila ocupa a mesa de truco livre inclusive com xis e refrigerante');
 for(let i=0;i<250;i++)customersTick(.05);
 check(second.orders.includes('xis_salada')&&second.orders.includes('refri'),'mesa de truco aceita o mesmo cardápio das demais');
 G.hands[0]={kind:'product',pid:'codorna',key:'codorna',cost:3,ready:true};interactTable(1);
 check(!G.dialogue&&!G.conversations[second.person],'entrega incorreta não gera conversa');
 G.hands[0]={kind:'product',pid:'xis_salada',key:'xis_salada',cost:8.5,ready:true};const patience=second.diners[0].patience;interactTable(1);
 check(G.conversations[second.person]===1&&G.friends[second.person]===3&&G.dialogue?.name===PEOPLE[second.person].name&&second.diners[0].patience===patience,'entrega parcial inicia prosa e dá afeto sem alterar o prazo');
 G.hands[0]={kind:'product',pid:'refri',key:'refri',cost:2.5,ready:true};interactTable(1);
 check(G.conversations[second.person]===2&&G.dialogueQueue.length===0&&G.dialogue.life===15,'nova entrega substitui a conversa e renova seus 15 segundos');
 action('dialogueClose');check(!G.dialogue&&G.dialogueQueue.length===0,'fechar conversa não revela diálogos acumulados');
 check(!$('talkButton')&&!document.querySelector('[data-act="talk"]'),'botão de prosear removido');
 const count=G.conversations.join();document.dispatchEvent(new KeyboardEvent('keydown',{key:'i'}));document.dispatchEvent(new KeyboardEvent('keyup',{key:'i'}));check(G.conversations.join()===count,'tecla I não inicia mais conversa');
 reset();G.phase='open';const c=spawnShop({pid:'cigarro'});c.person=PEOPLE.findIndex(p=>p.id==='badin');readyProduct('cigarro');serveShop(c);
 check(G.dialogue?.name===PEOPLE[c.person].name&&G.conversations[c.person]===1&&G.friends[c.person]===5,'entrega no balcão também inicia conversa com o cliente correto');
 for(const count of [2,3,4]){
  reset();if(count>=3)G.up.table3=true;if(count===4)G.up.table4=true;G.event={id:'campeonato',seen:true,fired:{}};openDay();
  const roster=G.groups.flatMap(g=>g.members).sort((a,b)=>a-b).join(),pairs=JSON.stringify(G.tournament.pairs.map(p=>({id:p.id,members:p.members}))),initialCash=G.cash;
  check(G.groups.length===count&&G.groups.every(g=>g.size===4&&g.pairs.length===2)&&G.tournament.pairs.length===count*2,'campeonato preenche '+count+' mesas com duas duplas por mesa');
  advance(15);check(G.groups.every(g=>g.state==='seated')&&!G.shop.length,'todos sentam e não chegam clientes de balcão no campeonato de '+count+' mesas');
  for(const table of G.tables)if(table.fight)resolveFight(table,true);
  const orders=G.groups.flatMap(g=>g.diners).map(d=>JSON.stringify([d.person,d.orders,d.patience])).sort().join();
  G.elapsed=40;tournamentTick();check(G.groups.every(g=>g.state==='tournamentMove')&&G.tournament.round===2,'rodada troca adversários e inicia deslocamento das duplas');
  check(G.groups.flatMap(g=>g.diners).map(d=>JSON.stringify([d.person,d.orders,d.patience])).sort().join()===orders,'troca de mesa mantém pedidos, pessoas e prazos');
  save();G=readSave();check(G.tournament.round===2&&G.groups.every(g=>g.travel?.length===4),'salvamento mantém rodízio e deslocamentos em andamento');advance(15);
  check(G.groups.every(g=>g.pairs.every((id,i)=>g.members.slice(i*2,i*2+2).join()===G.tournament.pairs[id].members.join())),'parceiros permanecem juntos depois de caminhar e recarregar');
  const g=G.groups[0];g.diners.forEach(d=>{d.status='waiting';d.later=[];if(!d.orders.length)d.orders=['cerveja'];d.patience=.01;});tickDiners(g,.05);check(g.state==='chat'&&G.groups.length===count,'pedidos vencidos não expulsam as duplas');for(const k of ['cerveja','cachaca','bitter','codorna','amendoim'])G.stock[k]=60;advance(9);
  check(g.diners.some(d=>d.status==='waiting')&&g.orders.length>0,'mesmos participantes fazem novos pedidos após a pausa');
  const t=G.tables.find(t=>t.id===g.table);triggerFight(t);if(t.fight)resolveFight(t,false);
  check(g.table===t.id&&t.group===g.id&&g.state!=='leave','prejuízo de briga não remove a dupla do campeonato');
  advance(90);check(G.groups.length===count&&G.groups.flatMap(g=>g.members).sort((a,b)=>a-b).join()===roster&&JSON.stringify(G.tournament.pairs.map(p=>({id:p.id,members:p.members})))===pairs&&!G.shop.length,'campeonato mantém exatamente o elenco inscrito durante o expediente');
  check(G.tournament.round>=3,'rodízio continua por várias rodadas');
  spawnShop();spawnGroup();check(!G.shop.length&&G.groups.length===count,'nenhuma chegada extra entra após a inscrição');
  G.phase='closing';advance(180);check(G.phase==='closed'&&G.groups.length===0,'fechar interrompe novos pedidos e todos deixam o campeonato');
 }
 reset();G.phase='open';G.event.id='campeonato';const legacy=spawnGroup({size:2,fixedOrders:['cerveja','codorna']});for(let i=0;i<250;i++)customersTick(.05);const before=legacy.diners[0].patience;tournamentTick();check(legacy.tournament&&legacy.size===4&&legacy.diners[0].patience===before,'campeonato antigo migra sem perder pedidos e prazos de quem já sentou');
 reset();return results;
})()
