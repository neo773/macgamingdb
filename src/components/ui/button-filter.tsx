import React from 'react';
import { cn } from '../utils';
import { Button } from './button';

interface ButtonOption {
  value: string;
  label: string;
  count?: number;
}

interface ButtonFilterProps {
  activeValue: string;
  options: ButtonOption[];
  onValueChange: (value: string) => void;
  displayStats?: Record<string, number>;
  className?: string;
  buttonClassName?: string;
}

export const ButtonFilter: React.FC<ButtonFilterProps> = ({
  activeValue,
  options,
  onValueChange,
  displayStats,
  className = '',
  buttonClassName = '',
}) => {
  return (
    <div className={`flex space-x-2 ${className}`}>
      {options.map((option) => (
        <Button
          key={option.value}
          onClick={() => onValueChange(option.value)}
          className={cn(
            'group flex items-center gap-2 rounded-xl text-white/80 border-0 hover:bg-white hover:text-black',
            activeValue === option.value
              ? 'bg-white/90 text-black'
              : 'bg-input/40',
            buttonClassName,
          )}
        >
          {option.label}{' '}
          {displayStats && displayStats[option.value] !== undefined && (
            <span
              className={cn(
                'ml-1 px-2 py-0.5 rounded-md text-xs font-medium group-hover:bg-black group-hover:text-white',
                activeValue === option.value
                  ? 'bg-black text-white'
                  : 'bg-input/70',
              )}
            >
              {displayStats[option.value]}
            </span>
          )}
        </Button>
      ))}
    </div>
  );
};
