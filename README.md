# United Sport

unitedsport.uz mağazasının yeni versiyası: Next.js 16 (App Router), MySQL, dörd dil,
öz admin paneli.

---

## Tez başlanğıc

MAMP işləməlidir (MySQL portu **8889**).

```bash
npm install
npx prisma migrate deploy     # cədvəlləri yaradır
npm run db:import             # kataloqu JSON-dan bazaya yükləyir
npm run db:seed               # admin, səhifələr, slayder, bloq, parametrlər
npm run dev                   # http://localhost:3001
```

Admin panel: <http://localhost:3001/admin> — `admin@unitedsport.uz` / `admin123`
(`.env` faylındakı `ADMIN_EMAIL` / `ADMIN_PASSWORD` ilə təyin olunur).

> Şifrəni ilk girişdən sonra dəyişin və `AUTH_SECRET`-i production üçün
> `openssl rand -base64 32` ilə yenisi ilə əvəz edin.

---

## Texnologiyalar

| Sahə | Seçim | Səbəb |
| --- | --- | --- |
| Framework | Next.js 16, App Router | SSR/SSG, server actions, şəkil optimizasiyası |
| Dil | TypeScript (strict) | — |
| Stil | Tailwind CSS v4 | tokenlər `src/app/globals.css` içindədir |
| Baza | MySQL 8 + Prisma 7 | `@prisma/adapter-mariadb` sürücüsü ilə |
| i18n | next-intl | `ru` (default), `uz`, `en`, `az` |
| Auth | JWT (`jose`) + bcrypt | httpOnly cookie, müştəri və admin ayrı |
| İkonlar | lucide-react | — |

3D effektlər **saf CSS**-dir (perspective, `transform-style: preserve-3d`,
view timeline). WebGL kitabxanası yoxdur — mobil sürət üçün qəsdən belədir.

---

## Struktur

```
prisma/
  schema.prisma          28 cədvəl: kataloq, sifariş, məzmun, parametrlər
  seed.ts                admin + statik məzmun
  seed-content.ts        səhifə/bloq/slayder mətnləri (4 dil)
scripts/
  scrape-source.ts       canlı saytdan JSON-a yığır
  import-catalog.ts      JSON → MySQL (idempotent)
  build-messages.py      UI mətnlərini 4 dil faylına generasiya edir
  data/catalog.json      211 məhsul, yenidən import üçün saxlanılır
  dev/                   screenshot, layout audit, e2e skriptləri
src/
  app/(storefront)/[locale]/   mağaza — hər dil öz prefiksi ilə
  app/(admin)/admin/           admin panel (rus dilində, ayrı root layout)
  app/actions/                 server actions: cart, order, auth, lead, admin
  app/api/                     locale switch, session, şəkil yükləmə
  components/                  layout, catalog, cart, checkout, admin, home
  lib/                         db, auth, cart, seo, format, settings, queries
  messages/{ru,uz,en,az}.json  UI mətnləri (generasiya olunur — əl ilə redaktə etməyin)
  i18n/                        routing, navigation, request
  proxy.ts                     next-intl marşrutlaşdırma (əvvəlki adı middleware)
```

---

## Çoxdillilik

Hər dil **öz URL prefiksi və öz slug-ı** ilə işləyir:

```
/ru/catalog/begovye-dorozhki
/uz/catalog/yugurish-yo-lkalari
/en/catalog/treadmills
/az/catalog/qacis-yollari
```

Tərcümələr ayrıca cədvəllərdə saxlanılır (`ProductTranslation`,
`CategoryTranslation`, `PageTranslation`, `PostTranslation`, `SlideTranslation`,
`BrandTranslation`), ona görə hər dilin öz meta teqləri və slug-ı olur.

Dil dəyişdirici `/api/locale`-a keçir: server uyğun tərcüməni tapıb yönləndirir.
Sadə client-side dil dəyişimi hər məhsul səhifəsində 404 verərdi.

