import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded';
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded';
import ViewAgendaRoundedIcon from '@mui/icons-material/ViewAgendaRounded';
import ViewModuleRoundedIcon from '@mui/icons-material/ViewModuleRounded';
import SearchRoundedIcon from '@mui/icons-material/SearchRounded';
import {
  Alert,
  Box,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  TextField,
} from '@mui/material';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { loadAdsQuery } from '@/api';
import { AdCard, AdsFilters, PageState } from '@/components';
import { useDebouncedValue } from '@/hooks';
import type { ItemCategory } from '@/shared/types';
import { useThemeStore } from '@/store';
import { extractErrorMessage } from '@/utils';

const PAGE_SIZE = 10;

type SortValue =
  | 'createdAt-desc'
  | 'createdAt-asc'
  | 'title-asc'
  | 'title-desc';

export const AdsListPage = () => {
  const navigate = useNavigate();
  const mode = useThemeStore(state => state.mode);
  const toggleMode = useThemeStore(state => state.toggleMode);

  const [query, setQuery] = useState('');
  const [sortValue, setSortValue] = useState<SortValue>('createdAt-desc');
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [onlyNeedsRevision, setOnlyNeedsRevision] = useState(false);
  const [page, setPage] = useState(1);
  const [layout, setLayout] = useState<'grid' | 'list'>('grid');

  const debouncedQuery = useDebouncedValue(query, 400);

  const queryFilters = useMemo(() => {
    const [sortColumn, sortDirection] = sortValue.split('-') as [
      'title' | 'createdAt',
      'asc' | 'desc',
    ];

    return {
      q: debouncedQuery,
      limit: PAGE_SIZE,
      skip: (page - 1) * PAGE_SIZE,
      categories: categories.length ? categories : undefined,
      needsRevision: onlyNeedsRevision,
      sortColumn,
      sortDirection,
    };
  }, [debouncedQuery, page, categories, onlyNeedsRevision, sortValue]);

  const adsQuery = useQuery(loadAdsQuery(queryFilters));

  const totalPages = Math.max(
    1,
    Math.ceil((adsQuery.data?.total ?? 0) / PAGE_SIZE),
  );

  const toggleCategory = (category: ItemCategory) => {
    setPage(1);
    setCategories(current =>
      current.includes(category)
        ? current.filter(value => value !== category)
        : [...current, category],
    );
  };

  const resetFilters = () => {
    setPage(1);
    setQuery('');
    setSortValue('createdAt-desc');
    setCategories([]);
    setOnlyNeedsRevision(false);
  };

  if (adsQuery.isLoading && !adsQuery.data) {
    return <PageState isLoading />;
  }

  if (adsQuery.isError && !adsQuery.data) {
    return (
      <PageState error={adsQuery.error} onRetry={() => adsQuery.refetch()} />
    );
  }

  return (
    <Box sx={{ fontFamily: '"Roboto", "Arial", sans-serif' }}>
      <Box sx={{ mb: 5 }}>
        <Box
          component="h1"
          sx={{
            m: 0,
            fontSize: 22,
            fontWeight: 700,
            lineHeight: '40px',
            color: 'text.primary',
          }}
        >
          Мои объявления
        </Box>
        <Box
          component="p"
          sx={{
            m: 0,
            fontFamily: '"Inter", sans-serif',
            fontWeight: 400,
            fontSize: 18,
            lineHeight: '100%',
            letterSpacing: 0,
            color: '#848388',
          }}
        >
          {adsQuery.data?.total ?? 0} объявления
        </Box>
      </Box>

      <Box
        sx={{
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          p: 1.5,
        }}
      >
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={1.5}>
          <TextField
            fullWidth
            placeholder="Найти объявление..."
            value={query}
            onChange={event => {
              setPage(1);
              setQuery(event.target.value);
            }}
            size="small"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
            <IconButton
              size="small"
              onClick={() => setLayout('grid')}
              sx={{
                bgcolor: layout === 'grid' ? '#eff6ff' : '#f1f5f9',
                color: layout === 'grid' ? '#3b82f6' : '#64748b',
                '&:hover': {
                  bgcolor: layout === 'grid' ? '#dbeafe' : '#e2e8f0',
                },
              }}
            >
              <ViewModuleRoundedIcon fontSize="small" />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => setLayout('list')}
              sx={{
                bgcolor: layout === 'list' ? '#eff6ff' : '#f1f5f9',
                color: layout === 'list' ? '#3b82f6' : '#64748b',
                '&:hover': {
                  bgcolor: layout === 'list' ? '#dbeafe' : '#e2e8f0',
                },
              }}
            >
              <ViewAgendaRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <TextField
            select
            value={sortValue}
            onChange={event => {
              setPage(1);
              setSortValue(event.target.value as SortValue);
            }}
            size="small"
            sx={{ minWidth: { lg: 256 }, flexShrink: 0 }}
          >
            <MenuItem value="createdAt-desc">
              По новизне (сначала новые)
            </MenuItem>
            <MenuItem value="createdAt-asc">
              По новизне (сначала старые)
            </MenuItem>
            <MenuItem value="title-asc">По названию (А-Я)</MenuItem>
            <MenuItem value="title-desc">По названию (Я-А)</MenuItem>
          </TextField>

          <IconButton
            size="small"
            onClick={toggleMode}
            aria-label="Сменить тему"
            sx={{
              flexShrink: 0,
              bgcolor: '#f1f5f9',
              color: '#475569',
              '&:hover': {
                bgcolor: '#e2e8f0',
              },
            }}
          >
            {mode === 'dark' ? (
              <LightModeRoundedIcon fontSize="small" />
            ) : (
              <DarkModeRoundedIcon fontSize="small" />
            )}
          </IconButton>
        </Stack>
      </Box>

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '234px minmax(0, 1fr)' },
        }}
      >
        <Box>
          <AdsFilters
            categories={categories}
            onlyNeedsRevision={onlyNeedsRevision}
            onToggleCategory={toggleCategory}
            onToggleNeedsRevision={value => {
              setPage(1);
              setOnlyNeedsRevision(value);
            }}
            onReset={resetFilters}
          />
        </Box>

        <Stack spacing={2}>
          {adsQuery.isError ? (
            <Alert severity="error">
              {extractErrorMessage(adsQuery.error)}
            </Alert>
          ) : null}

          {adsQuery.data?.items.length ? (
            <Box
              sx={
                layout === 'grid'
                  ? {
                      display: 'grid',
                      gap: 1.5,
                      gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, minmax(0, 1fr))',
                        md: 'repeat(3, minmax(0, 1fr))',
                        lg: 'repeat(auto-fill, minmax(200px, 200px))',
                      },
                      justifyContent: { lg: 'space-between' },
                    }
                  : {
                      display: 'grid',
                      gap: 1.5,
                    }
              }
            >
              {adsQuery.data.items.map(item => (
                <AdCard
                  key={`${item.id}-${item.title}`}
                  item={item}
                  layout={layout}
                  onClick={() => navigate(`/ads/${item.id}`)}
                />
              ))}
            </Box>
          ) : (
            <Alert severity="info">
              Объявления не найдены. Попробуйте изменить фильтры.
            </Alert>
          )}

          {adsQuery.data?.total ? (
            <Stack alignItems="flex-start">
              <Pagination
                page={page}
                count={totalPages}
                onChange={(_, value) => setPage(value)}
                color="primary"
                size="small"
              />
            </Stack>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
};
