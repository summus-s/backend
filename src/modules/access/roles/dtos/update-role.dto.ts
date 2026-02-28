import { IsOptional, IsString, MaxLength, MinLength, Matches } from 'class-validator';

export class UpdateRoleDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  @Matches(/^[A-Z0-9_]+$/, { message: 'name debe ser tipo ADMIN, SALES (A-Z, 0-9, _)' })
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  description?: string;
}
