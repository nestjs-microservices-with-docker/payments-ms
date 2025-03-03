import 'dotenv/config';
import * as joi from 'joi';

interface EnvVars {
  PORT: number;
  NATS_SERVERS: string[];
  STRIPE_SECRET_KEY: string;
  PAYMENTS_SUCCESS_URL: string;
  PAYMENTS_CANCEL_URL: string;
  STRIPE_ENDPOINT_SECRET: string;
}

interface JoiResult {
  error?: joi.ValidationError;
  value: EnvVars;
}

const envsSchema = joi
  .object({
    PORT: joi.number().required(),
    STRIPE_SECRET_KEY: joi.string().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
    PAYMENTS_SUCCESS_URL: joi.string().required(),
    PAYMENTS_CANCEL_URL: joi.string().required(),
    STRIPE_ENDPOINT_SECRET: joi.string().required(),
  })
  .unknown(true);

const { error, value } = envsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
}) as JoiResult;

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const envs = {
  port: envVars.PORT,
  natsServers: envVars.NATS_SERVERS,
  stripeSecretKey: envVars.STRIPE_SECRET_KEY,
  paymentsSuccessUrl: envVars.PAYMENTS_SUCCESS_URL,
  paymentsCancelUrl: envVars.PAYMENTS_CANCEL_URL,
  stripeEndpointSecret: envVars.STRIPE_ENDPOINT_SECRET,
};
