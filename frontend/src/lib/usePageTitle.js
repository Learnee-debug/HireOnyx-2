import { useEffect } from 'react';

export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} — HireOnyx` : 'HireOnyx — Find Your Match';
    return () => { document.title = 'HireOnyx — Find Your Match'; };
  }, [title]);
}
