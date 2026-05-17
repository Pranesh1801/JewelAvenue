/**
 * Cache layer — uses Redis when REDIS_URL is set, otherwise falls back
 * to a simple in-memory Map (good enough for single-instance dev).
 */

import Redis from "ioredis";

// ── Redis client (lazy-init) ────────────────────────────────────────────────

let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;
  const url = process.env.REDIS_URL;
  if (!url) return null;

  try {
    redis = new Redis(url, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 3) return null; // stop retrying
        return Math.min(times * 200, 2000);
      },
    });
    redis.on("error", (err) => {
      console.error("[Cache] Redis error:", err.message);
    });
    return redis;
  } catch {
    console.warn("[Cache] Redis unavailable, using in-memory fallback");
    return null;
  }
}

// ── In-memory fallback ──────────────────────────────────────────────────────

const memoryCache = new Map<string, { value: string; expiresAt: number }>();

// ── Public API ──────────────────────────────────────────────────────────────

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const r = getRedis();
    if (r) {
      try {
        const val = await r.get(key);
        return val ? (JSON.parse(val) as T) : null;
      } catch {
        return null;
      }
    }

    // In-memory fallback
    const entry = memoryCache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      memoryCache.delete(key);
      return null;
    }
    return JSON.parse(entry.value) as T;
  },

  async set(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
    const serialized = JSON.stringify(value);
    const r = getRedis();
    if (r) {
      try {
        await r.setex(key, ttlSeconds, serialized);
        return;
      } catch {
        // fallthrough to memory
      }
    }

    memoryCache.set(key, {
      value: serialized,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  },

  async invalidate(pattern: string): Promise<void> {
    const r = getRedis();
    if (r) {
      try {
        const keys = await r.keys(pattern);
        if (keys.length > 0) await r.del(...keys);
        return;
      } catch {
        // fallthrough
      }
    }

    // In-memory: match by prefix (simple glob)
    const prefix = pattern.replace(/\*/g, "");
    for (const key of memoryCache.keys()) {
      if (key.startsWith(prefix)) memoryCache.delete(key);
    }
  },

  async del(key: string): Promise<void> {
    const r = getRedis();
    if (r) {
      try {
        await r.del(key);
        return;
      } catch {
        // fallthrough
      }
    }
    memoryCache.delete(key);
  },
};

// ── Cache key helpers ───────────────────────────────────────────────────────

export const CacheKeys = {
  products: (params: string) => `products:${params}`,
  product: (id: string) => `product:${id}`,
  categories: () => "categories:all",
  bestsellers: () => "products:bestsellers",
  userCart: (userId: string) => `cart:${userId}`,
  reportRevenue: (period: string) => `report:revenue:${period}`,
  reportProducts: () => "report:products",
};

// ── TTL constants (seconds) ─────────────────────────────────────────────────

export const CacheTTL = {
  PRODUCTS_LIST: 300,     // 5 min
  PRODUCT_DETAIL: 600,    // 10 min
  CATEGORIES: 3600,       // 1 hour
  BESTSELLERS: 300,       // 5 min
  CART: 120,              // 2 min
  REPORTS: 900,           // 15 min
};
