import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import SellRoundedIcon from '@mui/icons-material/SellRounded';
import {
  Alert,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

type AiAssistantPanelProps = {
  hasDescription: boolean;
  generatedDescription: string;
  suggestedPrice: number | null;
  isGeneratingDescription: boolean;
  isGeneratingPrice: boolean;
  aiError: string | null;
  onGenerateDescription: () => void;
  onApplyDescription: () => void;
  onGeneratePrice: () => void;
  onApplyPrice: () => void;
};

export const AiAssistantPanel = ({
  hasDescription,
  generatedDescription,
  suggestedPrice,
  isGeneratingDescription,
  isGeneratingPrice,
  aiError,
  onGenerateDescription,
  onApplyDescription,
  onGeneratePrice,
  onApplyPrice,
}: AiAssistantPanelProps) => {
  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Typography variant="h6" sx={{ color: 'text.primary' }}>
            AI-ассистент
          </Typography>

          <Button
            variant="contained"
            startIcon={
              isGeneratingDescription ? <CircularProgress color="inherit" size={16} /> : <AutoAwesomeRoundedIcon />
            }
            onClick={onGenerateDescription}
            disabled={isGeneratingDescription}
          >
            {hasDescription ? 'Улучшить описание' : 'Придумать описание'}
          </Button>

          {generatedDescription ? (
            <Stack spacing={1}>
              <TextField
                multiline
                minRows={5}
                value={generatedDescription}
                label="Предложение от AI"
                InputProps={{ readOnly: true }}
              />
              <Button variant="outlined" onClick={onApplyDescription}>
                Применить описание
              </Button>
            </Stack>
          ) : null}

          <Button
            variant="contained"
            color="secondary"
            startIcon={isGeneratingPrice ? <CircularProgress color="inherit" size={16} /> : <SellRoundedIcon />}
            onClick={onGeneratePrice}
            disabled={isGeneratingPrice}
          >
            Узнать рыночную цену
          </Button>

          {suggestedPrice ? (
            <Stack spacing={1}>
              <Alert severity="info">Рекомендованная цена: {suggestedPrice.toLocaleString('ru-RU')} ₽</Alert>
              <Button variant="outlined" onClick={onApplyPrice}>
                Применить цену
              </Button>
            </Stack>
          ) : null}

          {aiError ? <Alert severity="error">{aiError}</Alert> : null}
        </Stack>
      </CardContent>
    </Card>
  );
};
