import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MarkProvisioningDto {
  @IsOptional()
  @IsString()
  @MaxLength(150)
  syncReference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}