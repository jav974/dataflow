import { connect, NatsConnection } from 'nats';
import { NATS_CONNECTION } from './nats.constants';

export const NatsConnectionProvider = {
  provide: NATS_CONNECTION,
  useFactory: async (): Promise<NatsConnection> => {
    const nc = await connect({ servers: ['nats://localhost:4222'] });
    console.log('✅ NATS connection established in provider');
    return nc;
  },
};