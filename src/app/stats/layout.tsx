export default function StatsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="bg-[#0A0A0A]">{children}</div>
      </body>
    </html>
  );
}
