import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SuspendVerticalTenantDto {
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}