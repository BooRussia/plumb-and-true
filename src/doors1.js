/* ================= doors1: fundamentals and the hinged family ================= */
const DOORS = [];
MT.doorRed = mk(0x9b3b30, { r: 0.5 }); MT.doorRedPanel = mk(0x86322a, { r: 0.55 });
MT.doorNavy = mk(0x2d4263, { r: 0.5 }); MT.doorNavyPanel = mk(0x263955, { r: 0.55 });
const SIX = { raised: true, rows: [{ f: 0.24, cols: 2 }, { f: 0.44, cols: 2 }, { f: 0.32, cols: 2 }] };
const SAG_FIX = [
  'Tighten every hinge screw by hand first. A drill strips the soft jamb.',
  'Take out the centre screw on the jamb side of the top hinge and drive a 3″ screw into the trimmer stud. Snug it and watch the gap at the latch corner even out.',
  'Still low at the latch corner? Slip a strip of thin cardboard behind the bottom hinge leaf to kick the bottom of the door toward the latch.'
];

/* ---------- Start here ---------- */
DOORS.push({
  id: 'basics', name: 'Start here', short: 'Start here', icon: 'start', size: 'Five rules',
  blurb: 'Every door on this sheet, hinged or sliding, is hung by the same handful of rules. Learn them on a plain interior door, then pick your door type from the schedule.',
  facts: [['Read time', '6 minutes'], ['Applies to', 'Every door'], ['Tools', 'A level and your eyes']],
  tabs: { install: 'The five rules' },
  handing: ['Right-hand', 'Left-hand'],
  extra: `
    <h3>Words that get mixed up</h3>
    <dl class="gloss">
      <dt>Single-hung, double-hung</dt><dd>These are window terms, for one or two sliding sashes. Doors are described four other ways: <b>single</b> or <b>double</b> (a pair), <b>prehung</b> or <b>slab</b>, <b>inswing</b> or <b>outswing</b>, and <b>left-</b> or <b>right-hand</b>.</dd>
      <dt>Prehung</dt><dd>A door already hinged to its own frame. You install the frame.</dd>
      <dt>Slab</dt><dd>The door alone, with no frame, hinges or holes. You fit it to a frame that is already in the wall.</dd>
      <dt>Rough opening</dt><dd>The framed hole in the wall, before any jamb. It is deliberately bigger than the door unit so shims can make up the difference.</dd>
      <dt>Reveal</dt><dd>The visible gap between the door and its jamb, ⅛″ on a well-hung door. The same word is used for the 3/16″ step between jamb and casing.</dd>
      <dt>Plumb, level, square</dt><dd>Plumb is perfectly vertical. Level is perfectly horizontal. Square is a true 90° corner.</dd>
      <dt>Active and passive</dt><dd>On a pair, the active door is the one with the handle you use. The passive door stays bolted until you need the full width.</dd>
    </dl>
    <h3>Which hand is it?</h3>
    <p>Interior doors: stand so the door swings <b>away</b> from you. Hinges on your left make it a left-hand door; hinges on your right, a right-hand door.</p>
    <p>Exterior doors: always stand <b>outside</b>. Hinges on the left is left-hand, on the right is right-hand, then say inswing or outswing.</p>
    <p>Suppliers do not all agree, so order in a full sentence: “viewed from outside, hinges on the left, swings in.” Use the Hand button over the model to flip it and see both.</p>`,
  home: [26, 9, 205, 0, 44, 0],
  build: P => buildSwing(P, { kind: 'int', dw: 30, slab: SIX, st: { unit: 0, hinge: 0, latch: 0, trim: 0, casing: 0, lock: 0, screw: 0 } }),
  steps: [
    { t: 'Plumb the hinge side, both ways', cam: [34, 16, 190, 0, 42, 8], pose: { lvl: 1, swing: 70, lean: 0.375 },
      b: ['A door is a weight hanging on a vertical line through its hinges. If that line leans, gravity moves the door for you.', 'Lean the hinge jamb toward the latch and the door drifts shut. Lean it away, or into the room, and it drifts open. The model starts with the jamb ⅜″ out. Watch the door close itself, then straighten the jamb.'],
      try: { controls: ['lean', 'leanOut', 'swing'], goal: { lean: 0, leanOut: 0, swing: 45 } },
      check: 'Open the door halfway and let go. A plumb door stays exactly where you leave it.' },
    { t: 'Let the gap be your gauge', cam: [14, 16, 72, 12, 70, 6], pose: { latchTop: 0.19, latchBot: -0.07 },
      b: ['The gap between door and jamb is called the reveal. On a good job it is an even ⅛″ across the top and down the latch side.', 'You cannot see 1/16″ on a level, but you can see it in a reveal. Once the hinge side is plumb, stop measuring the wall and start matching the jamb to the door.'],
      try: { controls: ['latchTop', 'latchBot'], goal: { latchTop: 0, latchBot: 0 } },
      check: 'A nickel should pass through the gap anywhere along it with the same light drag.' },
    { t: 'Keep both jambs in one plane', cam: [64, 12, 80, 13, 16, 8], pose: { latchZ: 0.3 },
      b: ['A wall can be plumb on both sides of the opening and still be twisted, with one trimmer leaning in and the other out. Set the jambs to a twisted wall and the door meets the stop at one end only.', 'Carpenters call that cross-legged. The cure is to move the top or bottom of one jamb in or out of the wall until the door meets the stop along its full height.'],
      try: { controls: ['latchZ'], goal: { latchZ: 0 } },
      check: 'Close the door until it just touches the stop. It should touch top and bottom at the same moment.' },
    { t: 'Fasten only where there is a shim', cam: [36, 10, 62, -13, 70, 6], pose: { swing: 96, sag: 0.2, longScrew: 0 },
      b: ['A jamb is ¾″ of soft wood. Fasten it across an empty gap and the fastener bends it. So every nail or screw goes through a pair of shims, and the shims go where the load is: behind the hinges and the strike.', 'The top hinge carries the outward pull of the whole door. It gets one 3″ screw through the jamb and shims into the framing. Without it, the door slowly sags toward the latch.'],
      try: { controls: ['sag', 'botShim'], goal: { sag: 0, botShim: 0, longScrew: 1 } },
      check: 'Short hinge screws hold the hinge to the jamb. The long one holds the jamb to the house.' },
    { t: 'Read the door before you cut it', cam: [22, 10, 150, 4, 46, 6], pose: { sag: 0.17, longScrew: 0 },
      b: ['A door that rubs is telling you where it has moved. Rubbing at the top of the latch edge with a wide gap above it means the top hinge is loose. A latch that misses the strike usually means the same thing.', 'Fix the cause and the symptoms go away together. Plane the door first and you will have a crooked door with a big gap once the hinge is tightened.'],
      try: { controls: ['sag', 'swell', 'strikeY'], goal: { sag: 0, swell: 0, strikeY: 0, longScrew: 1 } },
      check: 'Order of suspicion: loose hinge screws, then a jamb that moved, then humidity, and only then the door itself.' }
  ],
  problems: [],
  myths: [
    { c: '“Single-hung” and “double-hung” are kinds of doors.', v: 'myth', w: 'They are window terms. A door is single or double, prehung or slab, inswing or outswing, left- or right-hand.' },
    { c: 'The rough opening has to be perfectly plumb and square before a door can go in.', v: 'myth', w: 'It only has to be big enough and reasonably close. The space around the frame exists so shims can correct the opening. Past about ½″ out, fix the framing.' },
    { c: 'A prehung door is already square, so you centre it and nail it.', v: 'myth', w: 'A prehung unit is flexible until it is fastened. Nail it to a leaning stud and it takes the shape of the stud.' },
    { c: 'The reveal around a well-hung door is about ⅛″.', v: 'true', w: 'That is the target at the head and both sides. Under the door it is larger, ½″ to ¾″ over finished floor, so air can return to the furnace.' },
    { c: 'Left-hand and right-hand mean the same thing to every supplier.', v: 'myth', w: 'The interior rule and the exterior rule differ, and outswing doors are named differently in commercial hardware. Describe the door in a full sentence when you order.' },
    { c: 'More fasteners make a stronger installation.', v: 'myth', w: 'Fasteners between shims pull the jamb out of straight. A few in the right places, through shims, beat many in the wrong ones.' },
    { c: 'Spray foam can stand in for shims.', v: 'myth', w: 'Foam is insulation. It compresses, and while it cures it can push a jamb out of line. Shims carry the door; foam fills the gap afterward.' },
    { c: 'A longer level gives a truer reading on a jamb.', v: 'true', w: 'A 6-ft level spans all three hinge locations and ignores small bumps. With a 2-ft level you are reading the lumps in one stud.' }
  ]
});

