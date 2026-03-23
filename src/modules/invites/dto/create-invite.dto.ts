import {
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class CreateInviteDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  companyVerticalId: string;

  @IsEmail()
  @MaxLength(160)
  email: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  fullName?: string;

  @IsString()
  @MaxLength(80)
  platformRoleKey: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}