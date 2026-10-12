# Medical Lab Gateway — Tenant API Guide

**API version:** 1.0  
**Document date:** September 22, 2026  
**Audience:** Tenant integration teams and tenant administrators

This guide documents the tenant-facing APIs currently implemented by the Medical Lab Gateway. It covers:

- the service/agent flow used to verify a patient and retrieve a patient-safe result;
- the tenant-admin flow used to manage patients, biopsies, results, credentials, and webhooks.

Internal super-admin and dashboard APIs are intentionally excluded.

## 1. Connection details

Your provider will give you the production host and credentials separately.

```text
Host:     https://<YOUR-API-HOST>
Base URL: https://<YOUR-API-HOST>/api/v1.0
Format:   application/json
```

Use HTTPS in every non-local environment. All request and response bodies are JSON unless an endpoint is documented as having no response body.

Interactive documentation may also be available at `/docs` or `/swagger`, depending on the deployment.

## 2. Authentication overview

The API has two independent authentication modes. Their tokens are not interchangeable.

| Use case | Login | Credential | Access-token lifetime |
|---|---|---|---|
| Service/agent integration | `POST /auth/tenant/login` | `clientId` + `clientSecret` | 3,600 seconds |
| Tenant admin | `POST /auth/account/login` | Email + password | 1 hour |

Send an access token as:

```http
Authorization: Bearer <ACCESS_TOKEN>
```

Keep client secrets, passwords, access tokens, refresh tokens, and patient-verification tokens out of source control, URLs, analytics, and application logs.

## 3. Service/agent API

### 3.1 Obtain service tokens

```http
POST /api/v1.0/auth/tenant/login
Content-Type: application/json
```

Request:

```json
{
  "clientId": "your-client-id",
  "clientSecret": "your-client-secret",
  "grantType": "client_credentials"
}
```

Success: `201 Created`

```json
{
  "accessToken": "eyJ...",
  "expiresIn": 3600,
  "refreshToken": "eyJ..."
}
```

The access token is valid for the number of seconds in `expiresIn`. The refresh token is valid for 7 days. Only the exact `client_credentials` grant type is accepted.

Required tenant permissions are checked separately on protected operations:

| Operation | Required permission |
|---|---|
| Verify a patient | `PATIENT_VERIFY` or `ALL` |
| Read the latest patient-safe result | `BIOPSY_READ` or `ALL` |

If the correct permission is not assigned, the protected operation returns `401 Unauthorized`.

cURL:

```bash
curl --request POST "$BASE_URL/auth/tenant/login" \
  --header "Content-Type: application/json" \
  --data '{
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "grantType": "client_credentials"
  }'
```

### 3.2 Refresh service tokens

Refreshing rotates both tokens: the response contains a new access token and a new refresh token.

```http
POST /api/v1.0/auth/tenant/refresh
Content-Type: application/json
```

Request:

```json
{
  "refreshToken": "eyJ..."
}
```

Success: `201 Created`

```json
{
  "accessToken": "eyJ...",
  "expiresIn": 3600,
  "refreshToken": "eyJ..."
}
```

An access token cannot be used in place of a refresh token. Store the newest refresh token returned by this endpoint.

### 3.3 Verify a patient

Patient verification requires the patient's full name and at least one secondary identifier.

```http
POST /api/v1.0/patients/verify
Authorization: Bearer <TENANT_ACCESS_TOKEN>
Content-Type: application/json
```

Using date of birth:

```json
{
  "fullName": "Ahmad Mohammad Ali",
  "dateOfBirth": "1990-05-14"
}
```

Using the last four phone digits:

```json
{
  "fullName": "Ahmad Mohammad Ali",
  "phoneLast4": "4821"
}
```

Both secondary identifiers may be supplied. If both are supplied, both must match the same patient record.

Field rules:

| Field | Required | Format |
|---|---:|---|
| `fullName` | Yes | String |
| `dateOfBirth` | Conditional | `YYYY-MM-DD` |
| `phoneLast4` | Conditional | Exactly four digits, sent as a string |

At least one of `dateOfBirth` and `phoneLast4` is required. Name comparison is normalized by the service, but clients should send the patient's registered full name.

Success: `201 Created`

