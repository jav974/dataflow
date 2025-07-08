import { AbstractExecutionController, Callback, ExecutorReturn, RemoteExecutionData } from "./base.controller";
import { eventBus } from "@dataflow-core/events/events";
import { AppConfig } from "@dataflow-core/config/schema";
import { KeyValue } from "@dataflow-core/engine/context";
import { spawnWorker } from "@dataflow-core/spawn";
import { Log } from "@dataflow-core/engine/types";

export class ClientExecutionController extends AbstractExecutionController {
    private worker: Worker | null = null;
    private data: RemoteExecutionData | undefined;

    constructor() {
        super();
    }

    handleMessage(event: MessageEvent<any>) {
        const {data} = event;

        switch (data.type) {
            case 'start':
                this.started = true;
                break ;
            case 'pause':
                this.paused = true;
                break ;
            case 'resume':
                this.paused = false;
                break ;
            case 'cancel':
                eventBus.emit('io_write', {type: 'error', message: 'Execution canceled', createdAt: Date.now()} as Log);
                this.data = {completed: true, result: undefined, error: undefined};
                break ;
            case 'writeTo':
                eventBus.emit('io_write', data.payload as Log);
                break ;
            case 'executed':
                this.data = {result: data.payload, completed: true, error: undefined};
                break ;
        }
    }

    async start(graph: AppConfig, params?: KeyValue): ExecutorReturn {
        this.started = false;
        this.data = {completed: false, result: undefined, error: undefined};
        this.worker = spawnWorker();
        this.worker.onmessage = this.handleMessage.bind(this);
        this.worker.postMessage({type: 'start', graph, params});

        while (!this.data.completed) {
            await this.wait();
        }

        this.clear();

        return this.data.result;
    }

    async pause(onPaused?: Callback): Promise<void> {
        if (this.worker) {
            this.worker.postMessage({type: 'pause'});
            while (!this.paused) await this.wait();
            if (onPaused) onPaused();
        }
    }

    async resume(onResumed?: Callback): Promise<void> {
        if (this.worker) {
            this.worker.postMessage({type: 'resume'});
            while (this.paused) await this.wait();
            if (onResumed) onResumed();
        }
    }

    async cancel(onCanceled?: Callback): Promise<void> {
        if (this.worker) {
            this.worker.postMessage({type: 'cancel'});
            while (this.started) await this.wait();
            if (onCanceled) onCanceled();
        }
    }

    clear() {
        this.started = false;
        this.paused = false;

        if (this.worker) {
            this.worker.terminate();
            this.worker = null;
        }
    }
}