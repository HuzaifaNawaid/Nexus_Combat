<img src="nexus combat.png" width="1000" />

> *A browser-based 3D first-person shooter — six worlds, four warriors, one final stand.*
---

## 🎮 About the Game

**NEXUS COMBAT** is a fully browser-based 3D first-person shooter. No downloads, no installs — just open the link and fight. Choose your warrior from 4 unique fighters, battle through **6 increasingly brutal missions**, and face the ultimate challenge: **Level 6 — The Void Arena**, where every villain from every level returns for one final showdown.

---

## ⚔️ Choose Your Fighter

| Character | Special Move | Description |
|-----------|-------------|-------------|
| 👻 **Ghost** | Phantom Burst | 8 rapid crits |
| 💪 **Titan** | Ground Slam | Massive AoE explosion |
| 🌑 **Wraith** | Shadow Strike | Teleport + triple crit |
| ⚡ **Nova** | Lightning Storm | Chain lightning all enemies |

> Press `[F]` to unleash your Special Move when the bar is fully charged.

---

## 🗺️ Select Your Mission

| Level | Map | Difficulty | Boss Villain |
|-------|-----|-----------|--------------|
| 1 | 🌧️ Rainstorm Ruins | `EASY` | Hydra Scout |
| 2 | 🌿 Ancient Forest | `EASY` | Forest Wraith |
| 3 | ❄️ Frozen Tundra | `MEDIUM` | Frost Titan |
| 4 | 🏜️ Scorched Desert | `MEDIUM` | Pharaoh God |
| 5 | 🌋 Lava Lands | `HARD` | Inferno King |
| 6 | 🌀 The Void Arena | `EXTREME` | Kraken God + ALL villains return |

---

## Tech Stack
- **React 19** & **Vite**: Fast, modern frontend framework and bundler.
- **TypeScript**: For robust, type-safe code.
- **Tailwind CSS**: For rapid, utility-first styling.
- **Three.js**: For 3D rendering and game engine logic.
- **Zustand**: For lightweight, fast state management.

---

## Project Structure
- `src/game/`: Contains the core game engine, audio system, and game constants.
  - `engine.ts`: The Three.js game loop, rendering, and entity management.
  - `audio.ts`: Web Audio API synthesizer for BGM and SFX.
  - `constants.ts`: Game data (characters, weapons, villains, levels).
- `src/store/`: Contains the Zustand store for managing UI state.
- `src/components/`: Reusable React components.
  - `ui/`: Generic UI components (Buttons, Modals).
  - `screens/`: Different game screens (MainMenu, MapSelect, HUD, etc.).
  - `GameCanvas.tsx`: The component that mounts the Three.js canvas.

---

## Features
- **3D Graphics**: Built with Three.js, featuring dynamic lighting, shadows, and particle systems.
- **Procedural Audio**: Fully synthesized music and sound effects using the Web Audio API.
- **Responsive UI**: Built with Tailwind CSS, adapting to desktop and mobile screens.
- **6 Unique Missions** with distinct environments and boss villains
- **Progressive Difficulty** — more enemies, stronger bosses, new minion types per level
- **4 Playable Characters** each with a unique special move
- **4 Weapon System** — switch mid-combat with `[1–4]`
- **Special Bar Mechanic** — charge by hitting enemies, unleash with `[F]`
- **Final Boss Level** — all previous villains converge in The Void Arena

---

## How to Play
- **WASD** — Move around the arena
- **Mouse** — Aim and look in any direction (360°)
- **Left Click / Key [5]** — Shoot your weapon
- **Keys [1–4]** — Switch between 4 weapons
- **[R]** — Reload current weapon
- **[F]** — Unleash Special Move (when bar is full)
- **Shift** — Sprint faster | **Space** — Jump
- **Click screen** — Enable FPS lock mode

## Run Locally

```bash
# Clone the repo
git clone https://github.com/HuzaifaNawaid/NEXUS-COMBAT.git
cd NEXUS-COMBAT

# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:3000` in your browser.

---

## 👤 Author

**Huzaifa Nawaid**  
GitHub: [@HuzaifaNawaid](https://github.com/HuzaifaNawaid)

---
