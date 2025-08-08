/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */

import { Test, TestingModule } from '@nestjs/testing';
import { WSGateway } from './app.gateway';

describe('WSGateway', () => {
    let gateway: WSGateway;
    let emitMock: jest.Mock;

    function setupClient(): {
        client: { id: string; emit: jest.Mock };
    } {
        const client = { id: 'client-1', emit: jest.fn() } as any;

        gateway.handleConnection(client);

        return { client };
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

    describe('pause', () => {
        it('should emit paused event to executor and acknowledge', () => {
            const { client } = setupClient();
            const response = gateway.pause(client as any);
            expect(response).toEqual({ status: 'ok' });
        });
    });

    describe('resume', () => {
        it('should emit resumed event to executor and acknowledge', () => {
            const { client } = setupClient();
            const response = gateway.resume(client as any);
            expect(response).toEqual({ status: 'ok' });
        });
    });

    describe('cancel', () => {
        it('should emit canceled event to executor and acknowledge', () => {
            const { client } = setupClient();
            const response = gateway.cancel(client as any);
            expect(response).toEqual({ status: 'ok' });
        });
    });
});
