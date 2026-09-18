# Company Starter → Medical Lab Gateway Mapping

| Starter concern | Medical Lab Gateway use |
|---|---|
| Tenant | One laboratory / laboratory organization |
| Account | Dashboard/admin user for that laboratory |
| Tenant client credentials | AI agent or trusted integration identity |
| Tenant permission guard | Limits agent capabilities (`PATIENT_VERIFY`, `BIOPSY_READ`) |
| Tenant context | Automatically scopes patient, biopsy, webhook, and queue data |
| Base repository | Reused unchanged for tenant-aware persistence |
| App config | Webhook retry delay + patient verification token TTL |
| Webhook registry | Lab-configured integration callbacks |
| Webhook queue | Reliable delivery of clinical workflow events |
| Scheduler | Processes delayed webhook retries |
| Swagger / Redoc | API documentation for admin and integration teams |
| Health check | Service operational endpoint |

## Added domain boundaries

| New concern | Responsibility |
|---|---|
| Patient module | Patient identity data and verification candidate lookup |
| Patient verification service | Enforces name + second identifier and issues a short-lived proof token |
| Biopsy module | Stores internal clinical biopsy state |
| Result policy service | Converts internal clinical data to an agent-safe contract |
| Clinical webhook publisher | Converts domain events into the starter webhook queue |

## Intentional improvements over the source starter

- Tenant access tokens are signed with `TENANT_JWT_SECRET` explicitly.
- Account access tokens are signed with `ACCOUNT_JWT_SECRET` explicitly.
- Unknown tenant credentials fail cleanly before attempting secret verification.
- Duplicate `UserModule` registration was removed from `AppModule`.
- `ScheduleModule.forRoot()` is kept at the root instead of being initialized again inside the webhook queue module.
- Webhook side effects are best-effort and do not fail the primary medical request path.
