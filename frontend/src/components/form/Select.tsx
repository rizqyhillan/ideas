import { useEffect, useRef, useState } from "react";
import { twMerge } from "tailwind-merge";
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
        className={twMerge(
          "ui-select-trigger",
          !selectedOption && "is-placeholder",
          className,
        )}
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
          className="ui-select-menu"
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
                className={twMerge(
                  "ui-select-option",
                  isSelected && "is-selected",
                  isActive && !isSelected && "is-active",
                )}
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
