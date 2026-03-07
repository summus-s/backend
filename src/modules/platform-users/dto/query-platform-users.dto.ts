import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';

import { PlatformUserStatus } from '../enums/platform-user-status.enum';
import { PlatformRoleKey } from '../../platform-roles/enums/platform-role-key.enum';

export class QueryPlatformUsersDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsEnum(PlatformUserStatus)
  status?: PlatformUserStatus;

  @IsOptional()
  @IsEnum(PlatformRoleKey)
  roleKey?: PlatformRoleKey;
}