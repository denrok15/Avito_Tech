import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import UndoRoundedIcon from '@mui/icons-material/UndoRounded';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ValidationError } from 'yup';
import {
  adsKeyFactory,
  generateDescriptionSuggestion,
  generateMarketPriceSuggestion,
  loadAdByIdQuery,
  updateAdRequest,
} from '@/api';
import {
  AiAssistantPanel,
  CategoryParamsFields,
  MissingFieldsAlert,
  PageState,
} from '@/components';
import { useAbortController } from '@/hooks';
import { CATEGORY_OPTIONS, CATEGORY_PARAM_FIELDS, STORAGE_KEYS } from '@/shared/consts';
import type { Item, ItemCategory, ItemUpdateIn } from '@/shared/types';
import {
  extractErrorMessage,
  getMissingFields,
  isAbortError,
  itemFormSchema,
  toNumber,
} from '@/utils';

type FormState = {
  category: ItemCategory;
  title: string;
  price: string;
  description: string;
  params: Record<string, string>;
};

const itemToFormState = (item: Item): FormState => ({
  category: item.category,
  title: item.title,
  price: item.price == null ? '' : String(item.price),
  description: item.description ?? '',
  params: Object.fromEntries(
    Object.entries(item.params ?? {}).map(([key, value]) => [key, value == null ? '' : String(value)]),
  ),
});

const normalizeParams = (
  category: ItemCategory,
  params: Record<string, string>,
): ItemUpdateIn['params'] => {
  const fields = CATEGORY_PARAM_FIELDS[category];
  const normalized: Record<string, string | number> = {};

  for (const field of fields) {
    const rawValue = (params[field.key] ?? '').trim();
    if (!rawValue) continue;

    if (field.type === 'number') {
      const numericValue = toNumber(rawValue);
      if (numericValue != null) normalized[field.key] = numericValue;
      continue;
    }

    normalized[field.key] = rawValue;
  }

  return normalized as ItemUpdateIn['params'];
};

