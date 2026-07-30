import { Code2, Cpu, Zap } from 'lucide-react';
import { ApiFlowDiagram } from '@/modules/blog/components/ApiFlowDiagram';

export const GraphicsTranslationDiagram = () => (
  <ApiFlowDiagram
    eyebrow="Every draw call, every frame"
    sourceIcon={Code2}
    sourceTitle="DirectX"
    sourceSubtitle="what the game speaks"
    layerIcon={Zap}
    layerTitle="DXMT / D3DMetal"
    layerSubtitle="converted in place"
    layerChip="No intermediate API"
    targetIcon={Cpu}
    targetTitle="Metal"
    targetSubtitle="what the GPU speaks"
  />
);
