import posthog from 'posthog-js';

export const dispatchPosthogEvent = (eventName, data) => {
  if (process.env.NODE_ENV !== 'development') {
    posthog.init(process.env.REACT_APP_POSTHOG_API_KEY, { api_host: process.env.REACT_APP_POSTHOG_URL });
    if (data?.email) {
      posthog.identify(data.email);
    }
    posthog.capture(eventName, data);
  }
};