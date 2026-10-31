/**
 * In-memory cache with TTL and stale-while-revalidate metadata
 */
class MemoryCache {
  constructor() {
    this.cache = new Map();
  }

  set(key, value, ttlSeconds = 1800) {
    const expiresAt = Date.now() + ttlSeconds * 1000;
    this.cache.set(key, {
      value,
      expiresAt,
      cachedAt: Date.now()
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isStale = Date.now() > entry.expiresAt;
    return {
      data: entry.value,
      isStale,
      cachedAt: new Date(entry.cachedAt).toISOString()
    };
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }
}

export const memoryCache = new MemoryCache();
