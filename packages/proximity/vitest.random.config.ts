import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test-random/**/*.test.mts'],
  },
  plugins: [tsconfigPaths()],
});
