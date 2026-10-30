import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { HashService } from './hash.service';

@Injectable()
export class SecretKeyGeneratorService {
  constructor(
    private readonly _hashService: HashService
  ) { }

  async generateSecretKey() {
    const clientSecret = crypto.randomBytes(32).toString('hex');
    const hashedSecret = await this._hashService.hash(clientSecret);
    return { clientSecret, hashedSecret }
  }
}
