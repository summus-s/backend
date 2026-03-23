import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

import { PaginationDto } from '../../../common/dto/pagination.dto';
import { InviteStatus } from '../enums/invite-status.enum';

export class QueryInvitesDto extends PaginationDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  companyVerticalId?: string;

  @IsOptional()
  @IsEnum(InviteStatus)
  status?: InviteStatus;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}