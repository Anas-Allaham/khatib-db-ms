import { AccountDto } from "src/modules/account/dtos/account.dto"
import { AccessTokenDto } from "./access-token.dto"

export class LoginDto extends AccessTokenDto {
  account: AccountDto
}