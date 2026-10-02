# API Reference Specification

Base URL: `http://localhost:5002/api/v1`


## Authentication (`/auth`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/auth/register` | Public | Register new Citizen / User |
| `POST` | `/auth/login` | Public | Authenticate via phone and password |
| `POST` | `/auth/refresh` | Public | Refresh JWT access token |
| `GET` | `/auth/profile` | Authenticated | Retrieve authenticated user profile |
| `GET` | `/auth/workers` | Officer / Admin | List available field technicians |

## Grievances & Redressal (`/complaints`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/complaints` | Citizen | File new grievance (supports photos, audio, GPS) |
| `GET` | `/complaints` | Scoped by Role | List complaints with filters |
| `GET` | `/complaints/:id` | Scoped by Role | Get single complaint record |
| `GET` | `/complaints/:id/timeline` | Scoped by Role | Get audit trail & work order timeline |
| `POST` | `/complaints/:id/verify` | Officer / Admin | Ground verification / rejection |
| `POST` | `/complaints/:id/assign` | Officer / Admin | Assign field technician with deadline |
| `POST` | `/complaints/:id/verify-resolution` | Citizen Only | Verify resolution (Yes &rarr; Closed, No &rarr; Reopened) |
| `POST` | `/complaints/:id/feedback` | Citizen Only | Submit satisfaction star rating & review |

## Voice & AI (`/voice`, `/ai`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/voice/transcribe` | Public | Upload audio & convert to text |
| `POST` | `/ai/analyze-complaint` | Public | Auto-classify category, priority & SLA |
| `POST` | `/ai/chat` | Public | Citizen assistant conversation |

## Field Worker Tasks (`/tasks`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/tasks` | Worker | List assigned work orders |
| `POST` | `/tasks/:id/accept` | Worker | Accept work assignment |
| `POST` | `/tasks/:id/reject` | Worker | Decline with reason |
| `POST` | `/tasks/:id/start` | Worker | Start work & upload before photos |
| `POST` | `/tasks/:id/complete` | Worker | Upload after photos, GPS & notes |

## Welfare & Schemes (`/welfare`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/welfare/schemes` | Public | Browse active government schemes |
| `POST` | `/welfare/schemes` | Admin | Create new rural welfare scheme |
| `POST` | `/welfare/apply` | Citizen | Apply for scheme with documents |
| `GET` | `/welfare/applications` | Authenticated | Track application statuses |
| `POST` | `/welfare/applications/:id/review` | Officer / Admin | Sanction or request documents |

## Ration / PDS Transparency (`/ration`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/ration/shops` | Authenticated | List Fair Price Shops |
| `GET` | `/ration/shops/:id/allocations` | Authenticated | Monthly quota allocation details |
| `GET` | `/ration/my-distributions` | Citizen | View masked card entitlement & history |
| `POST` | `/ration/report-grievance` | Citizen | Report short quantity or dealer misconduct |
| `GET` | `/ration/grievances` | Officer / Admin | List PDS discrepancy complaints |

## Analytics & Escalations (`/analytics`, `/escalations`)

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/analytics/overview` | Officer / Admin | Live aggregation stats |
| `GET` | `/analytics/complaints-by-category` | Officer / Admin | Category breakdown |
| `GET` | `/analytics/complaints-by-village` | Officer / Admin | Village distribution |
| `GET` | `/analytics/trends` | Officer / Admin | Monthly turnaround curve |
| `GET` | `/analytics/ai-summary` | Officer / Admin | Generated weekly briefing |
| `POST` | `/escalations/check` | Officer / Admin | Manual trigger for SLA breach scanner |
| `GET` | `/escalations` | Officer / Admin | List all escalated cases |
