import { defineConfig } from 'tsup';

export default defineConfig([{
  entry: ['src/index.ts'],
  bundle: true,
  outDir: 'dist',
  target: 'es2020',
  format: ['esm', 'cjs'],
  splitting: false,
  clean: false,
  dts: true,
  shims: true,
  watch: process.env.WATCH === 'true',
  outExtension: ({ format }) => {
    return format === 'esm'
      ? { js: '.mjs' }
      : { js: '.cjs' };
  }
}]);
