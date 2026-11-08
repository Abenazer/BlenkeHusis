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

Target desktop browsers first.

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
- High score screen.

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
