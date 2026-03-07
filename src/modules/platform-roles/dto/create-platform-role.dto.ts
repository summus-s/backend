import { IsEnum, IsString, MinLength } from 'class-validator';

import { PlatformRoleKey } from '../enums/platform-role-key.enum';

export class CreatePlatformRoleDto {
  @IsEnum(PlatformRoleKey)
  key: PlatformRoleKey;

  @IsString()
  @MinLength(2)
  name: string;
}