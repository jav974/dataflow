import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { NatsService } from '@dataflow-ide/dataflow-nats';
import { AppConfig, KeyValue, Log } from '@dataflow-ide/dataflow-core';
import { fork, ChildProcess } from 'child_process';
import * as path from 'node:path';

@Controller()
export class AppController {
    private activeChildren = new Map<string, ChildProcess>();

    constructor(private readonly natsService: NatsService) {}

    @MessagePattern({ cmd: 'start' })
    start(data: { socketId: string; graph: AppConfig; params?: KeyValue }): boolean {
        const { socketId, graph, params } = data;

        console.log(`🚀 Received start command for socketId=${socketId}`);

        const childPath = path.resolve(
            __dirname,
            '../../../libs/dataflow-core/dist/runtime/childprocess.js'
        );

        const child = fork(childPath, [], {
            stdio: ['pipe', 'pipe', 'pipe', 'ipc']
        });

        child.stdout?.on('data', (data: Buffer) => {
            console.log(`[runner runtime stdout]: ${data}` + typeof data);
            publish('writeTo', {type: 'debug', message: data.toString(), createdAt: Date.now()} as Log);
        });

        child.stderr?.on('data', (data: Buffer) => {
            console.error(`[runner runtime stderr]: ${data}`);
            publish('writeTo', {type: 'error', message: data.toString(), createdAt: Date.now()} as Log);
        });

        const publish = (channel: string, payload: any) => {
            this.natsService.publish(`${channel}.${socketId}`, payload);
        };

        this.activeChildren.set(socketId, child);

        // Set up event bridge: child → NATS
        child.on('message', (msg: any) => {
            switch (msg.type) {
                case 'start':
                    console.log(`⚡ Worker started for socket ${socketId}`);
                    break;
                case 'writeTo':
                    publish('writeTo', msg.payload);
                    break;
                case 'executed':
                    console.log(`✅ Graph executed for socket ${socketId}`);
                    publish('executed', { result: msg.payload, error: null });
                    break;
                case 'error':
                    console.error(`❌ Worker error for socket ${socketId}:`, msg.payload);
                    publish('executed', { result: null, error: msg.payload });
                    break;
            }
        });

        child.on('exit', (code) => {
            console.log(`🧹 Child exited for socket ${socketId} with code ${code}`);
            this.cleanup(socketId);
        });

        // Setup NATS control messages → child
        this.natsService.subscribe(`pause.${socketId}`, () => {
            console.log(`⏸️ Pause requested for socket ${socketId}`);
            child.send({ type: 'pause' });
        });

        this.natsService.subscribe(`resume.${socketId}`, () => {
            console.log(`▶️ Resume requested for socket ${socketId}`);
            child.send({ type: 'resume' });
        });

        this.natsService.subscribe(`cancel.${socketId}`, () => {
            console.log(`🛑 Cancel requested for socket ${socketId}`);
            child.send({ type: 'cancel' });
        });

        // Kick off the job
        child.send({ type: 'start', graph, params });

        return true;
    }

    private cleanup(socketId: string) {
        this.natsService.unsubscribe(`pause.${socketId}`);
        this.natsService.unsubscribe(`resume.${socketId}`);
        this.natsService.unsubscribe(`cancel.${socketId}`);
        this.activeChildren.delete(socketId);
    }
}
