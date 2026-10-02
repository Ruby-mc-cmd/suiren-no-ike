(() => {
  // the grey heron: three visits from arrival to departure with frogs on the leaves and tadpoles in the shallows.
  // Nothing may go NaN, it must leave each time, and a tap next to it must startle it into flight.
  const P = __pond, H = P.dbg_heron(), h = H.heron, L = P.dbg_life(), pads = P.dbg.pads, fps = 30;
  let made = 0;
  for (let i = 0; i < pads.length && made < 6; i++) {
    const p = pads[i]; if (p.lotus || p.r < 0.11 || P.dbg.pondSDF(p.x, p.z) > -0.25) continue;
    const T = L.tadpoles[made]; T.x = p.x + p.r + 0.03; T.z = p.z; T.y = -0.03; T.dev = 629.8; T.energy = 0.9; T.climb = { pad: i }; made++;
  }
  P.tick(fps * 15);
  for (const f of L.frogs) { f.dev = L.LIFE.ADULT + 10; f.size = Math.max(f.size, 1.0); f.energy = 0.9; f.cool = 1e9; }
  let bad = 0; const visits = [];
  for (let v = 0; v < 3; v++) {
    P.cmd('heron'); let n = 0; const seen = new Set();
    while (h.st !== 'away' && n < fps * 240) {
      P.tick(1); n++; seen.add(h.st);
      if (!isFinite(h.x + h.z + h.bx + h.by + h.bz + h.yaw + h.pitch + h.hy + h.hp)) bad++;
      for (const u of [...H.HU.uNk.value, ...H.HU.uLg.value, ...H.HU.uWL.value]) if (!isFinite(u.x + u.y + u.z)) bad++;
      for (const f of L.frogs) if (!isFinite(f.pos.x + f.pos.y + f.pos.z)) bad++;
    }
    visits.push({ secs: +(n / fps).toFixed(1), left: h.st === 'away', states: [...seen].join(' ') });
    h.next = 1e9; P.tick(fps * 5);
  }
  // startle: a tap on the water right next to it
  P.cmd('heron'); let k = 0; while (h.st !== 'stand' && k < fps * 20) { P.tick(1); k++; }
  const sx = h.x + 0.2, sz = h.z; const [cx, cy] = P.project(sx, 0, sz);
  P.cmd('cam', { tx: h.x, ty: 0.3, tz: h.z, az: h.yaw + 1.6, el: 0.5, dist: 3, fov: 40 }, true); P.tick(1);
  const [px, py] = P.project(sx, 0, sz);
  const before = h.st; P.cmd('tap', px, py); const after = h.st;
  P.tick(fps * 8);
  const st = Object.assign({}, h.n);
  return JSON.stringify({ ok: bad === 0 && visits.every((v) => v.left) && after === 'takeoff', bad, visits, startle: [before, after, h.st], n: st, heron: L.lifeStats.heron, frogs: L.frogs.length });
})()
