import { IsBoolean, IsOptional, IsString, MaxLength, MinLength, Matches, IsUrl } from 'class-validator';

export class CreateVerticalDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @Matches(/^[A-Z0-9_]+$/, { message: 'key debe ser tipo DAIRY_MEAT (A-Z, 0-9, _)' })
  key: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsUrl({ require_tld: false })
  @MaxLength(200)
  appBaseUrl: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  ssoCallbackPath?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  logoutPath?: string;
}
