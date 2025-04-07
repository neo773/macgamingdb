import type { Metadata } from "next";
import { ThemeProvider } from "@/components/theme-provider";
import { headers } from "next/headers";
import { Inter } from "next/font/google";
import "./globals.css";
import { TRPCProvider } from "@/lib/trpc/provider";
import { Toaster } from "@/components/ui/sonner"
import { AuthProvider } from "@/context/AuthContext";

// const inter = Inter({ subsets: ["latin"] });

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
      <body >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <TRPCProvider headers={headersObj}>
            <AuthProvider>
              {children}
            </AuthProvider>
          </TRPCProvider>
          <Toaster/>
        </ThemeProvider>
      </body>
    </html>
  );
}
