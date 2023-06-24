import commonConfig from '../../config/vitest.config.common';
import { mergeConfig } from 'vitest/config';

export default mergeConfig(commonConfig, {
  test: {
    environment: 'happy-dom',
  },
});
