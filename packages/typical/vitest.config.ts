import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.ts'],
    coverage: {
      all: true,
      include: ['src'],
    },
  },
  plugins: [tsconfigPaths()],
});
