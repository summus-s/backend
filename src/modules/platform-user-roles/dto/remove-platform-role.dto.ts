import { IsUUID, IsEnum } from 'class-validator';

import { PlatformRoleKey } from '../../platform-roles/enums/platform-role-key.enum';

export class RemovePlatformRoleDto {
  @IsUUID()
  userId: string;

  @IsEnum(PlatformRoleKey)
  roleKey: PlatformRoleKey;
}