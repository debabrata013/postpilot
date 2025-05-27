// Utility functions for the application

/**
 * Format a date to a readable string
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric'
  }).format(new Date(date));
}

/**
 * Truncate text to a specific length
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number = 50): string {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * Generate a default chat title from the first message
 * @param message First message content
 * @returns Generated title
 */
export function generateChatTitle(message: string): string {
  // Extract first few words or characters for the title
  const title = truncateText(message, 30);
  return title || `Chat ${new Date().toLocaleString()}`;
}

/**
 * Handle API errors consistently
 * @param error Error object
 * @returns Error message
 */
export function handleApiError(error: any): string {
  console.error('API Error:', error);
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Validate MongoDB ObjectId
 * @param id ID to validate
 * @returns Boolean indicating if ID is valid
 */
export function isValidObjectId(id: string): boolean {
  const objectIdPattern = /^[0-9a-fA-F]{24}$/;
  return objectIdPattern.test(id);
}
