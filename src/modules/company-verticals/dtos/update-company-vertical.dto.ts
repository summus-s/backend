import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';
import { CompanyVerticalStatus } from '../entities/company-vertical.entity';

export class UpdateCompanyVerticalDto {
  @IsOptional()
  @IsEnum(CompanyVerticalStatus)
  status?: CompanyVerticalStatus;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  suspendedReason?: string;
}
