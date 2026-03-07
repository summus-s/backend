import { SetMetadata } from '@nestjs/common';
import { PlatformRoleKey } from '../../modules/platform-roles/enums/platform-role-key.enum';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: PlatformRoleKey[]) => SetMetadata(ROLES_KEY, roles);