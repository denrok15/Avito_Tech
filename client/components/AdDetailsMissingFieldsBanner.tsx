import { Box, Icon, Stack, Typography } from "@mui/material";
import { AlertIcon } from "@/icons";
type AdDetailsMissingFieldsBannerProps = {
  fields: string[];
};

export const AdDetailsMissingFieldsBanner = ({
  fields,
}: AdDetailsMissingFieldsBannerProps) => {
  if (!fields.length) return null;

  return (
    <Box
      sx={{
        width: 512,
        maxWidth: "100%",
        minHeight: 118,
        px: 2,
        py: 1.5,
        borderRadius: "8px",
        bgcolor: "#F9F1E6",
      }}
    >
      <Stack spacing={1}>
        <Typography
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            fontFamily: '"Roboto", "Arial", sans-serif',
            fontWeight: 600,
            fontSize: 16,
            lineHeight: "24px",
            color: "#1E1E1E",
          }}
        >
          <AlertIcon />
          Требуются доработки
        </Typography>

        <Typography
          sx={{
            fontFamily: '"Roboto", "Arial", sans-serif',
            fontWeight: 400,
            fontSize: 14,
            paddingLeft: "32px",
            lineHeight: "24px",
            color: "#000000D9",
          }}
        >
          У объявления не заполнены поля:
        </Typography>
        <Stack component="ul" sx={{ m: 0, pl: 2.5, gap: 0.25 }}>
          {fields.map((field) => (
            <Typography
              key={field}
              component="li"
              sx={{
                fontFamily: '"Roboto", "Arial", sans-serif',
                fontWeight: 400,
                fontSize: 14,
                marginLeft: "32px",
                lineHeight: "22px",
                color: "rgba(0, 0, 0, 0.85)",
              }}
            >
              {field}
            </Typography>
          ))}
        </Stack>
      </Stack>
    </Box>
  );
};
