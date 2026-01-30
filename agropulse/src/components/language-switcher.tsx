"use client";

import { Globe, Check } from "lucide-react";
import { useTranslation } from "~/providers/language-provider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Button } from "~/components/ui/button";
import { type Locale } from "~/i18n";

interface LanguageSwitcherProps {
  variant?: "default" | "ghost" | "outline";
  showLabel?: boolean;
  className?: string;
}

export function LanguageSwitcher({ 
  variant = "ghost", 
  showLabel = false,
  className = "" 
}: LanguageSwitcherProps) {
  const translation = useTranslation();
  
  // Handle case where component is rendered outside of LanguageProvider
  if (!translation) {
    return (
      <Button variant={variant} size="sm" className={`gap-2 ${className}`} disabled>
        <Globe className="h-4 w-4" />
        {showLabel && <span>English</span>}
      </Button>
    );
  }

  const { locale, setLocale, locales, localeNames } = translation;

  // Get display name safely
  const getDisplayName = (loc: Locale) => {
    const localeData = localeNames?.[loc];
    if (typeof localeData === 'string') return localeData;
    if (localeData && typeof localeData === 'object' && 'nativeName' in localeData) {
      return localeData.nativeName;
    }
    return loc.toUpperCase();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size="sm" className={`gap-2 ${className}`}>
          <Globe className="h-4 w-4" />
          {showLabel && <span>{getDisplayName(locale)}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {locales.map((loc: Locale) => (
          <DropdownMenuItem
            key={loc}
            onClick={() => setLocale(loc)}
            className="flex items-center justify-between cursor-pointer"
          >
            <span>{getDisplayName(loc)}</span>
            {locale === loc && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
