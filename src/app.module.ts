import { Module } from '@nestjs/common';
import { PaymentsModule } from './payments/payments.module';
import { TransportModule } from './transport/transport.module';

@Module({
  imports: [PaymentsModule, TransportModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
