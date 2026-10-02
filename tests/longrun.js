(() => {
  __pond.cmd('testfrogs');   // the five grown frogs, with the life cycle switched off
  const P = __pond, V = P.dbg_str(), F = V.frogs, st = V.strStats, K = P.dbg.koi;
  const fps = 30, N = fps * 60 * 12;
  let bad = 0, badS = 0, popSum = 0, popMax = 0, hunts = 0, longCrouch = 0, swimTO = 0, tongueStuck = 0;
  const eats = [], events = [], stCount = {}, longSw = [];
  const prevPrey = F.map(() => null), crouchT = F.map(() => 0), tongueT = F.map(() => 0);
  let e0 = 0, sw0 = 0;
  for (let n = 0; n < N; n++) {
    P.tick(1);
    const t = n / fps;
    let pop = 0;
    for (const S of V.striders) {
      if (S.st !== 'gone') pop++;
      if (!isFinite(S.x + S.y + S.z + S.vx + S.vz + S.yaw)) badS++;
      if (S.st === 'skate' && P.dbg.pondSDF(S.x, S.z) > 0.0) badS += 1000;
    }
    popSum += pop; popMax = Math.max(popMax, pop);
    F.forEach((f, i) => {
      if (!isFinite(f.pos.x + f.pos.y + f.pos.z + f.yaw + f.mouth)) bad++;
      stCount[f.state] = (stCount[f.state] || 0) + 1;
      if (f.prey && f.prey !== prevPrey[i]) hunts++;
      prevPrey[i] = f.prey;
      if (f.state === 'crouch') { crouchT[i] += 1 / fps; if (crouchT[i] > 2) longCrouch++; } else crouchT[i] = 0;
      if (f.tongue) { tongueT[i] += 1 / fps; if (tongueT[i] > 1) tongueStuck++; } else tongueT[i] = 0;
      if (f.state === 'swim' && f.swim && f.swim.tt > 69 && f.swim.tt < 69 + 1.01 / fps) { swimTO++; const tp = P.dbg.pads[f.jumpTo]; longSw.push({ i, t: Math.round(t), to: f.jumpTo, dP: +Math.hypot(tp.x - f.pos.x, tp.z - f.pos.z).toFixed(3), r: +tp.r.toFixed(3), chase: !!f.chase, amp: f.swim.amp, y: +f.swim.y.toFixed(3), yawErr: +Math.abs(Math.atan2(Math.sin(Math.atan2(tp.z - f.pos.z, tp.x - f.pos.x) - f.yaw), Math.cos(Math.atan2(tp.z - f.pos.z, tp.x - f.pos.x) - f.yaw))).toFixed(2) }); }
    });
    if (st.eaten > e0) { e0 = st.eaten; eats.push(+t.toFixed(1)); }
    if (n % (fps * 60) === 0) events.push([Math.round(t), pop, st.spawned, st.eaten, st.missed, st.left, st.lunges, st.strikes]);
  }
  return JSON.stringify({ longSw, bad, badS, popAvg: +(popSum / N).toFixed(2), popMax, hunts, longCrouch, swimTO, tongueStuck, st, eats, events, stCount, koiOK: K.every((k) => isFinite(k.pos.x + k.pos.y + k.pos.z)) });
})()
