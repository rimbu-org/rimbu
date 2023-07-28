import tsconfigPaths from 'vite-tsconfig-paths';
import { defineConfig } from 'vitest/config';
import path from 'path';

function r(p: string): string {
  return path.resolve(__dirname, p);
}

export default defineConfig({
  test: {
    globals: true,
    include: ['test/**/*.test.mts'],
    coverage: {
      all: true,
      include: ['src'],
      reporter: ['text', 'html', 'clover', 'json', 'lcov'],
    },
  },
  plugins: [tsconfigPaths()],
  resolve: {
    mainFields: ['module'],
    alias: {
      '@rimbu/actor': r('../packages/actor'),
      '@rimbu/base': r('../packages/base'),
      '@rimbu/bimap': r('../packages/bimap'),
      '@rimbu/bimultimap': r('../packages/bimultimap'),
      '@rimbu/collection-types': r('../packages/collection-types'),
      '@rimbu/common': r('../packages/common'),
      '@rimbu/deep': r('../packages/deep'),
      '@rimbu/graph': r('../packages/graph'),
      '@rimbu/hashed': r('../packages/hashed'),
      '@rimbu/list': r('../packages/list'),
      '@rimbu/multimap': r('../packages/multimap'),
      '@rimbu/multiset': r('../packages/multiset'),
      '@rimbu/ordered': r('../packages/ordered'),
      '@rimbu/proximity': r('../packages/proximity'),
      '@rimbu/sorted': r('../packages/sorted'),
      '@rimbu/spy': r('../packages/spy'),
      '@rimbu/stream': r('../packages/stream'),
      '@rimbu/table': r('../packages/table'),
    },
  },
});
