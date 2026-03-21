import { IsOptional, IsString, MaxLength } from 'class-validator';

export class CancelCompanyVerticalDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;
}