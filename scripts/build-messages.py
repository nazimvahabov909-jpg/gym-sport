# -*- coding: utf-8 -*-
"""Single source of truth for UI copy -> src/messages/<locale>.json.

Keeping all four locales in one table makes a missing translation impossible:
every entry must supply ru / uz / en / az or the build fails.
"""
import json, os, sys

L = ["ru", "uz", "en", "az"]

M = {
"common.siteName": ("United Sport", "United Sport", "United Sport", "United Sport"),
"common.tagline": (
 "Оборудование для фитнес-клубов и дома",
 "Fitnes-klublar va uy uchun jihozlar",
 "Equipment for gyms and home training",
 "Fitnes klubları və ev üçün avadanlıq"),
"common.search": ("Поиск", "Qidirish", "Search", "Axtarış"),
"common.searchPlaceholder": (
 "Найти тренажёр, бренд или артикул…",
 "Trenajyor, brend yoki artikul toping…",
 "Search machines, brands or SKU…",
 "Trenajyor, brend və ya artikul tapın…"),
"common.menu": ("Меню", "Menyu", "Menu", "Menyu"),
"common.close": ("Закрыть", "Yopish", "Close", "Bağla"),
"common.loading": ("Загрузка…", "Yuklanmoqda…", "Loading…", "Yüklənir…"),
"common.viewAll": ("Смотреть все", "Barchasini ko‘rish", "View all", "Hamısına bax"),
"common.readMore": ("Подробнее", "Batafsil", "Read more", "Ətraflı"),
"common.back": ("Назад", "Orqaga", "Back", "Geri"),
"common.home": ("Главная", "Bosh sahifa", "Home", "Ana səhifə"),
"common.language": ("Язык", "Til", "Language", "Dil"),
"common.phone": ("Телефон", "Telefon", "Phone", "Telefon"),
"common.email": ("E-mail", "E-pochta", "Email", "E-poçt"),
"common.address": ("Адрес", "Manzil", "Address", "Ünvan"),
"common.send": ("Отправить", "Yuborish", "Send", "Göndər"),
"common.sending": ("Отправляем…", "Yuborilmoqda…", "Sending…", "Göndərilir…"),
"common.save": ("Сохранить", "Saqlash", "Save", "Yadda saxla"),
"common.cancel": ("Отмена", "Bekor qilish", "Cancel", "Ləğv et"),
"common.remove": ("Удалить", "O‘chirish", "Remove", "Sil"),
"common.apply": ("Применить", "Qo‘llash", "Apply", "Tətbiq et"),
"common.reset": ("Сбросить", "Tozalash", "Reset", "Sıfırla"),
"common.required": ("Обязательное поле", "Majburiy maydon", "This field is required", "Məcburi sahə"),
"common.somethingWrong": (
 "Что-то пошло не так. Попробуйте ещё раз.",
 "Nimadir xato ketdi. Qayta urinib ko‘ring.",
 "Something went wrong. Please try again.",
 "Nəsə səhv getdi. Yenidən cəhd edin."),

"common.prev": ("Назад", "Oldingi", "Previous", "Əvvəlki"),
"common.next": ("Вперёд", "Keyingi", "Next", "Növbəti"),
"common.skipToContent": ("Перейти к содержимому", "Kontentga o‘tish", "Skip to content", "Məzmuna keç"),
"common.showMore": ("Показать ещё", "Yana ko‘rsatish", "Show more", "Daha çox göstər"),
"common.page": ("Страница", "Sahifa", "Page", "Səhifə"),
"common.of": ("из", "dan", "of", "/"),
"nav.home": ("Главная", "Bosh sahifa", "Home", "Ana səhifə"),
"nav.catalog": ("Каталог", "Katalog", "Catalogue", "Kataloq"),
"nav.brands": ("Бренды", "Brendlar", "Brands", "Brendlər"),
"nav.blog": ("Блог", "Blog", "Blog", "Bloq"),
"nav.contacts": ("Контакты", "Kontaktlar", "Contacts", "Əlaqə"),
"nav.about": ("О нас", "Biz haqimizda", "About us", "Haqqımızda"),
"nav.delivery": ("Доставка", "Yetkazib berish", "Delivery", "Çatdırılma"),
"nav.account": ("Кабинет", "Kabinet", "Account", "Kabinet"),
"nav.cart": ("Корзина", "Savat", "Cart", "Səbət"),
"nav.wishlist": ("Избранное", "Saralangan", "Wishlist", "Seçilmişlər"),

"home.heroTitle": (
 "Профессиональные тренажёры для зала и дома",
 "Zal va uy uchun professional trenajyorlar",
 "Professional gym equipment for clubs and home",
 "Zal və ev üçün peşəkar trenajyorlar"),
"home.heroSubtitle": (
 "Официальный поставщик Ferro, VolksGym, MBH Fitness и Kettler в Узбекистане",
 "O‘zbekistonda Ferro, VolksGym, MBH Fitness va Kettler rasmiy yetkazib beruvchisi",
 "Official supplier of Ferro, VolksGym, MBH Fitness and Kettler in Uzbekistan",
 "Özbəkistanda Ferro, VolksGym, MBH Fitness və Kettler-in rəsmi tədarükçüsü"),
"home.shopNow": ("В каталог", "Katalogga", "Shop now", "Kataloqa"),
"home.categoriesTitle": ("Категории", "Kategoriyalar", "Categories", "Kateqoriyalar"),
"home.latestTitle": ("Новинки", "Yangiliklar", "New arrivals", "Yeniliklər"),
"home.featuredTitle": ("Рекомендуем", "Tavsiya etamiz", "Featured", "Tövsiyə edirik"),
"home.brandsTitle": ("Наши бренды", "Bizning brendlar", "Our brands", "Brendlərimiz"),
"home.blogTitle": ("Статьи", "Maqolalar", "From the blog", "Məqalələr"),
"home.seoTitle": (
 "Спортивные товары для фитнес-клубов и залов. Тренажёры для дома.",
 "Fitnes-klublar va zallar uchun sport tovarlari. Uy uchun trenajyorlar.",
 "Sports equipment for fitness clubs and gyms. Home training machines.",
 "Fitnes klubları və zallar üçün idman malları. Ev üçün trenajyorlar."),
"home.seoText": (
 "В нашем каталоге вы можете выбрать оборудование для фитнес-клуба в Ташкенте. Большой ассортимент качественного оборудования для тренажёрного зала по выгодным ценам: силовые и кардиотренажёры, тренажёры для фитнеса, свободные веса, стойки для хранения инвентаря, напольные покрытия. Укомплектовать зал полностью вместе с нами очень удобно.",
 "Katalogimizdan Toshkentdagi fitnes-klub uchun jihozlarni tanlashingiz mumkin. Trenajyor zali uchun sifatli jihozlarning katta assortimenti qulay narxlarda: kuch va kardio trenajyorlar, fitnes jihozlari, erkin yuklar, inventar tayanchlari va pol qoplamalari. Zalni to‘liq jihozlashda biz yordam beramiz.",
 "Our catalogue covers everything a fitness club in Tashkent needs: strength and cardio machines, fitness accessories, free weights, storage racks and flooring — quality equipment at fair prices. Fitting out a full gym with us is straightforward.",
 "Kataloqumuzda Daşkənddəki fitnes klubu üçün avadanlıq seçə bilərsiniz. Trenajyor zalı üçün keyfiyyətli avadanlığın geniş çeşidi sərfəli qiymətlərlə: güc və kardio trenajyorlar, fitnes avadanlığı, sərbəst çəkilər, inventar dayaqları və döşəmə örtükləri. Zalı tam komplektləşdirmək bizimlə çox rahatdır."),
"home.benefits.delivery.title": ("Доставка по Узбекистану", "O‘zbekiston bo‘ylab yetkazib berish", "Delivery across Uzbekistan", "Özbəkistan üzrə çatdırılma"),
"home.benefits.delivery.text": ("Доставим и занесём в зал", "Zalgacha yetkazib beramiz", "Delivered and carried into your gym", "Zala qədər çatdırırıq"),
"home.benefits.warranty.title": ("Официальная гарантия", "Rasmiy kafolat", "Official warranty", "Rəsmi zəmanət"),
"home.benefits.warranty.text": ("Гарантия от производителя", "Ishlab chiqaruvchi kafolati", "Manufacturer-backed warranty", "İstehsalçı zəmanəti"),
"home.benefits.service.title": ("Сервис и монтаж", "Servis va montaj", "Service & assembly", "Servis və montaj"),
"home.benefits.service.text": ("Собственная сервисная служба", "O‘z servis xizmatimiz", "Our own service team", "Öz servis xidmətimiz"),
"home.benefits.support.title": ("Подбор оборудования", "Jihozlarni tanlash", "Equipment consulting", "Avadanlıq seçimi"),
"home.benefits.support.text": ("Поможем укомплектовать зал", "Zalni jihozlashda yordam", "We help you plan the whole floor", "Zalı komplektləşdirməyə kömək edirik"),

"catalog.title": ("Каталог", "Katalog", "Catalogue", "Kataloq"),
"home.stats.models": ("моделей в каталоге", "katalogdagi model", "models in stock", "kataloqda model"),
"home.stats.brands": ("официальных бренда", "rasmiy brend", "official brands", "rəsmi brend"),
"home.stats.years": ("лет на рынке", "yil bozorda", "years in business", "il bazarda"),
"home.heroBadge": (
 "Официальный поставщик в Узбекистане",
 "O‘zbekistonda rasmiy yetkazib beruvchi",
 "Official supplier in Uzbekistan",
 "Özbəkistanda rəsmi tədarükçü"),
"home.exploreCatalog": ("Открыть каталог", "Katalogni ochish", "Explore the catalogue", "Kataloqu aç"),
"home.talkToUs": ("Подобрать оборудование", "Jihozlarni tanlash", "Plan your gym", "Avadanlıq seç"),
"home.turnkeyEyebrow": ("Под ключ", "Kalit topshirish", "Turn-key", "Açar-təslim"),
"home.turnkeyTitle": (
 "Спроектируем и соберём зал целиком",
 "Zalni to‘liq loyihalab yig‘amiz",
 "We plan, deliver and build the whole floor",
 "Zalı tam layihələndirib yığırıq"),
"home.turnkeyText": (
 "От расстановки тренажёров и напольных покрытий до сборки на месте и сервисного обслуживания. Работаем с клубами, отелями и корпоративными залами по всему Узбекистану.",
 "Trenajyorlarni joylashtirish va pol qoplamalaridan tortib, joyida yig‘ish va servisgacha. O‘zbekiston bo‘ylab klublar, mehmonxonalar va korporativ zallar bilan ishlaymiz.",
 "From equipment layout and flooring to on-site assembly and ongoing service. We work with clubs, hotels and corporate gyms across Uzbekistan.",
 "Trenajyorların yerləşdirilməsi və döşəmə örtüklərindən tutmuş yerində yığılma və servisə qədər. Özbəkistan üzrə klublar, otellər və korporativ zallarla işləyirik."),
"home.scroll": ("Листайте вниз", "Pastga suring", "Scroll", "Aşağı sürüşdürün"),
"home.popularEyebrow": ("Выбор клиентов", "Mijozlar tanlovi", "Customer favourites", "Müştəri seçimi"),
"catalog.productCount": (
 "{count, plural, one {# товар} few {# товара} many {# товаров} other {# товара}}",
 "{count, plural, other {# ta mahsulot}}",
 "{count, plural, one {# product} other {# products}}",
 "{count, plural, other {# məhsul}}"),
"catalog.allProducts": ("Все товары", "Barcha mahsulotlar", "All products", "Bütün məhsullar"),
"catalog.filters": ("Фильтры", "Filtrlar", "Filters", "Filtrlər"),
"catalog.sort": ("Сортировка", "Saralash", "Sort", "Sıralama"),
"catalog.sortNewest": ("Сначала новые", "Avval yangilari", "Newest first", "Əvvəlcə yenilər"),
"catalog.sortNameAsc": ("По названию А-Я", "Nomi bo‘yicha A-Z", "Name A-Z", "Ada görə A-Z"),
"catalog.sortPriceAsc": ("Сначала дешёвые", "Avval arzonlari", "Price: low to high", "Əvvəlcə ucuzlar"),
"catalog.sortPriceDesc": ("Сначала дорогие", "Avval qimmatlari", "Price: high to low", "Əvvəlcə bahalılar"),
"catalog.brand": ("Бренд", "Brend", "Brand", "Brend"),
"catalog.category": ("Категория", "Kategoriya", "Category", "Kateqoriya"),
"catalog.inStockOnly": ("Только в наличии", "Faqat mavjudlari", "In stock only", "Yalnız mövcud olanlar"),
"catalog.nothingFound": ("Товары не найдены", "Mahsulot topilmadi", "No products found", "Məhsul tapılmadı"),
"catalog.nothingFoundText": (
 "Попробуйте изменить фильтры или поисковый запрос.",
 "Filtrlarni yoki so‘rovni o‘zgartirib ko‘ring.",
 "Try changing the filters or your search term.",
 "Filtrləri və ya axtarış sorğusunu dəyişin."),
"catalog.subcategories": ("Подкатегории", "Ichki kategoriyalar", "Subcategories", "Alt kateqoriyalar"),

"product.sku": ("Артикул", "Artikul", "SKU", "Artikul"),
"product.brand": ("Бренд", "Brend", "Brand", "Brend"),
"product.availability": ("Наличие", "Mavjudligi", "Availability", "Mövcudluq"),
"product.inStock": ("В наличии", "Mavjud", "In stock", "Mövcuddur"),
"product.outOfStock": ("Нет в наличии", "Mavjud emas", "Out of stock", "Mövcud deyil"),
"product.preOrder": ("Предзаказ", "Oldindan buyurtma", "Pre-order", "Ön sifariş"),
"product.onOrder": ("Под заказ", "Buyurtma asosida", "On order", "Sifarişlə"),
"product.addToCart": ("В корзину", "Savatga", "Add to cart", "Səbətə"),
"product.inCart": ("В корзине", "Savatda", "In cart", "Səbətdə"),
"product.priceOnRequest": ("Цена по запросу", "Narx so‘rov bo‘yicha", "Price on request", "Qiymət sorğu ilə"),
"product.requestPrice": ("Узнать цену", "Narxni bilish", "Request a price", "Qiyməti öyrən"),
"product.description": ("Описание", "Tavsif", "Description", "Təsvir"),
"product.noDescription": (
 "Описание скоро появится. Позвоните нам — расскажем всё об этой модели.",
 "Tavsif tez orada qo‘shiladi. Bizga qo‘ng‘iroq qiling — model haqida batafsil aytamiz.",
 "A full description is on its way. Call us and we will walk you through this model.",
 "Təsvir tezliklə əlavə olunacaq. Bizə zəng edin — model haqqında ətraflı danışaq."),
"product.specs": ("Характеристики", "Xususiyatlari", "Specifications", "Xüsusiyyətlər"),
"product.related": ("Похожие товары", "O‘xshash mahsulotlar", "You may also like", "Oxşar məhsullar"),
"product.quantity": ("Количество", "Miqdori", "Quantity", "Miqdar"),
"product.gallery": ("Фотографии товара", "Mahsulot rasmlari", "Product photos", "Məhsul şəkilləri"),

"cart.title": ("Корзина", "Savat", "Cart", "Səbət"),
"cart.empty": ("Корзина пуста", "Savat bo‘sh", "Your cart is empty", "Səbət boşdur"),
"cart.emptyText": (
 "Добавьте тренажёры из каталога — и оформим заказ.",
 "Katalogdan trenajyor qo‘shing — buyurtmani rasmiylashtiramiz.",
 "Add a machine from the catalogue and we will take it from there.",
 "Kataloqdan trenajyor əlavə edin — sifarişi rəsmiləşdirək."),
"cart.continue": ("Продолжить покупки", "Xaridni davom ettirish", "Continue shopping", "Alış-verişə davam"),
"cart.subtotal": ("Сумма", "Jami", "Subtotal", "Cəmi"),
"cart.total": ("Итого", "Umumiy", "Total", "Yekun"),
"cart.checkout": ("Оформить заказ", "Buyurtma berish", "Checkout", "Sifarişi rəsmiləşdir"),
"cart.quoteNotice": (
 "В заказе есть позиции без цены — менеджер свяжется с вами и подтвердит стоимость.",
 "Buyurtmada narxsiz pozitsiyalar bor — menejer siz bilan bog‘lanib narxni tasdiqlaydi.",
 "Some items have no listed price — a manager will confirm the cost with you.",
 "Sifarişdə qiyməti olmayan mövqelər var — menecer sizinlə əlaqə saxlayıb qiyməti təsdiqləyəcək."),

"checkout.title": ("Оформление заказа", "Buyurtmani rasmiylashtirish", "Checkout", "Sifarişin rəsmiləşdirilməsi"),
"checkout.contact": ("Контактные данные", "Aloqa ma‘lumotlari", "Contact details", "Əlaqə məlumatları"),
"checkout.firstName": ("Имя", "Ism", "First name", "Ad"),
"checkout.lastName": ("Фамилия", "Familiya", "Last name", "Soyad"),
"checkout.city": ("Город", "Shahar", "City", "Şəhər"),
"checkout.addressLine": ("Адрес доставки", "Yetkazib berish manzili", "Delivery address", "Çatdırılma ünvanı"),
"checkout.comment": ("Комментарий к заказу", "Buyurtmaga izoh", "Order notes", "Sifarişə qeyd"),
"checkout.payment": ("Способ оплаты", "To‘lov usuli", "Payment method", "Ödəniş üsulu"),
"checkout.paymentCash": ("Наличными при получении", "Qabul qilishda naqd", "Cash on delivery", "Təhvil alarkən nağd"),
"checkout.paymentTransfer": ("Банковский перевод", "Bank o‘tkazmasi", "Bank transfer", "Bank köçürməsi"),
"checkout.paymentCard": ("Картой при получении", "Qabul qilishda karta", "Card on delivery", "Təhvil alarkən kart"),
"checkout.placeOrder": ("Подтвердить заказ", "Buyurtmani tasdiqlash", "Place order", "Sifarişi təsdiqlə"),
"checkout.summary": ("Ваш заказ", "Sizning buyurtmangiz", "Order summary", "Sifarişiniz"),
"checkout.successTitle": ("Спасибо за заказ!", "Buyurtma uchun rahmat!", "Thank you for your order!", "Sifariş üçün təşəkkür!"),
"checkout.successText": (
 "Менеджер свяжется с вами в ближайшее время для подтверждения.",
 "Menejer yaqin orada tasdiqlash uchun siz bilan bog‘lanadi.",
 "A manager will call you shortly to confirm the details.",
 "Menecer təsdiq üçün qısa zamanda sizinlə əlaqə saxlayacaq."),
"checkout.orderNumber": ("Номер заказа", "Buyurtma raqami", "Order number", "Sifariş nömrəsi"),

"lead.title": ("Узнать цену", "Narxni bilish", "Request a price", "Qiyməti öyrən"),
"lead.text": (
 "Оставьте контакты — менеджер перезвонит и назовёт актуальную цену.",
 "Kontaktlaringizni qoldiring — menejer qo‘ng‘iroq qilib narxni aytadi.",
 "Leave your contacts and a manager will call you back with the current price.",
 "Əlaqə məlumatlarınızı qoyun — menecer zəng edib aktual qiyməti bildirəcək."),
"lead.name": ("Ваше имя", "Ismingiz", "Your name", "Adınız"),
"lead.message": ("Сообщение", "Xabar", "Message", "Mesaj"),
"lead.sent": ("Заявка отправлена", "So‘rov yuborildi", "Request sent", "Sorğu göndərildi"),
"lead.sentText": (
 "Мы свяжемся с вами в рабочее время.",
 "Ish vaqtida siz bilan bog‘lanamiz.",
 "We will get back to you during business hours.",
 "İş saatlarında sizinlə əlaqə saxlayacağıq."),
"lead.callback": ("Заказать звонок", "Qo‘ng‘iroq buyurtma qilish", "Request a call", "Zəng sifariş et"),

"account.login": ("Войти", "Kirish", "Sign in", "Daxil ol"),
"account.register": ("Регистрация", "Ro‘yxatdan o‘tish", "Create account", "Qeydiyyat"),
"account.logout": ("Выйти", "Chiqish", "Sign out", "Çıxış"),
"account.title": ("Личный кабинет", "Shaxsiy kabinet", "My account", "Şəxsi kabinet"),
"account.orders": ("Мои заказы", "Buyurtmalarim", "My orders", "Sifarişlərim"),
"account.profile": ("Профиль", "Profil", "Profile", "Profil"),
"account.password": ("Пароль", "Parol", "Password", "Şifrə"),
"account.noOrders": ("Заказов пока нет", "Hozircha buyurtma yo‘q", "No orders yet", "Hələ sifariş yoxdur"),
"account.noAccount": ("Нет аккаунта?", "Akkaunt yo‘qmi?", "No account yet?", "Hesabınız yoxdur?"),
"account.haveAccount": ("Уже есть аккаунт?", "Akkaunt bormi?", "Already registered?", "Hesabınız var?"),
"account.invalidCredentials": (
 "Неверный e-mail или пароль",
 "E-pochta yoki parol noto‘g‘ri",
 "Wrong email or password",
 "E-poçt və ya şifrə yanlışdır"),
"account.emailTaken": (
 "Этот e-mail уже зарегистрирован",
 "Bu e-pochta allaqachon ro‘yxatdan o‘tgan",
 "That email is already registered",
 "Bu e-poçt artıq qeydiyyatdan keçib"),
"account.passwordTooShort": (
 "Пароль должен быть не короче 8 символов",
 "Parol kamida 8 belgidan iborat bo‘lsin",
 "Password must be at least 8 characters",
 "Şifrə ən azı 8 simvol olmalıdır"),

"search.title": ("Поиск", "Qidiruv", "Search", "Axtarış"),
"search.resultsFor": ("Результаты по запросу", "So‘rov natijalari", "Results for", "Sorğu nəticələri"),
"search.noResults": ("Ничего не найдено", "Hech narsa topilmadi", "Nothing found", "Heç nə tapılmadı"),

"blog.title": ("Блог", "Blog", "Blog", "Bloq"),
"blog.readMore": ("Читать", "O‘qish", "Read article", "Oxu"),
"blog.empty": ("Статей пока нет", "Hozircha maqola yo‘q", "No articles yet", "Hələ məqalə yoxdur"),

"footer.info": ("Информация", "Ma‘lumot", "Information", "Məlumat"),
"footer.catalogue": ("Каталог", "Katalog", "Catalogue", "Kataloq"),
"footer.contacts": ("Контакты", "Kontaktlar", "Contacts", "Əlaqə"),
"footer.followUs": ("Мы в соцсетях", "Ijtimoiy tarmoqlarda", "Follow us", "Sosial şəbəkələrdə"),
"footer.rights": ("Все права защищены", "Barcha huquqlar himoyalangan", "All rights reserved", "Bütün hüquqlar qorunur"),

"brands.title": ("Бренды", "Brendlar", "Brands", "Brendlər"),
"brands.subtitle": (
 "Официальные поставки оборудования от проверенных производителей.",
 "Ishonchli ishlab chiqaruvchilardan rasmiy yetkazib berish.",
 "Official supply from manufacturers we work with directly.",
 "Etibarlı istehsalçılardan rəsmi tədarük."),
"contacts.title": ("Контакты", "Kontaktlar", "Contacts", "Əlaqə"),
"contacts.writeUs": ("Напишите нам", "Bizga yozing", "Write to us", "Bizə yazın"),
"contacts.workingHours": ("Часы работы", "Ish vaqti", "Opening hours", "İş saatları"),
"blog.backToBlog": ("Все статьи", "Barcha maqolalar", "All articles", "Bütün məqalələr"),
"errors.notFoundTitle": ("Страница не найдена", "Sahifa topilmadi", "Page not found", "Səhifə tapılmadı"),
"errors.notFoundText": (
 "Возможно, товар снят с продажи или адрес введён неверно.",
 "Balki mahsulot sotuvdan olingan yoki manzil noto‘g‘ri kiritilgan.",
 "The product may have been discontinued, or the address is mistyped.",
 "Ola bilsin məhsul satışdan çıxıb və ya ünvan səhv yazılıb."),
"errors.goHome": ("На главную", "Bosh sahifaga", "Go home", "Ana səhifəyə"),
}

def nest(flat):
    out = {}
    for path, value in flat.items():
        node = out
        parts = path.split(".")
        for p in parts[:-1]:
            node = node.setdefault(p, {})
        node[parts[-1]] = value
    return out

os.makedirs("src/messages", exist_ok=True)
for i, loc in enumerate(L):
    flat = {}
    for key, values in M.items():
        if len(values) != 4:
            sys.exit(f"'{key}' has {len(values)} translations, expected 4")
        flat[key] = values[i]
    with open(f"src/messages/{loc}.json", "w", encoding="utf-8") as f:
        json.dump(nest(flat), f, ensure_ascii=False, indent=2)
        f.write("\n")
print(f"✓ {len(M)} keys × {len(L)} locales")
