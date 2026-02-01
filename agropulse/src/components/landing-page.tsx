"use client";

import Link from "next/link";
import {
  Leaf,
  Gavel,
  BarChart3,
  Brain,
  ShieldCheck,
  Users,
  ArrowRight,
  CheckCircle,
} from "lucide-react";
import { useLanguage } from "~/providers/language-provider";
import { LanguageSwitcher } from "~/components/language-switcher";

export function LandingPageClient() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background">
     
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Leaf className="h-6 w-6 text-white" />
              </div>
              <span className="text-xl font-bold text-primary">AgroPulse</span>
            </div>
            <div className="flex items-center gap-4">
              <LanguageSwitcher variant="ghost" showLabel />
              <Link
                href="/login"
                className="px-4 py-2 text-gray-700 hover:text-primary transition-colors"
              >
                {t("landing.login")}
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                {t("landing.getStarted")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </nav>

     
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-accent/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium mb-6">
              <Leaf className="h-4 w-4" />
              {t("landing.tagline")}
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              {t("landing.heroTitle")}{" "}
              <span className="text-primary">{t("landing.heroHighlight")}</span>{" "}
              {t("landing.heroTitleEnd")}
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
              {t("landing.heroDescription")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/register?role=FARMER"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
              >
                <Leaf className="h-5 w-5" />
                {t("landing.imFarmer")}
              </Link>
              <Link
                href="/register?role=BUYER"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary/90 transition-colors font-medium"
              >
                <Users className="h-5 w-5" />
                {t("landing.imBuyer")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">
              {t("landing.featuresTitle")}
            </h2>
            <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
              {t("landing.featuresSubtitle")}
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Gavel className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.feature1Title")}</h3>
              <p className="text-gray-600">{t("landing.feature1Desc")}</p>
            </div>

            
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-secondary/10 flex items-center justify-center mb-4">
                <Brain className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.feature2Title")}</h3>
              <p className="text-gray-600">{t("landing.feature2Desc")}</p>
            </div>

            
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <BarChart3 className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.feature3Title")}</h3>
              <p className="text-gray-600">{t("landing.feature3Desc")}</p>
            </div>

          
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.feature4Title")}</h3>
              <p className="text-gray-600">{t("landing.feature4Desc")}</p>
            </div>

            
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center mb-4">
                <ShieldCheck className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.feature5Title")}</h3>
              <p className="text-gray-600">{t("landing.feature5Desc")}</p>
            </div>

            
            <div className="p-6 rounded-xl border bg-card hover:shadow-lg transition-shadow">
              <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.feature6Title")}</h3>
              <p className="text-gray-600">{t("landing.feature6Desc")}</p>
            </div>
          </div>
        </div>
      </section>

      
      <section className="py-20 bg-gradient-to-b from-background to-primary/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900">{t("landing.howItWorksTitle")}</h2>
            <p className="mt-4 text-gray-600">{t("landing.howItWorksSubtitle")}</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.step1Title")}</h3>
              <p className="text-gray-600">{t("landing.step1Desc")}</p>
            </div>

            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-secondary text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.step2Title")}</h3>
              <p className="text-gray-600">{t("landing.step2Desc")}</p>
            </div>

            
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-accent text-white flex items-center justify-center text-2xl font-bold mx-auto mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("landing.step3Title")}</h3>
              <p className="text-gray-600">{t("landing.step3Desc")}</p>
            </div>
          </div>
        </div>
      </section>

     
      <section className="py-20 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">{t("landing.ctaTitle")}</h2>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            {t("landing.ctaDescription")}
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-primary rounded-lg hover:bg-white/90 transition-colors font-medium text-lg"
          >
            {t("landing.getStartedFree")}
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

     
      <footer className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <Leaf className="h-6 w-6 text-white" />
                </div>
                <span className="text-xl font-bold">AgroPulse</span>
              </div>
              <p className="text-gray-400">{t("landing.footerTagline")}</p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t("landing.product")}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {t("landing.features")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {t("landing.pricing")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {t("landing.api")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t("landing.company")}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {t("landing.about")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {t("landing.careers")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {t("landing.contact")}
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">{t("landing.legal")}</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {t("landing.privacyPolicy")}
                  </Link>
                </li>
                <li>
                  <Link href="#" className="hover:text-white transition-colors">
                    {t("landing.termsOfService")}
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-800 text-center text-gray-400">
            <p>{t("landing.copyright", { year: new Date().getFullYear() })}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
