import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    globalSetup: './test/bootstrap/setup.ts',
    include: ['test/**/*.test.ts'],
  },
});