import { analyticsApi } from "../api/endpoints";

const SESSION_KEY = "raaya_session_id";

export const getSessionId = () => {
  let sessionId = localStorage.getItem(SESSION_KEY);
  if (!sessionId) {
    sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    localStorage.setItem(SESSION_KEY, sessionId);
  }
  return sessionId;
};

export const initGoogleAnalytics = () => {
  const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
  if (!measurementId || window.gtag) return;

  const script = document.createElement("script");
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;
  gtag("js", new Date());
  gtag("config", measurementId);
};

export const trackEvent = async ({ eventType, path = "", productId, orderId, metadata = {} }) => {
  const sessionId = getSessionId();
  if (window.gtag) {
    window.gtag("event", eventType, {
      page_path: path,
      product_id: productId,
      order_id: orderId,
      ...metadata,
    });
  }

  try {
    await analyticsApi.track({
      session_id: sessionId,
      event_type: eventType,
      path,
      product_id: productId,
      order_id: orderId,
      metadata,
    });
  } catch {
    return null;
  }
  return true;
};
