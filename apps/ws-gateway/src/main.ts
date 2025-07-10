import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    await app.listen(process.env.WS_GATEWAY_PORT ?? 3001);
    console.log(`WS Gateway is running on: ${await app.getUrl()}`);
}
void bootstrap();
