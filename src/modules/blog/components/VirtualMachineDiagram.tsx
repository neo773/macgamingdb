import { Box, Gamepad2, Laptop } from 'lucide-react';
import { DiagramIconTile } from '@/modules/blog/components/DiagramIconTile';

export const VirtualMachineDiagram = () => (
  <div>
    <div className="flex justify-center">
      <div className="rounded-full border border-white/[0.08] bg-white/[0.04] px-3.5 py-1.5 text-[11px] tracking-wide text-white/45 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)] backdrop-blur-md">
        Three layers between your game and the GPU
      </div>
    </div>

    <div className="mt-8 rounded-[26px] border border-white/[0.07] bg-white/[0.018] p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06)] backdrop-blur-md md:p-6">
      <div className="flex items-center gap-2 px-1 text-[12px] tracking-wide text-white/35">
        <Laptop className="h-3.5 w-3.5" strokeWidth={1.5} />
        macOS
      </div>

      <div className="relative mt-4">
        <div className="pointer-events-none absolute -inset-8 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.09),transparent)] blur-2xl" />
        <div className="relative rounded-[22px] bg-gradient-to-b from-white/[0.16] via-white/[0.06] to-white/[0.02] p-px shadow-[0_30px_70px_-40px_rgba(0,0,0,0.9)]">
          <div className="rounded-[21px] bg-[#0b0b0c]/85 p-4 backdrop-blur-2xl md:p-6">
            <div className="flex items-center gap-2 px-1 text-[12px] tracking-wide text-white/50">
              <Box className="h-3.5 w-3.5" strokeWidth={1.5} />
              Windows 11, running as a virtual machine
            </div>

            <div className="mt-4 rounded-[16px] border border-white/[0.09] bg-white/[0.035] py-7 text-center shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08)]">
              <DiagramIconTile icon={Gamepad2} isEmphasized />
              <div className="mt-4 text-[18px] font-medium tracking-tight text-white/90">
                Your game
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div className="mt-7 text-center text-[11px] tracking-wide text-white/25">
      Every layer takes disk, memory and frames
    </div>
  </div>
);
