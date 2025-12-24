'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  type Performance,
  type GraphicsSettings,
  PerformanceEnum,
  GraphicsSettingsEnum,
} from '@macgamingdb/server/schema';
import { transformPerformanceRating } from '../../utils';

interface PerformanceFieldsProps {
  performance: Performance;
  fps: string;
  graphicsSettings: GraphicsSettings;
  resolution: string;
  onSelectChange: (name: string, value: string) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const GRAPHICS_LABELS: Record<string, string> = {
  ULTRA: 'Ultra',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export function PerformanceFields({
  performance,
  fps,
  graphicsSettings,
  resolution,
  onSelectChange,
  onInputChange,
}: PerformanceFieldsProps) {
  return (
    <>
      <div className="space-y-2">
        <label className="block text-sm font-medium">Performance Rating</label>
        <Select
          value={performance}
          onValueChange={(value) => onSelectChange('performance', value)}
          required
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select performance rating" />
          </SelectTrigger>
          <SelectContent>
            {PerformanceEnum.options.map((rating) => (
              <SelectItem key={rating} value={rating}>
                {transformPerformanceRating(rating)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">FPS (optional)</label>
        <Input
          type="number"
          name="fps"
          value={fps}
          onChange={onInputChange}
          placeholder="e.g. 60"
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Graphics Settings</label>
        <Select
          value={graphicsSettings}
          onValueChange={(value) => onSelectChange('graphicsSettings', value)}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select graphics settings" />
          </SelectTrigger>
          <SelectContent>
            {GraphicsSettingsEnum.options.map((setting) => (
              <SelectItem key={setting} value={setting}>
                {GRAPHICS_LABELS[setting] || setting}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium">Resolution (optional)</label>
        <Input
          type="text"
          name="resolution"
          value={resolution}
          onChange={onInputChange}
          placeholder="e.g. 1920x1080"
        />
      </div>
    </>
  );
}
