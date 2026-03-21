import {
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';

export class QueryVerticalsDto {
  @IsOptional()
  @IsString()
  @MaxLength(40)
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'key debe estar en formato slug minúsculo',
  })
  key?: string;

  @IsOptional()
  @IsString()
  isActive?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  search?: string;
}