/* ---------- prehung interior ---------- */
DOORS.push({
  id: 'interior', name: 'Prehung interior door', short: 'Interior prehung', icon: 'swing', size: '2′-6″ × 6′-8″',
  blurb: 'The door most people hang first. It arrives hinged to its own frame, and the whole job is setting that frame plumb in a framed opening that is not.',
  facts: [['Skill', 'Beginner'], ['Time', '1 to 2 hours'], ['Hands', 'One person']],
  handing: ['Right-hand', 'Left-hand'],
  ro: { title: 'Rough opening', pick: 'Door width', sizes: [24, 28, 30, 32, 36], pickd: 30, out: d => [['Width', frac(d + 2)], ['Height', '82½″']], note: 'Door width + 2″, door height + 2½″, for a 6′-8″ door on a 4 9/16″ jamb.' },
  tools: ['4-ft or 6-ft level', 'Shims, cedar or composite', '2½″ finish nails or 15-gauge nailer', '3″ screws', 'Tape measure', 'Utility knife', 'Hammer and nail set', 'Drill/driver'],
  home: [26, 9, 205, 0, 44, 0],
  build: P => buildSwing(P, { kind: 'int', dw: 30, slab: SIX, st: { dims: 0, unit: 1, hinge: 3, latch: 4, screw: 6, trim: 7, casing: 7, lock: 8 } }),
  steps: [
    { t: 'Check the rough opening', cam: [22, 8, 205, 0, 46, 0], labels: [['dimW', 'Door width + 2″'], ['dimH', 'Door height + 2½″']],
      b: ['Measure before the unit leaves the store. The opening should be 2″ wider than the door and 2½″ taller. A 30″ × 80″ door wants 32″ × 82½″.', 'Hold a level on both trimmer studs and across the floor. Then sight across the opening to see whether the two trimmers sit in the same plane or the wall is twisted.'],
      tip: 'Up to ½″ out of plumb is fine. The shims take it up. More than that, fix the framing first.' },
    { t: 'Confirm the hand and prep the unit', cam: [34, 10, 235, 0, 44, 16], pose: { stage: 1 },
      b: ['Stand the unit in front of the opening the way it will swing. Hinges on the correct side? Swinging into the correct room? Check now, because the mistake is invisible once the casing is on.', 'Pull the shipping staples or the plug through the latch bore, but leave the door on its hinges. If the floor is out of level, the jamb on the low side stays long and you trim the other leg so the head sits level.'],
      warn: 'Finished flooring going in later? Block both jamb legs up by its thickness now.' },
    { t: 'Set the unit in the opening', cam: [24, 9, 200, 0, 44, 0], pose: { rack: 0.45, latchTop: 0.16, latchBot: -0.05, latchZ: 0.25 },
      b: ['Lift it in from the side the door swings toward. Centre it left to right and bring the jamb edges flush with the drywall on both faces of the wall.', 'It will sit a little crooked. That is expected, and nothing gets nailed until the next step.'] },
    { t: 'Plumb and shim the hinge side', cam: [34, 7, 168, -4, 45, 4], pose: { lvl: 1, swing: 96, latchTop: 0.16, latchBot: -0.05, latchZ: 0.25 }, labels: [['shimsH', 'Shim pair behind each hinge'], ['level', 'Bubble centred means plumb']],
      b: ['The whole job hangs on this step. Slide a pair of shims, one from each side of the wall, behind the top hinge. Hold the level on the jamb and tap the shims until the bubble centres. Nail through the jamb and shims into the trimmer.', 'Repeat at the bottom hinge, then the middle. Check plumb on the face of the jamb and again on its edge.'],
      tip: 'Nail just below each hinge. Use two nails per shim pair so the jamb cannot twist.' },
    { t: 'Set the reveal on the latch side', cam: [14, 16, 72, 12, 70, 6], pose: { latchTop: 0.16, latchBot: -0.05, latchZ: 0.25 }, labels: [['shimsL', 'Shim until the gap is even']],
      b: ['Close the door and put the level down. The door is now your reference. Move the latch jamb with shims until the gap across the top and down the latch edge is an even ⅛″.', 'Shim at the top, at the bottom and beside the strike, and nail through each pair.'],
      try: { controls: ['latchTop', 'latchBot'], goal: { latchTop: 0, latchBot: 0 } },
      check: 'A nickel slides through the gap everywhere with the same light drag.' },
    { t: 'Check the door against the stop', cam: [64, 12, 80, 13, 16, 8], pose: { latchZ: 0.25 },
      b: ['Close the door until it just touches the stop and look down the latch edge. It should meet the stop evenly from top to bottom.', 'If one end touches while the other stands off, the two jambs are not in the same plane. Move the bottom of the latch jamb in or out of the wall until the contact is even, then nail it.'],
      try: { controls: ['latchZ'], goal: { latchZ: 0 } } },
    { t: 'Lock in the top hinge with a 3″ screw', cam: [38, 10, 58, -13, 71, 6], pose: { swing: 96 }, labels: [['longScrew', '3″ screw into the trimmer']],
      b: ['Finish nails hold the jamb where you put it. They will not hold a door that is opened ten times a day. Take out the centre screw on the jamb leaf of the top hinge and drive a 3″ screw through the jamb and shims into the trimmer stud.'],
      warn: 'Stop when it is snug. One turn too many pulls the jamb toward the stud and opens the gap on the latch side.' },
    { t: 'Trim the shims and case the opening', cam: [26, 8, 200, 0, 44, 0],
      b: ['Score each shim with a utility knife at the face of the jamb and snap it off. Then nail on the casing, set back 3/16″ from the inside edge of the jamb.', 'That setback hides small differences between the jamb and the wall and gives the hinge barrels room.'],
      tip: 'Interior doors do not need foam. If you want it for sound, use the low-expansion kind only.' },
    { t: 'Fit the latch and test the swing', cam: [30, 8, 150, 4, 40, 6], pose: { swing: 35 }, labels: [['strike', 'Strike plate'], ['lockset', 'Latch at 36″']],
      b: ['Install the lockset and screw the strike plate to the latch jamb. Close the door slowly. The latch should click in without your lifting or pushing the door, and the door should rest against the stop without rattling.'],
      check: 'Open the door to 45° and let go. It should stay exactly where you leave it.' }
  ],
  problems: [
    { t: 'Rubs at the top of the latch side, or drags the floor', see: 'A wide gap above the door at the latch corner, and a tight or touching gap down the top of the latch edge.', cause: 'The top hinge is pulling away from the stud. Factory hinge screws are short and only bite the jamb.', fix: SAG_FIX,
      set: { sag: 0.2, longScrew: 0 }, fixSet: { sag: 0, longScrew: 1 }, controls: ['sag', 'botShim'], cam: [16, 14, 78, 11, 71, 6] },
    { t: 'Swings open or shut on its own', see: 'Leave the door half open and it creeps one way until it stops.', cause: 'The hinge jamb is out of plumb, so the door hangs on a tilted axis and gravity moves it.',
      fix: ['Find the lean with a level on the face and then the edge of the hinge jamb.', 'Proper fix: pull the casing, cut the nails at the top or bottom hinge shims, re-shim the jamb plumb and re-nail.', 'Quick fix for a slight lean: pull one hinge pin, lay it on concrete, tap a slight bend into the middle and drive it back in. The friction holds the door.'],
      set: { leanOut: 0.375, swing: 30 }, fixSet: { leanOut: 0, swing: 30 }, controls: ['leanOut', 'lean', 'pinBend', 'swing'], cam: [42, 28, 205, 0, 40, 12] },
    { t: 'Latch will not catch', see: 'The door closes but swings back open, or you have to lift the handle to get it to click.', cause: 'The latch bolt is hitting the strike plate above or below its opening. Usually the door has dropped; the strike has not moved.',
      fix: ['Rub chalk or lipstick on the latch bolt, close the door and read where it marks the strike.', 'Off by ⅛″ or less: file the edge of the strike opening.', 'Off by more: check for sag first and fix that. Move the strike only if the door is hanging correctly.', 'To move a strike, plug the old screw holes with glued dowel or toothpicks before you drill new ones.'],
      set: { strikeY: 0.3 }, fixSet: { strikeY: 0 }, controls: ['strikeY', 'sag'], cam: [22, 6, 46, 14, 36, 5] },
    { t: 'Rattles when it is latched', see: 'The door is shut and latched but moves and knocks when air pressure changes.', cause: 'The strike plate sits too far from the stop, so the latched door has room to move.',
      fix: ['Look inside the strike opening. Most plates have a small tang.', 'Bend the tang toward the stop a little with a flat screwdriver to take up the slack.', 'No tang, or still loose: move the strike toward the stop by the width of the gap.'],
      set: { strikeZ: 0.16 }, fixSet: { strikeZ: 0 }, controls: ['strikeZ'], cam: [70, 10, 56, 14, 36, 5] },
    { t: 'Springs back open when you push it shut', see: 'The hinge-side gap closes to nothing and the door pushes back against your hand.', cause: 'The door is hinge-bound. The hinge leaves are set too deep, or a screw head stands proud, so the door edge hits the jamb before the latch reaches the strike.',
      fix: ['Look between the hinge leaves for a screw head standing proud and drive it flush.', 'Loosen the jamb leaf and slip a strip of cereal-box cardboard behind it, the full height of the leaf. Retighten.', 'If the door is pinching the stop on the hinge side, move the stop back a hair.'],
      set: { hingeBind: 1, swing: 9 }, fixSet: { hingeBind: 0, hingeShim: 1, swing: 0 }, controls: ['hingeBind', 'swing'], cam: [40, 24, 120, -4, 40, 8] },
    { t: 'Sticks in humid weather', see: 'Fine in winter, tight along the latch edge in summer.', cause: 'Wood takes on moisture through any unsealed edge and the door grows wider.',
      fix: ['Rule out sag first. A loose top hinge looks the same.', 'Mark where it rubs, take the door down and plane the latch edge with a slight bevel toward the stop side.', 'Prime and paint the bare edge the same day, and the top and bottom edges while the door is down.'],
      set: { swell: 0.14 }, fixSet: { swell: 0 }, controls: ['swell', 'sag'], cam: [16, 10, 110, 10, 50, 6] },
    { t: 'Gap down the latch side is uneven', see: 'Wide at one end of the latch edge and tight at the other, with an even gap across the top.', cause: 'The latch jamb was nailed off without being matched to the door.',
      fix: ['Pull the casing on one side if it is in the way.', 'Cut the nails at the shim that is wrong with a reciprocating saw or a bare hacksaw blade.', 'Tap the shims in to close the gap or back them out to open it, then re-nail through them.'],
      set: { latchTop: 0.2, latchBot: -0.08 }, fixSet: { latchTop: 0, latchBot: 0 }, controls: ['latchTop', 'latchBot'], cam: [14, 10, 130, 10, 44, 6] }
  ],
  myths: [
    { c: 'Use the level on the latch jamb too.', v: 'myth', w: 'Once the hinge side is plumb, the door is the gauge. Set the latch jamb to an even gap against the door, even if a level disagrees.' },
    { c: 'Shims go wherever there is a gap.', v: 'myth', w: 'They go behind the hinges and the strike, in opposing pairs, with a fastener through each pair. A single tapered shim twists the jamb.' },
    { c: 'The top hinge does most of the work.', v: 'true', w: 'It resists the outward pull of the whole door. That is why it gets the 3″ screw into the framing.' },
    { c: 'If the door rubs, plane it.', v: 'myth', w: 'Most rubbing is a loose top hinge or a jamb that moved. Plane a door that is hanging wrong and you have a bigger gap once the real cause is fixed.' },
    { c: 'An interior door should have a gap underneath.', v: 'true', w: '½″ to ¾″ over the finished floor lets air return to the furnace when the door is shut. A tight door starves the room.' },
    { c: 'Take the door off its hinges to make the frame easier to install.', v: 'partly', w: 'It makes the frame lighter, and some carpenters do it. But you lose your gauge: with the door on, the reveal shows every adjustment as you make it.' },
    { c: 'Drive the long hinge screw as tight as it will go.', v: 'myth', w: 'It is a clamp. Overdrive it and the jamb bows toward the stud, which widens the latch gap and can make the latch miss.' }
  ]
});

