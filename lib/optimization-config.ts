// lib/optimization-config.ts - Optimization utilities and constants

/**
 * API Response caching configuration
 * Reduces database hits and improves performance
 */
export const CACHE_CONFIG = {
  // 5 minutes for employee data
  EMPLOYEE_CACHE_TIME: 5 * 60,
  // 10 minutes for payroll data
  PAYROLL_CACHE_TIME: 10 * 60,
  // 15 minutes for attendance data
  ATTENDANCE_CACHE_TIME: 15 * 60,
  // 60 seconds for frequently changing data
  SHORT_CACHE_TIME: 60,
} as const;

/**
 * Pagination configuration
 * Improves performance for list views
 */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  EMPLOYEE_LIST_SIZE: 50,
} as const;

/**
 * Data batch size for bulk operations
 * Prevents memory overflow and improves processing
 */
export const BATCH_SIZES = {
  PAYROLL_PROCESSING: 50,
  ATTENDANCE_IMPORT: 100,
  EMAIL_BATCH: 25,
} as const;

/**
 * API optimization headers
 * Enables compression and caching
 */
export const OPTIMIZATION_HEADERS = {
  'Cache-Control': 'public, max-age=300',
  'Content-Encoding': 'gzip',
  'X-Content-Type-Options': 'nosniff',
} as const;

/**
 * Helper to add cache headers to API responses
 */
export function withCacheHeaders(
  time: number = CACHE_CONFIG.PAYROLL_CACHE_TIME
) {
  return {
    'Cache-Control': `public, max-age=${time}`,
    'Content-Type': 'application/json',
  };
}

/**
 * Helper for pagination metadata
 */
export function getPaginationMetadata(
  total: number,
  pageSize: number,
  currentPage: number
) {
  return {
    total,
    pageSize,
    currentPage,
    totalPages: Math.ceil(total / pageSize),
    hasNextPage: currentPage < Math.ceil(total / pageSize),
  };
}

/**
 * Debounce function for client-side optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return function (...args: Parameters<T>) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Memoization helper for expensive calculations
 */
export function memoize<T extends (...args: any[]) => any>(func: T): T {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = func(...args);
    cache.set(key, result);
    return result;
  }) as T;
}
