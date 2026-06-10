# Project Architecture

This document defines the target architecture for the Solar System visualization application. The current static graphics experiment is not an architectural foundation and will be replaced during the React migration.

## Product scope

The application is an interactive 3D atlas of the Solar System inspired by Google Earth.

The first version will provide:

- a 3D overview of the Solar System;
- continuous camera travel between celestial bodies;
- close views of Earth, Mars, and Venus;
- URL, search, and on-screen navigation;
- information panels for celestial bodies;
- NASA image integration;
- a separate NASA Astronomy Picture of the Day view;
- visually normalized sizes, distances, and travel times.

Scientific ephemerides, a JPL Horizons proxy, complex shaders, and a complete satellite catalogue are outside the initial MVP.

## Technology

- React;
- TypeScript in strict mode;
- Vite;
- React Router;
- Redux Toolkit;
- RTK Query;
- Three.js;
- React Three Fiber;
- React Three Drei;
- SCSS Modules with global SCSS design tokens and CSS custom properties.

## Layers

```text
app
 ↓
pages
 ↓
widgets
 ↓
features
 ↓
entities
 ↓
shared
```

Imports may only point downward. Every independent module exposes its supported interface through `index.ts`. Deep imports across module boundaries are prohibited.

### Responsibilities

- `app`: store, router, providers, global styles, error boundaries.
- `pages`: route-level screens and route parameter coordination.
- `widgets`: large interface sections such as the 3D scene and information panel.
- `features`: user actions such as navigation, search, and camera control.
- `entities`: celestial bodies, orbits, camera targets, NASA images, and APOD items.
- `shared`: domain-independent API infrastructure, UI, hooks, configuration, helpers, and styles.

## Target structure

```text
src/
  app/
    providers/
    router/
    store/
      hooks.ts
      rootReducer.ts
      store.ts
    App.tsx
    index.ts

  pages/
    SolarSystemPage/
    CelestialBodyPage/
    ApodPage/
    NotFoundPage/

  widgets/
    SolarSystemScene/
    NavigationPanel/
    BodyInformation/
    ApodViewer/
    Header/

  features/
    selectCelestialBody/
    navigateToBody/
    controlCamera/
    searchCelestialBody/
    changeSimulationTime/

  entities/
    celestialBody/
    orbit/
    camera/
    nasaImage/
    apod/

  shared/
    api/
      baseApi.ts
      apiError.ts
    config/
    constants/
    helpers/
    hooks/
    types/
    ui/
    styles/
      _reset.scss
      _tokens.scss
      _mixins.scss
      global.scss

  main.tsx
```

Directories are created only when they contain real code.

## Styling architecture

Component styles use SCSS Modules. Global styles live in `shared/styles` and are imported only by the application entry point.

- `_reset.scss` normalizes browser defaults;
- `_tokens.scss` defines design tokens;
- `_mixins.scss` contains responsive and accessibility patterns;
- `global.scss` composes global styles.

CSS custom properties are the source of truth for runtime theme values. SCSS variables and functions are used for compile-time calculations.

## Module public API

Each independent module exports its public contract through `index.ts`. Internal files use relative imports and must not import their own module through `index.ts`.

```ts
export { CelestialBody } from './ui/CelestialBody';
export { selectBodyById } from './model/selectors';
export type { CelestialBodyData } from './model/types';
```

## State ownership

### RTK Query

RTK Query owns NASA APOD and image responses, loading and error states, request deduplication, and caching. Remote responses are not copied into ordinary slices without a specific reason.

### Redux slices

Redux owns serializable state shared by multiple modules: visualization scale, simulation date, persistent display settings, and shared panel state. The route is the source of truth for the opened celestial body.

### Graphics runtime

Camera position, frame identifiers, Three.js references, travel progress, shader uniforms, pointer coordinates, and frame timing stay in refs, React Three Fiber, Three.js objects, or a graphics controller. Redux never receives per-frame updates.

### Local state

Component-specific interface state remains in the owning component.

## Store organization

```text
app/store/
  store.ts
  rootReducer.ts
  hooks.ts
```

Feature and entity slices stay inside their owning modules. The app store imports reducers through public APIs.

## API organization

`shared/api/baseApi.ts` defines the common RTK Query instance, headers, response handling, and error normalization.

Domain endpoints stay near their owners and use `baseApi.injectEndpoints()`:

```text
entities/apod/api/apodApi.ts
entities/nasaImage/api/nasaImageApi.ts
```

Initial sources:

- local typed catalogue for stable physical facts and hierarchy;
- NASA Images API;
- NASA APOD API.

JPL Horizons is deferred until a scientific mode is added.

## File responsibility

A module may contain:

```text
ModuleName/
  api/       endpoints and response mapping
  lib/       pure domain calculations
  model/     state, selectors, types, constants
  ui/        components and styles
  hooks/     React coordination logic
  index.ts   public API
```

Component-only props may stay in the component file. Significant module types belong in `model/types.ts`; transport types stay next to API code. Domain helpers stay with their domain. `shared/helpers` contains only domain-independent pure functions.

The term `service` is reserved for integrations or long-lived coordinators such as a camera controller or texture loader. Generic `services.ts` files are prohibited.

## Graphics architecture

React owns application composition and UI, but does not drive every frame through state updates.

```text
React UI
  → scene controller and feature hooks
  → React Three Fiber scene
  → Three.js objects and render loop
```

The camera controller exposes commands such as `focusBody(bodyId)`, `returnToSystem()`, and `setScaleMode(mode)`. Callers do not manipulate camera coordinates directly.

## Routing

```text
/system
/body/:bodyId
/body/:bodyId/moon/:moonId
/apod
/*
```

The URL supports direct links, back/forward navigation, scene restoration, and unknown identifiers. Camera travel reacts to route changes but does not replace routing.

## Dependency boundaries

Allowed direction:

```text
page → widget → feature → entity → shared
```

Prohibited:

- lower layers importing higher layers;
- cross-module deep imports;
- circular dependencies;
- UI components calling raw `fetch`;
- Redux slices importing Three.js objects;
- graphics code depending on route components.

## Performance constraints

- Do not dispatch Redux actions on animation frames.
- Reuse geometries and materials.
- Load high-resolution textures only when needed.
- Provide quality levels and cap device pixel ratio.
- Pause or reduce rendering in hidden tabs.
- Dispose graphics resources and event listeners.
- Lazy-load routes and expensive assets.
- Avoid unnecessary scene-tree rerenders.

## Initial implementation sequence

1. Replace the experiment with React, TypeScript, and Vite.
2. Configure linting, formatting, aliases, routing, and Redux.
3. Add the base RTK Query API.
4. Add the typed Earth, Mars, and Venus catalogue.
5. Build the React Three Fiber scene.
6. Implement route-driven selection and camera travel.
7. Add information panels and search.
8. Add NASA Images and APOD.
9. Optimize desktop and mobile behavior.

## Deferred decisions

- exact texture sources and licenses;
- final visual scale formulas;
- whether APOD is a route, modal, or both;
- supported moons;
- scientific mode and JPL proxy hosting;
- advanced shaders;
- offline caching and PWA support.
