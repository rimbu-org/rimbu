import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    include: ['test/**/*.test.mts'],
    coverage: {
      all: true,
      include: ['src'],
    },
  },
  plugins: [tsconfigPaths()],
});
