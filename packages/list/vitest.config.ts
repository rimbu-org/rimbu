import commonConfig from '../../config/vitest.config.common';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  ...commonConfig,
  test: {
    ...commonConfig.test,
    setupFiles: ['./test/setupTests.mts'],
  },
});
