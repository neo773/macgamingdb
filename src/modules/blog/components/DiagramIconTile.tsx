import type { LucideIcon } from 'lucide-react';
import { cn } from 'macgamingdb-ui/utilities/cn';

type DiagramIconTileProps = {
  icon: LucideIcon;
  isEmphasized?: boolean;
};

export const DiagramIconTile = ({
  icon,
  isEmphasized = false,
}: DiagramIconTileProps) => {
  const IconComponent = icon;

  return (
    <div
      className={cn(
        'mx-auto flex h-10 w-10 items-center justify-center rounded-[13px] border border-white/[0.09] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.10)]',
        isEmphasized
          ? 'bg-white/[0.09] text-white/90'
          : 'bg-white/[0.04] text-white/55',
      )}
    >
      <IconComponent className="h-[18px] w-[18px]" strokeWidth={1.5} />
    </div>
  );
};
