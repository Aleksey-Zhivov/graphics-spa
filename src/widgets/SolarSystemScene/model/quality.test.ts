import { describe, expect, it } from 'vitest';

import { GRAPHICS_QUALITY } from './quality';

describe('graphics quality presets', () => {
  it('uses schematic surfaces in low quality', () => {
    expect(GRAPHICS_QUALITY.low.textures).toBe(false);
    expect(GRAPHICS_QUALITY.low.effects).toBe(false);
  });

  it('keeps textured surfaces without premium effects in medium quality', () => {
    expect(GRAPHICS_QUALITY.medium.textures).toBe(true);
    expect(GRAPHICS_QUALITY.medium.effects).toBe(false);
  });

  it('enables all visual effects in high quality', () => {
    expect(GRAPHICS_QUALITY.high.textures).toBe(true);
    expect(GRAPHICS_QUALITY.high.effects).toBe(true);
    expect(GRAPHICS_QUALITY.high.primaryStars).toBeGreaterThan(
      GRAPHICS_QUALITY.medium.primaryStars,
    );
  });
});
