import { IsEnum, IsOptional } from 'class-validator';
import { MembershipStatus } from '../entities/membership.entity';

export class UpdateMembershipDto {
  @IsOptional()
  @IsEnum(MembershipStatus)
  status?: MembershipStatus;

  @IsOptional()
  isOwner?: boolean;
}
