import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class ProvisionVerticalTenantDto {
  @IsOptional()
  @IsBoolean()
  force?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  syncReference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}