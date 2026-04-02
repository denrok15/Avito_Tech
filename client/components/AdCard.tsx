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

  return (
    <Card
      sx={{
        borderRadius: '16px',
        border: '1px solid #f0f0f0',
        bgcolor: '#ffffff',
        boxShadow: 'none',
        width: isList ? '100%' : { xs: '100%', lg: 200 },
        height: isList ? 'auto' : { lg: 268 },
      }}
    >
      <CardActionArea
        onClick={onClick}
        sx={
          isList
            ? {
                display: { xs: 'block', sm: 'flex' },
                alignItems: 'stretch',
                height: '100%',
              }
            : { height: '100%' }
        }
      >
        <Box sx={{ position: 'relative', width: '100%' }}>
          <Box
            sx={{
              position: 'relative',
              height: 150,
              width: isList ? { xs: '100%', sm: 200 } : { xs: '100%', lg: 200 },
            }}
          >
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                borderBottomRightRadius: '8px',
                borderBottomLeftRadius: '8px',
                bgcolor: '#fafafa',
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
              width: '100%',
              ...(isList
                ? {
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    gap: 0.5,
                  }
                : {
                    width: { lg: 200 },
                    height: { lg: 118 },
                  }),
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
                border: '1px solid #d9d9d9',
                bgcolor: '#ffffff',
                fontFamily: '"Roboto", "Arial", sans-serif',
                fontSize: 14,
                fontWeight: 400,
                lineHeight: '22px',
                color: 'rgba(0, 0, 0, 0.85)',
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
                color: 'rgba(0, 0, 0, 0.85)',
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
                color: 'rgba(0, 0, 0, 0.45)',
              }}
            >
              {formatCurrency(item.price)}
            </Box>

            {item.needsRevision ? (
              <Box
                sx={{
                  mt: 0.5,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 1,
                  width: 155,
                  height: 26,
                  px: 1,
                  py: '2px',
                  borderRadius: '8px',
                  bgcolor: '#fff7e6',
                  fontFamily: '"Roboto", "Arial", sans-serif',
                  fontSize: 14,
                  fontWeight: 400,
                  lineHeight: '22px',
                  color: '#faad14',
                }}
              >
                <Box sx={{ width: 6, height: 6, borderRadius: 999, bgcolor: '#faad14' }} />
                Требует доработок
              </Box>
            ) : null}
          </CardContent>
        </Box>
      </CardActionArea>
    </Card>
  );
};
