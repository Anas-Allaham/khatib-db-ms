import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateAccountDto } from '../../../account/dtos/create-account.dto';
import { ETenantPermission } from '../../tenant/enums';

export class CreateTenantDto {
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty({ enum: ETenantPermission, isArray: true })
  @IsEnum(ETenantPermission, { each: true })
  @IsOptional()
  permissions: ETenantPermission[];

  @ApiProperty()
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => CreateAccountDto)
  account: CreateAccountDto;
}
