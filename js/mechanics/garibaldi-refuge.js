'use strict';
const GARIBALDI_ROOM={x:85,y:25,scale:.8};
const garibaldiRoomPoint=(x,y)=>({x:GARIBALDI_ROOM.x+x*.8,y:GARIBALDI_ROOM.y+y*.8});
const GARIBALDI_ROOM_SOLIDS=[[195,300,320,95],[640,260,340,115],[1000,270,310,80],[1230,400,225,285],[205,620,210,95]];
const GARIBALDI_GUEST={...garibaldiRoomPoint(790,560),step:0,pause:2,walk:false,dx:0};
const GARIBALDI_ROOM_ROUTE=[[790,560],[1040,555],[1000,650],[640,650],[790,560]];
function garibaldiRoomWalk(x,y){
  const px=(x-85)/.8,py=(y-25)/.8;
  const floor=px>145&&px<1415&&py>345&&py<744,door=px>705&&px<817&&py>=700&&py<1000;
  return (floor||door)&&!GARIBALDI_ROOM_SOLIDS.some(([x,y,w,h])=>px>x-18&&px<x+w+18&&py>y-12&&py<y+h+12);
}
function garibaldiRoomDraw(){const im=MATA_ART['garibaldi-refuge-interior'];if(im?.naturalWidth)ctx.drawImage(im,85,25,1536*.8,1024*.8);}
WORLD_MAPS['casa:garibaldi']={
  id:'casa:garibaldi',name:'Refúgio de Giuseppe Garibaldi',indoor:true,W:1400,H:880,
  spawn:()=>garibaldiRoomPoint(760,825),canWalk:garibaldiRoomWalk,
  edge:p=>p.y>garibaldiRoomPoint(0,960).y?{map:'mata',...garibaldiFront(),title:'Mata de Araucárias'}:null,
  spots:()=>[
    {id:'garibaldi:talk',x:GARIBALDI_GUEST.x,y:GARIBALDI_GUEST.y,radius:110,label:'Prosear com Giuseppe Garibaldi',act:garibaldiTalk},
    {id:'garibaldi:gear',...garibaldiRoomPoint(1130,410),radius:120,label:'Equipamentos de viagem · melhorias e bornal',act:garibaldiShop},
    {id:'garibaldi:maps',...garibaldiRoomPoint(785,420),radius:90,label:'Mesa de mapas · trilhas e acampamentos',act:mataCampsDialog},
    {id:'garibaldi:cot',...garibaldiRoomPoint(380,445),radius:100,label:'Descansar no catre de campanha',act:ranchoRest},
    {id:'garibaldi:exit',...garibaldiRoomPoint(760,900),radius:75,label:'Voltar para a mata',act:()=>switchMap({map:'mata',...garibaldiFront()})}
  ],
  draw(view,seen,layers){
    rect(view.x,view.y,view.w,view.h,'#110f0c');garibaldiRoomDraw();
    layers.push({y:GARIBALDI_GUEST.y,draw:()=>drawGaribaldi(GARIBALDI_GUEST.x,GARIBALDI_GUEST.y,1,GARIBALDI_GUEST.dx,GARIBALDI_GUEST.walk,GARIBALDI_GUEST.dy||0)});
    // Trunk silhouette: repaint only the furniture, not a rectangle of floor.
    if(worldOut.x<430&&worldOut.y<597&&worldOut.y>440)layers.push({y:597,draw:()=>{ctx.save();const p=garibaldiRoomPoint(205,570);ctx.beginPath();ctx.rect(p.x,p.y,215*.8,145*.8);ctx.clip();garibaldiRoomDraw();ctx.restore();}});
  }
};
{
  const tick=outsideTick;
  outsideTick=function(dt){
    tick(dt);if(worldOut?.map!=='casa:garibaldi')return;const p=GARIBALDI_GUEST;
    if(paused||modal||scene||worldTalkOpen()){p.walk=false;return;}
    if(p.pause>0){p.pause-=dt;p.walk=false;return;}
    const q=garibaldiRoomPoint(...GARIBALDI_ROOM_ROUTE[p.step]),dx=q.x-p.x,dy=q.y-p.y,d=Math.hypot(dx,dy),v=Math.min(d,dt*28);
    if(d<2){p.step=(p.step+1)%GARIBALDI_ROOM_ROUTE.length;p.pause=2.5;p.walk=false;return;}
    p.walk=true;p.dx=dx/d;p.dy=dy/d;p.x+=dx/d*v;p.y+=dy/d*v;
  };
}
