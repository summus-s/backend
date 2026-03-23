import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MarkFailedDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  errorCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  errorMessage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  syncReference?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}