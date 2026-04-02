export const formatCurrency = (value: number | null | undefined): string => {
  if (value == null || Number.isNaN(value)) return 'Цена не указана';

  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (isoDate: string): string =>
  new Intl.DateTimeFormat('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(isoDate));

export const toNumber = (value: string | number | null | undefined): number | null => {
  if (value == null || value === '') return null;

  const normalized = typeof value === 'string' ? value.replace(',', '.').trim() : value;
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
};
