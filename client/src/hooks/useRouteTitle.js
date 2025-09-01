import { useEffect } from 'react';

const SITE_NAME = 'Cinephoria';

// Simple hook for components that want to set custom titles
export const useTitle = (title) => {
  useEffect(() => {
    if (title) {
      document.title = `${SITE_NAME} - ${title}`;
    } else {
      document.title = SITE_NAME;
    }
  }, [title]);
};