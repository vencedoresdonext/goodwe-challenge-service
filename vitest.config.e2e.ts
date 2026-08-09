import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: [
      'src/**/*.e2e-spec.ts',
      'src/**/*.e2e.spec.ts',
      'test/**/*.e2e-spec.ts',
    ],
    exclude: ['node_modules'],
  },
  plugins: [
    swc.vite({
      tsconfigFile: 'tsconfig.json',
    }),
  ],
});
