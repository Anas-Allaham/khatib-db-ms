import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class DashboardAccountResetPasswordDto {
  @ApiProperty()
  @IsString()
  password: string
}