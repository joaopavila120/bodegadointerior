'use strict';

function improvementCount(g=G){return UPGRADES.filter(u=>g.up[u.id]).length;}


function wetFootsteps(actor,distance){if(G.event.id!=='chuva'||actor.state==='leave'||!['open','closing'].includes(G.phase))return;actor.wetDistance=(actor.wetDistance||0)+distance;actor.dripDistance=(actor.dripDistance||0)+distance;if(actor.wetDistance>750||actor.dripDistance<62)return;actor.dripDistance=0;const x=actor.x,y=actor.y;if(G.puddles.length>=24||G.puddles.some(p=>Math.hypot(p.x-x,p.y-y)<30)||!canWalk(x,y))return;G.puddles.push({id:G.next++,x,y,r:18+Math.random()*6});}

function isFootball(){return ['gremio','inter','grenal'].includes(G.event.id);}
function isDerbyGroup(g){return G.event.id==='grenal'&&g?.size>1&&new Set(g.members?.map(p=>PEOPLE[p].team)).size>1;}
function footballTick(dt){if(!isFootball()||G.phase!=='open')return;const e=G.event;if(e.fired.result)return;if(G.elapsed>=DAY-25){finishFootball();return;}if(G.elapsed>=75&&!e.fired.halftime){e.fired.halftime=true;for(const g of G.groups.filter(g=>['seated','chat'].includes(g.state))){addDinerRound(g);}say('Intervalo na TV! Sai mais uma rodada para as mesas.');AudioEngine.crowd();}if(fightsAllowed()&&e.id==='grenal')for(const t of availableTables()){const g=G.groups.find(g=>g.id===t.group);if(!g||!isDerbyGroup(g)||!['seated','chat'].includes(g.state)||t.fight||t.fightCooldown)continue;g.derbyAge=(g.derbyAge||0)+dt;if(g.derbyAge>=18){g.derbyAge=0;triggerFight(t);}}}
// A TV só aparece quando há transmissão: jogo do Grêmio, do Inter ou Gre-Nal.
function drawTelevision(){if(!G.tv||!isFootball())return;ctx.save();ctx.translate(45.5,43.2);ctx.scale(1.15,1.15);wood(943,32,170,111,true);rect(951,39,154,88,'#152d26',4,'#b7a379');rect(958,45,140,75,'#487346');rect(961,48,134,69,'#487346',0,'#d9ddbd');ctx.strokeStyle='#d9ddbd';ctx.beginPath();ctx.moveTo(1028,48);ctx.lineTo(1028,117);ctx.stroke();ctx.beginPath();ctx.arc(1028,83,13,0,Math.PI*2);ctx.stroke();for(let i=0;i<6;i++){ellipse(976+i*21,74+Math.sin(frameClock+i)*18,3,5,i%2?'#e34842':'#83c4ec');}txt(G.event.id==='grenal'?'GRE-NAL':G.event.id==='gremio'?'GRÊMIO AO VIVO':'INTER AO VIVO',1028,132,11);ctx.restore();}
