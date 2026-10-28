(() => {
  const c = document.createElement('canvas'); c.width = 1400; c.height = 1695;
  const previous = ctx, time = frameClock; ctx = c.getContext('2d');
  try {
    ctx.fillStyle = '#354237'; ctx.fillRect(0, 0, c.width, c.height);
    const label = (text, x, y) => { ctx.fillStyle = '#f6e6b9'; ctx.font = '18px sans-serif'; ctx.textAlign = 'center'; ctx.fillText(text, x, y); };
    label('Personagens · escala do jogo × 1,6', 700, 28);
    Object.keys(FOLK_ART_SIZE).forEach((id, i) => {
      const x = 180 + i % 4 * 345, y = 290 + Math.floor(i / 4) * 285;
      ctx.save(); ctx.translate(x, y); ctx.scale(1.6, 1.6);
      historyFigure(id, -35, 0, 1, 1, false, 0); historyFigure(id, 40, 0, 1, 1, true, 0, false, 2);
      ctx.restore(); label(id, x, y + 24);
    });
    ['cusco', 'baia'].forEach((id, i) => {
      const y = 1020 + i * 145;
      [2, 4, 8, 10, 13, 14].forEach((index, j) => actionSprite(id, index, 130 + j * 230, y, 83));
      label(id + ' · esperando / andando / dormindo / carinho / rosnando / investida', 700, y + 24);
    });
    ['coral', 'teiu', 'ourico', 'corposeco'].forEach((id, i) => {
      actionSprite(id, id === 'corposeco' ? 5 : 6, 180 + i * 345, 1415, FOREST_BEAST_ART_SIZE[id] * 1.25);
      label(id, 180 + i * 345, 1443);
    });
    ['sadi-revolver', 'sadi-bodoque'].forEach((id, i) => {
      [0, 5, 6, 8].forEach((index, j) => actionSprite(id, index, 95 + j * 160 + i * 700, 1660, 157));
    });
    return c.toDataURL('image/png');
  } finally { ctx = previous; frameClock = time; }
})()
