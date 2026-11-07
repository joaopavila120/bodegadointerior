(() => {
  const out=[],check=(v,m)=>{if(!v)throw Error(m);out.push(m);};
  G=fresh();G.day=40;G.prologue={done:true};G.tutorial.complete=true;G.phase='prep';
  G.ilha={grenfell:40};G.pampa={area:5,sargento:40,boi:40,capitao:40,lanceiros:40};
  G.cave={facao:true,hp:100,forged:{lanca:true},weapon:'lanca'};
  started=true;paused=false;scene=null;phoneOpen=false;closeDialog(true);skipWorldTalk();worldDash=null;
  const L=pampaLayout();worldOut={map:'pampa',x:pampaEstradaX(L,1000),y:1000,dx:1,dy:0};pampaBeastsStart();mataNight.beasts=[];
  check(ACTION_ART['garibaldi-attack']?.naturalWidth&&ACTION_ART_CROPS['garibaldi-attack'].frames.length===4,'Giuseppe carrega quatro quadros de sabre');
  const sprite=actionSprite,seen=[];actionSprite=function(id,index,x,y,size,flip){seen.push({id,index,size,flip});return sprite(id,index,x,y,size,flip);};
  try{
    for(const dx of [-1,1])for(const [index,swing]of [.24,.17,.10,.02].entries()){
      const a=pampaAliado('garibaldi',500,500);Object.assign(a,{dx,walk:true,swing});drawPampaAliado(a);
      check(seen.at(-1).id==='garibaldi-attack'&&seen.at(-1).index===index&&seen.at(-1).flip===(dx<0),'Giuseppe no Pampa: golpe '+index+', direção '+dx);
    }
    drawGaribaldi(500,500,1,1,true,0,0);check(seen.at(-1).id==='garibaldi-ghost'&&seen.at(-1).size===132,'fim do ataque retorna à caminhada na mesma escala');
    drawGaribaldi(500,500,1,-1,false,0,0);check(seen.at(-1).index===0,'Giuseppe parado mantém pose frontal');
    const im=ACTION_ART['garibaldi-attack'];ACTION_ART['garibaldi-attack']=null;
    try{drawGaribaldi(500,500,1,1,false,0,.15);check(seen.at(-1).id==='garibaldi-ghost','sprite antigo continua visível se faltar a imagem de ataque');}finally{ACTION_ART['garibaldi-attack']=im;}
    poderGrito();Object.assign(poder.ally,{x:worldOut.x,y:worldOut.y,t:9,swing:.17});drawPoderWorld();
    check(seen.at(-1).id==='garibaldi-attack'&&seen.at(-1).index===1,'poder Grito farroupilha também usa o sabre animado');
    const b=ilhaMob('oficialAdaga',{x:worldOut.x+60,y:worldOut.y},()=>.5,{hp:10000,max:10000});mataNight.beasts=[b];poder.ally.hit=0;poder.ally.swing=0;const hp=b.hp;
    poderTick(.01);check(b.hp<hp&&poder.ally.swing===.25,'acerto real do poder inicia a animação');
    poder.ally=null;const a=pampaAliado('garibaldi',b.x-60,b.y);a.hit=0;mataNight.aliados=[a];const hp2=b.hp;
    pampaAliadosTick(mataNight,.01,worldOut);check(b.hp<hp2&&a.swing===.25,'acerto real do aliado do Pampa inicia a animação');
    const before=worldOut;worldOut={map:'caverna',x:500,y:500,dx:1,dy:0};caveRun=null;
    poderGrito();Object.assign(poder.ally,{t:9,swing:.1});drawPoderWorld();check(seen.at(-1).id==='garibaldi-attack','invocação na caverna usa a mesma animação');poder.ally=null;worldOut=before;
  }finally{actionSprite=sprite;}
  // Play the actual finale until Neto speaks, not a standalone sprite gallery.
  G.pampa.area=PAMPA_N.moringue;const arena=pampaLayout().arena;
  worldOut={map:'pampa',x:arena.x,y:arena.y,dx:1,dy:0};pampaBeastsStart();mataNight.beasts=[];
  window.NO_SCENES=false;pampaFinal({});let steps=0;
  while(scene&&scene.step?.say!=='neto'&&steps++<6000){if(scene.step?.say){sceneNext();sceneNext();}else sceneTick(.05);}
  check(scene?.step?.say==='neto','cena final chega à fala do Coronel Neto');
  const P=pampaLayout(PAMPA_N.capitao).palanque,neto=scene.actors.neto,bento=scene.actors.bento;
  check(neto.layerY>P.y+P.h&&bento.layerY>P.y+P.h,'Neto e Bento são desenhados depois do palanque');
  check(neto.y<P.y+P.h&&bento.y<P.y+P.h,'os pés permanecem sobre o piso elevado');
  const order=[],stage=drawPampaPalanque,figure=pampaFigura,folk=historyFigure;
  drawPampaPalanque=function(...args){order.push('palanque');return stage(...args);};
  pampaFigura=function(id,...args){order.push(id);return figure(id,...args);};
  historyFigure=function(id,...args){if(id==='bento')order.push(id);return folk(id,...args);};
  try{drawSceneWorld();}finally{drawPampaPalanque=stage;pampaFigura=figure;historyFigure=folk;}
  check(order.includes('neto')&&order.indexOf('neto')>order.indexOf('palanque'),'desenho real da cena mantém Neto visível na frente da plataforma');
  check(order.includes('bento')&&order.indexOf('bento')>order.indexOf('palanque'),'desenho real da cena também mantém Bento visível');
  check(/Neto/.test(sceneSpeaker('neto').name)&&sceneSpeaker('neto').portrait.includes('pampa-npcs'),'Neto tem nome e retrato corretos no diálogo');
  finishRpgTyping('sceneTalk');paused=true;return out;
})()
