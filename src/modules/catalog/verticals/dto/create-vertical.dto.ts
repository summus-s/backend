import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateVerticalDto {
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message:
      'key debe estar en formato slug minúsculo, por ejemplo: restobar o clinic-pro',
  })
  key: string;

  @IsString()
  @MaxLength(80)
  name: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsString()
  @MaxLength(120)
  @Matches(/^\/[a-z0-9-]+(?:\/[a-z0-9-]+)*$/, {
    message:
      'marketingPath debe iniciar con / y usar solo minúsculas, números y guiones. Ej: /restobar',
  })
  marketingPath: string;

  @IsString()
  @IsUrl({
    require_protocol: true,
  })
  @MaxLength(200)
  appBaseUrl: string;

  @IsOptional()
  @IsString()
  @IsUrl({
    require_protocol: true,
  })
  @MaxLength(200)
  apiBaseUrl?: string;
}