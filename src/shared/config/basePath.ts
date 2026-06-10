export function normalizeBasePath(basePath: string): string {
  const withLeadingSlash = basePath.startsWith('/') ? basePath : `/${basePath}`;

  if (withLeadingSlash === '/') {
    return '/';
  }

  return `${withLeadingSlash.replace(/\/+$/, '')}/`;
}

export function getRouterBaseName(basePath: string): string | undefined {
  const normalizedBasePath = normalizeBasePath(basePath);

  return normalizedBasePath === '/' ? undefined : normalizedBasePath.slice(0, -1);
}
