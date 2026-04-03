import { useCallback, useEffect, useRef } from 'react';

export const useAbortController = () => {
  const controllerRef = useRef<AbortController | null>(null);

  const nextController = useCallback(() => {
    controllerRef.current?.abort();
    controllerRef.current = new AbortController();

    return controllerRef.current;
  }, []);

  const abort = useCallback(() => {
    controllerRef.current?.abort();
  }, []);

  useEffect(() => abort, [abort]);

  return { nextController, abort };
};

