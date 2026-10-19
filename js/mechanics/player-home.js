// A permanent home beside the bodega; sleep retains the existing end-of-day queues.
'use strict';
const PLAYER_HOME={id:'player-home',x:2110,y:300,w:500,h:390};
placeWorld(VILA.cancha,2730,190,650,500);
placeWorld(VILA.ferragem,3490,260,650,430);
placeWorld(SERRA.salao,800,1560,1180,400);
Object.assign(WORLD_DISCOVERIES.find(d=>d.id==='saberes'),{x:970,y:2010});
Object.assign(FORAGE.find(f=>f.id==='guabirobeira'),{x:1850,y:1370});
// The illustration and collision geometry use the same source coordinates.
const HOME_SCENE={x:86,y:65,scale:.8,w:1228.8,h:819.2};
const homePoint=(x,y)=>({x:HOME_SCENE.x+x*HOME_SCENE.scale,y:HOME_SCENE.y+y*HOME_SCENE.scale});
const homeRect=(x,y,w,h)=>({...homePoint(x,y),w:w*HOME_SCENE.scale,h:h*HOME_SCENE.scale});
const HOME_BED_POINT=homePoint(310,550);
const HOME_BOUNDS=homeRect(90,320,1370,460);
const HOME_ITEMS=[
  {box:[185,320,250,185],point:[310,550],label:'Dormir na sua cama',act:()=>homeBedMenu()},
  {box:[450,310,160,65],point:[530,414],label:'Guarda-roupa campeiro',text:'Bombacha, pala e roupa limpa, tudo bem dobrado.'},
  {box:[1180,300,235,110],point:[1280,454],label:'Fogão de casa',text:'O calor da lenha e o cheiro de café recebem quem volta da lida.'},
  {box:[775,310,330,40],point:[940,400],label:'Coleções e retratos',act:()=>homeCollectionsMenu()},
  {box:[90,635,195,120],point:[325,710],label:'Baú de lembranças',text:'Mantas e lembranças da família, bem guardadas no baú.'},
  {box:[140,280,70,75]}
].map((i,n)=>({...i,...homeRect(...i.box),kind:'homeScene'+n}));
const HOME_WALLS=[homeRect(615,310,40,175)];
const homeMap=interiorMap({id:'casa:sadi',name:'Sua casa campeira',sceneArt:'home-interior-v3',W:1400,H:950,bounds:HOME_BOUNDS,door:homePoint(768,0).x,doorHalf:82,
  walls:HOME_WALLS.map(r=>[r.x,r.y,r.w,r.h]),items:HOME_ITEMS,exit:()=>({map:'vila',...front(PLAYER_HOME,40),title:'Pátio de casa'})});
