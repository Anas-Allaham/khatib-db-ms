import { Injectable, NotFoundException } from '@nestjs/common';
import { TenantRepository } from '../data/repositories/tenant.repository';
import { Types } from 'mongoose';
import { Tenant } from '../data/schemas/tenants-entity.schema';

@Injectable()
export class TenantGetterService {
  constructor(
    private readonly _tenantRepository: TenantRepository
  ) { }

  async findByClientId(clientId: string) {
    const tenant = await this._tenantRepository.findOne<Tenant>({ clientId })
    if (!tenant) throw new NotFoundException('Tenant is not found');
    return tenant
  }

  async getTenants() {
    return this._tenantRepository.find().select({ _id: 1, name: 1 })
  }


  async getTenantsMap() {
    const tenants = await this._tenantRepository.find().select({ _id: 1, name: 1, clientId: 1 }).setOptions({ autopopulate: false })

    const tenantMap = new Map<string, string>();
    for (const tenant of tenants) {
      const tenantId = tenant._id
      tenantMap.set(tenantId?.toString(), tenant.clientId);
    }

    return tenantMap
  }
  async getClientId(tenantId: Types.ObjectId): Promise<string> {
    const tenant = await this._tenantRepository.findOne({ _id: tenantId }, { clientId: true })
    if (!tenant) throw new NotFoundException('clientId is not found.')
    return tenant.clientId
  }


  async findOne(tenantId: Types.ObjectId) {
    const tenant = await this._tenantRepository.findOne<Tenant>({
      _id: tenantId,
    });
    if (!tenant) throw new NotFoundException('tenant is not found.');
    return tenant
  }
}
