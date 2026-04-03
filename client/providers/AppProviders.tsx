import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { useMemo } from 'react';
import type { PropsWithChildren } from 'react';
import { useThemeStore } from '@/store';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
    },
  },
});

export const AppProviders = ({ children }: PropsWithChildren) => {
  const mode = useThemeStore(state => state.mode);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1d4ed8',
          },
          background: {
            default: mode === 'dark' ? '#0f172a' : '#F7F5F8',
            paper: mode === 'dark' ? '#111827' : '#ffffff',
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: '"Roboto", "Arial", sans-serif',
        },
      }),
    [mode],
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </QueryClientProvider>
  );
};
