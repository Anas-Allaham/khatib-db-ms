import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class TenantLoginDto {
  @ApiProperty()
  @IsString()
  clientId: string;

  @ApiProperty()
  @IsString()
  clientSecret: string;

  @ApiProperty({ example: 'client_credentials' })
  @IsString()
  grantType: string;
}