import {
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @MaxLength(120)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(180)
  legalName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  taxId?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  address?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}