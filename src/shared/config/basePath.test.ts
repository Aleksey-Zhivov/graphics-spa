import { describe, expect, it } from 'vitest';

import { getRouterBaseName, normalizeBasePath } from './basePath';

describe('base path helpers', () => {
  it.each([
    ['/', '/'],
    ['graphics-spa', '/graphics-spa/'],
    ['/graphics-spa', '/graphics-spa/'],
    ['/graphics-spa/', '/graphics-spa/'],
  ])('normalizes %s to %s', (input, expected) => {
    expect(normalizeBasePath(input)).toBe(expected);
  });

  it('omits router basename for a root deployment', () => {
    expect(getRouterBaseName('/')).toBeUndefined();
  });

  it('removes the trailing slash for React Router', () => {
    expect(getRouterBaseName('/graphics-spa/')).toBe('/graphics-spa');
  });
});
