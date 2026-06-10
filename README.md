# Solar Atlas

An interactive 3D atlas of the Solar System built with React, TypeScript,
Three.js, and React Three Fiber.

## Current prototype

- an angled Solar System overview;
- the Sun, Mercury, Venus, Earth, and Mars;
- 2K surface textures with colored fallbacks;
- animated visually normalized orbits;
- orbit highlighting and planet tooltips;
- route-driven planet selection;
- NASA Astronomy Picture of the Day;
- mouse and touch camera controls.

## Run locally

```bash
npm install
npm run dev
```

APOD uses `DEMO_KEY` by default. To use a personal NASA API key:

```bash
cp .env.example .env.local
```

Then replace `DEMO_KEY` in `.env.local`.

## GitHub Pages

The stable version is published from `main`. Active development is performed
in `develop` and merged into `main` after review.

## Project documentation

- [Code style and engineering conventions](./docs/code-style.md)
- [Project architecture](./docs/architecture.md)
