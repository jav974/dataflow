import { io } from "socket.io-client";
import { AckResponse } from "./socket-types";

export class ReliableEmitter<T> {
    private queue: T[] = [];
    private isSending = false;

    constructor(
        private socket: ReturnType<typeof io>,
        private eventName: string,
        private getPayloadId: (payload: T) => string,
        private maxRetries = 3,
        private ackTimeout = 1000
    ) {}

    enqueue(payload: T) {
        this.queue.push(payload);
        this.processQueue();
    }

    private processQueue() {
        if (this.isSending || this.queue.length === 0 || !this.socket.connected) return;

        const payload = this.queue[0];
        let attempts = 0;

        const trySend = () => {
            this.isSending = true;
            this.socket
                .timeout(this.ackTimeout)
                .emit(this.eventName, payload, (err: Error | null, ack: AckResponse) => {
                    if (err || ack?.status !== "ok") {
                        if (++attempts <= this.maxRetries) {
                            console.warn(`Retrying ${this.eventName} [${this.getPayloadId(payload)}]`);
                            return setTimeout(trySend, 500);
                        } else {
                            console.error(`Failed to deliver ${this.eventName} after ${this.maxRetries} attempts`);
                            this.queue.shift();
                            this.isSending = false;
                            return this.processQueue();
                        }
                    }

                    this.queue.shift();
                    this.isSending = false;
                    this.processQueue();
                });
        };

        trySend();
    }

    isEmpty() {
        return this.queue.length === 0;
    }
}
