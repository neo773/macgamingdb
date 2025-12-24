'use client';

import React, { useState, useMemo, memo } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Check,
  ChevronDown,
  ChevronLeft,
  Cpu,
  Gpu,
  InfoIcon,
  MemoryStick,
  Search,
} from 'lucide-react';
import { cn } from '@/components/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import type { inferRouterOutputs } from '@trpc/server';

import { type AppRouter } from '@macgamingdb/server/routers/_app';
import { trpc } from '@/lib/trpc/provider';

export type MacConfig =
  inferRouterOutputs<AppRouter>['review']['getMacConfigs'][number];

interface SelectMacConfigurationProps {
  selectedConfigIdentifier: string;
  onSelect: (config: MacConfig) => void;
  onBack: () => void;
}

export const getDeviceIcon = (family: string) => {
  return `/images/devices/${family}.svg`;
};

export const getHumanReadableFamily = (family: string) => {
  switch (family) {
    case 'MacBookPro':
      return 'MacBook Pro';
    case 'MacBookAir':
      return 'MacBook Air';
    case 'MacBook':
      return 'MacBook';
    case 'iMac':
      return 'iMac';
    case 'MacMini':
      return 'Mac mini';
    case 'MacPro':
      return 'Mac Pro';
    case 'MacStudio':
      return 'Mac Studio';
    default:
      return family;
  }
};

const MacConfigSkeleton = memo(() => (
  <div className="w-full p-4 rounded-lg border border-border">
    <div className="flex items-center gap-4">
      <Skeleton className="w-12 h-12 rounded" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </div>
  </div>
));

const MacConfigGroupSkeleton = memo(() => (
  <div className="py-3">
    <Skeleton className="h-4 w-24 mb-3" />
    <div className="grid gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <MacConfigSkeleton key={i} />
      ))}
    </div>
  </div>
));

const LoadingState = memo(() => (
  <div className="space-y-6">
    {Array.from({ length: 3 }).map((_, i) => (
      <MacConfigGroupSkeleton key={i} />
    ))}
  </div>
));

const NoResultsState = memo(() => (
  <div className="flex items-center justify-center py-8">
    <p className="text-muted-foreground">No Mac configurations found</p>
  </div>
));

