// Nível da bodega, metas e conquistas, despesas diárias,
// calendário gaúcho e ciclo de dia e noite.
'use strict';

// ---------- Avisos em destaque ----------
let bannerQueue=[],bannerTimer=null;
function showBanner(title,subtitle='',kind='info',opts){
 if(bodegaNoticeMuted(opts))return;
 bannerQueue.push({title,subtitle,kind});if(!bannerTimer)nextBanner();
}
function nextBanner(){
 const host=$('banner'),b=bannerQueue.shift();
 if(!host||!b){bannerTimer=null;host?.classList.add('hidden');return;}
 host.className='banner banner-'+b.kind;host.innerHTML=`<b>${escapeHTML(b.title)}</b>${b.subtitle?'<small>'+escapeHTML(b.subtitle)+'</small>':''}`;
 bannerTimer=setTimeout(()=>{host.classList.add('hidden');bannerTimer=setTimeout(nextBanner,350);},3600);
}

// ---------- Nível da bodega ----------
const LEVELS=[
 {xp:0,name:'Bodega de esquina'},{xp:300,name:'Bodega do bairro'},{xp:800,name:'Venda da colônia'},
 {xp:1600,name:'Armazém de respeito'},{xp:2700,name:'Bodega afamada'},{xp:4000,name:'Referência no interior'},{xp:5600,name:'Bodega lendária'}
];
function bodegaLevel(xp=G.xp){let n=1;LEVELS.forEach((l,i)=>{if(xp>=l.xp)n=i+1;});return n;}
function levelInfo(level=bodegaLevel()){return LEVELS[level-1];}
function levelProgress(){const l=bodegaLevel();if(l>=LEVELS.length)return 1;return clamp((G.xp-LEVELS[l-1].xp)/(LEVELS[l].xp-LEVELS[l-1].xp),0,1);}
function gainXP(n){G.xp=Math.max(0,(G.xp||0)+n);}
// O aluguel cresce com a bodega; o caderno de fiado também comporta mais.
function rentForLevel(level=bodegaLevel()){return 15+8*(level-1);}
const COSTELAO_SUPPLIES=9; // lenha extra e sal grosso do costelão
function creditLimit(level=bodegaLevel()){return 40+20*level;}

