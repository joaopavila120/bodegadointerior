// Movimento, colisão, detecção de alvos e física do jogador
'use strict';

function canWalk(x,y){return x>=30&&x<=1572&&y>=424&&y<=875&&!furniture().some(f=>x+11>f.x&&x-11<f.x+f.w&&y+3>f.y&&y-9<f.y+f.h);}

// Se um móvel novo (melhoria, decoração) ficou em cima do jogador, ou um save antigo o deixou num lugar bloqueado, ele vai para o ponto livre mais próximo.
function unstickPlayer(){const p=G.player;if(!p||canWalk(p.x,p.y))return;for(let r=8;r<=320;r+=8)for(let k=0;k<16;k++){const a=k*Math.PI/8,x=p.x+Math.cos(a)*r,y=p.y+Math.sin(a)*r;if(canWalk(x,y)){p.x=x;p.y=y;return;}}const g=physicalGoal(p.x,p.y);p.x=g.x;p.y=g.y;}

function physicalGoal(x,y){if(canWalk(x,y))return{x,y};for(let r=20;r<110;r+=20)for(const[dx,dy]of[[0,r],[r,0],[-r,0],[0,-r],[r,r],[-r,r]])if(canWalk(x+dx,y+dy))return{x:x+dx,y:y+dy};return{x:875,y:820};}

function pathTo(from,to){const step=20,snap=p=>({x:Math.round(p.x/step)*step,y:Math.round(p.y/step)*step});let a=snap(physicalGoal(from.x,from.y)),b=snap(physicalGoal(to.x,to.y));if(!canWalk(a.x,a.y))a=physicalGoal(a.x,a.y);if(!canWalk(b.x,b.y))b=physicalGoal(b.x,b.y);const key=p=>p.x+','+p.y,queue=[a],prev=new Map([[key(a),null]]);let head=0,end=null;while(head<queue.length){const p=queue[head++];if(Math.hypot(p.x-b.x,p.y-b.y)<=20){end=p;break;}for(const[dx,dy]of[[20,0],[-20,0],[0,20],[0,-20]]){const n={x:p.x+dx,y:p.y+dy},k=key(n);if(!prev.has(k)&&canWalk(n.x,n.y)){prev.set(k,p);queue.push(n);}}}if(!end)return[];const path=[];for(let p=end;p;p=prev.get(key(p)))path.push(p);path.reverse();path.shift();path.push(physicalGoal(to.x,to.y));return path;}

function setDestination(actor,to){if(actor.dest&&Math.hypot(actor.dest.x-to.x,actor.dest.y-to.y)<2)return;actor.dest={...to};actor.path=pathTo(actor,to);}

function moveActor(a,dt,speed=112){if(!a.path?.length)return true;const oldX=a.x,oldY=a.y,p=a.path[0],d=Math.hypot(p.x-a.x,p.y-a.y);if(d<=speed*dt){a.x=p.x;a.y=p.y;a.path.shift();}else{a.dx=(p.x-a.x)/d;a.dy=(p.y-a.y)/d;a.x+=a.dx*speed*dt;a.y+=a.dy*speed*dt;}wetFootsteps(a,Math.hypot(a.x-oldX,a.y-oldY));return!a.path.length;}

function physicalPositionIn(p){return {...p,x:520,y:700,walk:false};}

function restoreRoutes(){if(!G.needsRoutes)return;delete G.needsRoutes;resetQueuePaths();for(const g of G.groups){if(g.state==='walkTable'){const t=G.tables.find(t=>t.id===g.table);if(t)setDestination(g,{x:t.x+t.w/2,y:t.y+t.h+39});}else if(g.state==='leave')setDestination(g,EXIT);}for(const c of G.shop)if(c.state==='leave')setDestination(c,EXIT);}

function nearest(){const p=G.player,options=[];for(const f of furniture()){const d=distRect(p,f);if(d<58)options.push({kind:'station',id:f.id,obj:f,d,label:f.label});}for(const item of G.floor){const d=Math.hypot(p.x-item.x,p.y-item.y);if(d<49)options.push({kind:'floor',obj:item,d:d-11,label:item.item.spoiled?'Recolher item estragado':'Recolher '+itemLabel(item.item)});}for(const puddle of G.puddles){const d=Math.hypot(p.x-puddle.x,p.y-puddle.y);if(d<40)options.push({kind:'station',id:'puddle:'+puddle.id,obj:{x:puddle.x-20,y:puddle.y-12,w:40,h:24},d:d-5,label:'Secar poça · segure E'});}return options.sort((a,b)=>a.d-b.d)[0]||null;}


function personCandidates(){const list=[];for(const c of G.shop)if(c.state!=='leave')list.push({person:c.person,x:c.x,y:c.y,actor:c});for(const g of G.groups){if(g.state==='leave')continue;const t=G.tables.find(t=>t.id===g.table);for(let j=0;j<g.size;j++)list.push({person:groupPerson(g,j),...groupSeatPosition(g,j),actor:g,table:t,diner:g.diners?.[j]});}return list;}
