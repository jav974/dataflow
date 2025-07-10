import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
        transport: Transport.NATS,
        options: {
            servers: [process.env.NATS_SERVER_URL as string],
        },
    });

    await app.listen().then(() => {
        console.log('✅ Runner microservice is running');
    }).catch((error) => {
        console.error('❌ Failed to start runner microservice:', error);
    });
}
bootstrap();
