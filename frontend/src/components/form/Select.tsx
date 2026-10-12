import { useEffect, useRef, useState } from "react";
import { Icon } from "../icons/ideas-icon";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  options: Option[];
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
  defaultValue?: string;
  value?: string;
  id?: string;
  disabled?: boolean;
}

const Select: React.FC<SelectProps> = ({
  options,
  placeholder = "Select an option",
  onChange,
  className = "",
  defaultValue = "",
  value,
  id,
  disabled = false,
}) => {
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selectedValue = value ?? internalValue;
  const selectedOption = options.find((option) => option.value === selectedValue);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  const handleSelect = (optionValue: string) => {
    if (value === undefined) setInternalValue(optionValue);
    onChange(optionValue);
    setIsOpen(false);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        setActiveIndex(Math.max(0, options.findIndex((option) => option.value === selectedValue)));
        return;
      }

      setActiveIndex((current) => {
        if (event.key === "ArrowDown") return (current + 1) % options.length;
        return current <= 0 ? options.length - 1 : current - 1;
      });
    }

    if ((event.key === "Enter" || event.key === " ") && isOpen && activeIndex >= 0) {
      event.preventDefault();
      handleSelect(options[activeIndex].value);
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        id={id}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
        onKeyDown={handleKeyDown}
        className={`flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-4 text-left text-sm shadow-theme-xs transition-colors focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 dark:focus:border-brand-800 ${
          selectedOption
            ? "text-gray-800 dark:text-white/90"
            : "text-gray-400 dark:text-gray-400"
        } ${className}`}
      >
        <span className="truncate">{selectedOption?.label ?? placeholder}</span>
        <Icon
          name="chevron-down"
          size={18}
          className={`ml-3 shrink-0 text-gray-500 transition-transform dark:text-gray-400 ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-labelledby={id}
          className="absolute z-50 mt-1.5 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white p-1 shadow-theme-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {options.map((option, index) => {
            const isSelected = option.value === selectedValue;
            const isActive = index === activeIndex;

            return (
              <button
                key={option.value}
                type="button"
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(index)}
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${
                  isSelected
                    ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-300"
                    : isActive
                      ? "bg-gray-100 text-gray-900 dark:bg-gray-800 dark:text-white"
                      : "text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800/60"
                }`}
              >
                <span className="truncate">{option.label}</span>
                {isSelected && <Icon name="check" size={16} className="ml-3 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Select;
