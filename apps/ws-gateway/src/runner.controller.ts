import { GraphResult } from '@dataflow-ide/dataflow-core';
import { NATS_CLIENT } from '@dataflow-ide/dataflow-nats';
import { Controller, Post, Body, Inject } from '@nestjs/common';
import { ClientNats } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('runner')
export class RunnerController {
    constructor(@Inject(NATS_CLIENT) private readonly client: ClientNats) {}

    @Post()
    async run(
        @Body() payload: { graph: string; params?: Record<string, any> },
    ): Promise<undefined | Record<string, any>> {
        const result = await firstValueFrom<GraphResult | undefined>(
            this.client.send({ cmd: 'startSync' }, payload),
        );

        return result?.result;
    }
}
