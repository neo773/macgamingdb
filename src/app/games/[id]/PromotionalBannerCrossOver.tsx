'use client';

const CheckIcon = () => (
  <svg
    className="w-4 h-4 text-green-400"
    fill="currentColor"
    viewBox="0 0 20 20"
  >
    <path
      fillRule="evenodd"
      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
      clipRule="evenodd"
    />
  </svg>
);

const Feature = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-2">
    <CheckIcon />
    <span>{children}</span>
  </div>
);

const GradientText = ({
  children,
  color = 'white',
  className = '',
}: {
  children: React.ReactNode;
  color?: 'white' | 'cyan' | 'blue';
  className?: string;
}) => {
  const colorMap = {
    white: 'from-gray-100 to-gray-300',
    cyan: 'from-cyan-300 to-cyan-500',
    blue: 'from-blue-300 to-blue-500',
  };

  return (
    <span
      className={`bg-gradient-to-r ${colorMap[color]} bg-clip-text text-transparent ${className}`}
    >
      {children}
    </span>
  );
};

export const PromotionalBannerCrossOver = () => {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-3xl h-[400px] promotional-banner-border border border-transparent animate-border shadow-2xl shadow-[#00B6DC]/15">
        {/* Background effects */}
        <div className="absolute inset-0">
          {/* Main gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />

          {/* Geometric grid lines */}
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-0 left-1/4 w-px h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent" />
            <div className="absolute top-0 right-1/4 w-px h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent" />
            <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent" />
            <div className="absolute bottom-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-400 to-transparent" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          {/* Logo */}
          <img
            src="/images/promotions/crossover-logo.png"
            alt="CrossOver"
            className="h-14 mb-6 drop-shadow-lg filter invert"
          />

          {/* Headline */}
          <header className="mb-6">
            <h1 className="font-extrabold text-2xl mb-1 tracking-wider">
              <GradientText>PLAY</GradientText>
              <GradientText color="cyan" className="mx-2 glow-text">
                WINDOWS
              </GradientText>
              <GradientText>GAMES</GradientText>
            </h1>
            <h2 className="font-extrabold text-2xl tracking-wider">
              <GradientText>ON</GradientText>
              <GradientText color="blue" className="mx-2 glow-text">
                MAC
              </GradientText>
            </h2>
          </header>

          {/* Features */}
          <div className="text-gray-300 mb-6 space-y-1">
            <Feature>Native gameplay, no cloud streaming</Feature>
            <Feature>15% OFF with exclusive code <b>MGDB15</b></Feature>
            <Feature>14 Days Free Trial</Feature>
          </div>

          {/* CTA Button */}
          <a
            href="https://www.codeweavers.com/store?ad=1100;deal=MGDB15"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-black font-bold text-sm border border-cyan-400 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-400/40 relative overflow-hidden group"
          >
            <span className="relative z-10 bg-gradient-to-b from-white to-gray-300 bg-clip-text text-transparent">
              START FREE TRIAL
            </span>
            <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
          </a>

          {/* Affiliate disclosure */}
          <p className="text-[10px] text-gray-500 mt-4 max-w-xs leading-tight">
          *Affiliate link. Supports this site & Mac gaming through CodeWeavers' contributions to Wine.
          </p>
        </div>

        {/* Simple grey border */}
        <div className="absolute inset-0 rounded-3xl border border-[#252525] pointer-events-none" />
      </div>
    </div>
  );
};
