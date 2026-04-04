import {
  Box,
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
} from '@mui/material';
import { CATEGORY_LABELS, PLACEHOLDER_IMAGE } from '@/shared/consts';
import type { ListItem } from '@/shared/types';
import { formatCurrency } from '@/utils';

type AdCardProps = {
  item: ListItem;
  layout: 'grid' | 'list';
  onClick: () => void;
};

export const AdCard = ({ item, layout, onClick }: AdCardProps) => {
  const isList = layout === 'list';

  if (isList) {
    return (
      <Card
        sx={{
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
          boxShadow: 'none',
          width: '100%',
          overflow: 'hidden',
        }}
      >
        <CardActionArea
          onClick={onClick}
          sx={{
            display: 'flex',
            alignItems: 'stretch',
            gap: 0,
            p: 0,
          }}
        >
          <Box
            sx={{
              width: 179,
              height: 132,
              flexShrink: 0,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? '#0F172A' : '#fafafa',
              overflow: 'hidden',
            }}
          >
            <CardMedia
              component="img"
              image={PLACEHOLDER_IMAGE}
              alt={item.title}
              sx={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </Box>

          <CardContent
            sx={{
              p: 2,
              '&:last-child': { pb: 2 },
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              minHeight: 132,
              fontFamily: '"Roboto", "Arial", sans-serif',
              flex: 1,
            }}
          >
            <Box
              sx={{
                fontSize: 14,
                fontWeight: 400,
                lineHeight: '22px',
                color: 'text.secondary',
              }}
            >
              {CATEGORY_LABELS[item.category]}
            </Box>

            <Box
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: 16,
                fontWeight: 400,
                lineHeight: '24px',
                color: 'text.primary',
              }}
            >
              {item.title}
            </Box>

            <Box
              sx={{
                fontFamily: '"Inter", sans-serif',
                fontSize: 16,
                fontWeight: 600,
                lineHeight: '140%',
                color: 'text.secondary',
              }}
            >
              {formatCurrency(item.price)}
            </Box>

            {item.needsRevision ? (
              <Box
                sx={{
                  mt: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  width: 'fit-content',
                  maxWidth: '100%',
                  height: 26,
                  px: 1,
                  py: '2px',
                  borderRadius: '8px',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? '#2A1B07' : '#fff7e6',
                  fontFamily: '"Roboto", "Arial", sans-serif',
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: '22px',
                  color: 'warning.main',
                  whiteSpace: 'nowrap',
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: 999, bgcolor: 'warning.main' }} />
                Требует доработок
              </Box>
            ) : null}
          </CardContent>
        </CardActionArea>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        boxShadow: 'none',
        width: { xs: '100%', lg: 200, xl: 220 },
        height: 'auto',
      }}
    >
      <CardActionArea onClick={onClick} sx={{ height: '100%' }}>
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Box
            sx={{
              position: 'relative',
              height: 150,
              width: { xs: '100%', lg: 200, xl: 220 },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderBottomRightRadius: '8px',
                borderBottomLeftRadius: '8px',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? '#0F172A' : '#fafafa',
              }}
            />
            <CardMedia
              component="img"
              image={PLACEHOLDER_IMAGE}
              alt={item.title}
              sx={{
                position: 'relative',
                zIndex: 10,
                height: '100%',
                width: '100%',
                objectFit: 'contain',
                px: 4.5,
                py: 4,
              }}
            />
          </Box>

          <CardContent
            sx={{
              pt: '22px',
              px: 2,
              pb: 2,
              minHeight: 118,
              fontFamily: '"Roboto", "Arial", sans-serif',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
              gap: 0.5,
              width: { xs: '100%', lg: 200, xl: 220 },
            }}
          >
            <Box
              sx={{
                pointerEvents: 'none',
                position: 'absolute',
                left: 16,
                top: 139,
                zIndex: 20,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 111,
                height: 22,
                px: 1.5,
                borderRadius: '6px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                fontFamily: '"Roboto", "Arial", sans-serif',
                fontSize: 14,
                fontWeight: 400,
                lineHeight: '22px',
                color: 'text.primary',
              }}
            >
              {CATEGORY_LABELS[item.category]}
            </Box>

            <Box
              sx={{
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                fontSize: 16,
                fontWeight: 400,
                lineHeight: '24px',
                color: 'text.primary',
                minHeight: 48,
              }}
            >
              {item.title}
            </Box>

            <Box
              sx={{
                mt: 0.5,
                fontFamily: '"Inter", sans-serif',
                fontSize: 16,
                fontWeight: 600,
                lineHeight: '140%',
                color: 'text.secondary',
              }}
            >
              {formatCurrency(item.price)}
            </Box>

            {item.needsRevision ? (
              <Box
                sx={{
                  mt: 1,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  width: 'fit-content',
                  maxWidth: '100%',
                  height: 26,
                  px: 1,
                  py: '2px',
                  borderRadius: '8px',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? '#2A1B07' : '#fff7e6',
                  fontFamily: '"Roboto", "Arial", sans-serif',
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: '22px',
                  color: 'warning.main',
                  whiteSpace: 'nowrap',
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: 999, bgcolor: 'warning.main' }} />
                Требует доработок
              </Box>
            ) : null}
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
};
