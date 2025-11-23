import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.mts'],
    coverage: {
      include: ['src'],
      reporter: ['text', 'html', 'clover', 'json', 'lcov'],
    },
  },
  plugins: [tsconfigPaths()],
});