// ---------- Metas e conquistas ----------
const ACHIEVEMENTS=[
 {id:'portas',name:'Portas abertas',desc:'Concluir o primeiro dia.',xp:50,test:()=>G.day>(G.tutorial?.day||1)||G.phase==='closed'&&firstDay()&&!tutorialActive()&&!prologueActive()},
 {id:'freguesia',name:'Freguesia fiel',desc:'Fazer 100 atendimentos.',xp:120,test:()=>G.totalServed>=100},
 {id:'casacheia',name:'Casa cheia',desc:'Fazer 500 atendimentos.',xp:300,test:()=>G.totalServed>=500},
 {id:'caixa',name:'Caixa forrado',desc:'Juntar R$ 1.000 no caixa.',xp:150,test:()=>!G.testMode&&G.cash>=1000},
 {id:'diadeouro',name:'Dia de ouro',desc:'Lucro operacional de R$ 150 em um dia.',xp:150,test:()=>(G.report?.profit||0)>=150},
 {id:'completa',name:'Bodega completa',desc:'Comprar todas as melhorias.',xp:400,test:()=>UPGRADES.every(u=>G.up[u.id])},
 {id:'enfeitada',name:'Galpão enfeitado',desc:'Ter 10 peças de decoração.',xp:120,test:()=>decorCount()>=10},
 {id:'museu',name:'Museu gaúcho',desc:'Ter todas as peças de decoração.',xp:300,test:()=>decorCount()===DECOR.length},
 {id:'agenda',name:'Agenda cheia',desc:'Ganhar o contato de todos os personagens especiais.',xp:250,test:()=>specialPeople().every(hasContact)},
 {id:'amigo',name:'Amigo do peito',desc:'Chegar à amizade máxima com alguém.',xp:200,test:()=>specialPeople().some(i=>G.friends[i]>=100)},
 {id:'truco',name:'Rei do truco',desc:'Ganhar um campeonato de truco.',xp:200,test:()=>sportState().truco.titles>0},
 {id:'bocha',name:'Mão boa na bocha',desc:'Ganhar um campeonato de bocha.',xp:200,test:()=>sportState().bocha.titles>0},
 {id:'fiado',name:'Palavra de bodegueiro',desc:'Receber 10 contas do fiado.',xp:150,test:()=>(G.fiadoPaid||0)>=10},
 {id:'grenal',name:'Clássico na bodega',desc:'Fechar um dia de Gre-Nal.',xp:120,test:()=>G.phase==='closed'&&G.event.id==='grenal'},
 {id:'costelao',name:'Costelão de respeito',desc:'Vender 10 kg de costela.',xp:200,test:()=>(G.costelaSold||0)>=10000},
 {id:'lacador2',name:'Laçador de mão cheia',desc:'Laçar 15 bois.',xp:200,test:()=>(G.bullsLassoed||0)>=15},
 {id:'gruta',name:'Desceu na gruta',desc:'Chegar ao andar 5 da caverna da Serra.',xp:100,test:()=>(G.cave?.deepest||0)>=5},
 {id:'fundo',name:'Fundo da serra',desc:'Chegar ao andar 15 da caverna.',xp:250,test:()=>(G.cave?.deepest||0)>=15},
 {id:'baudovo',name:'O baú do vô',desc:'Abrir o baú do vô no fundo da caverna.',xp:200,test:()=>!!G.cave?.vo},
 {id:'cacador',name:'Caçador de assombração',desc:'Derrubar 100 bichos na caverna.',xp:200,test:()=>(G.cave?.killsTotal||0)>=100},
 {id:'afiado',name:'Fio de navalha',desc:'Afiar uma arma até +3 na pedra do São Dunstano.',xp:150,test:()=>Object.values(G.cave?.refine||{}).some(n=>n>=3)},
 {id:'salamanca',name:'Ferreiro de mosteiro',desc:'Forjar a Espada da Salamanca com o São Dunstano.',xp:300,test:()=>!!G.cave?.forged?.ouro},
 {id:'folclore',name:'Assombrações do Sul',desc:'Vencer todas as assombrações do folclore, de noite.',xp:300,test:()=>Object.keys(FOLK).every(k=>G.folk?.[k]?.wins)},
 {id:'saci',name:'Pegou o Saci',desc:'Segurar o Saci pela carapuça e fazer um desejo.',xp:150,test:()=>(G.saci?.caught||0)>0},
 {id:'dourado',name:'Rei do rio',desc:'Fisgar um dourado no trapiche.',xp:150,test:()=>!!G.fishRecords?.dourado},
 {id:'cavaleiro',name:'Cavaleiro crioulo',desc:'Botar ferraduras de ferro no cavalo crioulo.',xp:150,test:()=>G.mount?.shoes==='ferro'},
 {id:'album',name:'Álbum completo',desc:'Completar o álbum de figurinhas.',xp:400,test:()=>cardsOwned()===CARDS.length},
 {id:'jarau',name:'A Salamanca do Jarau',desc:'Vencer o Diabo Vermelho no andar 20 da caverna e libertar a Teiniaguá.',xp:300,test:()=>!!G.cave?.salamanca},
 {id:'lendaria',name:'Bodega lendária',desc:'Chegar ao nível máximo da bodega.',xp:0,test:()=>bodegaLevel()>=LEVELS.length}
];
function checkAchievements(){
 G.achievements??={};
 for(const a of ACHIEVEMENTS){
  if(G.achievements[a.id]||!a.test())continue;
  G.achievements[a.id]=G.day;gainXP(a.xp);
  showBanner('Conquista: '+a.name,a.desc+(a.xp?' · +'+a.xp+' XP':''),'achievement');AudioEngine.heart();
 }
}
let progressClock=0;
function progressCheck(){
 if(!started||!G)return;
 checkAchievements();
 const level=bodegaLevel();G.levelSeen??=level;
 if(level>G.levelSeen){G.levelSeen=level;showBanner('Nível '+level+' · '+levelInfo(level).name,'Novas melhorias liberadas.','level');AudioEngine.ready();}
 socialCheck();
}
function progressTick(dt){progressClock+=dt;if(progressClock<.5)return;progressClock=0;progressCheck();}
function achievementsHTML(){
 const l=bodegaLevel(),next=LEVELS[l];
 return `<section class="goals"><h3>Nível ${l} · ${levelInfo(l).name}</h3><div class="xp-track"><div style="width:${Math.round(levelProgress()*100)}%"></div></div><p>${G.xp} XP${next?' · faltam '+(next.xp-G.xp)+' para '+next.name:' · nível máximo'}. Limite do fiado: ${money(creditLimit(l))}.</p>
 <div class="level-steps">${LEVELS.map((v,i)=>`<span class="${i<l?'done':''}">${i+1} · ${v.name}</span>`).join('')}</div>
 <h3>Conquistas · ${Object.keys(G.achievements||{}).length}/${ACHIEVEMENTS.length}</h3><div class="achievements">${ACHIEVEMENTS.map(a=>{const got=G.achievements?.[a.id];return `<div class="achievement ${got?'got':''}"><b>${got?'★':'☆'} ${a.name}</b><small>${a.desc}${a.xp?' · '+a.xp+' XP':''}${got?' · dia '+got:''}</small></div>`;}).join('')}</div></section>`;
}

