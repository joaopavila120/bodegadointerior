'use strict';

// O expediente de estreia avança por ações reais, sem relógio ou chegadas aleatórias.
const TUTORIAL_STEPS=[
 {id:'cigarro',title:'Seu primeiro freguês',pid:'cigarro',text:'Pegue um maço na prateleira de cigarros com E. Leve até o balcão de atendimento, embaixo à direita, e aperte E para entregar.'},
 {id:'cerveja',title:'Cerveja na caneca',pid:'cerveja',text:'Vá à torneira de cerveja, ao lado da geladeira. Segure E e solte na faixa verde. Leve a caneca ao balcão e entregue com E.'},
 {id:'fila',title:'A fila do balcão',queue:['cigarro','refri'],text:'Chegaram dois fregueses de uma vez! Quem está na frente é atendido primeiro; quem espera atrás tem a ampulheta ⌛ e perde a paciência mais devagar. Atenda na ordem: primeiro o maço de cigarros, depois o refri da geladeira.'},
 {id:'xis',title:'Um xis no capricho',pid:'xis_salada',table:1,text:'Este freguês espera na mesa 1. Prepare o xis seguindo a dica ao lado: monte, prense e entregue com E perto da mesa.'},
 {id:'mesa',title:'Fila para as mesas',pid:'refri',table:2,text:'Chegou gente para comer na mesa, mas a mesa 1 ficou suja do xis! Quem vem para as mesas espera na <b>fila perto da porta</b> (⌛) até ter uma mesa limpa: em mesa suja ninguém senta. Com as mãos livres, vá até a mesa 1 e <b>segure</b> E para limpar. Eles sentam e pedem um refri: sirva na mesa com E.'},
 {id:'erva',title:'Erva no peso certo',pid:'erva',grams:500,text:'O freguês quer 500 g de erva-mate. Vá ao saco de erva nas mercadorias, segure E e solte na faixa verde. Se errar, aperte E para recomeçar. Entregue o pacote no balcão.'},
 {id:'fiado',title:'Pendura no caderninho',pid:'codorna',fiado:true,text:'Este freguês pediu ovos de codorna <b>fiado</b> (📒 no balão). Pegue os ovos na prateleira e entregue no balcão com E: o valor vai para o caderninho, sem entrar no caixa agora. Quem paga em dia traz 10% de juros de amizade; alguns demoram e outros somem. No Celular → Fiado você acompanha, cobra ou perdoa as contas. Para recusar um fiado, aperte X no balcão.'},
 {id:'mate',title:'Uma pausa para o chimarrão',text:'Agora, com as mãos livres, vá à cuia e segure E para tomar mate. Ele dá velocidade por alguns segundos e pode ser tomado sempre que quiser.'},
 {id:'clean',title:'Casa pronta para amanhã',text:'Com as mãos livres, aproxime-se da mesa 1 e segure E para limpar. Depois o primeiro dia termina. Amanhã o movimento e a dificuldade começam a crescer.'}
];
// Primeira lição: a despensa precisa destes produtos antes de abrir (no jogo novo, o prólogo da roça enche tudo).
const TUTORIAL_GOODS=['pao_xis','burger','ovo','queijo','salada','cerveja','refri','cigarro','codorna','erva'];
// O tutorial da bodega acontece no primeiro dia de portas abertas: o dia em que o prólogo da roça termina (ou o dia 1).
function firstDay(){return G.day===(G.tutorial?.day||1);}
function tutorialStockMissing(){if(!G.tutorial?.stockLesson||!tutorialActive())return [];return TUTORIAL_GOODS.filter(k=>(G.stock[k]||0)+bagQty(k)+G.deliveries.filter(d=>d.key===k).reduce((n,d)=>n+d.qty,0)<=0);}
function startWithoutStock(g){let cash=0;for(const[k,v]of Object.entries(GOODS))if(v.initial>0&&k!=='azeite'){cash+=v.initial*v.cost;g.stock[k]=0;}g.cash=round(g.cash+cash);g.stats=stats(g.cash);g.tutorial.stockLesson=true;g.tutorial.cleanLesson=true;for(const t of g.tables)if(!t.unlock){t.dirty=true;t.plates=2;}}
function tutorialDirtyTables(){return G.tutorial?.cleanLesson&&tutorialActive()&&!isCampo()?G.tables.filter(t=>t.dirty&&!t.unlock&&!t.group):[];}
// Antes de abrir no primeiro dia: comprar, limpar as mesas e abrir no caixa.
function tutorialPrepHint(){
 const miss=tutorialStockMissing();
 if(miss.length&&physicalShopping())return '<b>1/3 · Encha a despensa</b><p>'+(worldOut?'O que falta e de onde vem:':'Falta produto na despensa. O que é cru vira produto no forno e no tacho da cozinha; o resto vem da roça e das lojas. Ao voltar para a bodega, o inventário vai para a despensa.')+'</p><div class="need">'+TUTORIAL_GOODS.map(k=>'<span class="'+(miss.includes(k)?'':'ok')+'">'+nameOf(k)+(miss.includes(k)?' · '+goodSource(k):'')+'</span>').join('')+'</div>';
 if(worldOut)return '<b>Volte para a bodega</b><p>Entre pela <b>porta</b> da bodega: lá dentro, limpe as mesas e abra para o primeiro freguês.</p>';
 if(miss.length)return '<b>1/3 · Compre o estoque</b><p>Aperte <span class="keycap">C</span> para abrir o celular → <b>Fornecedor</b>. Os itens marcados em amarelo são os que faltam; troque de aba (Cozinha, Bebidas, Balcão) para achar todos.</p><div class="need">'+TUTORIAL_GOODS.map(k=>'<span class="'+(miss.includes(k)?'':'ok')+'">'+nameOf(k)+'</span>').join('')+'</div>';
 const dirty=tutorialDirtyTables();
 if(dirty.length)return '<b>2/3 · Limpe as mesas</b><p>O galpão ficou fechado muito tempo. Com as mãos livres, vá até a mesa indicada pela seta e <b>segure</b> <span class="keycap">E</span> por 1 segundo. Faltam '+dirty.length+(dirty.length>1?' mesas':' mesa')+'.</p>';
 return '<b>3/3 · Abra a bodega</b><p>Tudo pronto! Vá até o <b>caixa</b>, no balcão de atendimento embaixo à direita, aperte <span class="keycap">E</span> e escolha <b>Abrir a bodega</b>.</p>';
}
function tutorialActive(){return firstDay()&&G.tutorial.guided&&!G.tutorial.complete&&!prologueActive();}
function tutorialStep(){return TUTORIAL_STEPS[G.tutorial.step||0];}
function tutorialUpgradeAllowed(id){return true;}
// Freguês de treino nunca trava o tutorial: se faltar o produto da lição, o Valter empresta da despensa dele.
function tutorialEnsureStock(s){if(!s?.pid||RECIPES[s.pid])return;const need=s.grams||1;if(!orderable(s.pid,need)){G.stock[s.pid]=(G.stock[s.pid]||0)+need;say('O Valter emprestou '+stockText(s.pid,need)+' de '+nameOf(s.pid).toLowerCase()+' para a lição.');}}
function tutorialDelivered(actor,pid){if(!tutorialActive())return;const s=tutorialStep(),t=G.tutorial;if(s.queue){if(!(t.actors||[]).includes(actor.id))return;t.actors=t.actors.filter(id=>id!==actor.id);if(!t.actors.length)t.delivered=true;save();return;}if(actor.id!==t.actor||pid!==s.pid)return;t.delivered=true;save();}
function tutorialAdvance(){G.tutorial.step++;G.tutorial.actor=null;G.tutorial.delivered=false;G.tutorial.introduced=false;save();}
function tutorialTick(){
 if(!tutorialActive()||G.phase!=='open')return;
 const t=G.tutorial,s=tutorialStep();
 if(!s){t.complete=true;save();finishDay();return;}
 // Um freguês termina de sair antes de começar a explicação seguinte.
 if(t.delivered){if(G.shop.length||G.groups.length)return;tutorialAdvance();return;}
 if(!t.introduced){
  if(G.shop.length||G.groups.length||phoneOpen)return;
  t.introduced=true;
  if(s.id==='upgrade')phoneTab='upgrades';
  if(s.id==='mate')t.mate=false;
  if(s.pid||s.queue){
   let actor;
   if(s.queue){const list=s.queue.map(pid=>spawnShop({pid,training:true,fiado:false}));if(list.some(c=>!c)){G.shop=G.shop.filter(c=>!list.includes(c));t.introduced=false;return;}t.actors=list.map(c=>c.id);actor=list[0];}
   else if(s.table){
    // Na lição da fila das mesas, a mesa 1 fica suja: o grupo espera na porta até o Sadi limpar.
    if(s.id==='mesa'){const t0=G.tables[0];t0.dirty=true;t0.plates=Math.max(t0.plates||0,1);G.taught??={};G.taught.mesas=true;tutorialEnsureStock(s);}
    actor=spawnGroup({size:s.table,targetTable:0,fixedOrders:[s.pid],training:true});
   }
   else{tutorialEnsureStock(s);actor=spawnShop({pid:s.pid,grams:s.grams,training:true,fiado:!!s.fiado});}
   if(!actor){t.introduced=false;return;}
   t.actor=actor.id;
  }
  // Só a primeira etapa para o jogo; as seguintes entram num aviso rápido, com a seta mostrando onde ir.
  if(t.step===0)openDialog(s.title,`<p>${s.text}</p><p>Siga a seta amarela: ela mostra onde ir em cada etapa. Hoje é sem pressa, um freguês por vez.</p><button class="primary" data-act="close">Vamos lá</button>`,'tutorial');
  else{$('tutorialHint').classList.add('coach-new');setTimeout(()=>$('tutorialHint').classList.remove('coach-new'),900);AudioEngine.tick();}
  save();return;
 }
 if(s.id==='upgrade'&&G.up.trago&&!phoneOpen||s.id==='mate'&&t.mate||s.id==='clean'&&!G.tables[0].dirty&&!G.tables[0].group)tutorialAdvance();
}
// Para onde a seta aponta em cada etapa, conforme o que está na mão.
function tutorialTarget(){
 if(G.phase==='prep'){if(tutorialStockMissing().length)return physicalShopping()&&!worldOut?'door':null;const d=tutorialDirtyTables()[0];return d?'table:'+d.id:'service';}
 const s=tutorialStep(),t=G.tutorial,h=held();if(!s||t.delivered||(s.pid&&!t.actor))return null;
 if(s.queue){if(h&&!h.burned)return 'service';const c=queuedShop()[0];return c?c.pid==='refri'?'bottle:refri':'shop:'+c.pid:null;}
 const serve=pid=>h?.pid===pid&&(h.ready||!COOK[h.key])?'service':null;
 switch(s.id){
  case 'cigarro':return serve('cigarro')||'shop:cigarro';
  case 'cerveja':return h?.pid==='cerveja'&&h.ready?'service':'tap:cerveja';
  case 'trago':return h?.pid==='cachaca'&&h.ready?'service':'pour';
  case 'erva':return h?.pid==='erva'?'service':'bag';
  case 'fiado':return h?.pid==='codorna'?'service':'shop:codorna';
  case 'mate':return 'mate';
  case 'clean':return 'table:0';
  case 'xis':return tutorialXisTarget();
  case 'mesa':{const g=G.groups.find(g=>g.id===t.actor);if(!g)return null;if(g.state==='wait')return G.tables[0].dirty?'table:0':null;return h?.pid==='refri'?'table:0':'bottle:refri';}
 }
 return null;
}
function tutorialXisTarget(){
 const press=G.kitchen.press,h=held(),bi=G.kitchen.bench.findIndex(Boolean),b=G.kitchen.bench[bi],grill=G.kitchen.grill;
 if(h?.pid==='xis_salada'&&h.ready)return 'table:0';
 if(press)return press.ready||press.burned?'press':null;
 if(h?.burned)return 'trash';
 if(h?.kind==='assembled')return 'press';
 if(h?.kind==='ingredient'){if(COOK[h.key]&&!h.ready){const g=grill.findIndex(x=>!x);return g>=0?'grill:'+g:null;}return 'bench:'+Math.max(0,bi);}
 if(!b)return 'bin:pao_xis';
 const parts=benchParts(b);if(matchRecipe(parts))return 'bench:'+bi;
 const gi=grill.findIndex(Boolean);if(gi>=0)return grill[gi].ready||grill[gi].burned?'grill:'+gi:null;
 const next=['queijo','salada','burger','ovo'].find(k=>!parts.includes(k));return next?'bin:'+next:null;
}
function tutorialMesaHint(){
 const g=G.groups.find(g=>g.id===G.tutorial.actor);
 if(g?.state==='wait')return G.tables[0].dirty?'Eles estão na <b>fila perto da porta</b> (⌛) e reclamam: em mesa suja ninguém senta. Com as mãos livres, vá até a mesa 1 e <b>segure</b> E para limpar.':'Mesa limpa! Eles já vão sentar.';
 if(g)return held()?.pid==='refri'?'Leve o refri à mesa 1 e aperte E para servir.':'Sentaram! Pegue um refri na geladeira e sirva na mesa 1 com E.';
 return tutorialStep().text;
}
function tutorialXisHint(){
 const press=G.kitchen.press,h=held(),b=G.kitchen.bench.find(Boolean);
 if(h?.pid==='xis_salada'&&h.ready)return 'Leve o xis pronto à mesa 1 e aperte E para servir.';
 if(press)return press.burned?'Queimou! Retire e descarte na lixeira. Você pode preparar outro.':press.ready?'O xis está pronto! Retire da prensa com E e leve à mesa 1.':'Espere a prensa terminar; retire quando dourar para não queimar.';
 if(h?.kind==='assembled')return 'Leve o xis montado à prensa, embaixo à esquerda, e aperte E.';
 if(h?.burned)return 'Leve o ingrediente queimado à lixeira e pegue outro.';
 if(h?.kind==='ingredient')return COOK[h.key]&&!h.ready?'Leve '+nameOf(h.key)+' a uma chapa livre e aperte E. Retire quando estiver pronto.':'Leve '+nameOf(h.key)+' à bancada de montagem e aperte E.';
 if(!b)return 'Pegue pão na primeira caixa da cozinha e coloque na bancada central com E.';
 const parts=benchParts(b);if(matchRecipe(parts))return 'Com as mãos livres, aperte E na bancada para pegar o xis montado.';
 const cooking=G.kitchen.grill.find(Boolean);
 if(cooking)return cooking.burned?'Retire o ingrediente queimado e descarte na lixeira.':cooking.ready?'Retire '+nameOf(cooking.key)+' da chapa e coloque na bancada.':'Espere '+nameOf(cooking.key)+' cozinhar na chapa. Retire assim que ficar pronto.';
 const next=['queijo','salada','burger','ovo'].find(k=>!parts.includes(k));return 'Pegue '+nameOf(next)+'. '+(COOK[next]?'Cozinhe na chapa antes de colocar na bancada.':'Coloque diretamente no pão na bancada com E.');
}
function tutorialHint(){
 if(!tutorialActive())return '';
 const s=tutorialStep();if(!s)return '<b>Primeiro dia concluído!</b>';
 if(G.phase==='prep')return tutorialPrepHint();
 const text=G.phase==='prep'?'':G.tutorial.delivered?'Atendimento concluído! Espere o freguês sair para a próxima etapa.':s.id==='xis'?tutorialXisHint():s.id==='mesa'?tutorialMesaHint():s.text;
 return '<b>'+(G.tutorial.step+1)+' / '+TUTORIAL_STEPS.length+' · '+s.title+'</b><p>'+text+'</p>';
}
function tutorialWelcome(){if(tutorialStockMissing().length){openDialog('Dia 1 · Um passo de cada vez','<p>Hoje é sem pressa: um freguês por vez, com as instruções em cada etapa.</p>'+(physicalShopping()?'<div class="callout"><b>Primeiro, a despensa</b><br>Faltam produtos. O pão sai do forno a lenha (trigo da horta), o queijo do tacho (leite da vaca), o hambúrguer da carneação, o ovo dos ninhos e a salada da horta. Cerveja, refri e cigarro, no Atacado da Fronteira. O quadro no alto da tela mostra o que falta.</div>':'<div class="callout"><b>Primeiro, o estoque</b><br>A bodega está vazia. Aperte <b>C</b> para abrir o celular e, em <b>Fornecedor</b>, compre um pacote de cada: pão, hambúrguer, ovo, queijo, salada, cerveja, refri, cigarro, ovos de codorna em conserva e erva-mate. A entrega chega pela porta em alguns segundos.</div>')+'<p>Cuide sempre do estoque: o número em cada estação mostra quanto sobrou, e o que acaba não dá para vender. Comprado tudo, limpe as mesas que ficaram sujas e vá até o <b>caixa</b> (o balcão de atendimento) para abrir. O quadro azul no alto da tela mostra cada passo.</p>'+(physicalShopping()?'<button class="primary" data-act="close">Vamos às compras</button>':'<button class="primary" data-act="planBuy">Abrir o celular</button>')+'','welcome');return;}openDialog('Dia 1 · Um passo de cada vez','<p>Hoje é sem pressa: um freguês por vez, com as instruções em cada etapa. Amanhã começam os eventos e os pedidos com prazo.</p><button class="primary" data-act="close">Preparar para abrir</button>','welcome');}
