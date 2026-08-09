import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.spec.ts'],
    exclude: ['src/**/*.int.spec.ts', 'src/**/*.e2e.spec.ts', 'node_modules'],
  },
  plugins: [
    swc.vite({
      tsconfigFile: 'tsconfig.json',
    }),
  ],
});
