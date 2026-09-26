import { SiteHeader } from "@/components/site-header";
import { Toaster } from "@/components/toaster";
import { AppProviders } from "@/store/providers";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Product Dashboard",
  description: "Browse, search, filter, and manage products.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script
          id="theme-init"
          strategy="beforeInteractive"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: static no-flash bootstrap, zero interpolation
          dangerouslySetInnerHTML={{
            __html: `(function(){var bg="#F4F4F0";try{var s=localStorage.getItem("theme-v1");var m=s?JSON.parse(s):null;if(m!=="dark"&&m!=="light"){m=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light";}var d=document.documentElement;d.classList.toggle("dark",m==="dark");d.style.colorScheme=m;bg=m==="dark"?"#0A0A0A":"#F4F4F0";}catch(e){}document.documentElement.style.backgroundColor=bg;})();`,
          }}
        />
        <AppProviders>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:inline-flex focus:min-h-[44px] focus:items-center focus:rounded-sm focus:bg-surface focus:px-4 focus:py-2 focus:text-sm focus:font-medium"
          >
            Skip to content
          </a>
          <SiteHeader />
          <div
            id="main-content"
            tabIndex={-1}
            className="flex min-h-0 flex-1 flex-col focus:outline-none"
          >
            {children}
          </div>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
