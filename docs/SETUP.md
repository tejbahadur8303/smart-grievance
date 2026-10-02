# Quick Setup & Execution Guide

## Prerequisites
- **Node.js**: v18+ (Current: v24.15.0)
- **npm**: v9+
- **MongoDB**: Running locally on port `27017` or via Docker:
  ```bash
  # Start MongoDB via Homebrew (macOS)
  brew services start mongodb-community
  # OR via Docker
  docker run -d -p 27017:27017 --name mongo-local mongo:7.0
  ```
- **Flutter SDK** (for Citizen and Worker apps)

---

## 1. Backend Setup & Run

```bash
cd backend
npm install
npm run seed     # Seeds realistic demo data and accounts
npm run dev      # Starts API server on http://localhost:5002
```

Verify health check:
```bash
curl http://localhost:5002/health
# Response: {"success":true,"status":"healthy",...}

```

Run tests:
```bash
npm test
```

---

## 2. District Admin Web Portal Setup

```bash
cd apps/admin_web
npm install
npm run dev      # Starts on http://localhost:3000
```
Login with:
- **Phone**: `9876543200`
- **Password**: `Village@123`

---

## 3. Panchayat Officer Web Portal Setup

```bash
cd apps/panchayat_web
npm install
npm run dev      # Starts on http://localhost:3001
```
Login with:
- **Phone**: `9876543201`
- **Password**: `Village@123`

---

## 4. Flutter Citizen App Setup

```bash
cd apps/citizen_flutter
flutter pub get
flutter run
```
Login with:
- **Phone**: `9876543203`
- **Password**: `Village@123`

---

## 5. Flutter Field Worker App Setup

```bash
cd apps/worker_flutter
flutter pub get
flutter run
```
Login with:
- **Phone**: `9876543202`
- **Password**: `Village@123`
