import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  target: 'es2020',
  format: ['esm', 'cjs'],
  splitting: false,
  clean: true,
  dts: true,
  shims: true,
  outExtension: ({ format }) => {
    return format === 'esm'
      ? { js: '.mjs' }
      : { js: '.cjs' };
  }
});