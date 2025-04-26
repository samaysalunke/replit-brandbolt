/**
 * Formats a date string for display
 */
export function formatDate(dateString?: string | Date | null): string {
  if (!dateString) return 'Not available';
  
  try {
    const date = typeof dateString === 'string' 
      ? new Date(dateString) 
      : dateString;
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  } catch (e) {
    console.error('Error formatting date:', e);
    return String(dateString);
  }
}

/**
 * Safely access nested object properties
 */
export function getNestedValue(obj: any, path: string, defaultValue: any = undefined): any {
  const keys = path.split('.');
  let result = obj;
  
  for (const key of keys) {
    if (result === undefined || result === null) {
      return defaultValue;
    }
    result = result[key];
  }
  
  return result === undefined ? defaultValue : result;
}

/**
 * Creates an abbreviated version of a string
 */
export function abbreviateString(str: string, maxLength: number = 20): string {
  if (!str) return '';
  if (str.length <= maxLength) return str;
  
  return `${str.substring(0, maxLength)}...`;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  
  return function(...args: Parameters<T>): void {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}