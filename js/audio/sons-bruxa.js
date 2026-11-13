// Sons de bruxa (e o medo da ilha). As bruxas da cerração ganham voz de verdade:
//   · Risada de bruxa: a gargalhada em cascata, caindo de tom, quando ela vê o Sadi ou apronta.
//   · Grito de bruxa: o guincho subindo, quando a Bruxa-mor chama as mariposas.
//   · Morte de bruxa: o lamento descendo e, no fim, uma risadinha perdida (ela sempre ri por último).
// E o ambiente da mata da cerração: vento, coruja, galho quebrando, a nuvem de mariposas farfalhando,
// uma risada longe (trecho 2 pra frente) e o ronco fundo das bernúncias (trecho 5 pra frente).
'use strict';

Object.assign(AudioEngine, {
  // A gargalhada: "he-he-he-he" caindo de tom, com a garganta tremida.
  bruxaRisada(vol = .05) {
    const base = 620 + Math.random() * 140;
    [0, .13, .25, .38, .54, .72].forEach((d, i) => {
      const f = base * (1 - .08 * i);
      this.caveVoice?.([f, f * .86], i === 5 ? .3 : .15, { type: 'sawtooth', formant: 1500, q: 3, vol: vol * (1 - .11 * i), vib: 22, rate: 13, delay: d });
    });
  },
  // O guincho subindo (chamando as mariposas, ou de raiva).
  bruxaGrito(vol = .05) {
    this.caveVoice?.([520, 980, 1280, 920], .7, { type: 'sawtooth', formant: 1800, q: 4, vol, vib: 26, rate: 9 });
    this.noise?.(.3, vol * .5, 2600);
  },
  // O lamento da queda, com a risadinha no fim.
  bruxaMorte(vol = .05) {
    this.caveVoice?.([920, 700, 460, 280], 1.1, { type: 'triangle', formant: 1200, q: 2, vol, vib: 18, rate: 7 });
    setTimeout(() => this.bruxaRisada?.(vol * .4), 650);
  },
  // A nuvem de mariposas: um farfalhar seco de asas.
  mariposaAsas(vol = .018) {
    for (let i = 0; i < 6; i++) setTimeout(() => { this.bus = this.ambientBus; this.noise(.05, vol * (.6 + Math.random() * .6), 1900 + Math.random() * 900); this.bus = null; }, i * (90 + Math.random() * 60));
  },
  // O ronco fundo da bernúncia, longe.
  bernunciaRonco(vol = .05) {
    this.caveVoice?.([72, 94, 58], 1.8, { type: 'sawtooth', formant: 190, q: 2, vol, vib: 4, rate: 5 });
  }
});

// ---------- A voz das bruxas nas lutas ----------
{
  const liga = () => {
    if (typeof ILHA_MOBS !== 'object' || !ILHA_MOBS.bruxa) return false;
    ILHA_MOBS.bruxa.cry = function (dead) { if (dead) this.bruxaMorte?.(.05); else this.bruxaRisada?.(.05); };
    ILHA_MOBS.bruxaMor.cry = function (dead) {
      if (dead) { this.bruxaMorte?.(.06); setTimeout(() => this.bruxaRisada?.(.035), 1400); }
      else { this.bruxaGrito?.(.05); setTimeout(() => this.bruxaRisada?.(.045), 420); }
    };
    return true;
  };
  if (!liga()) document.addEventListener('DOMContentLoaded', liga);
}

// ---------- O ambiente da mata da cerração ----------
{
  const amb = AudioEngine.ambience;
  AudioEngine.ambience = function (dt) {
    amb.call(this, dt);
    const on = worldOut?.map === 'ilhamato', n = on && typeof ilhaMatoLayout === 'function' ? ilhaMatoLayout().n : 0;
    this.bus = this.ambientBus;
    // O vento úmido da cerração, com rajadas compridas.
    this.loop('cerracaoVento', on ? .022 + .016 * Math.max(0, Math.sin(frameClock * .19) * Math.sin(frameClock * .47)) : 0, { type: 'bandpass', freq: 330, q: .7 });
    if (on) {
      if (sombrioDue('cerGrilo', dt, 3, 7)) this.grilo();
      if (sombrioDue('cerCoruja', dt, 22, 46)) this.coruja(.022);
      if (sombrioDue('cerGalho', dt, 12, 26)) this.galho(.025 + Math.random() * .03);
      if (sombrioDue('cerFolhas', dt, 15, 32)) this.folhas(.028);
      if (n >= 2 && sombrioDue('cerBruxa', dt, 38, 80)) this.bruxaRisada(.016);
      if (n >= 3 && sombrioDue('cerMariposa', dt, 11, 24)) this.mariposaAsas();
      if (n >= 5 && sombrioDue('cerBernuncia', dt, 42, 85)) this.bernunciaRonco(.045);
      if (sombrioDue('cerSussurro', dt, 70, 130)) this.sussurro(.024);
    }
    this.bus = null;
  };
}
