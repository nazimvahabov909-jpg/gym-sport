# Hostinger-ə deploy

Baza və tətbiq eyni serverdədir, ona görə `DB_HOST = localhost`.

---

## 1. Server üzərində `.env` yaradın

Tətbiqin kök qovluğunda (git-ə getmir, əl ilə yaradılır):

```env
DATABASE_URL="mysql://u110913605_gym:PAROL@localhost:3306/u110913605_gym"

NEXT_PUBLIC_SITE_URL="https://darkslategray-lion-563187.hostingersite.com"
NEXT_PUBLIC_SITE_NAME="United Sport"

AUTH_SECRET="BURAYA_GENERASIYA_OLUNMUS_ACAR"
```

- `PAROL` yerinə hPanel-dəki baza parolunu yazın. Parolda `@ : / ? # & %`
  simvolları varsa, URL-encode edin (məsələn `@` → `%40`).
- `AUTH_SECRET` üçün açarı özünüz generasiya edin (repoda real açar saxlanmır):

  ```bash
  openssl rand -base64 32
  ```

  Çıxan dəyəri `.env`-ə yazın. Dəyişsəniz, bütün aktiv sessiyalar bağlanacaq.
- `NEXT_PUBLIC_SITE_URL` **build zamanı** koda yazılır. Domeni sonra
  dəyişsəniz, yenidən build etmək lazımdır.
- **`NODE_ENV` yazmayın.** Təyin olunsa, `npm install` devDependencies-i ötürür
  və build `tailwindcss` tapmadığı üçün dayanır. `next build` / `next start`
  bu dəyəri özü düzgün təyin edir.

---

## 2. Bazanı doldurun

`gym_sport.sql` faylını phpMyAdmin-dən `u110913605_gym` bazasına import edin.
Dump-da həm cədvəllər, həm də bütün məlumat var (211 məhsul, 18 kateqoriya,
4 brend, səhifələr, bloq, slayder, parametrlər).

Faylda `_prisma_migrations` cədvəli də var — ona görə Prisma miqrasiyaları
tətbiq olunmuş sayacaq və təkrar işə salmağa ehtiyac qalmayacaq.

> Alternativ (SSH varsa): `npx prisma migrate deploy && npm run db:import && npm run db:seed`

---

## 3. Build və başlatma

Hostinger `npm install` → `npm run build` → `npm start` ardıcıllığını özü
işlədir. `postinstall` Prisma client-i avtomatik generasiya edir.

Başlanğıc əmri: **`npm start`** (portu Hostinger `PORT` dəyişəni ilə verir).

---

## 4. İlk girişdən sonra

1. **Admin parolunu dəyişin.** Dump-dakı hesab: `admin@unitedsport.uz` /
   `admin123` — bu parol sənədlərdə açıq yazılıb, dərhal dəyişdirin.
2. Admin → Параметры bölməsində telefon, e-poçt, ünvan və sosial şəbəkələri
   doldurun.
3. Məhsul qiymətlərini təyin edin (hamısı «qiymət sorğu ilə» rejimindədir).

---

## 5. Yüklənən şəkillər

Admin paneldən yüklənən şəkillər `public/media/uploads/` qovluğuna düşür.
Bu qovluq **git-ə getmir** — deploy zamanı silinməməsi üçün Hostinger-də
davamlı (persistent) saxlanmalıdır. Deploy hər dəfə qovluğu təmizləyirsə,
şəkilləri ayrıca saxlama (object storage) lazım olacaq.

---

## Problem olarsa

| Əlamət | Səbəb |
| --- | --- |
| `Can't resolve '@/generated/prisma/client'` | `postinstall` işə düşməyib — `npm run build` özü `prisma generate` çağırır, ona görə build əmrinin dəyişdiyinə əmin olun |
| `prisma: command not found` | `.env`-də `NODE_ENV=production` var → devDependencies quraşdırılmır. Həmin sətri silin |
| `Cannot find module '@tailwindcss/postcss'` | Eyni səbəb — `NODE_ENV` sətrini silin |
| `TurbopackInternalError … globals.css` | Build konteynerində Turbopack-ın PostCSS alt-prosesi ölür. `build` əmri artıq `--webpack` istifadə edir |
| `pool timeout` və ya `database unavailable` | Layihə kökündə `.env.production` faylı varsa, Next onu `.env`-dən üstün tutur. Production konfiqurasiyasını **`.env`** adı ilə saxlayın |
| Build keçir, amma sayt boşdur | Baza import olunmayıb; build loglarında `[build] … database unavailable` sətirləri olur |
| `Access denied for user` | `DATABASE_URL`-də parol səhv və ya URL-encode edilməyib |
| Şəkillər açılmır | `public/media/` qovluğu deploy-a daxil olmayıb |