export const AdEditPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { id: idParam } = useParams();
  const id = Number(idParam);

  const adQuery = useQuery(loadAdByIdQuery(id));

  const [form, setForm] = useState<FormState | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [draftRestored, setDraftRestored] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [generatedDescription, setGeneratedDescription] = useState('');
  const [suggestedPrice, setSuggestedPrice] = useState<number | null>(null);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingPrice, setIsGeneratingPrice] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const saveAbort = useAbortController();
  const descAbort = useAbortController();
  const priceAbort = useAbortController();

  const missingFields = useMemo(
    () => (adQuery.data ? getMissingFields(adQuery.data) : []),
    [adQuery.data],
  );

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

  if (!Number.isFinite(id)) {
    return <Alert severity="error">Некорректный ID объявления</Alert>;
  }

  if (adQuery.isLoading && !adQuery.data) {
    return <PageState isLoading />;
  }

  if (adQuery.isError && !adQuery.data) {
    return <PageState error={adQuery.error} onRetry={() => adQuery.refetch()} />;
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

  const setField = (name: keyof FormState, value: string | Record<string, string>) => {
    setValidationErrors(current => ({ ...current, [name]: '' }));
    setSubmitError(null);

    setForm(current => {
      if (!current) return current;

      return {
        ...current,
        [name]: value,
      };
    });
  };

  const setParamField = (name: string, value: string) => {
    setForm(current => {
      if (!current) return current;
      return {
        ...current,
        params: {
          ...current.params,
          [name]: value,
        },
      };
    });
  };

  const handleGenerateDescription = async () => {
    setAiError(null);
    setIsGeneratingDescription(true);

    const controller = descAbort.nextController();

    try {
      const response = await generateDescriptionSuggestion(aiContext, controller.signal);
      setGeneratedDescription(response);
    } catch (error) {
      if (isAbortError(error)) return;
      setAiError(extractErrorMessage(error));
    } finally {
      setIsGeneratingDescription(false);
    }
  };

  const handleGeneratePrice = async () => {
    setAiError(null);
    setIsGeneratingPrice(true);

    const controller = priceAbort.nextController();

    try {
      const response = await generateMarketPriceSuggestion(aiContext, controller.signal);
      setSuggestedPrice(response.price);
    } catch (error) {
      if (isAbortError(error)) return;
      setAiError(extractErrorMessage(error));
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

    setSubmitError(null);
    setValidationErrors({});

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
        const nextErrors: Record<string, string> = {};

        for (const issue of error.inner) {
          if (issue.path) nextErrors[issue.path] = issue.message;
        }

        setValidationErrors(nextErrors);
        return;
      }

      setSubmitError(extractErrorMessage(error));
      return;
    }

    setIsSaving(true);
    const controller = saveAbort.nextController();

    try {
      await updateAdRequest(id, payload, controller.signal);
      localStorage.removeItem(STORAGE_KEYS.adDraft(id));

      await queryClient.invalidateQueries({ queryKey: adsKeyFactory.all() });
      await queryClient.invalidateQueries({ queryKey: adsKeyFactory.byId(id) });

      navigate(`/ads/${id}`);
    } catch (error) {
      if (isAbortError(error)) return;
      setSubmitError(extractErrorMessage(error));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Stack spacing={2}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} justifyContent="space-between">
        <Typography variant="h5">Редактирование объявления</Typography>

        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            startIcon={<UndoRoundedIcon />}
            onClick={() => navigate(`/ads/${id}`)}
            disabled={isSaving}
          >
            Отменить
          </Button>

          <Button
            variant="contained"
            startIcon={<SaveRoundedIcon />}
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </Stack>
      </Stack>

      {draftRestored ? <Alert severity="info">Черновик восстановлен из localStorage.</Alert> : null}

      {missingFields.length ? <MissingFieldsAlert fields={missingFields} /> : null}

      {submitError ? <Alert severity="error">{submitError}</Alert> : null}

      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: 'minmax(0, 1fr) 360px' },
        }}
      >
        <Card>
          <CardContent>
            <Stack spacing={2}>
              <TextField
                select
                label="Категория"
                value={form.category}
                onChange={event => {
                  const nextCategory = event.target.value as ItemCategory;
                  setField('category', nextCategory);
                  setField('params', {});
                }}
                error={Boolean(validationErrors.category)}
                helperText={validationErrors.category}
                fullWidth
              >
                {CATEGORY_OPTIONS.map(option => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                label="Название"
                value={form.title}
                onChange={event => setField('title', event.target.value)}
                error={Boolean(validationErrors.title)}
                helperText={validationErrors.title}
                fullWidth
              />

              <TextField
                label="Цена"
                type="number"
                value={form.price}
                onChange={event => setField('price', event.target.value)}
                error={Boolean(validationErrors.price)}
                helperText={validationErrors.price}
                fullWidth
              />

              <Typography variant="h6">Характеристики</Typography>

              <CategoryParamsFields category={form.category} params={form.params} onChange={setParamField} />

              <TextField
                label="Описание"
                multiline
                minRows={6}
                value={form.description}
                onChange={event => setField('description', event.target.value)}
                error={Boolean(validationErrors.description)}
                helperText={validationErrors.description ?? `${form.description.length}/3000 символов`}
                fullWidth
              />
            </Stack>
          </CardContent>
        </Card>

        <AiAssistantPanel
          hasDescription={Boolean(form.description.trim())}
          generatedDescription={generatedDescription}
          suggestedPrice={suggestedPrice}
          isGeneratingDescription={isGeneratingDescription}
          isGeneratingPrice={isGeneratingPrice}
          aiError={aiError}
          onGenerateDescription={handleGenerateDescription}
          onApplyDescription={() => {
            setField('description', generatedDescription);
            setGeneratedDescription('');
          }}
          onGeneratePrice={handleGeneratePrice}
          onApplyPrice={() => {
            if (suggestedPrice == null) return;
            setField('price', String(suggestedPrice));
          }}
        />
      </Box>
    </Stack>
  );
};
