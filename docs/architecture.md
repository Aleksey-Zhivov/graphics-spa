# Project Architecture

This document defines the target architecture for the Solar System
visualization application. The current static graphics experiment is not an
architectural foundation and will be replaced during the React migration.

## Product scope

The application is an interactive 3D atlas of the Solar System inspired by the
navigation experience of Google Earth.

The first product version will provide:

- a 3D overview of the Solar System;
- continuous camera travel between celestial bodies;
- close views of Earth, Mars, and Venus;
- navigation through URLs, search, and on-screen controls;
- information panels for celestial bodies;
- NASA image integration;
- a separate NASA Astronomy Picture of the Day view;
- visually normalized sizes, distances, and travel times.

Scientifically accurate ephemerides, a backend proxy for JPL Horizons, complex
planetary shaders, and a complete satellite catalogue are outside the initial
MVP.

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
- CSS or SCSS Modules.

## Architectural principles

1. Organize code by responsibility and business domain.
2. Import modules only from lower architectural layers.
3. Expose every independent module through its public `index.ts`.
4. Keep server state, application state, and graphics runtime state separate.
5. Keep domain logic independent from React and Three.js when possible.
6. Keep implementation details private inside their owning modules.
7. Prefer feature-local code over global utility collections.
8. Create abstractions only after a real reuse case appears.

## Layers

The project uses the following layers:

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

Imports may only point downward. A lower layer must never import from a higher
layer.

### `app`

Application initialization and global composition:

- store configuration;
- router configuration;
- application providers;
- global styles;
- error boundaries;
- application entry component.

The `app` layer may compose all lower layers but must not contain domain
features.

### `pages`

Route-level screens:

- Solar System overview;
- celestial body view;
- Astronomy Picture of the Day view;
- not-found page.

A page coordinates widgets and route parameters. It should not implement
low-level graphics or reusable domain logic.

### `widgets`

Large, self-contained interface sections:

- Solar System scene;
- navigation panel;
- celestial body information panel;
- search panel;
- APOD viewer;
- application header.

Widgets compose features and entities into meaningful page sections.

### `features`

User actions and application capabilities:

- select a celestial body;
- navigate to a body;
- control the camera;
- search celestial bodies;
- change simulation time;
- switch visualization scale;
- open the APOD panel.

A feature describes an action or user intention rather than a domain object.

### `entities`

Business objects and their domain behavior:

- celestial body;
- orbit;
- camera target;
- NASA image;
- APOD item.

Entities own domain types, selectors, related API endpoints, reusable UI, and
domain-specific calculations.

### `shared`

Domain-independent infrastructure:

- base API configuration;
- generic UI components;
- generic hooks;
- environment configuration;
- constants;
- general-purpose helpers;
- common technical types;
- shared styles and design tokens.

Code should not be moved to `shared` merely because it is used twice. It must
also be independent of a specific business domain.

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
      api/
      lib/
      model/
      ui/
      index.ts
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

  main.tsx
```

Directories must be created only when they contain real code. Small modules
should remain small.

## Module public API

Every independent module exposes its supported interface through `index.ts`.
External modules must not import internal files directly.

```text
entities/celestialBody/
  api/
    celestialBodyApi.ts
  lib/
    calculateVisualScale.ts
  model/
    selectors.ts
    types.ts
  ui/
    CelestialBody.tsx
  index.ts
