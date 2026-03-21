import { IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { CompanyVerticalStatus } from '../enums/company-vertical-status.enum';
import { ProvisioningStatus } from '../enums/provisioning-status.enum';

export class QueryCompanyVerticalsDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsUUID()
  verticalId?: string;

  @IsOptional()
  @IsEnum(CompanyVerticalStatus)
  status?: CompanyVerticalStatus;

  @IsOptional()
  @IsEnum(ProvisioningStatus)
  provisioningStatus?: ProvisioningStatus;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}