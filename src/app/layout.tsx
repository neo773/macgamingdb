import type { Metadata } from "next";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Mac Gaming DB",
  description: "Database of games for Mac",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Forward headers from the browser to the API
  const headersList = headers();
  const headersObj: Record<string, string> = {};
  
  headersList.forEach((value, key) => {
    headersObj[key] = value;
  });
  
  return (
    <html lang="en">
      <body className={inter.className}>
        <TRPCProvider headers={headersObj}>
          {children}
        </TRPCProvider>
      </body>
    </html>
  );
}
