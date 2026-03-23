import { IsOptional, IsString, MaxLength } from 'class-validator';

export class RevokePlatformUserRoleDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}