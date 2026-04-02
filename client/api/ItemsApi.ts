import { queryOptions } from '@tanstack/react-query';
import { http } from '@/api/Http';
import type { Item, ItemsGetOut, ItemsQuery, ItemUpdateIn, ListItem } from '@/shared/types';

const PAGE_LIMIT_DEFAULT = 10;

const toRequestParams = (query: ItemsQuery) => ({
  q: query.q?.trim() || undefined,
  limit: query.limit ?? PAGE_LIMIT_DEFAULT,
  skip: query.skip ?? 0,
  categories: query.categories?.length ? query.categories.join(',') : undefined,
  needsRevision: query.needsRevision ? true : undefined,
  sortColumn: query.sortColumn,
  sortDirection: query.sortDirection,
});

const normalizeListItems = (items: ListItem[], skip = 0): ListItem[] =>
  items.map((item, index) => ({
    ...item,
    id: item.id ?? skip + index + 1,
  }));

export const adsKeyFactory = {
  all: () => ['ads'] as const,
  list: (query: ItemsQuery) => ['ads', 'list', query] as const,
  byId: (id: number) => ['ads', 'detail', id] as const,
};

export const loadAdsQuery = (query: ItemsQuery) =>
  queryOptions({
    queryKey: adsKeyFactory.list(query),
    queryFn: async ({ signal }) => {
      const response = await http.get<ItemsGetOut>('/items', {
        params: toRequestParams(query),
        signal,
      });

      return {
        ...response.data,
        items: normalizeListItems(response.data.items, query.skip),
      } satisfies ItemsGetOut;
    },
  });

export const loadAdByIdQuery = (id: number) =>
  queryOptions({
    queryKey: adsKeyFactory.byId(id),
    queryFn: async ({ signal }) => {
      const response = await http.get<Item>(`/items/${id}`, { signal });
      return response.data;
    },
    enabled: Number.isFinite(id),
  });

export const updateAdRequest = async (
  id: number,
  payload: ItemUpdateIn,
  signal?: AbortSignal,
) => {
  await http.put(`/items/${id}`, payload, { signal });
};
