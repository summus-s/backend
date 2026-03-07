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

export class CreatePlatformUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @MinLength(2)
  fullName: string;

  @IsOptional()
  @IsEnum(PlatformUserStatus)
  status?: PlatformUserStatus;

  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsEnum(PlatformRoleKey, { each: true })
  roleKeys?: PlatformRoleKey[];
}