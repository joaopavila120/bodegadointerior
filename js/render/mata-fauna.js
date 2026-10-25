'use strict';
const MATA_FAUNA_RECTS=[[22,12,497,493],[532,224,538,266],[1113,139,410,365],[51,584,461,387],[543,534,499,445],[1086,530,420,469]];
// Fixed species scale and foot baseline: frames never change size as their legs move.
const MATA_FAUNA_WALK_RECTS=[
  [[22,88,372,430],[418,88,360,430],[800,88,365,430],[1184,88,352,430]],
  [[2,679,393,246],[402,679,376,246],[785,679,381,246],[1172,679,364,246]]
];
function mataFaunaPose(species,a){
  const moving=species===0?['walk','flee','climb'].includes(a.state):['walk','run','dig'].includes(a.state);
  const speed=['flee','run','dig'].includes(a.state)?1.5:1;
  return moving?Math.floor((a.frame||0)*speed)%4:0;
}
function mataFaunaWalk(species,a,x,y){
  const frame=mataFaunaPose(species,a),r=MATA_FAUNA_WALK_RECTS[species][frame];
  const scale=species===0?.195:.23,feet=species===0?512:920,anchor=frame*384+210;
  ctx.save();ctx.translate(x,y);if(a.dx<0)ctx.scale(-1,1);
  const ok=mataArtRect('mata-fauna-walk',r,(r[0]-anchor)*scale,(r[1]-feet)*scale,r[2]*scale,r[3]*scale);
  ctx.restore();return ok;
}
function mataAnimal(i,x,y,w,h,dx=1){
  const r=MATA_FAUNA_RECTS[i],s=Math.min(w/r[2],h/r[3]);
  ctx.save();ctx.translate(x,y);if(dx<0)ctx.scale(-1,1);
  const ok=mataArtRect('mata-fauna',r,-r[2]*s/2,-r[3]*s,r[2]*s,r[3]*s);ctx.restore();return ok;
}
{
  const quati=drawQuati,tatu=drawTatu,cobra=drawJararaca,gralha=drawGralha;
  drawQuati=function(q){
    if(q.state==='escaped')return;
    if(!MATA_ART['mata-fauna-walk'].naturalWidth)return quati(q);
    const climb=q.climb||0;
    ctx.save();ctx.globalAlpha=(1-climb*.85)*(q.state==='flee'&&!q.tree?clamp(4-(q.fleeT||0),0,1):1);mataFaunaWalk(0,q,q.x,q.y-climb*120);ctx.restore();
  };
  drawTatu=function(t){
    if(!MATA_ART['mata-fauna-walk'].naturalWidth)return tatu(t);if(t.state==='hidden')return;
    ctx.save();ctx.beginPath();ctx.rect(t.x-60,t.y-70,120,73);ctx.clip();
    mataFaunaWalk(1,t,t.x,t.y+(t.dig||0)*64);ctx.restore();
  };
  drawJararaca=function(b,cascavel=false){
    if(!MATA_ART['mata-fauna'].naturalWidth)return cobra(b,cascavel);
    const d=Math.hypot(worldOut.x-b.x,worldOut.y-b.y),hidden=b.state==='hide'&&d>150;
    let x=b.x,y=b.y;
    if(b.state==='strike'){const k=clamp(1-Math.max(0,b.t)/.18,0,1);x+=(b.tx-x)*k*.75;y+=(b.ty-y)*k*.75;}
    ctx.save();ctx.globalAlpha=hidden?.32:1;
    const shake=b.state==='warn'?Math.sin(frameClock*28)*1.5:0;
    mataAnimal(cascavel?3:2,x+shake,y,65,51,b.dx);ctx.restore();
    if(b.hp<b.max){txt(cascavel?'Cascavel':'Jararaca',b.x,b.y-65,11,'#ffe2a6');bar(b.x-18,b.y-59,36,b.hp/b.max,'#df674c');}
  };
  drawGralha=function(x,y,dx=1,fly=false,scale=1.7){if(fly||!MATA_ART['mata-fauna'].naturalWidth)return gralha(x,y,dx,fly,scale);mataAnimal(4,x,y,35*scale,36*scale,dx);};
  // Keep the original animated canvas bird, perched as well as flying.
}
