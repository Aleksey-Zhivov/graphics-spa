# Code Style

This document defines the engineering conventions for `graphics-spa`.

The rules are based on recurring patterns in the author's React, TypeScript,
and Vite repositories, including `for-fuse8`, `for-lesta-games`,
`counter-button`, `Idea-Platform`, and `uk-admin`. Where those repositories
use different conventions, this document selects one consistent rule for the
current project.

## Technology baseline

- React with functional components and hooks.
- TypeScript in strict mode.
- Vite for development and production builds.
- ECMAScript modules.
- ESLint for static analysis.
- Prettier for formatting.
- CSS Modules or SCSS Modules for component styles.
- GitHub Pages deployment from the production build.

Adding a runtime dependency requires a concrete product or engineering need.
Prefer browser and React APIs for small features.

## Required scripts

The project must provide:

```json
{
  "dev": "vite",
  "build": "tsc -b && vite build",
  "preview": "vite preview",
  "lint": "eslint .",
  "format": "prettier --write .",
  "format:check": "prettier --check ."
}
```

Tests will be added once the first stable user scenarios are defined.

## TypeScript

- Enable `strict`.
- Enable checks for unused locals, unused parameters, and switch fallthrough.
- Do not use `any`. Use a concrete type or `unknown` with narrowing.
- Prefer `type` for props, unions, aliases, and data models.
- Use `interface` only when declaration merging or intentional extension is
  useful.
- Keep types near their owner. Move shared domain types to `src/types`.
- Use `import type` for type-only imports.
- Do not use non-null assertions except at controlled application boundaries,
  such as the root element in `main.tsx`.
- Model finite UI states with unions instead of arbitrary strings.
- Prefer explicit return types for exported utilities and hooks. React
  components may rely on inferred return types.

```ts
type MotionMode = 'orbit' | 'flow' | 'pulse';

type ControlPanelProps = {
  mode: MotionMode;
  onModeChange: (mode: MotionMode) => void;
};
```

## React

- Use functional components and hooks.
- Render the application inside `StrictMode`.
- Components and hooks must have one clear responsibility.
- Keep state as close as possible to the components that use it.
- Lift state only when multiple branches need the same source of truth.
- Derive values during render when possible. Do not duplicate derived state.
- Use effects only to synchronize with external systems.
- Include every effect dependency. Do not silence hook lint rules.
- Prefer controlled form elements.
- Use semantic HTML before adding ARIA.
- Interactive elements must be keyboard accessible.
- Provide stable keys from data; do not use array indexes for mutable lists.
- Avoid `React.FC`; type props directly on the function parameters.
- Use named exports for components, hooks, types, and utilities.
- Reserve default export for Vite configuration or a framework requirement.

```tsx
type PaletteButtonProps = {
  color: string;
  isActive: boolean;
  onSelect: () => void;
};

export function PaletteButton({
  color,
  isActive,
  onSelect,
}: PaletteButtonProps) {
  return (
    <button
      type='button'
      aria-pressed={isActive}
      onClick={onSelect}
      style={{ backgroundColor: color }}
    />
  );
}
```

## Components and files

- Use `PascalCase` for component names and component files:
  `ControlPanel.tsx`.
- Use `camelCase` for hooks, utilities, and data files:
  `useCanvasScene.ts`, `createParticle.ts`.
- Prefix hooks with `use`.
- Use descriptive names; avoid abbreviations such as `btn`, `arr`, or `obj`.
- Keep one main exported component per component file.
- Place tests and styles beside the owning module.

Recommended structure:

```text
src/
  app/
    App.tsx
  components/
    ControlPanel/
      ControlPanel.tsx
      ControlPanel.module.scss
  features/
    graphics/
      components/
      hooks/
      lib/
      model/
      types.ts
  pages/
  shared/
    components/
    hooks/
    lib/
  styles/
  main.tsx
```

Create folders only when they have real content. Small features should remain
small.

## Imports

- Import external packages first, then internal modules, then styles.
- Separate groups with one blank line.
- Use the `@/` alias for cross-feature imports from `src`.
- Use relative imports inside the same component or feature folder.
- Do not create barrel files solely to shorten imports.
- Avoid circular dependencies.

```ts
import { useEffect, useRef } from 'react';

import type { Particle } from '@/features/graphics/types';
import { resizeCanvas } from '@/features/graphics/lib/resizeCanvas';

import styles from './CanvasScene.module.scss';
```

## Functions and state

- Prefer `const` and arrow functions for callbacks and small local functions.
- Use function declarations for exported utilities when this improves
  readability.
- Use early returns to reduce nesting.
- Keep functions focused and reasonably short.
- Use immutable updates for React state.
- Extract magic numbers to named constants.
- Do not mutate props or shared state.
- Add comments only for non-obvious decisions and constraints.

## Formatting

Prettier is the formatting authority:

```json
{
  "singleQuote": true,
  "jsxSingleQuote": true,
  "semi": true,
  "trailingComma": "all",
  "tabWidth": 2,
  "printWidth": 100,
  "endOfLine": "lf"
}
```

Additional rules:

- One statement per line.
- Self-close empty JSX elements.
- Omit the value for boolean JSX props when it is `true`.
- Do not align code manually with spaces.
- Files must end with a newline.

## Styling

- Use component-scoped CSS/SCSS Modules.
- Keep global styles limited to reset, typography, theme tokens, and document
  layout.
- Define reusable colors, spacing, typography, and motion values as CSS custom
  properties.
- Use mobile-first media queries.
- Avoid `!important`.
- Prefer classes over inline styles. Inline styles are acceptable for values
  calculated at runtime, such as dynamic colors or canvas dimensions.
- Respect `prefers-reduced-motion`.
- Keep contrast, focus states, and touch target sizes accessible.

## Canvas and graphics

- Keep rendering code outside React render functions.
- Store animation frame identifiers and mutable graphics objects in refs.
- Start and clean up animation loops inside dedicated hooks.
- Cancel `requestAnimationFrame` and remove event listeners during cleanup.
- Cap `devicePixelRatio` when necessary to protect performance.
- Keep simulation state separate from UI control state.
- Avoid allocating large arrays and objects on every animation frame.
- Pause or reduce work when the document is hidden.
- Provide a reduced-motion or static fallback.

## Quality gates

Before a change is considered complete:

1. `npm run lint` passes.
2. `npm run format:check` passes.
3. `npm run build` passes.
4. The affected interaction is checked in the browser.
5. Desktop and mobile layouts are checked for visual changes.
6. No new console errors or warnings are introduced.

## Git conventions

- Keep commits focused on one coherent change.
- Use imperative commit messages:
  `Add particle density control`.
- Do not commit generated `dist`, local environment files, or editor metadata.
- Update documentation when architecture or behavior changes.

