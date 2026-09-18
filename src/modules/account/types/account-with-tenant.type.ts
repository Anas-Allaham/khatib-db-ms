import { Tenant } from "src/modules/tenant/tenant/data/schemas/tenants-entity.schema";
import { Account } from "../data/schemas/account-entity.schema";

export type AccountWithTenant = Account & { tenant: Tenant }