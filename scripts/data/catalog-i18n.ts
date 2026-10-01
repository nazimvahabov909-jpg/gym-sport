/**
 * Human translations for the imported catalogue. The live site is Russian-only,
 * so everything the storefront shows in uz / en / az originates here.
 *
 * Model-number titles ("FERRO F-86+", "MBH XG-101") are brand identifiers and
 * stay identical in every locale — only descriptive names are listed below.
 */
export type Locale = "ru" | "uz" | "en" | "az";
export const LOCALES: Locale[] = ["ru", "uz", "en", "az"];

export type Translated = Record<Locale, string>;

export const CATEGORY_NAMES: Record<string, Translated> = {
  cardio: {
    ru: "Кардиотренажёры",
    uz: "Kardio trenajyorlar",
    en: "Cardio machines",
    az: "Kardio trenajyorlar",
  },
  treadmills: {
    ru: "Беговые дорожки",
    uz: "Yugurish yo‘lkalari",
    en: "Treadmills",
    az: "Qaçış yolları",
  },
  elliptical: {
    ru: "Эллиптические тренажёры",
    uz: "Elliptik trenajyorlar",
    en: "Elliptical trainers",
    az: "Elliptik trenajyorlar",
  },
  "exercise-bikes": {
    ru: "Велотренажёры",
    uz: "Velotrenajyorlar",
    en: "Exercise bikes",
    az: "Velotrenajyorlar",
  },
  rowing: {
    ru: "Гребные тренажёры",
    uz: "Eshkak eshish trenajyorlari",
    en: "Rowing machines",
    az: "Avarçəkmə trenajyorları",
  },
  steppers: {
    ru: "Степперы",
    uz: "Stepperlar",
    en: "Steppers",
    az: "Stepperlər",
  },
  strength: {
    ru: "Силовые тренажёры",
    uz: "Kuch trenajyorlari",
    en: "Strength equipment",
    az: "Güc trenajyorları",
  },
  "built-in-weight": {
    ru: "Встроенный вес",
    uz: "O‘rnatilgan yukli",
    en: "Selectorised machines",
    az: "Daxili çəkili",
  },
  "free-weight": {
    ru: "Свободный вес",
    uz: "Erkin yuk",
    en: "Free weights",
    az: "Sərbəst çəki",
  },
  "benches-racks": {
    ru: "Скамьи и стойки",
    uz: "Skameykalar va tayanchlar",
    en: "Benches & racks",
    az: "Skamyalar və dayaqlar",
  },
  accessories: {
    ru: "Фитнес аксессуары",
    uz: "Fitnes aksessuarlari",
    en: "Fitness accessories",
    az: "Fitnes aksesuarları",
  },
  expanders: {
    ru: "Эспандеры",
    uz: "Espanderlar",
    en: "Expanders",
    az: "Espanderlər",
  },
  weights: {
    ru: "Утяжелители",
    uz: "Og‘irliklar",
    en: "Weights",
    az: "Ağırlıqlar",
  },
  "jump-ropes": {
    ru: "Скакалки",
    uz: "Arg‘amchilar",
    en: "Jump ropes",
    az: "Tullanma ipləri",
  },
  hoops: {
    ru: "Обручи",
    uz: "Obruchlar",
    en: "Hoops",
    az: "Halqalar",
  },
  mats: {
    ru: "Коврики",
    uz: "Gilamchalar",
    en: "Mats",
    az: "Xalçalar",
  },
  balls: {
    ru: "Мячи",
    uz: "To‘plar",
    en: "Balls",
    az: "Toplar",
  },
  abs: {
    ru: "Тренажёры для пресса",
    uz: "Qorin pressi trenajyorlari",
    en: "Ab trainers",
    az: "Qarın pressi trenajyorları",
  },
};

export const CATEGORY_DESCRIPTIONS: Partial<Record<string, Translated>> = {
  cardio: {
    ru: "Беговые дорожки, велотренажёры, эллипсоиды и степперы для дома и фитнес-клубов в Ташкенте.",
    uz: "Uy va fitnes-klublar uchun yugurish yo‘lkalari, velotrenajyorlar, ellipsoidlar va stepperlar.",
    en: "Treadmills, exercise bikes, ellipticals and steppers for homes and gyms in Tashkent.",
    az: "Ev və fitnes klubları üçün qaçış yolları, velotrenajyorlar, ellipsoidlər və stepperlər.",
  },
  strength: {
    ru: "Силовые станции, свободные веса, скамьи и стойки для профессиональных залов.",
    uz: "Professional zallar uchun kuch stansiyalari, erkin yuklar, skameyka va tayanchlar.",
    en: "Selectorised stations, free weights, benches and racks for professional gyms.",
    az: "Peşəkar zallar üçün güc stansiyaları, sərbəst çəkilər, skamyalar və dayaqlar.",
  },
  accessories: {
    ru: "Коврики, мячи, эспандеры, скакалки и утяжелители для тренировок дома.",
    uz: "Uyda mashq qilish uchun gilamchalar, to‘plar, espanderlar, arg‘amchi va og‘irliklar.",
    en: "Mats, balls, expanders, jump ropes and weights for training at home.",
    az: "Evdə məşq üçün xalçalar, toplar, espanderlər, tullanma ipləri və ağırlıqlar.",
  },
};