// ---------- Despesas ----------
function litLamps(){return DECOR.filter(d=>d.light&&decorVisible(d)).length;}
function dailyCosts(){
 // No costelão a bodega fica fechada: sem luz nem querosene, só o fogo de chão.
 // Sem aluguel: o galpão foi herdado do vô. Mas a casa tem manutenção (gelo, gás, limpeza, conserto), que cresce com o
 // nível e com as mesas extras (o primeiro dia não paga). No costelão não há luz nem manutenção do salão, mas vão lenha e sal.
 const share=Math.min(G.elapsed/DAY,1),costelao=G.event.id==='costelao',power=costelao?0:round(6+6*share+litLamps()),supplies=costelao?COSTELAO_SUPPLIES:0;
 const upkeep=costelao||firstDay()?0:5+3*(bodegaLevel()-1)+(G.up.table3?3:0)+(G.up.table4?3:0);
 return {power,rent:upkeep,supplies};
}

// ---------- Calendário gaúcho ----------
// Cada dia de jogo é um dia da semana; cada semana corresponde a um mês, começando em março.
const WEEKDAYS=['Segunda','Terça','Quarta','Quinta','Sexta','Sábado','Domingo'];
const MONTHS=['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
// O jogo começa numa sexta-feira: dois dias depois vem o primeiro costelão.
// calOffset: dias da roça antes da bodega abrir (o prólogo). O dia do tutorial da bodega é sempre uma sexta.
function calOffset(){return (typeof G!=='undefined'&&G?.calOffset)||0;}
function dayNumber(day=G.day){return Math.max(1,day-calOffset());}
function calendar(day=G.day){const i=Math.max(0,day-1-calOffset())+4,weekday=i%7,week=Math.floor(i/7),month=(2+week)%12;return {weekday,week,month,name:WEEKDAYS[weekday],monthName:MONTHS[month],label:WEEKDAYS[weekday]+' · semana de '+MONTHS[month]};}
const WINTER=[5,6,7];
function fixedEventFor(day){
 if(day-calOffset()<=1)return 'normal';
 const{weekday,week,month}=calendar(day);
 if(weekday===6)return 'costelao';                       // domingo: costelão no campo
 if(weekday===2)return ['grenal','gremio','inter'][(week+2)%3]; // quarta: futebol na TV
 if(weekday===5)return day===2?'normal':week%2?'campeonato':'baile';
 return null;
}
function randomEventPool(day){const pool=['normal','chuva','radio','feira'];if(WINTER.includes(calendar(day).month))pool.push('geada','chuva');return pool;}
function weekPreview(day=G.day){
 const first=day-calendar(day).weekday;
 return `<div class="week-strip">${WEEKDAYS.map((w,i)=>{const d=first+i,fixed=d>=1?fixedEventFor(d):null,e=fixed?EVENTS[shownEventId(fixed)]:null,today=d===day;return `<div class="${today?'today':''}${d<day?' past':''}"><b>${w.slice(0,3)}</b><span>${e?e.icon:'?'}</span><small>${e?e.name:'sorteio'}</small></div>`;}).join('')}</div>`;
}

// ---------- Dia e noite ----------
// O expediente vai das 14h às 23h; a preparação é à tarde.
// Manhã das 6h em diante (rural.js); o expediente corre da hora em que a bodega abriu até as 23h.
function gameMinutes(){if(G.phase==='prep')return morningActive()?morningMinutes():13*60;if(duskActive())return morningMinutes();if(G.phase==='closed')return 23*60+30;const start=G.openAt??14*60;return start+Math.min(G.elapsed/DAY,1)*(23*60-start);}
function gameTimeText(){const m=Math.floor(gameMinutes());return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function nightLevel(){return clamp((gameMinutes()-18*60)/120,0,1);}
let nightCanvas=null;
function drawNight(){
 const n=nightLevel();if(n<=0)return;
 nightCanvas??=document.createElement('canvas');const scale=.5;
 if(nightCanvas.width!==W*scale){nightCanvas.width=W*scale;nightCanvas.height=H*scale;}
 const c=nightCanvas.getContext('2d');c.setTransform(scale,0,0,scale,0,0);c.globalCompositeOperation='source-over';c.clearRect(0,0,W,H);
 const lamps=isCampo()?[]:DECOR.filter(d=>d.light&&decorVisible(d));
 c.fillStyle=`rgba(10,14,36,${n*Math.max(.24,.5-lamps.length*.06)})`;c.fillRect(0,0,W,H);
 c.globalCompositeOperation='destination-out';
 const hole=(x,y,r,a)=>{const g=c.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,`rgba(0,0,0,${a})`);g.addColorStop(1,'rgba(0,0,0,0)');c.fillStyle=g;c.fillRect(x-r,y-r,r*2,r*2);};
 for(const d of lamps)hole(roomX(d.light[0]),roomY(d.light[1]),340,.95);
 if(isCampo()){hole(525,520,420,.9);}
 else if(decorState().fogao_lenha===true)hole(roomX(FIRE_LIGHT[0]),roomY(FIRE_LIGHT[1]),240,.8);
 if(!isCampo()){if(G.tv&&isFootball())hole(1228,147,200,.6);hole(1524,300,150,.45);}
 hole(G.player.x,G.player.y-60,120,.35);
 ctx.drawImage(nightCanvas,0,0,W,H);
}
function drawNightWindow(){
 const n=nightLevel();if(n<=0||isCampo())return;
 const[x0,y0,x1,y1]=RAIN_WINDOW.view,left=roomX(x0),top=roomY(y0),width=roomX(x1)-left,height=roomY(y1)-top;
 rect(left,top,width,height,`rgba(8,14,40,${.72*n})`);
 if(!isRainDay())for(let i=0;i<14;i++){ctx.globalAlpha=n*(.5+.5*Math.sin(frameClock*2+i));rect(left+(i*53.7)%width,top+(i*17.3)%(height*.45),1.6,1.6,'#f4f0d2');}
 ctx.globalAlpha=1;
}
