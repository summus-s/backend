import { PartialType } from '@nestjs/mapped-types';
import { CreateVerticalDto } from './create-vertical.dto';

export class UpdateVerticalDto extends PartialType(CreateVerticalDto) {
  key: any;
  name: any;
  description: undefined;
  isActive: undefined;
  appBaseUrl: any;
  ssoCallbackPath: any;
  logoutPath: undefined;
}
