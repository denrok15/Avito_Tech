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
            main: '#1890FF',
          },
          background: {
            default: mode === 'dark' ? '#0B1220' : '#F7F5F8',
            paper: mode === 'dark' ? '#111827' : '#ffffff',
          },
          text: {
            primary: mode === 'dark' ? '#E5E7EB' : '#000000D9',
            secondary: mode === 'dark' ? '#94A3B8' : '#6B7280',
          },
          divider: mode === 'dark' ? '#1F2937' : '#E5E7EB',
          success: {
            main: mode === 'dark' ? '#22C55E' : '#52C41A',
          },
          warning: {
            main: mode === 'dark' ? '#F59E0B' : '#FAAD14',
          },
          error: {
            main: mode === 'dark' ? '#F87171' : '#FF4D4F',
          },
          info: {
            main: mode === 'dark' ? '#60A5FA' : '#1890FF',
          },
          action: {
            hover: mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)',
            selected: mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)',
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: '"Roboto", "Arial", sans-serif',
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                backgroundColor: mode === 'dark' ? '#0B1220' : '#F7F5F8',
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                backgroundImage: 'none',
              },
            },
          },
          MuiOutlinedInput: {
            styleOverrides: {
              root: {
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? '#334155' : '#D9D9D9',
                },
                '&:hover .MuiOutlinedInput-notchedOutline': {
                  borderColor: mode === 'dark' ? '#475569' : '#D9D9D9',
                },
              },
              notchedOutline: {
                borderColor: mode === 'dark' ? '#334155' : '#D9D9D9',
              },
            },
          },
          MuiInputBase: {
            styleOverrides: {
              input: {
                color: mode === 'dark' ? '#E5E7EB' : 'inherit',
                '::placeholder': {
                  color: mode === 'dark' ? '#94A3B8' : '#9CA3AF',
                  opacity: 1,
                },
              },
            },
          },
          MuiDivider: {
            styleOverrides: {
              root: {
                borderColor: mode === 'dark' ? '#1F2937' : '#E5E7EB',
              },
            },
          },
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
