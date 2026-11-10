/* ================= lib2: sliding, hanging and folding doors ================= */

/* shared motion for anything that rolls: R.mov travels in x, R.rot tilts about the line of the rollers or hangers */
function slideSim(R, o) {
  let v = 0, tt = 0;
  const y0 = R.rot.position.y, z0 = R.rot.position.z;
  return (s, dt, c) => {
    tt += dt;
    if (!c.tw.has('slide') && !c.hold) {
      let acc = (s.tilt || 0) * 7;
      const fr = 0.22 + (s.grit || 0) * 5;
      if (Math.abs(v) < 0.004 && Math.abs(acc) <= fr) v = 0;
      else { acc -= Math.sign(v || acc) * fr * 0.6; v += acc * dt; v *= Math.exp(-dt * 1.4); s.slide += v * dt; }
      if (s.slide < 0) { s.slide = 0; v = 0; }
      if (s.slide > 1) { s.slide = 1; v = 0; }
    } else v = 0;
    R.mov.position.x = (o.x1 + (s.bump || 0) * Math.sign(o.x1)) * s.slide;
    const hl = s.hLead || 0, ht = s.hTrail || 0;
    R.rot.rotation.z = o.lead * (hl - ht) / o.span;
    const hop = s.antiJump != null && s.antiJump < 0.5 ? Math.pow(Math.max(0, Math.sin(tt * 2.2)), 12) * 0.9 : 0;
    const grit = (s.grit || 0) * 0.07 * Math.abs(Math.sin(s.slide * 70));
    R.rot.position.y = y0 + (hl + ht) / 2 + hop + grit;
    R.rot.rotation.x = (s.guide != null && s.guide < 0.5 ? Math.sin(tt * 2.3) * 0.028 : 0) + (s.tip || 0) * (o.tipA || 0);
    R.rot.position.z = z0 + (s.tip || 0) * (o.tipZ || 0);
    return { d: (hl - ht) / o.span * o.H, clear: o.clear + Math.min(hl, ht), hl, ht };
  };
}
const edgeRead = (d, what) => [what, Math.abs(d) < 0.04 ? 'Parallel' : 'Open ' + frac(Math.abs(d)) + ' at the ' + (d > 0 ? 'top' : 'bottom'), Math.abs(d) < 0.04 ? 'ok' : Math.abs(d) < 0.13 ? 'warn' : 'bad'];
const rollRead = g => ['Rolling effort', g < 0.15 ? 'Glides' : g < 0.55 ? 'Gritty' : 'Grinds and sticks', g < 0.15 ? 'ok' : g < 0.55 ? 'warn' : 'bad'];
const glassSlab = (w, h, t, m) => makeSlab(w, h, t, { mat: m, rows: [{ f: 1, glass: true }], stile: 2.7, top: 2.7, bottom: 3.3 });
function linerParts(P, ow, oh, jt, desc) {
  const a = ow / 2;
  P.add('liner', grp(bx(-a - jt, -a, 0, oh, -2.28, 2.28, MT.jamb), bx(a, a + jt, 0, oh, -2.28, 2.28, MT.jamb), bx(-a - jt, a + jt, oh, oh + jt, -2.28, 2.28, MT.jamb)),
    { label: 'Finished opening', desc: desc || 'Flat jambs with no stops. Measure this, not the framing behind it.' });
  P.add('casingF', casingSet(1, -a, a, oh), { label: 'Casing', desc: 'Trim around the opening.', anat: false });
  P.add('casingB', casingSet(-1, -a, a, oh), { anat: false });
  return { L: -a, R: a, roH: oh };
}

