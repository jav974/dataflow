/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { WSGateway } from './app.gateway';
import { Log } from '@dataflow-ide/dataflow-core';

describe('WSGateway', () => {
    let gateway: WSGateway;
    let emitMock: jest.Mock;

    function setupClientExecutorPair(): {
        client: { id: string; emit: jest.Mock };
        executor: { id: string; emit: jest.Mock };
    } {
        const client = { id: 'client-1', emit: jest.fn() } as any;
        const executor = { id: 'executor-1', emit: jest.fn() } as any;

        gateway.handleConnection(client);
        gateway.handleConnection(executor);
        gateway.registerExecutor(executor, {
            executorId: 'executor-1',
            clientSocketId: 'client-1',
        });

        return { client, executor };
    }

    beforeEach(async () => {
        emitMock = jest.fn();

        const module: TestingModule = await Test.createTestingModule({
            providers: [WSGateway],
        }).compile();

        gateway = module.get<WSGateway>(WSGateway);
        gateway.server = {
            to: jest.fn().mockReturnValue({ emit: emitMock }),
        } as any;
    });

    it('should be defined', () => {
        expect(gateway).toBeDefined();
    });

    describe('handleConnection', () => {
        it('should log client connection and emit hello event', () => {
            const client = { id: 'test-client-id', emit: jest.fn() };
            console.log = jest.fn();
            gateway.handleConnection(client as any);
            expect(client.emit).toHaveBeenCalledWith('hello', client.id);
            expect(console.log).toHaveBeenCalledWith(
                `Client connected: ${client.id}`,
            );
        });
    });

    describe('registerExecutor', () => {
        it('should register executor and acknowledge', () => {
            const socket = { id: 'test-socket-id' } as any;
            const data = {
                executorId: 'executor-1',
                clientSocketId: 'client-1',
            };
            const response = gateway.registerExecutor(socket, data);
            expect(response).toEqual({ status: 'ok' });
        });
    });

    describe('pause', () => {
        it('should emit paused event to executor and acknowledge', () => {
            const { client } = setupClientExecutorPair();
            const response = gateway.pause(client as any);
            expect(response).toEqual({ status: 'ok' });
            expect(gateway.server.to('executor-1').emit).toHaveBeenCalledWith(
                'paused',
            );
        });
    });

    describe('resume', () => {
        it('should emit resumed event to executor and acknowledge', () => {
            const { client } = setupClientExecutorPair();
            const response = gateway.resume(client as any);
            expect(response).toEqual({ status: 'ok' });
            expect(gateway.server.to('executor-1').emit).toHaveBeenCalledWith(
                'resumed',
            );
        });
    });

    describe('cancel', () => {
        it('should emit canceled event to executor and acknowledge', () => {
            const { client } = setupClientExecutorPair();
            const response = gateway.cancel(client as any);
            expect(response).toEqual({ status: 'ok' });
            expect(gateway.server.to('executor-1').emit).toHaveBeenCalledWith(
                'canceled',
            );
        });
    });

    describe('writeTo', () => {
        it('should emit writeTo event to client and acknowledge', () => {
            const { executor } = setupClientExecutorPair();
            const data: Log = {
                type: 'log',
                createdAt: 0,
                message: 'test message',
            };

            const response = gateway.writeTo(executor as any, data);
            expect(response).toEqual({ status: 'ok' });
            expect(gateway.server.to('client-1').emit).toHaveBeenCalledWith(
                'writeTo',
                data,
            );
        });
    });

    describe('handleDisconnect', () => {
        it('should remove mappings on executor disconnect', () => {
            const { executor } = setupClientExecutorPair();
            gateway.handleDisconnect(executor as any);
            expect(gateway.executorToClient.has(executor.id)).toBe(false);
            expect(gateway.clientToExecutor.has('client-1')).toBe(false);
        });

        it('should clean up mappings on client disconnect', () => {
            const { client, executor } = setupClientExecutorPair();
            gateway.handleDisconnect(client as any);
            expect(gateway.clientToExecutor.has(client.id)).toBe(false);
            expect(gateway.executorToClient.has(executor.id)).toBe(false);
        });
    });

    it('should not throw if client is not mapped to any executor', () => {
        const orphanClient = { id: 'ghost-client' } as any;
        const response = gateway.pause(orphanClient);
        expect(response).toEqual({ status: 'ok' }); // Silent no-op or consider throwing
        expect(emitMock).not.toHaveBeenCalled();
    });
});
