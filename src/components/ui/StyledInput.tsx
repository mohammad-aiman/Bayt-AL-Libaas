'use client';

import { forwardRef, InputHTMLAttributes } from 'react';

interface StyledInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const StyledInput = forwardRef<HTMLInputElement, StyledInputProps>(
  ({ className = '', error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        {...props}
        style={{
          WebkitTextFillColor: '#111827',
          color: '#111827',
          opacity: 1,
          backgroundColor: error ? '#FEF2F2' : '#FFFFFF',
        }}
        className={`${className} [&:not(:placeholder-shown)]:text-gray-900 [&:-webkit-autofill]:text-gray-900 [&:-webkit-autofill]:bg-white`}
      />
    );
  }
);

StyledInput.displayName = 'StyledInput';

export default StyledInput; 