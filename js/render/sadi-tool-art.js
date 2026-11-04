// Sadi's own sabre and lasso poses. Art is lazy; damage, aim and hit timing stay in gameplay.
'use strict';
const sadiToolLoads={};
function sadiToolImage(tool){
  const sheet=SADI_TOOL_POSES[tool];if(!sheet)return null;
  const id='tool:sadi-'+tool;
  if(!ACTION_ART[id]){
    const im=ACTION_ART[id]=new Image();ACTION_ART_CROPS[id]=sheet;
    sadiToolLoads[tool]=new Promise(resolve=>{im.onload=()=>resolve(true);im.onerror=()=>resolve(false);im.src=sheet.file;});
  }
  return ACTION_ART[id];
}
function loadSadiToolArt(){
  for(const tool of Object.keys(SADI_TOOL_POSES))sadiToolImage(tool);
  return Promise.all(Object.values(sadiToolLoads)).then(r=>r.every(Boolean));
}
function sadiToolPose(){
  if(!started||scene||G.bocce||!(avatarSprite()===0||walkCharacterId(avatarSprite())==='sadi'))return null;
  const L=G.lasso;
  if(!L&&(!worldOut||playerMounted()||playerCarrying()))return null;
  let tool,stage,angle;
  if(L){
    if(L.stun>0||L.knock>0||L.dash>0||sadiRangedPose())return null;
    if(L.charging){stage=Math.sin(L.time*14)>=0?0:1;angle=Math.atan2(L.fy||0,L.fx||0);}
    else if(L.throw){const t=L.throw;stage=t.time<t.total?2:3;angle=t.artAngle??Math.atan2(t.ty-(G.player.y-40),t.tx-G.player.x);}
    else return null;
    tool='laco';
  }else{
    const cave=inCave(),run=cave?caveFloorRun():mataCombatOn()?mataNight:null;
    if(!run||run.hurt>0||run.dash||worldDash||run.faint||(cave&&caveDefeatActive()))return null;
    if(run.swing){
      if((run.swing.artWeapon??caveWeapon().id)!=='sabre')return null;
      tool='sabre';angle=run.swing.ang;stage=Math.min(3,Math.floor(clamp(1-run.swing.t/.2,0,1)*4));
    }else if(cave&&run.rope?.artStart!=null&&run.rope.t>0&&!sadiRangedPose()){
      const age=run.t-run.rope.artStart;if(age<0||age>.55)return null;
      tool='laco';stage=age<.18?2:3;angle=run.rope.artAngle;
    }else return null;
  }
  if(!sadiToolImage(tool)?.naturalWidth)return null;
  const dx=Math.cos(angle),dy=Math.sin(angle),direction=walkDirection(dx,dy);
  const height=L?130:(worldOut&&!worldMap().indoor?124:130)*sadiScale();
  return{tool,id:'tool:sadi-'+tool,stage,direction,index:direction*4+stage,flip:direction===1&&dx<0,angle,height};
}
function sadiLassoHand(p=G.lasso?G.player:worldOut,pose=sadiToolPose()){
  if(!p||pose?.tool!=='laco')return null;
  const sheet=SADI_TOOL_POSES.laco,f=sheet.frames[pose.index],scale=pose.height/sheet.reference;
  return{x:p.x+(f[6]-f[4])*scale*(pose.flip?-1:1),y:p.y+(f[7]-f[5])*scale};
}
{
  const person=drawExpansionPerson;
  drawExpansionPerson=function(sprite,x,y,walking,chef,dx,seated,mood,dy){
    const sadi=chef&&!seated&&(sprite===0||walkCharacterId(sprite)==='sadi');
    if(sadi){
      if(G.lasso)sadiToolImage('laco');
      else if(worldOut&&(inCave()||mataCombatOn())&&caveWeapon().id==='sabre')sadiToolImage('sabre');
      const pose=sadiToolPose();
      if(pose){ellipse(x,y+1,18,7,'#271c1755');if(actionSprite(pose.id,pose.index,x,y,pose.height,pose.flip))return true;}
    }
    return person(sprite,x,y,walking,chef,dx,seated,mood,dy);
  };
  // Snapshot the equipped blade only when a real swing starts (cooldown/guard may reject it).
  for(const kind of ['cave','forest']){
    const attack=kind==='cave'?caveAttack:mataAttack;
    const wrapped=function(){
      const run=kind==='cave'?(inCave()?caveFloorRun():null):mataNight,old=run?.swing,weapon=caveWeapon().id;
      if(weapon==='sabre')sadiToolImage('sabre');
      const result=attack();if(run?.swing&&run.swing!==old)run.swing.artWeapon=weapon;return result;
    };
    if(kind==='cave')caveAttack=wrapped;else mataAttack=wrapped;
  }
  const charge=lassoCharge,release=lassoRelease;
  lassoCharge=function(){sadiToolImage('laco');return charge();};
  lassoRelease=function(){
    const L=G.lasso,old=L?.throw,result=release();
    if(L?.throw&&L.throw!==old){
      const t=L.throw;t.artAngle=Math.atan2(t.ty-(G.player.y-40),t.tx-G.player.x);
      const hand=sadiLassoHand();if(hand){t.sx=hand.x;t.sy=hand.y;}
    }
    return result;
  };
  const combatLasso=salamancaLasso;
  salamancaLasso=function(){
    const run=salamancaRun(),old=run?.rope;sadiToolImage('laco');const result=combatLasso();
    if(run?.rope&&run.rope!==old){const r=run.rope,p=worldOut,n=r.target?diaboNeck(r.target):r;r.artStart=run.t;r.artAngle=Math.atan2(n.y-(p.y-70),n.x-p.x);}
    return result;
  };
  const rope=drawLassoRope;
  drawLassoRope=function(L){
    const pose=sadiToolPose(),hand=sadiLassoHand(G.player,pose);if(!hand)return rope(L);
    const p=G.player;ctx.save();ctx.strokeStyle='#d9b77b';ctx.lineWidth=2.5;ctx.lineCap='round';
    if(L.charging){
      const a=lassoAim(),ang=L.time*14,cx=p.x+Math.cos(ang)*4,cy=p.y-pose.height-10,rx=31,ry=9;
      ctx.beginPath();ctx.moveTo(hand.x,hand.y);ctx.lineTo(cx+Math.cos(ang)*rx,cy+Math.sin(ang)*ry);ctx.stroke();
      ctx.beginPath();ctx.ellipse(cx,cy,rx,ry,0,0,Math.PI*2);ctx.stroke();
      ctx.setLineDash([8,8]);ctx.strokeStyle='#fff4c488';ctx.beginPath();ctx.moveTo(p.x,p.y-60);ctx.lineTo(a.x,a.y);ctx.stroke();ctx.setLineDash([]);
      ctx.strokeStyle='#ffe28a';ctx.lineWidth=3;ctx.beginPath();ctx.ellipse(a.x,a.y,52,20,0,0,Math.PI*2);ctx.stroke();
    }
    if(L.throw){
      const t=L.throw,k=clamp(t.time/t.total,0,1),back=clamp((t.time-t.total)/.35,0,1);
      const fx=t.sx+(t.tx-t.sx)*k,fy=t.sy+(t.ty-t.sy)*k-Math.sin(k*Math.PI)*90;
      const x=fx+(hand.x-fx)*back,y=fy+(hand.y-fy)*back;
      ctx.beginPath();ctx.moveTo(hand.x,hand.y);ctx.quadraticCurveTo((hand.x+x)/2,Math.min(hand.y,y)-35*(1-back),x,y);ctx.stroke();
      ctx.beginPath();ctx.ellipse(x,y,34*(.5+k*.5)*(1-back*.85),12*(.5+k*.5)*(1-back*.85),0,0,Math.PI*2);ctx.stroke();
    }
    ctx.restore();
  };
}
