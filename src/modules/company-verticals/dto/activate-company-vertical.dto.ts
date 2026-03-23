import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ActivateCompanyVerticalDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}