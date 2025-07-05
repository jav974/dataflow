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
import { NatsService } from '@dataflow-ide/dataflow-nats';

@WebSocketGateway({
    path: '/ws',
    cors: {
        origin: '*',
    },
})
export class WSGateway implements OnGatewayDisconnect, OnGatewayConnection {
    @WebSocketServer()
    server: Server<ClientToServerEvents, ServerToClientEvents>;

    clientToExecutor = new Map<string, string>();
    executorToClient = new Map<string, string>();

    private useNats: boolean = true; // Set to false to use websocket directly

    constructor(
        @Inject('RUNNER_PACKAGE') private readonly client: ClientNats,
        @Inject() private readonly natsService: NatsService
    ) {}

    handleConnection(
        client: Socket<ClientToServerEvents, ServerToClientEvents>,
    ) {
        console.log(`Client connected: ${client.id}`);
        client.emit('hello', client.id);
    }

    @SubscribeMessage('registerExecutor')
    registerExecutor(
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
        data: { executorId: string; clientSocketId: string },
    ): AckResponse {
        console.log(
            'Register',
            data.executorId,
            socket.id,
            'for client',
            data.clientSocketId,
        );
        this.clientToExecutor.set(data.clientSocketId, socket.id);
        this.executorToClient.set(socket.id, data.clientSocketId);
        // Acknowledge the registration
        return { status: 'ok' };
    }

    @SubscribeMessage('start')
    async start(
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
        data: { graph: AppConfig, params?: KeyValue },
    ): Promise<AckResponse> {
        try {
            const payload = {...data, socketId: socket.id};

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
        const executorSocketId = this.clientToExecutor.get(socket.id);
        if (executorSocketId) {
            this.server.to(executorSocketId).emit('paused');
        }
        
        if (this.useNats) {
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

        return { status: 'ok' }; // If not using NATS, just acknowledge the pause
    }

    @SubscribeMessage('resume')
    async resume(
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    ): Promise<AckResponse> {
        console.log('Received resume from react client');
        const executorSocketId = this.clientToExecutor.get(socket.id);
        if (executorSocketId) {
            this.server.to(executorSocketId).emit('resumed');
        }

        if (this.useNats) {
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

        return { status: 'ok' }; // If not using NATS, just acknowledge the resume
    }

    @SubscribeMessage('cancel')
    async cancel(
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    ): Promise<AckResponse> {
        console.log('Received cancel from react client');
        const executorSocketId = this.clientToExecutor.get(socket.id);
        if (executorSocketId) {
            this.server.to(executorSocketId).emit('canceled');
        }

        if (this.useNats) {
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

        return { status: 'ok' }; // If not using NATS, just acknowledge the cancel
    }

    @SubscribeMessage('writeTo')
    writeTo(
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
        data: Log,
    ): AckResponse {
        console.log(
            'Received writeTo from executor',
            socket.id,
            'with data',
            data,
        );
        const clientSocketId = this.executorToClient.get(socket.id);
        if (clientSocketId) {
            this.server.to(clientSocketId).emit('writeTo', data);
        }
        // Acknowledge the write
        return { status: 'ok' };
    }

    handleDisconnect(
        client: Socket<ClientToServerEvents, ServerToClientEvents>,
    ) {
        console.log(`Client disconnected: ${client.id}`);

        this.natsService.unsubscribe(`executed.${client.id}`);
        this.natsService.unsubscribe(`writeTo.${client.id}`);

        // Remove from executorToClient map if present
        const clientSocketId = this.executorToClient.get(client.id);
        if (clientSocketId) {
            this.executorToClient.delete(client.id);
            this.clientToExecutor.delete(clientSocketId);
            console.log(
                `Cleaned up executor mapping for client ${clientSocketId}`,
            );
        } else {
            // Remove from clientToExecutor map if present
            const executorSocketId = this.clientToExecutor.get(client.id);
            if (executorSocketId) {
                this.clientToExecutor.delete(client.id);
                this.executorToClient.delete(executorSocketId);
                console.log(
                    `Cleaned up client mapping for executor ${executorSocketId}`,
                );
            }
        }
    }
}
