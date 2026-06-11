import path from 'node:path';
import { fileURLToPath } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';

import { normalizeBasePath } from './src/shared/config/basePath';

const directoryName = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, directoryName, '');

  return {
    base: normalizeBasePath(environment.VITE_BASE_PATH || '/graphics-spa/'),
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(directoryName, 'src'),
      },
    },
  };
});
