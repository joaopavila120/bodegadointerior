(() => {
  const results=[],check=(ok,msg)=>{if(!ok)throw Error(msg);results.push(msg);};
  const ids=['grazi','princesa','gaucha_chique'];
  G=fresh();G.prologue={done:true};G.tutorial.complete=true;G.day=30;G.phase='open';
  started=true;scene=null;phoneOpen=false;paused=false;closeDialog(true);skipWorldTalk();worldOut=null;
  const index=id=>PEOPLE.findIndex(p=>p.id===id);
  check(index('grazi')<index('damiao')&&index('princesa')===PEOPLE.length-2&&index('gaucha_chique')===PEOPLE.length-1,'existing character and form indices preserved');
  check(PEOPLE[index('grazi')].sprite!==PEOPLE[index('lucia')].sprite,'Grazi has her own sprite, not Lucia with a cap');
  check(!visitorPool().includes(index('grazi'))&&PEOPLE[index('grazi')].worldOnly,'Grazi keeps her existing story role');
  for(const id of ids){
    const i=index(id),p=PEOPLE[i],pose=SECONDARY_POSES.get(p.sprite),meta=EXPANSION_CROPS[pose.key];
    check(meta.frames.length===12&&EXPANSION_ART[pose.key].naturalWidth===meta.width,id+' twelve real poses loaded');
    check(pose.idle===0&&pose.steps===4,id+' planted idle and four-frame gait');
    check(portraitHTML(i).includes(pose.key+'.png'),id+' dialogue portrait uses new artwork');
    check(customDialogues[id]?.length===(id==='grazi'?4:8)&&personalizedProse(i),id+' editable TXT dialogue reaches the game');
    for(const[dx,dy,dir,flip]of [[0,1,0,false],[1,0,1,false],[-1,0,1,true],[0,-1,2,false]]){
      secondaryTracks.length=0;worldOut={map:'vila',x:100,y:100};
      const a=worldCharacterSpec(p.sprite,500,500,true,dx,dy);frameClock+=.1;
      const b=worldCharacterSpec(p.sprite,500+dx*20,500+dy*20,true,dx,dy);
      check(a.index===dir*4&&b.index===dir*4+1&&b.flip===flip,id+' advances drawn legs along '+dx+','+dy);
      check(b.height===124&&b.reference===pose.directionHeights[dir],id+' constant body scale for direction '+dir);
      personDraw(p.sprite,500,500,true,false,dx,false,0,dy);
      const idle=worldCharacterSpec(p.sprite,500,500,false,dx,dy);check(idle.index===0&&!idle.flip,id+' returns to front idle');
    }
    worldOut=null;personDraw(p.sprite,500,500,false,false,1,true);
    check(personHeight(p.sprite,false)===124&&personHeight(0,true)===130,id+' seating and Sadi scale unchanged');
  }
  check(!visitorPool().includes(index('princesa'))&&!visitorPool().includes(index('gaucha_chique'))&&!visitorAvailable(index('gaucha_chique')),'both forms stay out of the bodega until Teiniaguá is rescued');
  caveState().salamanca=G.day;
  check(!visitorPool().includes(index('princesa'))&&!visitorAvailable(index('princesa')),'princess is a story form, never a second customer');
  for(const id of ['gaucha_chique']){
    const i=index(id);G.groups=[];G.shop=[];G.tables.forEach(t=>{t.group=null;t.dirty=false;});
    check(visitorPool().includes(i)&&visitorAvailable(i),id+' can be selected as a customer');
    const g=spawnGroup({person:i,size:1});check(g?.members.includes(i),id+' enters as a real dining group');
    check(!visitorAvailable(i),id+' cannot duplicate while already visiting');
    G.groups=[];G.tables.forEach(t=>t.group=null);
    const original=pickVisitor;let c;try{pickVisitor=()=>i;c=spawnShop();}finally{pickVisitor=original;}
    check(c?.person===i&&GOODS[c.pid]&&c.patience>0,id+' makes a real counter order with a timer');
    G.shop=[];
  }
  const old=JSON.parse(JSON.stringify(G));old.friends[0]=37;
  for(const field of ['friends','regulars','talkCooldown','conversations','storyCursor'])old[field]=old[field].slice(0,-2);
  normalizeSave(old);check(old.friends[0]===37&&ids.slice(1).every(id=>old.friends[index(id)]===0&&old.regulars[index(id)]===0),'old saves preserve friendship and initialize both newcomers');
  const keep=customDialogues.princesa;customDialogues.princesa=[{player:'Teste',reply:'Fala editada'}];G.dialogueSeen=[];
  check(personalizedProse(index('princesa')).reply==='Fala editada','manual dialogue overrides defaults');customDialogues.princesa=keep;
  drawGrazi({x:500,walk:true,dx:1,dy:0},500);paused=true;return results;
})()
