'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { type TranslationLayer, TranslationLayerEnum } from '@macgamingdb/server/schema';

interface TranslationLayerSelectProps {
  value: TranslationLayer;
  onChange: (value: string) => void;
}

const TRANSLATION_LAYER_LABELS: Record<string, string> = {
  DXVK: 'DXVK',
  DXMT: 'DXMT',
  D3D_METAL: 'D3D Metal',
  NONE: 'None / Default',
};

export function TranslationLayerSelect({ value, onChange }: TranslationLayerSelectProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">Translation Layer</label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select translation layer" />
        </SelectTrigger>
        <SelectContent>
          {TranslationLayerEnum.options.map((layer) => (
            <SelectItem key={layer} value={layer}>
              {TRANSLATION_LAYER_LABELS[layer] || layer}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
