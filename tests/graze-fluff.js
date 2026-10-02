(() => {
  const P = __pond, V = P.dbg_veg(), K = P.dbg.koi;
  // the koi closest to each raft goes grazing
  const picks = V.duckRafts.map((R) => { let b = 0, bd = 1e9; K.forEach((k, i) => { const d = Math.hypot(k.pos.x - R.cx, k.pos.z - R.cz); if (d < bd) { bd = d; b = i; } }); return [b, +bd.toFixed(2)]; });
  for (const [i] of picks) P.cmd('graze', i);
  let maxDisp = 0, eatenMax = 0, bites = 0, nan = 0, grazing = 0;
  for (let n = 0; n < 30 * 40; n++) {
    P.tick(1);
    let e = 0; for (const d of V.duck) { if (d.eat > 0) e++; else maxDisp = Math.max(maxDisp, Math.hypot(d.x - d.hx, d.z - d.hz)); if (!isFinite(d.x + d.z)) nan++; }
    eatenMax = Math.max(eatenMax, e);
    grazing = Math.max(grazing, K.filter((k) => k.duck).length);
  }
  P.cmd('gust');
  let fl = { air: 0, water: 0, ground: 0 }, maxF = 0;
  for (let n = 0; n < 30 * 25; n++) { P.tick(1); maxF = Math.max(maxF, V.fluff.length); }
  for (const f of V.fluff) fl[f.st]++;
  const hs = V.hishi.map((h) => +Math.hypot(h.x - h.ax, h.z - h.az).toFixed(3));
  return JSON.stringify({ picks, maxDisp: +maxDisp.toFixed(3), eatenMax, grazing, nan, maxF, fl, hs, koiOK: K.every((k) => isFinite(k.pos.x + k.pos.y + k.pos.z)) });
})()
