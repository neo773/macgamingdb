import type { LucideIcon } from 'lucide-react';
import { DiagramIconTile } from '@/modules/blog/components/DiagramIconTile';

type ApiFlowPanelProps = {
  icon: LucideIcon;
  title: string;
  subtitle: string;
};

export const ApiFlowPanel = ({ icon, title, subtitle }: ApiFlowPanelProps) => (
  <div className="flex-1 rounded-[22px] border border-white/[0.07] bg-white/[0.022] px-6 py-7 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.07)] backdrop-blur-md">
    <DiagramIconTile icon={icon} />
    <div className="mt-4 text-[17px] font-medium tracking-tight text-white/85">
      {title}
    </div>
    <div className="mt-1.5 text-[13px] text-white/35">{subtitle}</div>
  </div>
);