/* ---------- exterior, inswing and outswing ---------- */
function entryDoor(out) {
  const xo = az => out ? az : 180 - az, xi = az => out ? 180 - az : az, zo = out ? 1 : -1;
  const st = { dims: 0, pan: 1, seal: 2, unit: 3, hinge: 4, latch: 5, screw: 4, flash: 6, foam: 7, trim: 7, casing: 7, lock: 8 };
  return {
    id: out ? 'entry-out' : 'entry-in', name: out ? 'Exterior door, outswing' : 'Exterior door, inswing', short: out ? 'Exterior outswing' : 'Exterior inswing', icon: out ? 'entryOut' : 'entryIn', size: '3′-0″ × 6′-8″',
    blurb: out ? 'An entry door that opens toward the weather. Wind pushes it tighter against its seals and it cannot be kicked in, but its hinges are outside and it needs clear space to swing over.'
      : 'The standard front or back door. Hanging it is half carpentry and half roofing: the frame has to be plumb, and every layer around it has to shed water onto the layer below.',
    facts: [['Skill', 'Intermediate'], ['Time', '3 to 5 hours'], ['Hands', 'Two people']],
    handing: out ? ['Left-hand outswing', 'Right-hand outswing'] : ['Right-hand inswing', 'Left-hand inswing'],
    sides: out ? ['Outside', 'Inside'] : ['Inside', 'Outside'],
    ro: { title: 'Rough opening', pick: 'Door width', sizes: [30, 32, 36], pickd: 36, out: d => [['Width', frac(d + 2.25)], ['Height', '82½″']], note: 'Frame width + ¾″ and frame height + ½″. These are common figures for a 6′-8″ unit; the label on the unit is the final word.' },
    tools: ['6-ft level', 'Sill pan or flexible flashing', 'Flashing tape, 4″ and 6″', 'Polyurethane sealant', 'Composite shims', '3″ exterior screws', 'Drip cap', 'Low-expansion foam', 'A helper'],
    home: [xo(28), 9, 215, 0, 44, 0],
    build: P => buildSwing(P, { kind: out ? 'out' : 'in', dw: 36, W: 112, st,
      slab: { mat: out ? MT.doorNavy : MT.doorRed, panel: out ? MT.doorNavyPanel : MT.doorRedPanel, rows: [{ f: 0.34, glass: true, lites: [3, 2] }, { f: 0.66, cols: 2 }], raised: true } }),
    steps: [
      { t: 'Check the opening and the subfloor', cam: [xi(24), 9, 215, 0, 46, 0], labels: [['dimW', 'Frame width + ¾″'], ['dimH', 'Frame height + ½″']],
        b: ['The opening should be about ¾″ wider and ½″ taller than the frame. For a 3′-0″ door that is commonly 38¼″ × 82½″.', 'Now check the subfloor across the opening. It has to be level and flat, because the sill needs support along its full length. An exterior door cannot be shimmed under one corner later without breaking its seal.'
          + (out ? ' Then walk outside and check the swing: the door needs a clear landing, and most codes want that landing within about 1½″ of the threshold because the door passes over it.' : '')],
        tip: 'Subfloor out of level by more than ⅛″? Bed a tapered strip in sealant under the pan. Do not shim the sill itself.' },
      { t: 'Flash the sill', cam: [xo(24), 22, 95, 0, 4, zo * 6], labels: [['sillPan', 'Back dam on the inside edge']],
        b: ['Water will get past a door eventually. The sill pan decides where it goes. Fit a preformed pan or build one from flexible flashing, with a raised back dam along the inside edge and the ends turned 6″ up each trimmer.', 'Lap the front of the pan over the housewrap below the opening so anything in the pan drains to the outside.'] },
      { t: 'Dry-fit, then run the sealant', cam: [xo(22), 26, 118, 0, 14, zo * 6], labels: [['sealant', 'Continuous beads, no gaps']],
        b: ['Set the unit in the opening dry and confirm it fits with room to shim. Tip it back out.', 'Run three continuous beads of sealant across the pan where the sill will sit and carry them a few inches up each side. Run one more bead around the opening where the brickmould will land.'],
        warn: 'Sealant skins over in about ten minutes. Have the unit and your helper ready before you cut the tube.' },
      { t: 'Tilt the unit in from outside', cam: [xo(30), 10, 235, 0, 44, zo * 14], pose: { stage: 0.45 },
        b: ['Leave the door closed and the shipping clip in place. With a helper, set the bottom of the sill into the sealant first, then tilt the frame up into the opening.', 'Centre it, press the brickmould tight to the wall, and drive one screw through the hinge jamb near the top so it cannot fall back out.'] },
      { t: 'Plumb the hinge side and screw it off', cam: [xi(32), 6, 150, -8, 44, -zo * 4], pose: { lvl: 1, swing: out ? 0 : 96, latchTop: 0.14, latchBot: -0.05 }, labels: [['shimsH', 'Shims behind every hinge']],
        b: ['Shim behind each hinge and bring the hinge jamb plumb in both directions. Most units leave one empty hole in each hinge. Drive a 3″ screw through each one, through the shims, into the trimmer.',
          out ? 'On an outswing door the hinges face the street. Confirm they are security hinges: non-removable pins, or a stud that locks the two leaves together when the door is shut.' : 'Check the gap at the head as you go. If it tapers, the hinge jamb is not yet plumb.'],
        tip: 'Composite shims do not rot or compress. Use them on anything that sees weather.' },
      { t: 'Square the latch side to the door', cam: [xi(14), 14, 78, 14, 68, -zo * 6], pose: { latchTop: 0.14, latchBot: -0.05 }, labels: [['shimsL', 'Shim at the latch and deadbolt']],
        b: ['Close the door. Shim the latch jamb until the gap is even and the door touches the weatherstrip with the same pressure from top to bottom.', 'Fasten through the shims at the top, the bottom and behind both strikes. Hide the screws behind the weatherstrip where you can.'],
        try: { controls: ['latchTop', 'latchBot'], goal: { latchTop: 0, latchBot: 0 } },
        check: 'From inside on a bright day, you should see no light anywhere around the door.' },
      { t: 'Flash the outside from the bottom up', cam: [xo(26), 12, 190, 0, 52, zo * 8], labels: [['flashSides', '1. Sides'], ['dripCap', '2. Drip cap'], ['flashHead', '3. Head tape, last']],
        b: ['Tape the sides first, running the tape past the top of the trim. Set a metal drip cap on the head trim. Then tape across the head, covering the drip cap’s upper leg and lapping over both side tapes.', 'Fold the housewrap flap back down over the head tape and tape the cuts. Every layer now sheds water onto the one below it.'],
        warn: 'Reverse any one of those laps and you have built a funnel into the wall.' },
      { t: 'Insulate the gap and trim the inside', cam: [xi(26), 9, 205, 0, 44, 0], labels: [['foam', 'Low-expansion foam only']],
        b: ['From inside, fill the gap between frame and framing with low-expansion door-and-window foam. Fill it about half deep and let it grow.', 'Snap off the shims, then nail the interior casing with the usual 3/16″ reveal.'] },
      { t: 'Set the threshold and the locks', cam: [xi(30), 14, 78, 8, 6, -zo * 12], pose: { thresh: -0.17 }, labels: [['cap', 'Adjustable cap']],
        b: [out ? 'Close the door against the raised sill. The sweep should press on the sill evenly and the door should close without a shove.' : 'The oak or composite cap under the door rides on four or five screws. Turn them until the sweep on the door bottom just compresses against the cap.',
          'Install the lockset and deadbolt, and use 3″ screws in the strikes so they reach the trimmer. That is most of what stops a kick-in.'],
        try: { controls: ['thresh'], goal: { thresh: 0 } },
        check: 'Shut a dollar bill under the door. It should pull out with firm drag, the same at both ends.' }
    ],
    problems: [
      { t: 'Draft or daylight under the door', see: 'A line of light at the bottom from inside, or cold air on your feet.', cause: 'The adjustable threshold is set too low, or the sweep on the door bottom has worn or torn.',
        fix: ['Pop the caps off the threshold screws.', 'Raise each screw a half turn at a time, working along the length, until a dollar bill shut under the door pulls out with firm drag.', 'If the cap is already at the top of its travel, replace the sweep. Most slide or screw onto the door bottom.'],
        set: { thresh: -0.19 }, fixSet: { thresh: 0 }, controls: ['thresh'], cam: [xi(30), 14, 78, 8, 6, -zo * 12] },
      { t: 'Hard to close, scuffs the threshold', see: 'The door needs a shove for the last inch and leaves a rubbed line on the sill.', cause: 'The threshold cap is too high, or the door has sagged onto it.',
        fix: ['Look at the gap across the top of the door first. If it is even, the threshold is simply too high: lower the cap screws.', 'If the head gap is wider at the latch side, the door has sagged. Put a 3″ screw in the top hinge before you touch the threshold.'],
        set: { thresh: 0.16 }, fixSet: { thresh: 0 }, controls: ['thresh', 'sag'], cam: [xi(30), 14, 78, 8, 6, -zo * 12] },
      { t: 'Deadbolt will not throw unless you lift the door', see: 'The key turns only while you pull up or push on the handle.', cause: 'The door has dropped at the latch side, so the bolt no longer lines up with its strike. A heavy exterior door on short hinge screws does this within a year or two.', fix: SAG_FIX,
        set: { sag: 0.2, longScrew: 0 }, fixSet: { sag: 0, longScrew: 1 }, controls: ['sag', 'botShim', 'strikeY'], cam: [xi(16), 14, 78, 12, 70, -zo * 6] },
      { t: 'Draft along the latch edge', see: 'Daylight or moving air between the door and the weatherstrip.', cause: 'The strike holds the door too far off the weatherstrip, or the latch jamb is twisted so the seal touches at one end only.',
        fix: ['Shut a dollar bill in the door at several heights. Where it slides out freely, the seal is not touching.', 'Loose everywhere: move the strike toward the stop, or bend its adjusting tab.', 'Loose at one end: the jamb is out of plane. Loosen that end, move it in or out, re-shim and refasten.'],
        set: { strikeZ: 0.16 }, fixSet: { strikeZ: 0 }, controls: ['strikeZ', 'latchZ'], cam: [xi(68), 10, 58, 16, 38, -zo * 5] },
      { t: 'Door binds a week after it was foamed', see: 'It worked on install day. Now the latch edge rubs along its whole length.', cause: 'High-expansion foam kept growing and bowed the jambs inward.',
        fix: ['Cut the foam out of the gap with a long serrated knife.', 'Check the reveal, re-shim where the jamb has bowed and refasten.', 'Refill with low-expansion door-and-window foam, half depth.'],
        set: { latchTop: -0.11, latchBot: -0.11 }, fixSet: { latchTop: 0, latchBot: 0 }, controls: ['latchTop', 'latchBot'], cam: [xi(16), 10, 130, 10, 44, -zo * 6] },
      { t: out ? 'Water running in at the head' : 'Water on the floor after rain', see: out ? 'Stains at the top corners inside, or a swollen top edge on the door.' : 'A damp subfloor or stained casing at the bottom corners.', cause: out ? 'An outswing door has its top edge in the weather. With no drip cap, water runs down the wall and straight onto it.' : 'Water is getting behind the trim and has no pan to catch it, or the flashing laps are reversed.',
        fix: ['Look at the head first. There should be a metal drip cap over the trim, with its upper leg behind the housewrap or under tape.', 'Check that the side tapes run under the head tape, not over it.', 'Check the bottom corners of the brickmould, where sealant fails first.', 'No sill pan at all? The lasting fix is to pull the unit and add one.'],
        hl: ['dripCap', 'flashHead', 'flashSides', 'sillPan'], cam: [xo(24), 14, 170, 0, 56, zo * 8] }
    ].concat(out ? [{ t: 'Hinge pins can be pulled from outside', see: 'Ordinary hinges with loose pins, exposed on the street side.', cause: 'The unit was built with interior-grade hinges, or the hinges were replaced.',
      fix: ['Swap them for non-removable-pin hinges, or hinges with a security stud.', 'Budget fix: take out one screw from each leaf, opposite each other, and drive a headless screw or pin into the jamb side so it engages the hole in the door leaf when shut.', 'Add a latch guard plate over the gap at the lock.'],
      hl: ['hinges'], cam: [xo(-34), 8, 70, -18, 66, zo * 8] }] : []),
    myths: (out ? [
      { c: 'Outswing doors are easier to break into because the hinges are outside.', v: 'myth', w: 'With security hinges the pins cannot be used to remove the door. And because an outswing door closes against its frame, it cannot be kicked in.' },
      { c: 'You can turn an inswing unit around to make an outswing door.', v: 'myth', w: 'The sill, the weatherstrip and the frame rabbet are all built for one direction. Order an outswing unit.' },
      { c: 'An outswing door seals better in wind and rain.', v: 'true', w: 'Wind pressure pushes the door tighter against its stops. That is why they are common on coasts that see hurricanes.' },
      { c: 'You can add a storm door later.', v: 'myth', w: 'A storm door also swings out, into the same space. There is nowhere to put one.' },
      { c: 'Snow does not matter to the choice.', v: 'partly', w: 'A drift against an outswing door can trap you inside. In snow country it needs a covered entry or a second way out.' }
    ] : [
      { c: 'Start flashing at the top so the head is sealed first.', v: 'myth', w: 'Bottom, then sides, then top. Each layer has to lap over the one below it, like shingles.' },
      { c: 'The threshold is set correctly at the factory.', v: 'myth', w: 'It ships low so the door can travel. Raising it to meet the sweep is part of the install.' },
      { c: 'A dollar bill is a legitimate test tool.', v: 'true', w: 'Shut it in the door. Firm, even drag means the seal is touching. If it slides out, you have found the leak.' },
      { c: 'An inswing door is the easiest kind to kick in.', v: 'partly', w: 'It opens in the direction of the kick, so everything depends on the strike. With 3″ screws into the framing it holds far better than most people expect.' }
    ]).concat([
      { c: 'Caulk is what keeps water out of the wall.', v: 'myth', w: 'Flashing and correct laps keep water out. Sealant is the backup, and it lasts a few years before it needs redoing.' },
      { c: 'Any can of spray foam will do around a door.', v: 'myth', w: 'Standard foam expands hard enough to bow a jamb. Use the can marked for doors and windows.' },
      { c: 'An exterior sill can sit on a few shims.', v: 'myth', w: 'It needs support along its whole length. On shim points it flexes underfoot, cracks its seal and squeaks.' },
      { c: 'Longer screws in the hinges and strikes are a real security upgrade.', v: 'true', w: 'The frame fails before the lock does. Screws that reach the trimmer stud are the cheapest improvement there is.' }
    ])
  };
}
DOORS.push(entryDoor(false), entryDoor(true));

