import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SuspendCompanyVerticalDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}