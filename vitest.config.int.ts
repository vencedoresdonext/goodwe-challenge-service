import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    include: ['src/**/*.int.spec.ts'],
    exclude: ['node_modules'],
  },
  plugins: [
    swc.vite({
      tsconfigFile: 'tsconfig.json',
    }),
  ],
});
