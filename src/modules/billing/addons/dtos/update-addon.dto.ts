import { IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateAddonDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  key?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsString()
  price?: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  isActive?: boolean;
}