const homeWalk=homeMap.canWalk;
homeMap.canWalk=(x,y)=>{
  const p=homePoint(662,760),q=homePoint(873,956);
  if(x>p.x+12&&x<q.x-12&&y>=p.y&&y<=q.y)return true;
  return y<=HOME_BOUNDS.y+HOME_BOUNDS.h-10&&homeWalk(x,y);
};
homeMap.spawn=()=>homePoint(768,840);
homeMap.exitPoint=homePoint(768,945);
homeMap.edge=p=>p.y>homePoint(0,940).y?{map:'vila',...front(PLAYER_HOME,40),title:'Pátio de casa'}:null;
homeMap.spots=()=>HOME_ITEMS.filter(i=>i.point).map((i,n)=>({id:'home:'+n,...homePoint(...i.point),label:i.label,act:i.act||(()=>showInfo(i.label,i.text))}));
// Redraw only silhouettes that stand in front of Sadi. The rest is one cached scene.
const HOME_OCCLUSION=[
  {y:505,points:[[184,432],[214,310],[220,213],[425,208],[435,505],[183,505]]},
  {y:375,points:[[445,140],[610,140],[610,375],[450,375]]},
  {y:480,points:[[615,26],[655,26],[655,480],[615,480]]},
  {y:350,points:[[775,170],[1105,170],[1105,350],[775,350]]},
  {y:410,points:[[1180,220],[1418,220],[1418,410],[1180,410]]},
  {y:755,points:[[90,611],[281,603],[281,755],[90,755]]},
  {y:950,points:[[16,622],[62,620],[62,778],[609,778],[609,752],[654,752],[654,925],[16,925]]},
  {y:950,points:[[877,752],[923,752],[923,778],[1469,778],[1469,622],[1518,622],[1518,925],[877,925]]}
];
function drawHomeScene(){campeiraSprite(homeMap.sceneArt,0,HOME_SCENE.x,HOME_SCENE.y,HOME_SCENE.w,HOME_SCENE.h);drawHomeCollections();}
homeMap.draw=function(view,seen,layers){
  rect(view.x,view.y,view.w,view.h,'#100e0b');drawHomeScene();
  for(const mask of HOME_OCCLUSION){
    const feet=homePoint(0,mask.y).y,xs=mask.points.map(p=>homePoint(p[0],0).x),ys=mask.points.map(p=>homePoint(0,p[1]).y),p=worldOut;
    if(p.y>=feet||p.x+52<Math.min(...xs)||p.x-52>Math.max(...xs)||p.y<Math.min(...ys)||p.y-150>Math.max(...ys))continue;
    layers.push({y:feet,draw:()=>{
    ctx.save();ctx.beginPath();mask.points.forEach(([x,y],n)=>{const p=homePoint(x,y);ctx[n?'lineTo':'moveTo'](p.x,p.y);});ctx.closePath();ctx.clip();drawHomeScene();ctx.restore();
    }});
  }
};
WORLD_MAPS['casa:sadi']=homeMap;
{
  const M=WORLD_MAPS.vila,obstacles=M.obstacles,spots=M.spots,draw=M.draw;
  M.obstacles=function(){return [...obstacles.call(this),PLAYER_HOME];};
  M.spots=function(){return [...spots.call(this),{id:'player-home',...front(PLAYER_HOME),label:'Entrar na sua casa',act:()=>enterInterior('casa:sadi')}];};
  M.draw=function(view,seen,layers){draw.call(this,view,seen,layers);if(seen(PLAYER_HOME.x+250,PLAYER_HOME.y+390,550))layers.push({y:PLAYER_HOME.y+PLAYER_HOME.h,draw:()=>campeiraSprite('home-campeira-exterior-v1',0,PLAYER_HOME.x,PLAYER_HOME.y,PLAYER_HOME.w,PLAYER_HOME.h)});};
  const buildings=worldDressingBuildings;worldDressingBuildings=id=>id==='vila'?[...buildings(id),PLAYER_HOME]:buildings(id);
}
function nearHomeBed(){return worldOut?.map==='casa:sadi'&&Math.hypot(worldOut.x-HOME_BED_POINT.x,worldOut.y-HOME_BED_POINT.y)<95;}
function homeBedMenu(){
  if(!nearHomeBed())return;
  openDialog('Sua cama','<p>O pelego está ajeitado e a casa está quieta. Dormir encerra este dia; amanhã você acorda aqui para uma nova lida.</p><div class="actions"><button class="primary" data-act="homeSleep">Dormir até amanhã</button><button data-act="close">Ainda vou dar uma volta</button></div>','homeBed');
}
function prepareHomeSleep(){
  G.homeSleepDay=G.day;
  // Night visitors and scenes still happen in the bodega before sleep completes.
  worldOut=null;worldAway=null;showRpgBox('worldTalk',null);keys.clear();
  G.player={x:ENTRY.x,y:ENTRY.y-40,dx:0,dy:-1,walk:false};
}
{
  const next=nextDay;nextDay=function(eventId){
    const day=G.day;next(eventId);
    if(G.day>day&&G.homeSleepDay===day){
      delete G.homeSleepDay;
      worldOut={map:'casa:sadi',...HOME_BED_POINT,dx:0,dy:1,walk:false,back:{map:'vila',...front(PLAYER_HOME,40)}};
      keys.clear();save();saveDayStart();refreshHUD();
    }
  };
  const act=action;action=function(name,id){if(name==='homeSleep'){sleepDay();return;}return act(name,id);};
  const open=openDay;openDay=function(){if(G.phase==='closed'){warnDialog('A bodega já fechou','Descanse na cama da sua casa para começar o próximo dia.');return;}return open();};
}
