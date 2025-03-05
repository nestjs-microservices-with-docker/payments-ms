/* eslint-disable no-case-declarations */
import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { CreatePaymentSessionDto } from './dto/create-payment-session.dto';
import { envs, NATS_SERVICE } from '../config';
import { Request, Response } from 'express';
import { ClientProxy } from '@nestjs/microservices';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeSecretKey);
  private readonly logger = new Logger('PaymentsMicroservice');

  constructor(@Inject(NATS_SERVICE) private readonly client: ClientProxy) {}

  async create(createPaymentSessionDto: CreatePaymentSessionDto) {
    const { currency, items, orderId } = createPaymentSessionDto;

    const line_items = items.map((item) => ({
      price_data: {
        currency: currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      payment_intent_data: {
        metadata: {
          orderId,
        },
      },
      line_items,
      mode: 'payment',
      success_url: envs.paymentsSuccessUrl,
      cancel_url: envs.paymentsCancelUrl,
    });
    return {
      cancel_url: session.cancel_url,
      success_url: session.success_url,
      url: session.url,
    };
  }

  stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature']!;

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        envs.stripeEndpointSecret,
      );
      console.log(event);
    } catch (error) {
      return res.status(400).send(`Webhook Error: ${error}`);
    }

    switch (event.type) {
      case 'charge.succeeded':
        // console.log('Charge succeeded');
        // console.log(event.data.object.metadata);

        const chargeSucceeded = event.data.object;

        const payload = {
          stripePaymentId: chargeSucceeded.id,
          orderId: chargeSucceeded.metadata.orderId,
          receiptUrl: chargeSucceeded.receipt_url,
        };
        this.logger.log(payload);
        this.client.emit({ cmd: 'charge.succeeded' }, payload);

        break;
      default:
        console.log(`Unhandled event type ${event.type}`);
    }
    return res.status(200).json({ received: true });
  }
}
