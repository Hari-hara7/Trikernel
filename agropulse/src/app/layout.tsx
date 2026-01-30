import "~/styles/globals.css";

import { type Metadata } from "next";
import { cookies } from "next/headers";
import { Geist, Noto_Sans_Devanagari, Noto_Sans_Telugu, Noto_Sans_Tamil, Noto_Sans_Kannada, Noto_Sans_Malayalam, Noto_Sans_Gujarati, Noto_Sans_Gurmukhi, Noto_Sans_Bengali } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { LanguageProvider } from "~/providers/language-provider";
import { defaultLocale } from "~/i18n";
import { ServiceWorkerRegistration } from "~/components/service-worker-registration";

export const metadata: Metadata = {
  title: "AgroPulse - Agricultural Marketplace",
  description: "AI-powered agricultural marketplace connecting farmers with buyers",
  manifest: "/manifest.json",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "AgroPulse",
  },
  formatDetection: {
    telephone: false,
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: "cover",
  },
};

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const notoSansDevanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari"],
  variable: "--font-noto-devanagari",
  weight: ["400", "500", "600", "700"],
});

const notoSansTelugu = Noto_Sans_Telugu({
  subsets: ["telugu"],
  variable: "--font-noto-telugu",
  weight: ["400", "500", "600", "700"],
});

const notoSansTamil = Noto_Sans_Tamil({
  subsets: ["tamil"],
  variable: "--font-noto-tamil",
  weight: ["400", "500", "600", "700"],
});

const notoSansKannada = Noto_Sans_Kannada({
  subsets: ["kannada"],
  variable: "--font-noto-kannada",
  weight: ["400", "500", "600", "700"],
});

const notoSansMalayalam = Noto_Sans_Malayalam({
  subsets: ["malayalam"],
  variable: "--font-noto-malayalam",
  weight: ["400", "500", "600", "700"],
});

const notoSansGujarati = Noto_Sans_Gujarati({
  subsets: ["gujarati"],
  variable: "--font-noto-gujarati",
  weight: ["400", "500", "600", "700"],
});

const notoSansGurmukhi = Noto_Sans_Gurmukhi({
  subsets: ["gurmukhi"],
  variable: "--font-noto-gurmukhi",
  weight: ["400", "500", "600", "700"],
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-bengali",
  weight: ["400", "500", "600", "700"],
});

const fontMap = {
  en: geist.variable,
  hi: notoSansDevanagari.variable,
  mr: notoSansDevanagari.variable,
  te: notoSansTelugu.variable,
  ta: notoSansTamil.variable,
  kn: notoSansKannada.variable,
  ml: notoSansMalayalam.variable,
  gu: notoSansGujarati.variable,
  pa: notoSansGurmukhi.variable,
  bn: notoSansBengali.variable,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || defaultLocale;
  const fontClass = fontMap[locale as keyof typeof fontMap] || geist.variable;

  return (
    <html lang={locale} className={fontClass}>
      <head>
        <meta name="theme-color" content="#10b981" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="AgroPulse" />
      </head>
      <body>
        <TRPCReactProvider>
          <LanguageProvider>
            <ServiceWorkerRegistration />
            {children}
          </LanguageProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