/* ---------- double / French ---------- */
DOORS.push({
  id: 'double', name: 'Double (French) doors', short: 'Double / French', icon: 'double', size: 'Pair of 2′-6″',
  blurb: 'Two doors meeting in the middle with nothing between them. Each one shows up the other, so small errors that hide on a single door are obvious on a pair.',
  facts: [['Skill', 'Intermediate'], ['Time', '3 to 4 hours'], ['Hands', 'Two people']],
  ro: { title: 'Rough opening', pick: 'Each door', sizes: [24, 28, 30, 32, 36], pickd: 30, out: d => [['Width', frac(2 * d + 2)], ['Height', '82½″']], note: 'Twice the door width + 2″ for an interior pair. Exterior pairs follow the unit label.' },
  tools: ['6-ft level', 'Shims', 'Finish nails', '3″ screws', 'Drill and ⅜″ bit for bolt strikes', 'Straightedge', 'A helper'],
  home: [24, 9, 235, 0, 44, 0],
  build: P => buildDouble(P, { dw: 30, st: { dims: 0, unit: 1, level: 3, hingeL: 4, hingeR: 5, head: 6, screw: 7, lock: 8, casing: 9 },
    slab: { mat: MT.doorWhite, rows: [{ f: 1, glass: true, lites: [3, 5] }], stile: 4.5, top: 4.5, bottom: 9 } }),
  steps: [
    { t: 'Check the opening and the floor', cam: [20, 9, 235, 0, 46, 0], pose: { lvl: 1, legDrop: 0.25 }, labels: [['dimW', 'Two doors + 2″'], ['level', 'Floor across the opening']],
      b: ['The opening should be twice the door width plus 2″, and 82½″ tall. Then lay a level on the floor from one side of the opening to the other.', 'On a single door a floor that is ¼″ out barely shows. On a pair, it puts one door ¼″ higher than the other right where they meet.'] },
    { t: 'Prep the unit', cam: [30, 10, 265, 0, 44, 18], pose: { stage: 1, legDrop: 0.25 },
      b: ['Carry the unit to the opening with the doors closed and the shipping braces still on. They keep the frame square until it is fastened.', 'Decide which door is active. It carries the handle and opens first. The other is the passive door and carries the astragal and flush bolts.'] },
    { t: 'Set the unit and centre it', cam: [22, 9, 235, 0, 44, 0], pose: { legDrop: 0.25 },
      b: ['Tilt the unit into the opening and centre it. Bring the jamb edges flush with the drywall on both faces.', 'Look at the top of the doors where they meet. In the model one side of the floor is ¼″ low, and the passive door sits low by the same amount.'] },
    { t: 'Level the head by shimming the low leg', cam: [16, 12, 62, 6, 76, 8], labels: [['legShim', 'Shim under the low jamb leg']],
      b: ['Raise the low jamb leg with a shim until the head jamb reads level and the tops of the two doors line up.', 'Do this before you plumb anything. Every later adjustment assumes the head is level.'],
      check: 'Run a fingertip across the meeting stiles at the top. You should feel no step.' },
    { t: 'Plumb and nail the first hinge jamb', cam: [36, 6, 170, -22, 44, 4], pose: { leanR: 0.2, cross: 0.25 }, labels: [['shimsH', 'Behind each hinge']],
      b: ['Start with the active side. Shim behind each hinge, bring the jamb plumb in both directions and nail through the shims.', 'Watch the gap across the top of that door as you go. It should stay even.'] },
    { t: 'Plumb the second jamb and set the centre gap', cam: [10, 14, 80, 0, 62, 8], pose: { leanR: 0.2, cross: 0.25 },
      b: ['Now the passive side. Shim it until the gap between the two doors is an even ⅛″ from top to bottom. That centre gap is the one people see.', 'A gap that is tight at the top and wide at the bottom means this jamb is leaning toward the middle.'],
      try: { controls: ['leanR'], goal: { leanR: 0 } } },
    { t: 'Fasten the head and check for cross-leg', cam: [58, 14, 95, 0, 30, 10], pose: { cross: 0.25 }, labels: [['shimsHd', 'Shim the head at centre']],
      b: ['A head jamb five feet long will sag. Shim it at the centre and fasten it. This also gives the top flush bolt something solid to lock into.', 'Then look at the faces of the doors where they meet. If one stands proud of the other, one jamb is twisted out of the wall plane. Move the bottom of that jamb in or out until the faces are flush.'],
      try: { controls: ['cross', 'headSag'], goal: { cross: 0, headSag: 0 } } },
    { t: 'Drive 3″ screws in both top hinges', cam: [30, 10, 190, 0, 60, 6], pose: { swing: 80, swingR: 80 }, labels: [['longScrew', 'One each side']],
      b: ['Each door hangs from its own jamb, so each top hinge gets its own 3″ screw into the trimmer. Snug only.'] },
    { t: 'Fit the flush bolts and the lockset', cam: [18, 10, 110, 2, 60, 8], pose: { swing: 50 }, labels: [['bolts', 'Top and bottom flush bolts'], ['astragal', 'Astragal on the passive door']],
      b: ['Close the passive door, throw each flush bolt to mark where it lands, and drill a strike hole in the head jamb and the floor. Drill deep enough that the bolts seat fully.', 'Fit the lockset to the active door and its strike to the edge of the passive door.'],
      warn: 'Open the active door first, always. Forcing the passive door past it tears the astragal off.' },
    { t: 'Case the opening', cam: [24, 9, 235, 0, 44, 0],
      b: ['Snap off the shims and nail on the casing. Then open and close each door a few times, and both together.'],
      check: 'Even gap at the centre, tops aligned, faces flush, passive door solid when bolted.' }
  ],
  problems: [
    { t: 'Tops of the doors do not line up', see: 'A step at the top where the doors meet, and a head gap that tapers.', cause: 'One jamb leg is sitting lower than the other, almost always because the floor is out of level.',
      fix: ['Pull the casing and cut the nails on the low side.', 'Lift that jamb leg with a shim underneath until the tops meet.', 'Re-shim behind the hinges and nail it back off.'],
      set: { legDrop: 0.25 }, fixSet: { legDrop: 0 }, controls: ['legDrop'], cam: [14, 12, 62, 4, 76, 8] },
    { t: 'Centre gap is tight at the top, wide at the bottom', see: 'The doors touch near the top and stand apart near the floor, or the other way round.', cause: 'One hinge jamb is leaning toward the middle of the opening.',
      fix: ['Decide which door is out by checking each hinge jamb with a level.', 'Tight at the top: snug the 3″ screw in that top hinge a little, or shim out behind the bottom hinge.', 'Tight at the bottom: shim out behind the top hinge.'],
      set: { leanR: 0.2 }, fixSet: { leanR: 0 }, controls: ['leanR'], cam: [8, 12, 130, 0, 50, 8] },
    { t: 'One door stands proud of the other', see: 'Closed, the faces of the two doors are not flush at the meeting edge.', cause: 'The jambs are cross-legged: the wall is twisted and one jamb follows it.',
      fix: ['Find which jamb is out by sighting along the wall or stretching two strings corner to corner across the opening. They should just touch where they cross.', 'Cut the nails at the bottom of that jamb, move it in or out of the wall until the faces are flush, and re-nail.', 'The casing will cover the small step at the drywall.'],
      set: { cross: 0.3 }, fixSet: { cross: 0 }, controls: ['cross'], cam: [58, 14, 95, 0, 30, 10] },
    { t: 'Doors rub the head in the middle', see: 'Both doors scrape at their inside top corners.', cause: 'The head jamb has sagged at the centre because it was never shimmed or fastened there.',
      fix: ['Pull the head casing.', 'Push the head jamb up, shim it against the header at the centre and drive a screw through the shims.'],
      set: { headSag: 0.14 }, fixSet: { headSag: 0 }, controls: ['headSag'], cam: [10, 14, 70, 0, 76, 8] },
    { t: 'Passive door rattles or drifts open', see: 'The pair shakes when the active door closes, or the passive door swings in on its own.', cause: 'The flush bolts are not reaching their strikes. The holes are too shallow, full of debris, or were never drilled.',
      fix: ['Throw each bolt and check that it enters its hole by at least ½″.', 'Clear out or deepen the floor hole. It fills with grit.', 'If a bolt lands beside its hole, the door has moved: fix the hang, then re-drill.'],
      set: { bolt: 0 }, fixSet: { bolt: 1 }, controls: ['bolt', 'swingR'], cam: [16, 8, 90, 2, 70, 8] },
    { t: 'Doors bind against each other in summer', see: 'Tight along the whole meeting edge in humid months.', cause: 'The centre gap was set too tight, or the edges were never sealed and the doors have swollen.',
      fix: ['Check the hang first. Even gaps at both hinge sides mean the doors themselves have grown.', 'Plane the meeting edge of the active door with a slight bevel.', 'Seal the planed edge the same day.'],
      hl: ['astragal'], cam: [8, 10, 110, 0, 50, 8] }
  ],
  myths: [
    { c: 'Hang a pair like two single doors, one after the other.', v: 'myth', w: 'They share a head jamb and have to meet each other. You level the head first, then set each side to the other door.' },
    { c: 'Floor level matters more on a pair than on a single door.', v: 'true', w: 'Any difference in jamb height shows up as a step where the doors meet.' },
    { c: 'Both doors work the same way.', v: 'myth', w: 'One is active and one is passive. The passive door is bolted top and bottom and carries the astragal the active door closes against.' },
    { c: 'A head jamb that short will not sag.', v: 'myth', w: 'On a five- or six-foot unit it will, and that is also where the top flush bolt locks. Shim and fasten it at the centre.' },
    { c: 'The astragal can go on whichever door you like.', v: 'myth', w: 'It goes on the passive door. Put it on the active door and you would have to open both doors every time.' },
    { c: 'French doors cannot be made secure.', v: 'partly', w: 'A pair is weaker than a single door at the meeting edge. Flush bolts that seat fully in the head and floor, or a three-point lock, close most of that gap.' }
  ]
});

