import { connect, NatsConnection } from 'nats';
import { NATS_CONNECTION } from './nats.constants';

export const NatsConnectionProvider = {
    provide: NATS_CONNECTION,
    useFactory: async (): Promise<NatsConnection> => {
        const nc = await connect({ servers: [process.env.NATS_SERVER_URL as string] });
        console.log('✅ NATS connection established in provider');
        return nc;
    },
};