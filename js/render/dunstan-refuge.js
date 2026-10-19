// Painted first-floor refuge. Deeper procedural floors keep their own renderer.
'use strict';
const DUNSTAN_ROOM={x:211,y:100,scale:.85};
const dunstanRoomPoint=(x,y)=>({x:DUNSTAN_ROOM.x+x*DUNSTAN_ROOM.scale,y:DUNSTAN_ROOM.y+y*DUNSTAN_ROOM.scale});
const dunstanRoomImage=new Image();
const dunstanRoomReady=new Promise(resolve=>{dunstanRoomImage.onload=()=>resolve(true);dunstanRoomImage.onerror=()=>resolve(false);});
dunstanRoomImage.src='assets/images/interiors/dunstano-refugio-v1.webp';
const DUNSTAN_ROOM_FLOOR=[[265,350],[1305,350],[1325,385],[1450,400],[1430,780],[1040,800],[925,915],[650,915],[590,840],[240,790],[160,750],[160,415],[245,400]];
const DUNSTAN_ROOM_SOLIDS=[
  [608,520,422,110], // workbench and stool footprint
  [990,400,132,65], // anvil and stump
  [1340,550,125,180] // ore crates against the right wall
];
const DUNSTAN_ROOM_MASKS=[
  {y:630,points:[[600,474],[608,436],[896,436],[900,411],[974,411],[974,512],[1031,512],[1031,580],[974,580],[974,630],[610,630]]},
  {y:466,points:[[981,342],[1078,330],[1099,345],[1099,377],[1122,378],[1122,466],[990,466],[990,390],[1009,366]]}
];
function dunstanInsidePolygon(x,y){
  let inside=false;const a=DUNSTAN_ROOM_FLOOR;
  for(let i=0,j=a.length-1;i<a.length;j=i++){
    const [ax,ay]=a[i],[bx,by]=a[j];
    if((ay>y)!==(by>y)&&x<(bx-ax)*(y-ay)/(by-ay)+ax)inside=!inside;
  }
  return inside;
}
function dunstanRoomWalk(x,y){
  const px=(x-DUNSTAN_ROOM.x)/DUNSTAN_ROOM.scale,py=(y-DUNSTAN_ROOM.y)/DUNSTAN_ROOM.scale;
  // One small foot radius also works with dash and the existing corner recovery.
  if(![[0,0],[-17,0],[17,0],[0,-12],[0,12]].every(([dx,dy])=>dunstanInsidePolygon(px+dx,py+dy)))return false;
  return !DUNSTAN_ROOM_SOLIDS.some(([x,y,w,h])=>px>x-17&&px<x+w+17&&py>y-12&&py<y+h+12);
}
function drawDunstanRoom(){
  ctx.drawImage(dunstanRoomImage,DUNSTAN_ROOM.x,DUNSTAN_ROOM.y,1573*DUNSTAN_ROOM.scale,1000*DUNSTAN_ROOM.scale);
}
Object.assign(DUNSTAN_FORGE,{...dunstanRoomPoint(608,520),w:422*.85,h:110*.85});
DUNSTAN_ROUTE.splice(0,DUNSTAN_ROUTE.length,[520,700],[620,750],[830,800],[830,740],[620,750]);
{
  const build=buildCaveFloor;
  buildCaveFloor=function(floor){const run=build(floor);if(floor===1)Object.assign(run.ladder,dunstanRoomPoint(1395,410));return run;};
  const free=cavePlayerFree;
  cavePlayerFree=function(x,y){return caveState().floor===1?dunstanRoomWalk(x,y):free(x,y);};
  const M=WORLD_MAPS.caverna,spawn=M.spawn,enter=M.onEnter,spots=M.spots,draw=M.draw;
  M.spawn=function(){return caveState().floor===1?dunstanRoomPoint(280,750):spawn.call(this);};
  M.onEnter=function(){
    if(caveState().floor===1&&!dunstanRoomWalk(worldOut.x,worldOut.y))Object.assign(worldOut,this.spawn());
    enter.call(this);
  };
  M.spots=function(){
    const list=spots.call(this);
    if(caveState().floor===1){
      const rope=list.find(s=>s.id==='cave:rope');if(rope)Object.assign(rope,dunstanRoomPoint(215,740));
    }
    return list;
  };
  M.draw=function(view,seen,layers){
    if(caveState().floor!==1||!dunstanRoomImage.naturalWidth)return draw.call(this,view,seen,layers);
    rect(view.x,view.y,view.w,view.h,'#100e0b');drawDunstanRoom();
    layers.push({y:DUNSTAN.y,draw:()=>personDraw(PEOPLE[DUNSTAN_PERSON].sprite,DUNSTAN.x,DUNSTAN.y,DUNSTAN.walk,false,DUNSTAN.dx,false,0,DUNSTAN.dy)});
    // Only repaint silhouettes when a moving actor actually walks behind them.
    for(const mask of DUNSTAN_ROOM_MASKS){
      const feet=dunstanRoomPoint(0,mask.y).y,points=mask.points.map(([x,y])=>dunstanRoomPoint(x,y));
      const left=Math.min(...points.map(p=>p.x)),right=Math.max(...points.map(p=>p.x)),top=Math.min(...points.map(p=>p.y));
      if(![worldOut,DUNSTAN].some(p=>p.y<feet&&p.x+50>left&&p.x-50<right&&p.y>top&&p.y-140<feet))continue;
      layers.push({y:feet,draw:()=>{ctx.save();ctx.beginPath();points.forEach((p,n)=>ctx[n?'lineTo':'moveTo'](p.x,p.y));ctx.closePath();ctx.clip();drawDunstanRoom();ctx.restore();}});
    }
    // Gentle firelight; no per-frame texture generation or image filtering.
    layers.push({y:440,draw:()=>{ctx.save();ctx.globalCompositeOperation='screen';const p=dunstanRoomPoint(750,340);glow(p.x,p.y,95,.045+.008*Math.sin(frameClock*3),'255,130,45');ctx.restore();}});
    layers.push({y:worldOut.y-1,draw:drawCaveDash},{y:worldOut.y+1,draw:drawCaveSwing});
  };
}
