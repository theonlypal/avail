/**
 * Custom error class for Leadly.AI
 */
export class LeadlyError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number,
    public details?: unknown
  ) {
    super(message);
    this.name = 'LeadlyError';
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error codes for consistent error handling
 */
export const ErrorCodes = {
  // Authentication errors (401)
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_TOKEN: 'INVALID_TOKEN',
  SESSION_EXPIRED: 'SESSION_EXPIRED',

  // Authorization errors (403)
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',

  // Resource errors (404)
  NOT_FOUND: 'NOT_FOUND',
  LEAD_NOT_FOUND: 'LEAD_NOT_FOUND',
  TEAM_NOT_FOUND: 'TEAM_NOT_FOUND',

  // Validation errors (400)
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',

  // External API errors (502)
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',
  GOOGLE_MAPS_ERROR: 'GOOGLE_MAPS_ERROR',
  YELP_API_ERROR: 'YELP_API_ERROR',
  OPENAI_ERROR: 'OPENAI_ERROR',

  // Rate limiting (429)
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',

  // Database errors (500)
  DATABASE_ERROR: 'DATABASE_ERROR',
  QUERY_FAILED: 'QUERY_FAILED',

  // Internal errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNKNOWN_ERROR: 'UNKNOWN_ERROR',
} as const;

/**
 * Handle API errors and return standardized error response
 */
export function handleApiError(error: unknown) {
  // Log error for monitoring
  console.error('[Leadly.AI Error]', error);

  if (error instanceof LeadlyError) {
    return {
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    };
  }

  // Handle Supabase errors
  if (error && typeof error === 'object' && 'code' in error) {
    const supabaseError = error as { code: string; message: string };

    if (supabaseError.code === 'PGRST116') {
      return {
        error: 'Resource not found',
        code: ErrorCodes.NOT_FOUND,
        statusCode: 404,
      };
    }

    if (supabaseError.code === '23505') {
      return {
        error: 'Resource already exists',
        code: ErrorCodes.VALIDATION_ERROR,
        statusCode: 400,
      };
    }

    return {
      error: supabaseError.message || 'Database error occurred',
      code: ErrorCodes.DATABASE_ERROR,
      statusCode: 500,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      error: error.message,
      code: ErrorCodes.INTERNAL_ERROR,
      statusCode: 500,
    };
  }

  // Fallback for unknown errors
  return {
    error: 'An unexpected error occurred',
    code: ErrorCodes.UNKNOWN_ERROR,
    statusCode: 500,
  };
}

/**
 * Create a standardized error response for API routes
 */
export function createErrorResponse(
  message: string,
  code: string,
  statusCode: number,
  details?: unknown
) {
  return Response.json(
    {
      error: message,
      code,
      details,
    },
    { status: statusCode }
  );
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields<T extends Record<string, unknown>>(
  data: T,
  requiredFields: (keyof T)[]
): void {
  const missingFields = requiredFields.filter(field => !data[field]);

  if (missingFields.length > 0) {
    throw new LeadlyError(
      `Missing required fields: ${missingFields.join(', ')}`,
      ErrorCodes.MISSING_REQUIRED_FIELD,
      400,
      { missingFields }
    );
  }
}

/**
 * Retry a function with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries = 3,
  baseDelay = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('All retry attempts failed');
}
