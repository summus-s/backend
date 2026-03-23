import { IsOptional, IsString, MaxLength } from 'class-validator';

export class MarkOrderFailedDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  failureCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  failureMessage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  reason?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}