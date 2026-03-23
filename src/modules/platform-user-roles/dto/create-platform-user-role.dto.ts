import {
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreatePlatformUserRoleDto {
  @IsUUID()
  platformUserId: string;

  @IsUUID()
  platformRoleId: string;

  @IsOptional()
  @IsUUID()
  companyVerticalId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}