const MacConfigGuide = memo(() => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-gray-500/10 to-gray-500/5 border  dark:border-white/10 rounded-xl p-4 backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 from-gray-200 to-gray-400 bg-gradient-to-br rounded-lg flex items-center justify-center mt-0.5">
          <InfoIcon className="h-4 w-4 text-gray-900" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100 mb-1">
            Not sure which Mac you have?
          </h3>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-sm text-muted-foreground hover:text-gray-100 transition-colors flex items-center gap-1 group"
          >
            Follow these steps
            <ChevronDown
              className={cn(
                'h-3 w-3 transition-transform group-hover:scale-110',
                isExpanded && 'rotate-180'
              )}
            />
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 space-y-6 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full text-xs flex items-center justify-center mt-0.5 font-semibold shadow-sm">
                1
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Click the Apple{'\u2122'} icon in the top-left corner
              </span>
            </div>
            <div className="ml-9">
              <img
                src="/images/guide/how-find-specs/1.jpeg"
                className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow"
                alt="Click Apple icon"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full text-xs flex items-center justify-center mt-0.5 font-semibold shadow-sm">
                2
              </span>
              <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                Select "About This Mac"
              </span>
            </div>
            <div className="ml-9">
              <img
                src="/images/guide/how-find-specs/2.jpeg"
                className="w-full max-w-md rounded-lg border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg transition-shadow"
                alt="Click About This Mac"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

interface MacConfigCardProps {
  config: MacConfig;
  isSelected: boolean;
  onSelect: (config: MacConfig) => void;
}

const MacConfigCard = memo(
  ({ config, isSelected, onSelect }: MacConfigCardProps) => (
    <button
      type="button"
      onClick={() => onSelect(config)}
      className={cn(
        'w-full p-4 rounded-lg border text-left transition-colors hover:bg-blue-500/10 hover:border-blue-500',
        isSelected ? 'border-blue-500 bg-blue-500/10' : 'border-border'
      )}
    >
      <div className="flex items-center gap-4">
        {/* Device Icon */}
        <div className="flex-shrink-0">
          <img
            src={getDeviceIcon(config.metadata.family)}
            alt={`${config.metadata.chip} ${config.metadata.chipVariant}`}
            className="w-12 h-12 object-contain opacity-80"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>

        {/* Mac Info */}
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm truncate">
            {config.metadata.family} {config.metadata.chip}{' '}
            {config.metadata.chipVariant === 'BASE'
              ? ''
              : config.metadata.chipVariant}{' '}
            {config.metadata.year}
          </h4>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <div className="flex items-center gap-1 px-2 py-1 bg-input text-white rounded-full text-xs">
              <Cpu className="w-3 h-3" />
              <span>{config.metadata.cpuCores}C CPU</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-input text-white rounded-full text-xs">
              <Gpu className="w-3 h-3" />
              <span>{config.metadata.gpuCores}C GPU</span>
            </div>
            <div className="flex items-center gap-1 px-2 py-1 bg-input text-white rounded-full text-xs">
              <MemoryStick className="w-3 h-3" />
              <span>{config.metadata.ram}GB RAM</span>
            </div>
          </div>
        </div>

        {/* Selection Indicator */}
        {isSelected && <Check className="h-5 w-5 text-primary flex-shrink-0" />}
      </div>
    </button>
  )
);

interface MacConfigGroupProps {
  familyKey: string;
  configs: MacConfig[];
  selectedConfigIdentifier: string;
  onSelect: (config: MacConfig) => void;
}

const MacConfigGroup = memo(
  ({
    familyKey,
    configs,
    selectedConfigIdentifier,
    onSelect,
  }: MacConfigGroupProps) => (
    <div className="py-3">
      <h3 className="text-sm font-medium text-muted-foreground mb-3 tracking-wide">
        {getHumanReadableFamily(familyKey)}
      </h3>
      <div className="grid gap-3">
        {configs.map((config) => (
          <MacConfigCard
            key={config.identifier}
            config={config}
            isSelected={selectedConfigIdentifier === config.identifier}
            onSelect={onSelect}
          />
        ))}
      </div>
    </div>
  )
);

interface HeaderProps {
  onBack: () => void;
}

const Header = memo(({ onBack }: HeaderProps) => (
  <div className="flex items-center gap-3">
    <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
      <ChevronLeft className="h-5 w-5" />
    </Button>
    <div className="flex-1">
      <h2 className="text-lg font-semibold">Select Mac Configuration</h2>
      <p className="text-sm text-muted-foreground">
        Choose your Mac model to share accurate performance data
      </p>
    </div>
  </div>
));

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

const SearchBar = memo(
  ({
    value,
    onChange,
    isSearching,
  }: SearchBarProps & { isSearching?: boolean }) => (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        placeholder="Search Mac models, chipsets..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="pl-10 rounded-full"
      />
      {isSearching && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b border-muted-foreground"></div>
        </div>
      )}
    </div>
  )
);

export default function SelectMacConfiguration({
  selectedConfigIdentifier,
  onSelect,
  onBack,
}: SelectMacConfigurationProps) {
  const [macConfigSearch, setMacConfigSearch] = useState('');

  const {
    data: macConfigs = [],
    isLoading: macConfigsLoading,
    isFetching: macConfigsFetching,
  } = trpc.review.getMacConfigs.useQuery(
    {
      search: macConfigSearch.trim(),
      selectedConfigIdentifier,
    },
    {
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5,
    }
  );

  const groupedConfigs = useMemo(() => {
    const groups: Record<string, MacConfig[]> = {};

    for (const config of macConfigs) {
      const family = config.metadata.family;
      if (!groups[family]) groups[family] = [];
      groups[family].push(config);
    }

    return groups;
  }, [macConfigs]);

  const handleMacConfigSelect = (config: MacConfig) => {
    onSelect(config);
    setMacConfigSearch('');
  };

  const renderContent = () => {
    if (macConfigsLoading && macConfigs.length === 0) {
      return <LoadingState />;
    }

    if (macConfigs.length === 0 && !macConfigsLoading) {
      return <NoResultsState />;
    }

    return (
      <>
        {Object.entries(groupedConfigs).map(([familyKey, configs]) => (
          <MacConfigGroup
            key={familyKey}
            familyKey={familyKey}
            configs={configs}
            selectedConfigIdentifier={selectedConfigIdentifier}
            onSelect={handleMacConfigSelect}
          />
        ))}
      </>
    );
  };

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
      className="absolute inset-0 px-4 md:px-0 flex flex-col gap-3"
    >
      <Header onBack={onBack} />
      <SearchBar
        value={macConfigSearch}
        onChange={setMacConfigSearch}
        isSearching={macConfigsFetching && macConfigs.length > 0}
      />
      <hr />
      <ScrollArea className="flex-1 min-h-0">
        <MacConfigGuide />

        {renderContent()}
      </ScrollArea>
    </motion.div>
  );
}
