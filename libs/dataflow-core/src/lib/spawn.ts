export function spawnWorker(): Worker {
    return new Worker(new URL('../runtime/worker.mjs', import.meta.url), { type: 'module' });
}
