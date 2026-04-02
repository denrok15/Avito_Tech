import axios from 'axios';

export const isAbortError = (error: unknown): boolean => {
  if (error instanceof DOMException && error.name === 'AbortError') return true;
  if (axios.isAxiosError(error) && error.code === 'ERR_CANCELED') return true;

  return false;
};

export const extractErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const apiMessage = error.response?.data?.error;

    if (typeof apiMessage === 'string') return apiMessage;

    return error.message;
  }

  if (error instanceof Error) return error.message;

  return 'Произошла ошибка. Попробуйте снова.';
};
