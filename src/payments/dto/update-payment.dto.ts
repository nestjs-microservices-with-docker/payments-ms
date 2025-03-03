import { PartialType } from '@nestjs/mapped-types';
import { CreatePaymentSessionDto } from './create-payment-session.dto';

export class UpdatePaymentDto extends PartialType(CreatePaymentSessionDto) {}
