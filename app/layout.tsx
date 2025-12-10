import type { Metadata } from "next";
import localFont from "next/font/local";
import { Noto_Sans_KR } from "next/font/google";
import { LayoutWrapper } from "@/components/shared/layout-wrapper";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { getSession } from "@/lib/auth";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["100", "300", "400", "500", "700", "900"],
  variable: "--font-noto-sans-kr",
});

export const metadata: Metadata = {
  title: "Padot Movie Awards",
  description: "Movie reviews and calendar for Padot",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${notoSansKr.variable} antialiased min-h-screen text-foreground transition-colors duration-300`}
        suppressHydrationWarning
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <div className="relative min-h-screen">
            <AnimatedBackground />

            <LayoutWrapper user={session?.user}>
              {children}
            </LayoutWrapper>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
