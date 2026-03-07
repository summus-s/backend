import {
  IsArray,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  ArrayUnique,
} from 'class-validator';

import { PlatformUserStatus } from '../enums/platform-user-status.enum';
import { PlatformRoleKey } from '../../platform-roles/enums/platform-role-key.enum';

export class UpdatePlatformUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(2)
  fullName?: string;

  @IsOptional()
  @IsEnum(PlatformUserStatus)
  status?: PlatformUserStatus;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(PlatformRoleKey, { each: true })
  roleKeys?: PlatformRoleKey[];
}