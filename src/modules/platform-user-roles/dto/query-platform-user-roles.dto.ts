import {
  IsBooleanString,
  IsOptional,
  IsUUID,
} from 'class-validator';

import { PaginationDto } from '../../../common/dto/pagination.dto';

export class QueryPlatformUserRolesDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  platformUserId?: string;

  @IsOptional()
  @IsUUID()
  platformRoleId?: string;

  @IsOptional()
  @IsUUID()
  companyVerticalId?: string;

  @IsOptional()
  @IsBooleanString()
  isActive?: string;
}