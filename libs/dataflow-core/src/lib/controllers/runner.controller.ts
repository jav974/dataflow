import { AbstractExecutionController, Callback, ExecutorReturn } from "./base.controller";

/**
 * Used in serverside nestjs app to control flow execution of graph
 */
export class RunnerExecutionController extends AbstractExecutionController {
    started = true;
    paused = false;

    start(): ExecutorReturn {
        throw new Error("RunnerExecutionController does not support start method directly.");
    }

    clear(): void {
        this.started = false;
        this.paused = false;
    }

    pause(onPaused?: Callback): void {
        this.paused = true;
        if (onPaused) onPaused();
    }

    resume(onResumed?: Callback): void {
        this.paused = false;
        if (onResumed) onResumed();
    }

    cancel(onCanceled?: Callback): void {
        this.clear();
        if (onCanceled) onCanceled();
    }
}