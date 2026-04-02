import { Alert, List, ListItem, ListItemText } from '@mui/material';

type MissingFieldsAlertProps = {
  fields: string[];
};

export const MissingFieldsAlert = ({ fields }: MissingFieldsAlertProps) => {
  if (!fields.length) return null;

  return (
    <Alert severity="warning">
      Объявление требует доработки. Заполните поля:
      <List dense>
        {fields.map(field => (
          <ListItem key={field} disableGutters>
            <ListItemText primary={`• ${field}`} />
          </ListItem>
        ))}
      </List>
    </Alert>
  );
};
