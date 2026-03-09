import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SuspendCompanyDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}