```json
{
  "patientId": "66f1a7d9bc0123456789abcd",
  "verificationToken": "eyJ...",
  "expiresInSeconds": 300,
  "verificationMethod": "DATE_OF_BIRTH"
}
```

`verificationMethod` is either `DATE_OF_BIRTH` or `PHONE_LAST_4`. The token lifetime is configurable; always use `expiresInSeconds` instead of assuming it is 300 seconds.

For privacy, failed matching returns a generic `401 Unauthorized` response and does not identify which field was incorrect. Verification also fails when the supplied details match zero records or more than one record.

### 3.4 Get the latest patient-safe result

Call this endpoint immediately after successful patient verification.

```http
GET /api/v1.0/results/{patientId}/latest
Authorization: Bearer <TENANT_ACCESS_TOKEN>
x-patient-verification-token: <PATIENT_VERIFICATION_TOKEN>
```

Success: `200 OK`

Pending example:

```json
{
  "resultId": "66f1a8f2bc0123456789abce",
  "biopsyId": "66f1a84abc0123456789abcf",
  "sampleNumber": "BX-2026-00042",
  "status": "DRAFT",
  "disposition": "PENDING",
  "expectedReadyAt": "2026-09-24T10:00:00.000Z",
  "patientMessage": "<localized patient-safe message>"
}
```

Final benign/normal example:

```json
{
  "resultId": "66f1a8f2bc0123456789abce",
  "biopsyId": "66f1a84abc0123456789abcf",
  "sampleNumber": "BX-2026-00042",
  "status": "FINAL",
  "disposition": "BENIGN",
  "patientMessage": "<localized patient-safe message>"
}
```

Final result requiring a clinician conversation:

```json
{
  "resultId": "66f1a8f2bc0123456789abce",
  "biopsyId": "66f1a84abc0123456789abcf",
  "sampleNumber": "BX-2026-00042",
  "status": "FINAL",
  "disposition": "CLINICIAN_REVIEW_REQUIRED",
  "patientMessage": "<localized patient-safe message>"
}
```

Response fields:

| Field | Type | Meaning |
|---|---|---|
| `resultId` | String | Result identifier |
| `biopsyId` | String | Biopsy identifier |
| `sampleNumber` | String | Tenant's sample/reference number |
| `status` | Enum | `DRAFT` or `FINAL` |
| `disposition` | Enum | `PENDING`, `BENIGN`, or `CLINICIAN_REVIEW_REQUIRED` |
| `expectedReadyAt` | ISO 8601 date-time | Optional; normally supplied for a pending result |
| `patientMessage` | String | Patient-safe message intended for display or reading verbatim |

Safety rules enforced by this endpoint:

- It never returns the raw pathology report.
- It never returns an internal `MALIGNANT` or `CRITICAL` classification.
- Those classifications are exposed only as `CLINICIAN_REVIEW_REQUIRED` with a patient-safe message.
- The verification token is short-lived and bound to the patient, tenant, and request purpose. It cannot be reused for another patient or tenant.

If no result exists for the verified patient, the endpoint returns `404 Not Found`.

### 3.5 Complete service integration example

```bash
BASE_URL="https://<YOUR-API-HOST>/api/v1.0"

# 1. Obtain tokens. Use a JSON parser in production; do not parse JSON with grep.
curl --request POST "$BASE_URL/auth/tenant/login" \
  --header "Content-Type: application/json" \
  --data '{
    "clientId": "your-client-id",
    "clientSecret": "your-client-secret",
    "grantType": "client_credentials"
  }'

# 2. Verify the patient using the returned access token.
curl --request POST "$BASE_URL/patients/verify" \
  --header "Authorization: Bearer <TENANT_ACCESS_TOKEN>" \
  --header "Content-Type: application/json" \
  --data '{
    "fullName": "Ahmad Mohammad Ali",
    "dateOfBirth": "1990-05-14"
  }'

# 3. Use both values returned by verification.
curl --request GET \
  "$BASE_URL/results/66f1a7d9bc0123456789abcd/latest" \
  --header "Authorization: Bearer <TENANT_ACCESS_TOKEN>" \
  --header "x-patient-verification-token: <PATIENT_VERIFICATION_TOKEN>"
```

## 4. Tenant-admin API

Tenant-admin endpoints require an account access token and an account with the `ADMIN` role linked to a tenant. A service/agent token cannot call these endpoints.

