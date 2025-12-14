'use client';

const GraphIcon = () => (
  <svg
    className="w-12 h-12 text-blue-600"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
    />
  </svg>
);

export const AdSpaceAvailableBanner = () => {
  return (
    <div className="relative">
      <div className="relative overflow-hidden rounded-2xl h-[400px] backdrop-blur-xl bg-white/5 border border-white/10 shadow-lg">
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-8">
          {/* Graph Icon */}
          <div className="mb-8 w-16 h-16 rounded-full bg-blue-600/10 flex items-center justify-center">
            <GraphIcon />
          </div>

          {/* Headline */}
          <h1 className="font-semibold text-3xl text-white mb-3 tracking-tight leading-tight">
            Your Ad Could Be Here
          </h1>

          {/* Description */}
          <p className="text-gray-400 text-base mb-8 max-w-sm leading-relaxed font-normal">
            Reach Apple users across the US, UK, and EU
          </p>

          {/* CTA Button */}
          <a
            href="mailto:info@macgamingdb.app"
            className="inline-flex items-center justify-center rounded-full px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95 shadow-md"
          >
            Contact Us
          </a>
        </div>
      </div>
    </div>
  );
};
