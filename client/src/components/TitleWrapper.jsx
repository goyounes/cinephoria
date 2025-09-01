import { useEffect } from 'react';

const SITE_NAME = 'Cinephoria';

const TitleWrapper = ({ title, children }) => {
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