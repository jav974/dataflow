import { Module } from '@nestjs/common';
import { NatsModule } from '@dataflow-ide/dataflow-nats';
import { AppController } from './app.controller';
import { ConfigModule } from '@nestjs/config';

@Module({
    controllers: [AppController],
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        NatsModule
    ]
})
export class AppModule {}