### 4.1 Account operations

#### Log in

```http
POST /api/v1.0/auth/account/login
Content-Type: application/json
```

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

Success: `201 Created`

```json
{
  "accessToken": "eyJ...",
  "account": {
    "_id": "66f1a000bc0123456789abc0",
    "name": "Lab Administrator",
    "email": "admin@example.com",
    "role": "ADMIN",
    "tenant": "66f19f00bc0123456789abc1"
  }
}
```

The account token is valid for 1 hour. There is currently no account refresh endpoint; log in again after expiry.

#### Get the current account

```http
GET /api/v1.0/auth/account/me
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
```

Success: `200 OK`

#### Change the current account password

```http
PATCH /api/v1.0/auth/account/password/update
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
Content-Type: application/json
```

```json
{
  "oldPassword": "current-password",
  "newPassword": "new-password"
}
```

Success: `200 OK`

```json
{
  "message": "The password has been reset successfully.",
  "statusCode": 200
}
```

#### Rotate the tenant client secret

```http
PATCH /api/v1.0/auth/account/client-secret/reset
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
```

Success: `200 OK`

```json
{
  "clientId": "your-client-id",
  "clientSecret": "new-client-secret"
}
```

Store the returned secret immediately; this is the value used for future service logins. Rotation invalidates the old client secret for new logins. It does not revoke already-issued access or refresh tokens.

### 4.2 Patient records

All patient operations are automatically scoped to the authenticated administrator's tenant.

#### Create a patient

```http
POST /api/v1.0/admins/patients
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
Content-Type: application/json
```

```json
{
  "fullName": "Ahmad Mohammad Ali",
  "dateOfBirth": "1990-05-14",
  "phoneLast4": "4821",
  "medicalRecordNumber": "MRN-100024"
}
```

Success: `201 Created`

| Field | Required | Format |
|---|---:|---|
| `fullName` | Yes | String |
| `dateOfBirth` | Yes | `YYYY-MM-DD` |
| `phoneLast4` | No | Exactly four digits, sent as a string |
| `medicalRecordNumber` | No | String |

#### List patients

```http
GET /api/v1.0/admins/patients
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
```

Success: `200 OK`. Returns an array sorted newest first. This endpoint is not currently paginated.

#### Get a patient

```http
GET /api/v1.0/admins/patients/{patientId}
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
```

Success: `200 OK`.

### 4.3 Biopsy records

#### Create a biopsy

```http
POST /api/v1.0/admins/biopsies
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
Content-Type: application/json
```

```json
{
  "patientId": "66f1a7d9bc0123456789abcd",
  "sampleNumber": "BX-2026-00042",
  "expectedReadyAt": "2026-09-24T10:00:00.000Z"
}
```

Success: `201 Created`.

`patientId` must be a 24-character MongoDB ObjectId belonging to the authenticated tenant. `expectedReadyAt` is optional and must be an ISO 8601 date-time. `sampleNumber` must be unique within the tenant.

#### Update a biopsy

```http
PATCH /api/v1.0/admins/biopsies/{biopsyId}
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
Content-Type: application/json
```

Supply one or both fields:

```json
{
  "sampleNumber": "BX-2026-00042-R1",
  "expectedReadyAt": "2026-09-25T10:00:00.000Z"
}
```

Success: `200 OK`.

#### List a patient's biopsies

```http
GET /api/v1.0/admins/biopsies?patientId={patientId}
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
```

Success: `200 OK`. Returns an array sorted newest first. This endpoint is not currently paginated.

#### Get a biopsy

```http
GET /api/v1.0/admins/biopsies/{biopsyId}
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
```

Success: `200 OK`.

### 4.4 Result records

Admin result responses may contain sensitive clinical data, including the raw report and internal classification. Never expose these responses directly to a patient or an AI patient-facing tool. Use the patient-safe endpoint in section 3.4 for that purpose.

#### Create a result

```http
POST /api/v1.0/admins/results
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
Content-Type: application/json
```

```json
{
  "biopsyId": "66f1a84abc0123456789abcf",
  "status": "DRAFT",
  "classification": "NORMAL",
  "rawReport": "Internal pathology report text"
}
```

Success: `201 Created`.

