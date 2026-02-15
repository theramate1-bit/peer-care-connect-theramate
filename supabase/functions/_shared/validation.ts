/**
 * Shared input validation utilities for Edge Functions
 * Provides common validation patterns for security and data integrity
 */

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validate email address format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email || typeof email !== 'string') {
    return { valid: false, error: 'Email is required and must be a string' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: `Invalid email address format: ${email}` };
  }
  
  // Check length limits
  if (email.length > 254) {
    return { valid: false, error: 'Email address is too long (max 254 characters)' };
  }
  
  return { valid: true };
}

/**
 * Validate UUID format
 */
export function validateUUID(uuid: string, fieldName: string = 'UUID'): ValidationResult {
  if (!uuid || typeof uuid !== 'string') {
    return { valid: false, error: `${fieldName} is required and must be a string` };
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(uuid)) {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }
  
  return { valid: true };
}

/**
 * Validate required string field
 */
export function validateRequiredString(value: any, fieldName: string): ValidationResult {
  if (!value || typeof value !== 'string' || value.trim().length === 0) {
    return { valid: false, error: `${fieldName} is required and must be a non-empty string` };
  }
  
  return { valid: true };
}

/**
 * Validate required field exists
 */
export function validateRequired(value: any, fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  return { valid: true };
}

/**
 * Validate positive integer
 */
export function validatePositiveInteger(value: any, fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  const num = Number(value);
  if (!Number.isInteger(num) || num <= 0) {
    return { valid: false, error: `${fieldName} must be a positive integer` };
  }
  
  return { valid: true };
}

/**
 * Validate positive number (can be decimal)
 */
export function validatePositiveNumber(value: any, fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  const num = Number(value);
  if (isNaN(num) || num <= 0) {
    return { valid: false, error: `${fieldName} must be a positive number` };
  }
  
  return { valid: true };
}

/**
 * Validate string length
 */
export function validateStringLength(
  value: string,
  fieldName: string,
  minLength: number,
  maxLength: number
): ValidationResult {
  if (!value || typeof value !== 'string') {
    return { valid: false, error: `${fieldName} must be a string` };
  }
  
  const length = value.length;
  if (length < minLength) {
    return { valid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  
  if (length > maxLength) {
    return { valid: false, error: `${fieldName} must be at most ${maxLength} characters` };
  }
  
  return { valid: true };
}

/**
 * Validate URL format
 */
export function validateURL(url: string, fieldName: string = 'URL'): ValidationResult {
  if (!url || typeof url !== 'string') {
    return { valid: false, error: `${fieldName} is required and must be a string` };
  }
  
  try {
    new URL(url);
    return { valid: true };
  } catch {
    return { valid: false, error: `Invalid ${fieldName} format` };
  }
}

/**
 * Validate enum value
 */
export function validateEnum<T extends string>(
  value: any,
  fieldName: string,
  allowedValues: readonly T[]
): ValidationResult {
  if (!value) {
    return { valid: false, error: `${fieldName} is required` };
  }
  
  if (!allowedValues.includes(value as T)) {
    return {
      valid: false,
      error: `${fieldName} must be one of: ${allowedValues.join(', ')}`
    };
  }
  
  return { valid: true };
}

/**
 * Sanitize string input (remove dangerous characters)
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  // Remove null bytes and control characters (except newlines, tabs, carriage returns)
  return input
    .replace(/\0/g, '')
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

/**
 * Validate request body is JSON
 */
export async function validateJSONBody(req: Request): Promise<{ valid: boolean; data?: any; error?: string }> {
  try {
    const contentType = req.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return { valid: false, error: 'Content-Type must be application/json' };
    }
    
    const text = await req.text();
    if (!text || text.trim().length === 0) {
      return { valid: false, error: 'Request body is empty' };
    }
    
    // Limit body size to prevent DoS
    if (text.length > 10 * 1024 * 1024) { // 10MB limit
      return { valid: false, error: 'Request body is too large (max 10MB)' };
    }
    
    const data = JSON.parse(text);
    return { valid: true, data };
  } catch (error) {
    return { valid: false, error: `Invalid JSON: ${error.message}` };
  }
}

/**
 * Validate Stripe webhook signature is present
 */
export function validateStripeSignature(signature: string | null): ValidationResult {
  if (!signature || typeof signature !== 'string') {
    return { valid: false, error: 'Missing Stripe signature header' };
  }
  
  if (!signature.startsWith('t=')) {
    return { valid: false, error: 'Invalid Stripe signature format' };
  }
  
  return { valid: true };
}

