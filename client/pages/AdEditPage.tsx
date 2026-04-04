import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  MenuItem,
  Popover,
  Snackbar,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ValidationError } from "yup";
import {
  adsKeyFactory,
  generateDescriptionSuggestion,
  generateMarketPriceSuggestion,
  loadAdByIdQuery,
  updateAdRequest,
} from "@/api";
import { CategoryParamsFields, PageState } from "@/components";
import { useAbortController } from "@/hooks";
import { IdeaIcon } from "@/icons";
import {
  CATEGORY_OPTIONS,
  CATEGORY_PARAM_FIELDS,
  STORAGE_KEYS,
} from "@/shared/consts";
import type { Item, ItemCategory, ItemUpdateIn } from "@/shared/types";
import {
  extractErrorMessage,
  isAbortError,
  itemFormSchema,
  toNumber,
} from "@/utils";

const DESCRIPTION_MAX = 3000;
const BORDER_COLOR = "#D9D9D9";
const ERROR_COLOR = "#EC221F";
const ACTION_BG = "#F9F1E6";
const ACTION_TEXT = "#FFA940";

const MAIN_LABEL_SX = {
  fontFamily: '"Inter", system-ui, sans-serif',
  fontWeight: 600,
  fontSize: 16,
  lineHeight: "24px",
  letterSpacing: 0,
  color: "#000000D9",
};

/** Основные поля (кроме категории): max 456×32 */
const FIELD_STD_SX = {
  width: "100%",
  maxWidth: 456,
  "& .MuiOutlinedInput-root": {
    height: 32,
    borderRadius: "8px",
    fontSize: 14,
    "& .MuiOutlinedInput-notchedOutline": {
      borderWidth: 1,
      borderColor: BORDER_COLOR,
    },
    "& .MuiOutlinedInput-input": {
      py: "5px",
      px: "12px",
      height: 22,
      boxSizing: "border-box",
    },
  },
} as const;

const CATEGORY_FIELD_SX = {
  width: "100%",
  maxWidth: 256,
  "& .MuiOutlinedInput-root": {
    height: 32,
    borderRadius: "8px",
    fontSize: 14,
    "& .MuiOutlinedInput-notchedOutline": {
      borderWidth: 1,
      borderColor: BORDER_COLOR,
    },
    "& .MuiOutlinedInput-input": {
      py: "4px",
      px: "12px",
      height: 24,
      boxSizing: "border-box",
    },
  },
} as const;

const Asterisk = () => (
  <Box component="span" sx={{ color: ERROR_COLOR }}>
    *
  </Box>
);

type FormState = {
  category: ItemCategory;
  title: string;
  price: string;
  description: string;
  params: Record<string, string>;
};

type TouchedState = {
  title: boolean;
  price: boolean;
};

const itemToFormState = (item: Item): FormState => ({
  category: item.category,
  title: item.title,
  price: item.price == null ? "" : String(item.price),
  description: item.description ?? "",
  params: Object.fromEntries(
    Object.entries(item.params ?? {}).map(([key, value]) => [
      key,
      value == null ? "" : String(value),
    ]),
  ),
});

const normalizeParams = (
  category: ItemCategory,
  params: Record<string, string>,
): ItemUpdateIn["params"] => {
  const fields = CATEGORY_PARAM_FIELDS[category];
  const normalized: Record<string, string | number> = {};

  for (const field of fields) {
    const rawValue = (params[field.key] ?? "").trim();
    if (!rawValue) continue;

    if (field.type === "number") {
      const numericValue = toNumber(rawValue);
      if (numericValue != null) normalized[field.key] = numericValue;
      continue;
    }

    normalized[field.key] = rawValue;
  }

  return normalized as ItemUpdateIn["params"];
};

const validateTitleValue = (title: string): string => {
  const t = title.trim();
  if (!t) return "Название обязательно";
  if (t.length > 160) return "Название должно быть не длиннее 160 символов";
  return "";
};

const validatePriceValue = (priceRaw: string): string => {
  if (!priceRaw.trim()) return "Цена обязательна";
  const p = toNumber(priceRaw);
  if (p == null) return "Цена должна быть числом";
  if (p < 0) return "Цена не может быть отрицательной";
  return "";
};

