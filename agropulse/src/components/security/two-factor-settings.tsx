"use client";

import { useState } from "react";
import Image from "next/image";
import { Shield, ShieldCheck, ShieldOff, Loader2, Copy, Check } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { useToast } from "~/hooks/use-toast";
import { api } from "~/trpc/react";

export function TwoFactorSettings() {
  const { toast } = useToast();
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [isDisableOpen, setIsDisableOpen] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [password, setPassword] = useState("");
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Get 2FA status
  const { data: status, refetch: refetchStatus } = api.auth.getTwoFactorStatus.useQuery();

  // Setup 2FA mutation
  const setupMutation = api.auth.setupTwoFactor.useMutation({
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Enable 2FA mutation
  const enableMutation = api.auth.enableTwoFactor.useMutation({
    onSuccess: (data) => {
      setBackupCodes(data.backupCodes);
      setShowBackupCodes(true);
      setIsSetupOpen(false);
      setVerificationCode("");
      void refetchStatus();
      toast({
        title: "2FA Enabled",
        description: "Two-factor authentication has been enabled successfully.",
        variant: "success",
      });
    },
    onError: (error) => {
      toast({
        title: "Verification Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Disable 2FA mutation
  const disableMutation = api.auth.disableTwoFactor.useMutation({
    onSuccess: () => {
      setIsDisableOpen(false);
      setVerificationCode("");
      setPassword("");
      void refetchStatus();
      toast({
        title: "2FA Disabled",
        description: "Two-factor authentication has been disabled.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSetup = async () => {
    await setupMutation.mutateAsync();
    setIsSetupOpen(true);
  };

  const handleEnable = () => {
    if (verificationCode.length !== 6) {
      toast({
        title: "Invalid Code",
        description: "Please enter a 6-digit verification code.",
        variant: "destructive",
      });
      return;
    }
    enableMutation.mutate({ token: verificationCode });
  };

  const handleDisable = () => {
    if (verificationCode.length !== 6 || !password) {
      toast({
        title: "Missing Information",
        description: "Please enter your password and 2FA code.",
        variant: "destructive",
      });
      return;
    }
    disableMutation.mutate({ token: verificationCode, password });
  };

  const copySecret = () => {
    if (setupMutation.data?.secret) {
      void navigator.clipboard.writeText(setupMutation.data.secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const copyBackupCodes = () => {
    void navigator.clipboard.writeText(backupCodes.join("\n"));
    toast({
      title: "Copied",
      description: "Backup codes copied to clipboard.",
    });
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Two-Factor Authentication</CardTitle>
          </div>
          <CardDescription>
            Add an extra layer of security to your account by requiring a verification code when signing in.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 rounded-lg bg-muted">
            <div className="flex items-center gap-3">
              {status?.enabled ? (
                <ShieldCheck className="h-8 w-8 text-green-600" />
              ) : (
                <ShieldOff className="h-8 w-8 text-muted-foreground" />
              )}
              <div>
                <p className="font-medium">
                  {status?.enabled ? "2FA is enabled" : "2FA is not enabled"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {status?.enabled
                    ? "Your account is protected with two-factor authentication"
                    : "Enable 2FA to secure your account"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          {status?.enabled ? (
            <Button variant="destructive" onClick={() => setIsDisableOpen(true)}>
              Disable 2FA
            </Button>
          ) : (
            <Button onClick={handleSetup} disabled={setupMutation.isPending}>
              {setupMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Enable 2FA"
              )}
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Setup Dialog */}
      <Dialog open={isSetupOpen} onOpenChange={setIsSetupOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Up Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {setupMutation.data?.qrCode && (
              <div className="p-4 bg-white rounded-lg border">
                <Image
                  src={setupMutation.data.qrCode}
                  alt="2FA QR Code"
                  width={200}
                  height={200}
                />
              </div>
            )}
            <div className="w-full">
              <Label className="text-sm text-muted-foreground">
                Or enter this code manually:
              </Label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                  {setupMutation.data?.secret}
                </code>
                <Button variant="outline" size="icon" onClick={copySecret}>
                  {copiedSecret ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            <div className="w-full space-y-2">
              <Label htmlFor="verify-code">Enter verification code</Label>
              <Input
                id="verify-code"
                placeholder="Enter 6-digit code"
                className="text-center text-xl tracking-widest"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsSetupOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEnable} disabled={enableMutation.isPending}>
              {enableMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify & Enable"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Dialog */}
      <Dialog open={isDisableOpen} onOpenChange={setIsDisableOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Disable Two-Factor Authentication</DialogTitle>
            <DialogDescription>
              Please enter your password and current 2FA code to disable two-factor authentication.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="disable-password">Password</Label>
              <Input
                id="disable-password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="disable-code">2FA Code</Label>
              <Input
                id="disable-code"
                placeholder="Enter 6-digit code"
                className="text-center text-xl tracking-widest"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDisableOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDisable}
              disabled={disableMutation.isPending}
            >
              {disableMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Disabling...
                </>
              ) : (
                "Disable 2FA"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog open={showBackupCodes} onOpenChange={setShowBackupCodes}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Save Your Backup Codes</DialogTitle>
            <DialogDescription>
              Store these backup codes in a safe place. You can use them to access your account if you lose your authenticator device.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="grid grid-cols-2 gap-2 p-4 bg-muted rounded-lg font-mono text-sm">
              {backupCodes.map((code, index) => (
                <div key={index} className="p-2 bg-background rounded text-center">
                  {code}
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Each code can only be used once. After using a backup code, it will no longer work.
            </p>
          </div>
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="outline" onClick={copyBackupCodes} className="w-full sm:w-auto">
              <Copy className="mr-2 h-4 w-4" />
              Copy All
            </Button>
            <Button onClick={() => setShowBackupCodes(false)} className="w-full sm:w-auto">
              I&apos;ve Saved My Codes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
