'use strict';
const PENALTY_BACKGROUND_DATA = 'assets/images/penalties/campinho-background.webp';
const penaltyBackgroundArt = new Image();
penaltyBackgroundArt.src = PENALTY_BACKGROUND_DATA;
penaltyBackgroundArt.addEventListener('load', () => { penaltyBackdrop = null; });
// Projeção em perspectiva; gol, bola e goleiro compartilham as mesmas coordenadas.
function penaltyProject(x,y,z) { const scale=1300/Math.max(1,z+7);return {x:600+x*scale,y:125+(2.6-y)*scale,scale}; }
function penaltyLine(points,color,width=2) {
 ctx.strokeStyle=color;ctx.lineWidth=width;ctx.beginPath();points.forEach(([x,y,z],i)=>{const p=penaltyProject(x,y,z);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.stroke();
}
function penaltyPolygon(points,color) {
 ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y,z],i)=>{const p=penaltyProject(x,y,z);if(i)ctx.lineTo(p.x,p.y);else ctx.moveTo(p.x,p.y);});ctx.closePath();ctx.fill();
}
function penaltyActor(sprite,x,z,options={}) {
 const p=penaltyProject(x,0,z),height=(options.height||1.78)*p.scale,frame=characterFrame(sprite,height),width=height*frame.width/frame.height;
 ellipse(p.x,p.y+2,width*.36,Math.max(3,p.scale*.07),'#233c2855');
 const angle=(options.dive||0)*.95;
 ctx.save();ctx.translate(p.x-(options.centerY!==undefined?Math.sin(angle)*height*.55:0),
  p.y-(options.centerY!==undefined?options.centerY*p.scale-height*.55*Math.cos(angle):(options.lift||0)*p.scale));
 if(options.dive)ctx.rotate(options.dive*.95);
 if(options.kick){
  const hip=-height*.27;
  ctx.drawImage(frame,0,0,frame.width,frame.height*.77,-width/2,-height,width,height*.77);
  ctx.drawImage(frame,0,frame.height*.75,frame.width*.5,frame.height*.25,-width/2,hip,width*.5,height*.25);
  ctx.save();ctx.translate(width*.18,hip);ctx.rotate(-options.kick*.7);ctx.drawImage(frame,frame.width*.5,frame.height*.75,frame.width*.5,frame.height*.25,-width*.25,0,width*.5,height*.25);ctx.restore();
 }else ctx.drawImage(frame,-width/2,-height,width,height);
 if(options.gloves){for(const side of [-1,1]){rect(side*width*.38-4,-height*.49,9,12,'#f5eacf',3,'#806942');rect(side*width*.38-3,-height*.48,7,3,'#daa34e',1);}}
 ctx.restore();
}
function drawPenaltyGoal() {
 const w=PENALTY.halfGoal,h=PENALTY.height,z=PENALTY.distance;
 penaltyPolygon([[-w,0,z],[-w,0,z+1.6],[w,0,z+1.6],[w,0,z]],'#a2bb9966');
 for(let i=0;i<=18;i++){const x=-w+i*2*w/18;penaltyLine([[x,0,z+1.6],[x,h,z+1.6],[x,h,z]],'#e5e7d4aa',1);}
 for(let i=0;i<=8;i++){const y=i*h/8;penaltyLine([[-w,y,z],[-w,y,z+1.6],[w,y,z+1.6],[w,y,z]],'#e5e7d4aa',1);}
 for(const side of [-1,1])for(let i=1;i<4;i++)penaltyLine([[side*w,0,z+i*.4],[side*w,h,z+i*.4]],'#cfd9c6aa',1);
 penaltyLine([[-w,0,z],[-w,h,z],[w,h,z],[w,0,z]],'#374a38',10);
 penaltyLine([[-w,0,z],[-w,h,z],[w,h,z],[w,0,z]],'#f3ecce',6);
 penaltyLine([[-w,h,z],[w,h,z]],'#fffbed',2);
}
function drawPenaltyBall(x,y,z,spin=0) {
 const p=penaltyProject(x,y,z),floor=penaltyProject(x,0,z),r=PENALTY.radius*p.scale;
 ellipse(floor.x,floor.y+2,r*(1+y*.14),r*.32,'#182c2455');
 ctx.save();ctx.translate(p.x,p.y);ctx.rotate(spin);ellipse(0,0,r,r,'#303b34');ellipse(-r*.06,-r*.08,r*.88,r*.88,'#fff4da');
 ctx.fillStyle='#343e37';ctx.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*.4;ctx.lineTo(Math.cos(a)*r*.43,Math.sin(a)*r*.43);}ctx.closePath();ctx.fill();
 for(let i=0;i<5;i++){const a=i*Math.PI*.4;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.43,Math.sin(a)*r*.43);ctx.lineTo(Math.cos(a+.15)*r*.88,Math.sin(a+.15)*r*.88);ctx.strokeStyle='#7e8776';ctx.lineWidth=Math.max(1,r*.06);ctx.stroke();}
 ctx.restore();
}
function penaltyBallPosition(m) {
 const s=m.shot;if(!s)return {x:0,y:.11,z:0,t:0};
 const t=clamp((m.clock-s.start)/s.duration,0,1),arc=.35+s.power*.55;
 let x=s.x*t+s.curve*1.1*Math.sin(t*Math.PI),y=.11+(s.y-.11)*t+4*arc*t*(1-t),z=11*t;
 if(s.resolved){const after=clamp(m.clock-s.start-s.duration,0,1.1);z+=s.result==='goal'?after*1.1:-after*2.2;x+=s.result==='post'?-Math.sign(x)*after*.7:0;y=Math.max(.11,y-after*2+Math.abs(Math.sin(after*8))*.2);}
 return {x,y,z,t};
}
function drawPenalties() {
 const m=G.penalties;if(!m)return;
 const cw=penaltyCanvas.clientWidth,ch=penaltyCanvas.clientHeight,dpr=renderDpr();
 if(!cw||!ch)return;
 if(penaltyCanvas.width!==Math.round(cw*dpr)||penaltyCanvas.height!==Math.round(ch*dpr)){penaltyCanvas.width=Math.round(cw*dpr);penaltyCanvas.height=Math.round(ch*dpr);}
 const original=ctx;ctx=penaltyContext;
 ctx.save();try{
 ctx.setTransform(penaltyCanvas.width/1200,0,0,penaltyCanvas.height/700,0,0);
 if(!penaltyBackdrop){
  penaltyBackdrop=document.createElement('canvas');penaltyBackdrop.width=1200;penaltyBackdrop.height=700;
  const foreground=ctx;ctx=penaltyBackdrop.getContext('2d');try{paintPenaltyBackdrop();}finally{ctx=foreground;}
 }
 ctx.drawImage(penaltyBackdrop,0,0);
 const spot=penaltyProject(0,0,0);
 // Especiais assistem pela cerca; nenhum NPC comum entra na disputa.
 const keeper=penaltyKeeperPosition(m),keeperSprite=m.turn===0?PEOPLE[m.opponent].sprite:avatarSprite();
 penaltyActor(keeperSprite,keeper.x,10.85,{height:1.8,gloves:true,dive:keeper.dive*keeper.side,centerY:keeper.y});
 if(['aim','charge'].includes(m.phase)&&m.turn===0){
  const x=m.aimX+m.curve*.65,p=penaltyProject(x,m.aimY,11),valid=Math.abs(x)<3.55&&m.aimY<2.33;
  ctx.save();ctx.setLineDash([6,8]);ctx.strokeStyle='#fff3c177';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(spot.x,spot.y-15);ctx.quadraticCurveTo((spot.x+p.x)/2+m.curve*80,p.y+70,p.x,p.y);ctx.stroke();ctx.restore();
  ctx.strokeStyle=valid?'#fff1a6':'#f39770';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,13+Math.max(0,m.power-.85)*70,0,Math.PI*2);ctx.stroke();
  rect(p.x-2,p.y-21,4,10,ctx.strokeStyle);rect(p.x-2,p.y+11,4,10,ctx.strokeStyle);rect(p.x-21,p.y-2,10,4,ctx.strokeStyle);rect(p.x+11,p.y-2,10,4,ctx.strokeStyle);
 }
 if(m.turn===1&&!m.keeper&&['ai','flight'].includes(m.phase)){const p=penaltyProject(m.keeperSide*2.65,m.keeperHigh,11);ctx.strokeStyle='#ffe28b';ctx.lineWidth=3;ctx.beginPath();ctx.arc(p.x,p.y,22,0,Math.PI*2);ctx.stroke();}
 const shooting=m.shot?clamp((m.clock-m.shot.start)/.24,0,1):m.phase==='ai'?clamp((m.clock-.9)/.55,0,1):0;
 const kick=Math.sin(shooting*Math.PI),kickerSprite=m.turn===0?playerFacingSprite(avatarSprite(),-1):PEOPLE[m.opponent].sprite;
 penaltyActor(kickerSprite,-.82+shooting*.42,-.62+shooting*.56,{height:1.66,kick});
 const ball=penaltyBallPosition(m);drawPenaltyBall(ball.x,ball.y,ball.z,m.shot?(m.clock-m.shot.start)*10:0);
 if(m.paused||m.quit)rect(0,0,1200,700,'#13251f66');
 }finally{ctx.restore();ctx=original;}
}

