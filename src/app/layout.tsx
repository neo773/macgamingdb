import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { headers } from "next/headers";
import { Geist } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";
import { Toaster } from "@/components/ui/sonner";

const GeistMono = Geist({ subsets: ["latin"], weight: ["400", "500"] });

export const metadata: Metadata = {
  title: "Mac Gaming DB",
  description: "Database of games for Mac",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Forward headers from the browser to the API
  const headersList = await headers();
  const headersObj: Record<string, string> = {};

  headersList.forEach((value, key) => {
    headersObj[key] = value;
  });

  return (
    <html lang="en">
      <body className={`${GeistMono.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCProvider headers={headersObj}>
            {children}
          </TRPCProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
