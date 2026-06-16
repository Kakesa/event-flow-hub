import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { getSEOForPath } from '@/content/seo.fr';
import { usePageSEO } from '@/hooks/usePageSEO';

/** Met à jour title, meta et JSON-LD selon la route courante */
const RouteSEO = () => {
  const { pathname } = useLocation();
  const seo = useMemo(() => getSEOForPath(pathname), [pathname]);
  usePageSEO(seo);
  return null;
};

export default RouteSEO;
