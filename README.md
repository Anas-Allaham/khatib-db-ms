# Medical Lab Gateway

A multi-tenant NestJS service for secure patient identity verification and patient-safe biopsy result delivery.

It is derived from the same architectural style as the company NestJS starter, but the domain and request flow are purpose-built for a medical laboratory AI-agent use case.

## Why this version is different

The AI prompt is **not** the only safety layer. Critical clinical data is filtered by the backend before it reaches the agent.

- A patient must provide **full name + a second identifier**.
- Successful verification produces a **short-lived patient verification token**.
- The token is bound to both the **patient** and **tenant**.
- The agent-facing biopsy endpoint never returns `rawReport`.
- `MALIGNANT` and `CRITICAL` records are converted to `CLINICIAN_REVIEW_REQUIRED` before leaving the backend.
- Raw clinical data remains available only through authenticated lab-admin endpoints.

See [`docs/architecture.md`](docs/architecture.md) and [`docs/agent-system-prompt.md`](docs/agent-system-prompt.md).

## Preserved architecture/features

- NestJS 11
- MongoDB / Mongoose
- multi-tenancy with `AsyncLocalStorage`
- tenant-aware base repository
- account authentication for dashboard/admin APIs
- tenant client-credentials authentication for service/agent APIs
- JWT access and refresh flow
- roles and tenant permissions
- application configuration + seed
- Mongo soft-delete plugin
- validation pipe
- centralized Mongoose exception handling
- Swagger + Redoc
- health checks
- webhooks with scheduled retry queue
- API versioning

## New domain modules

```text
src/modules/
├── patient/
│   ├── controllers/
│   ├── data/
│   ├── dtos/
│   ├── enums/
│   └── services/
├── biopsy/
│   ├── controllers/
│   ├── data/
│   ├── dtos/
│   ├── enums/
│   └── services/
└── webhook/
    └── ... existing queue + domain publisher
```

## Core flow

### 1. Authenticate the AI integration

```http
POST /api/v1.0/auth/tenant/login
Content-Type: application/json

{
  "clientId": "...",
  "clientSecret": "...",
  "grantType": "client_credentials"
}
```

### 2. Verify patient identity

```http
POST /api/v1.0/patients/verify
Authorization: Bearer <tenant-access-token>
Content-Type: application/json

{
  "fullName": "أحمد محمد علي",
  "dateOfBirth": "1990-05-14"
}
```

Alternative second identifier:

```json
{
  "fullName": "أحمد محمد علي",
  "phoneLast4": "4821"
}
```

Response:

```json
{
  "patientId": "...",
  "verificationToken": "...",
  "expiresInSeconds": 300,
  "verificationMethod": "DATE_OF_BIRTH"
}
```

### 3. Retrieve the latest patient-safe biopsy result

```http
GET /api/v1.0/biopsies/<patientId>/latest
Authorization: Bearer <tenant-access-token>
x-patient-verification-token: <patient-verification-token>
```

Pending example:

```json
{
  "biopsyId": "...",
  "sampleNumber": "BX-2026-00042",
  "status": "PENDING",
  "disposition": "PENDING",
  "expectedReadyAt": "2026-09-20T10:00:00.000Z",
  "patientMessage": "العينة ما زالت قيد المعالجة..."
}
```

Benign example:

```json
{
  "biopsyId": "...",
  "sampleNumber": "BX-2026-00042",
  "status": "COMPLETED",
  "disposition": "BENIGN",
  "patientMessage": "النتيجة مكتملة، وتُظهر العينة أنسجة طبيعية أو حميدة..."
}
```

Critical/malignant internal record becomes:

```json
{
  "biopsyId": "...",
  "sampleNumber": "BX-2026-00042",
  "status": "COMPLETED",
  "disposition": "CLINICIAN_REVIEW_REQUIRED",
  "patientMessage": "نتيجتك جاهزة، ولكنها تتطلب مراجعة الطبيب المختص لشرح التفاصيل الطبية بدقة. هل أساعدك في حجز موعد في العيادة؟"
}
```

The response intentionally contains no malignant/critical label and no raw pathology report.

## Admin APIs

Authenticated tenant administrators can populate the medical data used by the agent flow:

- `POST /api/v1.0/admins/patients`
- `POST /api/v1.0/admins/biopsies`
- `PATCH /api/v1.0/admins/biopsies/:id`
- `GET /api/v1.0/admins/biopsies/:id`

The raw biopsy endpoint belongs to the admin plane and should never be exposed as an LLM tool.

## Tenant permissions

Added permissions:

- `PATIENT_VERIFY`
- `BIOPSY_READ`
- `WEBHOOK_MANAGE`
- existing `ALL`

## Webhook events

- `PATIENT_VERIFIED`
- `BIOPSY_STATUS_UPDATED`
- `BIOPSY_RESULT_READY`

These use the starter's webhook queue/retry architecture. Domain events do not include the raw clinical report, and webhook failures do not block patient verification or result retrieval.

## Environment

Copy `.env.example` to `.env` and set real secrets:

```env
DATABASE_URL=mongodb://localhost:27017/medical-lab
PORT=3000
NODE_ENV=dev

TENANT_JWT_SECRET=<long-random-secret>
ACCOUNT_JWT_SECRET=<long-random-secret>
PATIENT_VERIFICATION_JWT_SECRET=<different-long-random-secret>

SWAGGER_USER=
SWAGGER_PASSWORD=
```

Never reuse the same secret between account, tenant, and patient-verification tokens.

## Install and run

```bash
npm install
npm run build
npm run seed:app-config
npm run seed:account
npm run start:dev
```

Swagger and Redoc are configured by the inherited starter bootstrap.

## Production hardening still recommended

Before handling real patient data, add infrastructure-level controls that are intentionally outside this starter exercise: rate limiting for verification attempts, audit logging, encryption/key management, secret rotation, retention policies, access reviews, monitoring, and the legal/compliance controls required in the deployment jurisdiction.
