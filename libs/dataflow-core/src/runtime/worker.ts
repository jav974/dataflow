import { LocalExecutionController } from "@dataflow-core/controllers/local.controller";
import { AppConfig } from "../lib/config/schema";
import { runGraphWithController } from "../lib/engine/graph";
import { GraphResult, Log } from "../lib/engine/types";
import { eventBus } from "../lib/events/events";

type WorkerMessage =
  | { type: 'start'; graph: AppConfig; params?: Record<string, any> }
  | { type: 'pause' }
  | { type: 'resume' }
  | { type: 'cancel' };

class InterpreterWorker {
    private controller = new LocalExecutionController();

    constructor() {
        console.log("Interpreter built");
        self.onmessage = this.handleMessage.bind(this);
        this.setupLogForwarding();
    }

    private emitToHost(type: string, payload: any = undefined) {
        postMessage({ type, payload });
    }

    private forwardIOWrites = (log: Log) => {
        this.emitToHost('writeTo', log);
    };

    async handleMessage(event: MessageEvent<WorkerMessage>) {
        const msg = event.data;

        switch (msg.type) {
            case 'start':
                this.emitToHost('start');
                await this.run(msg.graph, msg.params);
                break;
            case 'pause':
                this.controller.pause(() => this.emitToHost('pause'));
                break;
            case 'resume':
                this.controller.resume(() => this.emitToHost('resume'));
                break;
            case 'cancel':
                this.emitToHost('cancel');
                this.controller.cancel();
                break;
        }
    }

    async run(graph: AppConfig, params?: Record<string, any>) {
        try {
            this.controller.started = true;
            const result: GraphResult | undefined = await runGraphWithController(this.controller, graph, params);+
            this.emitToHost('executed', result);
        } catch (err) {
            this.emitToHost('error', (err as Error).message);
        }
    }

    setupLogForwarding() {
        eventBus.on('io_write', this.forwardIOWrites);
    }
}

new InterpreterWorker();