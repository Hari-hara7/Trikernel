"use client";

import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { type Locale, locales, defaultLocale, localeNames } from "~/i18n";


import enMessages from "~/messages/en.json";
import hiMessages from "~/messages/hi.json";
import mrMessages from "~/messages/mr.json";
import teMessages from "~/messages/te.json";
import knMessages from "~/messages/kn.json";
import taMessages from "~/messages/ta.json";
import mlMessages from "~/messages/ml.json";

type Messages = typeof enMessages;

const messages: Record<Locale, Messages> = {
  en: enMessages,
  hi: hiMessages,
  mr: mrMessages,
  te: teMessages,
  kn: knMessages,
  ta: taMessages,
  ml: mlMessages,
 
  gu: enMessages,
  pa: enMessages,
  bn: enMessages,
};

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  locales: typeof locales;
  localeNames: typeof localeNames;
}

const LanguageContext = createContext<LanguageContextType | null>(null);


function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const value = path.split(".").reduce((current: unknown, key) => {
    if (current && typeof current === "object" && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
  
  return typeof value === "string" ? value : path;
}


function interpolate(str: string, params?: Record<string, string | number>): string {
  if (!params) return str;
  
  return Object.entries(params).reduce((result, [key, value]) => {
    return result.replace(new RegExp(`\\{${key}\\}`, "g"), String(value));
  }, str);
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(defaultLocale);

  // Load locale from cookie on mount
  useEffect(() => {
    const savedLocale = document.cookie
      .split("; ")
      .find((row) => row.startsWith("NEXT_LOCALE="))
      ?.split("=")[1] as Locale | undefined;
    
    if (savedLocale && locales.includes(savedLocale)) {
      setLocaleState(savedLocale);
    }
  }, []);

  // Set locale and save to cookie
  const setLocale = useCallback((newLocale: Locale) => {
    if (locales.includes(newLocale)) {
      setLocaleState(newLocale);
      document.cookie = `NEXT_LOCALE=${newLocale};path=/;max-age=31536000`; // 1 year
      // Optionally reload for full server-side translation
      // window.location.reload();
    }
  }, []);

  // Translation function
  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const currentMessages = messages[locale] ?? messages[defaultLocale];
    const translation = getNestedValue(currentMessages as unknown as Record<string, unknown>, key);
    return interpolate(translation, params);
  }, [locale]);

  return (
    <LanguageContext.Provider value={{ 
      locale, 
      setLocale, 
      t, 
      locales, 
      localeNames 
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === null) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

// Hook for translations - returns all context values or null if outside provider
export function useTranslation() {
  const context = useContext(LanguageContext);
  return context;
}
