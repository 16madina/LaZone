import React from 'react';
import { Input } from '@/components/ui/input';
import { InputValidator } from '@/utils/security';
import { cn } from '@/lib/utils';

interface SecureInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  validationType?: 'email' | 'phone' | 'name' | 'text';
  showValidation?: boolean;
  onValidationChange?: (isValid: boolean) => void;
}

/**
 * Secure input component with built-in validation and sanitization
 */
export const SecureInput: React.FC<SecureInputProps> = ({
  validationType = 'text',
  showValidation = false,
  onValidationChange,
  className,
  onChange,
  ...props
}) => {
  const [validationError, setValidationError] = React.useState<string>('');
  const [isValid, setIsValid] = React.useState(true);

  const validateInput = (value: string) => {
    if (!value && !props.required) {
      setValidationError('');
      setIsValid(true);
      onValidationChange?.(true);
      return;
    }

    let validation = { isValid: true, error: '' };

    switch (validationType) {
      case 'email':
        const emailValidation = InputValidator.validateEmail(value);
        validation = { isValid: emailValidation.isValid, error: emailValidation.error || '' };
        break;
      case 'phone':
        const phoneValidation = InputValidator.validatePhone(value);
        validation = { isValid: phoneValidation.isValid, error: phoneValidation.error || '' };
        break;
      case 'name':
        const nameValidation = InputValidator.validateName(value);
        validation = { isValid: nameValidation.isValid, error: nameValidation.error || '' };
        break;
      default:
        validation = { isValid: true, error: '' };
    }

    setValidationError(validation.error || '');
    setIsValid(validation.isValid);
    onValidationChange?.(validation.isValid);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    if (showValidation) {
      validateInput(value);
    }
    
    onChange?.(e);
  };

  return (
    <div className="space-y-1">
      <Input
        {...props}
        onChange={handleChange}
        className={cn(
          className,
          !isValid && showValidation && 'border-destructive'
        )}
        autoComplete={
          validationType === 'email' ? 'email' :
          validationType === 'phone' ? 'tel' :
          'off'
        }
      />
      {showValidation && validationError && (
        <p className="text-sm text-destructive">{validationError}</p>
      )}
    </div>
  );
};