import type { ItemCategory } from '@/shared/types';
import PlaceholderImage from '@/placeholder.png';

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  auto: 'Авто',
  real_estate: 'Недвижимость',
  electronics: 'Электроника',
};

export const CATEGORY_OPTIONS = [
  { value: 'auto', label: CATEGORY_LABELS.auto },
  { value: 'real_estate', label: CATEGORY_LABELS.real_estate },
  { value: 'electronics', label: CATEGORY_LABELS.electronics },
] as const;

export type ParamFieldType = 'text' | 'number' | 'select';

export type ParamFieldOption = {
  value: string;
  label: string;
};

export type ParamField = {
  key: string;
  label: string;
  type: ParamFieldType;
  options?: ParamFieldOption[];
};

export const CATEGORY_PARAM_FIELDS: Record<ItemCategory, ParamField[]> = {
  auto: [
    { key: 'brand', label: 'Марка', type: 'text' },
    { key: 'model', label: 'Модель', type: 'text' },
    { key: 'yearOfManufacture', label: 'Год выпуска', type: 'number' },
    {
      key: 'transmission',
      label: 'Коробка',
      type: 'select',
      options: [
        { value: 'automatic', label: 'Автомат' },
        { value: 'manual', label: 'Механика' },
      ],
    },
    { key: 'mileage', label: 'Пробег (км)', type: 'number' },
    { key: 'enginePower', label: 'Мощность (л.с.)', type: 'number' },
  ],
  real_estate: [
    {
      key: 'type',
      label: 'Тип',
      type: 'select',
      options: [
        { value: 'flat', label: 'Квартира' },
        { value: 'house', label: 'Дом' },
        { value: 'room', label: 'Комната' },
      ],
    },
    { key: 'address', label: 'Адрес', type: 'text' },
    { key: 'area', label: 'Площадь (м²)', type: 'number' },
    { key: 'floor', label: 'Этаж', type: 'number' },
  ],
  electronics: [
    {
      key: 'type',
      label: 'Тип',
      type: 'select',
      options: [
        { value: 'phone', label: 'Телефон' },
        { value: 'laptop', label: 'Ноутбук' },
        { value: 'misc', label: 'Другое' },
      ],
    },
    { key: 'brand', label: 'Бренд', type: 'text' },
    { key: 'model', label: 'Модель', type: 'text' },
    {
      key: 'condition',
      label: 'Состояние',
      type: 'select',
      options: [
        { value: 'new', label: 'Новое' },
        { value: 'used', label: 'Б/у' },
      ],
    },
    { key: 'color', label: 'Цвет', type: 'text' },
  ],
};

export const PARAM_LABELS: Record<string, string> = {
  brand: 'Бренд',
  model: 'Модель',
  yearOfManufacture: 'Год выпуска',
  transmission: 'Коробка',
  mileage: 'Пробег',
  enginePower: 'Мощность двигателя',
  type: 'Тип',
  address: 'Адрес',
  area: 'Площадь',
  floor: 'Этаж',
  condition: 'Состояние',
  color: 'Цвет',
};

export const PLACEHOLDER_IMAGE = PlaceholderImage;
