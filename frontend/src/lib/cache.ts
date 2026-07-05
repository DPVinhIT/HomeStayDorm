export const apiCache = new Map<string, { data: any; timestamp: number }>();

// Mặc định cache trong 5 phút
export const CACHE_TTL = 5 * 60 * 1000;

export const clearApiCache = () => {
  apiCache.clear();
};
