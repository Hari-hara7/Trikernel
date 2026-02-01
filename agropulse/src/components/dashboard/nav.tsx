"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  Leaf,
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  MessageSquare,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Globe,
  Brain,
} from "lucide-react";
import { useState } from "react";

import { Button } from "~/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { cn, getInitials } from "~/lib/utils";
import { NotificationDropdown } from "~/components/notifications/notification-dropdown";
import { useTranslation, useLanguage } from "~/providers/language-provider";

const farmerNavItems = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/listings", labelKey: "nav.myListings", icon: Package },
  { href: "/dashboard/bids", labelKey: "bids.receivedBids", icon: ShoppingCart },
  { href: "/dashboard/market", labelKey: "nav.market", icon: BarChart3 },
  { href: "/dashboard/ai-assistant", labelKey: "nav.aiAssistant", icon: Brain },
  { href: "/dashboard/messages", labelKey: "nav.messages", icon: MessageSquare },
];

const buyerNavItems = [
  { href: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  { href: "/dashboard/browse", labelKey: "nav.browse", icon: Package },
  { href: "/dashboard/my-bids", labelKey: "bids.myBids", icon: ShoppingCart },
  { href: "/dashboard/market", labelKey: "nav.market", icon: BarChart3 },
  { href: "/dashboard/ai-assistant", labelKey: "nav.aiAssistant", icon: Brain },
  { href: "/dashboard/messages", labelKey: "nav.messages", icon: MessageSquare },
];

export function DashboardNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { locale, setLocale, locales, localeNames } = useLanguage();

  const navItems = session?.user.role === "FARMER" ? farmerNavItems : buyerNavItems;

  return (
    <>
      <aside className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 bg-white border-r">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-4 border-b">
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
            <Leaf className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-primary text-lg">AgroPulse</h1>
            <p className="text-xs text-muted-foreground capitalize">
              {t("dashboard.portal", { role: session?.user.role?.toLowerCase() || "user" })}
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-white"
                    : "text-gray-600 hover:bg-gray-100"
                )}
              >
                <item.icon className="h-5 w-5" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={session?.user.image ?? undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(session?.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session?.user.name}</p>
              <p className="text-xs text-muted-foreground truncate">
                {session?.user.email}
              </p>
            </div>
          </div>
        </div>
      </aside>

      <header className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="h-5 w-5 text-white" />
            </div>
            <span className="font-bold text-primary">AgroPulse</span>
          </div>

          <div className="flex items-center gap-2">
            <NotificationDropdown />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        
        {mobileMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b shadow-lg">
            <nav className="px-4 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
              <hr className="my-2" />
              <Link
                href="/dashboard/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                <User className="h-5 w-5" />
                {t("nav.profile")}
              </Link>
              <Link
                href="/dashboard/settings"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                <Settings className="h-5 w-5" />
                {t("nav.settings")}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                {t("nav.logout")}
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Desktop Top Bar */}
      <header className="hidden lg:flex lg:ml-64 fixed top-0 right-0 left-64 z-40 bg-white border-b px-6 py-3 items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {navItems.find((item) => item.href === pathname) 
              ? t(navItems.find((item) => item.href === pathname)!.labelKey)
              : t("nav.dashboard")}
          </h2>
        </div>

        <div className="flex items-center gap-4">
          {/* Language Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Globe className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>{t("profile.language.title")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {locales.slice(0, 5).map((loc) => (
                <DropdownMenuItem
                  key={loc}
                  onClick={() => setLocale(loc)}
                  className={locale === loc ? "bg-green-50" : ""}
                >
                  <span className="flex-1">{localeNames[loc].nativeName}</span>
                  {locale === loc && <span className="text-green-600">✓</span>}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  {t("common.seeMore")}...
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <NotificationDropdown />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={session?.user.image ?? undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary text-sm">
                    {getInitials(session?.user.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:inline text-sm font-medium">
                  {session?.user.name}
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{t("profile.title")}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  {t("nav.profile")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">
                  <Settings className="mr-2 h-4 w-4" />
                  {t("nav.settings")}
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t("nav.logout")}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>
    </>
  );
}
