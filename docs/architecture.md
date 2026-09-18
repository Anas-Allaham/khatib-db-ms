# Medical Lab Gateway Architecture

This project keeps the reusable architecture of the company NestJS starter while applying it to a concrete medical-laboratory domain.

## Main layers

- **Dashboard / Account plane**: authenticated lab administrators manage patients, biopsy records, tenants, app config, and webhooks.
- **Tenant / Integration plane**: an AI agent or another trusted service authenticates with `clientId` + `clientSecret` and receives a tenant JWT.
- **Patient verification plane**: the caller must verify `fullName` plus a second factor (`dateOfBirth` or `phoneLast4`). Successful verification returns a patient-bound, tenant-bound JWT that expires quickly.
- **Patient-safe biopsy plane**: a verified caller can request the latest biopsy. The public contract never exposes raw pathology text or malignant/critical labels.
- **Clinical administration plane**: authenticated lab admins can see and update the raw clinical biopsy record.
- **Webhook plane**: domain events are delivered through the existing retry queue without blocking the medical request path.

## Security boundary

The LLM is not the only safety boundary.

A completed biopsy is mapped in the backend to one of:

- `BENIGN`
- `CLINICIAN_REVIEW_REQUIRED`

For malignant or critical records, the agent endpoint does not receive the malignant/critical label and does not receive `rawReport`. This prevents prompt drift from accidentally disclosing a critical diagnosis.

## Request flow

```text
AI Agent
   |
   | 1. POST /api/v1.0/auth/tenant/login
   v
Tenant access token
   |
   | 2. POST /api/v1.0/patients/verify
   |    Authorization: Bearer <tenant-token>
   |    { fullName, dateOfBirth | phoneLast4 }
   v
Patient verification token (5 min by default)
   |
   | 3. GET /api/v1.0/biopsies/:patientId/latest
   |    Authorization: Bearer <tenant-token>
   |    x-patient-verification-token: <verification-token>
   v
Patient-safe result
```

## Preserved starter features

- MongoDB + Mongoose
- tenant-scoped base repository
- AsyncLocalStorage tenant context
- tenant client-credentials authentication
- dashboard account authentication
- role/permission guards
- JWT access/refresh flow
- soft delete plugin
- app config and seed
- Swagger + Redoc
- validation pipe
- centralized Mongoose exception handling
- health check module
- scheduled webhook retry queue
- tenant-aware webhooks

## New domain modules

### Patient module

- tenant-scoped patient schema
- Arabic-friendly name normalization
- patient administration endpoint
- identity verification endpoint
- short-lived patient verification token

### Biopsy module

- pending/completed status
- normal/benign/malignant/critical internal classification
- admin-only raw clinical record
- patient-safe result mapping
- latest-biopsy endpoint

### Domain webhook events

- `PATIENT_VERIFIED`
- `BIOPSY_STATUS_UPDATED`
- `BIOPSY_RESULT_READY`

Webhook payloads intentionally exclude the raw clinical report.
