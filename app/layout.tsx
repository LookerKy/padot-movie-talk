import type { Metadata } from "next";
import localFont from "next/font/local";
import { LayoutWrapper } from "@/components/shared/layout-wrapper";
import { AnimatedBackground } from "@/components/ui/animated-background";
import { getSession } from "@/lib/auth";
import "./globals.css";

const cookieRun = localFont({
  src: [
    {
      path: "./fonts/CookieRunRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/CookieRunBold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/CookieRunBlack.ttf",
      weight: "900",
      style: "normal",
    },
  ],
  variable: "--font-cookie-run",
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
    <html lang="ko" className="dark">
      <body
        className={`${cookieRun.variable} antialiased min-h-screen bg-black`}
        suppressHydrationWarning
      >
        <div className="relative min-h-screen">
          {/* Background is now global but handled by LayoutWrapper generally, or kept here as fixed */}
          <AnimatedBackground />

          <LayoutWrapper user={session?.user}>
            {children}
          </LayoutWrapper>
        </div>
      </body>
    </html>
  );
}
