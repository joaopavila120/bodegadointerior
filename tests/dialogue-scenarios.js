(() => {
 const results=[],check=(value,label)=>{if(!value)throw Error(label);results.push(label);};
 const previous=G,random=Math.random;
 try {
  G=fresh();AudioEngine.on=false;Math.random=()=>.99;
  for(const id of ALWAYS_TALK){
   const person=PEOPLE.findIndex(p=>p.id===id);
   deliveryConversation(person,{});
   check(G.dialogue?.name===PEOPLE[person].name&&G.dialogue.life===15&&!G.dialogueQueue.length,'personagem especial sempre conversa: '+id);
  }
  const special=G.dialogue;
  deliveryConversation(0,{});
  check(G.dialogue===special&&G.friends[0]===0,'entrega comum silenciosa preserva fala atual; fregueses comuns não somam afeto');
  Math.random=()=>.1;deliveryConversation(0,{});
  check(G.dialogue===special&&!G.dialogueQueue.length,'na bodega, freguês comum não puxa conversa nem com sorte (só no mundo aberto)');
  progressionTick(14);
  check(G.dialogue?.life===1,'fala permanece durante seus primeiros 14 segundos');
  const badin=PEOPLE.findIndex(p=>p.id==='badin');deliveryConversation(badin,{});progressionTick(1);
  check(G.dialogue?.name===PEOPLE[badin].name&&G.dialogue.life===14,'nova fala reinicia prazo completo');
  progressionTick(14);
  check(!G.dialogue&&$('dialogueUI').classList.contains('hidden'),'fala desaparece após 15 segundos sem outra conversa');
  G.dialogue={name:'Antiga',life:18};G.dialogueQueue=[{name:'Pendente',life:10}];
  const migrated=normalizeSave(JSON.parse(JSON.stringify(G)));
  check(migrated.dialogueQueue.length===0&&migrated.dialogue.life===15,'salvamento antigo descarta fila e limita duração');
  advanceDialogue();
  check(!G.dialogue&&!G.dialogueQueue.length,'fechar descarta também qualquer fila antiga');
 }finally{Math.random=random;G=previous;updateDialogue();}
 return results;
})()
