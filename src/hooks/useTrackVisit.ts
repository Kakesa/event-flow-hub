import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { analyticsApi } from '@/services/api';

const VISITOR_ID_KEY = 'hk_visitor_id';

function getOrCreateVisitorId(): string {
  let visitorId = localStorage.getItem(VISITOR_ID_KEY);
  if (!visitorId) {
    visitorId = crypto.randomUUID();
    localStorage.setItem(VISITOR_ID_KEY, visitorId);
  }
  return visitorId;
}

export function trackPageVisit(path?: string) {
  const visitorId = getOrCreateVisitorId();
  analyticsApi
    .trackVisit({
      visitorId,
      path: path ?? window.location.pathname,
      referrer: document.referrer,
    })
    .catch(() => {});
}

export function useTrackVisit() {
  const location = useLocation();

  useEffect(() => {
    trackPageVisit(location.pathname);
  }, [location.pathname]);
}

export default function VisitTracker() {
  useTrackVisit();
  return null;
}
