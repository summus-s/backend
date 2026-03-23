import {
  IsBoolean,
  IsDateString,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  companyVerticalId: string;

  @IsUUID()
  planId: string;

  @IsDateString()
  startsAt: string;

  @IsOptional()
  @IsDateString()
  currentPeriodStartsAt?: string;

  @IsOptional()
  @IsDateString()
  currentPeriodEndsAt?: string;

  @IsOptional()
  @IsBoolean()
  autoRenew?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}