(() => {
  const P = __pond, V = P.dbg_veg(), K = P.dbg.koi;
  let bad = 0, landed = { water: 0, pad: 0, ground: 0 }, nibbles = 0, gusts = 0, maxN = 0, prevG = 0, sinkDone = 0;
  const seenLand = new Set(); let maxBend = 0;
  for (let n = 0; n < 30 * 240; n++) {
    P.tick(1);
    const F = V.fallen; maxN = Math.max(maxN, F.length);
    for (const L of F) {
      if (!isFinite(L.x + L.y + L.z + L.yaw + L.tx + L.tz)) bad++;
      if (L.st !== 'air' && !seenLand.has(L)) { seenLand.add(L); if (landed[L.st] !== undefined && L.t < 0.1) landed[L.st]++; }
      if (L.by === -2 && !L._n && L.dip > 0) { L._n = 1; nibbles++; }
      if (L.st === 'floor' && !L._f) { L._f = 1; sinkDone++; }
    }
    if (V.gust.v > 0.3 && prevG <= 0.3) gusts++; prevG = V.gust.v;
    for (const w of V.weeds) { if (!isFinite(w.bx + w.bz)) bad++; maxBend = Math.max(maxBend, Math.hypot(w.bx, w.bz)); }
  }
  const st = {}; for (const L of V.fallen) st[L.st] = (st[L.st] || 0) + 1;
  return JSON.stringify({ bad, landed, nibbles, gusts, maxN, now: V.fallen.length, st, sinkDone, maxBend: +maxBend.toFixed(3), koiOK: K.every(k => isFinite(k.pos.x + k.pos.y + k.pos.z)) });
})()
