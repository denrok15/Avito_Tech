import { describe, expect, it } from 'vitest';
import type { Item } from '@/shared/types';
import { getMissingFields } from '@/utils';

const baseItem: Item = {
  id: 1,
  category: 'electronics',
  title: 'Тестовый ноутбук',
  description: 'Описание',
  price: 1000,
  createdAt: '2026-03-01T00:00:00.000Z',
  updatedAt: '2026-03-01T00:00:00.000Z',
  params: {
    type: 'laptop',
    brand: 'Lenovo',
    model: 'X1',
    condition: 'used',
    color: 'Черный',
  },
};

describe('getMissingFields', () => {
  it('returns empty list for fully filled item', () => {
    expect(getMissingFields(baseItem)).toEqual([]);
  });

  it('returns missing description and params', () => {
    const item: Item = {
      ...baseItem,
      description: '',
      params: {
        type: 'laptop',
      },
    };

    expect(getMissingFields(item)).toEqual([
      'Описание',
      'Бренд',
      'Модель',
      'Состояние',
      'Цвет',
    ]);
  });
});
