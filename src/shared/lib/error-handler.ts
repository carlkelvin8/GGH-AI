/**
 * Centralized error handling utilities for better user experience
 */

export type ErrorCategory = 'network' | 'validation' | 'api' | 'timeout' | 'auth' | 'unknown';

export interface UserFriendlyError {
  category: ErrorCategory;
  title: string;
  message: string;
  action?: string;
  retryable: boolean;
}

/**
 * Converts technical errors into user-friendly messages
 */
export function createUserFriendlyError(error: unknown): UserFriendlyError {
  if (error instanceof Error) {
    // Network errors
    if (error.message.includes('fetch') || error.message.includes('ECONNREFUSED')) {
      return {
        category: 'network',
        title: 'Connection Problem',
        message: 'Unable to connect to our servers. Please check your internet connection.',
        action: 'Try again in a moment',
        retryable: true,
      };
    }

    // Timeout errors
    if (error.message.includes('timeout') || error.message.includes('AbortError')) {
      return {
        category: 'timeout',
        title: 'Request Timed Out',
        message: 'The operation took too long to complete.',
        action: 'Please try again with a shorter request',
        retryable: true,
      };
    }

    // API rate limiting
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return {
        category: 'api',
        title: 'Too Many Requests',
        message: 'You\'ve made too many requests. Please wait a moment before trying again.',
        action: 'Wait 1 minute and retry',
        retryable: true,
      };
    }

    // Authentication errors
    if (error.message.includes('Unauthorized') || error.message.includes('401')) {
      return {
        category: 'auth',
        title: 'Authentication Required',
        message: 'Please sign in to continue.',
        action: 'Sign in to your account',
        retryable: false,
      };
    }

    // Validation errors
    if (error.message.includes('validation') || error.message.includes('Invalid')) {
      return {
        category: 'validation',
        title: 'Invalid Input',
        message: 'Please check your input and try again.',
        action: 'Review the form for errors',
        retryable: false,
      };
    }
  }

  // Generic fallback
  return {
    category: 'unknown',
    title: 'Something Went Wrong',
    message: 'An unexpected error occurred. Our team has been notified.',
    action: 'Please try again or contact support if the problem persists',
    retryable: true,
  };
}

/**
 * Retry utility with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error('Unknown error');
      
      if (attempt === maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 1s, 2s, 4s, 8s...
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Timeout wrapper for promises
 */
export function withTimeout<T>(promise: Promise<T>, timeoutMs: number = 30000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs);
    })
  ]);
}