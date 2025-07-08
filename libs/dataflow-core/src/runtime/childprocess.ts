import { LocalExecutionController } from '@dataflow-core/controllers/local.controller';
import { AppConfig } from '@dataflow-core/config/schema';
import { runGraphWithController } from '@dataflow-core/engine/graph';
import { GraphResult, Log } from '@dataflow-core/engine/types';
import { eventBus } from '@dataflow-core/events/events';

type WorkerMessage =
    | { type: 'start'; graph: AppConfig; params?: Record<string, any> }
    | { type: 'pause' }
    | { type: 'resume' }
    | { type: 'cancel' };

class InterpreterChildProcess {
    private controller = new LocalExecutionController();

    constructor() {
        // console.log('[InterpreterChild] Initialized');
        process.on('message', this.handleMessage.bind(this));
        this.setupLogForwarding();
    }

    private emitToHost(type: string, payload: any = undefined) {
        process.send?.({ type, payload });
    }

    private forwardIOWrites = (log: Log) => {
        this.emitToHost('writeTo', log);
    };

    private async handleMessage(msg: WorkerMessage) {
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

    private async run(graph: AppConfig, params?: Record<string, any>) {
        try {
            this.controller.started = true;
            const result: GraphResult | undefined = await runGraphWithController(this.controller, graph, params);
            if (result) result.graph = undefined;
            this.emitToHost('executed', result);
        } catch (err) {
            this.emitToHost('error', (err as Error).message);
        } finally {
            process.exit(0);
        }
    }

    private setupLogForwarding() {
        eventBus.on('io_write', this.forwardIOWrites);
    }
}

new InterpreterChildProcess();