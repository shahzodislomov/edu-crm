<div align="center">

# 🎓 EduCRM

**O'quv markazlari uchun kompleks boshqaruv tizimi**

![Python](https://img.shields.io/badge/Python-3.12-blue?style=for-the-badge&logo=python)
![Django](https://img.shields.io/badge/Django-6.0-green?style=for-the-badge&logo=django)
![DRF](https://img.shields.io/badge/DRF-3.x-red?style=for-the-badge)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-blue?style=for-the-badge&logo=postgresql)
![Docker](https://img.shields.io/badge/Docker-latest-blue?style=for-the-badge&logo=docker)

</div>

---

## 📌 Loyiha haqida

EduCRM — o'quv markazlardagi barcha jarayonlarni bitta tizimga yig'ish uchun mo'ljallangan backend API. O'quvchilar, o'qituvchilar, guruhlar, davomat, topshiriqlar va to'lovlarni boshqarish imkonini beradi.

---

## 🚀 Imkoniyatlar

| Modul | Tavsif |
|---|---|
| 🔐 Auth | JWT asosida kirish, rol bo'yicha ruxsat (Admin, Teacher, Student) |
| 👨‍🎓 O'quvchilar | To'liq CRUD, profil boshqaruvi, filter va qidiruv |
| 👨‍🏫 O'qituvchilar | To'liq CRUD, fan va maosh kuzatuvi |
| 📚 Kurslar | Kurs boshqaruvi, narx va davomiylik |
| 👥 Guruhlar | Guruh boshqaruvi, jadval, o'quvchi biriktirish |
| ✅ Davomat | Ommaviy davomat belgilash, statistika |
| 📝 Topshiriqlar | Yaratish, yuborish, baholash zanjiri |
| 💰 To'lovlar | Qo'lda to'lov, qarzdorlar ro'yxati, daromad statistikasi |
| 🔔 Bildirishnomalar | Foydalanuvchi xabarlari tizimi |
| 📊 Dashboard | Admin uchun umumiy statistika |

---

## 🛠 Texnologiyalar
Backend:    Python 3.12, Django 6.0, Django REST Framework
Database:   PostgreSQL 17
Auth:       JWT (djangorestframework-simplejwt)
Docs:       Swagger (drf-spectacular)
Admin:      Django Admin + Jazzmin
Docker:     Docker + Docker Compose

---

## 📦 O'rnatish

### Lokal muhitda

**1. Repozitoriyani klonlash**
```bash
git clone https://github.com/rayhon-dev/crm-platform-mvp.git
cd crm-platform-mvp
```

**2. Virtual muhit yaratish**
```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate
```

**3. Paketlarni o'rnatish**
```bash
pip install -r requirements.txt
```

**4. Muhit o'zgaruvchilarini sozlash**
```bash
cp .env.example .env
```

`.env` faylni oching va quyidagilarni to'ldiring:
SECRET_KEY=your-secret-key
DB_NAME=educrm_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

**5. Ma'lumotlar bazasini yaratish**
```bash
python manage.py migrate
```

**6. Test ma'lumotlarni yuklash**
```bash
python manage.py seed
```

**7. Serverni ishga tushirish**
```bash
python manage.py runserver
```

---

### Docker bilan

```bash
docker-compose up --build
```

---

## 📚 API Hujjatlari

Server ishga tushgandan so'ng Swagger orqali barcha endpointlarni ko'rish mumkin:
http://127.0.0.1:8000/api/docs/

---

## 👤 Standart foydalanuvchilar

Seed dan keyin quyidagi foydalanuvchilar avtomatik yaratiladi:

| Rol | Username | Parol |
|---|---|---|
| Admin | admin | admin12345 |
| O'qituvchi | teacher_sardor | test12345 |
| O'qituvchi | teacher_malika | test12345 |
| O'quvchi | student_ali | test12345 |
| O'quvchi | student_aziz | test12345 |

---

## 🔑 Asosiy API Endpointlar
POST   /api/auth/login/              → Tizimga kirish

POST   /api/auth/refresh/            → Tokenni yangilash

GET    /api/auth/me/                 → O'z ma'lumotlari

GET    /api/students/                → O'quvchilar ro'yxati

POST   /api/students/                → O'quvchi yaratish

GET    /api/teachers/                → O'qituvchilar ro'yxati

POST   /api/teachers/                → O'qituvchi yaratish

GET    /api/courses/                 → Kurslar ro'yxati

POST   /api/courses/                 → Kurs yaratish

GET    /api/groups/                  → Guruhlar ro'yxati

POST   /api/groups/                  → Guruh yaratish

POST   /api/groups/{id}/add_student/ → Guruhga o'quvchi qo'shish

POST   /api/groups/{id}/add_schedule/→ Guruhga jadval qo'shish

POST   /api/attendance/bulk/         → Ommaviy davomat belgilash

GET    /api/attendance/              → Davomat ro'yxati

GET    /api/assignments/             → Topshiriqlar ro'yxati

POST   /api/assignments/             → Topshiriq yaratish

POST   /api/assignments/{id}/submit/ → Topshiriq yuborish

POST   /api/submissions/{id}/grade/  → Baho qo'yish

GET    /api/payments/                → To'lovlar ro'yxati

POST   /api/payments/                → To'lov kiritish

GET    /api/payments/debtors/        → Qarzdorlar ro'yxati

GET    /api/payments/summary/        → Daromad statistikasi

GET    /api/dashboard/               → Umumiy statistika



<div align="center">

Made by [Rayhon](https://github.com/rayhon-dev)

</div>
