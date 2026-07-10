const StatsLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html>
      <body>
        <div className="bg-[#0A0A0A]">{children}</div>
      </body>
    </html>
  );
};

export default StatsLayout;
