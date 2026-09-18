import { ApiProperty } from "@nestjs/swagger";
import { Types } from "mongoose";

export class AccountDto {
  @ApiProperty()
  _id: Types.ObjectId

  @ApiProperty()
  name: string

  @ApiProperty()
  email: string
}