import {
  Box,
  Button,
  Card,
  CardContent,
  Checkbox,
  Divider,
  FormControlLabel,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { CATEGORY_OPTIONS } from "@/shared/consts";
import type { ItemCategory } from "@/shared/types";

type AdsFiltersProps = {
  categories: ItemCategory[];
  onlyNeedsRevision: boolean;
  onToggleCategory: (category: ItemCategory) => void;
  onToggleNeedsRevision: (value: boolean) => void;
  onReset: () => void;
};

export const AdsFilters = ({
  categories,
  onlyNeedsRevision,
  onToggleCategory,
  onToggleNeedsRevision,
  onReset,
}: AdsFiltersProps) => {
  return (
    <Box sx={{ width: { xs: "100%", lg: 256 }, maxWidth: "100%" }}>
      <Card
        sx={{
          width: "100%",
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          boxShadow: "none",
        }}
      >
        <CardContent sx={{ p: 2, fontFamily: '"Roboto", "Arial", sans-serif' }}>
          <Stack spacing={1.5}>
            <Typography
              sx={{ fontSize: 16, fontWeight: 500, color: "text.primary" }}
            >
              Фильтры
            </Typography>

            <Typography
              sx={{ fontSize: 14, fontWeight: 400, color: "text.primary" }}
            >
              Категория
            </Typography>

            <Stack spacing={1}>
              {CATEGORY_OPTIONS.map((option) => (
                <FormControlLabel
                  key={option.value}
                  control={
                    <Checkbox
                      size="small"
                      sx={{ p: 0, mr: 1 }}
                      checked={categories.includes(option.value)}
                      onChange={() => onToggleCategory(option.value)}
                    />
                  }
                  label={option.label}
                  sx={{
                    m: 0,
                    alignItems: "center",
                    minHeight: 28,
                    "& .MuiFormControlLabel-label": {
                      fontSize: 15,
                      lineHeight: "22px",
                      color: "text.primary",
                    },
                  }}
                />
              ))}
            </Stack>

            <Divider sx={{ my: 1 }} />

            <FormControlLabel
              control={
                <Switch
                  checked={onlyNeedsRevision}
                  onChange={(event) =>
                    onToggleNeedsRevision(event.target.checked)
                  }
                />
              }
              label={"Только требующие\nдоработок"}
              labelPlacement="start"
              sx={{
                m: 0,
                width: "100%",
                justifyContent: "space-between",
                "& .MuiFormControlLabel-label": {
                  whiteSpace: "pre-line",
                  fontSize: 14,
                  fontFamily: "Inter",
                  fontWeight: 600,
                  lineHeight: "140%",
                  color: "text.primary",
                },
              }}
            />
          </Stack>
        </CardContent>
      </Card>
      <Button
        variant="outlined"
        onClick={onReset}
        sx={{
          mt: 1,
          height: 40,
          width: "100%",
          backgroundColor: "background.paper",
          borderRadius: 1,
          borderColor: "divider",
          fontSize: 14,
          fontFamily: "Inter",
          fontWeight: 400,
          color: "text.secondary",
          textTransform: "none",
        }}
      >
        Сбросить фильтры
      </Button>
    </Box>
  );
};
