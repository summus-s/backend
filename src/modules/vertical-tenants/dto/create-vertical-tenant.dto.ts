import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateVerticalTenantDto {
  @IsUUID()
  companyVerticalId: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  syncReference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}