export interface LoginError {
  type: 'validation' | 'authentication' | 'network' | 'server' | 'unknown';
  message: string;
  details?: string;
}

export function parseLoginError(error: any): LoginError {
  // Handle different types of errors
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    
    // Network errors
    if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
      return {
        type: 'network',
        message: 'Network Error',
        details: 'Unable to connect to the server. Please check your internet connection and try again.'
      };
    }
    
    // Authentication errors
    if (message.includes('invalid') || message.includes('credentials') || message.includes('401')) {
      return {
        type: 'authentication',
        message: 'Invalid Credentials',
        details: 'The email or password you entered is incorrect. Please try again.'
      };
    }
    
    // Server errors
    if (message.includes('500') || message.includes('server') || message.includes('internal')) {
      return {
        type: 'server',
        message: 'Server Error',
        details: 'Something went wrong on our end. Please try again later.'
      };
    }
    
    // Validation errors
    if (message.includes('validation') || message.includes('required') || message.includes('format')) {
      return {
        type: 'validation',
        message: 'Validation Error',
        details: error.message
      };
    }
    
    // Rate limiting
    if (message.includes('rate') || message.includes('limit') || message.includes('429')) {
      return {
        type: 'authentication',
        message: 'Too Many Attempts',
        details: 'Too many login attempts. Please wait a few minutes before trying again.'
      };
    }
    
    // Account locked/suspended
    if (message.includes('locked') || message.includes('suspended') || message.includes('disabled')) {
      return {
        type: 'authentication',
        message: 'Account Disabled',
        details: 'Your account has been temporarily disabled. Please contact support.'
      };
    }
  }
  
  // Default error
  return {
    type: 'unknown',
    message: 'Login Failed',
    details: 'An unexpected error occurred. Please try again.'
  };
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}

export function getLoginErrorTitle(error: LoginError): string {
  switch (error.type) {
    case 'validation':
      return 'Invalid Input';
    case 'authentication':
      return 'Authentication Failed';
    case 'network':
      return 'Connection Error';
    case 'server':
      return 'Server Error';
    default:
      return 'Login Error';
  }
}
