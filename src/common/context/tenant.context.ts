import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'async_hooks';
import { ETenantContextConstants } from '../constants/tenant-context-constants.enum';
import { Types } from 'mongoose';

@Injectable()
export class TenantContext {
  private asyncLocalStorage = new AsyncLocalStorage<Map<string, Types.ObjectId>>();

  run(context: Map<string, any>, callback: () => void): void {
    this.asyncLocalStorage.run(context, callback);
  }


  setTenantId(tenantId: Types.ObjectId): void {
    const store = this.asyncLocalStorage.getStore()
    if (!store) throw new Error('Store is not set')
    store.set(ETenantContextConstants.TENANT_ID, tenantId);

  }

  getTenantId(): Types.ObjectId | undefined {
    const store = this.asyncLocalStorage.getStore();
    const tenantId = store?.get(ETenantContextConstants.TENANT_ID)
    return tenantId ? new Types.ObjectId(tenantId) : undefined;
  }
}

