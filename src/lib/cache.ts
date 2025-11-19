/**
 * In-memory cache manager with TTL support
 * Useful for caching frequently accessed data like team info, industry breakdowns, etc.
 */

interface CacheEntry<T> {
  data: T;
  expires: number;
}

class CacheManager {
  private cache = new Map<string, CacheEntry<unknown>>();
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Run cleanup every 5 minutes
    this.cleanupInterval = setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Get cached data if it exists and hasn't expired
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;

    if (!entry) {
      return null;
    }

    // Check if expired
    if (Date.now() > entry.expires) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set data in cache with TTL (time to live) in milliseconds
   * Default TTL is 5 minutes
   */
  set<T>(key: string, data: T, ttlMs = 300000): void {
    const entry: CacheEntry<T> = {
      data,
      expires: Date.now() + ttlMs,
    };

    this.cache.set(key, entry);
  }

  /**
   * Remove specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get or set pattern - fetch data if not cached
   */
  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttlMs = 300000
  ): Promise<T> {
    const cached = this.get<T>(key);

    if (cached !== null) {
      return cached;
    }

    const data = await fetchFn();
    this.set(key, data, ttlMs);
    return data;
  }

  /**
   * Remove expired entries from cache
   */
  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expires) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    if (keysToDelete.length > 0) {
      console.log(`[Cache] Cleaned up ${keysToDelete.length} expired entries`);
    }
  }

  /**
   * Get cache statistics
   */
  stats(): {
    size: number;
    keys: string[];
    hitRate?: number;
  } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }

  /**
   * Destroy cache manager and cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

// Export singleton instance
export const cache = new CacheManager();

/**
 * Cache key generators for consistent cache keys
 */
export const CacheKeys = {
  team: (teamId: string) => `team:${teamId}`,
  teamMembers: (teamId: string) => `team:${teamId}:members`,
  leadStats: (teamId: string) => `team:${teamId}:stats`,
  industryBreakdown: (teamId: string) => `team:${teamId}:industries`,
  lead: (leadId: string) => `lead:${leadId}`,
  userTeam: (userId: string) => `user:${userId}:team`,
} as const;

/**
 * Cache invalidation helpers
 */
export const invalidateCache = {
  team: (teamId: string) => {
    cache.delete(CacheKeys.team(teamId));
    cache.delete(CacheKeys.teamMembers(teamId));
    cache.delete(CacheKeys.leadStats(teamId));
    cache.delete(CacheKeys.industryBreakdown(teamId));
  },

  lead: (leadId: string, teamId?: string) => {
    cache.delete(CacheKeys.lead(leadId));
    if (teamId) {
      cache.delete(CacheKeys.leadStats(teamId));
      cache.delete(CacheKeys.industryBreakdown(teamId));
    }
  },

  user: (userId: string) => {
    cache.delete(CacheKeys.userTeam(userId));
  },
};
