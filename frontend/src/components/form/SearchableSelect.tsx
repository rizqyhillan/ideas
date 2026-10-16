import { useEffect, useRef, useState, useMemo } from "react";
import { Icon } from "../icons/ideas-icon";

export interface SearchableOption {
  value: string | number;
  label: string;
  sublabel?: string;
}

interface SearchableSelectProps {
  options: SearchableOption[];
  value?: string | number;
  onChange: (value: any) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
}

export default function SearchableSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih opsi...",
  searchPlaceholder = "Cari...",
  disabled = false,
  className = "",
  id,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = useMemo(
    () => options.find((opt) => String(opt.value) === String(value)),
    [options, value]
  );

  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase();
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(term) ||
        (opt.sublabel && opt.sublabel.toLowerCase().includes(term))
    );
  }, [options, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleSelect = (val: string | number) => {
    onChange(val);
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setIsOpen((prev) => !prev);
            setSearchTerm("");
          }
        }}
        className={`flex h-11 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3.5 text-left text-sm transition-colors focus:border-brand-500 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-gray-900 ${
          selectedOption
            ? "text-gray-800 dark:text-white"
            : "text-gray-400 dark:text-gray-500"
        } ${className}`}
      >
        <div className="truncate pr-2">
          {selectedOption ? (
            <span>
              {selectedOption.label}
              {selectedOption.sublabel && (
                <span className="ml-1.5 text-xs text-gray-400 dark:text-gray-500">
                  ({selectedOption.sublabel})
                </span>
              )}
            </span>
          ) : (
            placeholder
          )}
        </div>
        <Icon
          name="chevronDown"
          className={`h-4 w-4 shrink-0 text-gray-400 transition-transform dark:text-gray-500 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full rounded-lg border border-gray-200 bg-white p-2 shadow-lg dark:border-gray-700 dark:bg-gray-900">
          <div className="relative mb-2">
            <Icon
              name="search"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full rounded-md border border-gray-200 bg-gray-50 py-1.5 pl-8 pr-7 text-xs text-gray-800 placeholder-gray-400 focus:border-brand-500 focus:bg-white focus:outline-hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:focus:bg-gray-800"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <Icon name="x" className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {filteredOptions.length === 0 ? (
              <div className="py-3 text-center text-xs text-gray-400">
                Tidak ada data yang cocok
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = String(opt.value) === String(value);
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={`flex w-full items-center justify-between rounded-md px-2.5 py-1.5 text-left text-xs transition-colors ${
                      isSelected
                        ? "bg-brand-50 font-medium text-brand-700 dark:bg-brand-500/10 dark:text-brand-400"
                        : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
                    }`}
                  >
                    <div className="truncate">
                      <span>{opt.label}</span>
                      {opt.sublabel && (
                        <span className="ml-1 text-[11px] text-gray-400 dark:text-gray-500">
                          {opt.sublabel}
                        </span>
                      )}
                    </div>
                    {isSelected && (
                      <Icon
                        name="check"
                        className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-400 ml-2"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
