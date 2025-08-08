import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { NatsService } from '@dataflow-ide/dataflow-nats';
import {
  AppConfig,
  GraphResult,
  KeyValue,
  Log,
} from '@dataflow-ide/dataflow-core';
import { fork, ChildProcess } from 'child_process';
import * as path from 'node:path';
import {
  AppConfigClass,
  AppConfigModel,
  dbConnect,
} from '@dataflow-ide/dataflow-backend';
import { DocumentType } from '@typegoose/typegoose';

type WorkerMessage = {
  type:
    | 'start'
    | 'executed'
    | 'error'
    | 'writeTo'
    | 'pause'
    | 'resume'
    | 'cancel';
  payload?: any;
};

@Controller()
export class AppController {
  private activeChildren = new Map<string, ChildProcess>();

  constructor(private readonly natsService: NatsService) {}

  @MessagePattern({ cmd: 'startSync' })
  async startSync(data: {
    graph: AppConfig | string;
    params?: KeyValue;
  }): Promise<GraphResult | undefined> {
    const { graph: graphOrGraphId, params } = data;
    const graph = await this.getGraph(graphOrGraphId);

    if (!graph) {
      return undefined;
    }

    console.log(`🚀 Received startSync command`);

    const child = this.getChildProcess();

    const result = await new Promise<GraphResult | undefined>((resolve) => {
      child.on('message', (msg: WorkerMessage) => {
        if (msg.type === 'executed') {
          console.log(`✅ Graph executed`);
          resolve(msg.payload);
        } else if (msg.type === 'error') {
          console.error(`❌ Worker error:`, msg.payload);
          resolve(undefined);
        }
      });

      child.once('exit', (code) => {
        console.log(`🧹 Child exited with code ${code}`);
        resolve(undefined);
      });

      child.send({ type: 'start', graph, params });
    });

    return result;
  }

  @MessagePattern({ cmd: 'start' })
  async start(data: {
    socketId: string;
    graph: AppConfig | string;
    params?: KeyValue;
  }): Promise<boolean> {
    const { socketId, graph: graphOrGraphId, params } = data;

    if (this.activeChildren.has(socketId)) {
      console.warn(`⚠️ Socket ${socketId} already has an active child process`);
      return false;
    }

    const graph = await this.getGraph(graphOrGraphId);

    if (!graph) {
      return false;
    }

    console.log(`🚀 Received start command for socketId=${socketId}`);

    const child = this.getChildProcess();

    child.stdout?.on('data', (data: Buffer) => {
      console.log('[runner runtime stdout]:', data);
      this.publishToSocket(socketId, 'writeTo', {
        type: 'debug',
        message: data.toString(),
        createdAt: Date.now(),
      } as Log);
    });

    child.stderr?.on('data', (data: Buffer) => {
      console.error('[runner runtime stderr]:', data);
      this.publishToSocket(socketId, 'writeTo', {
        type: 'error',
        message: data.toString(),
        createdAt: Date.now(),
      } as Log);
    });

    this.activeChildren.set(socketId, child);

    // Set up event bridge: child → NATS
    child.on('message', (msg: WorkerMessage) => {
      switch (msg.type) {
        case 'start':
          console.log(`⚡ Worker started for socket ${socketId}`);
          break;
        case 'writeTo':
          this.publishToSocket(socketId, 'writeTo', msg.payload as Log);
          break;
        case 'executed':
          console.log(`✅ Graph executed for socket ${socketId}`);
          this.publishToSocket(socketId, 'executed', {
            result: msg.payload as GraphResult,
            error: null,
          });
          break;
        case 'error':
          console.error(`❌ Worker error for socket ${socketId}:`, msg.payload);
          this.publishToSocket(socketId, 'executed', {
            result: null,
            error: msg.payload as string,
          });
          break;
      }
    });

    child.once('exit', (code) => {
      console.log(`🧹 Child exited for socket ${socketId} with code ${code}`);
      this.cleanup(socketId);
    });

    // Setup NATS control messages → child
    await this.natsService.subscribe(`pause.${socketId}`, () => {
      console.log(`⏸️ Pause requested for socket ${socketId}`);
      child.send({ type: 'pause' });
    });

    await this.natsService.subscribe(`resume.${socketId}`, () => {
      console.log(`▶️ Resume requested for socket ${socketId}`);
      child.send({ type: 'resume' });
    });

    await this.natsService.subscribe(`cancel.${socketId}`, () => {
      console.log(`🛑 Cancel requested for socket ${socketId}`);
      child.send({ type: 'cancel' });

      setTimeout(() => {
        if (this.activeChildren.has(socketId)) {
          console.warn(
            `⏱️ Forcefully terminating child for socket ${socketId}`,
          );
          child.kill();
        }
      }, 5000); // 5s grace period
    });

    // Kick off the job
    child.send({ type: 'start', graph, params });

    return true;
  }

  private getChildProcess(): ChildProcess {
    const childPath = path.resolve(
      __dirname,
      '../../../libs/dataflow-core/dist/runtime/childprocess.js',
    );

    const child = fork(childPath, [], {
      stdio: ['pipe', 'pipe', 'pipe', 'ipc'],
    });

    return child;
  }

  private async publishToSocket(
    socketId: string,
    channel: string,
    payload: any,
  ) {
    await this.natsService.publish(`${channel}.${socketId}`, payload);
  }

  private cleanup(socketId: string) {
    this.natsService.unsubscribe(`pause.${socketId}`);
    this.natsService.unsubscribe(`resume.${socketId}`);
    this.natsService.unsubscribe(`cancel.${socketId}`);
    this.activeChildren.delete(socketId);
  }

  private async getGraph(
    graphOrGraphId: string | AppConfig,
  ): Promise<AppConfig | null> {
    if (typeof graphOrGraphId === 'string') {
      return this.getGraphById(graphOrGraphId);
    }
    return graphOrGraphId;
  }

  private async getGraphById(graphId: string): Promise<AppConfig | null> {
    try {
      await dbConnect(process.env.MONGO_URI);
      const config =
        await AppConfigModel.findOne<DocumentType<AppConfigClass> | null>({
          id: graphId,
        }).exec();
      if (!config) {
        console.error(`❌ Graph with id ${graphId} not found`);
        return null;
      }
      return config.toObject() as AppConfig;
    } catch (error) {
      console.error('❌ Failed to connect to database:', error);
      return null;
    }
  }
}
