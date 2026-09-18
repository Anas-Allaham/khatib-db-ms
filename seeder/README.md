# Khatib DB Seeder

Drop this `seeder/` folder at the repository root, beside `src/`.

```text
khatib-db-ms/
├── src/
├── seeder/
│   ├── data/
│   │   ├── medical-cases.data.ts
│   │   └── users.data.ts
│   ├── seed-users.ts
│   ├── seed-medical-cases.ts
│   ├── seed-all.ts
│   └── types.ts
└── package.json
```

## What is seeded

### Users

Creates 40 deterministic users in the selected tenant:

- `seed-user-001`
- `seed-user-002`
- ...
- `seed-user-040`

The current repository `User` schema only contains `ownerId` and `tenant`, so no fake profile fields are invented.

### Medical cases

Creates 40 linked cases:

`Patient -> Biopsy -> Result`

Distribution:

- 10 `DRAFT` results -> patient-facing `PENDING`
- 12 `FINAL / NORMAL`
- 10 `FINAL / BENIGN`
- 5 `FINAL / MALIGNANT`
- 3 `FINAL / CRITICAL`

The malignant and critical values exist only in the raw/admin data. The current patient-safe policy should map them to `CLINICIAN_REVIEW_REQUIRED`.

## Tenant behavior

If `SEED_TENANT_ID` is provided, seed data is inserted under that existing tenant.

Otherwise the scripts create/reuse this development tenant:

```text
clientId: medical-lab-seed-client
clientSecret: medical-lab-seed-secret
permissions: PATIENT_VERIFY, BIOPSY_READ
```

Optional environment variables:

```text
SEED_TENANT_ID=<existing mongo object id>
SEED_TENANT_CLIENT_ID=<custom client id>
SEED_TENANT_CLIENT_SECRET=<custom client secret>
```

Production seeding is blocked unless you explicitly set:

```text
ALLOW_PRODUCTION_SEED=true
```

## Run

Users only:

```bash
npx ts-node -r tsconfig-paths/register seeder/seed-users.ts
```

Medical cases only:

```bash
npx ts-node -r tsconfig-paths/register seeder/seed-medical-cases.ts
```

Everything:

```bash
npx ts-node -r tsconfig-paths/register seeder/seed-all.ts
```

Recommended `package.json` scripts:

```json
{
  "scripts": {
    "seed:users": "ts-node -r tsconfig-paths/register seeder/seed-users.ts",
    "seed:medical-cases": "ts-node -r tsconfig-paths/register seeder/seed-medical-cases.ts",
    "seed:all": "ts-node -r tsconfig-paths/register seeder/seed-all.ts"
  }
}
```

## Idempotency / cleanup

The user seeder removes only users whose `ownerId` starts with `seed-user-` for the selected tenant.

The medical case seeder removes only patients whose medical record number starts with `SEED-MRN-`, plus their linked biopsies and results.

It does not delete unrelated application data.
