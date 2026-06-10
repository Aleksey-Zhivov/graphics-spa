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
- SCSS Modules for component styles.
- Global SCSS for reset, design tokens, typography, and document-level styles.
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
- Use `interface` only when declaration merging or intentional extension is useful.
- Keep types near their owner. Move shared domain types to `src/types`.
- Use `import type` for type-only imports.
- Do not use non-null assertions except at controlled application boundaries.
- Model finite UI states with unions instead of arbitrary strings.
- Prefer explicit return types for exported utilities and hooks.

## React

- Use functional components and hooks.
- Render the application inside `StrictMode`.
- Components and hooks must have one clear responsibility.
- Keep state as close as possible to the components that use it.
- Derive values during render when possible. Do not duplicate derived state.
- Use effects only to synchronize with external systems.
- Include every effect dependency. Do not silence hook lint rules.
- Prefer controlled form elements and semantic HTML.
- Interactive elements must be keyboard accessible.
- Provide stable keys from data.
- Avoid `React.FC`; type props directly on function parameters.
- Use named exports for components, hooks, types, and utilities.

## Components and files

- Use `PascalCase` for component names and component files.
- Use `camelCase` for hooks, utilities, and data files.
- Prefix hooks with `use`.
- Use descriptive names and keep one main exported component per file.
- Place tests and styles beside the owning module.

## Imports

- Import external packages first, then internal modules, then styles.
- Separate groups with one blank line.
- Use the `@/` alias for cross-feature imports from `src`.
- Use relative imports inside the same component or feature folder.
- Do not create barrel files solely to shorten imports.
- Avoid circular dependencies.

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

## Styling

- Use component-scoped SCSS Modules with the `.module.scss` extension.
- Keep global SCSS limited to reset, typography, theme tokens, and document layout.
- Import global styles only from the application entry point.
- Use CSS custom properties for theme values and values changed at runtime.
- Use SCSS variables, functions, and mixins for build-time calculations.
- Use mobile-first media queries and avoid `!important`.
- Respect `prefers-reduced-motion`.
- Keep contrast, focus states, and touch target sizes accessible.

## Canvas and graphics

- Keep rendering code outside React render functions.
- Store animation frame identifiers and mutable graphics objects in refs.
- Start and clean up animation loops inside dedicated hooks.
- Cancel `requestAnimationFrame` and remove event listeners during cleanup.
- Cap `devicePixelRatio` when necessary.
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
- Use imperative commit messages.
- Do not commit generated `dist`, local environment files, or editor metadata.
- Update documentation when architecture or behavior changes.
