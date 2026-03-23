import {
  IsEnum,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

import { OrderType } from '../enums/order-type.enum';
import { PaymentProvider } from '../enums/payment-provider.enum';
import { BillingCycle } from '../../../company-verticals/enums/billing-cycle.enum';

export class CreateOrderDto {
  @IsOptional()
  @IsUUID()
  subscriptionId?: string;

  @IsUUID()
  companyVerticalId: string;

  @IsOptional()
  @IsUUID()
  planId?: string;

  @IsOptional()
  @IsEnum(OrderType)
  type?: OrderType;

  @IsOptional()
  @IsEnum(PaymentProvider)
  paymentProvider?: PaymentProvider;

  @IsNumberString({}, { message: 'amountSnapshot debe ser un número decimal válido' })
  amountSnapshot: string;

  @IsString()
  @MaxLength(3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'currencySnapshot debe ser un código ISO de 3 letras, por ejemplo USD',
  })
  currencySnapshot: string;

  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycleSnapshot?: BillingCycle;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  planCodeSnapshot?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  planNameSnapshot?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  externalReference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  externalPaymentId?: string;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}