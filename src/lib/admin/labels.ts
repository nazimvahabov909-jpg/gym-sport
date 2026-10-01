import type {
  LeadStatus,
  LeadType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  StockStatus,
} from "@/generated/prisma/enums";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  NEW: "Новый",
  CONFIRMED: "Подтверждён",
  PROCESSING: "В работе",
  SHIPPED: "Отправлен",
  DELIVERED: "Доставлен",
  CANCELLED: "Отменён",
  REFUNDED: "Возврат",
};

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Наличными при получении",
  BANK_TRANSFER: "Банковский перевод",
  CARD_ON_DELIVERY: "Картой при получении",
  ONLINE: "Онлайн-оплата",
};

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Ожидает оплаты",
  PAID: "Оплачен",
  FAILED: "Ошибка оплаты",
  REFUNDED: "Возвращён",
};

export const LEAD_STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Новая",
  IN_PROGRESS: "В работе",
  DONE: "Обработана",
  SPAM: "Спам",
};

export const LEAD_TYPE_LABELS: Record<LeadType, string> = {
  CALLBACK: "Обратный звонок",
  PRICE_REQUEST: "Запрос цены",
  CONTACT: "Сообщение",
};

export const STOCK_STATUS_LABELS: Record<StockStatus, string> = {
  IN_STOCK: "В наличии",
  OUT_OF_STOCK: "Нет в наличии",
  PRE_ORDER: "Предзаказ",
  ON_ORDER: "Под заказ",
};

export const LOCALE_LABELS: Record<string, string> = {
  ru: "Русский",
  uz: "O‘zbekcha",
  en: "English",
  az: "Azərbaycan",
};
