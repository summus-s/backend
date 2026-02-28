import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateIf,
} from 'class-validator';
import { CompanyType } from '../entities/company.entity';

export class CreateCompanyDto {
  @IsEnum(CompanyType)
  type: CompanyType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  // Requerido si BUSINESS
  @ValidateIf((o) => o.type === CompanyType.BUSINESS)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  legalName: string;

  // Requerido si BUSINESS
  @ValidateIf((o) => o.type === CompanyType.BUSINESS)
  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  taxId?: string;

}