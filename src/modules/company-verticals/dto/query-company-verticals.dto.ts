import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { PaginationDto } from '../../../common/dto/pagination.dto';
import { CompanyVerticalStatus } from '../enums/company-vertical-status.enum';

export class QueryCompanyVerticalsDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  verticalId?: string;

  @IsOptional()
  @IsEnum(CompanyVerticalStatus)
  status?: CompanyVerticalStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}