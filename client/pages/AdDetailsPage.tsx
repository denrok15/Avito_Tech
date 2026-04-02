import EditRoundedIcon from '@mui/icons-material/EditRounded';
import WestRoundedIcon from '@mui/icons-material/WestRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardMedia,
  Divider,
  Stack,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import { loadAdByIdQuery } from '@/api';
import { DetailParams, MissingFieldsAlert, PageState } from '@/components';
import { CATEGORY_LABELS, PLACEHOLDER_IMAGE } from '@/shared/consts';
import { formatCurrency, formatDate, getMissingFields } from '@/utils';

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

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
        <Button startIcon={<WestRoundedIcon />} onClick={() => navigate('/ads')}>
          К списку объявлений
        </Button>
        <Button
          variant="contained"
          startIcon={<EditRoundedIcon />}
          onClick={() => navigate(`/ads/${adQuery.data?.id}/edit`)}
        >
          Редактировать
        </Button>
      </Stack>

      <Card>
        <CardMedia
          component="img"
          image={PLACEHOLDER_IMAGE}
          alt={adQuery.data.title}
          sx={{ height: 288, objectFit: 'cover' }}
        />
        <CardContent>
          <Stack spacing={2}>
            <Typography variant="overline" color="text.secondary">
              {CATEGORY_LABELS[adQuery.data.category]}
            </Typography>

            <Typography variant="h4" sx={{ fontWeight: 600, color: 'text.primary' }}>
              {adQuery.data.title}
            </Typography>

            <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
              <Typography variant="h5" color="primary" sx={{ fontWeight: 600 }}>
                {formatCurrency(adQuery.data.price)}
              </Typography>
              <Typography color="text.secondary">Опубликовано: {formatDate(adQuery.data.createdAt)}</Typography>
            </Stack>

            <Divider />

            {missingFields.length ? <MissingFieldsAlert fields={missingFields} /> : null}

            <Box>
              <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                Характеристики
              </Typography>
              <DetailParams item={adQuery.data} />
            </Box>

            <Divider />

            <Box>
              <Typography variant="h6" sx={{ mb: 1, color: 'text.primary' }}>
                Описание
              </Typography>
              <Typography color="text.secondary">
                {adQuery.data.description?.trim() || 'Описание отсутствует'}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
};
