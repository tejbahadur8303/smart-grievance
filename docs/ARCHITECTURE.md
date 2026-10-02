# System Architecture & Technical Specifications

## 1. High-Level Architectural Overview

The **Smart Grievance Redressal & Tracking System for Villages** is a digital governance and public welfare transparency platform architected for rural Indian village ecosystems.

```
[ Citizen Flutter App ]       [ Field Worker Flutter App ]
  (Voice-First / Hindi)        (Proof of Work & GPS)
           │                               │
           ▼                               ▼
      ┌─────────────────────────────────────────┐
      │   Node.js / Express REST API + Socket   │
      └─────────────────────────────────────────┘
           │                  │                │
           ▼                  ▼                ▼
   [ AI & STT Engine ]  [ MongoDB DB ]   [ Scheduler ]
   - Gemini / Rules     - GeoJSON / TTL  - Node-Cron SLA
           ▲                  ▲
           │                  │
[ Panchayat Officer Web ]   [ District Admin Web ]
   (React / Vite / TS)       (React / Vite / TS)
```

## 2. Core Modules

### 2.1 AI-Powered Redressal Engine
- **Voice-First Input**: Citizen speaks complaint in Hindi/English &rarr; Audio processed by Speech-to-Text abstraction &rarr; Editable transcript presented to citizen.
- **Categorization & Department Routing**: Deterministic keywords + Gemini NLP map complaints to one of 14 civic categories and assign responsible rural departments.
- **Priority Engine**: Evaluates public safety risks, live wires, drinking water disruptions, and affected population multipliers to generate deterministic scores (0-100) and SLA deadlines.
- **Duplicate Detection**: Combines text token overlap with geospatial proximity (Haversine formula &lt; 500m) to identify recurring complaints for Panchayat consolidation.

### 2.2 Field Worker Proof-of-Work
- Field technicians accept work orders, capture timestamped before-work photos, and upload after-work photos with GPS validation.
- Marking work complete transitions the grievance into `RESOLVED` / `CITIZEN_VERIFICATION_PENDING`.

### 2.3 Mandatory Citizen Verification
- The citizen is prompted: **"क्या आपकी समस्या का समाधान हो गया है? (Has your issue been resolved?)"**
- **Yes, Resolved**: Complaint closes permanently (`CLOSED`), capturing citizen satisfaction star rating (1-5) and feedback.
- **No, Issue Still Exists**: Complaint is automatically reopened (`REOPENED`), alerting the Panchayat Officer for urgent rework.

### 2.4 Automatic SLA Multi-Tier Escalation
- Background cron runner inspects active complaints against configured `SlaRule` limits:
  - `LEVEL_1`: Alert to Panchayat Officer.
  - `LEVEL_2`: Alert to Block Development Officer / Panchayat Head.
  - `LEVEL_3`: Direct alert to District Magistrate / Administrator.

### 2.5 Welfare Schemes & Ration/PDS Transparency
- **Welfare Module**: Publication of rural schemes (PM Awas Gramin, PM Kisan, Pensions), online application submission, and officer physical verification.
- **Ration Transparency**: Fair Price Shop monthly quotas (Wheat, Rice, Sugar) and immediate citizen reporting for short quantities, overcharging, or closed shops.
