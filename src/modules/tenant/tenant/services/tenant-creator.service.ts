import { Injectable } from '@nestjs/common';
import { ClientSession, Types } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { SecretKeyGeneratorService } from 'src/common/services/secret-key-generator.service';
import { ETenantPermission } from '../enums';
import { TenantRepository } from '../data/repositories/tenant.repository';

@Injectable()
export class TenantCreatorService {
  constructor(
    private readonly _tenantRepository: TenantRepository,
    private readonly _tenantSecretGenerator: SecretKeyGeneratorService
  ) { }

  async create(data: ICreateTenant, session?: ClientSession) {
    const clientId = uuidv4();

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