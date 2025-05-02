import type { Metadata } from "next";
import { headers } from "next/headers";
import { Geist } from "next/font/google";
import { TRPCProvider } from "@/lib/trpc/provider";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

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
      <meta
        name="google-site-verification"
        content="ZHuErRXhH2hBeyHfh9ieBXRVc6W19dktrLaCK-_dmDc"
      />
      <meta name="google-adsense-account" content="ca-pub-4009451848051361" />
      <body className={`${GeistMono.className} dark`}>
        <TRPCProvider headers={headersObj}>{children}</TRPCProvider>
        <Toaster />
      </body>
    </html>
  );
}
