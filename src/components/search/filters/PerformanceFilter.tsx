import React from "react";
import { ButtonFilter } from "../../ui/button-filter";
import { PerformanceEnum } from "@/server/schema";
import { PerformanceFilter as PerformanceFilterType } from "@/lib/constants";

interface PerformanceFilterProps {
  activeFilter: PerformanceFilterType;
  onFilterChange: (filter: PerformanceFilterType) => void;
  displayStats?: Record<string, number>;
  formatRatingLabel: (rating: string) => string;
  className?: string;
}

export const PerformanceFilter: React.FC<PerformanceFilterProps> = ({
  activeFilter,
  onFilterChange,
  displayStats,
  formatRatingLabel,
  className = "",
}) => {
  const performanceOptions = (["ALL", ...PerformanceEnum.options] as const).map((rating) => ({
    value: rating,
    label: formatRatingLabel(rating),
  }));

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