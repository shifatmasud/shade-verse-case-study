# Shade Verse

## A shadow that swings through a city park, in a browser tab, on a budget phone

![The lake at ground level: the footbridge, cherry blossoms and the city behind the trees.](https://shade-verse-case-study.vercel.app/media/still-1440-hero.jpg)

I'm Shifat Masud, a design engineer and student game dev. Shade Verse is my 3D web-swinging game, and it runs in a browser tab.

> “Our game name must always be "Shade Verse".”
> — Shifat Masud

You play Shadow, a dark hero who swings, springs, glides and flies through an open city with a park at its heart: a forest, a round lake, a sandy beach and a footbridge. South of it lies an open sea with Jungle Island and its waterfall, and a long bridge to a second city, Neon Harbor. Shadow's wife Ghost swings with him, and the two talk the whole way. Robots fill the streets, and you fight them with melee combos, web shots and a Web Shock. It plays on a phone with touch buttons and on a laptop with mouse, keyboard or a gamepad. No install, no store, just a link.

I built it with Zero, my AI build partner. I set the vision, the locks and the taste, and made every call. Zero wrote, tested and shipped the code, pass after pass, and showed me a before/after sheet for every change. The goal was simple to say and hard to do: it has to feel like a real swinging game and still be cheap enough for my own budget phone and my old Intel laptop.

This case study is what I learned along the way. Every section ends with something you can take into your own work, and every number says where it came from. Where something isn't measured yet, it says that too.

## Process: a scorecard and a lock file

A game like this can stay "almost fun" forever. So from the very first build, every release got a score out of 100 on five pillars: Visuals, Controls, Performance, Stability and Device compatibility. Controls carry the most weight (25), because a swinging game lives or dies in the hands.

The first build scored 49. The best release so far scored 86. In between, the line goes down as often as it goes up: the giant boss landed at 79, because a big new feature that isn't polished yet should cost points. A score that only rises is decoration.

*Self-scored release score out of 100 (Visuals 20, Controls 25, Performance 20, Stability 15, Device compatibility 20), from docs/SCORECARD.md. Performance and device scores are estimates: they were never measured on my phone or laptop. Later scores are marked provisional.*

The second tool is a lock file. It is short, and every builder reads it first: melee combat is locked, the Shadow hero model, the HUD and the controls are locked, and the game is landscape only. It also holds the release rules: cite real visual references, capture before-and-after screenshots every iteration, check both of my devices, and keep what was observed apart from what was estimated.

Locks are what let me say "keep improving" and go to sleep. Nobody "improves" the things I already love by accident.

### How we decide

> **Me:** Lake water upgrade direction / Reflection & Refraction / Best Practice (Hybrid) / Hero Object → analytic raytrace / Everything else → SSR reflection + screen refraction / Fallback → cubemap … / Always add Fresnel for realism / {Index of Refraction for Water = 1.33}
> **Zero:** Got it, passed to the build as-is … Heads-up: real SSR needs an extra scene render, so it's HQ-tier only.
> **Me:** Ssr reflection & screen refraction (res down, low quality) can be used in phone smartly
> **Zero:** Fair, updated: the phone gets SSR + refraction too, at quarter res, ~6–8 steps, only rendered while the lake is on screen, and it drops to cubemap if FPS dips.

*The real thread, Oct 29, 12:01–12:03 AM. Zero brings the cost. I make the call. Then it ships.*

> **The mind:** Small visible wins keep long creative work alive (the progress principle). A score per release turns a long build into a string of wins, and an honest dip tells you where the work actually is.

> **Steal this:** Score every release on a few fixed pillars, weight the one your game lives on, and let the score drop when it should. Write your locks down in one short file that every builder reads first.

## The concept: a shadow that swings

Shade Verse is a 3D game that runs in the browser, on a phone or a laptop, with nothing to install. You play Shadow, a dark hero who web-swings through an open world: a city block of streets and rooftops, and a big park in the middle of it with a forest, a round lake, a sandy beach and a footbridge.

The idea is the feeling of a superhero swinging game, made to fit in a browser tab on a budget phone. You swing, spring between buildings, jump, glide and fly. When robots get in the way, you fight them with your fists, your web and your Web Shock.

*Gameplay trailer (22.5 s): the title, the lake and beach, a swing over the park, and street combat. Recorded from the game in a headless browser.*

The world is built from free low-poly Polyfork models (buildings, trees, the footbridge), shaped and placed in code, with Poly Haven CC0 textures for bark and leaves. Everything else, the water, the sand, the grass and the outlines, is a shader written for this game.

> **The mind:** A clear fantasy does most of the design work. Once "you are a shadow who swings" is the sentence, every feature can be judged by one question: does it make the swing feel better?

> **Steal this:** Write your game as one sentence a player would say. Then cut or postpone anything that doesn't serve that sentence.

## Mobile first: two real devices set the budget

The target isn't a gaming PC. It's the two devices I actually own, read from their own GPU reports:

- Phone: Samsung Galaxy M02s (SM-M025F), Adreno 506, WebGL2 through ANGLE on GLES 3.0, max texture 4096, 412×915 at 1.75× density (played in landscape at 915×412), Chrome 155 on Android 10.
- Laptop: Intel UHD Graphics 600, 3 GB of RAM, 2 cores, 1366×768, Edge 155 on Windows 10. Its report flags MSAA as slow.

Those two set the rules for every pass: few draw calls, no new post-processing passes, textures at 1024 px or less. Trees are merged per species and instanced. The water is one mesh. The beach is drawn in the ground shader with no texture at all.

![Landscape phone (915×412 at 1.75×, debug build, software renderer): the touch buttons stay on the phone.](https://shade-verse-case-study.vercel.app/media/still-915-lake.jpg)
![Landscape phone (915×412 at 1.75×, debug build, software renderer): the touch buttons stay on the phone.](https://shade-verse-case-study.vercel.app/media/still-915-swing.jpg)
*Landscape phone (915×412 at 1.75×, debug build, software renderer): the touch buttons stay on the phone.*

### The honest part

Real-device frame rates are not measured yet. Every number in this case study that sounds like speed came from a headless browser with a software renderer, which is far slower than either device and behaves differently. The biggest known risk is the lake: its scene copy roughly doubles draw calls while the lake is on screen (estimated from the code, not measured). It runs every other frame when the resolution scaler drops to 0.6 and turns off at 0.5. The next step is a real fps check near the lake on both devices.

> **The mind:** Constraints are a gift to creativity: a hard budget forces you to find the cheap trick that looks expensive, and those tricks are usually the most interesting part of the work.

> **Steal this:** Pick the weakest device you care about and write its numbers at the top of your project. Then never call anything fast until it's measured on that device.

## Movement: swing, spring, glide, fly

Movement is the game. It's split into four verbs that chain into each other without a menu or a mode switch:

- Swing. Hold the swing control and a web line attaches to a building anchor, at least 12 m long. Speed builds through the arc up to a cap of 46 m/s.
- Web spring. A tap webs you straight to the nearest real anchor and launches you along it. Jump while swinging does the same from the line you're on.
- Jump, glide, fly. One button does all of it. Tap to jump: you leave the ground at 24 m/s, reach about 4.5 m in 0.39 s and fall faster than you rise, so the whole jump takes 0.74 s. Tap again in the air for a double jump. Hold past 0.18 s to glide, sinking at about 4 m/s and speeding up to 32 m/s forward; the glide stays on after you let go. Hold again while gliding to fly up at up to 44 m/s, and tap while gliding to drop out with a jump.
- Walls and water. Run up walls, jump off them, vault over edges, and swim when you fall in the lake.

Those numbers aren't from feel alone. They're constants in src/sim.ts, and the flight caps were raised once when I asked for faster flight (swing cap 34 → 46, glide cap 14 → 22 → 32). On the desktop, Space does exactly what the phone's jump button does, 1:1, so both feel like the same game.

![Mid-swing over the park, the web line anchored to a building (1440 px, debug build, software renderer).](https://shade-verse-case-study.vercel.app/media/still-1440-swing.jpg)
*Mid-swing over the park, the web line anchored to a building (1440 px, debug build, software renderer).*

![Auto-glide toward the lake after the launch beat.](https://shade-verse-case-study.vercel.app/media/still-1440-glide.jpg)
*Auto-glide toward the lake after the launch beat.*

> **The mind:** Flow comes from verbs that hand off to each other. When the end of one move is the start of the next, players stop thinking about buttons and start thinking about routes.

> **Steal this:** Put every movement number in one file as named constants, and change them only with a reason you can write next to the number.

## Combat: melee, web shot, Web Shock

The streets are full of robots, drones and armoured heavies with red eyes, 26 of them on the map at a time. Combat has three tools, each with one job:

- Melee. A 4-hit ground chain: jab, cross, a full 360° spin hook kick, and a launcher that pops the robot into the air. Melee again while it hangs and Shadow leaps after it for a diving spike kick. Input is buffered, so a press during a strike starts the next one at its cancel point. Every hit has its own hit-stop and a small camera shake.
- Web shot. An auto-targeted plasma bolt (55 m/s, up to 3 in flight) that bursts in an 8 m radial blast with knockback. Shoot a launched robot and the web yanks it down into the street.
- Web Shock. Hold the attack (on a mouse, hold left click past 0.22 s): up to 5 targets within 24 m are webbed, pulled together and shocked in one 1.65 s move, with a 0.10 s hit-stop. It used to be called Shadow Snare. I renamed it everywhere a player can see it.

![Street level: Shadow in the robot crowd, and up close with an armoured heavy (debug build, software renderer).](https://shade-verse-case-study.vercel.app/media/still-1440-combat.jpg)
![Street level: Shadow in the robot crowd, and up close with an armoured heavy (debug build, software renderer).](https://shade-verse-case-study.vercel.app/media/still-1440-melee.jpg)
*Street level: Shadow in the robot crowd, and up close with an armoured heavy (debug build, software renderer).*

Melee combat is locked. Once the choreography felt right, frame by frame against real martial arts references (Muybridge's boxing plates, a taekwondo 540 hook kick, a capoeira armada), nobody could touch it without my OK. Only Web Shock was left open to change.

> **The mind:** Hit-stop works because the brain reads a tiny freeze as weight. Two or three frames of stillness on impact feel heavier than any particle effect.

> **Steal this:** Give each attack one clear job, study real bodies frame by frame for the motion, then lock the moves that feel right.

## The lake

The lake is the centrepiece of the park and the most expensive thing in it, so it got the most thought. I gave the direction in one message: a hybrid. The hero gets an analytic ray-trace, everything else gets screen-space reflection plus screen refraction, there's a fallback, and Fresnel is always on, with water's index of refraction at 1.33.

- Fresnel, always. IOR 1.33 gives a reflectance of about 2% looking straight down, rising toward the horizon. That's why the lake is clear at your feet and a mirror in the distance.
- The hero, ray-traced. Shadow is traced into the water analytically as three spheres, so his reflection is always there and costs almost nothing.
- Everything else, from a low-res copy. Reflection and refraction read a low-resolution copy of the scene: quarter resolution with 7 steps on phones and laptops, half resolution with 16 steps plus refinement on the high tier.
- Only when it matters. The copy is made only while the lake is on screen. It drops to every other frame when the resolution scaler is at 0.6 or below and turns off at 0.5. Then the water falls back to a sky-and-treeline reflection and lets the real lakebed show through.
- Life on top. Animated ripples, colour that deepens with depth, and shallows that fade into the sand. The water is one draw call of about 2.7k triangles (from the code, an estimate of cost, not a measurement).

![The round lake from above: beach on the far side, cherry blossoms ringing the water, the footbridge across it.](https://shade-verse-case-study.vercel.app/media/still-1440-laketop.jpg)
*The round lake from above: beach on the far side, cherry blossoms ringing the water, the footbridge across it.*

Before this pass the water was a flat disc that floated about half a metre above the grass at its rim. Now the lake is round, its shore shelves down into a bowl, and the bridge lands on the trail at both ends.

> **The mind:** Fresnel is one of those details people never name but always notice. Water without it looks like blue plastic, even if everything else is perfect.

> **Steal this:** Spend your most expensive effect on the one thing players look at most, and give it a cheap fallback that switches itself on when the frame budget runs out.

## Beach, trees and a bridge

A lake on its own is a puddle. What makes it a place is the ring around it, and I asked for three things: a beautiful lake, better trees (pine, oak, cherry blossom, palm) and a sand zone.

- The beach. A ring of sand all the way round, widening into a beach on the side away from the trail, with a darker wet band where the water meets it. It's drawn inside the ground shader, with no texture, and grass stays off it.
- Four tree species, four silhouettes. Pines and spruces in the forest, oaks with thicker trunks, 18 cherry blossoms ringing the lake with falling petals, and 9 palms on the sand. Each species is merged geometry drawn with instancing: 18 draw calls for all the trees plus 1 for the petals (from the code).
- The bridge. A Polyfork footbridge spans the round lake, and its ramps slope down to touch the trail at both ends, because I asked that its start and end must touch the path.

![Palms on the beach and the bridge over the water; the beach from the shore (debug build, software renderer).](https://shade-verse-case-study.vercel.app/media/still-1440-bridge.jpg)
![Palms on the beach and the bridge over the water; the beach from the shore (debug build, software renderer).](https://shade-verse-case-study.vercel.app/media/still-1440-beach.jpg)
*Palms on the beach and the bridge over the water; the beach from the shore (debug build, software renderer).*

![The before/after sheet from the environment pass, at phone landscape (915×412 at 1.75×) and laptop (1366×768) sizes.](https://shade-verse-case-study.vercel.app/media/sheet-env1.jpg)
*The before/after sheet from the environment pass, at phone landscape (915×412 at 1.75×) and laptop (1366×768) sizes.*

Every species started from real photos, cited in the repo: Lake Tahoe's Sand Harbor and Lake Wanaka for the shore, Yoshino cherry blossoms, coconut palms, a Jura oak. Palm fronds were flat blades up close at first; they were rebuilt as folded, leafleted fronds in env-iter3.

> **The mind:** We recognise trees by silhouette long before detail. Four clearly different outlines read as a real park even when every tree is low-poly.

> **Steal this:** Design vegetation by silhouette first, merge each species into one instanced draw, and place it where it would really grow: palms on the sand, blossoms by the water.

## Quality tiers: one game, three budgets

The same build has to run on my phone and look its best on a strong desktop, so there are three tiers. There's no settings menu: the game picks one, and a URL parameter overrides it.

- Auto is the default for touch screens and integrated or mobile GPUs. Both of my devices stay on auto.
- High is picked only for a clearly strong desktop GPU (discrete NVIDIA or AMD Radeon, Apple M-series), or with ?q=high. It raises the lake to half resolution with 16 steps, grass from 6,500 to 9,500 blades, the grass radius from 57 to 72 m, and anisotropic filtering from 4× to 8×.
- Low (?q=low) drops grass to 3,500 blades and, on a desktop, caps pixel density at 1×.

Anti-aliasing follows the same logic. MSAA only runs where it's cheap: not on touch screens, not on integrated or mobile GPUs. Everywhere else gets FXAA, one full-screen pass that can be switched on and off at runtime from measured frame time. MSAA can't, because it's fixed when the WebGL context is created. My Intel UHD 600 laptop flags MSAA as slow, so it gets FXAA.

![Auto vs ?q=high on a laptop-size frame (debug build, software renderer).](https://shade-verse-case-study.vercel.app/media/sheet-hq.jpg)
*Auto vs ?q=high on a laptop-size frame (debug build, software renderer).*

> **The mind:** The best setting is the one nobody has to choose. Most players never open a graphics menu, so the default is the experience.

> **Steal this:** Detect the GPU once, pick a sensible tier, keep every per-tier number in one small table, and leave a URL override for testing.

## Desktop controls, modelled on Spider-Man PC

The phone has touch buttons. The desktop had to feel like a real PC action game, so the model was Marvel's Spider-Man on PC: movement on the left hand, camera and web on the mouse. We went through several layouts in one evening. I picked the final one myself:

- **WASD:** Move
- **Mouse:** Camera (click to lock the pointer, Esc frees it)
- **Left click:** Tap: web shot. Hold: Web Shock
- **Right click:** Tap: web spring. Hold: swing
- **Space:** Jump, glide and fly, exactly like the phone
- **K, Ctrl, M or .:** Melee, so both hands always have one
- **Gamepad:** Left stick move, right stick camera, A jump, RB tap shot / hold Web Shock, LT tap spring / hold swing, X melee

Tap and hold share one button with a 220 ms threshold. The game detects what you're using and shows a small popup ("Keyboard & mouse detected" or "Gamepad connected") instead of on-screen icons, and the controls are listed on the title screen. All of it is routed onto the same input flags the phone uses, so there's only one game underneath.

> **Me:** My pick: / WASD = Move / Mouse move = camera move / mouse left tap = web shot, hold = shadow snare (rename it to web shock everywhere) / Mouse right tap = web spring, hold = web swing / Space = current mobile versions jump, glide, flight behavior exact 1:1 / K = Melee
> **Me:** Ctrl = melee too
> **Me:** M = melee too
> **Me:** . = melee too
> **Zero:** Locked, your pick is final … Shadow Snare renamed to Web Shock everywhere. Everything else from the earlier maps is dropped.

*Oct 28, 11:53–11:57 PM. After several proposals, my own map became the only map.*

What isn't verified yet: pointer lock, the gamepad and the hold ring can't be tested in a headless browser. The popup itself was seen working. They need a check on a real laptop with a real pad.

> **The mind:** Familiar controls are borrowed skill. A player who knows a famous layout starts your game already good at it.

> **Steal this:** Copy the control scheme your players already know, give every action a tap and a hold, and route keyboard, mouse and pad onto one set of inputs.

## Key moments

- **v0.1 · A first build with a score on it** The first build was graded 49/100. In a headless browser a test bot chain-swung to 61 m/s with no page errors, and every line about my real phone and laptop said UNTESTED. That word stayed in the scorecard until something was actually measured.
- **v0.6 · Free roam** The timer and the game over came out. Falls cost nothing, and the city became a place to explore instead of a race against the clock.
- **v0.9 – v0.10 · The street becomes a floor** Street level became walkable (it used to respawn you), the first robots arrived with punch and dodge, and hard landings started to cost something. A swing from street level now zips you up toward the anchor instead of leaving the rope slack.
- **5:31 AM · Walls, then water** I asked for wall running, wall jumps, vaults and a higher jump. They shipped as tested logic first (jump apex 2.4 m → 4.6 m), with the camera framing honestly marked as not yet checked by eye.
- **v0.76 – v0.77 · Combat with weight** Martial arts choreography studied frame by frame: the 4-hit chain, launcher, aerial spike, web pull-in and web yank, hit-stop and camera shake. Score: 85. Then melee was locked.
- **Ghost & the boss · New characters cost points** A companion, Ghost, and a giant boss built from three times Shadow's own body landed. The score dipped to 79, and the scorecard said so, until the boss got full armour and its own rooftop flight.
- **City rebuild · A real park** The city, park and lake were rebuilt with Polyfork models: buildings, trees and a footbridge. Then the original hand-authored park forest and its detailed foliage were restored on top.
- **env-iter1 · A round lake** The lake became a circle: a polar-grid water sheet, a round shoreline and a bowl under it.
- **env-iter1 · The bridge touches the path** "Bridge start end must touch path." Eight modules now span the round lake, and the ramps land on the trail at both ends.
- **29616c4 · Shade Verse** Hybrid water, the beach, four tree species, quality tiers, the desktop controls, Web Shock everywhere, and the title screen with its real name. The build these shipped on.
- **30a3b3a · Real palms** "Palm fronds look basic." Each frond became an arched, V-folded strip with about 60 leaflet pairs and its own sway. Every tree got a natural tapered trunk, the meadow grass got one outline instead of one per blade, and the underwater bubbles started following the real swell.
- **24b325f · The robots shoot back** Enemies raise a glowing palm for 0.4 s, then fire a repulsor bolt. The boss fires 3-shot volleys and charges a sweeping chest beam. Web Shock pops incoming bolts. A full sound pass landed with it: 35 procedural recipes, an original score, CC0 footsteps and birds, no sirens.
- **4b6a410 · The boss follows you** "Boss should follow heroes & keep attacking." The boss left its rooftop: it hover-dashes after you, lands on whatever roof, street or park you're on, walks you down up close and keeps firing. The leafy trees got about 65% more leaves, and the bubbles became a random emitter: seabed vents and bursts plus a stream off you, each bubble with its own size, speed, wobble and life.
- **666a030 · The city takes flight** "Flying cars must have collision & web must work on them." Cars got real collision (ride the roof, get shoved sideways, bonk the underside), and web and spring anchors now ride along with the car.
- **3ae41a1 – 4e1c60e · The South Sea** An open ocean out to 1.1 km south of the city, with a camera-following sea, a seabed that deepens offshore, screen-space reflections, boats you can web onto, gulls, fish schools and a whale. Underwater got sharp caustics and slanted god rays.
- **730e3a6 · Everyone talks** 49 family-friendly meme lines for Shadow, Ghost, the robots, the boss and the people on the street, all voiced, levelled and short enough not to get in the way.
- **46cabfb – f0ce5e6 · An island and a second city** Jungle Island rose out of the sea with a waterfall, a lighthouse with soft god rays and long grass, built from the same park assets. A long bridge with flying traffic runs east to Neon Harbor, a second city of canals and neon with its own robots and a mini-boss.
- **dba020b – 5f152c8 · Husband and wife** Ghost and Shadow are married, and now they sound like it: 55 exchanges with captions that duck the music. "Too romantic" sent it back once, and v2 made it caring instead: checking on each other, teamwork, pride after a win, one "Love you" kept on purpose. Then they got equal volume and started talking about three times as often.
- **Oct 29, 9:07 PM · One night of upgrades** "Keep iterating without waiting for my permission." Zero shot every area day and night, wrote a plan with targets and shipped a before/after for each fix: a see-through boss zone, soft round sparkles for Ghost, ~1,750 rooftop props dropped onto real roof surfaces, wet sand and ripples on the beach, and robots that dissolve when they block the camera.
- **bb2ff9e · 0bf1d6c · A river you can swim under** "Make water fall to sea a direct curved river… make them deep." The waterfall now feeds one curved river straight to the sea. The channel is 4.2 m deep, the island lake 7.5 m, and at the mouth the foam dies down and the colour turns to the sea's, so river and ocean read as one surface.
- **9f9e471 · They tell each other stories** "Funny catchy stories." 12 short stories they tell and react to (a pigeon that stole Shadow's lunch, Ghost catching a wedding bouquet, pirate treasure that turned out to be an expired taco coupon) and 10 more teases: 83 new lines in the same voices. The same pass found 14 Ghost lines about 14 dB too quiet and fixed them.
- **049bf38 · 27b863c · One button, five moves** Space now does it all: tap to jump, tap again for a double jump, hold to glide, hold while gliding to fly, tap while gliding to drop out with a jump. Glide went 22 → 32 m/s, flight 44. Then "jump faster, fall faster", twice: the whole jump now takes 0.74 s instead of 1.19 s for about the same height. This is the build that's live now.

> **The mind:** We judge an experience by its peaks and its end (the peak-end rule). The moments above are the ones that changed how the game feels, not the ones that took longest.

> **Steal this:** Keep a dated log of turning points while you work. Six weeks later it's the only honest account of how the thing got good.

## UI design: the title screen says the name

The HUD is locked and stays minimal: small custom icons, no gameplay text. So the one place the game can introduce itself is the title screen, and until this pass it carried an old working title. Now it says Shade Verse.

It uses my own mark, the same two-shape logo as my portfolio and the Surface Tension case study, taken unchanged. The mark springs in, the name settles from wide letter spacing to tight, then a play button and "by Shifat Masud". On desktop it also lists both control maps, mouse + keyboard and gamepad, and any key starts. On a phone it's simply "Tap to start".

![The title screen on a laptop-size frame (1440 px): mark, name, play, and both control maps.](https://shade-verse-case-study.vercel.app/media/still-1440-title.jpg)
*The title screen on a laptop-size frame (1440 px): mark, name, play, and both control maps.*

![The phone title in landscape (915×412 at 1.75×), and the laptop/phone pair from the release sheet.](https://shade-verse-case-study.vercel.app/media/still-915-title.jpg)
![The phone title in landscape (915×412 at 1.75×), and the laptop/phone pair from the release sheet.](https://shade-verse-case-study.vercel.app/media/sheet-title.jpg)
*The phone title in landscape (915×412 at 1.75×), and the laptop/phone pair from the release sheet.*

One rule I keep: the game's name is always written the same way, two words, Shade Verse. On the title, in the page title, in this case study.

> **The mind:** A name is the first promise a game makes. Seeing the same mark and the same words everywhere builds trust before anyone presses play.

> **Steal this:** Keep your in-game UI quiet, and give your title screen one job: say the name, show the mark, and get out of the way.

## Reflections: maths instead of a mirror

![Before and after, same camera. Before: a cheap skyline strip that didn’t sit on the world. Now: the city traced into the sea as soft blocks, stretched toward you like reflections on rippled water.](https://shade-verse-case-study.vercel.app/media/refl-before-after.jpg)

The textbook way to reflect a city in water is to draw the city twice: once for you, and once upside down for the water. That second picture is exactly what a budget phone can’t pay for, so on Oct 31 I locked it out. **No reflection probe, no second renders.** The sea still had to reflect the city.

What followed was the longest search in the project. Zero built a reflection, I looked at it, and most of them died:

- **A probe, screen-space reflections, a mirror pass** (Oct 30). They looked right, and every one of them drew the world a second time. The lock removed them.
- **A skyline strip** (Oct 31). The towers were projected once on the CPU into a strip the sea reads with one texture lookup. Zero renders, but the shapes floated instead of sitting on the world.
- **Four more tries** (Nov 1), each behind its own test switch: a baked top-down height map, flat picture cards of the skyline, real screen-space as a test only, and a full mirrored scene.

> **Me:** none of 4 ok
>
> **Me:** Analytic raytrace reflection has more potential... trace every building, bridge, islands. Lets go with this if performance good
>
> **Me:** heavy blurry low detail cheap
>

*My messages on Nov 1, as written into the build log. The last one decided the look.*

### The trick: maths instead of a mirror

Every landmark goes into a small data texture once, as a box with a colour. A coarse grid over the map, 40 m per cell, lists which boxes touch each cell. For every sea pixel, the shader bounces the view ray off the rippled surface and walks it across that grid cell by cell, the same walk the old raycasting games used, and tests only the boxes in the cells it crosses. Open sea is skipped in jumps: each cell knows how far away the nearest building is, so a ray over empty water leaps up to 7 cells at once.

Then I asked for *less* detail. Each cell became one soft block: all its buildings merged into one footprint, the tallest top, the average colour, and a blur that grows with distance. The ray climbs at half speed, so every mirrored shape stretches about twice as long toward you, the way reflections smear on real rippled water. At night each block carries its own light: warm windows in the city, magenta and cyan neon in Neon Harbor. The same trace is reused from below the surface, which is the next chapter.

How much of it you see is decided by Fresnel, using the exact formula for light going from air (1.0) into water (1.333) rather than the usual shortcut. Clear at your feet, a mirror toward the horizon.

**The mind.** We judge a reflection by feel, not detail. The eye checks that the right shapes are in the right place with the right colour, and then it stops looking. It never counts windows. Blur reads as water; sharpness reads as glass.

**Steal this.** When the textbook answer costs a second render, ask what the answer has to *look* like and compute only that. Forty-metre blocks traced with plain maths were enough to fool my eye, and they cost no second picture of the world.

## Refraction: one line between two worlds

![The half-under camera, before (left of each row) and after. Top: in a wave trough. Bottom: half a metre over. Before, waves further out stood in the air and underwater tint leaked above the line.](https://shade-verse-case-study.vercel.app/media/water-line.jpg)

Water isn’t a surface, it’s a border between two worlds. From above you look through it into the sand. From below you look up through it at the sky. And when the camera sits half in, you see both at once, cut by one wavy line. Each of those views had to agree with the others.

### Looking down

Each sea pixel bends the view ray with Snell’s law (air 1.0 into water 1.333) and follows the bent ray down to the seabed, which is a baked height map, in a short two-step march. Light dies along the way the way it does in real water: red first, then green. The bed only shows through where it’s less than about 9 m down; deeper, it’s just water colour. The bright webs on the sand come from a caustics tile simulated once by refracting a million rays through a rippled surface. It’s the same water path on the phone and on the laptop.

### Looking up

![Left: a real photo taken in a pool, used as the reference. Right: ours, before (top) and after (bottom). Outside the bright window to the sky, the surface now mirrors the seabed, like real water does.](https://shade-verse-case-study.vercel.app/media/water-snell.jpg)

From below, the surface is a window to the air. Inside Snell’s window, the cone of sky you can see from underwater, the same maths that draws the reflections runs along the refracted ray, so the skyline and the sun show through the waves, with a slightly different bend per colour for a hint of rainbow at the edge. Past the critical angle of 48.6°, total internal reflection takes over and the surface mirrors the seabed. I wanted it soft, so it was rebuilt after studying photos of real Snell’s windows: blurred, semi-transparent, no hard rim.

### The line

The hardest pixels in the game sit on the waterline when the camera is half under. The first version solved that line just 1.2 m out, across 9 screen columns, on the swim physics’ swell, which had no chop and no sideways push. It could sit up to 0.4 m off the waves actually drawn. My note was short:

> “Water line must cover more distance & must not bleed underwater or wave to air.”
> — Shifat Masud

Now the line is solved for 25 screen columns, smoothed with a spline, on the exact waves the graphics card draws, out to 250 m. One shared function cuts the sea, tints the underwater half, draws the soft white meniscus and stops the god rays, so they can never disagree again. It only runs while the lens straddles the surface: about 500 wave evaluations a frame. During the speed pass it got 33% cheaper (0.41 → 0.28 ms a frame) and was checked bit-identical over 300 random camera poses.

Diving is one world too. Haze, seabed, kelp and terrain blend over the first metres of a dive instead of switching at the surface, and the half-under view uses the same fog as the dive itself.

**The mind.** People look at edges. Where two things meet is where the brain checks whether a scene is real, and one disagreement there undoes a hundred good pixels everywhere else.

**Steal this.** When several effects meet at a line, compute the line once and make every effect read it. Agreement at the border matters more than detail on either side.

## The post-process stack: five passes, in order

*Diagram: One frame, top to bottom. Every pass after the first works on a finished picture, so the order decides what each one can see.*

A frame of Shade Verse isn’t drawn once. It’s drawn, then handed down a short line of passes, and each one works on the finished picture the last one left. The order isn’t a detail; it decides what each pass can see.

- **The world, at 0.8 resolution.** Every device draws the world at a fixed 0.8 pixel density. Inside that, the sea, the heaviest shader in the game, gets its own path: the world draws first without it, the sea draws alone at half pixel density with the world’s depth already filled in so it tucks under every edge, and then it’s laid back in at full size with a per-pixel depth test. See-through things (particles, glass, rays) go on top.
- **Ink outline.** One pass reads the depth of the frame and inks an edge wherever depth jumps, but only on the nearer side, so the line stays 1 px and sits inside the silhouette. It fades out between 22 and 55 m. Surfaces carry a quiet tag in the alpha channel: lights are never inked, water is never inked, and grass inks only the outline of the whole meadow, not every blade. The same pass paints the underwater half and the meniscus when the camera is half under.
- **Smoothing.** Edge smoothing (FXAA), plus a gentle sharpen close to the camera: full within about 6 m, gone by 28 m, never on the sky, clamped so it can’t halo.
- **Glow.** Only things tagged as lights are drawn again, into a target a quarter of the size, blurred there, and added onto the frame with a single lookup. Always on, day and night.
- **Heroes in HD.** The world is scaled up to the screen, and then Shadow and Ghost are drawn again at the screen’s full resolution (up to 2×), depth-tested so trees and buildings still hide them.

![Same frozen frame, zoomed 2×, with passes switched off in the debug build. Without ink, the rooftops melt together. Without glow, the lamps are just dots.](https://shade-verse-case-study.vercel.app/media/post-passes.jpg)

### Why this order

Ink comes before smoothing, so the smoothing softens the ink lines too. Glow comes after ink, so lights spill over the outlines and never get inked themselves. Heroes come last, so they stay crisp over everything, including the glow.

During the speed pass we tried to merge these passes, and the numbers said no. Smoothing reads 9 neighbouring pixels of the outlined frame, so a merged pass would have to run the outline 9 times per pixel. Folding the glow into the smoothing would save one cheap pass, under 1%, and round the colours slightly differently. And the last pass is a lock. Five passes it stays.

**The mind.** Order is meaning. The same five steps in a different order make a different picture, the way the same words in a different order make a different sentence.

**Steal this.** Write your post-process passes down in order, with one sentence each on why it sits in that slot. If you can’t say why, it’s probably in the wrong one.

## Speed is mostly what you don’t draw

![The regression sheet. Columns: before the speed pass (phone), after it (phone), after it (laptop). Rows: title, street, harbor, island, ocean, swim, underwater. The look didn’t change. (In the harbor row the hero had already dropped into the water: timing, not a look change.)](https://shade-verse-case-study.vercel.app/media/perf-regression.jpg)

On Nov 2 I asked Zero for a long list of everything that could make the game faster, and then to work through all of it. One rule: **measure first, and cut only if you can’t see the cut.** Every idea was timed on a pinned phone-sized test with identical before and after shots, and nothing shipped if the shots differed.

Thirteen changes shipped. Thirteen ideas died on the numbers. Almost everything that shipped is the same idea in different clothes: **the fastest thing to draw is the thing you don’t draw.**

### What shipped

- **Don’t draw what’s far away.** Lilies past 420 m: −145k triangles, everywhere. Harbor rooftop props only near the harbor: −30k. Far lily patches as simple pads: island 93k → 57k. The park ground grid: 41k → 18k, same look.
- **Don’t draw what’s behind you.** Culling on the static island and harbor meshes. The crowd, drones and robots outside the camera view are packed out of the draw: street −14% triangles, harbor −19% and 5 fewer draw calls.
- **Don’t do the same work twice.** Every sea vertex was computing the full wave maths twice at the same point, once for shape and once for lighting. One pass now, same values. The waterline solve: 0.41 → 0.28 ms a frame, bit-identical. The glow blur runs once at quarter size and is added with one lookup instead of 13. No new objects created every frame, so no garbage-collection stutter.
- **Draw fewer pixels.** The world renders at a fixed 0.8 pixel density on every device while the heroes stay sharp. The biggest single cut.
- **Carry less.** Models 2.8 → 0.82 MB, losslessly compressed. Voice lines are decoded when first heard instead of all at once: about 93 → 5 MB of memory.

![The crowd cull, checked on the same frozen frame with the change switched off and on. Nothing on screen moves.](https://shade-verse-case-study.vercel.app/media/perf-crowd.jpg)

How the timings were taken: in a headless browser with a software renderer, on a shared machine, which is far slower than a real phone. They are good for before/after on the same scene, not as frame rates. The glow change: phone harbor 348 → 320 ms per frame, island 381 → 364, ocean 336 → 315. The sea change: high sea views about 360–420 → 230 ms, and because the machine was busy with other work at the time, treat that one as indicative.

### What we threw away, and why

This list taught me more than the first one.

- **Merging the screen passes.** The outline would have to run 9 times per pixel; the only safe merge saved under 1%.
- **Smaller textures.** There are only 37, all preloaded on Play. Going lower would blur the ground at grazing angles.
- **Splitting big meshes** so their off-screen parts skip drawing. Those parts are plain static shapes and cheap to throw away; splitting would add 5–15 draw calls that cost a phone more than they save.
- **Merging draw calls.** Almost every draw has its own material, so nothing merges without changing the look. Skipping empty draws was exact, but saved 0.05 ms, so it was reverted.
- **Thinning the see-through layers.** Even removing all of them would save 10–24%, spread over 24–43 small glows and halos. Nothing could go without being missed.
- **Re-encoding the audio.** There are no lossless masters, so it would be compressing already-compressed sound. The best setting cut only 28% and audibly changed the clips.
- And a few that were already done or not worth it: there are no shadow maps to optimise, shaders already compile up front, idle effects already hide themselves, and the matrix updates cost 0.06 ms.

**The mind.** Deleting an idea feels like losing something, so we tend to ship it anyway. Here every dropped idea was a win: it was a visible change or a wasted hour that never reached the game.

**Steal this.** Make the long list, then let the numbers kill most of it. Ship only what you can measure and can’t see.

## Copy the real world, not other games

![Real photo on the left of each pair, ours on the right: the aurora (seventh version), the moon, the rainbow.](https://shade-verse-case-study.vercel.app/media/sky-refs.jpg)

The night of Nov 1 was the sky. Every element was rebuilt by putting a real photograph next to the game and changing the game until the two felt the same:

- **The moon** started from a real photo of the full moon, then became what a camera actually sees on a fjord at night: a blown-out glowing disc, a bright corona and a big milky halo.
- **The sun** is a blown-out white-hot disc, golden when low, with a wide glow and no ring.
- **The rainbow** has bright saturated feet fading toward the top, a brighter sky inside the bow and the dark band between the two bows, like the photo.
- **The stars** were blocky square dots. Now they are round points with a long tail of sizes and brightness, and a gentle twinkle.
- **The aurora** took seven versions, each checked against a real photo: from faint curtains, to a true 3D curtain sampled at 7 heights, to purplish light on the tops.

Clouds, moon, stars, aurora and rainbow are all mirrored in the sea through the same shared functions, so the sky and its reflection run on one clock. On Nov 2 I locked the whole sky as a restore point.

### The fire that looked fake

![The robot KO burst at six moments, before (top) and after (bottom).](https://shade-verse-case-study.vercel.app/media/ko-before-after.jpg)

When a robot went down it burst into solid orange shapes, a spray of cones, a ring on the ground and a pale cyan disc. It read as a cartoon. I asked for “softer, realistic particles glow based burst”, then “Study real first burst explosion images”, then one word: “Fire”.

![The reference sheet: real explosion and fireball photographs, studied before a single particle changed.](https://shade-verse-case-study.vercel.app/media/ko-refs.jpg)

Zero studied 12 real photos of explosions and wrote down what they show. A white-yellow flash for a few frames. A lumpy, cauliflower-shaped fireball that grows fast, then slows, cooling from white to yellow to orange to deep red. Dark smoke rolling up as it cools. Sparks that streak, slow down in the air, then fall.

The burst was rebuilt from that list: a 0.1 s flash, 14 lumpy fireball puffs on that cooling ramp, 26 sparks with glowing streaks, and 10 dark smoke puffs lit warm from below while they’re young. A few sparks carry a faint tint of the hero who landed the KO. It went from 5 draw calls to 2, with no measurable frame cost. The first try got one thing wrong: the particles were about 2.6× too big, and it looked like a flat disc. Fixed before it shipped.

![The new burst from 0.03 to 1.2 seconds: flash, fireball, sparks, smoke.](https://shade-verse-case-study.vercel.app/media/ko-strip.jpg)

The same rule spread to every effect on Nov 2: **soft, glowing, cinematic, no hard edges.** The comic hit-star became a white-hot core with sparks and a soft bloom. Every solid ring was removed, from punches to the Slam shockwave. The aim-lock went from a sharp cyan square to soft glints in the hero’s colour, and the Web Shock and web shot followed: purple for Shadow, pink for Ghost.

![The aim-lock marker, before and after: a sharp cyan square became soft glints in the hero’s own colour.](https://shade-verse-case-study.vercel.app/media/aimlock.jpg)

**The mind.** What we “know” about fire, moonlight or a rainbow is a cartoon our memory keeps. A photo corrects it in seconds, because it shows the things memory throws away: the blown-out centre, the smoke, the dark band.

**Steal this.** Before you design an effect, collect ten photos of the real thing and write down what you actually see. Then build that list, not your memory.

## A hold is a duration, not a frame count

*Diagram: Black ticks are frames. When one frame takes too long, a frame-counted hold never gets checked in time. A timed hold always does.*

On Nov 2 the phone buttons were merged the way the desktop works: **tap** the web button to spring, **hold** it to swing; tap to fire a web shot, hold for a Web Shock. A hold is anything longer than 220 ms. No cooldowns anywhere.

Then a real bug turned up on desktop. A press only became a hold if a frame happened to run after the 220 ms mark while the button was still down. On a slow frame, a hitch or a weak laptop, that frame never came in time, and a 300–450 ms hold was read as a tap: you meant to swing and you sprang instead. Measured with a scripted test: **8 of 24 desktop holds misread before, 0 of 24 after.** The fix is one idea: decide hold or tap from the actual press time at release, not from whether a frame noticed. A swing caught late is held for 2 frames so the game always sees it. The phone buttons already used a timer and read 0 of 24 wrong both times; they now also check the press time at release, in case the timer runs late.

### The other small things that make it feel solid

- **Swing, spring and flight work from anywhere**: from a wall crawl and from a rooftop, because I said they must.
- **The title screen sizes itself from its own box**, not from the window’s height, so a stale browser viewport can’t push the logo or the Play button off a phone screen.
- **A guard on the jump button.** A stale or duplicate touch could throw an error on the jump button, the move pad and the camera drag; they now guard it the way the other buttons already did.
- **Dead code out.** A tree kit that was never placed in the world was still loading 10 models (252 KB) every time you pressed Play. Removing the unused code removed that wait too.

**The mind.** Players feel input in time, not frames. A swing that sometimes turns into a spring doesn’t feel like a bug to them; it feels like the game doesn’t listen. Trust in the controls is lost in exactly those moments.

**Steal this.** Measure every press in milliseconds from the press itself, never by counting frames. Then test it on a deliberately slow machine.

## Restore points let you be brave

*Diagram: Every restore point is a named tag on GitHub. Going back is one word.*

Most of the best things in this game started as “lets try”. That only works if going back is free. So whenever something felt right, it became a named restore point: a tag on GitHub I can return to with one word, and a line in the lock file so nobody changes it by accident.

- **water** (Oct 31). The water looks I locked that afternoon.
- **boss** (Oct 31). Taken right after the boss got its new face, before the islands and the weather went in.
- **sky** (Nov 2). Sun, moon, aurora, clouds and the underwater look.
- **fire-ko** (Nov 2). The fire KO burst, the soft aim-lock, the sea speedup, the crowd cull and the new water line.

The undo button got used, and that’s the point. City reflections streaking down the wet streets: I said “looks bad”, and they were gone in five minutes. Storm spray across the sea: tried, reverted. Drops on the lens after a dive: tried, reverted. When my phone stopped drawing the sea one night, two sea shader rewrites came out at once, and went back in a minute later. None of it was scary, because nothing could be lost.

**The mind.** People take bigger creative risks when failure is cheap and recoverable. A restore point is psychological safety for a project: it turns “what if this breaks it” into “let’s see”.

**Steal this.** Name a restore point every time something feels right, and lock what’s in it. You’ll try bolder things when going back costs one word.

## Learning to move from a 30-second clip

On Nov 2 I sent Zero a 30-second clip of *Ultimate Spider-Man* swinging through the city at night, with one line: “Learn animations from this.”

Our heroes already went where the physics sent them. Their bodies just didn’t feel any of it. The whole swing was one fixed pose: a lean and one arm up. Every fall and every web spring froze the jump halfway. Landings were straight legs tipping forward, which read like a stumble. And the run leaned about 2° whether you jogged or sprinted.

So the clip was studied the way an animator would study it: at 10 frames a second, one move at a time, writing down poses and how many frames each phase lasts. The notes read like a choreographer’s. After the web hits, the body stays laid out along its path for 4–5 frames before the line pulls it round. After a release, it’s upside down 0.2–0.3 s later and upright again by about 0.6 s. Those numbers became the targets.

### Swing: hang, lag, whip

The body now hangs from the line hand and lags the rope like a pendulum on a spring. Right after the web hits it’s still laid out along the direction of travel. At the bottom it hangs straight under the line. On the way up the legs, which trailed behind on the way down, whip forward with the knees up, and the free hand comes up to join the line.

![The swing, before (top) and after (bottom): same side camera, 8 frames over 1.5 s. Before, one fixed pose. After, the body lags the rope, hangs under the line, then whips its legs forward.](https://shade-verse-case-study.vercel.app/media/move-swing.jpg)

### Release: keep the spin

Letting go on the way up carries the swing’s spin into a tucked backflip: knees to the chest, upside down about 0.25 s after the release, upright again at 0.62 s. The flip is one smooth curve from the release angle to a full turn, so it never pops at either end. A low release skips it, and a new web, a landing or an attack takes over from wherever the body is.

![Letting go on the way up, before and after: 8 frames from just before the release to 0.8 s after. After, the swing’s spin carries on into a tucked backflip.](https://shade-verse-case-study.vercel.app/media/move-release-flip.jpg)

### Freefall: a skydiver who looks down

A fall turns the body belly-down into a skydiver’s frog: arms wide, knees apart, back arched, head up. It banks into turns, and it grows stronger the faster you fall. The part I like most: it checks how far the roof or street below is, and turns back to feet-first in the last ~0.35 s. Nobody lands on their belly, and short hops stay upright.

![A fall from the top of a jump to a roof, before and after. After, a skydiver frog that turns back feet-first just before touchdown. (The glowing orb in some frames is the world, not the hero.)](https://shade-verse-case-study.vercel.app/media/move-freefall.jpg)

### Landing: the drop decides the crouch

Touchdown is a crouch now, deeper for a bigger drop. A hard landing is the superhero landing: one knee down, one hand planted, the other arm out behind, held about 0.2 s and pushed out of in 0.55 s total.

![Hard and soft landings, before and after. Before, straight legs tipping forward. After, a crouch, and on hard drops the superhero landing.](https://shade-verse-case-study.vercel.app/media/move-landing.jpg)

### Web spring: my own catch

Halfway through, I watched the clip again and saw something nobody had listed: “It has reference to improve our web spring too.” The zip moments. Now the body coils for a few frames first, knees in, chest curled. Then the yank snaps it in line with the pull, head first, legs trailing, with a stretch of about 9% along the body right as the line goes taut. Letting go while still rising rolls the pull into a front tuck.

![The web spring, before and after: coil, yank, release, flip. After, the body snaps in line with the pull, head first, and stretches a little as the line goes taut.](https://shade-verse-case-study.vercel.app/media/move-spring.jpg)

### Run: lean into the speed

The run leans with speed: nothing at a jog, about 17° at a full sprint, a bit more while you speed up and back when you brake. The head stays level the whole time.

![Running from a jog to a sprint, before and after. Before, about 2° of lean at any speed. After, up to about 17° at a full sprint, head level.](https://shade-verse-case-study.vercel.app/media/move-run-lean.jpg)

### What stayed out

A wall run was on the list. The clip has a quick hug of a wall and a vault over a ledge, but no long run up a building to copy. So we didn’t make one up. A move you can’t see in your reference is a move you’d be guessing at, and guessed motion is the stiff kind.

One rule held across all six: only the body changes. Input, timing, physics and hitboxes are exactly what they were, so the game plays the same and simply reads better. Everything is procedural, in one file of about 230 lines, with no animation files to download. It works on both Shadow and Ghost, the ink outlines follow every pose, and each move shipped as its own commit. The six landed within 27 minutes of each other.

**The mind.** We read weight from delay. A body that turns the instant a force turns looks like it weighs nothing. One that coils before it moves (anticipation), lags behind the pull, and keeps going after the force stops (follow-through) looks heavy and alive. Those are two of the oldest rules in animation, and they’re the whole trick here: almost every move above is a body arriving a little late.

**Steal this.** Study your reference in frames, not in feelings. Count how long each phase lasts, make those counts your targets, and change only the body, never the controls. The game gets better without anyone having to learn it again.

## The trailer is code

Shade Verse has two trailers, and neither was cut in a video editor. Both are programs. A director script pauses the game as a game (no player input, no AI choices) and stages the real engine shot by shot: where Shadow, Ghost and the Captain stand, the robots, the time of day, rain, lightning, the aurora, slow motion and a programmed camera. Then it steps the engine frame by frame, timed to the score and the voices.

The same code runs two ways. Open the page and press Play, and your browser renders every frame live from the game. Or a script renders it frame-exact at 24 fps into an MP4, with the audio mixed from the same timeline. Press **C** while it plays to read the code of the shot on screen.

### v1 · The Iron Tide

59 seconds, 24 cuts from 15 coded shots. "Every city has a shadow." Live: https://shade-verse-trailer-v1.pages.dev/ · GitHub repo: https://github.com/shifatmasud/shade-verse-trailer-v1

### v3 · The trailer is code

2 minutes 20, 38 shots, built like the *Spider-Man 2* reveal: a villain's monologue over calm shots of ordinary life, then silence, "Oh, we will." / "Together.", then heavy combat. Live: https://shade-verse-trailer.pages.dev/ · GitHub repo: https://github.com/shifatmasud/shade-verse-trailer

**Steal this.** If your game can be paused and posed from code, your trailer can be a program. Every shot is then a function you can fix and re-run, and the same timeline gives you a live version and a video file.

## Technologies & tools

- **3D and rendering:** three 0.187, React Three Fiber 8.17, custom GLSL shaders (water, ground and sand, grass, cel outline), a selective bloom pass, FXAA.
- **App:** React 18.3, TypeScript 5.6, Vite 5.4, Framer Motion 11 for the title screen motion, GSAP 3.12.
- **World:** Polyfork low-poly models (buildings, trees, footbridge, robots), modified in code. Poly Haven CC0 textures for bark, leaves and shrubs.
- **Testing:** TypeScript checks, Vite builds, and puppeteer scripts in headless Chrome with a software renderer: motion, combat, walls, audio, environment, a 5.5-minute soak. A debug build exposes test hooks that the release build never ships.
- **Shipping:** GitHub, with each pass on its own branch and never straight to main, and a Vercel preview to play it.
- **Build partner:** Zero, who wrote, tested and shipped the builds with me.

One note on those tests: a software renderer in a headless browser says the code runs and the picture is right. It says nothing about frame rate on my phone. An early 5.5-minute soak there held 45–53 fps with a flat heap, and that proves stability, not speed. Know what your tools are actually measuring.

> **The mind:** When a measure becomes the target, it stops measuring what you care about (Goodhart's law). A green number from the wrong test feels like proof.

## How we work together

I direct, Zero builds. Most of this game was made in short messages on my phone, often while I was doing something else, and sometimes while I was asleep. That only works with a few hard rules:

- The lock file comes first. Every builder reads it before touching code: melee, the hero, the HUD and the controls are locked, landscape only.
- Real references, cited. Lakes, beaches and each tree species from real photos; fights from Muybridge plates and martial arts frame sequences. The sources are in the repo.
- Screenshots, always. Every update comes with a labelled before/after sheet at phone and laptop sizes, so I can judge it in five seconds.
- Light checks, not heavy ones. Type check, build, a few focused tests. I care more about the next iteration than a long report.
- Branch, preview, then main. Each pass lives on its own branch with a preview link I can play. Main only moves when I say so.
- Truth rules. Observed and estimated are always written apart. No speed claim until it's measured on my two devices.
- Parallel hands. Separate builders take separate jobs at the same time (the game build, the trailer, this case study), each on its own copy, and one place merges.

*The loop: lock file, one pass, light checks, a before/after sheet, a preview I play. What I don't like goes back into the next pass.*

### Updates while I sleep

On the night of the environment pass I gave one instruction, "Now I give you full power. Keep working", and went to sleep. The work kept going in passes, each one landing as a short update with a preview link, a branch name and a sheet, and each one saying plainly what was tested and what wasn't.

> **The mind:** Trust grows from small promises kept. Rules that say what will never change make it safe to hand over everything else.

> **Steal this:** Write the locks, demand a picture with every update, and keep observed and estimated in separate sentences. Then you can let the work run without watching it.

## What I'd tell you to steal

- Budget for the weakest device you care about. Write its numbers down first, and measure there before you call anything fast.
- Spend on what the eye looks at. One great lake with a cheap fallback beats ten good effects.
- Lock what you love. Then you can say "keep going" and mean it.

## Credits

- **Game design, direction & development:** Shifat Masud, built with Zero.
- **3D models:** Polyfork low-poly models, used and modified inside Shade Verse.
- **Textures:** Poly Haven CC0 bark, leaf and shrub textures.
- **Inspiration:** Marvel's Spider-Man on PC, for the control scheme and the feel of the swing. Ultimate Spider-Man, for the traversal animation study.
- **Reference photos:** Real photographs, many from Wikimedia Commons (explosions, the moon, rainbows, aurora, Snell’s window), studied as references and shown small beside our frames.

To everyone in my life: you inspired this.
