(() => {
  const previous={G,worldOut,frameClock,playerAnimation,ctx},results=[];
  const oldFrame=characterFrame,oldArm=carryArm;
  const check=(ok,label)=>{if(!ok)throw Error(label);results.push(label);};
  try{
    G=fresh();worldOut=null;frameClock=80;playerAnimation=null;
    const c=document.createElement('canvas');c.width=1200;c.height=900;ctx=c.getContext('2d');
    check(sadiPosesReady(),'Artes de repouso e bandeja carregadas');
    for(const[key,frames]of Object.entries(SADI_POSE_CROPS))for(const[x,y,w,h,axis,tx,ty]of frames){
      const im=SADI_POSE_ART[key];check(x>=0&&y>=0&&x+w<=im.naturalWidth&&y+h<=im.naturalHeight&&axis>0&&axis<w,'Recorte do Sadi: '+key);
      if(tx!==undefined)check(tx>=0&&tx<=w&&ty>=0&&ty<=h,'Bandeja dentro do sprite: '+key);
    }
    characterFrame=()=>{throw Error('Sadi voltou ao sprite antigo');};
    carryArm=()=>{throw Error('Braço antigo sobreposto ao sprite');};
    for(const moving of [false,true])for(const[dx,dy]of [[0,1],[1,0],[0,-1],[-1,0]])for(const count of [0,1,2]){
      G.player={x:550,y:700,dx,dy};G.up.tray=count===2;
      G.hands=[count?{key:'pao_xis',kind:'ingredient',id:1}:null,count===2?{key:'cerveja',kind:'product',id:2}:null];
      const a=playerAnimationState();a.stride=moving?1:0;a.sidePhase=.8;a.clock=frameClock;
      const s=sadiPoseSpec(550,700),state=JSON.stringify(G),matrix=ctx.getTransform().toString();
      personDraw(0,550,700,moving,true,dx,false,0,dy);
      check(s.sheet===(moving?(count?'tray':'walk'):'idle'),'Pose completa: '+moving+'/'+dx+','+dy+'/'+count);
      check(JSON.stringify(G)===state&&ctx.getTransform().toString()===matrix,'Desenho preserva estado e canvas');
      if(count){const carry=playerCarryPose(550,700);check(carry.spriteTray&&carry.back===(dy===-1),'Camada correta da bandeja, virada pra onde andava também em repouso');
        const item=playerItemAnchor(0);check(Number.isFinite(item.x+item.y)&&Math.abs(item.x-550)<75&&item.y<680&&item.y>600,'Produto acompanha a bandeja');}
    }
    characterFrame=oldFrame;carryArm=oldArm;
    worldOut={map:'vila',...front(VILA.bodega,35),dx:0,dy:-1};
    const b=worldBodegaBounds(),r=VILA.bodega;
    check(WORLD_ART['architecture-bodega-galpao-v1'].naturalWidth>0,'Novo galpão carregado');
    check(Math.abs(b.x+b.w/2-(r.x+r.w/2))<1&&Math.abs(b.y+b.h-(r.y+r.h))<1,'Fachada ancorada na entrada');
    check(WORLD_MAPS.vila.canWalk(worldOut.x,worldOut.y),'Acesso à bodega livre');
    check(worldBodegaLights().every(([x,y])=>x>b.x&&x<b.x+b.w&&y>b.y&&y<b.y+b.h),'Luzes seguem as janelas e lampiões');
    drawWorldBodega();check(sadiPoseCache.size<=120,'Cache das poses limitado');
    return results;
  }finally{characterFrame=oldFrame;carryArm=oldArm;({G,worldOut,frameClock,playerAnimation,ctx}=previous);}
})()
