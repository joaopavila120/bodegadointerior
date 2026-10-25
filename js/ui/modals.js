// Menus, painéis de fornecedor/melhorias, telas de ajuda e boas-vindas
'use strict';

function openDialog(title,html,type='menu'){$('talkUI')?.classList.add('hidden');modal=type;keys.clear();pointerHold=false;$('dialogTitle').textContent=title;$('dialogContent').innerHTML=html;$('overlay').classList.remove('hidden');$('dialogContent').querySelector('button')?.focus();}

function closeDialog(force=false){if(!force&&modal==='farmGame'){cancelFarmGame();return;}if(!force&&modal==='talk'){talkSkip();return;}if(!force&&modal==='sportChallenge'){answerSportChallenge(false);return;}if(modal==='bocceTutorialEnd'){bocceTutorialHome();return;}const fromReport=!force&&modal==='report';if(modal==='tvAward')G.tvAwardPending=false;if(modal==='farmGame')farmGame=null;if(G.game&&!force){leaveCards();return;}cardInvite=null;modal=null;paused=false;$('overlay').classList.add('hidden');$('talkUI')?.classList.add('hidden');keys.clear();canvas.focus();save();if(fromReport)startChallengeVisit();}

function welcome(){if(prologueActive())prologueWelcome();else if(firstDay())tutorialWelcome();else gameGuide();}

function help(){openDialog('Receitas e controles',`<div class="callout"><b>WASD</b> andar · <b>E</b> interagir ou segurar · <b>Q</b> soltar · <b>R</b> retirar ingrediente · <b>1 / 2</b> bandeja · <b>C</b> celular · <b>Y</b> truco · <b>Esc</b> menu</div>
<details class="rules" open><summary>Xis e torrada</summary><p>Pão na bancada; queijo e salada vão direto, carne e ovo passam pela chapa. Leve a montagem à prensa e tire antes de queimar. Torrada: pão e salame direto na prensa.</p></details>
<details class="rules" open><summary>Bebidas e balança</summary><p>Cerveja, cachaça e bitter: segure E e solte na faixa verde. Erva, pinhão e bergamota: segure E e solte no peso pedido. Pegou errado? Devolva na origem com E.</p></details>
<details class="rules"><summary>Mesas</summary><p>Cada pessoa tem seu pedido e prazo no balão. Mesa vazia suja: segure E por 1 s para limpar.</p></details>
<details class="rules"><summary>Mate, chuva e brigas</summary><p>Segure E na cuia para correr mais rápido. Poças deixam lento: segure E para secar. Briga: chegue perto, aperte E e acerte a sequência.</p></details>
<div class="actions"><button class="primary" data-act="close">Voltar</button></div>`,'help');}

function togglePhone(force){if(G.task?.type==='weigh')abandonWeigh();phoneOpen=typeof force==='boolean'?force:!phoneOpen;keys.clear();pointerHold=false;cancelHold();$('phone').classList.toggle('hidden',!phoneOpen);if(phoneOpen){G.tutorial.phone=true;renderPhone();$('phone').querySelector('button')?.focus();}else canvas.focus();}

