/* eslint-disable @typescript-eslint/no-empty-object-type */
// src/components/form/input/InputField.tsx
import React, { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error, success, hint, className, ...props }, ref) => {
    const baseClasses =
      "w-full px-3 py-2 border rounded-md text-gray-700 dark:text-gray-300 dark:bg-gray-800 focus:outline-none focus:ring-2";
    const errorClasses = error ? "border-red-500 focus:ring-red-500" : "";
    const successClasses = success ? "border-green-500 focus:ring-green-500" : "";

    return (
      <div className="flex flex-col">
        <input
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${successClasses} ${className || ""}`}
          {...props}
        />
        {hint && (
          <span
            className={`text-sm mt-1 ${
              error ? "text-red-500" : success ? "text-green-500" : "text-gray-500"
            }`}
          >
            {hint}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