**UI mətnləri** `scripts/build-messages.py` faylındakı bir cədvəldən generasiya
olunur — hər açar dörd tərcümə tələb edir, əks halda build dayanır:

```bash
npm run messages
```

---

## SEO

- Hər səhifədə `canonical` + 5 `hreflang` (4 dil + `x-default`)
- `sitemap.xml` — 968 URL, hər birində dil alternativləri
- `robots.txt` — səbət, checkout, kabinet və axtarış indekslənmir
- JSON-LD: Organization, WebSite, BreadcrumbList, Product, BlogPosting
- Məhsul, bloq, info və əlaqə səhifələri **statik** render olunur

Ziyarətçiyə aid vəziyyət (səbət sayı, giriş, seçilmişlər) `/api/session`-dan
client tərəfdə gəlir — məhz buna görə kataloq səhifələri statik qala bilir.

---

## Skriptlər

| Əmr | Nə edir |
| --- | --- |
| `npm run dev` | dev server, port 3001 |
| `npm run build` / `start` | production |
| `npm run typecheck` | TypeScript yoxlaması |
| `npm run lint` | ESLint |
| `npm run scrape` | canlı saytdan məlumat yığır → `scripts/data/catalog.json` |
| `npm run db:import` | JSON-u bazaya yazır (təkrar işə salmaq olar) |
| `npm run db:seed` | admin, səhifələr, slayder, bloq, parametrlər |
| `npm run db:studio` | Prisma Studio |
| `npm run db:clean` | e2e test məlumatlarını silir |
| `npm run messages` | UI tərcümə fayllarını yenidən yaradır |
| `npm run e2e:order` | qonaq kimi: səbət → checkout → sifariş |
| `npm run e2e:admin` | admin panelin bütün bölmələri |
| `npm run e2e:admin-write` | admin redaktəsinin mağazaya çatması |
| `npm run check:locales` | 4 dildə əsas səhifələr + canonical/hreflang |
| `npm run check:hydration` | brauzer genişlənməsi simulyasiyası ilə hidrasiya |
| `npm run check:overlays` | mobil drawer, filtr paneli və modalların mövqeyi |
| `npm run check:drawer` | mobil menyunun davranışı (açıl/bağlan/keçid) |

E2E skriptləri quraşdırılmış Google Chrome-dan istifadə edir (`puppeteer-core`),
ona görə ayrıca brauzer yüklənmir.

---

## Kataloq məlumatları

`scripts/data/catalog.json` canlı saytdan yığılmış 211 məhsulu saxlayır.
`npm run db:import` onu bazaya yazır və təkrar işə salmaq təhlükəsizdir —
məhsullar `legacyId`, kateqoriyalar `key`, brendlər `slug` ilə tutuşdurulur.

Mənbə saytda təsvir və qiymət yox idi, ona görə bütün məhsullar
**«qiymət sorğu ilə»** rejimində import olunur. Qiymətləri və təsvirləri
admin panelindən doldurursunuz; sifariş verildikdə qiyməti olmayan pozisiyalar
`needsQuote` ilə işarələnir və menecer onları admin paneldə təyin edir.

Mənbə bazasının bir hissəsi cp1251 kodlaşması ilə xarab olmuşdu
(«Эспандеры» → «Р­СЃРїР°РЅРґРµСЂС‹»); scraper bunu avtomatik bərpa edir.

---

## Production üçün nələr lazımdır

- [ ] `.env`: `DATABASE_URL`, `AUTH_SECRET`, `NEXT_PUBLIC_SITE_URL` real dəyərlər
- [ ] Admin şifrəsini dəyişmək
- [ ] Yüklənən şəkillər `public/media/uploads` qovluğunda saxlanılır —
      serverdə bu qovluq davamlı (persistent) olmalıdır
- [ ] Onlayn ödəniş (Payme/Click) — hazırda `PaymentMethod.ONLINE` sxemdə var,
      inteqrasiya yazılmayıb
- [ ] Sifariş bildirişləri (e-poçt/Telegram) — hazırda yalnız admin paneldə görünür