/* ---------- slab into an existing jamb ---------- */
DOORS.push({
  id: 'slab', name: 'Slab door in an existing jamb', short: 'Slab replacement', icon: 'slab', size: '2′-6″ × 6′-8″',
  blurb: 'A new door in an old frame. Nothing gets shimmed. You cut the door to fit the opening you have, then cut the hinges and the lock into it.',
  facts: [['Skill', 'Advanced'], ['Time', '3 to 4 hours'], ['Hands', 'One person']],
  handing: ['Right-hand', 'Left-hand'],
  ro: { title: 'Slab size', pick: 'Width between jambs', sizes: [24.25, 28.25, 30.25, 32.25, 36.25], pickd: 30.25, out: d => [['Slab width', frac(d - 0.25)], ['Slab height', 'Jamb height − ⅞″']], note: '⅛″ gap at the head and each side, about ¾″ under the door. Measure the opening in three places and use the smallest.' },
  tools: ['Tape measure and combination square', 'Circular saw with a guide, or a track saw', 'Hand plane or power planer', 'Sharp ¾″ chisel', 'Utility knife', '2⅛″ hole saw and 1″ spade bit', 'Drill/driver', 'Primer or sealer'],
  home: [26, 9, 205, 0, 44, 0],
  build: P => {
    const m = buildSwing(P, { kind: 'slab', dw: 30, st: { dims: 0, unit: 0, door: 1, hinge: 0, latch: 0, trim: 0, casing: 0, screw: 6, lock: 7 },
      slab: { mat: MT.doorWood, panel: MT.doorWoodPanel, rows: [{ f: 0.2 }, { f: 0.2 }, { f: 0.2 }, { f: 0.2 }, { f: 0.2 }], rail: 4, bottom: 6 } });
    const body = P.map.get('door').obj.children[0].children[0], ex = 0.085, z0 = -0.26 - 1.375, yB = 0.75, yT = 80.75, hy = [72, 42.75, 13.5];
    P.add('marks', grp(hy.map(y => [bx(ex, ex + 3.2, y + 1.72, y + 1.8, -0.262, -0.25, MT.dim), bx(ex, ex + 3.2, y - 1.8, y - 1.72, -0.262, -0.25, MT.dim)])), { parent: body, step: 1, until: 3, noShadow: true, anat: false });
    P.add('offcut', grp(bx(ex + 30, ex + 30.45, yB, yT, z0, -0.26, MT.doorWood), bx(ex, ex + 30.45, yB - 0.6, yB, z0, -0.26, MT.doorWood)), { parent: body, step: 1, until: 2, from: [7, -9, 0], anat: false });
    P.add('mortise', grp(hy.map(y => bx(ex - 0.07, ex + 0.01, y - 1.8, y + 1.8, -0.26 - 1.55, -0.24, MT.nickel))), { parent: body, step: 3, from: [-5, 0, 0], label: 'Hinge mortises', desc: 'Recesses exactly as deep as the hinge leaf is thick, so the leaf sits flush with the edge of the door.' });
    P.add('bore', grp(at(cyl(1.06, 1.4, MT.rubber, 'z', 28), ex + 30 - 2.375, 36, -0.26 - 0.6875), at(cyl(0.5, 2.4, MT.rubber, 'x', 16), ex + 30 - 1.19, 36, -0.26 - 0.6875)), { parent: body, step: 4, until: 7, noShadow: true, label: 'Lock bore', desc: 'A 2⅛″ hole through the face and a 1″ hole in from the edge, meeting at the backset.' });
    return m;
  },
  steps: [
    { t: 'Measure the opening, not the old door', cam: [20, 9, 190, 0, 46, 0], labels: [['dimW', 'Between jambs: top, middle, bottom'], ['dimH', 'Head jamb to floor, both sides']],
      b: ['Measure the width between the jambs at the top, middle and bottom, and the height on both sides. Old frames are rarely square, and the old door may have been planed to suit.', 'Buy a slab the same nominal size and thickness: 1⅜″ for interior doors, 1¾″ for exterior. Note where the hinges and strike sit on the jamb, measured down from the head.'] },
    { t: 'Transfer the layout to the new slab', cam: [36, 10, 215, 6, 44, 20], pose: { stage: 1 }, labels: [['marks', 'Hinge lines, knifed in']],
      b: ['If the old door fits well, lay it on the new slab with the tops and hinge edges aligned and trace it: outline, hinges, lock bore. That copies every quirk of the old frame.', 'No usable old door? Mark the hinge locations from the jamb, measuring down from the head and subtracting ⅛″ for the top gap.'],
      tip: 'Mark with a knife. A pencil line is 1/32″ wide and a knife line gives the chisel somewhere to start.' },
    { t: 'Cut to size and bevel the latch edge', cam: [40, 8, 200, 8, 40, 22], pose: { stage: 1 }, labels: [['offcut', 'Offcuts']],
      b: ['Cut the bottom to length and plane the latch edge to width, leaving ⅛″ at the head and each side and about ¾″ at the floor.', 'Then plane a 3° bevel on the latch edge, leaning toward the stop side. The inside corner of a door swings on a wider arc than the outside corner. Without the bevel it clips the jamb.'],
      warn: 'A hollow-core door has only about an inch of solid wood at each edge. Take off more than ½″ and you are into cardboard.' },
    { t: 'Mortise the hinges', cam: [-32, 8, 110, 2, 50, 28], pose: { stage: 1, swing: 55 }, labels: [['mortise', 'Leaf flush with the edge']],
      b: ['Trace each hinge leaf with a knife. Score the outline, make a row of shallow chisel cuts across the waste and pare it out, bevel down, until the leaf sits exactly flush.', 'Drill pilot holes centred in the leaf holes and screw the leaves on.'],
      check: 'Lay a straightedge across the leaf and the door edge. It should not rock.' },
    { t: 'Bore for the lockset', cam: [30, 6, 62, 14, 37, 34], pose: { stage: 1 }, labels: [['bore', '2⅛″ face bore, 1″ edge bore']],
      b: ['Match the height of the strike already on the jamb. Mark the backset, 2⅜″ or 2¾″ from the edge, and drill the 2⅛″ face bore from both sides so the hole saw does not tear out the far face.', 'Drill the 1″ edge bore into it, then trace and mortise the latch plate the same way as a hinge.'] },
    { t: 'Hang the door', cam: [34, 10, 150, -6, 46, 8], pose: { swing: 70, sag: 0.12 },
      b: ['Stand the door on a couple of shims in the open position and mesh the hinge knuckles. Drop in the top pin first, then the bottom, then the middle.', 'If the knuckles will not line up, one mortise is off. Fix the mortise. Do not bend the hinge.'] },
    { t: 'Check the reveal and tune it', cam: [14, 14, 78, 11, 70, 6], pose: { sag: 0.12 },
      b: ['Close the door and read the gaps. Even all round means you are done. If the top of the latch edge is tight, the door needs to tip back toward the hinges.', 'Thin cardboard behind a hinge leaf moves the far edge of the door several times as much as the thickness of the shim. Use that before you reach for the plane.'],
      try: { controls: ['sag', 'botShim'], goal: { sag: 0, botShim: 0 } } },
    { t: 'Fit the latch, then seal every edge', cam: [28, 8, 150, 4, 40, 6], pose: { swing: 35 }, labels: [['lockset', 'Latch meets the old strike']],
      b: ['Install the lockset and check that the latch drops into the existing strike. A small miss can be filed; a larger one means moving the strike.', 'Take the door back down and prime or seal all six sides, including the top and bottom edges and the inside of the bores.'],
      check: 'An unsealed bottom edge is how a door that fit in March sticks in August.' }
  ],
  problems: [
    { t: 'Door springs open instead of latching', see: 'It pushes back against your hand just before it closes.', cause: 'A hinge mortise is too deep, or a screw head is proud, so the hinge side binds before the latch side arrives.',
      fix: ['Check every hinge screw is seated flush.', 'Shim the deep mortise with cardboard cut to the shape of the leaf.', 'Check the bevel: if the hinge-side corner of the door touches the stop, plane a touch off that corner.'],
      set: { hingeBind: 1, swing: 9 }, fixSet: { hingeBind: 0, hingeShim: 1, swing: 0 }, controls: ['hingeBind', 'swing'], cam: [40, 24, 120, -4, 40, 8] },
    { t: 'New door rubs down the latch edge', see: 'Tight or touching along the latch jamb, especially as it closes.', cause: 'The slab is a hair wide, or the latch edge was left square instead of bevelled.',
      fix: ['Mark the tight spots with a pencil on the closed door.', 'Take it down and plane to the marks with a 3° bevel toward the stop side.', 'Reseal the edge.'],
      set: { swell: 0.13 }, fixSet: { swell: 0 }, controls: ['swell'], cam: [16, 10, 110, 10, 50, 6] },
    { t: 'Latch misses the old strike', see: 'The bolt marks the plate above or below the opening.', cause: 'The bore was laid out from the floor or from the old door, not from the strike on the jamb.',
      fix: ['Within ⅛″: file the strike opening.', 'More: plug the old screw holes and move the strike. The mortise in the jamb can be extended with a chisel and the gap filled.'],
      set: { strikeY: -0.28 }, fixSet: { strikeY: 0 }, controls: ['strikeY'], cam: [22, 6, 46, 14, 36, 5] },
    { t: 'Top gap is a wedge', see: 'Even gap down the sides, tapered gap across the top.', cause: 'The old head jamb is not square to the hinge jamb, and the new slab is.',
      fix: ['Hang the door, close it and scribe a line across the top parallel to the head jamb.', 'Plane or saw to the line.', 'If the taper is small, a cardboard shim behind the bottom hinge will tip the door enough to hide it.'],
      set: { sag: 0.14 }, fixSet: { sag: 0.14, botShim: 0.11 }, controls: ['botShim', 'sag'], cam: [12, 14, 84, 6, 74, 6] },
    { t: 'Hinge screws spin in the old jamb', see: 'A screw turns without tightening.', cause: 'Years of use have stripped the holes in the soft jamb.',
      fix: ['Glue a length of ⅜″ dowel, or three toothpicks, into the hole and let it set.', 'Trim flush, drill a pilot hole and drive the screw.', 'At the top hinge, one of those screws should be a 3″ screw into the stud anyway.'],
      hl: ['hinges', 'longScrew'], cam: [38, 10, 58, -13, 71, 6] }
  ],
  myths: [
    { c: 'A 30″ slab drops straight into a 30″ opening.', v: 'myth', w: 'Old frames are out of square and old doors were planed to match them. Expect to trim.' },
    { c: 'Hinge positions are standard, so prehung hinges will line up.', v: 'myth', w: '7″ from the top and 11″ from the bottom is common, but far from universal. Take the layout from your own jamb.' },
    { c: 'The latch edge of a door should be bevelled.', v: 'true', w: 'About 3°. The inside corner travels a wider arc than the outside one and needs the clearance.' },
    { c: 'Only the faces need paint.', v: 'myth', w: 'Moisture enters through the top and bottom edges. Seal all six sides or the door will swell and stick.' },
    { c: 'You can trim as much as you like off a hollow-core door.', v: 'myth', w: 'There is roughly an inch of solid frame at each edge. Past that you have to glue the cut-off block back in.' },
    { c: 'A chisel does the job as well as a router jig.', v: 'partly', w: 'For three hinges on one door, a sharp chisel is as quick as setting up a jig. For a houseful of doors, buy the jig.' }
  ]
});
