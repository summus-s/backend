import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CompanyStatus, CompanyType } from '../entities/company.entity';

export class UpdateCompanyDto {
  @IsOptional()
  @IsEnum(CompanyType)
  type?: CompanyType;

  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(150)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  legalName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(60)
  taxId?: string;

  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  suspendedReason?: string;
}
