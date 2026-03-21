import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { BillingCycle } from '../enums/billing-cycle.enum';

export class CreateCompanyVerticalDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  verticalId: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  planName?: string;

  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @IsOptional()
  @IsDateString()
  startsAt?: string;

  @IsOptional()
  @IsDateString()
  endsAt?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}