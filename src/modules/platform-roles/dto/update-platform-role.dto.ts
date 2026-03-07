import { IsOptional, IsString, MinLength } from 'class-validator';

export class UpdatePlatformRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;
}