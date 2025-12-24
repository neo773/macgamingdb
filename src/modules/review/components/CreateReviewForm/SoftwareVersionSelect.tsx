'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type PlayMethod, SOFTWARE_VERSIONS } from '@macgamingdb/server/schema';

interface SoftwareVersionSelectProps {
  playMethod: PlayMethod;
  softwareVersion: string;
  customVersion: boolean;
  customVersionValue: string;
  onVersionChange: (value: string) => void;
  onCustomVersionChange: (value: string) => void;
  onCustomVersionCancel: () => void;
}

export function SoftwareVersionSelect({
  playMethod,
  softwareVersion,
  customVersion,
  customVersionValue,
  onVersionChange,
  onCustomVersionChange,
  onCustomVersionCancel,
}: SoftwareVersionSelectProps) {
  if (playMethod !== 'CROSSOVER' && playMethod !== 'PARALLELS') {
    return <div></div>;
  }

  const versions =
    playMethod === 'CROSSOVER' ? SOFTWARE_VERSIONS.CROSSOVER : SOFTWARE_VERSIONS.PARALLELS;

  return (
    <div className="flex flex-col justify-center space-y-2">
      <label className="block text-sm font-medium">Software Version</label>
      {!customVersion ? (
        <div>
          <Select value={softwareVersion} onValueChange={onVersionChange}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select software version" />
            </SelectTrigger>
            <SelectContent>
              {versions.map((version: string) => (
                <SelectItem key={version} value={version}>
                  {version}
                </SelectItem>
              ))}
              <SelectItem key="custom" value="custom">
                Custom version...
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : (
        <div className="flex space-x-2 items-center">
          <Input
            type="text"
            value={customVersionValue}
            onChange={(e) => onCustomVersionChange(e.target.value)}
            placeholder={playMethod === 'CROSSOVER' ? 'e.g., 25.1' : 'e.g., 19.1'}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={onCustomVersionCancel}>
            Cancel
          </Button>
        </div>
      )}
    </div>
  );
}
