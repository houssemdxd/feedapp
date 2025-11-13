/* eslint-disable @typescript-eslint/no-empty-object-type */
// src/components/form/input/InputField.tsx
import React, { InputHTMLAttributes, forwardRef } from "react";

// Use InputHTMLAttributes and forwardRef for better TS compatibility
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <input
      {...props}
      ref={ref}
      className="w-full px-3 py-2 border rounded-md text-gray-700 dark:text-gray-300 dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
    />
  );
});

Input.displayName = "Input";

export default Input;
