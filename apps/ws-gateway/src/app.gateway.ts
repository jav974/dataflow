import {
    OnGatewayDisconnect,
    OnGatewayConnection,
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import {
    ServerToClientEvents,
    ClientToServerEvents,
    AckResponse,
    Log,
    AppConfig,
    KeyValue,
} from '@dataflow-ide/dataflow-core';
import { Inject } from '@nestjs/common';
import { ClientNats } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { NATS_CLIENT, NatsService } from '@dataflow-ide/dataflow-nats';

@WebSocketGateway({
    path: '/ws',
    cors: {
        origin: '*',
    },
})
export class WSGateway implements OnGatewayDisconnect, OnGatewayConnection {
    @WebSocketServer()
    server!: Server<ClientToServerEvents, ServerToClientEvents>;

    constructor(
        @Inject(NATS_CLIENT) private readonly client: ClientNats,
        private readonly natsService: NatsService
    ) {}

    handleConnection(
        client: Socket<ClientToServerEvents, ServerToClientEvents>,
    ) {
        console.log(`Client connected: ${client.id}`);
        client.emit('hello', client.id);
    }

    @SubscribeMessage('start')
    async start(
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
        data: { graph: AppConfig, params?: KeyValue },
    ): Promise<AckResponse> {
        try {
            // const payload = {...data, socketId: socket.id};
            const payload = {...data, graph: data.graph.id, socketId: socket.id};

            this.natsService.subscribe(`executed.${socket.id}`, (result: { result: any, error?: string }) => {
                if (result.error) {
                    this.server.to(socket.id).emit('executed', { result: undefined, error: result.error });
                } else {
                    this.server.to(socket.id).emit('executed', { result: result.result, error: undefined });
                }
                this.natsService.unsubscribe(`executed.${socket.id}`);
                this.natsService.unsubscribe(`writeTo.${socket.id}`);
            });

            this.natsService.subscribe(`writeTo.${socket.id}`, (log: Log) => {
                this.server.to(socket.id).emit('writeTo', log);
            });

            const started = await firstValueFrom<boolean>(
                this.client.send({ cmd: 'start' }, payload)
            );

            console.log('✅ Received NATS response for start:', started);
            return { status: started ? 'ok' : 'error', message: 'Runner error on start' };
        } catch (error) {
            this.natsService.unsubscribe(`executed.${socket.id}`);
            this.natsService.unsubscribe(`writeTo.${socket.id}`);
            
            console.error('❌ Failed to start runner:', error);
            return { status: 'error', message: 'Runner did not acknowledge start' };
        }
    }

    @SubscribeMessage('pause')
    async pause(
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    ): Promise<AckResponse> {
        console.log('Received pause from react client');
        
        try {
            const paused = await firstValueFrom<boolean>(
                this.client.send('pause.' + socket.id, {})
            );

            console.log('✅ Received NATS response for pause:', paused);

            return { status: paused ? 'ok' : 'error', message: 'Runner error on pause' };
        } catch (error) {
            console.error('❌ Failed to pause runner:', error);
            return { status: 'error', message: 'Runner did not acknowledge pause' };
        }
    }

    @SubscribeMessage('resume')
    async resume(
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    ): Promise<AckResponse> {
        console.log('Received resume from react client');

        try {
            const resumed = await firstValueFrom<boolean>(
                this.client.send('resume.' + socket.id, {})
            );

            console.log('✅ Received NATS response for resume:', resumed);

            return { status: resumed ? 'ok' : 'error', message: 'Runner error on resume' };
        } catch (error) {
            console.error('❌ Failed to resume runner:', error);
            return { status: 'error', message: 'Runner did not acknowledge resume' };
        }
    }

    @SubscribeMessage('cancel')
    async cancel(
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    ): Promise<AckResponse> {
        console.log('Received cancel from react client');

        try {
            const canceled = await firstValueFrom<boolean>(
                this.client.send('cancel.' + socket.id, {})
            );

            console.log('✅ Received NATS response for cancel:', canceled);

            return { status: canceled ? 'ok' : 'error', message: 'Runner error on cancel' };
        } catch (error) {
            console.error('❌ Failed to cancel runner:', error);
            return { status: 'error', message: 'Runner did not acknowledge cancel' };
        }
    }

    handleDisconnect(client: Socket<ClientToServerEvents, ServerToClientEvents>) {
        console.log(`Client disconnected: ${client.id}`);

        this.natsService.unsubscribe(`executed.${client.id}`);
        this.natsService.unsubscribe(`writeTo.${client.id}`);
    }
}
