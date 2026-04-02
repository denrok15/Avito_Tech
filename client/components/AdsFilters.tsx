import { Button, Card, CardContent, Checkbox, Divider, FormControlLabel, Stack, Switch, Typography } from '@mui/material';
import { CATEGORY_OPTIONS } from '@/shared/consts';
import type { ItemCategory } from '@/shared/types';

type AdsFiltersProps = {
  categories: ItemCategory[];
  onlyNeedsRevision: boolean;
  onToggleCategory: (category: ItemCategory) => void;
  onToggleNeedsRevision: (value: boolean) => void;
  onReset: () => void;
};

export const AdsFilters = ({
  categories,
  onlyNeedsRevision,
  onToggleCategory,
  onToggleNeedsRevision,
  onReset,
}: AdsFiltersProps) => {
  return (
    <Card
      sx={{
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 'none',
      }}
    >
      <CardContent sx={{ p: 2, fontFamily: '"Roboto", "Arial", sans-serif' }}>
        <Stack spacing={1.5}>
          <Typography sx={{ fontSize: 22, fontWeight: 700, color: 'text.primary' }}>
            Фильтры
          </Typography>

          <Typography sx={{ fontSize: 14, fontWeight: 600, color: 'text.primary' }}>Категория</Typography>

          <Stack spacing={0.5}>
            {CATEGORY_OPTIONS.map(option => (
              <FormControlLabel
                key={option.value}
                control={
                  <Checkbox
                    size="small"
                    checked={categories.includes(option.value)}
                    onChange={() => onToggleCategory(option.value)}
                  />
                }
                label={option.label}
                sx={{
                  m: 0,
                  '& .MuiFormControlLabel-label': {
                    fontSize: 15,
                    color: 'text.primary',
                  },
                }}
              />
            ))}
          </Stack>

          <Divider sx={{ my: 1 }} />

          <FormControlLabel
            control={
              <Switch
                checked={onlyNeedsRevision}
                onChange={event => onToggleNeedsRevision(event.target.checked)}
              />
            }
            label={'Только требующие\nдоработок'}
            labelPlacement="start"
            sx={{
              m: 0,
              width: '100%',
              justifyContent: 'space-between',
              '& .MuiFormControlLabel-label': {
                whiteSpace: 'pre-line',
                fontSize: 15,
                fontWeight: 600,
                lineHeight: '20px',
                color: 'text.primary',
              },
            }}
          />

          <Button
            variant="outlined"
            onClick={onReset}
            sx={{
              mt: 2,
              height: 40,
              borderRadius: 1.5,
              borderColor: 'divider',
              color: 'text.secondary',
            }}
          >
            Сбросить фильтры
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
};
