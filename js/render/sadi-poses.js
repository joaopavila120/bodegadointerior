// Sadi has complete empty-handed / serving poses, including a true planted idle.
// Food stays independent so every item and the two-slot upgrade use the same tray.
'use strict';
const SADI_POSE_ART={walk:WALK_ART.sadi},sadiPoseCache=new Map();
const sadiBaseReady=new Promise(done=>{const im=WALK_ART.sadi;if(im.complete)return done();im.addEventListener('load',done,{once:true});im.addEventListener('error',done,{once:true});});
const sadiArtLoaded=Promise.all([sadiBaseReady,...[['tray','sadi-tray-walk-v1'],['idle','sadi-idle-v1']].map(([key,file])=>new Promise(done=>{
  const image=new Image();SADI_POSE_ART[key]=image;image.onload=image.onerror=done;image.src='assets/images/'+file+'.png';
}))]);
function sadiPosesReady(){return ['walk','tray','idle'].every(k=>SADI_POSE_ART[k]?.naturalWidth);}
function sadiPoseSpec(x,y,forceCarry=null,facing=null){
  if(!sadiPosesReady())return null;
  const p=worldOut||G.player,pose=playerWalkPose(x,y),moving=pose.stride>.15;
  const carrying=forceCarry??playerCarrying(),dir=facing||p,direction=moving?walkDirection(dir.dx,dir.dy):0;
  const sheet=moving?(carrying?'tray':'walk'):'idle';
  const index=moving?walkPoseFrame('sadi',direction,pose.sidePhase):direction+(carrying?3:0);
  const crop=SADI_POSE_CROPS[sheet][index],height=worldOut&&!worldMap().indoor?124:130;
  const reach=playerReachPose();
  return {sheet,index,crop,height,scale:height/crop[3],moving,carrying,direction,flip:direction===1&&dir.dx<0,angle:reach.lean*.3,dip:reach.dip*.5};
}
function sadiPoseFrame(spec,pixels){
  const {sheet,index,crop}=spec,h=Math.min(384,Math.max(64,Math.ceil(pixels/32)*32)),key=sheet+':'+index+':'+h;
  if(!sadiPoseCache.has(key)){
    const c=document.createElement('canvas');c.height=h;c.width=Math.round(crop[2]*h/crop[3]);
    const g=c.getContext('2d');g.imageSmoothingEnabled=true;g.imageSmoothingQuality='medium';
    g.drawImage(SADI_POSE_ART[sheet],...crop.slice(0,4),0,0,c.width,c.height);
    if(sadiPoseCache.size>=120)sadiPoseCache.delete(sadiPoseCache.keys().next().value);
    sadiPoseCache.set(key,c);
  }
  return sadiPoseCache.get(key);
}
function sadiTrayPose(x,y){
  const s=sadiPoseSpec(x,y,true);if(!s)return null;
  const sign=s.flip?-1:1,ox=(s.crop[5]-s.crop[4])*s.scale*sign,oy=(s.crop[6]-s.crop[3])*s.scale;
  const cos=Math.cos(s.angle),sin=Math.sin(s.angle);
  return {x:x+ox*cos-oy*sin,y:y+s.dip+ox*sin+oy*cos,roll:s.angle,back:s.direction===2,
    spriteTray:true,slotX:s.direction===1?8:10,slotY:s.direction===1?3:0,sign,itemLift:11};
}
function sadiTrayItemAnchor(carry,slot){
  const n=G.up.tray?(slot?1:-1):0,dx=n*carry.slotX*carry.sign,dy=n*carry.slotY-carry.itemLift;
  return {x:carry.x+dx*Math.cos(carry.roll)-dy*Math.sin(carry.roll),y:carry.y+dx*Math.sin(carry.roll)+dy*Math.cos(carry.roll)};
}
function drawSadiPose(x,y,dx,dy){
  const s=sadiPoseSpec(x,y,null,{dx,dy});if(!s)return false;
  if(s.moving&&!s.carrying&&s.direction===1&&worldOut&&!worldMap().indoor)return false;
  const transform=ctx.getTransform(),frame=sadiPoseFrame(s,s.height*Math.hypot(transform.a,transform.b));
  if(s.carrying&&s.direction===2)drawPlayerCarry(x,y,true);
  ellipse(x,y+1,18,7,'#271c1755');ctx.save();ctx.translate(x,y+s.dip);ctx.rotate(s.angle);if(s.flip)ctx.scale(-1,1);
  ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='low';
  ctx.drawImage(frame,-s.crop[4]*s.scale,-s.height,s.crop[2]*s.scale,s.height);ctx.restore();
  drawPlayerTask(x,y);
  if(G.boost>0&&!['mate','clean','mop'].includes(G.task?.type)){
    bar(x-24,y+10,48,G.boost/mateStats().duration,'#b8e67a');txt(Math.ceil(G.boost)+'s',x,y+27,12,'#e1ffae');
  }
  drawPlayerCarry(x,y,false);drawPlayerTransfers();if(G.cosmetic)txt('★',x,y-106,17,'#ffd36b');
  return true;
}
