import { useEffect, type ReactNode } from 'react';

const SITE_NAME = 'Cinephoria';

interface TitleWrapperProps {
  title?: string;
  children: ReactNode;
}

const TitleWrapper = ({ title, children }: TitleWrapperProps) => {
  useEffect(() => {
    // Set the document title
    if (title) {
      document.title = `${SITE_NAME} - ${title}`;
    } else {
      document.title = SITE_NAME;
    }
  }, [title]);

  return children;
};

export default TitleWrapper;