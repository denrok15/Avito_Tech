import axios from 'axios';
import type { ItemUpdateIn } from '@/shared/types';

type OllamaResponse = {
  response?: string;
};

type AiContext = Pick<
  ItemUpdateIn,
  'category' | 'title' | 'description' | 'price' | 'params'
>;

const OLLAMA_URL =
  import.meta.env.VITE_OLLAMA_URL ?? 'http://localhost:11434/api/generate';
const OLLAMA_MODEL = import.meta.env.VITE_OLLAMA_MODEL ?? 'llama3';

const requestOllama = async (prompt: string, signal?: AbortSignal) => {
  const { data } = await axios.post<OllamaResponse>(
    OLLAMA_URL,
    {
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
    },
    { signal, timeout: 45_000 },
  );

  if (!data.response?.trim()) {
    throw new Error('LLM вернула пустой ответ');
  }

  return data.response.trim();
};

const compactAdContext = (ctx: AiContext): string =>
  JSON.stringify(
    {
      category: ctx.category,
      title: ctx.title,
      description: ctx.description ?? '',
      price: ctx.price,
      params: ctx.params,
    },
    null,
    2,
  );

const parsePrice = (raw: string): number | null => {
  const jsonMatch = raw.match(/\{[\s\S]*\}/);

  if (jsonMatch) {
    try {
      const parsed = JSON.parse(jsonMatch[0]) as { price?: unknown };
      const candidate = Number(parsed.price);
      if (Number.isFinite(candidate) && candidate > 0) return Math.round(candidate);
    } catch {
      // do nothing
    }
  }

  const numberMatch = raw.replace(/\u00A0/g, ' ').match(/\d[\d\s]*/);
  if (!numberMatch) return null;

  const candidate = Number(numberMatch[0].replace(/\s+/g, ''));
  if (!Number.isFinite(candidate) || candidate <= 0) return null;

  return Math.round(candidate);
};

export const generateDescriptionSuggestion = (
  context: AiContext,
  signal?: AbortSignal,
) => {
  const prompt = [
    'Ты помощник для продавца Avito.',
    'Сгенерируй продающее описание на русском языке.',
    'Ограничение: 500-900 символов, без markdown, без приветствий.',
    'Структура: преимущества, состояние, почему выгодно купить.',
    'Данные объявления:',
    compactAdContext(context),
  ].join('\n');

  return requestOllama(prompt, signal);
};

export const generateMarketPriceSuggestion = async (
  context: AiContext,
  signal?: AbortSignal,
) => {
  const prompt = [
    'Ты оцениваешь рыночную цену объявления в рублях.',
    'Ответь в JSON формате: {"price": number, "reason": "краткая причина"}.',
    'Без markdown и лишнего текста.',
    'Данные объявления:',
    compactAdContext(context),
  ].join('\n');

  const response = await requestOllama(prompt, signal);
  const price = parsePrice(response);

  if (price == null) {
    throw new Error('Не удалось извлечь цену из ответа модели');
  }

  return { price, raw: response };
};
