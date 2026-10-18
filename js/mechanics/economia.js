// Ajustes de economia que dependem de tudo já carregado (ver docs/plano-economia.md).
// Eventos do mapa: a recompensa em dinheiro e XP sobe 10% por nível da bodega acima do primeiro. O valor de cada evento
// continua escrito no próprio evento; aqui ele vira um valor que acompanha o nível, na tela e na hora de pagar.
'use strict';

function eventRewardScale() { return 1 + .1 * (bodegaLevel() - 1); }
for (const def of Object.values(MAP_EVENTS)) {
  const base = def.reward; if (!base) continue;
  Object.defineProperty(def, 'reward', { configurable: true, enumerable: true, get() {
    const k = G ? eventRewardScale() : 1; return { ...base, ...(base.cash ? { cash: Math.round(base.cash * k / 5) * 5 } : {}), ...(base.xp ? { xp: Math.round(base.xp * k) } : {}) };
  } });
}
