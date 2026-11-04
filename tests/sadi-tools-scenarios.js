(() => {
  const results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.day=40;G.phase='prep';
  started=true;paused=false;scene=null;phoneOpen=false;closeDialog(true);skipWorldTalk();keys.clear();worldDash=null;
  G.cave={facao:true,floor:2,deepest:2,hp:100,up:{},dunstanTaught:true,forged:{sabre:true},weapon:'sabre'};
  worldOut={map:'caverna',x:600,y:600,dx:1,dy:0};caveRun=buildCaveFloor(1);caveRun.floor=2;caveRun.day=G.day;caveTrip=null;
  const run=caveRun;run.rocks=[];run.beasts=[];run.shots=[];run.hurt=0;run.cd=0;run.dash=null;
  for(const[tool,a]of Object.entries(SADI_TOOL_POSES)){
    check(ACTION_ART['tool:sadi-'+tool]?.naturalWidth===a.size[0]&&a.frames.length===12,tool+' atlas loads all poses');
    for(const f of a.frames)check(f[0]>=0&&f[1]>=0&&f[0]+f[2]<=a.size[0]&&f[1]+f[3]<=a.size[1]&&f[4]>0&&f[4]<f[2]&&f[5]<=f[3],tool+' valid crop/ground anchor');
  }
  const beast={kind:'sanguanel',x:650,y:590,hp:500,max:500,state:'rest',t:2};run.beasts=[beast];
  const damage=caveHitDmg(beast);caveAttack();
  check(beast.hp===500-damage&&run.swing?.artWeapon==='sabre','real sabre swing deals exactly one normal hit');
  const swing=run.swing;const hp=beast.hp;caveAttack();
  check(run.swing===swing&&beast.hp===hp,'cooldown neither restarts animation nor duplicates damage');
  for(const[t,stage]of [[.2,0],[.14,1],[.09,2],[.04,3]]){swing.t=t;check(sadiToolPose()?.stage===stage,'sabre attack phase '+stage);}
  for(const[dx,dy,dir,flip]of [[1,0,1,false],[-1,0,1,true],[0,1,0,false],[0,-1,2,false]]){
    swing.ang=Math.atan2(dy,dx);const p=sadiToolPose();check(p?.direction===dir&&p.flip===flip,'sabre points along attack '+dx+','+dy);drawExpansionPerson(0,500,500,false,true,dx,false,null,dy);
  }
  G.cave.weapon='facao';check(sadiToolPose()?.tool==='sabre','equipping another blade does not change a swing already in progress');
  run.cd=0;caveAttack();check(!sadiToolPose(),'new machete attack keeps its own existing art');G.cave.weapon='sabre';run.cd=0;caveAttack();
  run.hurt=.1;check(!sadiToolPose(),'hurt pose takes priority');run.hurt=0;run.dash={t:.1};check(!sadiToolPose(),'dash takes priority');run.dash=null;
  G.avatarId='badin';check(!sadiToolPose(),'other characters never become Sadi during a swing');G.avatarId='sadi';
  worldOut=null;check(!sadiToolPose()&&personHeight(0,true)===130,'bodega scale and serving poses stay unchanged');
  worldOut={map:'ilha',x:3200,y:1420,dx:1,dy:0};mataNightStart();mataNight.beasts=[];mataNight.hurt=0;mataNight.cd=0;mataAttack();
  check(mataNight.swing?.artWeapon==='sabre'&&sadiToolPose()?.tool==='sabre','sabre animation also follows actual island/forest attacks');
  mataNight=null;worldOut=null;G.herd=1;G.lassoTaught=true;startLasso();closeDialog(true);scene=null;paused=false;
  const L=G.lasso;L.queros=[];Object.assign(G.player,{x:600,y:700,dx:1,dy:0});L.time=.05;lassoCharge();
  check(sadiToolPose()?.tool==='laco'&&sadiToolPose().stage===0,'holding Q starts the winding pose');L.time=.3;check(sadiToolPose()?.stage===1,'winding alternates the arm pose');
  L.charge=.5;const aim=lassoAim();lassoRelease();const t=L.throw,hand=sadiLassoHand();
  check(t.tx===aim.x&&t.ty===aim.y&&t.total===.32+aim.p*.25,'new lasso art preserves target and flight time');
  check(Math.hypot(t.sx-hand.x,t.sy-hand.y)<.001&&sadiToolPose()?.stage===2,'rope launches from the drawn right hand');
  const b=L.bois[0];Object.assign(b,{x:t.tx,y:t.ty+28,state:'free',speed:0,t:99,dx:0,dy:0,rope:0});
  lassoTick(t.total+.01);check(b.rope===1&&t.done&&sadiToolPose()?.stage===3,'real flight hits once and starts the pulling pose');
  lassoTick(.01);check(b.rope===1,'pulling never scores a second hit');lassoTick(.35);check(!L.throw&&!sadiToolPose(),'finished throw returns to ordinary Sadi');
  L.charging=true;
  for(const[dx,dy,dir,flip]of [[1,0,1,false],[-1,0,1,true],[0,1,0,false],[0,-1,2,false]]){
    L.fx=dx;L.fy=dy;const p=sadiToolPose(),h=sadiLassoHand();check(p?.direction===dir&&p.flip===flip&&Number.isFinite(h.x+h.y),'lasso body and rope hand face '+dx+','+dy);drawLassoRope(L);
  }
  for(const mode of ['rodeio','javali','cavalo']){L.mode=mode;check(sadiToolPose()?.tool==='laco','shared action in '+mode);}
  L.stun=.2;check(!sadiToolPose(),'stun interrupts the lasso pose');L.stun=0;L.dash=.1;check(!sadiToolPose(),'lasso dodge keeps its pose');L.dash=0;
  const im=ACTION_ART['tool:sadi-laco'];ACTION_ART['tool:sadi-laco']={naturalWidth:0};check(!sadiToolPose(),'missing sheet uses ordinary character');drawLassoRope(L);ACTION_ART['tool:sadi-laco']=im;
  G.lasso=null;$('lassoUI').classList.add('hidden');worldOut={map:'caverna',x:600,y:600,dx:1,dy:0};G.cave.floor=SALAMANCA_FLOOR;caveRun=buildCaveFloor(SALAMANCA_FLOOR);caveRun.day=G.day;
  Object.assign(caveRun,{beasts:[],rocks:[],hurt:0,swing:null,lassoCd:0,t:4});salamancaLasso();
  check(caveRun.rope?.artStart===4&&sadiToolPose()?.stage===2,'Salamanca throw triggers body animation on a real cast');
  const rope=caveRun.rope;caveRun.t+=.2;check(sadiToolPose()?.stage===3,'combat lasso has a pull follow-through');salamancaLasso();check(caveRun.rope===rope,'combat cooldown does not restart lasso');
  caveRun.t+=.5;check(!sadiToolPose(),'combat pose ends even if target remains tied');
  paused=true;return results;
})()
