import { IsOptional, IsString, MaxLength } from 'class-validator';

export class ReactivateCompanyVerticalDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}