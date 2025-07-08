import { defineConfig } from 'tsup';

export default defineConfig([{
  entry: ['src/index.ts'],
  bundle: true,
  outDir: 'dist/core',
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
}, {
    entry: ['src/runtime/worker.ts'],
    outDir: 'dist/runtime',
    format: ['esm'],
    bundle: true,
    splitting: false,
    clean: false,         // Keep index bundle intact
    dts: false,           // Worker doesn't need types
    minify: false,
    shims: false,
    name: 'worker',
    treeshake: true
}, {
    entry: ['src/runtime/childprocess.ts'],
    outDir: 'dist/runtime',
    format: ['cjs'],
    bundle: true,
    splitting: false,
    clean: false,
    dts: false,
    minify: false,
    shims: false,
    name: 'childprocess',
    treeshake: true
}]);
