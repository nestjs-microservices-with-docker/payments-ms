import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';
import { Request, Response } from 'express';
// import { envs } from 'src/config';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-payment-session')
  create(@Body() createPaymentSessionDto: CreatePaymentSessionDto) {
    return this.paymentsService.create(createPaymentSessionDto);
  }

  @Post('webhook')
  // eslint-disable-next-line @typescript-eslint/require-await
  async stripeWebhook(@Req() req: Request, @Res() res: Response) {
    console.log('Webhook called');
    return this.paymentsService.stripeWebhook(req, res);
  }

  @HttpCode(HttpStatus.OK)
  @Get('success')
  success() {
    return 'Success';
  }

  @HttpCode(HttpStatus.OK)
  @Get('cancel')
  cancel() {
    return 'Cancel';
  }
}
