import type React from "react";
import type { FC } from "react";
import { twMerge } from "tailwind-merge";

interface InputProps {
  type?: "text" | "number" | "email" | "password" | "date" | "time" | string;
  id?: string;
  name?: string;
  placeholder?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  min?: string;
  max?: string;
  step?: number;
  disabled?: boolean;
  required?: boolean;
  success?: boolean;
  error?: boolean;
  hint?: string;
}

const Input: FC<InputProps> = ({
  type = "text",
  id,
  name,
  placeholder,
  value,
  onChange,
  className = "",
  min,
  max,
  step,
  disabled = false,
  required = false,
  success = false,
  error = false,
  hint,
}) => {
  let inputClasses = twMerge("ui-input", type === "date" && "cursor-pointer", className);

  if (disabled) {
    inputClasses = twMerge(inputClasses, "opacity-50 cursor-not-allowed");
  } else if (error) {
    inputClasses = twMerge(inputClasses, "is-error");
  } else if (success) {
    inputClasses = twMerge(inputClasses, "border-gray-500");
  }

  return (
    <div className="relative">
      <input
        type={type}
        id={id}
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onClick={(event) => {
          if (type === "date") event.currentTarget.showPicker?.();
        }}
        min={min}
        max={max}
        step={step}
        disabled={disabled}
        required={required}
        className={inputClasses}
      />

      {hint && (
        <p
          className={`mt-1.5 text-xs ${
            error
              ? "text-error-500"
              : success
                ? "text-success-500"
                : "text-gray-500"
          }`}
        >
          {hint}
        </p>
      )}
    </div>
  );
};

export default Input;