/* ---------- sliding glass patio door ---------- */
function buildPatio(P, o) {
  const S = o.st, e = -1, m = MT.frame;
  const W = buildWall(P, { roW: 72, roH: 80, ext: true, e, W: 136, hh: 9.25 });
  dimParts(P, W, S.dims, 2.5);
  sillPan(P, W, e, S.pan); sealant(P, W, e, S.seal, 0.8, 0.6);
  P.add('frame', grp(bx(-35.75, 35.75, 0.07, 1.2, -2.75, 2.25, m), bx(-35.75, 35.75, 78, 79.5, -2.75, 2.25, m), bx(-35.75, -34.5, 1.2, 78, -2.75, 2.25, m), bx(34.5, 35.75, 1.2, 78, -2.75, 2.25, m),
    bx(-34.5, 34.5, 1.2, 1.5, 0.8, 1.0, MT.alu), bx(-34.5, 34.5, 1.2, 1.5, -1.0, -0.8, MT.alu), bx(-34.5, 34.5, 77.5, 78, -0.1, 0.1, m)),
    { step: S.frame, from: [0, 0, -34], label: 'Frame', desc: 'Sill, head and two side jambs. The sill has to sit dead level and fully supported, or nothing else will line up.' });
  P.add('fin', grp(bx(-37.25, -35.75, 0, 81, -2.31, -2.25, MT.alu), bx(35.75, 37.25, 0, 81, -2.31, -2.25, MT.alu), bx(-35.75, 35.75, 79.5, 81, -2.31, -2.25, MT.alu)),
    { step: S.frame, from: [0, 0, -34], noShadow: true, label: 'Nailing fin', desc: 'Flange around the outside of the frame. It is bedded in sealant and covered by flashing tape.' });
  P.add('shimsF', grp([14, 40, 66].map(y => [shimPair(-35.875, y, 0.25), shimPair(35.875, y, 0.25)])), { step: S.square, until: S.flash, from: [0, 0, 7], label: 'Side shims', desc: 'At every screw location on the side jambs, so the screws cannot bow the frame.' });
  P.add('screwsF', grp([14, 40, 66].map(y => [fastener(-34.5, y, 0, -1, 3, MT.screw, 0.09), fastener(34.5, y, 0, 1, 3, MT.screw, 0.09)])), { step: S.square, from: [0, 0, 6], anat: false });
  P.add('shimsCut', grp([14, 40, 66].map(y => [shimCut(-35.875, y, 0.25), shimCut(35.875, y, 0.25)])), { step: S.flash, anat: false });
  const dl = Math.hypot(69, 76.5), da = Math.atan2(76.5, 69);
  const d1 = bx(-dl / 2, dl / 2, -0.12, 0.12, 2.5, 2.6, MT.dim), d2 = bx(-dl / 2, dl / 2, -0.12, 0.12, 2.5, 2.6, MT.dim);
  const dg1 = grp(d1), dg2 = grp(d2); dg1.rotation.z = da; dg2.rotation.z = -da; dg1.position.y = dg2.position.y = 39.75;
  P.add('diag', grp(dg1, dg2), { step: S.square, only: true, anat: false, noShadow: true });
  P.add('fixed', at(glassSlab(36.5, 76.3, 1.4, m), -34.5, 1.45, -0.9), { step: S.fixed, from: [0, 0, 24], label: 'Fixed panel', desc: 'Sits on the outer track and is screwed or clipped to the frame. It can come out, but it does not slide.' });

  const stage = new THREE.Group(), mov = new THREE.Group(), rot = new THREE.Group();
  rot.position.set(16.25, 1.5, 0.9); mov.add(rot); stage.add(mov);
  rot.add(at(glassSlab(36.5, 75.8, 1.4, m), -18.25, 0.2, 0), at(cyl(0.42, 0.5, MT.steel, 'z'), -15, 0.36, 0), at(cyl(0.42, 0.5, MT.steel, 'z'), 15, 0.36, 0));
  P.add('slider', grp(stage), { step: S.slider, from: [0, 0, 20], label: 'Sliding panel', desc: 'Rides on two adjustable rollers. Click it to slide it.' });
  P.add('rollerAdj', grp(at(cyl(0.24, 0.2, MT.brass, 'z'), -17, 1.9, 0.75), at(cyl(0.24, 0.2, MT.brass, 'z'), 17, 1.9, 0.75)), { parent: rot, step: S.slider, label: 'Roller adjustment screws', desc: 'One at each bottom corner. Turning it raises or lowers that end of the panel.' });
  P.add('handle', grp(bx(15.6, 16.6, 34, 46, 0.7, 2.1, MT.alu), bx(15.8, 16.4, 39, 41, 0.7, 2.1, MT.black)), { parent: rot, step: S.hw, from: [0, 0, 5], label: 'Handle and lock', desc: 'The hook latch has to meet the keeper on the jamb squarely.' });
  const keep = bx(34.38, 34.5, 37, 41.5, 0.45, 1.35, MT.alu);
  P.add('keeper', grp(keep), { step: S.hw, from: [-4, 0, 0], label: 'Keeper', desc: 'Slotted so it can move up or down to meet the latch.' });
  P.add('antilift', bx(6, 12, 77.55, 78, 0.45, 1.35, MT.black), { from: [0, -5, 0], when: (s, mode, k) => mode === 'install' ? k >= S.hw : s.antiLift > 0.5, label: 'Anti-lift block', desc: 'Fills the space above the panel so it cannot be lifted off the track from outside.' });
  P.add('weeps', grp([-24, 0, 24].map(x => bx(x - 1, x + 1, 0.45, 0.75, -2.78, -2.74, MT.rubber))), { step: S.frame, from: [0, 0, -34], noShadow: true, label: 'Weep holes', desc: 'Slots in the outside face of the sill. Water that reaches the track drains out through them.' });
  exteriorFlash(P, { e, xL: -37.25, xR: 37.25, yTop: 79.5, capD: 0.75, lap: 1.5, lift: 0.06, st: S.flash });
  siding(P, W, e, -35.75, 35.75, 79.6);
  P.add('foam', grp(bx(-36, -35.75, 0.6, 79.5, 0.3, 2.1, MT.foam), bx(35.75, 36, 0.6, 79.5, 0.3, 2.1, MT.foam), bx(-36, 36, 79.5, 80, 0.3, 2.1, MT.foam)), { step: S.flash, noShadow: true, label: 'Low-expansion foam', desc: 'Fills the gap around the frame. Leave the weep path at the sill open.' });
  P.add('casingF', casingSet(1, -35.45, 35.45, 79.25), { step: S.trim, from: [0, 0, 12], hideInFix: true, label: 'Interior casing', desc: 'Covers the gap between the frame and the drywall.' });
  const water = bx(-34.5, 34.5, 1.2, 1.44, -2.7, 2.2, new THREE.MeshBasicMaterial({ color: 0x3f9ae0, transparent: true, opacity: 0.6 })); water.visible = false; P.root.add(water);
  const lv = makeLevel(48); lv.g.rotation.z = Math.PI / 2; lv.g.position.set(0, 0.15, 0);
  P.add('level', lv.g, { anat: false, when: s => s.lvl > 0.5 });
  const sim = slideSim({ mov, rot }, { x1: -32.5, lead: 1, span: 30, H: 76, clear: 0.2, tipA: 0.13, tipZ: 0 });
  function update(s, dt, c) {
    stage.position.z = s.stage * 30;
    const b = sim(s, dt, c);
    keep.position.y = 39.25 + s.keeper;
    water.visible = s.weep < 0.5;
    const lockOff = Math.abs(b.hl - s.keeper);
    return [
      edgeRead(b.d, 'Closing edge against the lock jamb'),
      ['Lock and keeper', lockOff < 0.09 && Math.abs(b.d) < 0.2 ? 'Line up' : 'Miss by ' + frac(Math.max(lockOff, Math.abs(b.d) / 2)), lockOff < 0.09 && Math.abs(b.d) < 0.2 ? 'ok' : 'bad'],
      b.clear < 0.04 ? ['Rolling effort', 'Panel drags on the sill', 'bad'] : rollRead(s.grit),
      ['Lift-out', s.antiLift > 0.5 ? 'Blocked at the head' : 'Panel can be lifted off the track', s.antiLift > 0.5 ? 'ok' : 'bad'],
      ['Weep holes', s.weep > 0.5 ? 'Draining' : 'Blocked, sill is flooding', s.weep > 0.5 ? 'ok' : 'bad']
    ];
  }
  return {
    update, W,
    defaults: { slide: 0, stage: 0, tip: 0, hLead: 0, hTrail: 0, grit: 0, keeper: 0, weep: 1, antiLift: 1, lvl: 0 },
    params: {
      slide: ['Slide the panel', 0, 1, 0.01, '%'], hLead: ['Roller height, lock side', -0.19, 0.31, 1 / 64, 'in'], hTrail: ['Roller height, back side', -0.19, 0.31, 1 / 64, 'in'],
      grit: ['Dirt packed in the track', 0, 1, 0.05, ''], keeper: ['Keeper height', -0.25, 0.31, 1 / 64, 'in'], weep: ['Weep holes clear', 0, 1, 1, ''], antiLift: ['Anti-lift block fitted', 0, 1, 1, '']
    },
    pose: 'slide',
    click(part, api) { if (['slider', 'handle', 'rollerAdj'].includes(part)) api.set({ slide: api.S.slide > 0.4 ? 0 : 0.92 }); }
  };
}

