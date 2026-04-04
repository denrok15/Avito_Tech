import ClearRoundedIcon from '@mui/icons-material/ClearRounded';
import {
  IconButton,
  InputAdornment,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { CATEGORY_PARAM_FIELDS } from '@/shared/consts';
import type { ItemCategory } from '@/shared/types';

const PARAM_LABEL_SX = {
  fontFamily: 'Roboto, system-ui, sans-serif',
  fontWeight: 400,
  fontSize: 14,
  lineHeight: '22px',
  letterSpacing: 0,
  color: '#000000D9',
};

const INPUT_SX = {
  width: '100%',
  maxWidth: 456,
  '& .MuiOutlinedInput-root': {
    height: 32,
    borderRadius: '8px',
    fontSize: 14,
    '& .MuiOutlinedInput-notchedOutline': {
      borderWidth: 1,
      borderColor: '#D9D9D9',
    },
    '& .MuiOutlinedInput-input': {
      py: '5px',
      px: '12px',
      height: 22,
      boxSizing: 'border-box',
    },
    '&.MuiInputBase-multiline': {
      height: 'auto',
      minHeight: 32,
      alignItems: 'flex-start',
    },
  },
};

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
      {fields.map(field => {
        const value = params[field.key] ?? '';
        const showWarning = !String(value).trim();
        const endAdornment =
          field.type !== 'select' && value ? (
            <InputAdornment position="end" sx={{ mr: 0.5 }}>
              <IconButton
                size="small"
                edge="end"
                aria-label="Очистить"
                onClick={() => onChange(field.key, '')}
                sx={{ p: 0.25 }}
              >
                <ClearRoundedIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </InputAdornment>
          ) : undefined;

        return (
          <Stack key={field.key} spacing={0.5} sx={{ maxWidth: 456 }}>
            <Typography component="label" htmlFor={`param-${field.key}`} sx={PARAM_LABEL_SX}>
              {field.label}
            </Typography>
            <TextField
              id={`param-${field.key}`}
              select={field.type === 'select'}
              type={field.type === 'number' ? 'number' : 'text'}
              value={value}
              onChange={event => onChange(field.key, event.target.value)}
              hiddenLabel
              fullWidth
              error={false}
              slotProps={{
                ...(field.type === 'select'
                  ? { select: { displayEmpty: true } }
                  : {}),
                input: {
                  endAdornment,
                },
              }}
              sx={{
                ...INPUT_SX,
                '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
                  borderColor: showWarning ? '#FFA940' : '#D9D9D9',
                },
                '& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: showWarning ? '#FFA940' : '#D9D9D9',
                },
                '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
                  borderColor: showWarning ? '#FFA940' : '#D9D9D9',
                  borderWidth: 1,
                },
              }}
            >
              {field.type === 'select'
                ? [
                    <MenuItem key="__empty" value="">
                      <em>Выберите значение</em>
                    </MenuItem>,
                    ...(field.options?.map(option => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    )) ?? []),
                  ]
                : null}
            </TextField>
          </Stack>
        );
      })}
    </Stack>
  );
};
