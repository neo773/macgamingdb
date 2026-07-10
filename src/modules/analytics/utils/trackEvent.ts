type UmamiEventData = Record<string, string | number | boolean>;

type UmamiGlobal = {
  track: (event: string, data?: UmamiEventData) => void;
};

declare global {
  interface Window {
    umami?: UmamiGlobal;
  }
}

type AnalyticsEvent =
  | { name: 'signup-requested' }
  | { name: 'search-performed' }
  | { name: 'review-submitted'; data: { gameId: string } }
  | { name: 'ggdeals-click'; data: { gameId: string } }
  | { name: 'steam-library-link-click' };

export function trackEvent(event: AnalyticsEvent) {
  if (typeof window === 'undefined') return;
  if (!window.umami) return;
  window.umami.track(event.name, 'data' in event ? event.data : undefined);
}
