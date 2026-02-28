import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';
import { BillingCycle } from '../entities/plan.entity';

export class CreatePlanDto {
  @IsUUID()
  verticalId: string;

  @IsString()
  @MaxLength(40)
  code: string;

  @IsString()
  @MaxLength(80)
  name: string;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  // numeric -> string
  @IsString()
  price: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxSeats?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
