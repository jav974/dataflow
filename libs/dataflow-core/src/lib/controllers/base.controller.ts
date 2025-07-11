import { AppConfig } from "@dataflow-core/config/schema";
import { KeyValue } from "@dataflow-core/engine/context";
import { GraphResult } from "@dataflow-core/engine/types";

export type Callback = () => void;
export type ExecutorReturn = Promise<GraphResult | undefined>;
export type Executor = (controller: IExecutionController, graph: AppConfig, params?: KeyValue) => ExecutorReturn;
export type RemoteExecutionData = {completed: boolean, result: GraphResult | undefined, error?: string};

export interface IExecutionController {
    started: boolean;
    paused: boolean;
    start(graph: AppConfig, params?: KeyValue): ExecutorReturn;
    pause(onPaused?: Callback): void;
    resume(onResumed?: Callback): void;
    cancel(onCanceled?: Callback): void;
    clear(): void;
    waitIfPaused(): Promise<void>;
    wait(timeout: number): Promise<void>;
}

export abstract class AbstractExecutionController implements IExecutionController {
    started = false;
    paused = false;

    abstract start(graph: AppConfig, params?: KeyValue): ExecutorReturn;
    abstract pause(onPaused?: Callback): void;
    abstract resume(onResumed?: Callback): void;
    abstract cancel(onCanceled?: Callback): void;
    abstract clear(): void;
    
    async waitIfPaused(): Promise<void> {
        while (this.paused) {
            await this.wait();
        }
    }

    async wait(timeout: number = 50): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, timeout));
    }
}