import { AbstractExecutionController, Callback, ExecutorReturn } from "./base.controller";

/**
 * Used in Worker thread, or Child process to control the flow execution of graph
 */
export class LocalExecutionController extends AbstractExecutionController {
    started = true;
    paused = false;

    start(): ExecutorReturn {
        throw new Error("RunnerExecutionController does not support start method directly.");
    }

    clear(): void {
        this.started = false;
        this.paused = false;
    }

    pause(onPaused?: Callback) {
        this.paused = true;
        if (onPaused) onPaused();
    }

    resume(onResumed?: Callback) {
        this.paused = false;
        if (onResumed) onResumed();
    }

    cancel(onCanceled?: Callback) {
        this.clear();
        if (onCanceled) onCanceled();
    }
}