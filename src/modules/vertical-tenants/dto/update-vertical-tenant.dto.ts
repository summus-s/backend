import { IsOptional, IsString, MaxLength, IsUrl } from 'class-validator';

export class UpdateVerticalTenantDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  externalTenantId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  externalCompanyId?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  externalWorkspaceId?: string | null;

  @IsOptional()
  @IsUrl()
  @MaxLength(300)
  externalUrl?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  syncReference?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}