function renderPhone(){
 // Melhorias não ficam no celular: compra na Ferragem (só o bodoque fica na Casa do Campeiro).
 const upTab=document.querySelector('[data-act="tab"][data-id="upgrades"]'),upHidden=!(tutorialActive()&&tutorialStep()?.id==='upgrade');upTab?.classList.toggle('hidden',upHidden);if(upHidden&&phoneTab==='upgrades')phoneTab='supplier';
 document.querySelectorAll('[data-act="tab"]').forEach(b=>b.classList.toggle('active',b.dataset.id===phoneTab));$('phoneNote').textContent=walletText()+' · '+(G.phase==='open'||G.phase==='closing'?'expediente em andamento':'organize antes de abrir');const event=`<div class="phone-event"><b>${eventInfo().icon} ${eventInfo().name}</b><button class="small" data-act="event">Programação</button></div>`,deliveries=G.deliveries.map(d=>`<div class="delivery-line">${nameOf(d.key)} +${stockText(d.key,d.qty)} · ${Math.ceil(d.left)} s</div>`).join('');
 let html='';
 // Na tela inicial (menu de ícones, phone-retro.js) não há app aberto.
 if(phoneTab==='home')html='';
 else if(phoneTab==='supplier'&&physicalShopping())html=event+deliveries+shoppingListHTML()+phoneAtacadoHTML();
 else if(phoneTab==='supplier')html=event+deliveries+`<div class="phone-cat">${['Cozinha','Bebidas','Balcão','Campo'].map(c=>`<button class="${phoneCat===c?'active':''}${tutorialStockMissing().some(k=>GOODS[k].cat===c)?' needed':''}" data-act="category" data-id="${c}">${c}</button>`).join('')}</div>`+(phoneCat==='Campo'?campoSupplierHTML():'')+Object.entries(GOODS).filter(([k,v])=>v.cat===phoneCat&&!v.noSupplier&&unlocked(k)).map(([k,v])=>{const room=stationCapacity(k)-G.stock[k]-G.deliveries.filter(d=>d.key===k).reduce((n,d)=>n+d.qty,0),qty=Math.max(0,Math.min(v.pack||6,room));return `<div class="supply${tutorialStockMissing().includes(k)?' needed':''}"><span class="icon">${itemIconHTML(k)}</span><div><b>${nameOf(k)}</b><p>${stockText(k)} / ${stockText(k,stationCapacity(k))}<br>Pacote: ${stockText(k,qty||v.pack||6)}</p></div><button class="primary" data-act="buy" data-id="${k}" ${qty<=0||!hasCash(qty*v.cost)?'disabled':''}>${qty<=0?'Cheio / a caminho':'Comprar · '+money(qty*v.cost)}</button></div>`;}).join('')+`<button class="aid" data-act="aid" ${G.cash>=40||G.aidDay===G.day?'disabled':''}>Ajuda da comunidade · sem dívida</button>`;
 else if(phoneTab==='decor')html=decorPanel();
 else if(phoneTab==='missions')html=missionsPanel();
 else if(phoneTab==='fiado')html=fiadoPanel();
 else if(phoneTab==='contacts')html=contactsPanel();
 else if(tutorialActive()&&tutorialStep().id==='upgrade')html='<div class="phone-intro"><h3>Sua primeira melhoria</h3><p>Instale a Mesa de tragos gratuitamente e feche o celular com C para continuar.</p></div>'+upgradeCatalog();
 else if(physicalShopping())html=upgradePhonePanel()+`<button class="aid" data-act="save">Salvar progresso</button>`;
 else html=`<p class="phone-sub">${improvementCount()} melhorias compradas</p>`+upgradeCatalog()+`<button class="aid" data-act="save">Salvar progresso</button>`;
 // O celular atualiza a cada meio segundo; só refaz a tela quando algo mudou.
 if(setHTML($('phoneContent'),html)&&phoneTab==='contacts')drawContactPortraits();

}

// Ligar pro Armazém Geral: chega pela porta em segundos, mas custa bem mais que na loja (e que produzir na roça).
const PHONE_MARKUP=1.6;
function phoneAtacadoHTML(){const list=Object.keys(GOODS).filter(k=>unlocked(k)&&!GOODS[k].noSupplier&&!GOODS[k].removed&&!GOODS[k].farmOnly).sort((a,b)=>G.stock[a]/stationCapacity(a)-G.stock[b]/stationCapacity(b));return `<h3 class="phone-section">Ligar pro Armazém Geral</h3><div class="phone-note">Faltou produto? Chega pela porta em alguns segundos, mas sai ${Math.round((PHONE_MARKUP-1)*100)}% mais caro que na loja, e bem mais caro que produzir na roça.</div>`+list.map(k=>{const v=GOODS[k],pending=G.deliveries.filter(d=>d.key===k).reduce((n,d)=>n+d.qty,0),qty=Math.max(0,Math.min(v.pack||6,stationCapacity(k)-G.stock[k]-pending)),cost=round(qty*v.cost*PHONE_MARKUP);return `<div class="supply"><span class="icon">${itemIconHTML(k)}</span><div><b>${nameOf(k)}</b><p>Na bodega: <b>${stockText(k)}</b></p></div><button class="primary" data-act="phoneBuy" data-id="${k}" ${qty<=0||!hasCash(cost)?'disabled':''}>${qty<=0?'Cheio / a caminho':'Pedir '+stockText(k,qty)+' · '+money(cost)}</button></div>`;}).join('');}
function orderGoods(key,markup=1){if(!GOODS[key]||!unlocked(key))return;const pending=G.deliveries.filter(d=>d.key===key).reduce((n,d)=>n+d.qty,0),qty=Math.min(GOODS[key].pack||6,stationCapacity(key)-G.stock[key]-pending);if(qty<=0){say('Estação cheia ou entrega a caminho.');return;}const cost=round(qty*GOODS[key].cost*markup);if(!hasCash(cost)){say('Não há saldo para este pacote.');AudioEngine.bad();return;}spendCash(cost);if(key==='salame'&&!G.toastLesson)G.toastLesson={day:G.day,done:false,actor:null};G.stats.purchases+=cost;G.deliveries.push({id:G.next++,key,qty,cost,left:8,total:8});AudioEngine.phone();save();renderPhone();}

