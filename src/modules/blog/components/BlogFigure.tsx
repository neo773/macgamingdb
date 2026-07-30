type BlogFigureProps = {
  caption: string;
  children: React.ReactNode;
};

export const BlogFigure = ({ caption, children }: BlogFigureProps) => (
  <figure className="relative my-12 overflow-hidden rounded-[28px] border border-white/[0.06] bg-[#070708] px-4 py-12 md:px-10 md:py-14">
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <div className="absolute -top-[60%] left-[38%] h-[160%] w-[70%] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.11),transparent_68%)] blur-3xl" />
      <div className="absolute -bottom-[50%] right-[6%] h-[110%] w-[45%] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.05),transparent_70%)] blur-3xl" />
      <div className="absolute top-[26%] -left-[25%] h-px w-[150%] -rotate-[7deg] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
      <div className="absolute top-[72%] -left-[25%] h-px w-[150%] -rotate-[4deg] bg-gradient-to-r from-transparent via-white/[0.05] to-transparent" />
      <div className="absolute inset-0 bg-[linear-gradient(118deg,transparent_38%,rgba(255,255,255,0.035)_52%,transparent_64%)]" />
    </div>

    <div className="relative">{children}</div>

    <figcaption className="relative mx-auto mt-9 max-w-md text-center text-[13px] leading-relaxed text-white/35 not-italic">
      {caption}
    </figcaption>
  </figure>
);
