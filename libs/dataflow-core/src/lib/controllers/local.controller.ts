import { AppConfig } from "@dataflow-core/config/schema";
import { AbstractExecutionController, Callback, Executor, ExecutorReturn } from "./base.controller";
import { KeyValue } from "@dataflow-core/engine/context";

/**
 * Used in clientside react app to control the flow execution of graph
 */
export class LocalExecutionController extends AbstractExecutionController {
    started = false;
    paused = false;

    start(executor: Executor, graph: AppConfig, params?: KeyValue): ExecutorReturn {
        this.started = true;
        return executor(this, graph, params).finally(() => this.clear());
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
        if (this.paused) {
            this.paused = false;
        }
        this.started = false;
        
        if (onCanceled) onCanceled();
    }
}