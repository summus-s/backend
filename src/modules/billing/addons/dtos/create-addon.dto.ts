import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';

export class CreateAddonDto {
  @IsOptional()
  @IsUUID()
  verticalId?: string;

  @IsString()
  @MaxLength(60)
  key: string;

  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsString()
  price: string;

  @IsOptional()
  @IsString()
  @MaxLength(10)
  currency?: string;

  @IsOptional()
  isActive?: boolean;
}