/* ---------- bypass (sliding closet) doors ---------- */
function buildBypass(P, o) {
  const S = o.st, ow = 60, oh = 80.5, w = 30.5, hD = 78.5, top = 0.6 + hD;
  buildWall(P, { roW: ow + 2, roH: oh + 1, W: 128 });
  const O = linerParts(P, ow, oh, 0.75);
  dimParts(P, O, S.dims, 3.2);
  P.add('track', grp(bx(-30, 30, oh - 0.12, oh, -1.5, 1.5, MT.alu), bx(-30, 30, oh - 1.4, oh, 1.42, 1.5, MT.alu), bx(-30, 30, oh - 1.1, oh, -0.05, 0.05, MT.alu), bx(-30, 30, oh - 1.1, oh, -1.5, -1.42, MT.alu)),
    { step: S.track, from: [0, -8, 10], label: 'Double track', desc: 'Two channels, one per door. The deeper fascia faces the room and hides the hangers.' });
  const hanger = (x, zc) => grp(bx(x - 0.9, x + 0.9, -2.4, 0.5, zc - 0.8, zc - 0.69, MT.metal), at(cyl(0.45, 0.3, MT.black, 'z'), x, 0.55, zc - 0.4));
  const mk2 = (zc, x0, name, label, desc, step, mat, pm) => {
    const stage = new THREE.Group(), mov = new THREE.Group(), rot = new THREE.Group();
    rot.position.set(x0 + w / 2, top + 0.3, 0); mov.add(rot); stage.add(mov);
    rot.add(at(makeSlab(w, hD, 1.375, { mat, panel: pm, rows: [{ f: 0.5 }, { f: 0.5 }], stile: 3.5, top: 3.5, bottom: 5, rail: 3.5 }), -w / 2, -hD - 0.3, zc));
    P.add(name, grp(stage), { step, label, desc });
    P.add(name + 'Hang', grp(hanger(-11, zc), hanger(11, zc)), { parent: rot, step, label: name === 'doorF' ? 'Hangers' : '', desc: 'Two per door, screwed to the top of the back face. A slotted hole or dial raises and lowers each one.' });
    return { stage, mov, rot };
  };
  const B = mk2(-0.72, -30, 'doorB', 'Back door', 'Hangs on the rear channel and goes in first.', S.doors, MT.doorWhite, MT.doorWhitePanel);
  const F = mk2(0.72, -0.5, 'doorF', 'Front door', 'Hangs on the front channel. Click it to slide it.', S.doors, MT.doorWhite, MT.doorWhitePanel);
  P.add('guide', grp(bx(-1.1, 1.1, 0, 0.1, -1.7, 1.7, MT.black), bx(-1.1, 1.1, 0.1, 0.95, -1.62, -1.5, MT.black), bx(-1.1, 1.1, 0.1, 0.95, -0.06, 0.06, MT.black), bx(-1.1, 1.1, 0.1, 0.95, 1.5, 1.62, MT.black)),
    { from: [0, 0, 10], when: (s, mode, k) => mode === 'install' ? k >= S.guide : s.guide > 0.5, label: 'Floor guide', desc: 'Sits where the doors overlap and keeps both bottoms from swinging.' });
  P.add('pullF', at(cyl(1.1, 0.06, MT.nickel, 'z'), 12.5, -40, 0.72 + 0.7), { parent: F.rot, step: S.guide, label: 'Flush pulls', desc: 'Recessed so the doors can pass each other. A knob would hit.' });
  P.add('pullB', at(cyl(1.1, 0.06, MT.nickel, 'z'), -12.5, -40, -0.72 + 0.7), { parent: B.rot, step: S.guide, anat: false });
  const lv = makeLevel(48); lv.g.rotation.z = Math.PI / 2; lv.g.position.set(0, oh - 3.9, 1.6);
  P.add('level', lv.g, { anat: false, when: s => s.lvl > 0.5 });
  const sim = slideSim(F, { x1: -29.5, lead: 1, span: 22, H: hD, clear: 0.6 });
  function update(s, dt, c) {
    F.stage.position.z = s.stage * 30; B.stage.position.z = s.stageB * 30 + s.stageB * 4; B.stage.position.x = -s.stageB * 6;
    B.mov.position.x = 29.5 * s.slideB;
    const b = sim(s, dt, c);
    lv.setL(s.tilt * 2);
    return [
      edgeRead(b.d, 'Door edge against the jamb'),
      ['Floor clearance', b.clear < 0.08 ? 'Dragging' : frac(b.clear), b.clear < 0.08 ? 'bad' : 'ok'],
      ['Track', Math.abs(s.tilt) < 0.03 ? 'Level' : frac(Math.abs(s.tilt)) + ' out, door drifts', Math.abs(s.tilt) < 0.03 ? 'ok' : 'bad'],
      ['Floor guide', s.guide > 0.5 ? 'Holding both doors' : 'Missing, doors swing and clash', s.guide > 0.5 ? 'ok' : 'bad'],
      rollRead(s.grit)
    ];
  }
  return {
    update,
    defaults: { slide: 0, slideB: 0, stage: 0, stageB: 0, hLead: 0, hTrail: 0, tilt: 0, guide: 1, grit: 0, lvl: 0 },
    params: {
      slide: ['Slide the front door', 0, 1, 0.01, '%'], slideB: ['Slide the back door', 0, 1, 0.01, '%'],
      hLead: ['Hanger height, jamb side', -0.6, 0.31, 1 / 64, 'in'], hTrail: ['Hanger height, centre side', -0.6, 0.31, 1 / 64, 'in'],
      tilt: ['Track out of level', -0.31, 0.31, 1 / 64, 'in'], guide: ['Floor guide fitted', 0, 1, 1, ''], grit: ['Worn or dirty rollers', 0, 1, 0.05, '']
    },
    pose: 'slide',
    click(part, api) {
      if (part.startsWith('doorF') || part === 'pullF') api.set({ slide: api.S.slide > 0.4 ? 0 : 0.95 });
      if (part.startsWith('doorB') || part === 'pullB') api.set({ slideB: api.S.slideB > 0.4 ? 0 : 0.95 });
    }
  };
}