| Field | Required | Allowed values / format |
|---|---:|---|
| `biopsyId` | Yes | 24-character MongoDB ObjectId |
| `status` | Yes | `DRAFT`, `FINAL` |
| `classification` | Yes | `NORMAL`, `BENIGN`, `MALIGNANT`, `CRITICAL` |
| `rawReport` | No | String |

When a result is created or updated as `FINAL`, the server sets `issuedAt` if it was not already set.

#### Update a result

```http
PATCH /api/v1.0/admins/results/{resultId}
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
Content-Type: application/json
```

Supply any of the following fields:

```json
{
  "status": "FINAL",
  "classification": "BENIGN",
  "rawReport": "Final internal pathology report text"
}
```

Success: `200 OK`.

#### List a biopsy's results

```http
GET /api/v1.0/admins/results?biopsyId={biopsyId}
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
```

Success: `200 OK`. Returns an array sorted newest first. This endpoint is not currently paginated.

#### Get a result

```http
GET /api/v1.0/admins/results/{resultId}
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
```

Success: `200 OK`.

### 4.5 Webhooks

Webhook configuration uses the tenant-admin account token.

#### Create a webhook

```http
POST /api/v1.0/admins/webhooks
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
Content-Type: application/json
```

```json
{
  "url": "https://tenant.example.com/webhooks/medical-lab",
  "events": [
    "PATIENT_VERIFIED",
    "BIOPSY_STATUS_UPDATED",
    "BIOPSY_RESULT_READY"
  ],
  "maxRetryAttempts": 3
}
```

Success: `201 Created`.

Supported event values:

| Event | Trigger | `data` fields |
|---|---|---|
| `PATIENT_VERIFIED` | A patient is successfully verified | `patientId`, `verificationMethod` |
| `BIOPSY_STATUS_UPDATED` | A result is created or updated | `resultId`, `biopsyId`, `patientId`, `status` |
| `BIOPSY_RESULT_READY` | A result is created or updated with `FINAL` status | `resultId`, `biopsyId`, `patientId`, `status` |

`TEST` is also accepted by the configuration schema but is reserved for administrative testing and is not emitted in the normal tenant workflow.

Webhook request envelope:

```json
{
  "event": "BIOPSY_RESULT_READY",
  "occurredAt": "2026-09-22T13:40:12.123Z",
  "data": {
    "resultId": "66f1a8f2bc0123456789abce",
    "biopsyId": "66f1a84abc0123456789abcf",
    "patientId": "66f1a7d9bc0123456789abcd",
    "status": "FINAL"
  }
}
```

Delivery behavior:

- Requests use `POST` with `Content-Type: application/json`.
- The receiver must return HTTP `200` or `201` for the delivery to be marked successful.
- `maxRetryAttempts` currently means the maximum total number of delivery attempts, including the first attempt. Its default is `1`.
- Delivery can be repeated after failure; webhook handlers must be idempotent.
- Webhook events do not include the raw clinical report.
- The current implementation does not include a webhook signature or authentication header. Protect the endpoint with network controls as appropriate and do not rely on the payload alone to prove sender authenticity.

#### List webhooks

```http
GET /api/v1.0/admins/webhooks
GET /api/v1.0/admins/webhooks?isActive=true
GET /api/v1.0/admins/webhooks?isActive=false
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
```

Success: `200 OK`

```json
{
  "total": 1,
  "data": [
    {
      "_id": "66f1aa00bc0123456789abc2",
      "url": "https://tenant.example.com/webhooks/medical-lab",
      "events": ["BIOPSY_RESULT_READY"],
      "isActive": true,
      "maxRetryAttempts": 3
    }
  ]
}
```

#### Get a webhook

```http
GET /api/v1.0/admins/webhooks/{webhookId}
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
```

Success: `200 OK`.

#### Update a webhook

The update endpoint accepts a partial object even though it uses `PUT`.

```http
PUT /api/v1.0/admins/webhooks/{webhookId}
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
Content-Type: application/json
```

```json
{
  "isActive": false
}
```

Updatable fields are `url`, `events`, `maxRetryAttempts`, and `isActive`.

Success: `200 OK`.

#### Delete a webhook

```http
DELETE /api/v1.0/admins/webhooks/{webhookId}
Authorization: Bearer <ACCOUNT_ACCESS_TOKEN>
```

Success: `200 OK` with no response body.

## 5. Response and validation conventions

