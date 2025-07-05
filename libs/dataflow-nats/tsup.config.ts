import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],   // Adjust path if needed
  outDir: 'dist',
  dts: true,                 // Emit .d.ts for consumers
  format: ['esm', 'cjs'],
  clean: true,
  splitting: false,          // Keep output simple
  shims: true,               // Optional Node polyfills
  watch: process.env.WATCH === 'true',
  outExtension: ({ format }) => {
    return format === 'esm'
      ? { js: '.mjs' }
      : { js: '.cjs' };
  }
});