import type { Locale } from "../scripts/data/catalog-i18n";

type T = Record<Locale, string>;

export const SLIDES: { image: string; link: string; title: T; subtitle: T; button: T }[] = [
  {
    image: "/media/slides/slide1.jpg",
    link: "/catalog/begovye-dorozhki",
    title: {
      ru: "Беговые дорожки для дома и клуба",
      uz: "Uy va klub uchun yugurish yo‘lkalari",
      en: "Treadmills for home and club",
      az: "Ev və klub üçün qaçış yolları",
    },
    subtitle: {
      ru: "Ferro и VolksGym — от компактных до профессиональных моделей",
      uz: "Ferro va VolksGym — ixchamdan professional modellargacha",
      en: "Ferro and VolksGym — from compact to professional models",
      az: "Ferro və VolksGym — kompaktdan peşəkar modellərə qədər",
    },
    button: { ru: "Смотреть", uz: "Ko‘rish", en: "Browse", az: "Bax" },
  },
  {
    image: "/media/slides/slide2.jpg",
    link: "/catalog/silovye-trenazhery",
    title: {
      ru: "Силовое оборудование MBH Fitness",
      uz: "MBH Fitness kuch jihozlari",
      en: "MBH Fitness strength equipment",
      az: "MBH Fitness güc avadanlığı",
    },
    subtitle: {
      ru: "Укомплектуем зал под ключ — от скамей до грузоблочных станций",
      uz: "Zalni kalit topshirish asosida jihozlaymiz",
      en: "Turn-key gym fit-out, from benches to selectorised stations",
      az: "Zalı açar-təslim komplektləşdiririk",
    },
    button: { ru: "В каталог", uz: "Katalogga", en: "Shop now", az: "Kataloqa" },
  },
  {
    image: "/media/slides/slide3.jpg",
    link: "/catalog/fitnes-aksessuary",
    title: {
      ru: "Аксессуары Kettler для тренировок дома",
      uz: "Uyda mashq uchun Kettler aksessuarlari",
      en: "Kettler accessories for home training",
      az: "Evdə məşq üçün Kettler aksesuarları",
    },
    subtitle: {
      ru: "Коврики, мячи, эспандеры и утяжелители в наличии",
      uz: "Gilamchalar, to‘plar, espanderlar va og‘irliklar mavjud",
      en: "Mats, balls, expanders and weights in stock",
      az: "Xalçalar, toplar, espanderlər və ağırlıqlar mövcuddur",
    },
    button: { ru: "Выбрать", uz: "Tanlash", en: "Choose", az: "Seç" },
  },
];