### Resource identifiers

Resource identifiers are 24-character MongoDB ObjectId strings. In the current admin API, write responses commonly expose the resource identifier as `id`, while read/list responses may expose it as `_id`. Integrations should currently accept either name. Endpoint parameters such as `{patientId}` always expect the identifier string itself.

### Dates

- Date-only values use `YYYY-MM-DD`, for example `1990-05-14`.
- Date-time values use ISO 8601 in UTC where possible, for example `2026-09-24T10:00:00.000Z`.

### Validation

Unknown request-body properties are removed. Invalid or missing values return `400 Bad Request`, commonly in this form:

```json
{
  "message": [
    "dateOfBirth must be YYYY-MM-DD"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Common status codes

| Status | Meaning |
|---:|---|
| `200 OK` | Successful read, update, delete, or token-protected action |
| `201 Created` | Successful login, refresh, verification, or resource creation |
| `400 Bad Request` | Invalid JSON field, format, enum, date, or ObjectId |
| `401 Unauthorized` | Missing/invalid token, failed verification, insufficient permission, or insufficient role |
| `404 Not Found` | Requested tenant resource or patient result does not exist |
| `409 Conflict` | A unique value such as a sample number already exists |
| `500 Internal Server Error` | Unexpected server error |

Typical unauthorized response:

```json
{
  "message": "Unauthorized",
  "statusCode": 401
}
```

Do not build application logic around the human-readable `message`. Use the HTTP status and documented response fields.

## 6. Recommended integration behavior

1. Cache the service access token only until its reported expiry and refresh it before the next protected request.
2. Do not request patient results until patient verification succeeds.
3. Use a patient-verification token only with the `patientId` returned in the same verification response.
4. Display `patientMessage` as returned. Do not infer or generate a more specific diagnosis from `CLINICIAN_REVIEW_REQUIRED`.
5. Never expose admin result payloads or `rawReport` through a patient-facing channel.
6. Treat `401` patient-verification failures generically; do not tell the caller which identifier failed.
7. Make webhook receivers fast and idempotent, and return `200` or `201` only after accepting the event.

## 7. Endpoint summary

| Method | Path | Authentication | Purpose |
|---|---|---|---|
| `POST` | `/auth/tenant/login` | Client credentials in body | Obtain service tokens |
| `POST` | `/auth/tenant/refresh` | Refresh token in body | Refresh service tokens |
| `POST` | `/patients/verify` | Service token | Verify patient identity |
| `GET` | `/results/{patientId}/latest` | Service token + patient token | Get latest patient-safe result |
| `POST` | `/auth/account/login` | Email/password in body | Obtain admin token |
| `GET` | `/auth/account/me` | Admin token | Get current account |
| `PATCH` | `/auth/account/password/update` | Admin token | Change own password |
| `PATCH` | `/auth/account/client-secret/reset` | Admin token | Rotate tenant client secret |
| `POST` | `/admins/patients` | Admin token | Create patient |
| `GET` | `/admins/patients` | Admin token | List patients |
| `GET` | `/admins/patients/{patientId}` | Admin token | Get patient |
| `POST` | `/admins/biopsies` | Admin token | Create biopsy |
| `PATCH` | `/admins/biopsies/{biopsyId}` | Admin token | Update biopsy |
| `GET` | `/admins/biopsies?patientId={patientId}` | Admin token | List patient biopsies |
| `GET` | `/admins/biopsies/{biopsyId}` | Admin token | Get biopsy |
| `POST` | `/admins/results` | Admin token | Create result |
| `PATCH` | `/admins/results/{resultId}` | Admin token | Update result |
| `GET` | `/admins/results?biopsyId={biopsyId}` | Admin token | List biopsy results |
| `GET` | `/admins/results/{resultId}` | Admin token | Get result |
| `POST` | `/admins/webhooks` | Admin token | Create webhook |
| `GET` | `/admins/webhooks` | Admin token | List webhooks |
| `GET` | `/admins/webhooks/{webhookId}` | Admin token | Get webhook |
| `PUT` | `/admins/webhooks/{webhookId}` | Admin token | Update webhook |
| `DELETE` | `/admins/webhooks/{webhookId}` | Admin token | Delete webhook |

All paths in this table are relative to:

```text
https://<YOUR-API-HOST>/api/v1.0
```