/* ---------- pocket door ---------- */
function buildPocket(P, o) {
  const S = o.st, dw = 30, top = 80.5, trY = 82.4;
  const W = buildWall(P, { roW: 2 * dw + 1, roH: 84.5, W: 136 });
  dimParts(P, W, S.dims);
  P.add('phead', grp(bx(W.L, W.R, 83, 84.5, -1.75, 1.75, MT.pine), bx(0, W.R, 81.1, 83, -1.75, -1.0, MT.pine), bx(0, W.R, 81.1, 83, 1.0, 1.75, MT.pine)),
    { step: S.head, from: [0, 0, 22], label: 'Pocket header', desc: 'Kit header that spans the full double-width opening and carries the track.' });
  P.add('track', grp(bx(W.L + 0.4, W.R - 0.4, 82.9, 83, -0.65, 0.65, MT.alu), bx(W.L + 0.4, W.R - 0.4, 82.2, 83, -0.65, -0.55, MT.alu), bx(W.L + 0.4, W.R - 0.4, 82.2, 83, 0.55, 0.65, MT.alu)), { step: S.head, from: [0, 0, 22], label: 'Track', desc: 'Runs the whole length, pocket and doorway. Any dip or twist is felt every time the door moves.' });
  const sx = [[-2.5, 0], [-17, -14.5]];
  P.add('split', grp(sx.map(([a, b]) => [bx(a, b, 0.1, 83, -1.75, -1.0, MT.pine), bx(a, b, 0.1, 83, 1.0, 1.75, MT.pine), bx(a - 0.3, b + 0.3, 0, 0.1, -1.75, 1.75, MT.metal)])),
    { step: S.split, from: [0, 0, 22], label: 'Split studs', desc: 'Thin steel-wrapped uprights in pairs. The gap between them is the pocket.' });
  const stage = new THREE.Group(), mov = new THREE.Group(), rot = new THREE.Group();
  rot.position.set(14.75, trY, 0); mov.add(rot); stage.add(mov);
  rot.add(at(makeSlab(dw, 80, 1.375, { rows: [{ f: 0.34 }, { f: 0.33 }, { f: 0.33 }], stile: 4.5, rail: 4 }), -15, 0.5 - trY, 0));
  P.add('door', grp(stage), { step: S.door, from: [0, 0, 26], label: 'Door', desc: 'Any 1⅜″ slab. Click it to slide it into the pocket.' });
  const trolley = x => grp(bx(x - 1.6, x + 1.6, top - trY, top - trY + 0.12, -0.5, 0.5, MT.metal), at(cyl(0.16, 1.7, MT.steel, 'y'), x, top - trY + 0.9, 0),
    at(cyl(0.42, 0.3, MT.black, 'z'), x - 0.7, 0.2, 0.3), at(cyl(0.42, 0.3, MT.black, 'z'), x + 0.7, 0.2, -0.3));
  P.add('hangers', grp(trolley(-11), trolley(11)), { parent: rot, step: S.door, label: 'Hangers', desc: 'Wheeled trolleys that clip to plates on top of the door. The nut on each bolt raises or lowers that end.' });
  const pd = () => grp(bx(W.L, 0, 0, 84.5, 0, 0.5, MT.drywall), bx(0, W.R, 81.1, 84.5, 0, 0.5, MT.drywall));
  P.add('pdwF', at(pd(), 0, 0, 1.75), { step: S.dw, from: [0, 0, 14], xray: true, noShadow: true, label: 'Pocket drywall', desc: 'Hung on the split studs with 1″ screws so nothing pokes into the pocket.' });
  P.add('pdwB', at(pd(), 0, 0, -2.25), { step: S.dw, from: [0, 0, -14], xray: true, noShadow: true, anat: false });
  const scr = []; for (const x of [-1.25, -15.75]) for (let y = 10; y < 80; y += 14) scr.push(at(cyl(0.16, 0.08, MT.black, 'z', 8), x, y, 2.27));
  P.add('dwScrews', grp(scr), { step: S.dw, from: [0, 0, 6], anat: false, label: '1″ drywall screws' });
  const tips = []; for (const x of [-1.25, -15.75]) for (let y = 10; y < 80; y += 14) tips.push(at(cyl(0.07, 0.5, MT.steel, 'z', 6), x, y, 0.85));
  const tipG = grp(tips); tipG.visible = false; P.root.add(tipG);
  P.add('jambs', grp(bx(-0.75, 0, 0, 81.1, 0.95, 2.28, MT.jamb), bx(-0.75, 0, 0, 81.1, -2.28, -0.95, MT.jamb), bx(0, 29.75, 80.9, 82.1, 0.95, 2.28, MT.jamb), bx(0, 29.75, 80.9, 82.1, -2.28, -0.95, MT.jamb), bx(29.75, 30.5, 0, 82.1, -2.28, 2.28, MT.jamb)),
    { step: S.jambs, from: [0, 0, 12], label: 'Split jambs and strike jamb', desc: 'Screw one side of the head jamb instead of nailing it. That is your access panel if the door ever has to come out.' });
  P.add('guides', grp(bx(-0.72, -0.08, 0, 0.95, 0.72, 0.95, MT.caulk), bx(-0.72, -0.08, 0, 0.95, -0.95, -0.72, MT.caulk)), { from: [0, 0, 8], when: (s, mode, k) => mode === 'install' ? k >= S.jambs : s.guide > 0.5, label: 'Door guides', desc: 'Nylon blocks at the mouth of the pocket that keep the bottom of the door centred.' });
  P.add('bumper', at(cyl(0.55, 0.7, MT.rubber, 'x'), W.L + 0.35, 40, 0), { step: S.jambs, label: 'Bumper', desc: 'Rubber stop on the back stud. It decides how far the door disappears.' });
  P.add('pull', grp(bx(10.75, 12.95, 34 - trY, 40 - trY, 0.67, 0.73, MT.nickel), bx(10.75, 12.95, 34 - trY, 40 - trY, -0.73, -0.67, MT.nickel), bx(14.98, 15.03, 35 - trY, 39 - trY, -0.35, 0.35, MT.nickel)),
    { parent: rot, step: S.trim, label: 'Flush pull and edge pull', desc: 'Flush on the faces so the door can retract, with a finger pull on the edge to fish it back out.' });
  P.add('casingF', casingSet(1, 0, 29.75, 80.9), { step: S.trim, from: [0, 0, 12], hideInFix: true, label: 'Casing', desc: 'Nail it with short brads on the pocket side.' });
  P.add('casingB', casingSet(-1, 0, 29.75, 80.9), { step: S.trim, from: [0, 0, -12], hideInFix: true, anat: false });
  const scratch = bx(-14, 12, -40, -39.6, 0.69, 0.71, MT.rub); scratch.visible = false; rot.add(scratch);
  const sim = slideSim({ mov, rot }, { x1: -29.5, lead: 1, span: 22, H: 80, clear: 0.5 });
  function update(s, dt, c) {
    stage.position.z = s.stage * 26;
    const b = sim(s, dt, c);
    tipG.visible = s.longScrews > 0.5; scratch.visible = s.longScrews > 0.5 && s.slide > 0.25;
    return [
      edgeRead(b.d, 'Door edge against the strike jamb'),
      ['Floor clearance', b.clear < 0.08 ? 'Dragging' : frac(b.clear), b.clear < 0.08 ? 'bad' : 'ok'],
      ['Inside the pocket', s.longScrews > 0.5 ? 'Screw tips scoring the door' : 'Clear', s.longScrews > 0.5 ? 'bad' : 'ok'],
      ['Header', Math.abs(s.tilt) < 0.03 ? 'Level' : frac(Math.abs(s.tilt)) + ' out, door rolls on its own', Math.abs(s.tilt) < 0.03 ? 'ok' : 'bad'],
      ['Door guides', s.guide > 0.5 ? 'Door runs centred' : 'Missing, door rattles side to side', s.guide > 0.5 ? 'ok' : 'bad'],
      ['Open position', s.bump > 0.3 ? 'Edge buried ' + frac(s.bump - 0.0) + ' past the jamb' : 'Edge stays within reach', s.bump > 0.3 ? 'bad' : 'ok']
    ];
  }
  return {
    update, W,
    defaults: { slide: 0, stage: 0, hLead: 0, hTrail: 0, tilt: 0, guide: 1, grit: 0, longScrews: 0, bump: 0, lvl: 0 },
    params: {
      slide: ['Slide the door', 0, 1, 0.01, '%'], hLead: ['Hanger height, latch side', -0.5, 0.31, 1 / 64, 'in'], hTrail: ['Hanger height, pocket side', -0.5, 0.31, 1 / 64, 'in'],
      tilt: ['Header out of level', -0.31, 0.31, 1 / 64, 'in'], guide: ['Door guides fitted', 0, 1, 1, ''], longScrews: ['Screws too long', 0, 1, 1, ''], bump: ['Bumper set too far back', 0, 1.5, 1 / 16, 'in']
    },
    pose: 'slide',
    click(part, api) { if (['door', 'hangers', 'pull'].includes(part)) api.set({ slide: api.S.slide > 0.4 ? 0 : 1 }); }
  };
}

