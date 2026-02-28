import { IsUUID } from 'class-validator';

export class AssignRoleDto {
  @IsUUID()
  membershipId: string;

  @IsUUID()
  roleId: string;
}
