'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { cn } from '@/shared/lib/utils';

interface FormFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  type?: 'text' | 'email' | 'password' | 'textarea';
  placeholder?: string;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  hint?: string;
  error?: string;
  showCharCount?: boolean;
  className?: string;
}

export function FormField({
  label,
  name,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  required = false,
  minLength,
  maxLength,
  pattern,
  hint,
  error,
  showCharCount = false,
  className,
}: FormFieldProps) {
  const [touched, setTouched] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Real-time validation
  useEffect(() => {
    if (!touched && !error) return;

    let newError: string | null = null;

    if (required && !value.trim()) {
      newError = `${label} is required`;
    } else if (minLength && value.length < minLength) {
      newError = `${label} must be at least ${minLength} characters`;
    } else if (maxLength && value.length > maxLength) {
      newError = `${label} must be no more than ${maxLength} characters`;
    } else if (pattern && !pattern.test(value)) {
      if (type === 'email') {
        newError = 'Please enter a valid email address';
      } else {
        newError = `${label} format is invalid`;
      }
    }

    setValidationError(newError);
  }, [value, touched, required, minLength, maxLength, pattern, label, type, error]);

  const handleBlur = () => {
    setTouched(true);
    onBlur?.();
  };

  const currentError = error || validationError;
  const isValid = touched && !currentError && value.trim().length > 0;
  const showError = touched && currentError;

  const getStatusIcon = () => {
    if (showError) {
      return <AlertCircle className="w-4 h-4 text-red-500" />;
    }
    if (isValid) {
      return <CheckCircle2 className="w-4 h-4 text-green-500" />;
    }
    return null;
  };

  const getStatusColor = () => {
    if (showError) return 'border-red-300 focus:border-red-500 focus:ring-red-500';
    if (isValid) return 'border-green-300 focus:border-green-500 focus:ring-green-500';
    return 'border-gray-300 focus:border-primary focus:ring-primary';
  };

  const InputComponent = type === 'textarea' ? Textarea : Input;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <Label htmlFor={name} className="text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
        {showCharCount && maxLength && (
          <span className={cn(
            'text-xs',
            value.length > maxLength ? 'text-red-500' : 'text-gray-500'
          )}>
            {value.length}/{maxLength}
          </span>
        )}
      </div>

      <div className="relative">
        <InputComponent
          id={name}
          name={name}
          type={type === 'textarea' ? undefined : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={handleBlur}
          placeholder={placeholder}
          className={cn(
            'pr-10',
            getStatusColor(),
            showError && 'bg-red-50',
            isValid && 'bg-green-50'
          )}
          aria-invalid={showError ? true : undefined}
          aria-describedby={
            hint || currentError ? `${name}-description` : undefined
          }
        />
        
        {getStatusIcon() && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            {getStatusIcon()}
          </div>
        )}
      </div>

      {/* Help text, error, or hint */}
      <div id={`${name}-description`} className="min-h-[1.25rem]">
        {showError ? (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {currentError}
          </p>
        ) : hint ? (
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <Info className="w-3 h-3" />
            {hint}
          </p>
        ) : null}
      </div>

      {/* Character count for minimum requirements */}
      {minLength && value.length > 0 && value.length < minLength && (
        <div className="text-xs text-gray-500">
          {minLength - value.length} more characters needed
        </div>
      )}
    </div>
  );
}