import { Inject, Injectable, OnModuleDestroy } from "@nestjs/common";
import { NatsConnection, StringCodec, Subscription } from "nats";

@Injectable()
export class NatsService implements OnModuleDestroy {
    private readonly sc = StringCodec();
    private readonly subscriptions: Map<string, Subscription> = new Map();

    constructor(
        @Inject('NATS_CONNECTION') private readonly natsConnection: NatsConnection,
    ) {}

    async publish<T>(subject: string, data: T): Promise<boolean> {
        try {
            this.natsConnection.publish(subject, JSON.stringify(data));
            console.log(`Published to ${subject}:`, data);
            return true;
        } catch (error) {
            console.error(`Failed to publish to ${subject}:`, error);
            return false;
        }
    }

    unsubscribe(subject: string): void {
        try {
            if (this.subscriptions.has(subject)) {
                this.subscriptions.get(subject)!.unsubscribe();
                this.subscriptions.delete(subject);
                console.log(`Unsubscribed from ${subject}`);
            }
        } catch (error) {
            console.error(`Failed to unsubscribe from ${subject}:`, error);
        }
    }

    async subscribe<T>(subject: string, callback: (msg: T) => void): Promise<void> {
        try {
            this.subscriptions.set(subject, this.natsConnection.subscribe(subject, {
                callback: (err, msg) => {
                    if (err) {
                        console.error(`Error receiving message from ${subject}:`, err);
                        return;
                    }
                    try {
                        const data = JSON.parse(this.sc.decode(msg.data)) as T;
                        console.log(`Received message from ${subject}:`, data);
                        callback(data);

                        // Send manual response (if inbox is set)
                        if (msg.reply) {
                            this.natsConnection.publish(msg.reply, this.sc.encode(JSON.stringify(true)));
                        }
                    } catch (parseError) {
                        console.error(`Failed to parse message from ${subject}:`, parseError);
                    }
                },
            }));
        } catch (error) {
            console.error(`Failed to subscribe to ${subject}:`, error);
        }
    }

    async onModuleDestroy() {
        if (this.natsConnection) {
            await this.natsConnection.drain().then(() => {
                console.log('NATS connection drained');
            }).catch(err => {
                console.error('Error draining NATS connection:', err);
            });

            await this.natsConnection.close().then(() => {
                console.log('NATS connection closed');
            }).catch(err => {
                console.error('Error closing NATS connection:', err);
            });
        }
    }
}
