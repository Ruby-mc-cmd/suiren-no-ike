(() => {
  const P = __pond, F = P.dbg.frogs, pads = P.dbg.pads;
  F.forEach((f, i) => f.swimIn = 0.5 + i * 3);
  const rec = F.map(() => ({ swims: [], cur: null }));
  let bad = 0, maxV = 0, underF = 0, swimF = 0, dt = 1 / 30;
  for (let n = 0; n < 30 * 150; n++) {
    P.tick(1);
    F.forEach((f, i) => {
      if (!isFinite(f.pos.x + f.pos.y + f.pos.z + f.yaw + f.sk + f.sw)) bad++;
      const r = rec[i];
      if (f.state === 'swim') {
        swimF++;
        if (!r.cur) r.cur = { t0: n * dt, x0: f.pos.x, z0: f.pos.z, path: 0, lx: f.pos.x, lz: f.pos.z, vmax: 0, under: 0, to: f.jumpTo, ymin: 9 };
        const c = r.cur; c.path += Math.hypot(f.pos.x - c.lx, f.pos.z - c.lz); c.lx = f.pos.x; c.lz = f.pos.z;
        c.vmax = Math.max(c.vmax, f.swim.v); c.ymin = Math.min(c.ymin, f.swim.y); if (f.swim.y < -0.03) c.under++;
        c.tt = f.swim.tt;
      } else if (r.cur) {
        const c = r.cur; r.swims.push({ dur: +(n * dt - c.t0).toFixed(2), path: +c.path.toFixed(2), avg: +(c.path / (n * dt - c.t0)).toFixed(3), vmax: +c.vmax.toFixed(2), underFr: c.under, ymin: +c.ymin.toFixed(3), timeout: c.tt > 69, landedOn: f.jumpTo }); r.cur = null;
      }
    });
  }
  return JSON.stringify({ bad, swimF, rec: rec.map(r => r.swims), st: F.map(f => f.state + ':' + f.pad) });
})()