/* ---------- barn door ---------- */
function buildBarn(P, o) {
  const S = o.st, cx = -18, ow = 32, oh = 80, dw = 36, dh = 84, top = 0.5 + dh, barB = top + 0.95, barT = barB + 1.6, wy = barT + 1.2, zc = 4.3;
  buildWall(P, { roW: ow + 2, roH: oh + 1, W: 136, cx });
  const a = ow / 2;
  P.add('liner', grp(bx(cx - a - 0.75, cx - a, 0, oh, -2.28, 2.28, MT.jamb), bx(cx + a, cx + a + 0.75, 0, oh, -2.28, 2.28, MT.jamb), bx(cx - a - 0.75, cx + a + 0.75, oh, oh + 0.75, -2.28, 2.28, MT.jamb)),
    { label: 'Cased opening', desc: 'A finished opening with no door stops. The barn door hangs in front of it, not inside it.' });
  P.add('casingF', casingSet(1, cx - a, cx + a, oh), { label: 'Casing', desc: 'The door has to clear this, which is what the header board and standoffs are for.' });
  P.add('casingB', casingSet(-1, cx - a, cx + a, oh), { anat: false });
  dimParts(P, { L: cx - a, R: cx + a, roH: oh }, S.dims, 3.3);
  P.add('hboard', grp(bx(-42, 40, 85, 90.5, 2.25, 3.0, MT.trim), [-40, -24, -8, 8, 24, 38].map(x => at(cyl(0.2, 0.1, MT.steel, 'z', 10), x, 89.6, 3.02))),
    { step: S.board, from: [0, 0, 14], label: 'Header board', desc: 'A 1×6 screwed into every stud. The track bolts to it, so the lag bolts never depend on where the studs fall.' });
  const hang = new THREE.Group(); P.root.add(hang);
  const bolts = [-34, -17, 0, 17, 34];
  P.add('track', grp(bx(-38, 36, barB, barT, zc - 0.12, zc + 0.12, MT.black), bolts.map(x => [at(cyl(0.55, zc - 0.12 - 3.0, MT.black, 'z'), x - 1, (barB + barT) / 2, (3.0 + zc - 0.12) / 2), at(cyl(0.42, 0.22, MT.steel, 'z', 6), x - 1, (barB + barT) / 2, zc + 0.23)])),
    { parent: hang, step: S.track, from: [0, 0, 14], label: 'Track, standoffs and lag bolts', desc: 'A flat steel bar held off the wall by spacers. It must be level along its whole length.' });
  const stage = new THREE.Group(), mov = new THREE.Group(), rot = new THREE.Group();
  rot.position.set(cx, wy, zc); mov.add(rot); stage.add(mov);
  rot.add(at(makeSlab(dw, dh, 1.4, { mat: MT.doorWood, panel: MT.doorWoodPanel, rows: [{ f: 0.5 }, { f: 0.5 }], stile: 5, top: 5, bottom: 6, rail: 5 }), -dw / 2, 0.5 - wy, 0));
  P.add('door', grp(stage), { parent: hang, step: S.door, label: 'Door', desc: 'Wider and taller than the opening so it overlaps on every side. Click it to slide it.' });
  const strap = x => grp(bx(x - 0.9, x + 0.9, top - 7 - wy, 0.9, 0.7, 0.86, MT.black), at(cyl(1.6, 0.5, MT.black, 'z', 28), x, 0, 0), at(cyl(0.3, 1.3, MT.steel, 'z'), x, 0, 0.35),
    at(cyl(0.3, 0.12, MT.steel, 'z', 6), x, top - 2 - wy, 0.9), at(cyl(0.3, 0.12, MT.steel, 'z', 6), x, top - 5.5 - wy, 0.9));
  P.add('straps', grp(strap(-14), strap(14)), { parent: rot, step: S.door, label: 'Hangers', desc: 'Strap hangers with grooved wheels, through-bolted to the face of the door.' });
  P.add('stops', grp(bx(-35.5, -34.5, barT - 0.4, barT + 1.4, zc - 0.4, zc + 0.4, MT.black), bx(32.2, 33.2, barT - 0.4, barT + 1.4, zc - 0.4, zc + 0.4, MT.black)), { parent: hang, step: S.stops, from: [0, 6, 0], label: 'Track stops', desc: 'Clamp to the bar at each end. They set exactly where the door parks open and closed.' });
  P.add('antijump', grp(at(cyl(0.7, 0.3, MT.black, 'y'), -9, top + 0.4 - wy, 0), at(cyl(0.7, 0.3, MT.black, 'y'), 9, top + 0.4 - wy, 0)), { parent: rot, from: [0, 0, 6], when: (s, mode, k) => mode === 'install' ? k >= S.anti : s.antiJump > 0.5, label: 'Anti-jump discs', desc: 'Sit on the top edge just under the bar so the wheels cannot lift off.' });
  P.add('guide', grp(bx(-3, 1, 0, 0.12, 2.9, 5.7, MT.black), at(cyl(0.45, 1, MT.black, 'y'), -1, 0.6, 3.1), at(cyl(0.45, 1, MT.black, 'y'), -1, 0.6, 5.5)), { from: [0, 0, 10], when: (s, mode, k) => mode === 'install' ? k >= S.guide : s.guide > 0.5, label: 'Floor guide', desc: 'Keeps the bottom of the door from swinging away from the wall. Placed so the door never leaves it.' });
  P.add('handle', grp(bx(-15.5, -14.3, -53, -39, 0.7, 2.2, MT.black)), { parent: rot, step: S.handle, from: [0, 0, 5], label: 'Pull', desc: 'A flush pull goes on the wall side so the door can slide past the casing.' });
  const lv = makeLevel(48); lv.g.rotation.z = Math.PI / 2; lv.g.position.set(-1, barT + 0.2, zc + 0.9);
  P.add('level', lv.g, { anat: false, when: s => s.lvl > 0.5 });
  const sim = slideSim({ mov, rot }, { x1: 34, lead: -1, span: 28, H: dh, clear: 0.5 });
  function update(s, dt, c) {
    stage.position.z = s.stage * 26; hang.position.z = s.standoff;
    const b = sim(s, dt, c), gap = 0.48 + s.standoff;
    lv.setL(-s.tilt * 2);
    return [
      ['Track', Math.abs(s.tilt) < 0.03 ? 'Level' : frac(Math.abs(s.tilt)) + ' out, door rolls on its own', Math.abs(s.tilt) < 0.03 ? 'ok' : 'bad'],
      ['Bottom edge', Math.abs(b.d) < 0.04 ? 'Parallel to the floor' : frac(Math.abs(b.hl - b.ht)) + ' out across the door', Math.abs(b.d) < 0.04 ? 'ok' : 'bad'],
      ['Clearance to the casing', gap < 0.06 ? 'Rubbing' : frac(gap), gap < 0.06 ? 'bad' : gap < 0.2 ? 'warn' : 'ok'],
      ['Floor guide', s.guide > 0.5 ? 'Engaged' : 'Missing, door swings off the wall', s.guide > 0.5 ? 'ok' : 'bad'],
      ['Anti-jump discs', s.antiJump > 0.5 ? 'Set' : 'Missing, door can lift off the bar', s.antiJump > 0.5 ? 'ok' : 'bad']
    ];
  }
  return {
    update,
    defaults: { slide: 0, stage: 0, hLead: 0, hTrail: 0, tilt: 0, guide: 1, antiJump: 1, standoff: 0, grit: 0, lvl: 0 },
    params: {
      slide: ['Slide the door', 0, 1, 0.01, '%'], hLead: ['Hanger height, left', -0.31, 0.31, 1 / 64, 'in'], hTrail: ['Hanger height, right', -0.31, 0.31, 1 / 64, 'in'],
      tilt: ['Track out of level', -0.31, 0.31, 1 / 64, 'in'], guide: ['Floor guide fitted', 0, 1, 1, ''], antiJump: ['Anti-jump discs fitted', 0, 1, 1, ''], standoff: ['Standoff depth', -0.5, 0.5, 1 / 16, 'in']
    },
    pose: 'slide',
    click(part, api) { if (['door', 'straps', 'handle'].includes(part)) api.set({ slide: api.S.slide > 0.4 ? 0 : 1 }); }
  };
}

