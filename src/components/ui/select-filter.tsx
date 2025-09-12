import React from 'react';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from './select';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  minWidth?: string;
}

export const SelectFilter: React.FC<SelectFilterProps> = ({
  value,
  onValueChange,
  options,
  placeholder,
  className = '',
  minWidth = '150px',
}) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={`flex items-center gap-2 rounded-xl border-2 ${className}`}
        style={{ minWidth }}
        aria-label={placeholder || 'Select an option'}
      >
        <SelectValue placeholder={selectedOption?.label || placeholder} />
      </SelectTrigger>
      <SelectContent className="bg-[#171717e0] backdrop-blur-md">
        {options.map((option) => (
          <SelectItem
            key={option.value}
            value={option.value}
            className="aria-selected:bg-white focus:bg-white/90 focus:text-black"
          >
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
