import { AccessTokenDto } from "../dtos/access-token.dto";

export interface IAuthService<TParams, TResult> {
  validateClient(params: TParams): Promise<TResult>;
  generateToken(params: TParams): Promise<AccessTokenDto>;
}
