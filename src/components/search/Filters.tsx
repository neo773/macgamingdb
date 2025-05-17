import React from "react";
import { PerformanceEnum } from "@/server/schema";
import { cn } from "../utils";
import { Button } from "../ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { PerformanceFilter } from "@/lib/constants";

interface FiltersProps {
  selectedChipset: string;
  activeFilter: string;
  displayStats: Record<string, number>;
  chipsetOptions: { value: string; label: string; count: number }[];
  handleFilterChange: (filter: PerformanceFilter) => void;
  handleChipsetChange: (value: string) => void;
  formatRatingLabel: (rating: string) => string;
}

const Filters = ({
  selectedChipset,
  handleChipsetChange,
  activeFilter,
  handleFilterChange,
  displayStats,
  chipsetOptions,
  formatRatingLabel,
}: FiltersProps) => {
  return (
    <>
      <Select value={selectedChipset} onValueChange={handleChipsetChange}>
        <SelectTrigger className="flex items-center gap-2 rounded-xl border-2">
          <SelectValue placeholder="Select Chipset" />
        </SelectTrigger>
        <SelectContent className="bg-[#171717e0] backdrop-blur-md">
          {chipsetOptions
            .map((option) => (
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
      {(["ALL", ...PerformanceEnum.options] as const).map((rating) => (
        <Button
          key={rating}
          onClick={() => handleFilterChange(rating)}
          className={cn(
            "group flex items-center gap-2 rounded-xl text-white/80 border-0 hover:bg-white hover:text-black",
            activeFilter === rating ? "bg-white/90 text-black" : "bg-input/40"
          )}
        >
          {formatRatingLabel(rating)}{" "}
          {displayStats && displayStats[rating] !== undefined && (
            <span
              className={cn(
                "ml-1 px-2 py-0.5 rounded-md text-xs font-medium group-hover:bg-black group-hover:text-white",
                activeFilter === rating ? "bg-black text-white" : "bg-input/70"
              )}
            >
              {displayStats[rating]}
            </span>
          )}
        </Button>
      ))}
    </>
  );
};

export default Filters;
