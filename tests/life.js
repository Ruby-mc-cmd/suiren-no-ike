(() => {
  // the life cycle from a fresh pond: 40 tadpoles, 15 minutes (= 15 pond hours x 60), no feeding.
  // Expect a few to climb out as froglets (the rest starve, get bitten or are taken by the koi), nothing NaN,
  // and no frog stuck swimming.
  const P = __pond, L = P.dbg_life(), fps = 30;
  P.cmd('lifefresh');
  let bad = 0, maxSw = 0, minAlive = 40;
  const rows = [];
  for (let m = 1; m <= 15; m++) {
    for (let k = 0; k < fps * 60; k++) {
      P.tick(1);
      if (k % 30) continue;
      for (const T of L.tadpoles) if (!isFinite(T.x + T.y + T.z + T.yaw + T.energy + T.dev)) bad++;
      for (const f of L.frogs) { if (!isFinite(f.pos.x + f.pos.y + f.pos.z + f.yaw + f.size)) bad++; if (f.state === 'swim' && f.swim && f.swim.tt > maxSw) maxSw = f.swim.tt; }
    }
    const alive = L.tadpoles.filter((T) => T.st !== 'dead').length;
    minAlive = Math.min(minAlive, alive);
    rows.push([m, alive, L.frogs.length]);
  }
  const st = L.lifeStats;
  return JSON.stringify({ ok: bad === 0 && st.climbed >= 2 && st.climbed <= 10 && maxSw < 70, bad, climbed: st.climbed, maxSw: +maxSw.toFixed(1), st, rows });
})()
