import {
  IsBooleanString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { BillingCycle } from '../../../company-verticals/enums/billing-cycle.enum';

export class QueryPlansDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  verticalId?: string;

  @IsOptional()
  @IsEnum(BillingCycle)
  billingCycle?: BillingCycle;

  @IsOptional()
  @IsBooleanString()
  isActive?: string;

  @IsOptional()
  @IsBooleanString()
  isFeatured?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}