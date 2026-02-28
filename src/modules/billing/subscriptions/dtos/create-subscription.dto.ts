import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { SubscriptionStatus } from '../entities/subscription.entity';

export class CreateSubscriptionDto {
  @IsUUID()
  companyVerticalId: string;

  @IsUUID()
  planId: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  // provider opcional (manual/stripe luego)
  @IsOptional()
  @IsString()
  paymentProvider?: string;
}
