import { IsBoolean, IsUUID } from 'class-validator';

export class CreateMembershipDto {
  @IsUUID()
  companyVerticalId: string;

  @IsUUID()
  userId: string;

  @IsBoolean()
  isOwner: boolean;
}
