import { MenuItem, Stack, TextField } from '@mui/material';
import { CATEGORY_PARAM_FIELDS } from '@/shared/consts';
import type { ItemCategory } from '@/shared/types';

type CategoryParamsFieldsProps = {
  category: ItemCategory;
  params: Record<string, string>;
  onChange: (name: string, value: string) => void;
};

export const CategoryParamsFields = ({
  category,
  params,
  onChange,
}: CategoryParamsFieldsProps) => {
  const fields = CATEGORY_PARAM_FIELDS[category];

  return (
    <Stack spacing={2}>
      {fields.map(field => (
        <TextField
          key={field.key}
          select={field.type === 'select'}
          label={field.label}
          type={field.type === 'number' ? 'number' : 'text'}
          value={params[field.key] ?? ''}
          onChange={event => onChange(field.key, event.target.value)}
          fullWidth
        >
          {field.options?.map(option => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      ))}
    </Stack>
  );
};
