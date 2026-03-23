import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { PaginationDto } from '../../../common/dto/pagination.dto';
import { VerticalTenantStatus } from '../enums/vertical-tenant-status.enum';

export class QueryVerticalTenantsDto extends PaginationDto {
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
  @IsEnum(VerticalTenantStatus)
  status?: VerticalTenantStatus;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  syncReference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}