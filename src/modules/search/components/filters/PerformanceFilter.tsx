import React from 'react';
import { ButtonFilter } from 'macgamingdb-ui/input/ButtonFilter';
import { PERFORMANCE_RATINGS } from 'macgamingdb-server/schema/constants';
import { type PerformanceFilter as PerformanceFilterType } from '@/modules/search/types/PerformanceFilter';
import { type PerformanceLabel } from 'macgamingdb-server/modules/review/utils/format-rating-label';

interface PerformanceFilterProps {
  activeFilter: PerformanceFilterType;
  onFilterChange: (filter: PerformanceFilterType) => void;
  displayStats?: Record<string, number>;
  formatRatingLabel: (rating: PerformanceLabel) => string;
  className?: string;
}

export const PerformanceFilter: React.FC<PerformanceFilterProps> = ({
  activeFilter,
  onFilterChange,
  displayStats,
  formatRatingLabel,
  className = '',
}) => {
  const performanceOptions = (['ALL', ...PERFORMANCE_RATINGS] as const).map(
    (rating) => ({
      value: rating,
      label: formatRatingLabel(rating as PerformanceLabel),
    }),
  );

  const handleValueChange = (value: string) => {
    onFilterChange(value as PerformanceFilterType);
  };

  return (
    <ButtonFilter
      activeValue={activeFilter}
      options={performanceOptions}
      onValueChange={handleValueChange}
      displayStats={displayStats}
      className={className}
    />
  );
};
