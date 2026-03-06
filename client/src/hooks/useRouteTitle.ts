import { useEffect } from 'react';

const SITE_NAME = 'Cinephoria';

export const useTitle = (title: string): void => {
  useEffect(() => {
    if (title) {
      document.title = `${SITE_NAME} - ${title}`;
    } else {
      document.title = SITE_NAME;
    }
  }, [title]);
};