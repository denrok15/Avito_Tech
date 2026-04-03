import { Box, Container } from "@mui/material";
import { Outlet } from "react-router-dom";

export const AppLayout = () => (
  <Box sx={{ minHeight: "100vh", pb: 10 }}>
    <Container
      maxWidth={false}
      disableGutters
      sx={{
        mt: 3,
        width: "100%",
        maxWidth: "none",
        px: { xs: 2, sm: 3, lg: 4 },
      }}
    >
      <Outlet />
    </Container>
  </Box>
);
