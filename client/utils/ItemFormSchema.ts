import * as yup from 'yup';

export const itemFormSchema = yup.object({
  category: yup
    .mixed<'auto' | 'real_estate' | 'electronics'>()
    .oneOf(['auto', 'real_estate', 'electronics'])
    .required('Категория обязательна'),
  title: yup
    .string()
    .trim()
    .required('Название обязательно')
    .max(160, 'Название должно быть не длиннее 160 символов'),
  price: yup
    .number()
    .typeError('Цена должна быть числом')
    .required('Цена обязательна')
    .min(0, 'Цена не может быть отрицательной'),
  description: yup
    .string()
    .max(3000, 'Описание не должно превышать 3000 символов')
    .optional(),
});
