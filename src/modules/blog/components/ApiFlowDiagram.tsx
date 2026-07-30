import type { LucideIcon } from 'lucide-react';
import { ApiFlowConnector } from '@/modules/blog/components/ApiFlowConnector';
import { ApiFlowPanel } from '@/modules/blog/components/ApiFlowPanel';
import { DiagramIconTile } from '@/modules/blog/components/DiagramIconTile';

type ApiFlowDiagramProps = {
  eyebrow: string;
  sourceIcon: LucideIcon;
  sourceTitle: string;
  sourceSubtitle: string;
  layerIcon: LucideIcon;
  layerTitle: string;
  layerSubtitle: string;
  layerChip: string;
  targetIcon: LucideIcon;
  targetTitle: string;
  targetSubtitle: string;
};

export const ApiFlowDiagram = ({
  eyebrow,
  sourceIcon,
  sourceTitle,
  sourceSubtitle,
  layerIcon,
  layerTitle,
  layerSubtitle,
  layerChip,
  targetIcon,
  targetTitle,
  targetSubtitle,
}: ApiFlowDiagramProps) => (
  <div>
    <div className="flex justify-center">
      <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-[11px] tracking-wide text-white/45 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md">
        {eyebrow}
      </div>
    </div>

    <div className="mt-8 flex flex-col items-stretch md:flex-row md:items-center">
      <ApiFlowPanel
        icon={sourceIcon}
        title={sourceTitle}
        subtitle={sourceSubtitle}
      />

      <ApiFlowConnector />

      <div className="relative flex-[1.4]">
        <div className="pointer-events-none absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.13),transparent)] blur-2xl" />
        <div className="relative rounded-[24px] bg-gradient-to-b from-white/[0.24] via-white/[0.09] to-white/[0.03] p-px shadow-[0_34px_80px_-40px_rgba(0,0,0,0.95)]">
          <div className="rounded-[23px] bg-[#0b0b0c]/85 px-6 py-8 text-center backdrop-blur-2xl">
            <DiagramIconTile icon={layerIcon} isEmphasized />
            <div className="mt-4 text-[18px] font-medium tracking-tight text-white/95">
              {layerTitle}
            </div>
            <div className="mt-1.5 text-[13px] text-white/45">
              {layerSubtitle}
            </div>
            <div className="mt-5 inline-flex rounded-full border border-white/[0.09] bg-white/[0.04] px-3.5 py-1.5 text-[11px] tracking-wide text-white/55 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
              {layerChip}
            </div>
          </div>
        </div>
      </div>

      <ApiFlowConnector />

      <ApiFlowPanel
        icon={targetIcon}
        title={targetTitle}
        subtitle={targetSubtitle}
      />
    </div>
  </div>
);
