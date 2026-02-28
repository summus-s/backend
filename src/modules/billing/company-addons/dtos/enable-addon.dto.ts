import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class EnableAddonDto {
  @IsUUID()
  companyVerticalId: string;

  @IsUUID()
  addonId: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  source?: string; // PURCHASE | OVERRIDE | SUPPORT
}
