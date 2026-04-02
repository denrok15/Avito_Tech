import { CATEGORY_PARAM_FIELDS, PARAM_LABELS } from '@/shared/consts';
import type { Item, ItemCategory } from '@/shared/types';

const isFilled = (value: unknown): boolean => {
  if (value == null) return false;
  if (typeof value === 'string') return value.trim().length > 0;

  return true;
};

const REQUIRED_PARAM_KEYS: Record<ItemCategory, string[]> = {
  auto: CATEGORY_PARAM_FIELDS.auto.map(field => field.key),
  real_estate: CATEGORY_PARAM_FIELDS.real_estate.map(field => field.key),
  electronics: CATEGORY_PARAM_FIELDS.electronics.map(field => field.key),
};

export const getMissingFields = (item: Item): string[] => {
  const missing: string[] = [];

  if (!isFilled(item.description)) {
    missing.push('Описание');
  }

  for (const key of REQUIRED_PARAM_KEYS[item.category]) {
    if (!isFilled(item.params[key as keyof typeof item.params])) {
      missing.push(PARAM_LABELS[key] ?? key);
    }
  }

  return missing;
};
