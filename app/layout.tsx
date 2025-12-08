import type { Metadata } from "next";
import localFont from "next/font/local";
import { Header } from "@/components/shared/header";
import { AnimatedBackground } from "@/components/ui/animated-background";
import "./globals.css";

const cookieRun = localFont({
  src: [
    {
      path: "./fonts/CookieRunRegular.ttf",
      weight: "100",
      style: "normal",
    },
    {
      path: "./fonts/CookieRunRegular.ttf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/CookieRunRegular.ttf",
      weight: "300",
      style: "normal",
    },
    {
      path: "./fonts/CookieRunRegular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/CookieRunBold.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/CookieRunBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/CookieRunBold.ttf",
      weight: "700",
      style: "normal",
    },
    {
      path: "./fonts/CookieRunBold.ttf",
      weight: "800",
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

import { getSession } from "@/lib/auth";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();

  return (
    <html lang="ko">
      <body
        className={`${cookieRun.variable} antialiased min-h-screen bg-slate-50 dark:bg-slate-950`}
        suppressHydrationWarning
      >
        <div className="relative min-h-screen text-slate-100">
          <AnimatedBackground />



          <Header user={session?.user} />

          <main className="relative z-10 pt-32 px-4 pb-12 max-w-7xl mx-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
