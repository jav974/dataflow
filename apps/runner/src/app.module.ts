import { Module } from '@nestjs/common';
import { NatsModule } from '@dataflow-ide/dataflow-nats';
import { AppController } from './app.controller';

@Module({
    controllers: [AppController],
    imports: [NatsModule]
})
export class AppModule {}
