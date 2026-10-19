// Bespoke painted rooms. Gameplay hooks stay on the original map objects.
'use strict';
const PAINTED_INTERIORS={},PAINTED_ART={},PAINTED_READY={};
function paintedImage(id){
 if(!PAINTED_ART[id]){
  const image=new Image();PAINTED_ART[id]=image;
  PAINTED_READY[id]=new Promise(resolve=>{image.onload=image.onerror=resolve;});
  image.src='assets/images/interiors/'+id+'-v1.webp';
 }
 return PAINTED_ART[id];
}
async function loadPaintedInteriors(){for(const id of Object.keys(PAINTED_INTERIORS))paintedImage(id);await Promise.all(Object.values(PAINTED_READY));}
function paintedMask(box){const[x,y,w,h,top=y]=box;return {y:y+h,points:[[x,top],[x+w,top],[x+w,y+h],[x,y+h]]};}
const BESPOKE_HOUSES={
 valter:{boxes:[[135,320,435,85,180],[1070,320,255,132,195],[1325,300,85,50,230],[610,420,310,120,345],[115,520,215,130,425],[970,630,440,135,535]],points:{tv:[350,650]},resident:[790,650]},
 manolima:{boxes:[[140,320,380,195,190],[630,300,180,60,175],[870,290,130,65,235],[1165,315,230,85,205],[170,620,410,110,535],[875,530,385,180,405],[1300,700,150,80,640]],points:{table:[1040,755],gaita:[720,410]},resident:[770,615]},
 baitaca:{boxes:[[140,310,250,80,205],[440,310,165,55,250],[620,300,40,150,65],[695,315,90,55,170],[835,300,170,60,225],[1080,320,345,105,220],[250,525,390,120,415],[80,660,130,95,600],[1200,625,180,90,510]],points:{viola:[760,410]},resident:[850,610]},
 guri:{boxes:[[140,310,330,155,195],[615,310,40,95,40],[715,300,295,65,195],[1025,310,395,90,190],[270,590,390,90,495],[860,530,355,110,415],[80,680,165,85,625],[1300,710,145,70,630]],points:{table:[1020,700]},resident:[770,650]},
 badin:{boxes:[[135,300,420,65,180],[1030,300,365,130,175],[665,320,245,105,195],[130,550,310,100,435],[990,640,450,125,475],[80,695,80,75,630]],points:{salame:[945,700]},resident:[770,650]},
 mitodosul:{boxes:[[140,310,300,125,195],[615,310,40,90,40],[675,290,190,60,240],[1020,310,400,60,210],[175,590,395,80,490],[250,680,240,60,635],[965,565,400,160,430]],points:{computer:[1150,765]},resident:[750,620]},
 dianho:{boxes:[[140,290,470,80,160],[650,300,360,195,175],[1135,290,170,65,235],[210,560,380,140,470],[1010,550,335,95,465],[1300,700,165,75,640]],points:{fridge:[570,420],flag:[1200,405]},resident:[770,650]},
 lauro:{boxes:[[140,310,305,65,180],[625,300,290,70,90],[960,300,135,55,230],[1120,320,260,120,185],[155,540,310,75,465],[610,550,315,105,455],[1060,610,330,95,505],[90,680,70,55,620]],points:{trophy:[770,420]},resident:[960,710]},
 indavirus:{boxes:[[140,310,305,175,195],[445,300,110,50,130],[630,310,340,80,165],[1035,310,380,90,210],[165,660,300,95,575],[905,580,405,125,435],[80,670,65,105,550]],points:{desk:[1100,750]},resident:[770,630]},
 peixinhonabrasa:{boxes:[[145,310,345,65,210],[620,300,385,70,230],[1105,310,290,135,195],[275,440,300,100,375],[130,630,345,105,515],[1200,645,200,90,580],[1380,700,70,75,645]],points:{cooler:[1130,700]},resident:[770,650]},
 loligebien:{boxes:[[140,310,330,130,190],[670,300,375,75,125],[1180,300,220,90,180],[255,615,320,115,480],[1035,580,310,85,410],[80,690,130,85,640],[1250,730,190,45,690]],points:{chope:[1160,715]},resident:[770,650]},
 jayme:{boxes:[[170,300,380,60,140],[1005,320,240,155,190],[1255,310,155,70,210],[620,310,35,130,40],[685,315,75,55,185],[835,300,170,50,240],[140,570,415,160,465],[1040,620,250,135,505]],points:{shelf:[390,410],desk:[390,765]},resident:[770,650]}
};
function installPaintedHouse(id,spec,mapId='casa:'+id){
 const M=WORLD_MAPS[mapId],s=.8,origin={x:86,y:65};
 const point=([x,y])=>({x:origin.x+x*s,y:origin.y+y*s});
 const rectFor=([x,y,w,h])=>({...point([x,y]),w:w*s,h:h*s});
 const solids=spec.boxes.map(rectFor),points={};
 for(const i of M.items.filter(i=>'text' in i||i.act))points['item:'+i.kind+i.x]=point(spec.points[i.kind]||[770,540]);
 const masks=spec.boxes.map(paintedMask).concat([
 {y:950,points:[[16,622],[62,620],[62,778],[609,778],[609,752],[654,752],[654,925],[16,925]]},
 {y:950,points:[[877,752],[923,752],[923,778],[1469,778],[1469,622],[1518,622],[1518,925],[877,925]]}
 ]).map(m=>({y:point([0,m.y]).y,points:m.points.map(p=>{const q=point(p);return[q.x,q.y];})}));
 M.W=1400;M.H=950;M.bounds={...point([90,325]),w:1360*s,h:455*s};
 if(M.homeSpots)M.homeSpots[0]=Object.values(point(spec.resident));
 if(M.keeperSpot)M.keeperSpot.splice(0,2,...Object.values(point(spec.keeper)));
 M.exitPoint=point([768,945]);
 M.painted={id,rect:{...origin,w:1536*s,h:1024*s},points,masks,solids,spawn:point([768,840]),exitY:point([0,940]).y,
 walk(x,y){
  const p={x:(x-origin.x)/s,y:(y-origin.y)/s};
  if(p.x>677&&p.x<858&&p.y>=770&&p.y<=956)return true;
  return p.x>=110&&p.x<=1430&&p.y>=335&&p.y<=770&&!hitRect(solids,x,y);
 }};
 PAINTED_INTERIORS[id]=M;
}
for(const [id,spec] of Object.entries(BESPOKE_HOUSES))installPaintedHouse(id,spec);
// The dog keeps her place beside Mano Lima, outside the new sofa footprint.
Object.assign(BAIA,{x:646,y:641});
for(const [id,mapId] of [['agro','agro'],['gado','gado'],['atacado','atacado'],['ferragem','ferragem'],['acougue','acougue'],['casona','casa:marcio'],['igreja','igreja'],['salao','salao'],['ctg','ctg'],['oktoberfest','oktoberfest'],['laje','casona:laje']]){
 const M=WORLD_MAPS[mapId];
 M.painted={id,rect:{x:0,y:0,w:M.W,h:M.H},masks:[]};
 PAINTED_INTERIORS[id]=M;
}
const PAINTED_SHOPS={
 agro:{boxes:[[425,290,185,70,125],[700,290,225,70,125],[995,290,135,70,125],[240,535,265,85,400],[560,535,265,85,425],[955,620,395,70,545],[85,670,240,105,610],[1325,380,100,145,310]],points:{caixa:[1140,750]},keeper:[1120,530]},
 gado:{boxes:[[390,290,215,70,120],[935,290,215,70,120],[230,515,290,80,375],[580,515,265,80,375],[990,620,410,85,545],[80,670,330,100,610],[845,350,135,60,310],[985,390,155,80,310]],points:{caixa:[1190,755],arreio:[1160,475]},keeper:[1160,540]},
 atacado:{boxes:[[355,280,280,65,100],[900,280,285,65,100],[280,485,255,80,345],[605,490,255,80,350],[910,420,150,60,380],[940,630,520,85,560],[195,650,310,80,565]],points:{caixa:[1170,760],crates:[985,510]},keeper:[1160,540]},
 ferragem:{boxes:[[275,300,345,70,110],[885,300,275,70,110],[270,520,275,95,395],[605,520,230,95,395],[915,430,230,70,325],[955,650,450,95,585],[90,690,265,85,615]],points:{caixa:[1170,770],tools:[1030,535]},keeper:[1170,570]},
 acougue:{boxes:[[280,300,245,75,105],[1010,300,360,90,120],[240,530,290,75,410],[575,530,295,75,410],[980,650,385,90,585],[80,680,230,95,600]],points:{caixa:[1170,770]},keeper:[1150,565]}
};
for(const [id,spec] of Object.entries(PAINTED_SHOPS))installPaintedHouse(id,spec,id);
// Geometry measured against each finished illustration, in source-image pixels.
function measurePaintedRoom(mapId,geometry){
 const M=WORLD_MAPS[mapId],p=M.painted,r=p.rect,sx=r.w/geometry.size[0],sy=r.h/geometry.size[1];
 const point=([x,y])=>({x:r.x+x*sx,y:r.y+y*sy});
 const rectangle=([x,y,w,h])=>({...point([x,y]),w:w*sx,h:h*sy});
 p.solids=geometry.boxes.map(rectangle);
 p.masks=geometry.boxes.map(paintedMask).concat(geometry.masks||[]).map(m=>({y:point([0,m.y]).y,points:m.points.map(v=>Object.values(point(v)))}));
 const b=rectangle(geometry.floor),d=rectangle(geometry.door);
 M.bounds=b;p.spawn=point(geometry.spawn);M.exitPoint=point(geometry.exit);p.exitY=M.exitPoint.y-4;
 p.walk=(x,y)=>{
  if(x>d.x+14&&x<d.x+d.w-14&&y>=d.y&&y<=d.y+d.h)return true;
  return x>b.x+14&&x<b.x+b.w-14&&y>b.y+12&&y<b.y+b.h-8&&!hitRect(p.solids,x,y);
 };
 p.points={};
 for(const i of M.items.filter(i=>'text' in i||i.act)){
  const target=geometry.points?.[i.kind+i.x]||geometry.points?.[i.kind];
  if(target)p.points['item:'+i.kind+i.x]=point(target);
 }
}
{
 const M=WORLD_MAPS.casona;M.H=1160;M.painted.rect={x:0,y:0,w:1400,h:1160};
 measurePaintedRoom('casa:marcio',{size:[1466,1073],floor:[80,250,1310,580],door:[618,810,207,225],spawn:[733,810],exit:[733,1020],
 boxes:[[185,310,175,90,185],[420,250,115,55,120],[1110,310,170,90,185],[930,250,120,55,120],
 [620,205,155,40,145],[805,200,55,50,135],[780,345,95,50,280],
 [555,260,35,285,45],[878,260,32,285,45],
 [80,480,240,25,395],[435,480,120,25,395],[590,480,100,25,395],[775,480,103,25,395],[910,480,123,25,395],[1155,480,235,25,395],
 [90,580,450,45,490],[190,745,250,80,635],[920,545,210,50,455],[1185,535,180,45,480],[975,750,275,65,685],[1320,720,80,70,635]],
 masks:[{y:955,points:[[10,830],[615,830],[615,955],[10,955]]},{y:955,points:[[830,830],[1455,830],[1455,955],[830,955]]}],
 points:{bedbau115:[390,365],bedbau1145:[1060,365],miniatura:[1260,625],som:[1275,745]}});
 const rooms=M.rooms;Object.assign(rooms[0],{x:80,y:250,w:440,h:180});Object.assign(rooms[1],{x:565,y:250,w:270,h:260});Object.assign(rooms[2],{x:875,y:250,w:440,h:180});
}
{
 const M=WORLD_MAPS.igreja;
 M.H=1550;M.painted.rect={x:0,y:0,w:1200,h:1391*1200/1131};
 measurePaintedRoom('igreja',{size:[1131,1391],floor:[75,360,980,760],door:[478,1100,175,265],spawn:[565,1210],exit:[565,1345],
 boxes:[[450,325,235,70,270],[295,295,80,45,120],[755,295,75,45,120],
 ...[575,675,775,875,975].flatMap(y=>[[195,y,280,55,y-35],[655,y,285,55,y-35]])],
 masks:[{y:1270,points:[[8,1118],[475,1118],[475,1270],[8,1270]]},{y:1270,points:[[657,1118],[1120,1118],[1120,1270],[657,1270]]}],
 points:{altar:[566,445]}});
}
const HALL_GEOMETRY={
 salao:{size:[1606,979],boxes:[[565,275,470,55,165],[145,375,410,70,310],[145,510,410,70,445],[140,645,415,85,585],[1045,375,350,70,310],[1045,510,355,70,445],[1045,645,365,85,585],[1440,400,85,150,335],[1445,590,90,75,550],[135,250,140,70,185],[1240,270,200,55,185]],points:{stage:[800,370],bar:[1390,545],barrel:[290,330],stove:[1330,365]}},
 ctg:{size:[1607,979],boxes:[[535,285,540,65,180],[165,375,330,70,310],[160,520,330,75,455],[150,675,350,75,600],[1075,375,300,70,310],[1075,520,305,75,455],[1075,675,325,75,600],[1400,315,115,190,220],[1450,545,75,65,500]],points:{stage:[800,390],bar:[1365,510]}},
 oktoberfest:{size:[1606,979],boxes:[[545,270,520,85,165],[175,425,365,65,350],[160,565,385,75,495],[145,715,400,80,645],[1040,425,330,65,350],[1040,565,340,75,495],[1040,715,360,80,645],[1400,425,130,130,295],[1465,560,65,45,510],[195,255,125,75,195],[1335,255,130,80,185]],points:{stage:[800,395],bar:[1380,560],chope:[340,340],barrel:[1310,350]}}
};
for(const [id,g] of Object.entries(HALL_GEOMETRY)){
 const bottom=id==='oktoberfest'?800:770;
 measurePaintedRoom(id,{...g,floor:[85,285,1440,bottom-285],door:[695,bottom-12,210,960-bottom],spawn:[800,865],exit:[800,945],
 masks:[{y:930,points:[[10,bottom],[690,bottom],[690,930],[10,930]]},{y:930,points:[[925,bottom],[1590,bottom],[1590,930],[925,930]]}]});
 const ev=Object.values(SERVE_EVENTS).find(e=>e.map===id),f=WORLD_MAPS[id].painted.rect.w/g.size[0];
 const rows=id==='oktoberfest'?[505,650]:[460,610];
 ev.seats=rows.flatMap(y=>[[300*f,y*f],[420*f,y*f],[1230*f,y*f],[1330*f,y*f]]);
 ev.bar=ev.items.map((item,k)=>({item,x:k?1070:820,y:900}));
}
measurePaintedRoom('casona:laje',{size:[1639,960],floor:[135,330,1360,590],door:[135,900,1360,60],spawn:[820,830],exit:[820,945],
 boxes:[[270,315,400,90,95],[680,335,45,70,30],[80,410,60,75,40],[40,810,75,65,610],[1530,810,70,65,610],[840,460,510,130,350],[1410,390,115,90,290]],
 points:{grill:[520,460]}});
