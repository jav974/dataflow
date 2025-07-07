
import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { NatsService } from './nats.service';
import { AppConfig, KeyValue, Graph, RunnerExecutionController, eventBus, Log } from '@dataflow-ide/dataflow-core';

@Controller()
export class NatsController {
    constructor(private readonly natsService: NatsService) {}

    @MessagePattern({ cmd: 'start' })
    start(data: {socketId: string, graph: AppConfig, params?: KeyValue}): boolean {
        console.log('Start command received with data:', data);

        const forwardIOWrites = (log: Log) => {
            this.natsService.publish(`writeTo.${data.socketId}`, log);
        };

        const graph = new Graph(data.socketId, new RunnerExecutionController());
        eventBus.on('io_write_' + data.socketId, forwardIOWrites);

        this.natsService.subscribe(`pause.${data.socketId}`, () => {
            console.log(`Pause command received for socket ${data.socketId}`);
            graph.controller.pause();
        });

        this.natsService.subscribe(`resume.${data.socketId}`, () => {
            console.log(`Resume command received for socket ${data.socketId}`);
            graph.controller.resume();
        });

        this.natsService.subscribe(`cancel.${data.socketId}`, () => {
            console.log(`Cancel command received for socket ${data.socketId}`);
            graph.controller.cancel();
        });

        graph
            .runGraph(data.graph, data.params)
            .then((result) => {
                if (result && result.graph) {
                    result.graph = undefined; // Clear the graph to avoid sending it back
                }

                console.log(`Graph execution completed for socket ${data.socketId}`, result);
                this.natsService.publish(`executed.${data.socketId}`, { result, error: undefined });
            })
            .catch((error) => {
                console.error(`Error executing graph for socket ${data.socketId}:`, error);
                this.natsService.publish(`executed.${data.socketId}`, { result: undefined, error: error.message });
            })
            .finally(() => {
                this.natsService.unsubscribe(`pause.${data.socketId}`);
                this.natsService.unsubscribe(`resume.${data.socketId}`);
                this.natsService.unsubscribe(`cancel.${data.socketId}`);
                eventBus.off('io_write_' + data.socketId, forwardIOWrites);
            });

        return true; // Return true to acknowledge the command
    }
}
