import { IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class MarkProvisionedDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  externalTenantId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  externalCompanyId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  externalWorkspaceId?: string;

  @IsOptional()
  @IsUrl()
  @MaxLength(300)
  externalUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  syncReference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}