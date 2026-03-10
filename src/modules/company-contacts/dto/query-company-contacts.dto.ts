import {
  IsBooleanString,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';

export class QueryCompanyContactsDto {
  @IsOptional()
  @IsUUID()
  companyId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(120)
  email?: string;

  @IsOptional()
  @IsBooleanString()
  isPrimary?: string;
}