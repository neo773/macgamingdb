import { Gamepad2, Languages, Laptop } from 'lucide-react';
import { ApiFlowDiagram } from '@/modules/blog/components/ApiFlowDiagram';

export const TranslationLayerDiagram = () => (
  <ApiFlowDiagram
    eyebrow="No copy of Windows involved"
    sourceIcon={Gamepad2}
    sourceTitle="Windows game"
    sourceSubtitle="issues Windows API calls"
    layerIcon={Languages}
    layerTitle="Translation layer"
    layerSubtitle="Windows API to macOS API"
    layerChip="CrossOver, built on Wine"
    targetIcon={Laptop}
    targetTitle="macOS"
    targetSubtitle="executes natively"
  />
);
