import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CompanyStatus } from '../enums/company-status.enum';

export class QueryCompaniesDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsEnum(CompanyStatus)
  status?: CompanyStatus;
}