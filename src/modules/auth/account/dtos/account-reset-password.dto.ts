import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class AccountResetPasswordDto {
  @ApiProperty()
  @IsString()
  oldPassword: string;

  @ApiProperty()
  @IsString()
  newPassword: string
}