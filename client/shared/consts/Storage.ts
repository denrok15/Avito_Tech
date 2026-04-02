export const STORAGE_KEYS = {
  themeMode: 'avito.theme.mode',
  adDraft: (id: number) => `avito.ad.${id}.draft`,
} as const;