```

```ts
export { CelestialBody } from './ui/CelestialBody';
export { selectBodyById } from './model/selectors';
export type { CelestialBodyData } from './model/types';
```

Consumer:

```ts
import {
  CelestialBody,
  selectBodyById,
  type CelestialBodyData,
} from '@/entities/celestialBody';
```

Rules:

- `index.ts` exports only the supported public contract;
- internal files use relative imports within their module;
- a module must not import itself through its own `index.ts`;
- deep imports across module boundaries are prohibited;
- barrel files are not created for folders without a meaningful public API.

## State ownership

The application separates state into three categories.

### Server state: RTK Query

RTK Query owns remote data:

- NASA APOD responses;
- NASA image search results;
- loading and error states;
- request deduplication;
- caching and cache invalidation;
- retry and refetch behavior.

Remote responses must not be copied into ordinary Redux slices without a
specific reason.

### Application state: Redux slices

Redux slices own serializable state shared by multiple parts of the
application:

- selected celestial body identifier;
- visualization scale mode;
- selected simulation date;
- persistent display settings;
- global panel state when it is shared across routes.

State that is represented in the URL should not be duplicated in Redux unless
there is a documented synchronization strategy. The route is the source of
truth for the currently opened celestial body.

### Graphics runtime state: refs and Three.js

High-frequency mutable graphics state stays outside Redux:

- camera position and velocity;
- animation frame identifiers;
- pointer coordinates;
- Three.js object references;
- interpolated travel progress;
- particles and shader uniforms;
- frame timing;
- temporary hover state when it only affects the scene.

This state belongs to React refs, React Three Fiber, Three.js objects, or a
dedicated graphics controller. Redux must never receive per-frame updates.

### Local component state

Local UI state stays in the owning component when no other module needs it:

- an expanded section;
- an input value before submission;
- a local tooltip;
- temporary focus state.

## Store organization

```text
app/store/
  store.ts
  rootReducer.ts
  hooks.ts
```

- `store.ts` configures the Redux store and middleware;
- `rootReducer.ts` combines application reducers;
- `hooks.ts` exports typed `useAppDispatch` and `useAppSelector`;
- feature and entity slices stay inside their owning modules;
- the app store imports reducers through module public APIs.

The store directory must not become a storage place for unrelated domain
logic.

## API organization

The shared API layer contains only transport-level infrastructure:

```text
shared/api/
  baseApi.ts
  apiError.ts
```

`baseApi.ts` defines:

- the common RTK Query API instance;
- shared headers;
- common response handling;
- generic error normalization.

Domain endpoints stay near their owners:

```text
entities/apod/api/apodApi.ts
entities/nasaImage/api/nasaImageApi.ts
```

They extend the common API with `baseApi.injectEndpoints()`.

This provides one cache and middleware instance without creating a large
central `services.ts`.

### Initial data sources

- Local typed catalogue: object hierarchy and stable physical facts.
- NASA Images API: image search and media metadata.
- NASA APOD API: Astronomy Picture of the Day.

JPL Horizons requires a separate backend proxy and is deferred until the
scientific visualization phase.

### API keys

- API keys are read from Vite environment variables.
- Secret keys must not be committed to the repository.
- Client-side NASA keys must be treated as public identifiers, not secrets.
- `.env.example` documents every required environment variable.
- API clients must expose normalized application models rather than raw
  transport responses.

## File responsibility

A module may contain:

```text
ModuleName/
  api/       network endpoints and response mapping
  lib/       pure internal domain calculations
  model/     state, selectors, types, constants
  ui/        React components and styles
  hooks/     React coordination logic
  index.ts   public API
```

Use these directories only when needed.

### Types

- Component-only props may remain in the component file.
- Significant module types belong in `model/types.ts`.
- API transport types belong next to the API implementation.
- Shared technical types belong in `shared/types`.
- Domain types must not be placed in `shared/types`.

### Logic

- Pure domain logic belongs in the relevant entity or feature `lib`.
- React coordination belongs in hooks.
- Rendering logic belongs in the graphics module.
- Network response mapping belongs in the owning API directory.
- Business decisions must not be hidden inside UI components.

### Services

The term `service` is reserved for integrations or long-lived coordinators that
do not naturally fit an RTK Query endpoint:

- camera travel controller;
- texture loader;
- analytics adapter;
- future ephemeris proxy client.

Generic files named `services.ts` are prohibited.

### Helpers

- Domain helpers stay in the owning entity or feature.
- `shared/helpers` contains only genuinely domain-independent functions.
- Helpers must be pure whenever possible.
- A helper directory must not become a miscellaneous code collection.

## Graphics architecture

React owns application composition and user interface. React must not drive
every animation frame through state updates.

```text
React UI
  |
  | intent: focus body, change mode, pause
  v
Scene controller / feature hooks
  |
  | commands and stable configuration
  v
