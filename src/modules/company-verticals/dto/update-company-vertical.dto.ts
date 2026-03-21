import { PartialType } from '@nestjs/mapped-types';
import { CreateCompanyVerticalDto } from './create-company-vertical.dto';

export class UpdateCompanyVerticalDto extends PartialType(
  CreateCompanyVerticalDto,
) {}