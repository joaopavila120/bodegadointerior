// A lança tem quatro elos próprios. As outras lâminas mantêm seus combos e melhorias.
'use strict';
const LANCA_GOLPES = {
  1: {T:.23,dano:1,empurrao:8},
  2: {T:.25,dano:1.25,empurrao:12},
  3: {T:.30,dano:1.55,empurrao:14,alcance:1.12,arco:2.1},
  4: {T:.62,dano:3.4,empurrao:60,alcance:1.45,arco:4,empurra:150}
};
{
  const max=golpeMaximo,dados=golpeDados;
  golpeMaximo=function(){return armaLanca()?4:max();};
  golpeDados=function(n){return armaLanca()?LANCA_GOLPES[n]:dados(n);};
  // Fallback das poses anteriores enquanto a folha própria ainda carrega.
  SADI_GOLPES.sabre[4]=[0,1,2,3];SADI_GOLPES.facao[4]=[0,1,2];
  for(const cave of [true,false]){
    const attack=cave?caveAttack:mataAttack;
    const wrapped=function(){
      const r=cave?(inCave()?caveFloorRun():null):mataNight,old=r?.swing;
      const out=attack(),s=r?.swing;
      if(s&&s!==old&&armaLanca(s.artWeapon??caveWeapon().id)){
        s.artWeapon='lanca';
        if(s.n===4){
          const p=worldOut;s.impactX=p.x;s.impactY=p.y;s.impactReach=caveReach()*LANCA_GOLPES[4].alcance;
          AudioEngine.swoosh?.(.075);AudioEngine.thud?.();
          fxPuffs(p.x,p.y,16,130,'#c4b58b');fxStars(p.x,p.y-55,7);
          golpeTreme=Math.max(golpeTreme,.22);
        }
      }
      return out;
    };
    if(cave)caveAttack=wrapped;else mataAttack=wrapped;
  }
  // O golpe da lança não é o do facão: vara comprida cortando o ar e, no acerto, a pancada seca do cabo.
  Object.assign(AudioEngine,{
    lancaGolpe(){const agora=this.ctx?.currentTime||0;if(agora-(this.lancaUltimo||0)<.07)return true;this.lancaUltimo=agora;return this.somDe('lanca',2,.3,.92+Math.random()*.16);},
    lancaAcerto(){const ok=this.som('soco',.26,.68+Math.random()*.1);this.note(92+Math.random()*18,.07,'triangle',.05);return ok;}
  });
  const comSom=fn=>function(){
    if(!armaLanca())return fn();
    const swoosh=AudioEngine.swoosh,flesh=AudioEngine.caveFlesh;
    AudioEngine.swoosh=function(v){if(!this.lancaGolpe())swoosh.call(this,v);};
    AudioEngine.caveFlesh=function(a){if(!this.lancaAcerto())flesh.call(this,a);};
    try{return fn();}finally{AudioEngine.swoosh=swoosh;AudioEngine.caveFlesh=flesh;}
  };
  caveAttack=comSom(caveAttack);mataAttack=comSom(mataAttack);
  const weapon=CAVE_WEAPONS.find(w=>w.id==='lanca');
  weapon.desc+=' F, F, F, F em sequência: o quarto golpe varre a área com dano elevado. Depois, precisa recuperar o fôlego.';
  const gain=pampaLancaGanha;
  pampaLancaGanha=function(){
    gain();
    if(talkState?.lines)talkState.lines.splice(1,0,['card','<b>Quatro golpes da lança</b><br>Aperte <b>F, F, F, F</b> no ritmo: estocada, revés, varredura e um golpe final em área com <b>3,4× de dano</b>. Os três primeiros mantêm o inimigo perto; o último empurra e exige uma recuperação maior. Pausar entre os golpes reinicia a sequência.','Lição do Lanceiro Negro']);
  };
  const button=mataUpdateButton;
  mataUpdateButton=function(){
    button();const spear=armaLanca(),text=spear?'F · Lança':'🔪 Facão',title=spear?'F, F, F, F: quatro golpes; o último varre a área.':'';
    for(const id of ['mataAttackButton','caveAttackButton']){const el=$(id);if(!el)continue;if(el.textContent!==text)el.textContent=text;if(el.title!==title)el.title=title;}
  };
}
