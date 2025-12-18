// ============ CENTRALIZED VALIDATION RULES ============
// All validation limits in one place so UI and logic stay in sync

export const VALIDATION = {
  // Name rules
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 50,
  
  // PIN rules
  PIN_LENGTH: 4,
  PIN_PATTERN: /^\d{4}$/,
  
  // Amount rules
  AMOUNT_MIN: 1,
  AMOUNT_MAX: 10_000_000, // ₹1 Crore max per transaction
  AMOUNT_DECIMALS: 2,     // Max decimal places allowed
  
  // Large transaction threshold for confirmation
  LARGE_TRANSACTION_THRESHOLD: 10_000,
  
  // Mobile patterns (Indian formats)
  MOBILE_PATTERNS: {
    INDIA_WITH_CODE: /^\+91[6-9][0-9]{9}$/,
    INDIA_WITH_ZERO: /^0[6-9][0-9]{9}$/,
    INDIA_PLAIN: /^[6-9][0-9]{9}$/,
    KENYA: /^\+254[0-9]{9}$/,
  },
  
  // Invalid mobile patterns (edge cases)
  INVALID_MOBILE_PATTERNS: [
    /^\++/,           // Multiple plus signs
    /^[^0-9+]/,       // Starts with non-digit/non-plus
    /[^0-9]/,         // Contains non-digits after normalization (excluding +)
  ],
  
  // Debounce time (ms) to prevent rapid clicks
  DEBOUNCE_TIME: 600,
};

// ============ ERROR MESSAGES ============
export const ERRORS = {
  NAME_TOO_SHORT: `Name must be at least ${VALIDATION.NAME_MIN_LENGTH} characters`,
  NAME_TOO_LONG: `Name cannot exceed ${VALIDATION.NAME_MAX_LENGTH} characters`,
  INVALID_NAME: 'Name contains invalid characters',
  
  INVALID_MOBILE: 'Enter a valid 10-digit mobile number',
  MOBILE_HINT: 'Format: 9876543210 or +91 9876543210',
  INVALID_MOBILE_CHARS: 'Mobile contains invalid characters',
  
  INVALID_PIN: `PIN must be exactly ${VALIDATION.PIN_LENGTH} digits`,
  WRONG_PIN: 'Incorrect PIN',
  
  AMOUNT_REQUIRED: 'Enter an amount',
  AMOUNT_NEGATIVE: 'Amount must be positive',
  AMOUNT_TOO_LARGE: `Maximum amount is ₹${VALIDATION.AMOUNT_MAX.toLocaleString('en-IN')}`,
  AMOUNT_TOO_MANY_DECIMALS: `Maximum ${VALIDATION.AMOUNT_DECIMALS} decimal places allowed`,
  INSUFFICIENT_BALANCE: 'Insufficient balance',
  
  SELF_TRANSFER: 'Cannot transfer to yourself',
  NO_ACCOUNT: 'No account found. Please sign up first.',
};

