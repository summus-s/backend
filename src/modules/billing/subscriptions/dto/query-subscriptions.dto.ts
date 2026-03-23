import {
  IsBooleanString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { PaginationDto } from '../../../../common/dto/pagination.dto';
import { SubscriptionStatus } from '../enums/subscription-status.enum';

export class QuerySubscriptionsDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  companyVerticalId?: string;

  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  verticalId?: string;

  @IsOptional()
  @IsUUID()
  planId?: string;

  @IsOptional()
  @IsEnum(SubscriptionStatus)
  status?: SubscriptionStatus;

  @IsOptional()
  @IsBooleanString()
  autoRenew?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}