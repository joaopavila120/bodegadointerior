(() => {
  const results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  const noScenes=window.NO_SCENES,p=teiniaguaPerson('princesa'),h=teiniaguaPerson();
  const setup=()=>{
    scene=null;closeDialog(true);skipWorldTalk();G=fresh();G.day=30;G.prologue={done:true};G.tutorial.complete=true;
    G.phase='prep';G.missions={jarau:{status:'active',day:30}};started=true;paused=true;phoneOpen=false;
    Object.assign(caveState(),{floor:20,deepest:20,facao:true,enchanted:30,jarauMet:30,dunstanTaught:true});
    worldOut={map:'caverna',x:830,y:580,dx:1,dy:0};caveRun=null;
    const run=caveFloorRun(),boss=salamancaBoss(run);boss.hp=0;return {run,boss};
  };
  try{
    let {run,boss}=setup();window.NO_SCENES=false;
    check(!visitorPool().includes(h)&&!visitorAvailable(h),'no human Teiniagua before rescue');
    check(teiniaguaSpeaker().portrait.includes('princesa-v1.png'),'cave temptation uses the imprisoned princess portrait');
    const cash=G.cash,xp=G.xp;window.teiniaguaPreviews={};salamancaVictory(boss);
    const forms=[],portraits=new Set();let moved=false,hiddenUntilFinish=true;
    for(let n=0;scene&&n<1200;n++){
      const a=scene.actors.teiniagua;
      if(a){
        if(forms.at(-1)!==a.form)forms.push(a.form);
        if(a.walk&&a.form==='gaucha')moved=true;
        // Capture the actual cave composition after each transformation has settled.
        if(!window.teiniaguaPreviews[a.form]&&(!a.previousForm||frameClock-a.morphAt>.7)){
          drawScene();window.teiniaguaPreviews[a.form]=canvas.toDataURL('image/png');
        }
        if(a.previousForm&&frameClock-a.morphAt<.7)drawScene();
        if(scene.step?.say==='teiniagua')portraits.add(sceneSpeaker('teiniagua').portrait);
      }
      hiddenUntilFinish=hiddenUntilFinish&&!visitorPool().includes(h);
      if(scene.step?.say){finishRpgTyping('sceneTalk');sceneNext();}
      else{frameClock+=.1;sceneTick(.1);}
    }
    check(!scene,'full victory scene completes without skipping');
    check(forms.join(',')==='lagartixa,princesa,gaucha','same actor transforms from lizard to princess to gaucha');
    check(moved,'freed Teiniagua walks in her gaucha dress');
    check([...portraits].some(s=>s.includes('princesa-v1.png'))&&[...portraits].some(s=>s.includes('gaucha-chique-v1.png')),'dialogue portraits follow the transformation');
    check(hiddenUntilFinish&&visitorAvailable(h)&&visitorPool().includes(h)&&!visitorPool().includes(p),'only one customer unlocked after the scene');
    check(missionDone('jarau')&&salamancaDone()&&run.ladder.shown&&run.torch&&G.cash===cash+500&&G.xp===xp+400,'rescue preserves mission rewards and cave light');
    check(!run.teiniaguaActor&&!run.cageOpen&&!run.teiniaguaLeaving,'scene-only cage and actor flags are cleaned up');
    const completed=normalizeSave(JSON.parse(JSON.stringify(G)));G=completed;caveRun=null;
    check(salamancaDone()&&visitorAvailable(h)&&!salamancaBoss(caveFloorRun()),'completed saved game unlocks her without replaying the boss');
    worldOut={map:'serra',x:100,y:100};
    check(teiniaguaSpeaker().portrait.includes('cave-beasts-b-v1'),'outdoor folklore encounters keep their existing lizard portrait');
    ({run,boss}=setup());window.NO_SCENES=false;salamancaVictory(boss);sceneSkip();
    check(salamancaDone()&&missionDone('jarau')&&visitorAvailable(h)&&!run.teiniaguaActor,'skipping victory still frees the same customer');
    ({run,boss}=setup());window.NO_SCENES=true;salamancaVictory(boss);
    check(!scene&&salamancaDone()&&visitorAvailable(h),'disabled cinematics also unlock her');
    // Saves from the mistaken two-customer version keep their orders and friendship.
    for(const rescued of [false,true]){
      setup();const old=JSON.parse(JSON.stringify(G));old.cave.salamanca=rescued?30:0;
      if(rescued)old.missions.jarau.status='done';old.friends[p]=19;old.friends[h]=7;old.regulars[p]=4;
      old.contacts={princesa:12,gaucha_chique:8};old.avatarId='sadi';
      old.shop=[{person:p,pid:'erva',patience:47}];
      old.groups=[{person:h,members:[h],diners:[{person:h,orders:['cafe'],status:'waiting',patience:33}]}];
      const normalized=normalizeTeiniaguaForms(old);
      check(normalized.friends[h]===19&&normalized.friends[p]===0&&normalized.regulars[h]===4&&normalized.contacts.gaucha_chique===12&&!('princesa' in normalized.contacts),'friendship and contacts merged, rescued='+rescued);
      check(normalized.shop[0].person===(rescued?h:0)&&normalized.groups[0].person===0&&normalized.groups[0].diners[0].person===0,'old duplicate visitors remapped, rescued='+rescued);
      check(normalized.shop[0].patience===47&&normalized.groups[0].diners[0].orders[0]==='cafe'&&normalized.groups[0].diners[0].patience===33,'orders and timers survive migration, rescued='+rescued);
      const before=JSON.stringify(normalized);normalizeTeiniaguaForms(normalized);
      check(JSON.stringify(normalized)===before,'form migration is idempotent, rescued='+rescued);
    }
    return results;
  }finally{window.NO_SCENES=noScenes;scene=null;closeDialog(true);worldOut=null;caveRun=null;paused=true;}
})()
