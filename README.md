# Piring Sehat - Aplikasi Kalkulator Kalori

Aplikasi web untuk menghitung kalori makanan dan merekomendasikan makanan sehat.

## Setup Development Lokal

### 1. Setup Environment Variables

Copy file `.env.example` menjadi `.env` dan isi dengan nilai yang sesuai:

```bash
cp .env.example .env
```

**Penting untuk development lokal:**
```
VITE_BACKEND_URL=http://localhost:3000
```

Pastikan `VITE_BACKEND_URL` menunjuk ke `http://localhost:3000` untuk development lokal, bukan ke production URL.

### 2. Install Dependencies

**Frontend:**
```bash
npm install
```

**Backend:**
```bash
cd server
npm install
```

### 3. Jalankan Server Backend

Di folder `server`:
```bash
node index.js
```

Server akan berjalan di `http://localhost:3000`

### 4. Jalankan Frontend Development

Di folder root:
```bash
npm run dev
```

Frontend akan berjalan di `http://localhost:5173`

### 5. Seed Database (Opsional)

Jika database kosong, jalankan seed untuk menambahkan data sample:

```bash
cd server
npm run seed
```

## Struktur Project

```
piring-sehat/
├── src/                    # Frontend React
│   ├── components/        # React components
│   ├── services/          # API services
│   └── assets/            # Images & static files
├── server/                # Backend Express
│   ├── routes/            # API routes
│   ├── services/          # Business logic
│   ├── middleware/        # Auth middleware
│   └── seed.js            # Database seeding
├── .env.example           # Environment variables template
└── README.md              # This file
```

## Fitur

- Cari makanan dari database
- Lihat rekomendasi makanan sehat
- Hitung kalori makanan
- Lihat informasi nutrisi (protein, karbohidrat, lemak)
- Gambar makanan dari database

## Troubleshooting

### CORS Error
Jika mendapat error CORS, pastikan:
1. Backend server berjalan di `http://localhost:3000`
2. `.env` memiliki `VITE_BACKEND_URL=http://localhost:3000`
3. Refresh halaman browser

### Rekomendasi Kosong
Jika rekomendasi tidak muncul:
1. Pastikan backend server berjalan
2. Jalankan `npm run seed` di folder `server`
3. Refresh halaman browser

### Database Error
Pastikan Supabase credentials di `.env` sudah benar dan database sudah terbuat.
