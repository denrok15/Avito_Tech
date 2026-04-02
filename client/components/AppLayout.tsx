import { Box, Container } from '@mui/material';
import { Outlet } from 'react-router-dom';

export const AppLayout = () => (
  <Box sx={{ minHeight: '100vh', pb: 10 }}>
    <Container
      maxWidth={false}
      sx={{
        mt: 6,
        width: '100%',
        maxWidth: 1240,
        px: { xs: 2, sm: 3 },
      }}
    >
      <Outlet />
    </Container>
  </Box>
);
