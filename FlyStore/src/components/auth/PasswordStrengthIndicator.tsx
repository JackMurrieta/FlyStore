import { validatePassword, getPasswordStrengthColor, getPasswordStrengthText } from '../../utils/passwordValidation';
import './PasswordStrengthIndicator.css';

interface PasswordStrengthIndicatorProps {
  password: string;
  show: boolean;
}

export function PasswordStrengthIndicator({ password, show }: PasswordStrengthIndicatorProps) {
  if (!show || !password) return null;

  const validation = validatePassword(password);
  const color = getPasswordStrengthColor(validation.strength);
  const strengthText = getPasswordStrengthText(validation.strength);

  return (
    <div className="password-strength-container">
      {/* Barra de seguridad */}
      <div className="password-strength-bar-wrapper">
        <div className="password-strength-label">
          <span>Seguridad: </span>
          <strong style={{ color }}>{strengthText}</strong>
        </div>
        <div className="password-strength-bar-bg">
          <div
            className="password-strength-bar-fill"
            style={{
              width: `${(validation.score / 5) * 100}%`,
              backgroundColor: color,
            }}
          />
        </div>
      </div>

      {/* Requisitos */}
      <div className="password-requirements">
        <p className="password-requirements-title">La contraseña debe incluir:</p>
        <ul className="password-requirements-list">
          <li className={validation.hasMinLength ? 'requirement-met' : ''}>
            {validation.hasMinLength ? '✓' : '○'} Mínimo 8 caracteres
          </li>
          <li className={validation.hasLowerCase ? 'requirement-met' : ''}>
            {validation.hasLowerCase ? '✓' : '○'} Al menos una minúscula (a-z)
          </li>
          <li className={validation.hasUpperCase ? 'requirement-met' : ''}>
            {validation.hasUpperCase ? '✓' : '○'} Al menos una mayúscula (A-Z)
          </li>
          <li className={validation.hasDigit ? 'requirement-met' : ''}>
            {validation.hasDigit ? '✓' : '○'} Al menos un número (0-9)
          </li>
          <li className={validation.hasSymbol ? 'requirement-met' : ''}>
            {validation.hasSymbol ? '✓' : '○'} Al menos un símbolo (!@#$%...)
          </li>
        </ul>
      </div>
    </div>
  );
}
