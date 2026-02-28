import { IsUUID } from 'class-validator';

export class DisableAddonDto {
  @IsUUID()
  companyVerticalId: string;

  @IsUUID()
  addonId: string;
}
