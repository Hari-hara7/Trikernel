// i18n configuration - client-safe exports only
// Server-side config moved to avoid "next/headers" import in client components

export const locales = ['en', 'hi', 'mr', 'gu', 'pa', 'ta', 'te', 'kn', 'bn', 'ml'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, { name: string; nativeName: string }> = {
  en: { name: 'English', nativeName: 'English' },
  hi: { name: 'Hindi', nativeName: 'हिंदी' },
  mr: { name: 'Marathi', nativeName: 'मराठी' },
  gu: { name: 'Gujarati', nativeName: 'ગુજરાતી' },
  pa: { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ' },
  ta: { name: 'Tamil', nativeName: 'தமிழ்' },
  te: { name: 'Telugu', nativeName: 'తెలుగు' },
  kn: { name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  bn: { name: 'Bengali', nativeName: 'বাংলা' },
  ml: { name: 'Malayalam', nativeName: 'മലയാളം' },
};
