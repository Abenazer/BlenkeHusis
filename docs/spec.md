# Game specification

The brief the game is built from, as given on 2026-11-07. It is a target,
built in portions (`TODO.md`), not a checklist to finish in one go.

Agreed departures from the text below:

- **Layout:** the repo's own (`src/`, `css/`, `tests/`), not the suggested
  `/js` folder, with the simulation kept free of the DOM (see `AGENTS.md`).
- **Language:** player-facing text is Swedish. The example messages are
  translated.
- **Names:** the game is called "Blenke Husis & Urinjakten" and its hero
  Blenke Husis, Blenke for short (the brief called them "Super Blenke: Urine
  Hunt" and Blenke); the text below uses the new names.
- **Running:** ES modules don't load from `file://`, so the game runs from a
  local HTTP server, which the brief allows.
- **World 1:** after its first level, the suburbs, world 1 goes to real
  places south of Stockholm in the 1970s and 80s: Södertörns villastad,
  Västerhaninge and Krigslida in 1980, each ending at its own station.

---

# BLENKE HUSIS & URINJAKTEN
## Game Development Specification

You are a senior HTML5 game developer, gameplay designer, pixel artist, and game architect.

Your task is to design and build a complete, playable 2D side-scrolling platform game called:

# BLENKE HUSIS & URINJAKTEN

**Tagline:** Run. Jump. Collect. Suspect.

A satirical platform game inspired by:
- The Great Giana Sisters
- Super Mario Bros
- Trolls
- Flood
- Classic 16-bit platform games from the late 1980s and early 1990s.

The game should combine nostalgic platform gameplay with absurd Swedish political satire, particularly criticizing Sweden's drug policy, law enforcement priorities, and the absurdity of treating drug consumption as a criminal matter.

The game should be funny, entertaining, exaggerated, and occasionally dark.

---

# 1. TECHNICAL REQUIREMENTS

Build the game using:

- HTML5
- JavaScript (ES6+)
- CSS3
- HTML5 Canvas for rendering.
- No game engine.
- No external game frameworks.
- No server-side components.
- Must run locally by opening index.html or through a simple local HTTP server.

Target desktop browsers first. Phones and tablets play by touch: a pad
and buttons drawn over the game, tappable menus, and the 16:9 view held
sideways (fullscreen and locked where the browser allows it, otherwise
the player is asked to turn the phone).

Architecture must be modular and maintainable.

Suggested structure:

```
/blenke-husis
  index.html
  style.css
  README.md
  /js
    main.js
    game.js
    input.js
    physics.js
    player.js
    enemies.js
    collectibles.js
    level.js
    camera.js
    collision.js
    audio.js
    particles.js
    ui.js
  /assets
    /sprites
    /backgrounds
    /audio
    /tiles
```

Avoid putting the entire game into one JavaScript file.

Use procedural graphics or generated placeholder sprites initially. Do not let missing external assets prevent the game from being playable.

---

# 2. VISUAL STYLE

Create a colorful, detailed, nostalgic 16-bit pixel-art aesthetic.

Visual references:
- The Great Giana Sisters: colorful environments and detailed pixel art.
- Super Mario Bros: immediately understandable platform mechanics.
- Trolls: bizarre characters and playful visual design.
- Flood: environmental hazards, water physics, and level design.

The visual style should have:
- Strong silhouettes.
- Colorful backgrounds with multiple parallax layers.
- Detailed platforms and environments.
- Animated characters.
- Smooth scrolling.
- Particle effects.
- Animated water, slime, smoke, and explosions.
- A consistent pixel-art aesthetic.

Use a fixed internal resolution and scale it to the browser window without distorting the aspect ratio.

The game should feel like a professionally designed retro platformer, not a basic programming demo.

---

# 3. THE PLAYER: BLENKE HUSIS

The player is a Swedish police officer.

Character design:
- Slightly overweight, middle-aged Swedish police officer.
- Blue police uniform.
- Police cap.
- Reflective vest.
- Serious facial expression.
- A large urine sample collection bag attached to his belt.
- Carries a clipboard and a collection container.

His name is Blenke Husis.

Blenke believes he is doing extremely important work.

His mission: Collect as many urine samples as possible.

Movement:
- Walk left and right.
- Run.
- Jump.
- Variable jump height.
- Double jump (optional power-up).
- Crouch.
- Pick up objects.
- Interact with objects.
- Take damage and temporarily become invulnerable.

Movement should feel responsive and polished.

Implement acceleration, friction, gravity, collision detection, and proper platform landing.

---

# 4. CORE GAMEPLAY

The main objective is to run through levels collecting urine samples.

Collectibles:

**URINE SAMPLES**
- Small yellow sample containers.
- Different sizes and point values.
- Some hidden in secret locations.
- Some carried by NPCs.

**MINOR POSSESSION**
- Small quantities of suspicious substances.
- Finding these awards bonus points.
- Occasionally triggers an absurd police achievement.

**EVIDENCE**
- Plastic bags.
- Empty containers.
- Suspicious-looking objects.
- Questionable laboratory equipment.

**BONUS ITEMS**
- Coffee cups.
- Police paperwork.
- Government directives.
- Taxpayer money.

Create an engaging collectible system with:
- Score.
- Collection counter.
- Combo multipliers.
- Hidden collectibles.
- End-of-level statistics.

---

# 5. ENEMIES AND OBSTACLES

Create a humorous cast of enemies and obstacles.

Examples:

**THE STONER**
A relaxed character who barely moves. He occasionally drops collectibles.

**THE DEALER**
Runs away when Blenke approaches.

**THE PARTY PEOPLE**
Groups of colorful NPCs that move unpredictably.

**THE BUREAUCRAT**
Throws paperwork at Blenke.

**THE PROSECUTOR**
A miniboss who attacks with enormous legal documents.

**THE LABORATORY TECHNICIAN**
Throws mysterious test tubes.

**THE POLITICAL IDEOLOGUE**
An enemy who constantly shouts slogans.

Environmental hazards:
- Giant urine puddles.
- Toxic-looking green slime.
- Moving platforms.
- Deep water.
- Broken sewer pipes.
- Police tape.
- Giant syringes.
- Endless paperwork.
- Unstable laboratory equipment.

Enemies should have simple but distinct AI and animations.

## More characters: the subcultures

Designed on 2026-11-10, not yet built: ten more people Blenke is sent
after, each from a youth culture of the 1970s, 80s or 90s. The police's own
brochure, "Tecken på narkotikamissbruk", told officers what to look for, and
it listed haircuts, clothes and music. Each character is flagged by one such
sign. Like the stoner, most of them harm nobody until the police come. The
joke is on the brochure, never on the subculture.

Each will be built in its own portion, with its art ordered from the asset
factory (characters face right, `ink` outline, at most 15 colours) and a
code-drawn fallback. The lines are the game's Swedish, in capitals for the
bitmap font. "Needs" names what the engine doesn't do yet.

**THE HIPPIE** (Hippien) – world 1, the 1970s levels
Long hair, a headband, a flowery tunic, barefoot, a guitar on a strap. He
wanders slowly, now and then sits down cross-legged to play, and the notes
drift up and away. Close to him everything is mellow: Blenke walks slower
for as long as he is within the hippie's reach. Harmless otherwise.
- Sign: "LÅNGT HÅR"
- Lines: "PEACE, KONSTAPELN!", "ALLT ÄR KÄRLEK"
- Points: 50. Carries a bag of herbal tea, logged as evidence.
- Needs: an area that slows Blenke.

**THE HEADBANGER** (Hårdrockaren) – worlds 1–2
Denim vest with patches, long hair, a band T-shirt, white trainers. He
headbangs on the spot to a cassette player and plays air guitar. When
Blenke comes close he stage-dives at him in a long arc, then gets up and
bangs on. The 1980s panic over satanic messages in heavy metal.
- Sign: "LYSSNAR PÅ HÅRDROCK"
- Lines: "HÅRDROCK ÄR INGET BROTT!", "SPELA BAKLÄNGES: TA DET LUGNT"
- Points: 100. Carries a cassette, logged as evidence.
- Needs: a leaping attack aimed at Blenke.

**THE PUNK** (Punkaren) – worlds 1–2
A tall green mohawk, a leather jacket full of safety pins, boots. She pogos:
bounces high on the spot and, when the music takes her, sideways. The
mohawk is sharp: landing on it while she is on the way up hurts Blenke.
She can only be stomped at the bottom of a bounce.
- Sign: "SÄKERHETSNÅLAR"
- Lines: "INGEN FRAMTID!", "STAT OCH KAPITAL!"
- Points: 100. Carries a fanzine.
- Needs: an enemy that can't be stomped in part of its motion.

**THE RAGGARE** (Raggaren) – worlds 1–2
Quiff, rolled-up sleeves, a can of beer, in a big 1950s American car
cruising slowly back and forth along the road. The car's roof is a moving
platform that Blenke can ride. He can't be beaten: stomping the car only
gets him a cheer. Alcohol is the legal drug, and nobody asks him for a
sample.
- Sign: none. The brochure has nothing on him.
- Lines: "SKÅL, KONSTAPELN!", "VI ÄR BARA UTE OCH ÅKER"
- Points: none, he can't be beaten.
- Needs: an enemy that is a moving platform; one that can't be defeated.

**THE SYNTH** (Synthare) – world 2
A pale face, black eyeliner, a long grey coat, an asymmetric fringe, a
keytar. He moves like a robot, in jerks, and plays arpeggios that leave the
keytar as square waves, stepping up and down in stairs across the street.
- Sign: "SVART SMINK"
- Lines: "SYNTAR ÄR INGEN DROG!", "JAG ÄR EN MASKIN"
- Points: 100. Carries a floppy disk.
- Needs: a projectile moving in steps.

**THE PROGG ACTIVIST** (Proggaren) – world 1, the 1970s levels
Clogs, a knitted sweater, a long scarf, a beard, a banner on a pole. She
marches in a demonstration back and forth, the banner held high, and
Blenke can ride on it. With the banner above her she can't be stomped,
only hit with a thrown cone.
- Sign: "POLITISKT ENGAGEMANG"
- Lines: "MUSIKEN SKA VARA FRI!", "VI KRÄVER VÅRD, INTE STRAFF!"
- Points: 100. Carries a stencilled leaflet.
- Needs: a platform carried by an enemy; an enemy beaten only by a cone.

**THE SKATER** (Skejtaren) – worlds 1–2
A cap backwards, a huge T-shirt, wide trousers, a skateboard. He rolls fast
along the street and ollies over gaps, kerbs and Blenke. Stomped, he falls
off, and the board rolls on by itself for a while: Blenke can ride it.
- Sign: "VIDA BYXOR"
- Lines: "SKATEBOARD ÄR FÖRBJUDET HÄR?", "KOLLA, KONSTAPELN!"
- Points: 100. Carries a can of spray paint.
- Needs: a jumping enemy that clears what is in its way; a board to ride.

**THE BREAKDANCER** (Breakdansaren) – world 2
A tracksuit, a cap, a boombox on a piece of cardboard. He spins on his
back and head with his legs flying: touching him from the side while he
spins costs a heart. Between spins he freezes in a pose, and only then can
he be stomped.
- Sign: "KEPS"
- Lines: "DET HÄR ÄR KULTUR!", "FRYS!" (as he freezes)
- Points: 100. Carries a mixtape.
- Needs: a window when an enemy can be hurt.

**THE RAVER** (Ravaren) – world 2
A whistle, a bucket hat, a smiley T-shirt, glow sticks in both hands. She
dances and throws glow sticks, which hurt nobody: they lie on the ground
glowing a while and light up what is hidden near them, samples
included, as Blenke's own nearness does. The 1990s police raids on
Stockholm's raves.
- Sign: "VISSELPIPA"
- Lines: "VI DANSAR BARA!", "HÄMTA VATTEN, KONSTAPELN!"
- Points: 100. Carries a water bottle, logged as evidence.
- Needs: a harmless projectile that lands and stays, revealing hidden
  items. (Dark areas, to light up for real, can come with world 2.)

**THE GOTH** (Gotaren) – world 1, the grave field in 1-4, and world 2
Black from head to toe, a white face, a crucifix, a book of poems. He stands
in the shadows and can't be seen until Blenke comes close, then drifts
slowly towards him, and fades again if Blenke goes away. Stomped, he sighs.
- Sign: "KLÄR SIG I SVART"
- Lines: "LIVET ÄR MÖRKT", "DU STÖR MIN SORG"
- Points: 100. Carries a candle.
- Needs: an enemy that is hidden until Blenke is near.

---

# 6. LEVEL WORLDS

Design a progression through increasingly absurd environments.

WORLD 1: THE SWEDISH SUBURBS

A typical Swedish residential neighborhood.

- Apartment buildings.
- Playgrounds.
- Bus stops.
- Parking lots.
- Local parks.
- Police cars.
- Hidden urine samples.

WORLD 2: THE CITY AFTER DARK

A colorful urban environment.

- Nightclubs.
- Back alleys.
- Streetlights.
- Graffiti.
- Underground passages.
- Strange NPCs.

WORLD 3: THE GREAT URINE FACTORY

A massive laboratory complex.

- Conveyor belts.
- Giant collection containers.
- Chemical tanks.
- Laboratory machinery.
- Moving platforms.
- Dangerous liquids.

WORLD 4: THE BUREAUCRATIC SWAMP

A surreal environment representing Swedish government bureaucracy.

- Mountains of paperwork.
- Endless corridors.
- Giant rubber stamps.
- Floating government documents.
- Bureaucratic monsters.

WORLD 5: THE MINISTRY OF ABSURDITY

The final world.

A surreal government complex where the ultimate boss awaits.

Each world should contain several levels with increasing difficulty.

Start by implementing one complete, polished level. Design the architecture to support additional worlds and levels.

---

# 7. POWER-UPS

Create humorous power-ups:

**SUPER BLAD**
Temporarily increases urine collection capacity.

**POLICE COFFEE**
Increases running speed.

**PAPERWORK SHIELD**
Protects against one enemy attack.

**MANDATORY TESTING**
Temporarily reveals hidden collectibles.

**BUDGET INCREASE**
Doubles the score multiplier.

**POLICE HELICOPTER**
Temporary flight ability.

Each power-up should have a unique visual effect and sound.

---

# 8. GAME MECHANICS AND HUMOR

The satire should be integrated into the gameplay.

Examples:

- Enough points (the statistics) unlock a new police rank.
- Finding a tiny amount of cannabis gives more points than defeating a dangerous enemy.
- Rescuing someone is worth fewer points than finding a suspicious container.
- Every completed level produces an absurd police performance report.
- The game celebrates increasingly ridiculous collection statistics.

Display humorous messages such as:

"ANOTHER DANGEROUS CITIZEN NEUTRALIZED!"

"URINE SAMPLE SECURED. SOCIETY IS SAFER."

"THREAT LEVEL: 0.02 GRAMS."

"MISSION ACCOMPLISHED. TAXPAYER MONEY WELL SPENT."

"YOU HAVE COLLECTED 47 SAMPLES. EXCELLENT WORK, BLENKE!"

"NO MAJOR CRIME DETECTED. KEEP SEARCHING!"

Keep the humor clever and satirical rather than relying exclusively on crude jokes.

---

# 9. USER INTERFACE

Create a retro-inspired HUD.

Display:
- Score.
- Lives.
- Urine samples collected.
- Minor possession discoveries.
- Current level.
- Remaining time.
- Active power-up.

Create:
- Title screen.
- Start game.
- Pause menu.
- Game over screen.
- Level completion screen.
- High score screen, a new score signed with a three-letter tag, arcade
  style.

The title screen should feature the game title:

BLENKE HUSIS
& URINJAKTEN

Use an exaggerated retro arcade presentation.

---

# 10. AUDIO

Create a retro-inspired soundtrack.

Musical direction:
- Upbeat 16-bit platform game music.
- Catchy melodies.
- Slightly absurd atmosphere.
- Different musical themes for different worlds.

Sound effects:
- Jump.
- Landing.
- Collecting urine samples.
- Discovering minor possession.
- Taking damage.
- Enemy defeat.
- Power-up activation.
- Level completion.

Use Web Audio API to generate basic sound effects if external audio files are unavailable.

Include mute and volume controls.

---

# 11. GAME FEEL AND POLISH

This is extremely important.

Prioritize:
- Responsive controls.
- Smooth movement.
- Satisfying jumping.
- Good collision detection.
- Interesting level layouts.
- Visual feedback.
- Animated characters.
- Camera tracking.
- Screen transitions.
- Particle effects.
- Responsive UI.

Implement:
- Coyote time.
- Jump buffering.
- Variable jump height.
- Screen shake on selected events.
- Small bounce animations when collecting items.
- Brief hit-stop on important events.
- Smooth camera movement.

The game should feel like a genuine retro platform game.

---

# 12. DEVELOPMENT STRATEGY

Do not attempt to build everything simultaneously.

Work in phases.

PHASE 1:
Build the core game engine:
- Canvas rendering.
- Game loop.
- Input handling.
- Player movement.
- Gravity.
- Collision detection.
- Camera.
- Basic platforms.

PHASE 2:
Implement:
- Collectibles.
- Enemies.
- Obstacles.
- Scoring.
- HUD.

PHASE 3:
Create one complete playable level in the Swedish suburbs.

PHASE 4:
Add:
- Sound.
- Particles.
- Animations.
- Menus.
- Level completion.
- Game over.

PHASE 5:
Polish the game and optimize performance.

After each phase:
- Test the game.
- Fix bugs.
- Verify that existing functionality still works.
- Keep the game playable.

Do not leave unfinished placeholders in core gameplay.

---

# 13. IMPORTANT DESIGN PRINCIPLES

1. Gameplay comes first.
2. Humor and satire should be embedded in the world.
3. Controls must feel excellent.
4. Visual quality matters.
5. Levels should encourage exploration.
6. Reward curiosity with secrets and collectibles.
7. Make the game accessible to casual players.
8. Avoid unnecessary complexity.
9. Keep code modular.
10. Build a foundation that makes adding new levels and enemies easy.

---

# FINAL OBJECTIVE

Deliver a fully playable HTML5 platform game prototype.

The first version must include:

- A title screen.
- A playable police officer character.
- One complete side-scrolling level.
- At least five different enemy types.
- Multiple collectible types.
- At least two power-ups.
- Working collision detection.
- Scoring system.
- HUD.
- Sound effects.
- Level completion.
- Game over.

The result should be something people can actually play in their browser and laugh at.

Make it feel like a lost 16-bit platform game from 1992 that somehow got developed in Sweden in 2026.
