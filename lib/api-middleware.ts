import { NextResponse } from 'next/server';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

export type ApiResponse<T = any> = {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  errors?: Record<string, string[]>;
  timestamp: string;
};

export function jsonSuccess<T>(data: T, message?: string, status = 200) {
  const payload: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(payload, { status });
}

export function jsonError(error: string, status = 400, details?: Record<string, string[]>) {
  const payload: ApiResponse = {
    success: false,
    error,
    errors: details,
    timestamp: new Date().toISOString(),
  };
  return NextResponse.json(payload, { status });
}

/**
 * Validates JSON request body against a Zod schema.
 */
export async function validateRequestBody<T>(
  request: Request,
  schema: z.ZodSchema<T>
): Promise<{ data: T | null; errorResponse: NextResponse | null }> {
  try {
    const body = await request.json();
    const result = schema.safeParse(body);
    if (!result.success) {
      const formattedErrors = result.error.flatten().fieldErrors;
      return {
        data: null,
        errorResponse: jsonError('Invalid request payload', 422, formattedErrors as Record<string, string[]>),
      };
    }
    return { data: result.data, errorResponse: null };
  } catch {
    return {
      data: null,
      errorResponse: jsonError('Malformed JSON payload', 400),
    };
  }
}

/**
 * Checks API rate limit for IP address or tenant key.
 * Limit: maxRequests per windowMs.
 */
export async function checkRateLimit(
  identifier: string,
  route: string,
  maxRequests = 60,
  windowMs = 60000
): Promise<{ allowed: boolean; remaining: number }> {
  try {
    const now = new Date();
    const windowStart = new Date(now.getTime() - windowMs);

    const { data: existing } = await supabase
      .from('api_rate_limits')
      .select('id, request_count, window_start')
      .eq('identifier', identifier)
      .eq('route', route)
      .single();

    if (!existing) {
      await supabase.from('api_rate_limits').insert({
        identifier,
        route,
        request_count: 1,
        window_start: now.toISOString(),
      });
      return { allowed: true, remaining: maxRequests - 1 };
    }

    const recordWindow = new Date(existing.window_start);
    if (recordWindow < windowStart) {
      // Reset window
      await supabase
        .from('api_rate_limits')
        .update({ request_count: 1, window_start: now.toISOString() })
        .eq('id', existing.id);
      return { allowed: true, remaining: maxRequests - 1 };
    }

    if (existing.request_count >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    await supabase
      .from('api_rate_limits')
      .update({ request_count: existing.request_count + 1 })
      .eq('id', existing.id);

    return { allowed: true, remaining: maxRequests - (existing.request_count + 1) };
  } catch (err) {
    console.warn('[RateLimit] Memory fallback allowed:', err);
    return { allowed: true, remaining: 10 };
  }
}

/**
 * Fetch wrapper with timeout and exponential backoff retries for external APIs.
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  timeoutMs = 10000,
  backoffMs = 1000
): Promise<Response> {
  let lastError: any;

  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        ...options,
        signal: controller.signal,
      });
      clearTimeout(timer);

      if (res.ok || res.status < 500) {
        return res;
      }
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    } catch (err: any) {
      clearTimeout(timer);
      lastError = err;
      if (attempt < retries - 1) {
        const delay = backoffMs * Math.pow(2, attempt);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error(`Failed to fetch ${url} after ${retries} attempts`);
}
