import { AccountDto } from "src/modules/account/dtos/account.dto"
import { AccessTokenDto } from "../../common/dtos/access-token.dto"

export class AccountLoginResponseDto extends AccessTokenDto {
  account: AccountDto
}