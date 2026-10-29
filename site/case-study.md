# Shade Verse

## A shadow that swings through a city park, in a browser tab, on a budget phone

![The lake at ground level: the footbridge, cherry blossoms and the city behind the trees.](https://shade-verse-case-study.vercel.app/media/still-1440-hero.jpg)

I'm Shifat Masud, a design engineer and student game dev. Shade Verse is my 3D web-swinging game, and it runs in a browser tab.

> “Our game name must always be "Shade Verse".”
> — Shifat Masud

You play Shadow, a dark hero who swings, springs, glides and flies through an open city with a park at its heart: a forest, a round lake, a sandy beach and a footbridge. Robots fill the streets, and you fight them with melee combos, web shots and a Web Shock. It plays on a phone with touch buttons and on a laptop with mouse, keyboard or a gamepad. No install, no store, just a link.

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
- Jump, glide, fly. Jump leaves the ground at 16 m/s. After 0.35 s in the air you glide on your own, sinking at about 4 m/s and speeding up to 22 m/s forward. Hold jump past 0.18 s and the glide turns into flight, pushing you up instead of down. A quick tap in the air cancels the glide until you land.
- Walls and water. Run up walls, jump off them, vault over edges, and swim when you fall in the lake.

Those numbers aren't from feel alone. They're constants in src/sim.ts, and the flight caps were raised once when I asked for faster flight (swing cap 34 → 46, glide cap 14 → 22). On the desktop, Space does exactly what the phone's jump button does, 1:1, so both feel like the same game.

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
- **4b6a410 · The boss follows you** "Boss should follow heroes & keep attacking." The boss left its rooftop: it hover-dashes after you, lands on whatever roof, street or park you're on, walks you down up close and keeps firing. The leafy trees got about 65% more leaves, and the bubbles became a random emitter: seabed vents and bursts plus a stream off you, each bubble with its own size, speed, wobble and life. This is the build that's live now.

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

## Technologies & tools

- **3D and rendering:** three 0.169, React Three Fiber 8.17, custom GLSL shaders (water, ground and sand, grass, cel outline), a selective bloom pass, FXAA.
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
- **Inspiration:** Marvel's Spider-Man on PC, for the control scheme and the feel of the swing.

To everyone in my life: you inspired this.