React Three Fiber scene
  |
  | per-frame mutable state
  v
Three.js objects and render loop
```

The graphics area is divided into:

- scene composition;
- celestial body rendering;
- orbit rendering;
- camera control and travel;
- labels and object picking;
- texture and asset loading;
- performance and quality management.

The camera controller exposes high-level commands such as:

```ts
focusBody(bodyId);
returnToSystem();
setScaleMode(mode);
```

Callers must not manipulate camera coordinates directly.

## Domain model

The initial domain model should support:

```ts
type CelestialBodyType =
  | 'star'
  | 'planet'
  | 'moon'
  | 'dwarfPlanet';

type CelestialBody = {
  id: string;
  name: string;
  type: CelestialBodyType;
  parentId: string | null;
  radiusKm: number;
  distanceFromParentKm: number;
  orbitalPeriodDays: number | null;
  rotationPeriodHours: number | null;
  textureId: string;
};
```

Display scale, current coordinates, loaded textures, and presentation strings
must not be stored in this base entity when they can be derived or owned by a
different layer.

## Routing and navigation

Planned routes:

```text
/system
/body/:bodyId
/body/:bodyId/moon/:moonId
/apod
/*
```

The URL is the source of truth for the opened object. It must support:

- direct links;
- browser back and forward navigation;
- scene restoration after refresh;
- transition from route state to a camera command;
- graceful handling of unknown object identifiers.

Camera travel is a visual reaction to navigation, not a replacement for
routing.

## Data flow examples

### Opening Mars

```text
User selects Mars
→ navigateToBody feature updates the route
→ CelestialBodyPage resolves mars from the catalogue
→ SolarSystemScene receives mars as the target
→ camera controller starts the transition
→ BodyInformation renders Mars data
```

### Opening APOD

```text
User opens APOD
→ router opens /apod
→ ApodViewer calls the RTK Query APOD endpoint
→ cached data is returned or requested
→ loading, error, image, or video state is rendered
```

## Dependency boundaries

Allowed:

```text
page → widget → feature → entity → shared
```

Also allowed:

- a widget may use an entity directly;
- a feature may use several entities;
- any layer may use `shared`.

Prohibited:

- `shared` importing domain code;
- an entity importing a feature, widget, or page;
- a feature importing a widget or page;
- cross-module deep imports;
- circular dependencies;
- UI components calling raw `fetch`;
- Redux slices importing Three.js scene objects;
- graphics code depending on route components.

## Testing boundaries

- Pure domain calculations: unit tests.
- Redux slices and selectors: unit tests.
- RTK Query response mapping: unit or integration tests with mocked responses.
- Features and widgets: component tests.
- Navigation and major user journeys: browser end-to-end tests.
- Graphics: behavior tests for controllers plus targeted visual browser checks.

Pixel-perfect snapshots of the entire animated canvas are not a primary test
strategy.

## Performance constraints

- Do not dispatch Redux actions on animation frames.
- Reuse Three.js geometries and materials where possible.
- Load high-resolution textures only when needed.
- Provide quality levels for weaker devices.
- Cap device pixel ratio.
- Pause or reduce rendering in hidden tabs.
- Dispose geometries, materials, textures, and event listeners.
- Lazy-load route-level panels and expensive visual assets.
- Avoid unnecessary React rerenders of the scene tree.

## Initial implementation sequence

1. Replace the static experiment with the React, TypeScript, and Vite
   foundation.
2. Configure linting, formatting, aliases, routing, and Redux.
3. Add the base RTK Query API.
4. Add the typed local catalogue for Earth, Mars, and Venus.
5. Build the initial React Three Fiber scene.
6. Implement route-driven body selection and camera travel.
7. Add information panels and search.
8. Add NASA Images and APOD integrations.
9. Optimize and validate desktop and mobile behavior.

## Decisions deferred

The following choices require later product or technical validation:

- exact texture sources and licenses;
- final visual scale formulas;
- whether APOD is a route, modal, or both;
- supported moons in the first complete catalogue;
- scientific mode and JPL Horizons proxy hosting;
- advanced atmosphere and surface shaders;
- offline caching and installable PWA support.

