# Expense Tracker API

REST API untuk mencatat dan memantau pemasukan serta pengeluaran pribadi. Dibangun dengan NestJS, Prisma, dan PostgreSQL.

---

## Tech Stack

- **Runtime**: Node.js
- **Framework**: NestJS
- **ORM**: Prisma
- **Database**: PostgreSQL (Supabase)
- **Auth**: JWT (Access Token + Refresh Token)
- **Password Hashing**: bcrypt
- **Validation**: class-validator & class-transformer
- **Testing**: Jest + Supertest

---

## Fitur

- Registrasi & login user
- Refresh token & logout
- Manajemen kategori (per user)
- Manajemen transaksi (income/expense)
- Filter & pagination transaksi
- Laporan transaksi per bulan
- Data chart breakdown per kategori

---

## Struktur Folder

```
src/
├── applications/          # Use cases (business logic)
│   ├── authentications/
│   ├── categories/
│   ├── transactions/
│   └── users/
├── domains/               # Entity, repository interface, token
│   ├── authentications/
│   ├── categories/
│   ├── security/
│   ├── transactions/
│   └── users/
├── infrastructures/       # Implementasi konkret (Prisma, JWT, bcrypt)
│   ├── database/
│   ├── modules/
│   ├── repository/
│   └── security/
└── interfaces/            # HTTP layer (controller, DTO, decorator, filter)
    └── http/
        ├── authentications/
        ├── categories/
        ├── decorators/
        ├── filters/
        └── transactions/
```

---

## Setup Lokal

### 1. Clone repository

```bash
git clone https://github.com/username/expense-tracker-api.git
cd expense-tracker-api
```

### 2. Install dependencies

```bash
npm install
```

### 3. Buat file `.env`

```env
DATABASE_URL="postgresql://user:password@localhost:5432/expense_tracker"
JWT_SECRET="your_jwt_secret_here"
```

### 4. Jalankan migrasi database

```bash
npx prisma migrate dev
```

### 5. Jalankan aplikasi

```bash
# Development
npm run start:dev

# Production
npm run build
npm run start:prod
```

### 6. Jalankan test

```bash
npm run test
```

---

## Dokumentasi API

Base URL: `http://localhost:3000`

Semua endpoint kecuali `/auth/*` membutuhkan header:

```
Authorization: Bearer <access_token>
```

---

### Auth

#### Register

```
POST /auth/register
```

Request body:

```json
{
  "email": "user@example.com",
  "fullName": "John Doe",
  "password": "secret123"
}
```

Response `201`:

```json
{
  "message": "User registered successfully"
}
```

---

#### Login

```
POST /auth/login
```

Request body:

```json
{
  "email": "user@example.com",
  "password": "secret123"
}
```

Response `201`:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "abc123..."
}
```

---

#### Refresh Token

```
POST /auth/refresh
```

Request body:

```json
{
  "refreshToken": "abc123..."
}
```

Response `201`:

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "xyz456..."
}
```

---

#### Logout

```
POST /auth/logout
```

Request body:

```json
{
  "refreshToken": "abc123..."
}
```

Response `201`: kosong

---

### Category

#### Buat Kategori

```
POST /categories
```

Request body:

```json
{
  "name": "Makan"
}
```

Response `201`:

```json
{
  "id": "uuid",
  "name": "Makan",
  "userId": "uuid",
  "createdAt": "2026-05-02T10:00:00.000Z"
}
```

---

#### Get Semua Kategori

```
GET /categories
```

Response `200`:

```json
[
  {
    "id": "uuid",
    "name": "Makan",
    "userId": "uuid",
    "createdAt": "2026-05-02T10:00:00.000Z"
  }
]
```

---

#### Hapus Kategori

```
DELETE /categories/:id
```

Response `200`: kosong

---

### Transaction

#### Buat Transaksi

```
POST /transactions
```

Request body:

```json
{
  "amount": 50000,
  "type": "EXPENSE",
  "categoryId": "uuid"
}
```

Response `201`:

```json
{
  "id": "uuid",
  "userId": "uuid",
  "amount": 50000,
  "type": "EXPENSE",
  "categoryId": "uuid",
  "createdAt": "2026-05-02T10:00:00.000Z"
}
```

---

#### Get Semua Transaksi

```
GET /transactions?page=1&limit=10&type=EXPENSE&categoryId=uuid
```

Query params:
| Param | Tipe | Wajib | Keterangan |
|-------|------|-------|------------|
| page | number | tidak | Default: 1 |
| limit | number | tidak | Default: 10 |
| type | INCOME \| EXPENSE | tidak | Filter by tipe |
| categoryId | string | tidak | Filter by kategori |

Response `200`:

```json
{
  "data": [...],
  "total": 25
}
```

---

#### Get Transaksi Per Bulan

```
GET /transactions/monthly?month=5&year=2026
```

Response `200`:

```json
[
  {
    "id": "uuid",
    "amount": 50000,
    "type": "EXPENSE",
    "categoryId": "uuid",
    "createdAt": "2026-05-02T10:00:00.000Z"
  }
]
```

---

#### Get Chart Per Bulan

```
GET /transactions/chart?month=5&year=2026
```

Response `200`:

```json
[
  {
    "categoryId": "uuid",
    "categoryName": "Makan",
    "total": 250000
  },
  {
    "categoryId": "uuid",
    "categoryName": "Transport",
    "total": 100000
  }
]
```

---

#### Update Transaksi

```
PUT /transactions/:id
```

Request body:

```json
{
  "amount": 75000,
  "categoryId": "uuid"
}
```

Response `200`:

```json
{
  "id": "uuid",
  "amount": 75000,
  "categoryId": "uuid",
  ...
}
```

---

#### Hapus Transaksi

```
DELETE /transactions/:id
```

Response `200`: kosong

---

## Error Response

Semua error menggunakan format berikut:

```json
{
  "statusCode": 404,
  "message": "Transaction not found",
  "error": "Not Found",
  "path": "/transactions/invalid-id",
  "timestamp": "2026-05-02T10:00:00.000Z"
}
```

| Status | Keterangan                       |
| ------ | -------------------------------- |
| 400    | Validasi gagal                   |
| 401    | Token tidak valid atau tidak ada |
| 403    | Tidak punya akses ke resource    |
| 404    | Resource tidak ditemukan         |
| 409    | Email sudah terdaftar            |
| 500    | Internal server error            |
