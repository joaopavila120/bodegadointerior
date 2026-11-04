// One rescued character: lizard -> princess -> gaúcha. Human art is shared with visitors.
'use strict';
function teiniaguaPerson(form='gaucha'){
  return PEOPLE.findIndex(p=>p.id===(form==='princesa'?'princesa':'gaucha_chique'));
}
function teiniaguaHumanPortrait(form='gaucha'){
  return portraitHTML(teiniaguaPerson(form),104);
}
function teiniaguaSceneForm(){return scene?.actors?.teiniagua?.form||'princesa';}
function teiniaguaTransform(form){
  const a=scene?.actors?.teiniagua;if(!a)return;
  a.previousForm=a.form;a.form=form;a.morphAt=frameClock;
  AudioEngine.caveGem();fxStars(a.x,a.y-65,8);
}
function teiniaguaActorDraw(a,y){
  const draw=form=>{
    if(form==='lagartixa'){
      ellipse(a.x,y+1,22,7,'#271c1755');
      expansionSprite('cave-beasts-b-v1',4+(a.walk?Math.floor(frameClock*6)%3:0),a.x,y,70,a.dx<0,expansionRowHeight('cave-beasts-b-v1',4,3));
    }else personDraw(PEOPLE[teiniaguaPerson(form)].sprite,a.x,y,a.walk,false,a.dx,false,0,a.dy||0);
  };
  const k=a.previousForm?clamp((frameClock-a.morphAt)/.7,0,1):1;
  if(k<1){ctx.save();ctx.globalAlpha*=1-k;draw(a.previousForm);ctx.restore();}
  ctx.save();ctx.globalAlpha*=k;draw(a.form);ctx.restore();
  if(k<1){ctx.save();ctx.globalCompositeOperation='lighter';glow(a.x,y-55,95,Math.sin(k*Math.PI)*.45,'255,218,150');ctx.restore();}
}
// The old princess visitor slot stays reserved for the story; only the gaúcha visits after rescue.
{
  const pool=visitorPool,available=visitorAvailable;
  visitorPool=function(team=null){return pool(team).filter(i=>i!==teiniaguaPerson()||salamancaDone());};
  visitorAvailable=function(i,extra=[]){
    if(i===teiniaguaPerson('princesa')||i===teiniaguaPerson()&&!salamancaDone())return false;
    return available(i,extra);
  };
  const speaker=sceneSpeaker,temptation=teiniaguaSpeaker;
  sceneSpeaker=function(who){
    if(who==='teiniagua'&&scene?.id?.startsWith('salamanca-')){
      const form=teiniaguaSceneForm();
      if(form!=='lagartixa')return{name:'Teiniaguá',portrait:teiniaguaHumanPortrait(form)};
    }
    return speaker(who);
  };
  teiniaguaSpeaker=function(){
    return salamancaRun()?{name:'Teiniaguá',portrait:teiniaguaHumanPortrait('princesa')}:temptation();
  };
  const normalize=normalizeSave;
  normalizeSave=function(state){return normalizeTeiniaguaForms(normalize(state));};
}
// Preserve live orders, money and numeric indices in saves made with the two mistaken visitors.
function normalizeTeiniaguaForms(state){
  const princess=teiniaguaPerson('princesa'),human=teiniaguaPerson(),fallback=PEOPLE.findIndex(p=>p.id==='lucia');
  for(const key of ['friends','regulars','talkCooldown','conversations','storyCursor']){
    if(!state[key])continue;state[key][human]=Math.max(state[key][human]||0,state[key][princess]||0);state[key][princess]=0;
  }
  for(const key of ['contacts','metSpecial','playable','giftsGiven'])if(state[key]?.princesa!=null){
    state[key].gaucha_chique=Math.max(state[key].gaucha_chique||0,state[key].princesa||0);delete state[key].princesa;
  }
  if(state.avatarId==='princesa')state.avatarId=state.cave?.salamanca?'gaucha_chique':'sadi';
  if(state.avatarId==='gaucha_chique'&&!state.cave?.salamanca)state.avatarId='sadi';
  let occupied=state.avatarId==='gaucha_chique';
  const visitor=i=>{
    if(i!==princess&&i!==human)return i;
    if(!state.cave?.salamanca||occupied)return fallback;
    occupied=true;return human;
  };
  for(const c of state.shop||[])c.person=visitor(c.person);
  for(const g of state.groups||[]){
    g.members=(g.members||[g.person]).map(visitor);g.person=g.members[0];
    g.diners?.forEach((d,i)=>d.person=g.members[i]??g.person);
  }
  for(const bill of state.fiado||[])if(bill.person===princess)bill.person=human;
  return state;
}