/* ---------- bifold doors ---------- */
function buildBifold(P, o) {
  const S = o.st, ow = 36, oh = 80.75, w = 17.7, hD = 79, yb = 0.55, px = -17.75;
  buildWall(P, { roW: ow + 2, roH: oh + 1 });
  const O = linerParts(P, ow, oh, 0.75);
  dimParts(P, O, S.dims, 3.2);
  P.add('track', grp(bx(-17.9, 17.9, oh - 0.1, oh, -0.55, 0.55, MT.alu), bx(-17.9, 17.9, oh - 0.85, oh, -0.55, -0.47, MT.alu), bx(-17.9, 17.9, oh - 0.85, oh, 0.47, 0.55, MT.alu)),
    { step: S.track, from: [0, -8, 10], label: 'Top track', desc: 'The only track there is. A bifold has no bottom track, just a pivot bracket.' });
  const sock = bx(-0.7, 0.7, oh - 0.8, oh - 0.12, -0.42, 0.42, MT.metal);
  P.add('pivotTop', grp(sock), { step: S.track, from: [0, -8, 10], label: 'Top pivot socket', desc: 'Slides along the track and locks with a screw. It sets the gap at the top of the pivot side.' });
  P.map.get('pivotTop').obj.position.x = px + 0.6; P.map.get('pivotTop').home.x = px + 0.6;
  P.add('snugger', bx(12.5, 15.2, oh - 0.8, oh - 0.14, -0.42, 0.42, MT.caulk), { from: [0, -6, 0], when: (s, mode, k) => mode === 'install' ? k >= S.finish : s.snug > 0.5, label: 'Snugger', desc: 'A spring clip in the track that holds the lead door shut and flat.' });
  const brk = grp(bx(-0.25, 3.2, 0, 0.12, -0.7, 0.7, MT.metal), bx(-0.25, -0.13, 0, 2.3, -0.7, 0.7, MT.metal), at(cyl(0.32, 0.3, MT.black, 'y'), 0.6, 0.25, 0));
  const brkG = grp(brk); brkG.position.set(px, 0, 0);
  P.add('pivotBot', brkG, { step: S.bracket, from: [0, 0, 10], label: 'Bottom pivot bracket', desc: 'Screwed to the floor and jamb. Its toothed slot sets the gap at the bottom, and it must sit plumb under the top pivot.' });
  P.add('plumb', grp(at(cyl(0.05, oh - 3, MT.dim, 'y', 6), px + 0.6, (oh - 3) / 2 + 2, 0), at(cyl(0.4, 1.4, MT.brass, 'y', 12), px + 0.6, 1.8, 0)), { step: S.bracket, only: true, anat: false, noShadow: true });
  const stage = new THREE.Group(), set = new THREE.Group(), A = new THREE.Group(), B = new THREE.Group();
  stage.position.set(px, 0, 0); stage.add(set); set.add(A); B.position.x = w + 0.1; A.add(B);
  const so = { mat: MT.doorWhite, panel: MT.doorWhitePanel, rows: [{ f: 0.5 }, { f: 0.5 }], stile: 2.6, top: 3, bottom: 5, rail: 3 };
  A.add(at(makeSlab(w, hD, 1.375, so), 0, yb, 0)); B.add(at(makeSlab(w, hD, 1.375, so), 0, yb, 0));
  [10, 40, 70].forEach(y => A.add(bx(w - 0.7, w + 0.8, y - 1, y + 1, -0.76, -0.69, MT.nickel)));
  P.add('doors', grp(stage), { step: S.doors, label: 'Door pair', desc: 'Two panels hinged together. The pivot door stays at the jamb and the lead door runs in the track. Click to fold.' });
  P.add('pins', grp(at(cyl(0.16, 1.1, MT.steel, 'y'), 0.6, yb + hD + 0.3, 0), at(cyl(0.16, 1.2, MT.steel, 'y'), 0.6, yb - 0.25, 0), at(cyl(0.3, 0.12, MT.steel, 'y', 6), 0.6, yb - 0.05, 0)),
    { parent: A, step: S.doors, label: 'Pivot pins', desc: 'Spring-loaded on top, threaded on the bottom. Turning the bottom pin raises or lowers the whole pair.' });
  P.add('guidePin', grp(at(cyl(0.14, 1, MT.steel, 'y'), w - 0.6, yb + hD + 0.3, 0), at(cyl(0.36, 0.3, MT.caulk, 'y'), w - 0.6, yb + hD + 0.55, 0)),
    { parent: B, step: S.doors, label: 'Guide roller', desc: 'Spring-loaded pin on the lead door that rides in the track.' });
  P.add('knob', grp(at(cyl(0.3, 1, MT.nickel, 'z'), w * 0.5, 36, 1.1), at(cyl(0.75, 0.5, MT.nickel, 'z'), w * 0.5, 36, 1.75)), { parent: B, step: S.finish, from: [0, 0, 5], label: 'Knob', desc: 'Centred on the lead door. Pulling here breaks the hinge joint outward so the pair folds.' });
  const rubF = bx(0, 2 * w, yb - 0.1, yb + 0.1, -0.7, 0.7, MT.rub); rubF.visible = false; set.add(rubF);
  let tt = 0;
  function update(s, dt) {
    tt += dt;
    stage.position.z = s.stage * 30; stage.position.x = px;
    const a = s.fold * 80 * D2R + (s.snug < 0.5 && s.fold < 0.06 ? 5 * D2R : 0);
    A.rotation.y = -a;
    B.rotation.y = s.guide > 0.5 ? 2 * a : 2 * a - Math.max(0.25, a * 0.7) + Math.sin(tt * 2) * 0.04;
    set.rotation.z = -(s.topX - s.botX) / hD; set.position.x = s.botX; set.position.y = s.botH;
    sock.position.x = s.topX;
    const gT = 0.25 + s.topX, gB = 0.25 + s.botX, fl = yb + s.botH, tc = 0.35 - s.botH;
    rubF.visible = fl < 0.08;
    const st = g => g < 0.03 ? 'bad' : g < 0.1 || g > 0.45 ? 'warn' : 'ok';
    return [
      ['Gap at pivot jamb, top', gT < 0.03 ? 'Rubbing' : frac(gT), st(gT)], ['Gap at pivot jamb, bottom', gB < 0.03 ? 'Rubbing' : frac(gB), st(gB)],
      ['Floor clearance', fl < 0.08 ? 'Dragging' : frac(fl), fl < 0.08 ? 'bad' : 'ok'],
      ['Guide in track', s.guide < 0.5 ? 'Out of the track' : tc > 0.7 ? 'Barely engaged, will pop out' : tc < 0.05 ? 'Door top binds on the track' : 'Engaged', s.guide < 0.5 || tc > 0.7 || tc < 0.05 ? 'bad' : 'ok'],
      ['Closed position', s.snug > 0.5 ? 'Sits flat' : 'Springs open at the fold', s.snug > 0.5 ? 'ok' : 'warn']
    ];
  }
  return {
    update,
    defaults: { fold: 0, stage: 0, topX: 0, botX: 0, botH: 0, guide: 1, snug: 1, lvl: 0 },
    params: {
      fold: ['Fold the doors', 0, 1, 0.01, '%'], topX: ['Top pivot socket, sideways', -0.25, 0.5, 1 / 32, 'in'], botX: ['Bottom pivot, sideways', -0.25, 0.5, 1 / 32, 'in'],
      botH: ['Bottom pivot height', -0.6, 0.4, 1 / 32, 'in'], guide: ['Guide roller in the track', 0, 1, 1, ''], snug: ['Snugger fitted', 0, 1, 1, '']
    },
    pose: 'fold',
    click(part, api) { if (['doors', 'knob', 'pins', 'guidePin'].includes(part)) api.set({ fold: api.S.fold > 0.4 ? 0 : 0.92 }); }
  };
}
