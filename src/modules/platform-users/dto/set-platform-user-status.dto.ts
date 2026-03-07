import { IsEnum } from 'class-validator';

import { PlatformUserStatus } from '../enums/platform-user-status.enum';

export class SetPlatformUserStatusDto {
  @IsEnum(PlatformUserStatus)
  status: PlatformUserStatus;
}