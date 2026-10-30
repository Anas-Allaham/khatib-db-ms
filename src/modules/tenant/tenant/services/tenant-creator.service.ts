import { Injectable } from '@nestjs/common';
import { ClientSession, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { SecretKeyGeneratorService } from '../../../../common/services/secret-key-generator.service';
import { ETenantPermission } from '../enums';
import { TenantRepository } from '../data/repositories/tenant.repository';

@Injectable()
export class TenantCreatorService {
  constructor(
    private readonly _tenantRepository: TenantRepository,
    private readonly _tenantSecretGenerator: SecretKeyGeneratorService
  ) { }

  async create(data: ICreateTenant, session?: ClientSession) {
    const clientId = randomUUID();

    const { clientSecret, hashedSecret } = await this._tenantSecretGenerator.generateSecretKey()
    const newTenant = await this._tenantRepository.create({
      name: data.name,
      permissions: data.permissions,
      clientId,
      clientSecret: hashedSecret,
    }, {
      session
    });


    return { _id: newTenant._id, clientId: newTenant.clientId, clientSecret };
  }
}

interface ICreateTenant {
  name: string;
  permissions: ETenantPermission[]
}