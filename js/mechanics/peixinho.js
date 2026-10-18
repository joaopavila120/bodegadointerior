// Arco do Peixinho na Brasa: ele quer o dourado, o peixe mais raro do rio Uruguai (lá longe, na correnteza, e brigador),
// e cinco cervejas. Com tudo na mão, ele chama os piá pra um peixinho na brasa em Santa Catarina… pros pela-saco chorar.
'use strict';

MISSIONS.push({ id: 'peixinho', title: 'Peixinho na brasa', giver: 'peixinhonabrasa', side: true, mainArc: true,
  when: () => !regionLocked('sc') && friendshipOf('peixinhonabrasa') >= 10,
  intro: [['peixinhonabrasa', 'Ô loco, meu! Tu é o bodegueiro que pesca no trapiche, né?'],
    ['peixinhonabrasa', 'Tô com uma vontade de fazer um peixinho na brasa daqueles, chamar os piá tudo… mas peixe comum não serve, não.'],
    ['peixinhonabrasa', 'Quero o DOURADO, o rei do rio! Só se pega lá longe, na correnteza do rio Uruguai. E ele pula e briga que nem cavalo xucro.'],
    ['peixinhonabrasa', 'Me traz um dourado e cinco cerveja geladinha, que eu chamo os piá e faço um peixinho na brasa pros pela-saco chorar!'],
    ['dica', 'No trapiche, <b>arremesse longe</b> (força no verde) pra cair na correnteza: lá mora o dourado. Na briga, <b>solte</b> quando ele correr ou pular.', 'Peixinho na brasa']],
  deliver: { to: 'peixinhonabrasa', items: { dourado: 1, cerveja: 5 } },
  goal: () => 'Leve um dourado (arremesse longe no trapiche) e 5 cervejas ao Peixinho, em Santa Catarina (dourado ' + Math.min(1, Math.floor(haveItem('dourado'))) + '/1 · cerveja ' + Math.min(5, Math.floor(haveItem('cerveja'))) + '/5)',
  thanks: [['peixinhonabrasa', 'O REI DO RIO! E as Kaiser geladinha! Agora sim, meu. Fica aí que eu vou chamar os piá!']],
  reward: { cash: 150, xp: 120, rep: 4, friend: { peixinhonabrasa: 15 } },
  finale: () => playPeixinhoScene() });

function peixinhoHouse() { const h = WORLD_MAPS.sc.spots().find(s => s.id === 'house:peixinhonabrasa'); return h ? { x: h.x, y: h.y } : { x: 1200, y: 800 }; }
function playPeixinhoScene() {
  const done = () => talk([['card', '<b>🔥 Peixinho na brasa</b><br>O dourado saiu da brasa douradinho, as Kaiser acabaram antes da música e os piá juraram que foi o melhor peixe da história de Santa Catarina. Lá no portão, os pela-saco choraram.', 'Peixinho na brasa · fim']], null, 'Ô loco, meu!');
  if (!scenesEnabled()) { done(); return; }
  const h = peixinhoHouse(), cx = h.x + 120, cy = h.y + 190, gx = cx + 28, gy = cy - 8;
  const grill = layers => layers.push({ y: gy + 30, draw: () => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; glow(gx, gy - 40, 70, .35 + .08 * Math.sin(frameClock * 8), '255,140,50'); ctx.restore(); fishSprite(ctx, 'dourado', gx, gy - 52, 30); for (let k = 0; k < 3; k++) { const a = (frameClock * .7 + k * .33) % 1; ellipse(gx - 10 + k * 10, gy - 80 - a * 70, 8 + a * 14, 6 + a * 10, `rgba(220,220,215,${.45 * (1 - a)})`); } } });
  const pia = [['lauro', -170, -40], ['indavirus', -150, 70], ['dianho', 170, -50], ['mitodosul', 160, 60], ['guri', 30, 110]];
  const cry = (id) => ({ do: () => { const a = scene.actors[id]; if (!a) return; for (let i = 0; i < 6; i++) fxAdd('drop', a.x + (i % 2 ? 8 : -8), a.y - 112, { vx: (i % 2 ? 1 : -1) * fxRand(10, 30), vy: fxRand(-30, 10), g: 260, life: .9, size: 3, floor: a.y - 40 }); } });
  playSteps([...sceneWorld({ map: 'sc', x: cx, y: cy - 20, props: grill }),
    { actor: 'peixinhonabrasa', x: cx - 70, y: cy - 10, dx: 1 }, { actor: 'sadi', x: cx + 80, y: cy + 40, dx: -1 }, { fade: 'in', time: .8 },
    { say: 'peixinhonabrasa', text: 'Agora é com o pai: brasa no ponto, sal grosso e o rei do rio no espeto.' },
    { do: () => AudioEngine.phone() },
    { say: 'peixinhonabrasa', text: 'Alô, piazada? Larga tudo e vem pra cá: peixinho na brasa e Kaiser gelada!' },
    ...pia.map(([id, dx, dy], k) => ({ actor: id, x: cx + (dx < 0 ? -720 : 720), y: cy + dy, dx: dx < 0 ? 1 : -1 })),
    { walk: pia.map(p => p[0]), to: pia.map(([, dx, dy]) => ({ x: cx + dx, y: cy + dy })) },
    { say: 'lauro', text: 'Opa! Me disseram que tinha dourado, ja!' },
    { say: 'indavirus', text: 'Atenção, Santa Catarina: o maior dourado do ano, ao vivo, no espeto!' },
    { say: 'guri', text: 'Bah, que cheiro! Isso é dourado mesmo, tchê!' },
    { do: () => { AudioEngine.glass(); setTimeout(() => AudioEngine.glass(), 160); setTimeout(() => AudioEngine.glass(), 300); sceneShout('Saúde!', cx, cy - 170, '#ffe28a', 18); } },
    { actor: 'gremio2_1', x: cx + 380, y: cy - 150, dx: -1 }, { actor: 'inter_1', x: cx + 430, y: cy - 120, dx: -1 },
    { say: 'gremio2_1', text: 'Bah… peixinho na brasa… e ninguém convidou nós…' }, cry('gremio2_1'), cry('inter_1'),
    { say: 'inter_1', text: 'Snif… e ainda é dourado…' }, cry('gremio2_1'), cry('inter_1'),
    { say: 'peixinhonabrasa', text: 'Isso aí! Peixinho na brasa pros pela-saco chorar!' },
    { do: () => { for (const [id] of pia) { const a = scene.actors[id]; a.hop = 10; sceneShout('Ô loco, meu!', a.x, a.y - 150, '#ffe28a', 15); } scene.actors.peixinhonabrasa.hop = 12; AudioEngine.crowd(); fxStars(cx, cy - 60, 8); } },
    cry('gremio2_1'), cry('inter_1'), { wait: 1.8 }, { fade: 'out', time: .9 }], 'peixinho-na-brasa', done);
}
