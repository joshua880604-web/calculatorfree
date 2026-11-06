
import SiteLink from "@/components/SiteLink";
import type { Metadata } from "next";
import { Header, Footer } from "@/components/Shell";
import BackToTop from '@/components/BackToTop';
import "./globals.css";
import "./visual-theme.css";
import "./classic-blue.css";
import './back-to-top.css';
import {themeScript} from "@/lib/theme";
import { siteConfig,siteName } from "@/lib/site";
import { browserSupportScript } from "@/lib/browser-support";
const config = siteConfig();
export const metadata: Metadata = {
  ...(config.origin ? { metadataBase: new URL(config.origin) } : {}),
  robots: { index: config.indexable, follow: true },
  icons: {
    icon: [
      { url: "/favicon.ico?v=20261027", sizes: "16x16 32x32 48x48 64x64", type: "image/x-icon" },
      { url: "/favicon-48.png?v=20261027", sizes: "48x48", type: "image/png" },
      { url: "/favicon.svg?v=20261027", sizes: "any", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico?v=20261027",
    apple: { url: "/apple-touch-icon.png?v=20261027", sizes: "180x180", type: "image/png" },
  },
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  description:
    "Free financial calculators for mortgages, loans, investments, retirement, taxes, and everyday money decisions.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
        <link rel="preload" href="/fonts/inter-latin-variable-3100e775.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <script dangerouslySetInnerHTML={{ __html: browserSupportScript }} />
        <link rel="describedby" href="/llms.txt" />
        <script
          async
          fetchPriority="low"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5145325695425659"
          crossOrigin="anonymous"
        />
      </head>
      <body>
        <SiteLink className="skip-link" href="#main">
          Skip to content
        </SiteLink>
        <p id="browser-support-notice" className="browser-support-notice" hidden suppressHydrationWarning role="status">
          Update your browser to use these calculators. On iPhone or iPad, update iOS or use a newer device.
        </p>
        <Header />
        {children}
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