export const AdEditPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: idParam } = useParams();
  const id = Number(idParam);

  const adQuery = useQuery(loadAdByIdQuery(id));

  const [form, setForm] = useState<FormState | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    title?: string;
    price?: string;
    description?: string;
  }>({});
  const [touched, setTouched] = useState<TouchedState>({
    title: false,
    price: false,
  });
  const [draftRestored, setDraftRestored] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [priceTooltipOpen, setPriceTooltipOpen] = useState(false);
  const [descriptionTooltipOpen, setDescriptionTooltipOpen] = useState(false);

  const [generatedDescription, setGeneratedDescription] = useState("");
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingPrice, setIsGeneratingPrice] = useState(false);
  const [descriptionError, setDescriptionError] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const priceButtonRef = useRef<HTMLButtonElement | null>(null);
  const descriptionButtonRef = useRef<HTMLButtonElement | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const saveAbort = useAbortController();
  const descAbort = useAbortController();
  const priceAbort = useAbortController();

  useEffect(() => {
    if (!adQuery.data || form) return;

    const draftKey = STORAGE_KEYS.adDraft(adQuery.data.id);
    const draftRaw = localStorage.getItem(draftKey);

    if (draftRaw) {
      try {
        const parsedDraft = JSON.parse(draftRaw) as FormState;
        setForm(parsedDraft);
        setDraftRestored(true);
        return;
      } catch {
        localStorage.removeItem(draftKey);
      }
    }

    setForm(itemToFormState(adQuery.data));
  }, [adQuery.data, form]);

  useEffect(() => {
    if (!form || !Number.isFinite(id)) return;

    localStorage.setItem(STORAGE_KEYS.adDraft(id), JSON.stringify(form));
  }, [form, id]);

  const canSave = useMemo(() => {
    if (!form) return false;
    const titleOk = validateTitleValue(form.title) === "";
    const priceOk = validatePriceValue(form.price) === "";
    const descLen = form.description.length <= DESCRIPTION_MAX;
    return titleOk && priceOk && descLen;
  }, [form]);

  const titleRequired = !form?.title.trim();
  const showTitleDanger = Boolean(
    (fieldErrors.title && touched.title) || titleRequired,
  );
  const showPriceDanger = Boolean(fieldErrors.price && touched.price);
  const descriptionEmptyWarning = !form?.description.trim();

  const titleBorder = showTitleDanger ? ERROR_COLOR : BORDER_COLOR;
  const priceBorder = showPriceDanger ? ERROR_COLOR : BORDER_COLOR;

  const runTitleBlur = useCallback(() => {
    if (!form) return;
    setTouched((t) => ({ ...t, title: true }));
    setFieldErrors((e) => {
      const msg = validateTitleValue(form.title);
      const next = { ...e };
      if (msg) next.title = msg;
      else delete next.title;
      return next;
    });
  }, [form]);

  const runPriceBlur = useCallback(() => {
    if (!form) return;
    setTouched((t) => ({ ...t, price: true }));
    setFieldErrors((e) => {
      const msg = validatePriceValue(form.price);
      const next = { ...e };
      if (msg) next.price = msg;
      else delete next.price;
      return next;
    });
  }, [form]);

  if (!Number.isFinite(id)) {
    return <Alert severity="error">Некорректный ID объявления</Alert>;
  }

  if (adQuery.isLoading && !adQuery.data) {
    return <PageState isLoading />;
  }

  if (adQuery.isError && !adQuery.data) {
    return (
      <PageState error={adQuery.error} onRetry={() => adQuery.refetch()} />
    );
  }

  if (!adQuery.data || !form) {
    return <PageState isLoading />;
  }

  const aiContext = {
    category: form.category,
    title: form.title,
    description: form.description,
    price: toNumber(form.price) ?? 0,
    params: normalizeParams(form.category, form.params),
  } as const;

  const setField = (
    name: keyof FormState,
    value: string | Record<string, string>,
  ) => {
    setFieldErrors((e) => {
      const next = { ...e };
      if (name === "title") delete next.title;
      if (name === "price") delete next.price;
      if (name === "description") delete next.description;
      return next;
    });

    setForm((current) => {
      if (!current) return current;
      return { ...current, [name]: value };
    });
  };

  const setParamField = (name: string, value: string) => {
    setForm((current) => {
      if (!current) return current;
      return {
        ...current,
        params: { ...current.params, [name]: value },
      };
    });
  };

  const handleGenerateDescription = async () => {
    setDescriptionError(null);
    setGeneratedDescription("");
    setDescriptionTooltipOpen(false);
    setIsGeneratingDescription(true);

    const controller = descAbort.nextController();

    try {
      const response = await generateDescriptionSuggestion(
        aiContext,
        controller.signal,
      );
      setGeneratedDescription(response);
      setDescriptionTooltipOpen(true);
    } catch (error) {
      if (isAbortError(error)) return;
      setDescriptionError(extractErrorMessage(error));
      setDescriptionTooltipOpen(true);
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleGeneratePrice = async () => {
    setPriceError(null);
    setSuggestedPrice(null);
    setPriceTooltipOpen(false);
    setIsGeneratingPrice(true);

    const controller = priceAbort.nextController();

    try {
      const response = await generateMarketPriceSuggestion(
        aiContext,
        controller.signal,
      );
      setSuggestedPrice(response.price);
      setPriceTooltipOpen(true);
    } catch (error) {
      if (isAbortError(error)) return;
      setPriceError(extractErrorMessage(error));
      setPriceTooltipOpen(true);
    } finally {
      setIsGeneratingPrice(false);
    }
  };

  const handleSave = async () => {
    const price = toNumber(form.price);
    const payload: ItemUpdateIn = {
      category: form.category,
      title: form.title.trim(),
      price: price ?? 0,
      description: form.description.trim() || undefined,
      params: normalizeParams(form.category, form.params),
    };

    setTouched({ title: true, price: true });

    try {
      await itemFormSchema.validate(
        {
          category: payload.category,
          title: payload.title,
          price,
          description: payload.description,
        },
        { abortEarly: false },
      );
    } catch (error) {
      if (error instanceof ValidationError) {
        const next: { title?: string; price?: string; description?: string } =
          {};
        for (const issue of error.inner) {
          if (issue.path === "title") next.title = issue.message;
          if (issue.path === "price") next.price = issue.message;
          if (issue.path === "description") next.description = issue.message;
        }
        setFieldErrors(next);
        return;
      }
      setSnackbar({
        open: true,
        message: extractErrorMessage(error),
        severity: "error",
      });
      return;
    }

    setIsSaving(true);
    const controller = saveAbort.nextController();

    try {
      await updateAdRequest(id, payload, controller.signal);
      localStorage.removeItem(STORAGE_KEYS.adDraft(id));

      await queryClient.invalidateQueries({ queryKey: adsKeyFactory.all() });
      await queryClient.invalidateQueries({ queryKey: adsKeyFactory.byId(id) });

      setSnackbar((s) => ({ ...s, open: false }));
      navigate(`/ads/${id}`, { state: { showSaved: true } });
    } catch (error) {
      if (isAbortError(error)) return;
      setSnackbar({
        open: true,
        message: extractErrorMessage(error),
        severity: "error",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const closeSnackbar = () => {
    setSnackbar((s) => ({ ...s, open: false }));
  };

  return (
    <Box
      sx={{
        bgcolor: "#FFFFFF",
        minHeight: "100vh",
        width: "100%",
        pb: 4,
        position: "relative",
        "&::before": {
          content: '""',
          position: "fixed",
          inset: 0,
          bgcolor: "#FFFFFF",
          zIndex: -1,
        },
      }}
    >
      <Stack spacing={3} sx={{ maxWidth: 942, width: "100%" }}>
        <Typography
          sx={{
            fontFamily: "Roboto, system-ui, sans-serif",
            fontWeight: 500,
            fontSize: { xs: 24, sm: 30 },
            lineHeight: "40px",
            color: "#000000D9",
          }}
        >
          Редактирование объявления
        </Typography>

        {draftRestored ? (
          <Alert severity="info" sx={{ borderRadius: "8px" }}>
            Черновик восстановлен
          </Alert>
        ) : null}

        <Stack spacing={2}>
          <Stack spacing={0.5}>
            <Typography
              component="label"
              htmlFor="ad-category"
              sx={MAIN_LABEL_SX}
            >
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Asterisk />
                Категория
              </Box>
            </Typography>
            <TextField
              id="ad-category"
              select
              hiddenLabel
              value={form.category}
              onChange={(event) => {
                const nextCategory = event.target.value as ItemCategory;
                setField("category", nextCategory);
                setField("params", {});
              }}
              sx={{
                ...CATEGORY_FIELD_SX,
                "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                  borderColor: BORDER_COLOR,
                },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: BORDER_COLOR,
                  },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: BORDER_COLOR,
                    borderWidth: 1,
                  },
              }}
            >
              {CATEGORY_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
          </Stack>

          <Stack spacing={0.5}>
            <Typography component="label" htmlFor="ad-title" sx={MAIN_LABEL_SX}>
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Asterisk />
                Название
              </Box>
            </Typography>
            <TextField
              id="ad-title"
              hiddenLabel
              value={form.title}
              onChange={(event) => setField("title", event.target.value)}
              onBlur={runTitleBlur}
              error={false}
              helperText={
                showTitleDanger
                  ? (fieldErrors.title ??
                    "РќР°Р·РІР°РЅРёРµ РѕР±СЏР·Р°С‚РµР»СЊРЅРѕ")
                  : undefined
              }
              FormHelperTextProps={{
                sx: { mx: 0, color: ERROR_COLOR, fontSize: 12 },
              }}
              sx={{
                ...FIELD_STD_SX,
                "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                  borderColor: titleBorder,
                },
                "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: titleBorder,
                  },
                "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                  {
                    borderColor: titleBorder,
                    borderWidth: 1,
                  },
              }}
              slotProps={{
                input: {
                  "aria-invalid": showTitleDanger,
                  endAdornment: form.title ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        edge="end"
                        aria-label="Очистить"
                        onClick={() => setField("title", "")}
                        sx={{ p: 0.25 }}
                      >
                        <ClearRoundedIcon sx={{ fontSize: 18 }} />
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                },
              }}
            />
          </Stack>

          <Stack spacing={0.5}>
            <Typography component="label" htmlFor="ad-price" sx={MAIN_LABEL_SX}>
              <Box
                component="span"
                sx={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Asterisk />
                Цена
              </Box>
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <TextField
                id="ad-price"
                hiddenLabel
                type="number"
                value={form.price}
                onChange={(event) => setField("price", event.target.value)}
                onBlur={runPriceBlur}
                error={false}
                helperText={showPriceDanger ? fieldErrors.price : undefined}
                FormHelperTextProps={{
                  sx: {
                    mx: 0,
                    color: showPriceDanger ? ERROR_COLOR : "text.secondary",
                    fontSize: 12,
                  },
                }}
                sx={{
                  ...FIELD_STD_SX,
                  flex: 1,
                  "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                    borderColor: priceBorder,
                  },
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: priceBorder,
                    },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                    {
                      borderColor: priceBorder,
                      borderWidth: 1,
                    },
                }}
                slotProps={{
                  input: {
                    "aria-invalid": showPriceDanger,
                    endAdornment: form.price ? (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          edge="end"
                          aria-label="Очистить"
                          onClick={() => setField("price", "")}
                          sx={{ p: 0.25 }}
                        >
                          <ClearRoundedIcon sx={{ fontSize: 18 }} />
                        </IconButton>
                      </InputAdornment>
                    ) : undefined,
                  },
                }}
              />
              <Button
                type="button"
                ref={priceButtonRef}
                onClick={handleGeneratePrice}
                disabled={isGeneratingPrice}
                sx={{
                  minWidth: 220,
                  width: "auto",
                  height: 32,
                  borderRadius: "8px",
                  px: "7px",
                  gap: "10px",
                  bgcolor: ACTION_BG,
                  color: ACTION_TEXT,
                  fontFamily: "Roboto, system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "22px",
                  textAlign: "center",
                  textTransform: "none",
                  boxShadow: "none",
                  whiteSpace: "nowrap",
                  "&:hover": {
                    bgcolor: "#f3e6d6",
                    boxShadow: "none",
                  },
                  "&.Mui-disabled": {
                    bgcolor: ACTION_BG,
                    color: ACTION_TEXT,
                    opacity: 0.6,
                  },
                }}
                startIcon={
                  isGeneratingPrice ? <RestartAltRoundedIcon /> : <IdeaIcon />
                }
              >
                {isGeneratingPrice
                  ? "Выполняется запрос"
                  : suggestedPrice != null || priceError
                    ? "Повторить запрос"
                    : "Узнать рыночную цену"}
              </Button>
              <Popover
                open={priceTooltipOpen}
                anchorEl={priceButtonRef.current}
                onClose={() => {}}
                anchorOrigin={{ vertical: "top", horizontal: "left" }}
                transformOrigin={{ vertical: "bottom", horizontal: "left" }}
                disableAutoFocus
                disableEnforceFocus
                PaperProps={{
                  sx: {
                    p: "8px",
                    borderRadius: "2px",
                    border: `1px solid ${BORDER_COLOR}`,
                    boxShadow: "0px 2px 8px 0px #00000026",
                    width: 332,
                    bgcolor: priceError ? "#FEE9E7" : "#FFFFFF",
                  },
                }}
              >
                <Stack spacing={1}>
                  {priceError ? (
                    <Stack spacing={0.5}>
                      <Typography
                        sx={{
                          fontFamily: "Roboto, system-ui, sans-serif",
                          fontWeight: 500,
                          fontSize: 12,
                          lineHeight: "16px",
                          color: "#C00F0C",
                        }}
                      >
                        Произошла ошибка при запросе к AI
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "Roboto, system-ui, sans-serif",
                          fontWeight: 400,
                          fontSize: 12,
                          lineHeight: "16px",
                          color: "#1E1E1E",
                        }}
                      >
                        Попробуйте повторить запрос или закройте уведомление
                      </Typography>
                    </Stack>
                  ) : suggestedPrice != null ? (
                    <Box
                      component="ul"
                      sx={{
                        m: 0,
                        pl: "0px",
                        fontFamily: "Roboto, system-ui, sans-serif",
                        fontWeight: 400,
                        fontSize: 12,
                        lineHeight: "16px",
                        color: "#000000D9",
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "Roboto, system-ui, sans-serif",
                          fontWeight: 500,
                          fontSize: 12,
                          lineHeight: "16px",
                          color: "#1E1E1E",
                        }}
                      >
                        Ответ от AI:
                      </Typography>
                      <div style={{ marginTop: 4 }}>
                        {`Средняя цена: ${suggestedPrice.toLocaleString("ru-RU")} ₽`}
                      </div>
                    </Box>
                  ) : (
                    <Typography
                      sx={{
                        fontFamily: "Roboto, system-ui, sans-serif",
                        fontWeight: 400,
                        fontSize: 12,
                        lineHeight: "16px",
                        color: "#000000D9",
                      }}
                    >
                      Нет данных
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1}>
                    {suggestedPrice != null ? (
                      <Button
                        type="button"
                        onClick={() => {
                          setField("price", String(suggestedPrice));
                          setPriceTooltipOpen(false);
                        }}
                        sx={{
                          minWidth: 89,
                          width: 89,
                          height: 22,
                          borderRadius: "4px",
                          px: "7px",
                          gap: "10px",
                          bgcolor: "#1890FF",
                          color: "#FFFFFF",
                          fontFamily: "Roboto, system-ui, sans-serif",
                          fontWeight: 400,
                          fontSize: 14,
                          lineHeight: "22px",
                          textAlign: "center",
                          textTransform: "none",
                          boxShadow: "0px 2px 0px 0px #0000000B",
                          "&:hover": {
                            bgcolor: "#1677ff",
                            boxShadow: "0px 2px 0px 0px #0000000B",
                          },
                        }}
                      >
                        Применить
                      </Button>
                    ) : null}
                    <Button
                      type="button"
                      onClick={() => setPriceTooltipOpen(false)}
                      sx={{
                        minWidth: 73,
                        width: 73,
                        height: 24,
                        borderRadius: "4px",
                        px: "7px",
                        gap: "10px",
                        bgcolor: priceError ? "#FCB3AD" : "#FFFFFF",
                        color: "#000000D9",
                        border: `1px solid ${BORDER_COLOR}`,
                        fontFamily: "Roboto, system-ui, sans-serif",
                        fontWeight: 400,
                        fontSize: 14,
                        lineHeight: "22px",
                        textAlign: "center",
                        textTransform: "none",
                        boxShadow: "0px 2px 0px 0px #00000004",
                        "&:hover": {
                          bgcolor: priceError ? "#FCB3AD" : "#FFFFFF",
                          boxShadow: "0px 2px 0px 0px #00000004",
                        },
                      }}
                    >
                      Закрыть
                    </Button>
                  </Stack>
                </Stack>
              </Popover>
            </Stack>
          </Stack>

          <Typography
            sx={{
              fontFamily: "Roboto, system-ui, sans-serif",
              fontWeight: 400,
              fontSize: 14,
              lineHeight: "22px",
              letterSpacing: 0,
              color: "#000000D9",
              mt: 1,
            }}
          >
            Характеристики
          </Typography>

          <CategoryParamsFields
            category={form.category}
            params={form.params}
            onChange={setParamField}
          />

          <Stack spacing={0.5}>
            <Typography
              component="label"
              htmlFor="ad-description"
              sx={{
                fontFamily: '"Inter", system-ui, sans-serif',
                fontWeight: 600,
                fontSize: 16,
                lineHeight: "24px",
                color: "#000000D9",
              }}
            >
              Описание
            </Typography>
            <Box sx={{ position: "relative", width: "100%", maxWidth: 942 }}>
              {form.description ? (
                <IconButton
                  aria-label="Очистить описание"
                  size="small"
                  onClick={() => setField("description", "")}
                  sx={{
                    position: "absolute",
                    right: 8,
                    top: 8,
                    zIndex: 1,
                    p: 0.25,
                  }}
                >
                  <ClearRoundedIcon sx={{ fontSize: 18 }} />
                </IconButton>
              ) : null}
              <TextField
                id="ad-description"
                hiddenLabel
                multiline
                minRows={2}
                value={form.description}
                onChange={(event) => {
                  const next = event.target.value;
                  if (next.length <= DESCRIPTION_MAX)
                    setField("description", next);
                }}
                helperText={
                  fieldErrors.description ? (
                    fieldErrors.description
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        width: "100%",
                        gap: "8px",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Button
                          type="button"
                          onClick={handleGenerateDescription}
                          disabled={isGeneratingDescription}
                          ref={descriptionButtonRef}
                          startIcon={
                            isGeneratingDescription ? (
                              <RestartAltRoundedIcon />
                            ) : (
                              <IdeaIcon />
                            )
                          }
                          sx={{
                            minWidth: 220,
                            width: "auto",
                            height: 32,
                            borderRadius: "8px",
                            px: "7px",
                            gap: "10px",
                            bgcolor: ACTION_BG,
                            color: ACTION_TEXT,
                            fontFamily: "Roboto, system-ui, sans-serif",
                            fontWeight: 400,
                            fontSize: 14,
                            lineHeight: "22px",
                            textAlign: "center",
                            textTransform: "none",
                            boxShadow: "none",
                            whiteSpace: "nowrap",
                            "&:hover": {
                              bgcolor: "#f3e6d6",
                              boxShadow: "none",
                            },
                            "&.Mui-disabled": {
                              bgcolor: ACTION_BG,
                              color: ACTION_TEXT,
                              opacity: 0.6,
                            },
                          }}
                        >
                          {isGeneratingDescription
                            ? "Выполняется запрос"
                            : generatedDescription || descriptionError
                              ? "Повторить запрос"
                              : form.description.trim()
                                ? "Улучшить описание"
                                : "Придумать описание"}
                        </Button>
                        <Popover
                          open={descriptionTooltipOpen}
                          anchorEl={descriptionButtonRef.current}
                          onClose={() => {}}
                          anchorOrigin={{ vertical: "top", horizontal: "left" }}
                          transformOrigin={{
                            vertical: "bottom",
                            horizontal: "left",
                          }}
                          disableAutoFocus
                          disableEnforceFocus
                          PaperProps={{
                            sx: {
                              backgroundColor: descriptionError
                                ? "#FEE9E7"
                                : "#FFFFFF",
                              p: "8px",
                              borderRadius: "2px",
                              border: `1px solid ${BORDER_COLOR}`,
                              boxShadow: "0px 2px 8px 0px #00000026",
                              width: 332,
                            },
                          }}
                        >
                          <Stack spacing={1}>
                            {!descriptionError && (
                              <Typography
                                sx={{
                                  fontFamily: "Roboto, system-ui, sans-serif",
                                  fontWeight: 500,
                                  fontSize: 12,
                                  lineHeight: "16px",
                                  color: "#1E1E1E",
                                }}
                              >
                                Ответ от AI:
                              </Typography>
                            )}
                            <Typography
                              sx={{
                                fontFamily: "Roboto, system-ui, sans-serif",
                                fontWeight: 400,
                                fontSize: 12,
                                lineHeight: "16px",
                                color: "#000000D9",
                                whiteSpace: "pre-wrap",
                              }}
                            >
                              {descriptionError ? (
                                <Stack spacing={0.5}>
                                  <Typography
                                    sx={{
                                      fontFamily:
                                        "Roboto, system-ui, sans-serif",
                                      fontWeight: 500,
                                      fontSize: 12,
                                      lineHeight: "16px",
                                      color: "#C00F0C",
                                    }}
                                  >
                                    Произошла ошибка при запросе к AI
                                  </Typography>
                                  <Typography
                                    sx={{
                                      fontFamily:
                                        "Roboto, system-ui, sans-serif",
                                      fontWeight: 400,
                                      fontSize: 12,
                                      lineHeight: "16px",
                                      color: "#1E1E1E",
                                    }}
                                  >
                                    Попробуйте повторить запрос или закройте
                                    уведомление
                                  </Typography>
                                </Stack>
                              ) : (
                                generatedDescription || "Нет данных"
                              )}
                            </Typography>
                            <Stack direction="row" spacing={1}>
                              {generatedDescription ? (
                                <Button
                                  type="button"
                                  onClick={() => {
                                    setField(
                                      "description",
                                      generatedDescription,
                                    );
                                    setGeneratedDescription("");
                                    setDescriptionTooltipOpen(false);
                                  }}
                                  sx={{
                                    minWidth: 89,
                                    width: 89,
                                    height: 22,
                                    borderRadius: "4px",
                                    px: "7px",
                                    gap: "10px",
                                    bgcolor: "#1890FF",
                                    color: "#FFFFFF",
                                    fontFamily: "Roboto, system-ui, sans-serif",
                                    fontWeight: 400,
                                    fontSize: 14,
                                    lineHeight: "22px",
                                    textAlign: "center",
                                    textTransform: "none",
                                    boxShadow: "0px 2px 0px 0px #0000000B",
                                    "&:hover": {
                                      bgcolor: "#1677ff",
                                      boxShadow: "0px 2px 0px 0px #0000000B",
                                    },
                                  }}
                                >
                                  Применить
                                </Button>
                              ) : null}
                              <Button
                                type="button"
                                onClick={() => setDescriptionTooltipOpen(false)}
                                sx={{
                                  minWidth: 73,
                                  width: 73,
                                  height: 24,
                                  borderRadius: "4px",
                                  px: "7px",
                                  gap: "10px",
                                  bgcolor: "#FFFFFF",
                                  color: "#000000D9",
                                  border: `1px solid ${BORDER_COLOR}`,
                                  fontFamily: "Roboto, system-ui, sans-serif",
                                  fontWeight: 400,
                                  fontSize: 14,
                                  lineHeight: "22px",
                                  textAlign: "center",
                                  textTransform: "none",
                                  boxShadow: "0px 2px 0px 0px #00000004",
                                  "&:hover": {
                                    bgcolor: descriptionError
                                      ? "#FCB3AD"
                                      : "#FFFFFF",
                                    boxShadow: "0px 2px 0px 0px #00000004",
                                  },
                                }}
                              >
                                Закрыть
                              </Button>
                            </Stack>
                          </Stack>
                        </Popover>
                      </Box>
                      <Box
                        component="span"
                        sx={{
                          color: "text.secondary",
                          fontSize: 13,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {form.description.length} / {DESCRIPTION_MAX}
                      </Box>
                    </Box>
                  )
                }
                FormHelperTextProps={{
                  sx: {
                    mx: 0,
                    mt: 1,
                    color: fieldErrors.description ? "#EC221F" : undefined,
                  },
                }}
                sx={{
                  width: "100%",
                  "& .MuiOutlinedInput-root": {
                    borderRadius: "8px",
                    fontSize: 14,
                    minHeight: 60,
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderWidth: 1,
                      borderColor: fieldErrors.description
                        ? ERROR_COLOR
                        : descriptionEmptyWarning
                          ? "#FFA940"
                          : BORDER_COLOR,
                    },
                    "&:hover .MuiOutlinedInput-notchedOutline": {
                      borderColor: fieldErrors.description
                        ? ERROR_COLOR
                        : descriptionEmptyWarning
                          ? "#FFA940"
                          : BORDER_COLOR,
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      borderColor: fieldErrors.description
                        ? ERROR_COLOR
                        : descriptionEmptyWarning
                          ? "#FFA940"
                          : BORDER_COLOR,
                      borderWidth: 1,
                    },
                    "& .MuiOutlinedInput-input": {
                      py: "8px",
                      px: "16px",
                      paddingRight: form.description ? 40 : "12px",
                    },
                  },
                }}
              />
            </Box>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ pt: 2, gap: "8px" }}
        >
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving || !canSave}
            sx={{
              width: 108,
              minWidth: 108,
              height: 38,
              borderRadius: "8px",
              py: "8px",
              px: "12px",
              gap: "8px",
              bgcolor: "#1890FF",
              color: "#FFFFFF",
              fontFamily: '"Inter", system-ui, sans-serif',
              fontWeight: 400,
              fontSize: 16,
              textTransform: "none",
              boxShadow: "none",
              border: "none",
              "&:hover": {
                bgcolor: "#1677ff",
                boxShadow: "none",
              },
              "&.Mui-disabled": {
                bgcolor: "#F3F3F3",
                color: "rgba(0,0,0,0.35)",
              },
            }}
          >
            {isSaving ? "Сохранение..." : "Сохранить"}
          </Button>

          <Button
            type="button"
            variant="outlined"
            onClick={() => navigate(`/ads/${id}`)}
            disabled={isSaving}
            sx={{
              width: 102,
              minWidth: 102,
              height: 38,
              borderRadius: "8px",
              py: "8px",
              px: "12px",
              gap: "8px",
              borderColor: "#D9D9D9",
              borderWidth: 1,
              color: "#5A5A5A",
              fontFamily: '"Inter", system-ui, sans-serif',
              fontWeight: 400,
              fontSize: 16,
              textTransform: "none",
              bgcolor: "#FFFFFF",
              "&:hover": {
                borderColor: "#D9D9D9",
                bgcolor: "#fafafa",
              },
            }}
          >
            Отменить
          </Button>
        </Stack>
      </Stack>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={snackbar.severity === "success" ? 3000 : 6000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        {snackbar.severity === "success" ? (
          <Box
            sx={{
              width: 328,
              height: 40,
              borderRadius: "2px",
              px: "16px",
              py: "9px",
              border: "1px solid #B7EB8F",
              bgcolor: "#F6FFED",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <CheckCircleRoundedIcon sx={{ fontSize: 18, color: "#52C41A" }} />
            <Typography
              sx={{
                fontFamily: "Roboto, system-ui, sans-serif",
                fontWeight: 400,
                fontSize: 14,
                lineHeight: "22px",
                color: "#1E1E1E",
              }}
            >
              Изменения сохранены
            </Typography>
          </Box>
        ) : (
          <Box
            sx={{
              width: 327,
              height: 118,
              borderRadius: "2px",
              px: "16px",
              py: "9px",
              border: "1px solid #FFCCC7",
              bgcolor: "#FFF1F0",
              display: "flex",
              flexDirection: "row",
              gap: "6px",
            }}
          >
            <CancelRoundedIcon
              sx={{ fontSize: 18, color: "#C00F0C", mt: "2px" }}
            />
            <Box sx={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <Typography
                sx={{
                  fontFamily: "Roboto, system-ui, sans-serif",
                  fontWeight: 500,
                  fontSize: 14,
                  lineHeight: "22px",
                  color: "#1E1E1E",
                }}
              >
                Ошибка сохранения
              </Typography>
              <Typography
                sx={{
                  fontFamily: "Roboto, system-ui, sans-serif",
                  fontWeight: 400,
                  fontSize: 14,
                  lineHeight: "22px",
                  color: "#1E1E1E",
                }}
              >
                При попытке сохранить изменения произошла ошибка. Попробуйте ещё
                раз или зайдите позже.
              </Typography>
            </Box>
          </Box>
        )}
      </Snackbar>
    </Box>
  );
};