let penaltyBackdrop=null;
function paintPenaltyBackdrop(){
 if(penaltyBackgroundArt.complete&&penaltyBackgroundArt.naturalWidth){
  ctx.save();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='medium';
  ctx.drawImage(penaltyBackgroundArt,0,0,1200,700);ctx.restore();
  paintPenaltyMarkings();return;
 }
 const sky=ctx.createLinearGradient(0,0,0,240);sky.addColorStop(0,'#82bacc');sky.addColorStop(1,'#e0dfb1');ctx.fillStyle=sky;ctx.fillRect(0,0,1200,700);
 // Paisagem rural ao fundo, usando as árvores já carregadas no jogo.
 ellipse(100,126,300,80,'#809767');ellipse(750,148,440,80,'#768e62');
 for(let i=0;i<15;i++)worldSprite('nature',i%4===0?1:0,i*94-40,80+(i%3)*8,100,106);
 rect(0,202,1200,498,'#63934f');
 for(let z=-3;z<48;z+=3)penaltyPolygon([[-28,0,z],[28,0,z],[28,0,z+3],[-28,0,z+3]],Math.floor(z/3)%2?'#65954e':'#6e9e55');
 for(let i=0;i<160;i++){const x=((i*827)%1200),y=250+((i*313)%450);rect(x,y,2+(y-250)/180,1,'#b0bd6b33');}
 for(let i=0;i<36;i++){rect(i*36,182,5,37,'#634d30');}rect(0,190,1200,5,'#9c794c');rect(0,210,1200,4,'#866440');
 paintPenaltyMarkings();
}
// Markings and posts remain projected from the same geometry as shots and saves.
function paintPenaltyMarkings(){
 penaltyLine([[-22,0,11],[22,0,11]],'#e5e7c3',3);
 penaltyLine([[-9.16,0,11],[-9.16,0,5.5],[9.16,0,5.5],[9.16,0,11]],'#eee8c8',3);
 penaltyLine([[-20.16,0,11],[-20.16,0,-5.5],[20.16,0,-5.5],[20.16,0,11]],'#eee8c8',3);
 const spot=penaltyProject(0,0,0);ellipse(spot.x,spot.y,5,2,'#f6edce');
 drawPenaltyGoal();
}