SERVE_EVENTS.casona.seats=[[740,560],[870,560],[1000,560],[680,420],[1160,520],[560,520],[1120,620]];
for(const M of Object.values(PAINTED_INTERIORS)){
 const enter=M.onEnter;M.onEnter=function(){paintedImage(this.painted.id);enter?.call(this);};
}
function drawPaintedInterior(M,view,layers){
 const spec=M.painted,key=spec.id==='casona'&&gemeosFighting()?'casona-away':spec.id,im=paintedImage(key),r=spec.rect;
 if(!im.naturalWidth){
  if(im.complete)return false;
  rect(view.x,view.y,view.w,view.h,'#211810');
  txt('Preparando ambiente...',M.W/2,M.H/2,20,'#e8d3ae');
  return true;
 }
 const paint=()=>{ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='low';ctx.drawImage(im,r.x,r.y,r.w,r.h);ctx.restore();};
 rect(view.x,view.y,view.w,view.h,'#100e0b');paint();
 const actors=[worldOut,...(M.residents||[]).filter(atHome).map(id=>{const k=M.residents.indexOf(id);return{x:M.homeSpots[k][0],y:M.homeSpots[k][1]};})];
 if(M.keeper)actors.push({x:M.keeperSpot[0],y:M.keeperSpot[1]});
 for(const mask of spec.masks){
  const xs=mask.points.map(p=>p[0]),ys=mask.points.map(p=>p[1]),minX=Math.min(...xs),maxX=Math.max(...xs),minY=Math.min(...ys),maxY=Math.max(...ys);
  if(!actors.some(p=>p&&p.y<mask.y&&p.x+55>minX&&p.x-55<maxX&&p.y>minY&&p.y-160<maxY))continue;
  layers.push({y:mask.y,draw:()=>{ctx.save();ctx.beginPath();mask.points.forEach(([x,y],n)=>ctx[n?'lineTo':'moveTo'](x,y));ctx.closePath();ctx.clip();paint();ctx.restore();}});
 }
 if(M.keeper)drawKeeper(M,layers);
 (M.residents||[]).filter(atHome).forEach(id=>{const k=M.residents.indexOf(id),[x,y]=M.homeSpots[k],i=PEOPLE.findIndex(p=>p.id===id);layers.push({y,draw:()=>personDraw(PEOPLE[i].sprite,x,y,false,false,0,false,0,1)});});
 return true;
}
