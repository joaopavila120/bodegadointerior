(() => {
  const saved={G,worldOut,caveRun,caveTrip,started,paused,modal,scene,phoneOpen};
  const results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  try {
    G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.cave={facao:true,floor:2,deepest:2,hp:100,up:{},dunstanTaught:true};
    started=true;paused=false;modal=null;scene=null;phoneOpen=false;skipWorldTalk();keys.clear();
    worldOut={map:'caverna',x:200,y:600,dx:1,dy:0};caveRun=buildCaveFloor(1);caveRun.floor=2;caveRun.day=G.day;
    caveRun.rocks=[];caveRun.beasts=[];caveRun.shots=[];caveTrip=null;
    const run=caveRun,reset=(x=200,y=600)=>{Object.assign(worldOut,{x,y,dx:1,dy:0,walk:false});Object.assign(run,{dash:null,dashCd:0,inv:0});keys.clear();};
    reset(200,110);caveHurt(1,{x:200,y:200});
    check(worldCanWalk(worldOut.x,worldOut.y)&&worldOut.y>=106,'Recuo não enterra os pés na parede norte');
    const y=worldOut.y;caveMovePlayer(0,20);check(worldOut.y>y,'Sai do canto depois de apanhar');
    for(const [x,y,sx,sy] of [[100,110,-1,-1],[1660,110,1,-1],[100,1030,-1,1],[1660,1030,1,1]]) {
      reset(x,y);caveHurt(1,{x:x-sx*80,y:y-sy*80});
      check(worldCanWalk(worldOut.x,worldOut.y),'Recuo seguro no canto '+sx+','+sy);
      check(caveMovePlayer(-sx*30,-sy*30)>20,'Consegue se afastar do canto '+sx+','+sy);
    }
    reset(82,85);check(!worldCanWalk(worldOut.x,worldOut.y),'Reproduz posição presa pelo collider antigo');
    cavePlayerTick(.016);check(worldCanWalk(worldOut.x,worldOut.y),'Recupera posição antiga presa mesmo sem tecla');
    reset(200,600);check(!caveUnstickPlayer()&&worldOut.x===200&&worldOut.y===600,'Posição válida não é deslocada');
    for(let row=1;row<CAVE.rows-1;row++)run.grid[row][8]=1;
    caveMovePlayer(1000,0);check(worldOut.x<=640-CAVE_PLAYER_RADIUS&&worldCanWalk(worldOut.x,worldOut.y),'Movimento longo não atravessa parede');
    reset(620,500);caveMovePlayer(50,100);check(worldOut.y>590&&worldOut.x<=624,'Desliza pela parede ao andar na diagonal');
    reset(550,500);keys.add('d');check(!caveDash(),'Dash começa bloqueado');G.cave.up.dash=true;check(caveDash(),'Dash comprado inicia com direção do movimento');
    check(!caveDash(),'Não encadeia dash durante a recarga');
    const hp=G.cave.hp;caveHurt(50,{x:500,y:500});check(G.cave.hp===hp,'Dash bloqueia dano por contato');
    run.shots=[{x:worldOut.x,y:worldOut.y-40,vx:0,vy:0,life:1,dmg:50}];caveTick(.01);
    check(G.cave.hp===hp,'Dash bloqueia projéteis');
    cavePlayerTick(.5);caveTick(.5);check(worldOut.x<=624&&worldCanWalk(worldOut.x,worldOut.y),'Dash não atravessa paredes em frame longo');
    check(!run.dash,'Dash termina após sua duração');run.inv=0;caveHurt(5,{x:500,y:500});check(G.cave.hp===hp-5,'Invulnerabilidade termina junto com o dash');
    check(!caveDash(),'Recarga continua depois da esquiva');caveTick(2);check(caveDash(),'Dash volta após recarregar');
    reset();keys.add('d');caveDash();cavePlayerTick(CAVE_DASH.duration);caveTick(CAVE_DASH.duration);
    const horizontal=worldOut.x-200;check(Math.abs(horizontal-CAVE_DASH.duration*CAVE_DASH.speed)<.01,'Dash percorre a distância configurada');
    reset();keys.add('d');keys.add('s');caveDash();cavePlayerTick(CAVE_DASH.duration);caveTick(CAVE_DASH.duration);
    check(Math.abs(Math.hypot(worldOut.x-200,worldOut.y-600)-horizontal)<.01,'Dash diagonal tem a mesma distância');
    reset();worldOut.dx=0;worldOut.dy=-1;caveDash();check(run.dash.dy===-1&&run.dash.dx===0,'Parado, usa a direção para a qual olha');
    const t=run.dash.t;paused=true;cavePlayerTick(1);caveTick(1);check(run.dash.t===t,'Pausa congela o dash');paused=false;
    reset();paused=true;check(!caveDash(),'Não inicia pausado');paused=false;phoneOpen=true;check(!caveDash(),'Não inicia com celular aberto');phoneOpen=false;
    modal='talk';check(!caveDash(),'Não inicia durante diálogo');modal=null;
    reset();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Shift',code:'ShiftLeft',bubbles:true}));
    check(!!run.dash,'Shift aciona o dash pelo teclado real');
    reset();document.dispatchEvent(new KeyboardEvent('keydown',{key:'Shift',repeat:true,bubbles:true}));check(!run.dash,'Segurar Shift não repete automaticamente');
    caveUpdateControls();$('caveDashButton').click();check(!!run.dash,'Botão de toque aciona o dash');
    reset(200,600);run.rocks=[{x:300,y:600,hp:3}];caveDash();cavePlayerTick(.3);caveTick(.3);
    check(worldOut.x<270&&worldCanWalk(worldOut.x,worldOut.y),'Dash respeita pedras mineráveis');run.rocks=[];
    reset(620,720);G.cave.floor=run.floor=1;caveMovePlayer(160,-80);check(worldCanWalk(worldOut.x,worldOut.y),'Movimento respeita também a ferraria');
    reset();G.cave.floor=run.floor=2;run.ladder.shown=true;caveDash();caveDescend();
    check(!caveFloorRun().dash&&worldCanWalk(worldOut.x,worldOut.y),'Troca de andar limpa o dash e mantém entrada acessível');
    worldOut.map='serra';caveUpdateControls();check(!caveDash()&&$('caveDashButton').classList.contains('hidden'),'Dash e botão ficam restritos à caverna');
  } finally {
    keys.clear();skipWorldTalk();closeDialog(true);
    G=saved.G;worldOut=saved.worldOut;caveRun=saved.caveRun;caveTrip=saved.caveTrip;started=saved.started;paused=saved.paused;modal=saved.modal;scene=saved.scene;phoneOpen=saved.phoneOpen;caveUpdateControls();
  }
  return results;
})()
