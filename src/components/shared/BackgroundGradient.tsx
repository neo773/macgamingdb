'use client';

export function BackgroundGradient() {
  return (
    <div className="hidden md:block fixed inset-0 w-full h-full z-0 pointer-events-none overflow-hidden grayscale-100">
      <div
        className="absolute top-0 left-0"
        style={{
          transform: 'translateY(-350px) rotate(-45deg)',
          width: 560,
          height: '200vh',
          background:
            'radial-gradient(68.54% 68.72% at 55.02% 31.46%, rgba(179, 217, 255, 0.08) 0px, rgba(26, 140, 255, 0.02) 50%, rgba(0, 115, 230, 0) 80%)',
        }}
      />
      <div
        className="absolute top-0 left-0"
        style={{
          transform: 'rotate(-45deg) translate(5%, -50%)',
          transformOrigin: 'left top',
          width: 240,
          height: '200vh',
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(179, 217, 255, 0.06) 0px, rgba(26, 140, 255, 0.02) 80%, transparent 100%)',
        }}
      />
      <div
        className="absolute top-0 left-0"
        style={{
          borderRadius: 20,
          transform: 'rotate(-45deg) translate(-180%, -70%)',
          transformOrigin: 'left top',
          width: 240,
          height: '200vh',
          background:
            'radial-gradient(50% 50% at 50% 50%, rgba(179, 217, 255, 0.04) 0px, rgba(0, 115, 230, 0.02) 80%, transparent 100%)',
        }}
      />
    </div>
  );
}
