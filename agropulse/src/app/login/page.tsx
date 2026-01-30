"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Leaf, Mail, Lock, Loader2 } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { useToast } from "~/hooks/use-toast";
import { useTranslation } from "~/providers/language-provider";
import { LanguageSwitcher } from "~/components/language-switcher";

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const translation = useTranslation();
  const t = translation?.t ?? ((key: string) => key.split('.').pop() ?? key);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: t("auth.loginFailed"),
          description: t("auth.invalidCredentials"),
          variant: "destructive",
        });
      } else {
        toast({
          title: t("auth.welcomeBack"),
          description: t("auth.loginSuccess"),
          variant: "success",
        });
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast({
        title: t("common.error"),
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 px-4 py-12">
      {/* Language Switcher - Top Right */}
      <div className="absolute top-4 right-4">
        <LanguageSwitcher showLabel />
      </div>

      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <Link href="/" className="flex items-center gap-2 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
              <Leaf className="h-7 w-7 text-white" />
            </div>
          </Link>
          <h1 className="text-3xl font-bold text-primary">AgroPulse</h1>
          <p className="text-muted-foreground mt-1">{t("landing.tagline")}</p>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center">{t("auth.welcomeBack")}</CardTitle>
            <CardDescription className="text-center">
              {t("auth.enterCredentials")}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email")}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="farmer@example.com"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">{t("auth.password")}</Label>
                  <Link
                    href="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    {t("auth.forgotPassword")}
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="pl-10"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t("auth.signingIn")}
                  </>
                ) : (
                  t("auth.signIn")
                )}
              </Button>
              <p className="text-sm text-center text-muted-foreground">
                {t("auth.dontHaveAccount")}{" "}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  {t("auth.createOne")}
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        {/* Demo accounts info */}
        <div className="mt-6 p-4 bg-white/50 rounded-lg border">
          <p className="text-sm text-center text-muted-foreground mb-2">
            <strong>{t("auth.demoAccounts")}:</strong>
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
            <div className="text-center">
              <p className="font-medium">{t("auth.farmer")}</p>
              <p>farmer@demo.com</p>
            </div>
            <div className="text-center">
              <p className="font-medium">{t("auth.buyer")}</p>
              <p>buyer@demo.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
