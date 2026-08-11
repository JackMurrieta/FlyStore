export interface PasswordStrength {
  hasLowerCase: boolean;
  hasUpperCase: boolean;
  hasDigit: boolean;
  hasSymbol: boolean;
  hasMinLength: boolean;
  isValid: boolean;
  strength: 'weak' | 'medium' | 'strong';
  score: number; // 0-5
}

const MIN_LENGTH = 8;

export function validatePassword(password: string): PasswordStrength {
  const hasLowerCase = /[a-z]/.test(password);
  const hasUpperCase = /[A-Z]/.test(password);
  const hasDigit = /\d/.test(password);
  const hasSymbol = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasMinLength = password.length >= MIN_LENGTH;

  const isValid = hasLowerCase && hasUpperCase && hasDigit && hasSymbol && hasMinLength;

  // Calculate score
  let score = 0;
  if (hasLowerCase) score++;
  if (hasUpperCase) score++;
  if (hasDigit) score++;
  if (hasSymbol) score++;
  if (hasMinLength) score++;

  // Determine strength
  let strength: 'weak' | 'medium' | 'strong';
  if (score <= 2) {
    strength = 'weak';
  } else if (score <= 4) {
    strength = 'medium';
  } else {
    strength = 'strong';
  }

  return {
    hasLowerCase,
    hasUpperCase,
    hasDigit,
    hasSymbol,
    hasMinLength,
    isValid,
    strength,
    score,
  };
}

export function getPasswordStrengthColor(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return '#ef4444'; // red
    case 'medium':
      return '#f59e0b'; // orange
    case 'strong':
      return '#10b981'; // green
  }
}

export function getPasswordStrengthText(strength: 'weak' | 'medium' | 'strong'): string {
  switch (strength) {
    case 'weak':
      return 'Débil';
    case 'medium':
      return 'Media';
    case 'strong':
      return 'Segura';
  }
}
