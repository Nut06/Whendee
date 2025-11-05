// Simple debug logger controlled by EXPO_PUBLIC_DEBUG_AUTH
// Enable by setting EXPO_PUBLIC_DEBUG_AUTH=1

export const isDebugAuth = () => process.env.EXPO_PUBLIC_DEBUG_AUTH === '1';

export const debugAuth = (...args: any[]) => {
  if (isDebugAuth()) {
    console.log('[AUTH]', ...args);
  }
};

export const timeSince = (start: number) => `${Date.now() - start}ms`;
