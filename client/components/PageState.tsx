import { Alert, Box, Button, CircularProgress } from '@mui/material';
import { extractErrorMessage } from '@/utils/Error';

type PageStateProps = {
  isLoading?: boolean;
  error?: unknown;
  onRetry?: () => void;
};

export const PageState = ({ isLoading, error, onRetry }: PageStateProps) => {
  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          minHeight: 240,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        sx={{
          mx: 'auto',
          mt: 6,
          maxWidth: 600,
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        <Alert severity="error">{extractErrorMessage(error)}</Alert>
        {onRetry ? (
          <Button variant="outlined" onClick={onRetry}>
            Повторить
          </Button>
        ) : null}
      </Box>
    );
  }

  return null;
};
