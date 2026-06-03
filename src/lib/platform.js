/**
 * Platform & runtime detection.
 *
 * This is a web build that also runs inside a React Native WebView shell (the
 * native iOS/Android app). The shell injects `window.ReactNativeWebView`, which
 * is the ONLY reliable signal that we are running inside the native app.
 *
 * NOTE: the user-agent alone (Android/iPhone) matches mobile *browsers* too, so
 * it must NOT be used to decide whether in-app purchases are available — doing
 * so shows the Google Play / App Store IAP flow to mobile-web users who can
 * never complete it.
 */
export const getPlatform = () => {
  const ua = (typeof navigator !== 'undefined' && navigator.userAgent) || '';
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'web';
};

export const isNative = () =>
  typeof window !== 'undefined' && !!window.ReactNativeWebView;

export const isWeb = () => !isNative();

/** Returns 'ios' | 'android' only when running inside the native app, else null. */
export const getNativePlatform = () => {
  if (!isNative()) return null;
  const p = getPlatform();
  return p === 'web' ? null : p;
};