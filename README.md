# Backend Server For 17 Ramadhan

## Deskripsi

Aplikasi ini adalah backend server yang dirancang untuk API Sistem Absensi Berbasis RFID 17 Ramadhan. Backend ini menyediakan berbagai layanan dan fungsionalitas untuk mendukung aplikasi terkait Sistem Absensi.

## Fitur Utama

- RESTful API: Menyediakan endpoint untuk mengakses data terkait Ramadhan.
- Autentikasi dan Otorisasi: Menggunakan JSON Web Tokens (JWT) untuk mengamankan endpoint.
- Pengelolaan Data: Menggunakan Prisma dan Sequelize untuk interaksi dengan database MySQL.
- File Upload: Menggunakan Multer untuk menangani upload file.
- Socket.io: Untuk komunikasi real-time antara server dan client side.

## Teknologi yang Digunakan

- Node.js: Server runtime untuk aplikasi.
- @whiskeysockets/baileys : Library untuk membangun whatsapp multi version, untuk mengirim pesan notifikasi berbasis whatsapp.
- bcryptjs : Algoritma kriptografi untuk hashing password.
- Express: Framework web untuk Node.js.
- Prisma: ORM untuk mengelola model database.
- MySQL: Database yang digunakan untuk menyimpan data.
- JWT: Untuk keamanan dan autentikasi pengguna.
- dotenv: Untuk mengelola variabel lingkungan.
