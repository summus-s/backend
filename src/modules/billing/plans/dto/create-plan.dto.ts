import {
  IsBoolean,
  IsEnum,
  IsNumberString,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
} from 'class-validator';

import { BillingCycle } from '../../../company-verticals/enums/billing-cycle.enum';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';


export class CreatePlanDto {
  @IsUUID()
  verticalId: string;

  @IsString()
  @MaxLength(60)
  @Matches(/^[A-Z0-9]+(?:_[A-Z0-9]+)*$/, {
    message:
      'code debe estar en mayúsculas y usar guiones bajos, por ejemplo: BASIC o PRO_MONTHLY',
  })
  code: string;

  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  description?: string;

  @IsNumberString({}, { message: 'price debe ser un número decimal válido' })
  price: string;

  @IsOptional()
  @IsString()
  @MaxLength(3)
  @Matches(/^[A-Z]{3}$/, {
    message: 'currency debe ser un código ISO de 3 letras, por ejemplo USD',
  })
  currency?: string;

  @IsEnum(BillingCycle)
  billingCycle: BillingCycle;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  sortOrder?: number;

  @IsOptional()
  @IsObject()
  features?: Record<string, unknown>;
}