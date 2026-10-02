(() => {
  __pond.cmd('testfrogs');   // the five grown frogs, with the life cycle switched off
  const P = __pond, V = P.dbg_str(), F = V.frogs, st = V.strStats;
  const out = [];
  const D = [0.06, 0.10, 0.14, 0.18, 0.22, 0.27];
  for (let trial = 0; trial < 30; trial++) {
    const fi = trial % 5, f = F[fi];
    for (const S of V.striders) S.st = 'gone';
    P.tick(1);
    for (const o of F) { o.next = 1e9; o.swimIn = 1e9; o.fullT = 1e9; }
    let n = 0; while ((f.state !== 'sit' || f.tongue || f.swallow > 0) && n++ < 900) P.tick(1);
    f.fullT = 0; f.huntCool = 0; f.prey = null; f.approachCool = 0;
    const d = D[Math.floor(trial / 5) % 6];
    const r = P.cmd('edgeprey', fi, d, 1.3);
    if (!r) { out.push({ fi, d, r: null }); continue; }
    const e0 = st.eaten, m0 = st.missed, l0 = st.lunges, s0 = st.strikes;
    let k = 0; const log = []; let fled = 0, S0 = V.striders[V.striders.length - 1];
    for (; k < 30 * 14; k++) {
      P.tick(1);
      const tag = f.state + (f.hunt ? (f.hunt.edge ? '(e)' : '(h)') : '') + (f.tongue ? '+T' : '');
      if (log[log.length - 1] !== tag) log.push(tag);
      if (S0.mode === 'flee') fled = 1;
      if (st.eaten > e0) break;
      if (st.missed > m0 && !f.tongue && (f.state === 'sit')) break;
    }
    out.push({ fi, sz: f.size, d, pad: f.pad, eat: st.eaten - e0, miss: st.missed - m0, lun: st.lunges - l0, str: st.strikes - s0, fled, t: +(k / 30).toFixed(1), log: log.slice(0, 14).join('>') });
  }
  const tot = out.reduce((a, o) => { a.eat += o.eat || 0; a.miss += o.miss || 0; a.lun += o.lun || 0; a.str += o.str || 0; return a; }, { eat: 0, miss: 0, lun: 0, str: 0 });
  return JSON.stringify({ tot, out }, null, 0);
})()