export const PAGES: {
  key: string;
  sortOrder: number;
  title: T;
  slug: T;
  content: T;
}[] = [
  {
    key: "about",
    sortOrder: 10,
    title: { ru: "О компании", uz: "Kompaniya haqida", en: "About us", az: "Şirkət haqqında" },
    slug: { ru: "o-kompanii", uz: "kompaniya-haqida", en: "about-us", az: "sirket-haqqinda" },
    content: {
      ru: `<p>United Sport — поставщик профессионального оборудования для фитнес-клубов, спортивных залов и домашних тренировок в Узбекистане.</p>
<h2>Чем мы занимаемся</h2>
<ul><li>Подбор и поставка кардио- и силовых тренажёров</li><li>Проектирование и комплектация залов под ключ</li><li>Сборка, монтаж и сервисное обслуживание</li><li>Поставка аксессуаров и напольных покрытий</li></ul>
<h2>Бренды</h2><p>Мы являемся официальным поставщиком Ferro, VolksGym, MBH Fitness и Kettler.</p>`,
      uz: `<p>United Sport — O‘zbekistonda fitnes-klublar, sport zallari va uy mashg‘ulotlari uchun professional jihozlar yetkazib beruvchisi.</p>
<h2>Biz nima qilamiz</h2>
<ul><li>Kardio va kuch trenajyorlarini tanlash va yetkazib berish</li><li>Zallarni loyihalash va kalit topshirish asosida jihozlash</li><li>Yig‘ish, montaj va servis xizmati</li><li>Aksessuar va pol qoplamalari yetkazib berish</li></ul>
<h2>Brendlar</h2><p>Biz Ferro, VolksGym, MBH Fitness va Kettler rasmiy yetkazib beruvchisimiz.</p>`,
      en: `<p>United Sport supplies professional equipment for fitness clubs, sports halls and home training across Uzbekistan.</p>
<h2>What we do</h2>
<ul><li>Sourcing cardio and strength machines</li><li>Gym planning and turn-key fit-out</li><li>Assembly, installation and servicing</li><li>Accessories and gym flooring</li></ul>
<h2>Brands</h2><p>We are the official supplier of Ferro, VolksGym, MBH Fitness and Kettler.</p>`,
      az: `<p>United Sport — Özbəkistanda fitnes klubları, idman zalları və ev məşqləri üçün peşəkar avadanlıq tədarükçüsüdür.</p>
<h2>Nə edirik</h2>
<ul><li>Kardio və güc trenajyorlarının seçimi və tədarükü</li><li>Zalların layihələndirilməsi və açar-təslim komplektləşdirilməsi</li><li>Yığılma, montaj və servis xidməti</li><li>Aksesuar və döşəmə örtüklərinin tədarükü</li></ul>
<h2>Brendlər</h2><p>Ferro, VolksGym, MBH Fitness və Kettler-in rəsmi tədarükçüsüyük.</p>`,
    },
  },
  {
    key: "delivery",
    sortOrder: 20,
    title: { ru: "Доставка и оплата", uz: "Yetkazib berish va to‘lov", en: "Delivery & payment", az: "Çatdırılma və ödəniş" },
    slug: { ru: "dostavka-i-oplata", uz: "yetkazib-berish-va-tolov", en: "delivery-and-payment", az: "catdirilma-ve-odenis" },
    content: {
      ru: `<h2>Доставка</h2><p>Доставляем по Ташкенту и всем регионам Узбекистана. Крупногабаритное оборудование заносим в зал и собираем на месте.</p>
<h2>Сроки</h2><ul><li>Позиции в наличии — 1–3 рабочих дня</li><li>Под заказ — сроки уточняет менеджер</li></ul>
<h2>Оплата</h2><ul><li>Наличными при получении</li><li>Банковский перевод для юридических лиц</li><li>Картой при получении</li></ul>`,
      uz: `<h2>Yetkazib berish</h2><p>Toshkent va O‘zbekistonning barcha hududlariga yetkazib beramiz. Yirik jihozlarni zalga kiritib, joyida yig‘ib beramiz.</p>
<h2>Muddatlar</h2><ul><li>Mavjud mahsulotlar — 1–3 ish kuni</li><li>Buyurtma asosida — muddatni menejer aniqlaydi</li></ul>
<h2>To‘lov</h2><ul><li>Qabul qilishda naqd pul</li><li>Yuridik shaxslar uchun bank o‘tkazmasi</li><li>Qabul qilishda karta orqali</li></ul>`,
      en: `<h2>Delivery</h2><p>We deliver across Tashkent and every region of Uzbekistan. Large machines are carried into the room and assembled on site.</p>
<h2>Lead times</h2><ul><li>In stock — 1–3 working days</li><li>On order — confirmed by your manager</li></ul>
<h2>Payment</h2><ul><li>Cash on delivery</li><li>Bank transfer for companies</li><li>Card on delivery</li></ul>`,
      az: `<h2>Çatdırılma</h2><p>Daşkəndə və Özbəkistanın bütün regionlarına çatdırırıq. İriqabaritli avadanlığı zala gətirib yerində yığırıq.</p>
<h2>Müddətlər</h2><ul><li>Mövcud mövqelər — 1–3 iş günü</li><li>Sifarişlə — müddəti menecer dəqiqləşdirir</li></ul>
<h2>Ödəniş</h2><ul><li>Təhvil alarkən nağd</li><li>Hüquqi şəxslər üçün bank köçürməsi</li><li>Təhvil alarkən kartla</li></ul>`,
    },
  },
  {
    key: "warranty",
    sortOrder: 30,
    title: { ru: "Гарантия и сервис", uz: "Kafolat va servis", en: "Warranty & service", az: "Zəmanət və servis" },
    slug: { ru: "garantiya-i-servis", uz: "kafolat-va-servis", en: "warranty-and-service", az: "zemanet-ve-servis" },
    content: {
      ru: `<p>На всё оборудование действует официальная гарантия производителя. Срок зависит от модели и указывается в гарантийном талоне.</p>
<h2>Сервис</h2><p>У нас собственная сервисная служба: диагностика, ремонт, поставка запчастей и плановое обслуживание залов.</p>`,
      uz: `<p>Barcha jihozlarga ishlab chiqaruvchining rasmiy kafolati amal qiladi. Muddat modelga bog‘liq va kafolat talonida ko‘rsatiladi.</p>
<h2>Servis</h2><p>Bizda o‘z servis xizmatimiz bor: diagnostika, ta’mirlash, ehtiyot qismlar va zallarga rejali xizmat ko‘rsatish.</p>`,
      en: `<p>All equipment carries the manufacturer's official warranty. The term depends on the model and is stated on the warranty card.</p>
<h2>Service</h2><p>We run our own service team: diagnostics, repairs, spare parts and scheduled gym maintenance.</p>`,
      az: `<p>Bütün avadanlığa istehsalçının rəsmi zəmanəti şamil olunur. Müddət modeldən asılıdır və zəmanət talonunda göstərilir.</p>
<h2>Servis</h2><p>Öz servis xidmətimiz var: diaqnostika, təmir, ehtiyat hissələrinin tədarükü və zalların planlı texniki xidməti.</p>`,
    },
  },
  {
    key: "privacy",
    sortOrder: 40,
    title: { ru: "Политика конфиденциальности", uz: "Maxfiylik siyosati", en: "Privacy policy", az: "Məxfilik siyasəti" },
    slug: { ru: "politika-konfidencialnosti", uz: "maxfiylik-siyosati", en: "privacy-policy", az: "mexfilik-siyaseti" },
    content: {
      ru: `<p>Мы обрабатываем персональные данные (имя, телефон, e-mail, адрес доставки) только для оформления и выполнения заказов.</p>
<h2>Что мы собираем</h2><ul><li>Контактные данные из форм заказа и обратного звонка</li><li>Технические данные посещения сайта</li></ul>
<h2>Передача третьим лицам</h2><p>Данные не передаются третьим лицам, за исключением служб доставки в объёме, необходимом для вручения заказа.</p>`,
      uz: `<p>Shaxsiy ma’lumotlarni (ism, telefon, e-pochta, yetkazib berish manzili) faqat buyurtmani rasmiylashtirish va bajarish uchun qayta ishlaymiz.</p>
<h2>Nimani yig‘amiz</h2><ul><li>Buyurtma va qo‘ng‘iroq shakllaridagi aloqa ma’lumotlari</li><li>Saytga tashrif haqidagi texnik ma’lumotlar</li></ul>
<h2>Uchinchi shaxslarga uzatish</h2><p>Ma’lumotlar uchinchi shaxslarga uzatilmaydi, faqat yetkazib berish xizmatiga zarur hajmda beriladi.</p>`,
      en: `<p>We process personal data (name, phone, email, delivery address) only to take and fulfil orders.</p>
<h2>What we collect</h2><ul><li>Contact details from order and callback forms</li><li>Technical data about your visit</li></ul>
<h2>Sharing</h2><p>We do not share data with third parties, except with couriers to the extent needed to deliver your order.</p>`,
      az: `<p>Şəxsi məlumatları (ad, telefon, e-poçt, çatdırılma ünvanı) yalnız sifarişin rəsmiləşdirilməsi və icrası üçün emal edirik.</p>
<h2>Nə toplayırıq</h2><ul><li>Sifariş və zəng formalarından əlaqə məlumatları</li><li>Sayta baş çəkmə haqqında texniki məlumatlar</li></ul>
<h2>Üçüncü şəxslərə ötürülmə</h2><p>Məlumatlar üçüncü şəxslərə ötürülmür, yalnız çatdırılma xidmətinə lazım olan həcmdə verilir.</p>`,
    },
  },
  {
    key: "terms",
    sortOrder: 50,
    title: { ru: "Условия использования", uz: "Foydalanish shartlari", en: "Terms of use", az: "İstifadə şərtləri" },
    slug: { ru: "usloviya-ispolzovaniya", uz: "foydalanish-shartlari", en: "terms-of-use", az: "istifade-sertleri" },
    content: {
      ru: `<p>Информация на сайте носит справочный характер и не является публичной офертой. Точную стоимость и комплектацию подтверждает менеджер.</p>
<h2>Заказ</h2><p>Заказ считается принятым после подтверждения менеджером по телефону.</p>
<h2>Возврат</h2><p>Возврат товара надлежащего качества возможен в течение 7 дней при сохранении упаковки и товарного вида.</p>`,
      uz: `<p>Saytdagi ma’lumot ma’lumot xarakteriga ega va ommaviy oferta emas. Aniq narx va komplektatsiyani menejer tasdiqlaydi.</p>
<h2>Buyurtma</h2><p>Buyurtma menejer telefon orqali tasdiqlagandan so‘ng qabul qilingan hisoblanadi.</p>
<h2>Qaytarish</h2><p>Sifatli mahsulotni 7 kun ichida qadoqlash va tovar ko‘rinishi saqlangan holda qaytarish mumkin.</p>`,
      en: `<p>Information on this site is for reference and is not a public offer. Final price and configuration are confirmed by a manager.</p>
<h2>Orders</h2><p>An order is accepted once a manager has confirmed it by phone.</p>
<h2>Returns</h2><p>Goods in proper condition may be returned within 7 days with the original packaging intact.</p>`,
      az: `<p>Saytdakı məlumat arayış xarakteri daşıyır və publik oferta deyil. Dəqiq qiyməti və komplektasiyanı menecer təsdiqləyir.</p>
<h2>Sifariş</h2><p>Sifariş menecer telefonla təsdiqlədikdən sonra qəbul edilmiş sayılır.</p>
<h2>Geri qaytarma</h2><p>Keyfiyyətli mal qablaşdırma və əmtəə görünüşü qorunmaqla 7 gün ərzində qaytarıla bilər.</p>`,
    },
  },
];