function aid(){if(G.cash>=40||G.aidDay===G.day){say('A ajuda fica disponível uma vez por dia quando o caixa cai abaixo de R$ 40.');return;}G.aidDay=G.day;G.cash+=60;G.stats.aid+=60;for(const k of ['pao_xis','burger','ovo','queijo','salada','cachaca','cigarro','codorna','erva']){const n=Math.min(k==='erva'?1000:3,stationCapacity(k)-G.stock[k]);if(n>0){G.avg[k]=G.avg[k]*G.stock[k]/(G.stock[k]+n);G.stock[k]+=n;}}say('A comunidade trouxe R$ 60, mercadorias e ingredientes. Bora recomeçar!');save();renderPhone();}

function buyUpgrade(id){const u=UPGRADES.find(u=>u.id===id);if(!u||G.up[id])return;if(championshipActive()&&id.startsWith('table')){say('Amplie o salão antes de abrir: as duplas deste campeonato já estão inscritas.');return;}if(!tutorialUpgradeAllowed(id)){say('Sua primeira melhoria será a Mesa de tragos, na etapa do celular.');return;}if(bodegaLevel()<(u.level||1)){say('Essa melhoria pede a bodega no nível '+u.level+'.');AudioEngine.bad();return;}if(G.rep<u.rep||!hasCash(u.cost)||(u.requires&&!G.up[u.requires])){say(u.requires&&!G.up[u.requires]?'Compre a melhoria anterior primeiro.':'Confira dinheiro e reputação.');AudioEngine.bad();return;}spendCash(u.cost);G.stats.investments+=u.cost;G.up[id]=true;if(id==='salame'&&!G.toastLesson)G.toastLesson={day:G.day,done:false,actor:null};G.tutorial.improvement=true;if(['table3','table4'].includes(id)&&G.event.id==='campeonato'&&['open','closing'].includes(G.phase)){const table=G.tables.find(t=>t.unlock===id);table.previousMode=table.mode;table.mode='truco';}if(GEAR[id])G.gear=id;if(u.goods){const k=u.goods,n=GOODS[k].starter||4;G.avg[k]=G.stock[k]?G.avg[k]*G.stock[k]/(G.stock[k]+n):0;G.stock[k]+=n;say(nameOf(k)+' liberado com '+stockText(k,n)+' para começar.');}if(!canWalk(G.player.x,G.player.y)){const goal=physicalGoal(G.player.x,G.player.y);G.player.x=goal.x;G.player.y=goal.y;}if(id==='table3'||id==='table4'||id==='grill3')for(const actor of [...G.shop,...G.groups])if(actor.dest){const goal={...actor.dest};actor.dest=null;setDestination(actor,goal);}if(id==='cigarro_py'){say('Cigarro do Paraguai: agora cada maço vale R$ 18.');}AudioEngine.heart();save();renderPhone();if(modal==='worldStore'){refreshStore();buyFeedback('upgrade',id,'Instalado na bodega');}}

function equipGear(id){if(!GEAR[id]||(id!=='feet'&&!G.up[id]))return;if(!['prep','closed'].includes(G.phase)){say('Troque de botas antes de abrir ou após fechar.');return;}G.gear=id;save();renderPhone();}

function gearPanel(){return bootsPanel()+matePanel();}
function bootsPanel(){return `<div class="upgrade"><h3>Equipamento · ${GEAR[G.gear].name}</h3><p>Velocidade permanente: +${Math.round(movementBonus()*100)}%. Botas dão velocidade permanente; o mate dá um impulso temporário.</p><div class="gear-options">${Object.entries(GEAR).filter(([id])=>id==='feet'||G.up[id]).map(([id,v])=>`<button class="small" data-act="gear" data-id="${id}" ${G.gear===id||!['prep','closed'].includes(G.phase)?'disabled':''}>${v.name}${G.gear===id?' ✓':''}</button>`).join('')}</div></div>`;}
function matePanel(){return `<div class="upgrade"><h3>${mateStats().name}</h3><p>+${Math.round(mateStats().bonus*100)}% por ${mateStats().duration} s. Segure E na cuia central.</p></div>`;}

function tablePanel(){return `<div class="upgrade"><h3>Mesas da casa</h3><p>Mesa 2 atende normalmente e também permite jogar truco. As demais são de restaurante; campeonatos usam todas para cartas.</p></div>`;}

function toggleTable(){/* Tipos fixos: não há troca manual de mesas. */}
