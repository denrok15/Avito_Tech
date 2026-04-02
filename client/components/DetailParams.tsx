import { Stack, Typography } from '@mui/material';
import { PARAM_LABELS } from '@/shared/consts';
import type { Item } from '@/shared/types';

type DetailParamsProps = {
  item: Item;
};

const humanizeValue = (value: unknown): string => {
  if (value == null) return '—';
  if (value === '') return '—';

  switch (value) {
    case 'automatic':
      return 'Автомат';
    case 'manual':
      return 'Механика';
    case 'flat':
      return 'Квартира';
    case 'house':
      return 'Дом';
    case 'room':
      return 'Комната';
    case 'phone':
      return 'Телефон';
    case 'laptop':
      return 'Ноутбук';
    case 'misc':
      return 'Другое';
    case 'new':
      return 'Новое';
    case 'used':
      return 'Б/у';
    default:
      return String(value);
  }
};

export const DetailParams = ({ item }: DetailParamsProps) => {
  const entries = Object.entries(item.params ?? {}).filter(([, value]) => value != null && value !== '');

  return (
    <Stack spacing={1.5}>
      {entries.length === 0 ? (
        <Typography color="text.secondary">Характеристики пока не заполнены</Typography>
      ) : (
        entries.map(([key, value]) => (
          <Stack key={key} direction="row" justifyContent="space-between" gap={2}>
            <Typography color="text.secondary">{PARAM_LABELS[key] ?? key}</Typography>
            <Typography sx={{ textAlign: 'right' }}>{humanizeValue(value)}</Typography>
          </Stack>
        ))
      )}
    </Stack>
  );
};
