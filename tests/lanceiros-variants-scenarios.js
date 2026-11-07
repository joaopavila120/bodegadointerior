(() => {
  const out=[],check=(v,m)=>{if(!v)throw Error(m);out.push(m);};
  for(const id of LANCEIRO_ART){
    const sheet=ACTION_ART_CROPS[id],im=ACTION_ART[id];
    check(im?.naturalWidth===sheet.size[0]&&sheet.frames.length===12,id+': doze poses carregadas');
    check(sheet.frames.every(r=>r[0]>=0&&r[1]>=0&&r[0]+r[2]<=sheet.size[0]&&r[1]+r[3]<=sheet.size[1]),id+': recortes não vazam para fora da imagem');
    check(FOLK_ART_SIZE[id]===128&&SPIRIT_IDS.has(id),id+': escala e aparência de alma iguais às do grupo');
    for(let i=0;i<12;i++)check(actionSprite(id,i,500,500,128),id+': quadro '+i+' desenha');
    check(historyPortrait(id).includes('actions/'+id+'-v1.png'),id+': retrato usa o rosto correspondente');
  }
  const original=actionSprite,seen=[];
  actionSprite=function(id,index,...args){seen.push({id,index});return original(id,index,...args);};
  try{
    for(const id of LANCEIRO_ART){
      historyFigure(id,500,500,1,-1,false,0);check(seen.at(-1).index===0,id+': parado volta para a frente');
      for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]])for(let phase=0;phase<4;phase++)historyFigure(id,500,500,1,dx,true,dy,false,phase);
      historyFigure(id,500,500,1,1,false,0,true);check(seen.at(-1).index===11,id+': ataque usa estocada');
    }
    const group=[0,1,2,3,4].map(i=>pampaAliado('lanceiro',500+i*120,500,i+1));
    check(new Set(group.map(a=>a.art)).size===3&&group.every(a=>a.id==='lanceiro'),'aliados variam o visual sem mudar facção nem dano');
    for(const a of group){const id=a.art;a.walk=true;a.x+=80;drawPampaAliado(a);check(seen.at(-1).id===id,'aliado mantém aparência ao caminhar');a.swing=.2;drawPampaAliado(a);check(seen.at(-1).id===id&&seen.at(-1).index===11,'aliado mantém aparência ao atacar');}
    const L=pampaLayout(PAMPA_N.lanceiros),camp=pampaLanceirosCamp(L);
    check(camp.length===2&&new Set(camp.map(q=>q.art)).size===2&&camp.every(q=>q.art!=='lanceiro'),'acampamento exibe o líder e mais dois lanceiros: os três que vão peleiar');
    check(JSON.stringify(camp)===JSON.stringify(pampaLanceirosCamp(L)),'visuais do acampamento não sorteiam a cada quadro');
    const people=[...camp,ilhaFogoPartes(L.camp).folk];
    check(people.every((a,i)=>people.every((b,j)=>i===j||Math.hypot(a.x-b.x,a.y-b.y)>100)),'lanceiros do acampamento não se sobrepõem ao líder nem uns aos outros');
    for(const id of LANCEIRO_ART.slice(1)){
      const im=ACTION_ART[id];ACTION_ART[id]=null;
      try{
        drawCampFolk(id,500,500,1,1,true,0);check(seen.at(-1).id==='lanceiro','PNG ausente mantém lanceiro visível: '+id);
        sceneActorDraw('figurante',{as:id,x:500,y:500,dx:1,alpha:1});check(seen.at(-1).id==='lanceiro','cena também tem alternativa para PNG ausente: '+id);
      }finally{ACTION_ART[id]=im;}
    }
  }finally{actionSprite=original;}
  // Verify the same variants in all group scenes, while the speaking leader stays himself.
  const play=playSteps,noScenes=window.NO_SCENES;let steps=[];
  playSteps=s=>{steps=s;};window.NO_SCENES=false;
  try{
    G.pampa.area=PAMPA_N.sargento;pampaLancaCena({});
    check(new Set(steps.filter(s=>/^lanc\d+$/.test(s.actor)).map(s=>s.as)).size===2,'entrega da lança mostra as outras duas aparências');
    check(steps.some(s=>s.actor==='lanceiro'&&!s.as),'líder que conversa mantém o visual original');
    G.pampa.area=PAMPA_N.moringue;pampaBeastsStart();const a=pampaLayout().arena;worldOut={map:'pampa',x:a.x,y:a.y,dx:1,dy:0};
    moringueMadrugada({x:a.x+300,y:a.y},mataNight);
    check(new Set(steps.filter(s=>/^lanc\d+$/.test(s.actor)).map(s=>s.as)).size===3,'cena da madrugada mostra as três aparências');
    pampaFinal({});
    check(new Set(steps.filter(s=>/^lanc\d+$/.test(s.actor)).map(s=>s.as)).size===2&&steps.some(s=>s.actor==='lanceiro'&&!s.as),'na despedida, o líder e as outras duas aparências');
  }finally{playSteps=play;window.NO_SCENES=noScenes;}
  paused=true;return out;
})()
