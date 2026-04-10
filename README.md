# Nexus Combat

Nexus Combat is a cinematic first-person arena shooter running entirely in the browser. Battle through 6 themed arenas, each guarded by a unique villain with escalating power.

## Tech Stack
- **React 19** & **Vite**: Fast, modern frontend framework and bundler.
- **TypeScript**: For robust, type-safe code.
- **Tailwind CSS**: For rapid, utility-first styling.
- **Three.js**: For 3D rendering and game engine logic.
- **Zustand**: For lightweight, fast state management.

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

## Features
- **3D Graphics**: Built with Three.js, featuring dynamic lighting, shadows, and particle systems.
- **Procedural Audio**: Fully synthesized music and sound effects using the Web Audio API.
- **Responsive UI**: Built with Tailwind CSS, adapting to desktop and mobile screens.
- **Touch Controls**: Full support for mobile devices with on-screen joystick and buttons.
- **Progression System**: Unlock levels, earn score, and choose upgrades between levels.

## How to Play
- **WASD** — Move around the arena
- **Mouse** — Aim and look in any direction (360°)
- **Left Click / Key [5]** — Shoot your weapon
- **Keys [1–4]** — Switch between 4 weapons
- **[R]** — Reload current weapon
- **[F]** — Unleash Special Move (when bar is full)
- **Shift** — Sprint faster | **Space** — Jump
- **Click screen** — Enable FPS lock mode

## Development
Run the development server:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```