/** Keyed by the exact Russian/English title as it arrives from the scraper. */
export const PRODUCT_NAMES: Record<string, Translated> = {
  "AB WHEEL": {
    ru: "Ролик для пресса",
    uz: "Qorin pressi g‘ildiragi",
    en: "Ab wheel",
    az: "Qarın pressi çarxı",
  },
  "EXERCISE WHEEL": {
    ru: "Ролик гимнастический",
    uz: "Mashq g‘ildiragi",
    en: "Exercise wheel",
    az: "Məşq çarxı",
  },
  "DUAL AB EXERCISE WHEEL": {
    ru: "Ролик для пресса двойной",
    uz: "Ikki g‘ildirakli qorin pressi rolikasi",
    en: "Dual ab exercise wheel",
    az: "İkiqat qarın pressi çarxı",
  },
  "ANTI-BUST GYM BALL": {
    ru: "Гимнастический мяч с защитой от разрыва",
    uz: "Yorilishga chidamli gimnastika to‘pi",
    en: "Anti-burst gym ball",
    az: "Partlamaya davamlı gimnastika topu",
  },
  "BOSU BALL WITH EXPANDER": {
    ru: "Босу-платформа с эспандерами",
    uz: "Espanderli BOSU platformasi",
    en: "BOSU ball with expanders",
    az: "Espanderli BOSU platforması",
  },
  "GYM BALL": {
    ru: "Гимнастический мяч",
    uz: "Gimnastika to‘pi",
    en: "Gym ball",
    az: "Gimnastika topu",
  },
  "MASSAGE BALL": {
    ru: "Массажный мяч",
    uz: "Massaj to‘pi",
    en: "Massage ball",
    az: "Masaj topu",
  },
  "PEANUT GYM BALL": {
    ru: "Гимнастический мяч-арахис",
    uz: "Yeryong‘oq shaklidagi gimnastika to‘pi",
    en: "Peanut gym ball",
    az: "Fıstıq formalı gimnastika topu",
  },
  "CHEST EXPANDER": {
    ru: "Эспандер грудной",
    uz: "Ko‘krak espanderi",
    en: "Chest expander",
    az: "Sinə espanderi",
  },
  "GYMNASTIC RING": {
    ru: "Гимнастические кольца",
    uz: "Gimnastika halqalari",
    en: "Gymnastic rings",
    az: "Gimnastika halqaları",
  },
  "SUSPENSION TRAINER": {
    ru: "Петли подвесные тренировочные",
    uz: "Osma mashq halqalari",
    en: "Suspension trainer",
    az: "Asma məşq ilgəkləri",
  },
  "EXERCISE MAT": {
    ru: "Коврик для фитнеса",
    uz: "Fitnes gilamchasi",
    en: "Exercise mat",
    az: "Fitnes xalçası",
  },
  "YOGA MAT": {
    ru: "Коврик для йоги",
    uz: "Yoga gilamchasi",
    en: "Yoga mat",
    az: "Yoqa xalçası",
  },
  "PRINTED PVC YOGA MAT": {
    ru: "Коврик для йоги ПВХ с принтом",
    uz: "Naqshli PVX yoga gilamchasi",
    en: "Printed PVC yoga mat",
    az: "Naxışlı PVC yoqa xalçası",
  },
  "Эспандеры кистевые Kettler": {
    ru: "Эспандеры кистевые Kettler",
    uz: "Kettler bilak espanderlari",
    en: "Kettler hand grip expanders",
    az: "Kettler əl espanderləri",
  },
  "Набор эспандеров Kettler": {
    ru: "Набор эспандеров Kettler",
    uz: "Kettler espanderlar to‘plami",
    en: "Kettler expander set",
    az: "Kettler espander dəsti",
  },
  "Петли тренировочные Kettler": {
    ru: "Петли тренировочные Kettler",
    uz: "Kettler mashq halqalari",
    en: "Kettler suspension trainer",
    az: "Kettler məşq ilgəkləri",
  },
  "Обруч для Пилатес Kettler": {
    ru: "Обруч для пилатеса Kettler",
    uz: "Kettler pilates obruchi",
    en: "Kettler pilates ring",
    az: "Kettler pilates halqası",
  },
  "Обруч для фитнеса Kettler": {
    ru: "Обруч для фитнеса Kettler",
    uz: "Kettler fitnes obruchi",
    en: "Kettler fitness hoop",
    az: "Kettler fitnes halqası",
  },
  "Скакалка Kettler": {
    ru: "Скакалка Kettler",
    uz: "Kettler arg‘amchisi",
    en: "Kettler jump rope",
    az: "Kettler tullanma ipi",
  },
  "Скакалка скоростная Kettler": {
    ru: "Скакалка скоростная Kettler",
    uz: "Kettler tezkor arg‘amchisi",
    en: "Kettler speed rope",
    az: "Kettler sürət ipi",
  },
  "Скакалка со счетчиком Kettler": {
    ru: "Скакалка со счётчиком Kettler",
    uz: "Kettler hisoblagichli arg‘amchi",
    en: "Kettler jump rope with counter",
    az: "Kettler sayğaclı tullanma ipi",
  },
  "Скакалка утяжеленная Kettler": {
    ru: "Скакалка утяжелённая Kettler",
    uz: "Kettler og‘irlashtirilgan arg‘amchi",
    en: "Kettler weighted jump rope",
    az: "Kettler ağırlaşdırılmış tullanma ipi",
  },
  "Коврик для йоги Kettler": {
    ru: "Коврик для йоги Kettler",
    uz: "Kettler yoga gilamchasi",
    en: "Kettler yoga mat",
    az: "Kettler yoqa xalçası",
  },
  "Мат для йоги Kettler": {
    ru: "Мат для йоги Kettler",
    uz: "Kettler yoga mati",
    en: "Kettler yoga mat",
    az: "Kettler yoqa matı",
  },
  "Коврик для фитнеса Kettler": {
    ru: "Коврик для фитнеса Kettler",
    uz: "Kettler fitnes gilamchasi",
    en: "Kettler fitness mat",
    az: "Kettler fitnes xalçası",
  },
  "Мяч гимнастический Kettler, 65 см": {
    ru: "Мяч гимнастический Kettler, 65 см",
    uz: "Kettler gimnastika to‘pi, 65 sm",
    en: "Kettler gym ball, 65 cm",
    az: "Kettler gimnastika topu, 65 sm",
  },
  "Мяч гимнастический Kettler, 75 см": {
    ru: "Мяч гимнастический Kettler, 75 см",
    uz: "Kettler gimnastika to‘pi, 75 sm",
    en: "Kettler gym ball, 75 cm",
    az: "Kettler gimnastika topu, 75 sm",
  },
  "Утяжелители для рук Kettler, 2 х 1,5 кг": {
    ru: "Утяжелители для рук Kettler, 2 × 1,5 кг",
    uz: "Kettler qo‘l og‘irliklari, 2 × 1,5 kg",
    en: "Kettler wrist weights, 2 × 1.5 kg",
    az: "Kettler əl ağırlıqları, 2 × 1,5 kq",
  },
  "Утяжелители, Kettler 2 х 0,5 кг": {
    ru: "Утяжелители Kettler, 2 × 0,5 кг",
    uz: "Kettler og‘irliklari, 2 × 0,5 kg",
    en: "Kettler weights, 2 × 0.5 kg",
    az: "Kettler ağırlıqları, 2 × 0,5 kq",
  },
  "Утяжелитель для ног Kettler, 2 х 1,5 кг": {
    ru: "Утяжелители для ног Kettler, 2 × 1,5 кг",
    uz: "Kettler oyoq og‘irliklari, 2 × 1,5 kg",
    en: "Kettler ankle weights, 2 × 1.5 kg",
    az: "Kettler ayaq ağırlıqları, 2 × 1,5 kq",
  },
  "Жилет утяжеленный Kettler, 6 кг": {
    ru: "Жилет утяжелённый Kettler, 6 кг",
    uz: "Kettler og‘irlashtirilgan jilet, 6 kg",
    en: "Kettler weighted vest, 6 kg",
    az: "Kettler ağırlaşdırılmış jilet, 6 kq",
  },
};

/** Falls back to the source title — correct for "FERRO F-86+" style names. */
export function translateProductName(source: string, locale: Locale): string {
  return PRODUCT_NAMES[source]?.[locale] ?? source;
}
