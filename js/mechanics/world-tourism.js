'use strict';
// Regional stories live at ordinary resting spots, without miniature landscapes.
// Sources for the factual text are kept in docs/tourism-sources.md.
VILA.ctg = {x:2040,y:1890,w:1000,h:420};
SC.oktoberfest = {x:1640,y:230,w:780,h:430};
const WORLD_DISCOVERIES = [
 {id:'espinilho',map:'vila',name:'Parque do Espinilho',x:710,y:2152,setting:'tree',
  where:'Perto da margem oeste, ao sul da casa de Valter.',
  text:'Em Barra do Quaraí, o Parque Estadual do Espinilho protege uma savana-parque: campos com árvores esparsas, como espinilhos e inhanduvais. No Brasil, essa formação está restrita ao extremo oeste gaúcho.',
  clue:'Caminhe para nordeste desse recanto. Um visitante amarelo se esconde na vegetação rasteira.'},
 {id:'colonial',map:'sc',name:'Memórias da Família Colonial',x:2160,y:1782,setting:'garden',
  where:'No sudeste do mapa, além da brasa do Peixinho.',
  text:'O Museu da Família Colonial, em Blumenau, reúne casas históricas e objetos que contam o cotidiano da antiga colônia. Nos fundos do complexo ficam o horto e um memorial bastante incomum.',
  clue:'A nordeste desse recanto, observe de perto as pequenas pedras entre a vegetação.'},
 {id:'cardeal',map:'vila',name:'O visitante amarelo',x:873,y:2050,secret:true,parent:'espinilho',
  text:'Você reparou no cardeal-amarelo! Essa ave está entre as espécies associadas aos ambientes protegidos pelo Parque do Espinilho. O segredo aqui é observar a fauna sem retirar nada da natureza.'},
 {id:'saberes',map:'serra',name:'A colônia além das pedras',x:970,y:1870,secret:true,
  text:'Uma pequena lembrança da colônia: o patrimônio dos Caminhos de Pedra também está nos ofícios. A tecelagem, a moagem da erva-mate e os produtos coloniais ajudam a contar essa história viva.'},
 {id:'gatos',map:'sc',name:'Os gatos de Edith Gaertner',x:2360,y:1700,secret:true,parent:'colonial',
  text:'Esse segredo tem inspiração real: o Cemitério dos Gatos integra o conjunto do Museu da Família Colonial, em Blumenau. O espaço guarda a memória do carinho de Edith Gaertner por seus gatos.'}
];
function discoveryPoint(d) { return {x:d.x,y:d.y}; }
function travelState(g=G) {
 if(!g.travel||typeof g.travel!=='object'||Array.isArray(g.travel))g.travel={seen:{}};
 if(!g.travel.seen||typeof g.travel.seen!=='object'||Array.isArray(g.travel.seen))g.travel.seen={};
 return g.travel;
}
function discoverWorldPlace(id) {
 const d=WORLD_DISCOVERIES.find(p=>p.id===id);if(!d||!worldOut||worldOut.map!==d.map)return;
 const p=discoveryPoint(d);if(Math.hypot(worldOut.x-p.x,worldOut.y-p.y)>(d.secret?46:94))return;
 const state=travelState(),first=!state.seen[id];
 if(first){state.seen[id]={day:G.day};const rw=d.secret?{cash:20,xp:20}:{cash:10,xp:10};grantReward(rw);AudioEngine.ready();worldSay((d.secret?'Segredo registrado no caderno!':'Nova descoberta no caderno de viagem!')+' +'+money(rw.cash)+' · +'+rw.xp+' XP');}
 showInfo(d.name,d.text+(d.clue?' Pista: '+d.clue:''));
}
function tourismJournalHTML() {
 const seen=travelState().seen,found=WORLD_DISCOVERIES.filter(d=>seen[d.id]).length;
 return `<article class="panel"><h3>Caderno de viagem · ${found}/${WORLD_DISCOVERIES.length}</h3><p>Chegue perto de um lugar e aperte E para descobrir sua história. Há três segredos com pistas nos registros. O mapa reúne versões estilizadas de lugares reais de cidades diferentes.</p>${['vila','serra','sc'].map(map=>`<details><summary>${{vila:'Fronteira',serra:'Serra Gaúcha',sc:'Blumenau e Pomerode'}[map]}</summary>${WORLD_DISCOVERIES.filter(d=>d.map===map).map(d=>`<p><b>${seen[d.id]?'✓ ':''}${d.secret&&!seen[d.id]?'Segredo ainda não encontrado':escapeHTML(d.name)}</b><br>${seen[d.id]?escapeHTML(d.text)+(d.clue?'<br><em>Pista: '+escapeHTML(d.clue)+'</em>':''):d.secret?'As pistas estão nos lugares desta região.':escapeHTML(d.where)}</p>`).join('')}</details>`).join('')}</article>`;
}
function tourismPaths(map) {
 if(map==='vila')return [[VILA.ctg.x+VILA.ctg.w/2-12,2310,24,38],[1600,2324,VILA.ctg.x+VILA.ctg.w/2-1588,24]];
 if(map==='sc')return [[SC.oktoberfest.x+SC.oktoberfest.w/2-24,660,48,300]];
 return [];
}
// Copy the existing community-hall layout, with an independent identity and exit.
for(const [id,name] of [['ctg','CTG da Fronteira'],['oktoberfest','Salão da Oktoberfest']]){
 const source=WORLD_MAPS.salao;
 WORLD_MAPS[id]=interiorMap({...source,id,name,items:source.items.map(i=>({...i,
  ...(i.kind==='stage'?{label:id==='ctg'?'Palco do CTG':'Palco da Oktoberfest',text:id==='ctg'?'O CTG é um lugar de encontro para danças, música e tradições gaúchas. Hoje o salão está pronto para receber a comunidade.':'Um salão para a bandinha, o baile e os encontros da comunidade, inspirado nas festas de Blumenau.'}:{}),
  ...(i.kind==='bar'?{label:'Copa',text:'A copa e as mesas estão prontas para a próxima festa.'}:{})
 }))});
}
const tourismVilaObstacles=WORLD_MAPS.vila.obstacles;
WORLD_MAPS.vila.obstacles=()=>[...tourismVilaObstacles(),VILA.ctg];
SC.obstacles.push(SC.oktoberfest);
for(const id of ['vila','serra','sc']){
 const map=WORLD_MAPS[id],spots=map.spots,draw=map.draw;
 map.spots=function(){
  const list=spots.call(this);
  if(id==='serra'){const church=list.find(s=>s.id==='igreja');church.x=SERRA.igreja.x+SERRA.igreja.w*.27;}
  if(id==='vila')list.push({id:'ctg',...front(VILA.ctg),label:'Entrar no CTG da Fronteira',act:()=>enterInterior('ctg')});
  if(id==='sc')list.push({id:'oktoberfest',...front(SC.oktoberfest),label:'Entrar no salão da Oktoberfest',act:()=>enterInterior('oktoberfest')});
  return [...list,...WORLD_DISCOVERIES.filter(d=>d.map===id).map(d=>({id:'discovery:'+d.id,...discoveryPoint(d),radius:d.secret?42:90,label:d.secret?'Observar de perto':'Curiosidade: '+d.name,act:()=>discoverWorldPlace(d.id)}))];
 };
 map.draw=function(view,seen,layers){
  draw.call(this,view,seen,layers);
  const venue=id==='vila'?VILA.ctg:id==='sc'?SC.oktoberfest:null;
  if(venue&&seen(venue.x+venue.w/2,venue.y+venue.h,venue.w))layers.push({y:venue.y+venue.h,draw:()=>worldSprite(id==='vila'?'architecture-ctg':'architecture-oktoberfest',0,venue.x,venue.y-35,venue.w,venue.h+35)});
  for(const d of WORLD_DISCOVERIES.filter(d=>d.map===id)){
   const p=discoveryPoint(d);if(!seen(p.x,p.y,600))continue;
   if(d.bench)layers.push({y:p.y-25,draw:()=>worldSprite('pew',0,p.x-55,p.y-56,110,31)});
   else if(d.setting==='tree')layers.push({y:p.y-35,draw:()=>worldSprite('nature',0,p.x-100,p.y-290,200,255)});
   else if(d.setting==='garden')layers.push({y:p.y-30,draw:()=>{
    worldSprite('frontier-flora',0,p.x-58,p.y-100,85,65);
    worldSprite('frontier-flora',4,p.x+2,p.y-66,72,36);
   }});
   else if(d.secret)layers.push({y:p.y-8,draw:()=>{
    // Clues blend into the same undergrowth as the map; no miniature props.
    worldSprite('frontier-flora',d.id==='gatos'?3:4,p.x-22,p.y-30,44,22);
   }});
  }
 };
}
