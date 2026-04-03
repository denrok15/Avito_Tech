import EditRoundedIcon from '@mui/icons-material/EditRounded';
import {
  Alert,
  Box,
  Button,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { loadAdByIdQuery } from '@/api';
import { AdDetailsMissingFieldsBanner, PageState } from '@/components';
import { PARAM_LABELS, PLACEHOLDER_IMAGE } from '@/shared/consts';
import { formatCurrency, getMissingFields } from '@/utils';

const humanizeParamValue = (value: unknown): string => {
  if (value == null || value === '') return '—';

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

const formatDateTime = (isoDate: string): string =>
  new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(isoDate));

export const AdDetailsPage = () => {
  const navigate = useNavigate();
  const params = useParams();
  const id = Number(params.id);

  const adQuery = useQuery(loadAdByIdQuery(id));

  if (!Number.isFinite(id)) {
    return <Alert severity="error">Некорректный ID объявления</Alert>;
  }

  if (adQuery.isLoading && !adQuery.data) {
    return <PageState isLoading />;
  }

  if (adQuery.isError && !adQuery.data) {
    return <PageState error={adQuery.error} onRetry={() => adQuery.refetch()} />;
  }

  if (!adQuery.data) {
    return <Alert severity="info">Объявление не найдено</Alert>;
  }

  const missingFields = getMissingFields(adQuery.data);
  const paramsEntries = Object.entries(adQuery.data.params ?? {}).filter(
    ([, value]) => value != null && value !== '',
  );

  return (
    <Stack spacing={4}>
      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={2}>
        <Stack spacing={1}>
          <Typography
            sx={{
              fontFamily: '"Roboto", "Arial", sans-serif',
              fontWeight: 500,
              fontSize: 30,
              lineHeight: '40px',
              letterSpacing: 0,
              color: 'rgba(0, 0, 0, 0.85)',
            }}
          >
            {adQuery.data.title}
          </Typography>
          <Button
            variant="contained"
            endIcon={<EditRoundedIcon />}
            onClick={() => navigate(`/ads/${adQuery.data.id}/edit`)}
            sx={{
              width: 170,
              height: 38,
              minWidth: 170,
              px: '12px',
              py: '8px',
              borderRadius: '8px',
              textTransform: 'none',
              fontSize: 16,
              fontFamily: '"Inter", sans-serif',
              fontWeight: 400,
              bgcolor: '#1890ff',
            }}
          >
            Редактировать
          </Button>
        </Stack>

        <Stack spacing={0.5} alignItems={{ xs: 'flex-start', md: 'flex-end' }}>
          <Typography
            sx={{
              fontFamily: '"Roboto", "Arial", sans-serif',
              fontWeight: 500,
              fontSize: 30,
              lineHeight: '40px',
              letterSpacing: 0,
              color: 'rgba(0, 0, 0, 0.85)',
            }}
          >
            {formatCurrency(adQuery.data.price)}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 400,
              fontSize: 16,
              lineHeight: '100%',
              letterSpacing: 0,
              color: '#848388',
            }}
          >
            Опубликовано: {formatDateTime(adQuery.data.createdAt)}
          </Typography>
          <Typography
            sx={{
              fontFamily: '"Inter", sans-serif',
              fontWeight: 400,
              fontSize: 16,
              lineHeight: '100%',
              letterSpacing: 0,
              color: '#848388',
            }}
          >
            Отредактировано: {formatDateTime(adQuery.data.updatedAt)}
          </Typography>
        </Stack>
      </Stack>

      <Divider />

      <Box
        sx={{
          display: 'grid',
          columnGap: '32px',
          rowGap: '32px',
          gridTemplateColumns: { xs: '1fr', lg: '480px minmax(0, 1fr)' },
          alignItems: 'start',
        }}
      >
        <Stack spacing={4} sx={{ width: '100%' }}>
          <Box
            sx={{
              width: '100%',
              maxWidth: 480,
              height: 360,
              bgcolor: '#f5f5f5',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <Box
              component="img"
              src={PLACEHOLDER_IMAGE}
              alt={adQuery.data.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                p: 6,
                opacity: 0.65,
              }}
            />
          </Box>

          <Stack
            spacing={2}
            sx={{
              width: '100%',
              maxWidth: 480,
              minHeight: 132,
            }}
          >
            <Typography
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 500,
                fontSize: 22,
                lineHeight: '28px',
                color: '#1E1E1E',
              }}
            >
              Описание
            </Typography>
            <Typography sx={{ fontFamily: '"Inter", sans-serif', fontSize: 16, lineHeight: '140%', color: '#262626' }}>
              {adQuery.data.description?.trim() || 'Описание отсутствует'}
            </Typography>
          </Stack>
        </Stack>

        <Stack spacing={3}>
          <AdDetailsMissingFieldsBanner fields={missingFields} />

          <Box>
            <Typography
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontWeight: 500,
                fontSize: 22,
                lineHeight: '28px',
                color: '#1E1E1E',
                mb: 2,
              }}
            >
              Характеристики
            </Typography>

            {paramsEntries.length ? (
              <Stack spacing={1}>
                {paramsEntries.map(([key, value]) => (
                  <Stack key={key} direction="row" spacing={2}>
                    <Typography
                      sx={{
                        width: 160,
                        flexShrink: 0,
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 600,
                        fontSize: 16,
                        lineHeight: '140%',
                        color: 'rgba(0, 0, 0, 0.45)',
                      }}
                    >
                      {PARAM_LABELS[key] ?? key}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: '"Inter", sans-serif',
                        fontWeight: 400,
                        fontSize: 16,
                        lineHeight: '140%',
                        color: 'rgba(0, 0, 0, 0.85)',
                      }}
                    >
                      {humanizeParamValue(value)}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            ) : (
              <Typography sx={{ fontSize: 16, color: '#8c8c8c' }}>Характеристики пока не заполнены</Typography>
            )}
          </Box>
        </Stack>
      </Box>
    </Stack>
  );
};
