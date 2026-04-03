import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import FormatListBulletedIcon from "@mui/icons-material/FormatListBulleted";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import ViewModuleRoundedIcon from "@mui/icons-material/ViewModuleRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import {
  Alert,
  Button,
  Box,
  CircularProgress,
  IconButton,
  InputAdornment,
  MenuItem,
  Pagination,
  Stack,
  TextField,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { loadAdsQuery } from "@/api";
import { AdCard, AdsFilters } from "@/components";
import { useDebouncedValue } from "@/hooks";
import type { ItemCategory } from "@/shared/types";
import { useThemeStore } from "@/store";
import { extractErrorMessage } from "@/utils";

const PAGE_SIZE = 10;

type SortValue =
  | "createdAt-desc"
  | "createdAt-asc"
  | "title-asc"
  | "title-desc";

export const AdsListPage = () => {
  const navigate = useNavigate();
  const mode = useThemeStore((state) => state.mode);
  const toggleMode = useThemeStore((state) => state.toggleMode);

  const [query, setQuery] = useState("");
  const [sortValue, setSortValue] = useState<SortValue>("createdAt-desc");
  const [categories, setCategories] = useState<ItemCategory[]>([]);
  const [onlyNeedsRevision, setOnlyNeedsRevision] = useState(false);
  const [page, setPage] = useState(1);
  const [layout, setLayout] = useState<"grid" | "list">("grid");

  const debouncedQuery = useDebouncedValue(query, 400);

  const queryFilters = useMemo(() => {
    const [sortColumn, sortDirection] = sortValue.split("-") as [
      "title" | "createdAt",
      "asc" | "desc",
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

  const adsQuery = useQuery({
    ...loadAdsQuery(queryFilters),
    placeholderData: keepPreviousData,
  });

  const totalPages = Math.max(
    1,
    Math.ceil((adsQuery.data?.total ?? 0) / PAGE_SIZE),
  );

  const toggleCategory = (category: ItemCategory) => {
    setPage(1);
    setCategories((current) =>
      current.includes(category)
        ? current.filter((value) => value !== category)
        : [...current, category],
    );
  };

  const resetFilters = () => {
    setPage(1);
    setQuery("");
    setSortValue("createdAt-desc");
    setCategories([]);
    setOnlyNeedsRevision(false);
  };

  const isInitialLoading = adsQuery.isLoading && !adsQuery.data;

  return (
    <Box sx={{ fontFamily: '"Roboto", "Arial", sans-serif' }}>
      <Box sx={{ mb: 5 }}>
        <Box
          component="h1"
          sx={{
            m: 0,
            fontSize: 22,
            fontWeight: 700,
            lineHeight: "40px",
            color: "text.primary",
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
            lineHeight: "100%",
            letterSpacing: 0,
            color: "#848388",
          }}
        >
          {adsQuery.data?.total ?? 0} объявления
        </Box>
      </Box>

      <Box
        sx={{
          borderRadius: 1.5,
          borderColor: "divider",
          bgcolor: "background.paper",
          p: 1.5,
        }}
      >
        <Stack direction={{ xs: "column", lg: "row" }} spacing={1.5}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Найти объявление..."
            value={query}
            sx={{
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#F7F5F8",
                borderRadius: 1,
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                },
              },
            }}
            onChange={(event) => {
              setPage(1);
              setQuery(event.target.value);
            }}
            size="small"
            slotProps={{
              input: {
                endAdornment: (
                  <InputAdornment position="end" sx={{ color: "#000000" }}>
                    <SearchRoundedIcon fontSize="small" />
                  </InputAdornment>
                ),
              },
            }}
          />

          <Stack
            direction="row"
            sx={{
              flexShrink: 0,
              alignItems: "center",
              px: 0.5,
              py: 0.25,
              borderRadius: "8px",
              bgcolor: "#f7f5f8",
            }}
          >
            <IconButton
              size="small"
              onClick={() => setLayout("grid")}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: "transparent",
                color: layout === "grid" ? "#1890FF" : "#000000",
                "&:hover": {
                  bgcolor: "transparent",
                },
              }}
            >
              <ViewModuleRoundedIcon fontSize="small" />
            </IconButton>
            <Box
              sx={{
                mx: 0.75,
                width: 0,
                alignSelf: "stretch",
                borderLeft: "2px solid #FFFFFF",
              }}
            />
            <IconButton
              size="small"
              onClick={() => setLayout("list")}
              sx={{
                width: 32,
                height: 32,
                borderRadius: "8px",
                bgcolor: "transparent",
                color: layout === "list" ? "#1890FF" : "#000000",
                "&:hover": {
                  bgcolor: "transparent",
                },
              }}
            >
              <FormatListBulletedIcon fontSize="small" />
            </IconButton>
          </Stack>

          <Box
            sx={{
              width: 240,
              height: 40,
              p: "0px",
              borderRadius: "8px",
              bgcolor: "#F7F5F8",
              flexShrink: 0,
            }}
          >
            <TextField
              select
              value={sortValue}
              onChange={(event) => {
                setPage(1);
                setSortValue(event.target.value as SortValue);
              }}
              size="small"
              sx={{
                width: "100%",
                height: "100%",
                "& .MuiOutlinedInput-root": {
                  height: "100%",
                  borderRadius: "8px",
                  bgcolor: "#ffffff",
                  "& fieldset": {
                    border: "none",
                  },
                  "&:hover fieldset": {
                    border: "none",
                  },
                  "&.Mui-focused fieldset": {
                    border: "none",
                  },
                },
                "& .MuiSelect-select": {
                  py: "9px",
                  pr: "32px !important",
                  pl: "16px",
                  fontFamily: '"Roboto", "Arial", sans-serif',
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "22px",
                  letterSpacing: 0,
                  color: "rgba(0, 0, 0, 0.85)",
                },
                "& .MuiSelect-icon": {
                  color: "#000000",
                  right: 8,
                },
              }}
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
          </Box>

          <IconButton
            size="small"
            onClick={toggleMode}
            aria-label="Сменить тему"
            sx={{
              flexShrink: 0,
              bgcolor: "#f1f5f9",
              color: "#475569",
              "&:hover": {
                bgcolor: "#e2e8f0",
              },
            }}
          >
            {mode === "dark" ? (
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
          display: "grid",
          gap: 2,
          gridTemplateColumns: { xs: "1fr", lg: "256px minmax(0, 1fr)" },
        }}
      >
        <Box>
          <AdsFilters
            categories={categories}
            onlyNeedsRevision={onlyNeedsRevision}
            onToggleCategory={toggleCategory}
            onToggleNeedsRevision={(value) => {
              setPage(1);
              setOnlyNeedsRevision(value);
            }}
            onReset={resetFilters}
          />
        </Box>

        <Stack spacing={2}>
          {adsQuery.isFetching ? (
            <Stack direction="row" alignItems="center" spacing={1}>
              <CircularProgress size={16} />
              <Box sx={{ fontSize: 13, color: "text.secondary" }}>
                Обновляем объявления...
              </Box>
            </Stack>
          ) : null}

          {adsQuery.isError ? (
            <Alert
              severity="error"
              action={
                <Button size="small" color="inherit" onClick={() => adsQuery.refetch()}>
                  Повторить
                </Button>
              }
            >
              {extractErrorMessage(adsQuery.error)}
            </Alert>
          ) : null}

          {isInitialLoading ? (
            <Box
              sx={{
                minHeight: 240,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress />
            </Box>
          ) : adsQuery.data?.items.length ? (
            <Box
              sx={
                layout === "grid"
                  ? {
                      display: "grid",
                      rowGap: 1.5,
                      columnGap: "14px",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, minmax(0, 1fr))",
                        md: "repeat(3, minmax(0, 1fr))",
                        lg: "repeat(4, 200px)",
                        xl: "repeat(5, 220px)",
                      },
                      justifyContent: { lg: "start" },
                    }
                  : {
                      display: "grid",
                      gap: 1.5,
                    }
              }
            >
              {adsQuery.data.items.map((item) => (
                <AdCard
                  key={`${item.id}-${item.title}`}
                  item={item}
                  layout={layout}
                  onClick={() => navigate(`/ads/${item.id}`)}
                />
              ))}
            </Box>
          ) : !adsQuery.isError ? (
            <Alert severity="info">
              Объявления не найдены. Попробуйте изменить фильтры.
            </Alert>
          ) : null}

          {adsQuery.data?.total ? (
            <Stack alignItems="flex-start">
              <Pagination
                page={page}
                count={totalPages}
                onChange={(_, value) => setPage(value)}
                variant="outlined"
                shape="rounded"
                size="small"
                sx={{
                  "& .MuiPagination-ul": {
                    gap: 1,
                  },
                  "& .MuiPaginationItem-root": {
                    minWidth: 36,
                    height: 36,
                    borderRadius: "8px",
                    margin: 0,
                    fontSize: 14,
                    color: "rgba(0, 0, 0, 0.85)",
                  },
                  "& .MuiPaginationItem-root.Mui-selected": {
                    border: "1px solid #1890FF",
                    color: "#1890FF",
                    backgroundColor: "#ffffff",
                  },
                  "& .MuiPaginationItem-root.Mui-selected:hover": {
                    backgroundColor: "#ffffff",
                  },
                }}
              />
            </Stack>
          ) : null}
        </Stack>
      </Box>
    </Box>
  );
};
