import { Module } from '@nestjs/common';
import { ThrottlerModule } from 'nestjs-throttler';
import { AppService } from '../app.service';
import { AppController } from './app.controller';
import { DefaultController } from './default.controller';
import { LimitController } from './limit.controller';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      limit: 5,
      ttl: 60,
    }),
  ],
  controllers: [AppController, DefaultController, LimitController],
  providers: [AppService],
})
export class ControllerModule {}
