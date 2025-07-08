import { Callback, Executor, ExecutorReturn, IExecutionController } from "@dataflow-core/controllers/base.controller";
import { AppConfig } from "../config/schema";
import { KeyValue } from "./context";
import { LocalExecutionController } from "@dataflow-core/controllers/local.controller";
import { RemoteExecutionController } from "@dataflow-core/controllers/remote.controller";
import { ClientExecutionController } from "@dataflow-core/controllers/client.controller";

/**
 * Used in clientside react app to control flow execution of graph
 * 
 * Returns the appropriate controller based on user preference:
 *  - LocalExecutionController when mode = "local"
 *  - RemoteExecutionController when mode = "remote"
 */
class ExecutionController implements IExecutionController {
    private controller: IExecutionController | null = null;
    private mode: "local" | "remote" | "react" = "react";

    private getController() {
        if (this.controller) return this.controller;

        switch (this.mode) {
            case 'local':
                this.controller = new LocalExecutionController();
                break ;
            case 'remote':
                this.controller = new RemoteExecutionController();
                break ;
            case 'react':
                this.controller = new ClientExecutionController();
                break ;
        }

        return this.controller;
    }

    get started() { return this.getController().started; }
    get paused() { return this.getController().paused; }

    setMode(mode: "local" | "remote" | "react") {
        if (mode !== this.mode) {
            this.mode = mode;
            this.controller = null;
        }
    }

    start(executor: Executor, graph: AppConfig, params?: KeyValue): ExecutorReturn {
        return this.getController().start(executor, graph, params);
    }

    pause(onPaused?: Callback): void {
        this.getController().pause(onPaused);
    }

    resume(onResumed?: Callback): void {
        this.getController().resume(onResumed);
    }

    cancel(onCanceled?: Callback): void {
        this.getController().cancel(onCanceled);
    }

    clear(): void {
        this.getController().clear();
    }

    async waitIfPaused(): Promise<void> {
        return this.getController().waitIfPaused();
    }
}

const controller = new ExecutionController();

export { controller }
