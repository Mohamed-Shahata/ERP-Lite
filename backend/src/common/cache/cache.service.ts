import { Injectable } from '@nestjs/common';

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

/**
 * Minimal in-memory TTL cache with prefix-based invalidation.
 *
 * No Redis/cache-manager package is wired into this project, so this keeps
 * caching dependency-free. It's process-local (fine for a single backend
 * instance); if the app is ever scaled to multiple instances, swap the
 * `store` for a shared cache (e.g. Redis) behind this same interface.
 */
@Injectable()
export class CacheService {
  private readonly store = new Map<string, CacheEntry>();

  get<T>(key: string): T | undefined {
    const entry = this.store.get(key);
    if (!entry) return undefined;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs: number): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  /** Returns the cached value, or runs `loader` once and caches its result. */
  async getOrSet<T>(
    key: string,
    ttlMs: number,
    loader: () => Promise<T>,
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== undefined) return cached;

    const value = await loader();
    this.set(key, value, ttlMs);
    return value;
  }

  /** Deletes every cached entry whose key starts with `prefix`. */
  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  invalidate(key: string): void {
    this.store.delete(key);
  }
}
