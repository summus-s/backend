import { IsUUID } from 'class-validator';

export class RemoveRoleDto {
  @IsUUID()
  membershipId: string;

  @IsUUID()
  roleId: string;
}
