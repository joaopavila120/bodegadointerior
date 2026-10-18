// Imagens leves: o código pede o arquivo original e recebe a versão otimizada de assets/images/opt (WebP, reduzida onde a
// tela nunca usa a resolução toda; veja tools/optimize-images.py). Para o resto do jogo nada muda: naturalWidth,
// naturalHeight e os recortes de drawImage continuam nos números do original.
'use strict';
function assetURL(path) { const k = String(path).split('assets/images/')[1], o = k && ASSET_OPT[k]; return o ? String(path).split('assets/images/')[0] + 'assets/images/' + o[0] : path; }
{
  const P = HTMLImageElement.prototype, srcDesc = Object.getOwnPropertyDescriptor(P, 'src');
  const real = {}, orig = img => img._assetOrig;
  Object.defineProperty(P, 'src', { configurable: true, enumerable: true,
    get() { return srcDesc.get.call(this); },
    set(v) { const k = String(v).split('assets/images/')[1], o = k && ASSET_OPT[k]; this._assetOrig = o ? [o[1], o[2]] : null; srcDesc.set.call(this, o ? assetURL(v) : v); } });
  for (const [prop, i] of [['naturalWidth', 0], ['naturalHeight', 1]]) {
    const d = Object.getOwnPropertyDescriptor(P, prop); real[prop] = d.get;
    Object.defineProperty(P, prop, { configurable: true, enumerable: true, get() { const v = d.get.call(this); return v && orig(this) ? orig(this)[i] : v; } });
  }
  for (const [prop, i] of [['width', 0], ['height', 1]]) {
    const d = Object.getOwnPropertyDescriptor(P, prop);
    Object.defineProperty(P, prop, { configurable: true, enumerable: true, get() { const v = d.get.call(this); return v && orig(this) && !this.isConnected ? orig(this)[i] : v; }, set(v) { d.set.call(this, v); } });
  }
  // drawImage com recorte em números do original: converte pro tamanho do arquivo leve.
  const C = CanvasRenderingContext2D.prototype, draw = C.drawImage;
  C.drawImage = function (img, ...a) {
    const o = img && img._assetOrig; if (!o) return draw.call(this, img, ...a);
    if (a.length === 2) return draw.call(this, img, a[0], a[1], o[0], o[1]);
    if (a.length < 8) return draw.call(this, img, ...a);
    const fx = real.naturalWidth.call(img) / o[0], fy = real.naturalHeight.call(img) / o[1];
    return draw.call(this, img, a[0] * fx, a[1] * fy, a[2] * fx, a[3] * fy, a[4], a[5], a[6], a[7]);
  };
}
