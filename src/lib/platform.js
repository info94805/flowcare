/**
 * Platform detection for web environment.
 * RevenueCat native IAP is handled inside the iOS/Android app shell directly.
 */
export const getPlatform = () => {
  const ua = navigator.userAgent || '';
  if (/iPhone|iPad|iPod/.test(ua)) return 'ios';
  if (/Android/.test(ua)) return 'android';
  return 'web';
};

export const isNative = () => false; // Always false in web build

export const isWeb = () => true;