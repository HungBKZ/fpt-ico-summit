# MongoDB Foundation Technical Documentation — Phase 2

This document details the server-only MongoDB database infrastructure, `SummitEdition` data model, schema validation, collection indexing, and multi-year edition architecture for **FPT ICO Summit 2026**.

---

## 1. Overview & Architecture

Phase 2 establishes the database foundation for the platform without coupling the public static site (`/en`, `/vi`) to live database availability.

Key architectural properties:
- **Official Driver**: Uses the official `mongodb` Node.js driver (no Mongoose ODM).
- **Server-Only Isolation**: Database connection helpers live exclusively in `src/lib/db/` and are never imported into Client Components (`"use client"`).
- **Lazy Connection Reuse**: MongoClient is instantiated lazily upon first query execution and cached globally during local Next.js development (handling Hot Module Replacement).
- **Zero Public Page Runtime Dependency**: Phase 1 static landing pages do NOT query MongoDB, allowing static site generation (`npm run build`) to succeed even without database credentials.

---

## 2. Environment Variables

Database configuration uses server-only environment variables:

| Variable | Description | Example / Default |
| :--- | :--- | :--- |
| `MONGODB_URI` | Full connection string (MongoDB Atlas or local) | `mongodb+srv://<user>:<password>@cluster.mongodb.net/?retryWrites=true&w=majority` |
| `MONGODB_DB_NAME` | Database name | `fpt_ico_summit` |

> [!CAUTION]
> Neither variable may be prefixed with `NEXT_PUBLIC_`. Credentials must never be logged or exposed to the client browser bundle.

---

## 3. SummitEdition Data Model

Annual summit cycles are represented by the `SummitEdition` domain model in `src/lib/db/models/summit-edition.ts`:

```typescript
type SummitEditionStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

interface SummitEdition {
  _id?: ObjectId;
  year: number;              // Four-digit integer (e.g. 2026)
  slug: string;              // URL slug (e.g. "2026")
  name: string;              // Official name (e.g. "FPT ICO Summit 2026")
  startDate: Date;           // Native BSON Date (UTC)
  endDate: Date;             // Native BSON Date (UTC)
  timezone: string;          // IANA Timezone string (e.g. "Asia/Ho_Chi_Minh")
  status: SummitEditionStatus;
  createdAt: Date;
  updatedAt: Date;
}
```

### Date Handling Rules
- `startDate` and `endDate` are stored as native UTC BSON `Date` values in MongoDB.
- Date strings formatted for localized UI display (e.g., "20–22 November 2026" / "20–22 tháng 11, 2026") must **NOT** be stored in the database.
- Presentation layers format UTC dates dynamically using the edition's `timezone` field (`"Asia/Ho_Chi_Minh"`).

---

## 4. Collection Names, Schema Validation & Indexes

### Active Collections
- `summitEditions`: Stores annual edition metadata, timezone, and lifecycle status.

### MongoDB JSON Schema Validator (`summitEditions`)
Enforced directly in MongoDB via `scripts/init-mongodb.mjs`:
- **Required fields**: `year`, `slug`, `name`, `startDate`, `endDate`, `timezone`, `status`, `createdAt`, `updatedAt`.
- **`timezone` Constraint**: Non-empty string (e.g. `"Asia/Ho_Chi_Minh"`).
- **`status` Enum**: Restricted to `["DRAFT", "ACTIVE", "ARCHIVED"]`.
- **Date Types**: Required to be native BSON `date` objects.

### Final Collection Indexes
| Index Name | Specification | Options | Purpose |
| :--- | :--- | :--- | :--- |
| `uniq_year` | `{ year: 1 }` | `unique: true` | Prevents duplicate edition years |
| `uniq_slug` | `{ slug: 1 }` | `unique: true` | Ensures unique edition URL slugs |
| `uniq_active_status` | `{ status: 1 }` | `unique: true`, `partialFilterExpression: { status: "ACTIVE" }` | Enforces that **only ONE** edition can be `ACTIVE` at any time |

---

## 5. Planned Future Collections (Phase 3+)

The following collection names are reserved in `src/lib/db/collections.ts`:

- `users`: User accounts with role-based access (Super Admin, ICO Admin, Partner Manager, Student User).
- `accountRequests`: Public partner and institution access request submissions.
- `organizations`: Master directory of registered universities, consulates, and corporate partners.
- `organizationParticipations`: Multi-year junction linking `Organization` to `SummitEdition` via `editionId`.
- `contentSubmissions`: Partner press releases, announcements, and media updates.
- `scholarships`: Scholarship offerings and eligibility criteria (linked via `editionId`).
- `activities`: Scheduled workshops, expo booths, and stage performances (linked via `editionId`).
- `registrations`: Student and attendee event registrations (linked via `editionId`).
- `auditLogs`: Audit trail for administrative actions and governance.

---

## 6. Multi-Year Summit Architecture Pattern

Organizations and partner accounts persist across multiple annual summits. To prevent data duplication:

```text
SummitEdition (2026)
    ↑
    │ editionId
OrganizationParticipation
    │
Organization (e.g., Partner University / Consulate)
```

- **`Organization`**: Stores permanent entity details (name, country, brand assets, logo).
- **`OrganizationParticipation`**: Stores edition-specific data (booth placement, confirmed status, representative contacts) for a given `editionId`.

---

## 7. Initialization & Testing Instructions

1. **Install Driver**:
   ```bash
   npm install mongodb
   ```

2. **Configure Local Environment**:
   Create `.env.local` based on `.env.example`:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/?retryWrites=true&w=majority
   MONGODB_DB_NAME=fpt_ico_summit
   ```

3. **Ping Connection**:
   ```bash
   node scripts/test-mongodb.mjs
   ```

4. **Initialize DB, Indexes & Seed 2026 Edition**:
   ```bash
   node scripts/init-mongodb.mjs
   ```

---

## 8. What Phase 2 Deliberately Excludes

- No authentication or login routes.
- No admin dashboard or account request forms.
- No public website database queries (`/en` and `/vi` remain static).
- No CRUD repositories for future collections (`users`, `organizations`, `scholarships`).
- No public `/api/db-test` endpoint.
