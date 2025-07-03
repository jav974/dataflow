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
} from '@dataflow-ide/dataflow-core';

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

    @SubscribeMessage('pause')
    pause(
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    ): AckResponse {
        console.log('Received pause from react client');
        const executorSocketId = this.clientToExecutor.get(socket.id);
        if (executorSocketId) {
            this.server.to(executorSocketId).emit('paused');
        }
        // Acknowledge the pause
        return { status: 'ok' };
    }

    @SubscribeMessage('resume')
    resume(
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    ): AckResponse {
        console.log('Received resume from react client');
        const executorSocketId = this.clientToExecutor.get(socket.id);
        if (executorSocketId) {
            this.server.to(executorSocketId).emit('resumed');
        }
        // Acknowledge the resume
        return { status: 'ok' };
    }

    @SubscribeMessage('cancel')
    cancel(
        socket: Socket<ClientToServerEvents, ServerToClientEvents>,
    ): AckResponse {
        console.log('Received cancel from react client');
        const executorSocketId = this.clientToExecutor.get(socket.id);
        if (executorSocketId) {
            this.server.to(executorSocketId).emit('canceled');
        }
        // Acknowledge the cancel
        return { status: 'ok' };
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
