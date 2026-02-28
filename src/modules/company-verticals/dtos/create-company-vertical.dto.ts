import { IsUUID } from 'class-validator';

export class CreateCompanyVerticalDto {
  @IsUUID()
  companyId: string;

  @IsUUID()
  verticalId: string;
}