export const POSTS: {
  image: string;
  daysAgo: number;
  title: T;
  slug: T;
  excerpt: T;
  content: T;
}[] = [
  {
    image: "/media/blog/1.jpg",
    daysAgo: 7,
    title: {
      ru: "Как выбрать беговую дорожку для дома",
      uz: "Uy uchun yugurish yo‘lkasini qanday tanlash kerak",
      en: "How to choose a treadmill for home",
      az: "Ev üçün qaçış yolunu necə seçməli",
    },
    slug: {
      ru: "kak-vybrat-begovuyu-dorozhku",
      uz: "yugurish-yolkasini-tanlash",
      en: "how-to-choose-a-treadmill",
      az: "qacis-yolunu-nece-secmeli",
    },
    excerpt: {
      ru: "Мощность двигателя, размер полотна, амортизация и вес пользователя — четыре параметра, которые решают всё.",
      uz: "Dvigatel quvvati, polotno o‘lchami, amortizatsiya va foydalanuvchi vazni — hal qiluvchi to‘rt parametr.",
      en: "Motor power, deck size, cushioning and user weight — the four numbers that decide everything.",
      az: "Mühərrik gücü, polotno ölçüsü, amortizasiya və istifadəçi çəkisi — hər şeyi həll edən dörd parametr.",
    },
    content: {
      ru: `<p>Беговая дорожка для дома отличается от клубной прежде всего ресурсом двигателя и шириной полотна.</p>
<h2>Мощность двигателя</h2><p>Для ходьбы достаточно 1.5–2.0 л.с., для регулярного бега берите от 2.5 л.с. постоянной мощности.</p>
<h2>Размер полотна</h2><p>Для бега комфортна ширина от 45 см и длина от 130 см. Чем выше рост — тем длиннее полотно.</p>
<h2>Амортизация</h2><p>Многослойная дека снижает нагрузку на суставы и делает домашние тренировки безопаснее.</p>`,
      uz: `<p>Uy uchun yugurish yo‘lkasi klub modelidan avvalo dvigatel resursi va polotno kengligi bilan farq qiladi.</p>
<h2>Dvigatel quvvati</h2><p>Yurish uchun 1.5–2.0 o.k. yetarli, muntazam yugurish uchun 2.5 o.k. doimiy quvvatdan boshlang.</p>
<h2>Polotno o‘lchami</h2><p>Yugurish uchun kenglik 45 sm dan, uzunlik 130 sm dan qulay. Bo‘y qancha baland bo‘lsa, polotno shuncha uzun.</p>
<h2>Amortizatsiya</h2><p>Ko‘p qatlamli deka bo‘g‘imlarga yukni kamaytiradi va mashqni xavfsizroq qiladi.</p>`,
      en: `<p>A home treadmill differs from a club machine mainly in motor duty cycle and belt width.</p>
<h2>Motor power</h2><p>1.5–2.0 HP is enough for walking; for regular running look for 2.5 HP continuous duty or more.</p>
<h2>Deck size</h2><p>Running is comfortable from 45 cm wide and 130 cm long. The taller the user, the longer the deck.</p>
<h2>Cushioning</h2><p>A multi-layer deck reduces joint load and makes home training safer.</p>`,
      az: `<p>Ev üçün qaçış yolu klub modelindən ilk növbədə mühərrik resursu və polotno eni ilə fərqlənir.</p>
<h2>Mühərrik gücü</h2><p>Yeriş üçün 1.5–2.0 a.g. kifayətdir, müntəzəm qaçış üçün 2.5 a.g. daimi gücdən başlayın.</p>
<h2>Polotno ölçüsü</h2><p>Qaçış üçün en 45 sm-dən, uzunluq 130 sm-dən rahatdır. Boy nə qədər uzundursa, polotno da bir o qədər uzun olmalıdır.</p>
<h2>Amortizasiya</h2><p>Çoxqatlı deka oynaqlara yükü azaldır və məşqi daha təhlükəsiz edir.</p>`,
    },
  },
  {
    image: "/media/blog/2.jpg",
    daysAgo: 21,
    title: {
      ru: "Что нужно для открытия фитнес-клуба",
      uz: "Fitnes-klub ochish uchun nima kerak",
      en: "What it takes to open a fitness club",
      az: "Fitnes klubu açmaq üçün nə lazımdır",
    },
    slug: {
      ru: "chto-nuzhno-dlya-fitnes-kluba",
      uz: "fitnes-klub-ochish",
      en: "opening-a-fitness-club",
      az: "fitnes-klubu-acmaq",
    },
    excerpt: {
      ru: "Зонирование зала, расчёт количества тренажёров и бюджет на первый год работы.",
      uz: "Zalni zonalarga bo‘lish, trenajyorlar sonini hisoblash va birinchi yil byudjeti.",
      en: "Floor zoning, machine counts and a realistic first-year budget.",
      az: "Zalın zonalara bölünməsi, trenajyor sayının hesablanması və ilk il büdcəsi.",
    },
    content: {
      ru: `<h2>Зонирование</h2><p>Классический зал делится на кардиозону, зону свободных весов, грузоблочные тренажёры и функциональную зону.</p>
<h2>Сколько тренажёров</h2><p>Ориентир — один кардиотренажёр на 25–30 м² кардиозоны и 8–12 силовых станций на 200 м².</p>
<h2>Что учесть</h2><ul><li>Высота потолков от 3 м</li><li>Напольное покрытие под свободные веса</li><li>Вентиляция и электрика</li></ul>`,
      uz: `<h2>Zonalash</h2><p>Klassik zal kardio zona, erkin yuklar zonasi, yuk-blokli trenajyorlar va funksional zonaga bo‘linadi.</p>
<h2>Nechta trenajyor</h2><p>Mo‘ljal — kardio zonaning har 25–30 m² uchun bitta kardio trenajyor va 200 m² uchun 8–12 kuch stansiyasi.</p>
<h2>Nimani hisobga olish kerak</h2><ul><li>Shift balandligi 3 m dan</li><li>Erkin yuklar uchun pol qoplamasi</li><li>Ventilyatsiya va elektr ta’minoti</li></ul>`,
      en: `<h2>Zoning</h2><p>A classic floor splits into cardio, free weights, selectorised machines and a functional area.</p>
<h2>How many machines</h2><p>Plan roughly one cardio unit per 25–30 m² of cardio floor and 8–12 strength stations per 200 m².</p>
<h2>Don't forget</h2><ul><li>Ceiling height from 3 m</li><li>Proper flooring under free weights</li><li>Ventilation and power supply</li></ul>`,
      az: `<h2>Zonalaşdırma</h2><p>Klassik zal kardio zonası, sərbəst çəkilər zonası, yük-bloklu trenajyorlar və funksional zonaya bölünür.</p>
<h2>Neçə trenajyor</h2><p>Təxmini hesab — kardio zonanın hər 25–30 m²-i üçün bir kardio trenajyor və 200 m² üçün 8–12 güc stansiyası.</p>
<h2>Nəzərə alın</h2><ul><li>Tavan hündürlüyü 3 m-dən</li><li>Sərbəst çəkilər altında döşəmə örtüyü</li><li>Ventilyasiya və elektrik</li></ul>`,
    },
  },
  {
    image: "/media/blog/3.jpg",
    daysAgo: 45,
    title: {
      ru: "Уход за тренажёрами: простые правила",
      uz: "Trenajyorlarga g‘amxo‘rlik: oddiy qoidalar",
      en: "Looking after your machines: simple rules",
      az: "Trenajyorlara qulluq: sadə qaydalar",
    },
    slug: {
      ru: "uhod-za-trenazherami",
      uz: "trenajyorlarga-gamxorlik",
      en: "machine-maintenance",
      az: "trenajyorlara-qulluq",
    },
    excerpt: {
      ru: "Регулярная чистка, смазка полотна и проверка креплений продлевают срок службы в несколько раз.",
      uz: "Muntazam tozalash, polotnoni moylash va mahkamlagichlarni tekshirish xizmat muddatini uzaytiradi.",
      en: "Regular cleaning, belt lubrication and bolt checks multiply the life of your equipment.",
      az: "Müntəzəm təmizləmə, polotnonun yağlanması və bərkidicilərin yoxlanması xidmət müddətini artırır.",
    },
    content: {
      ru: `<h2>Раз в неделю</h2><p>Протирайте раму и поручни, убирайте пыль из-под деки.</p>
<h2>Раз в месяц</h2><p>Проверяйте натяжение и центровку полотна, подтягивайте болты.</p>
<h2>Раз в квартал</h2><p>Наносите силиконовую смазку под полотно и проверяйте тросы силовых станций.</p>`,
      uz: `<h2>Haftada bir marta</h2><p>Ramka va tutqichlarni arting, deka ostidagi changni tozalang.</p>
<h2>Oyda bir marta</h2><p>Polotno tarangligi va markazlashuvini tekshiring, boltlarni tortib qo‘ying.</p>
<h2>Chorakda bir marta</h2><p>Polotno ostiga silikon moy suring va kuch stansiyalari troslarini tekshiring.</p>`,
      en: `<h2>Weekly</h2><p>Wipe the frame and handrails, clear dust from under the deck.</p>
<h2>Monthly</h2><p>Check belt tension and tracking, retighten bolts.</p>
<h2>Quarterly</h2><p>Apply silicone lubricant under the belt and inspect the cables on strength stations.</p>`,
      az: `<h2>Həftədə bir dəfə</h2><p>Çərçivə və tutacaqları silin, dekanın altından tozu təmizləyin.</p>
<h2>Ayda bir dəfə</h2><p>Polotnonun dartılmasını və mərkəzləşməsini yoxlayın, boltları sıxın.</p>
<h2>Rübdə bir dəfə</h2><p>Polotnonun altına silikon yağ çəkin və güc stansiyalarının troslarını yoxlayın.</p>`,
    },
  },
];

export const BRAND_LOGOS: Record<string, string> = {
  ferro: "/media/brands/ferro.jpg",
  volksgym: "/media/brands/volksgym.jpg",
  "mbh-fitness": "/media/brands/mbh-fitness.jpg",
  kettler: "/media/brands/kettler.jpg",
};

/**
 * Only the two stock shots that actually match their section. Every other
 * category picks up a photo from its own first product in the seed.
 */
export const CATEGORY_IMAGES: Record<string, string> = {
  cardio: "/media/categories/category2.jpg",
  accessories: "/media/categories/category1.jpg",
  // No stock photo matches this section, so a real cable-cross machine stands in.
  strength: "/media/products/119.jpg",
};
