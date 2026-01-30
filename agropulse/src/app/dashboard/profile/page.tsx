"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Camera, 
  Shield, 
  Bell, 
  Globe, 
  CreditCard,
  Star,
  Award,
  TrendingUp,
  Package,
  Handshake,
  Edit2,
  Save,
  X,
  CheckCircle
} from "lucide-react";
import Image from "next/image";

import { api } from "~/trpc/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Badge } from "~/components/ui/badge";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Switch } from "~/components/ui/switch";
import { useToast } from "~/hooks/use-toast";
import { Separator } from "~/components/ui/separator";
import { TwoFactorSettings } from "~/components/security/two-factor-settings";

interface ProfileFormData {
  name: string;
  phone: string;
  location: string;
  bio: string;
  farmSize: string;
  specializations: string[];
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<ProfileFormData>({
    name: session?.user?.name ?? "",
    phone: "",
    location: "",
    bio: "",
    farmSize: "",
    specializations: [],
  });

  // Notification preferences
  const [notifications, setNotifications] = useState({
    email: true,
    push: true,
    sms: false,
    bidAlerts: true,
    priceAlerts: true,
    messageAlerts: true,
  });

  // Language preference
  const [language, setLanguage] = useState("en");

  // Mock statistics - in production these would come from API
  const stats = {
    totalListings: 12,
    activeBids: 5,
    completedDeals: 28,
    averageRating: 4.7,
    totalEarnings: 245000,
    memberSince: "January 2024",
    verificationStatus: "verified",
  };

  const handleSaveProfile = async () => {
    // Here you would call an API to save the profile
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const languages = [
    { code: "en", name: "English", nativeName: "English" },
    { code: "hi", name: "Hindi", nativeName: "हिंदी" },
    { code: "mr", name: "Marathi", nativeName: "मराठी" },
    { code: "gu", name: "Gujarati", nativeName: "ગુજરાતી" },
    { code: "pa", name: "Punjabi", nativeName: "ਪੰਜਾਬੀ" },
    { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
    { code: "te", name: "Telugu", nativeName: "తెలుగు" },
    { code: "kn", name: "Kannada", nativeName: "ಕನ್ನಡ" },
    { code: "bn", name: "Bengali", nativeName: "বাংলা" },
    { code: "ml", name: "Malayalam", nativeName: "മലയാളം" },
  ];

  const specializations = [
    "Rice", "Wheat", "Cotton", "Sugarcane", "Vegetables", 
    "Fruits", "Pulses", "Oilseeds", "Spices", "Organic Farming"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-500">Manage your account settings and preferences</p>
      </div>

      {/* Profile Overview Card */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-green-600 to-green-700 text-white">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Profile Image */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full bg-white/20 flex items-center justify-center overflow-hidden border-4 border-white/30">
                {profileImage || session?.user?.image ? (
                  <Image
                    src={profileImage ?? session?.user?.image ?? ""}
                    alt="Profile"
                    width={112}
                    height={112}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <User className="w-14 h-14 text-white/70" />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 shadow-lg cursor-pointer hover:bg-gray-100 transition-colors">
                <Camera className="w-4 h-4 text-green-600" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
            </div>

            {/* User Info */}
            <div className="text-center md:text-left flex-1">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <h2 className="text-2xl font-bold">{session?.user?.name ?? "User"}</h2>
                {stats.verificationStatus === "verified" && (
                  <CheckCircle className="w-5 h-5 text-green-300" />
                )}
              </div>
              <p className="text-green-100 mb-2">{session?.user?.email}</p>
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Star className="w-3 h-3 mr-1" /> {stats.averageRating} Rating
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                  <Award className="w-3 h-3 mr-1" /> Top Seller
                </Badge>
                <Badge className="bg-white/20 hover:bg-white/30 text-white border-0">
                  Member since {stats.memberSince}
                </Badge>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-white/10 rounded-lg p-3">
                <Package className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xl font-bold">{stats.totalListings}</div>
                <div className="text-xs text-green-100">Listings</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <Handshake className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xl font-bold">{stats.completedDeals}</div>
                <div className="text-xs text-green-100">Deals</div>
              </div>
              <div className="bg-white/10 rounded-lg p-3">
                <TrendingUp className="w-5 h-5 mx-auto mb-1" />
                <div className="text-xl font-bold">₹{(stats.totalEarnings / 1000).toFixed(0)}K</div>
                <div className="text-xs text-green-100">Earnings</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="personal" className="w-full">
        <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-flex">
          <TabsTrigger value="personal" className="gap-2">
            <User className="w-4 h-4" />
            <span className="hidden sm:inline">Personal</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="gap-2">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">Language</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* Personal Info Tab */}
        <TabsContent value="personal" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and preferences</CardDescription>
              </div>
              {isEditing ? (
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
                    <X className="w-4 h-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={handleSaveProfile} className="bg-green-600 hover:bg-green-700">
                    <Save className="w-4 h-4 mr-1" /> Save
                  </Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit2 className="w-4 h-4 mr-1" /> Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                      placeholder="Enter your full name"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      value={session?.user?.email ?? ""}
                      disabled
                      className="pl-10 bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-500">Email cannot be changed</p>
                </div>

                {/* Phone */}
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>

                {/* Location */}
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      disabled={!isEditing}
                      className="pl-10"
                      placeholder="City, State"
                    />
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-2">
                <Label htmlFor="bio">About Me</Label>
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  disabled={!isEditing}
                  placeholder="Tell buyers about yourself and your farming experience..."
                  rows={4}
                />
              </div>

              <Separator />

              {/* Farm Details */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Farm Details</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="farmSize">Farm Size</Label>
                    <Select
                      value={formData.farmSize}
                      onValueChange={(value) => setFormData({ ...formData, farmSize: value })}
                      disabled={!isEditing}
                    >
                      <SelectTrigger id="farmSize">
                        <SelectValue placeholder="Select farm size" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="small">Small ({"<"} 2 acres)</SelectItem>
                        <SelectItem value="medium">Medium (2-10 acres)</SelectItem>
                        <SelectItem value="large">Large (10-50 acres)</SelectItem>
                        <SelectItem value="commercial">Commercial ({">"} 50 acres)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Specializations</Label>
                    <div className="flex flex-wrap gap-2">
                      {specializations.slice(0, 6).map((spec) => (
                        <Badge
                          key={spec}
                          variant={formData.specializations.includes(spec) ? "default" : "outline"}
                          className={`cursor-pointer ${
                            formData.specializations.includes(spec)
                              ? "bg-green-600 hover:bg-green-700"
                              : "hover:bg-green-50"
                          } ${!isEditing && "opacity-70"}`}
                          onClick={() => {
                            if (!isEditing) return;
                            setFormData({
                              ...formData,
                              specializations: formData.specializations.includes(spec)
                                ? formData.specializations.filter((s) => s !== spec)
                                : [...formData.specializations, spec],
                            });
                          }}
                        >
                          {spec}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to receive notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Notification Channels */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Notification Channels</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="email-notif" className="font-medium">Email Notifications</Label>
                      <p className="text-sm text-gray-500">Receive updates via email</p>
                    </div>
                    <Switch
                      id="email-notif"
                      checked={notifications.email}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, email: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="push-notif" className="font-medium">Push Notifications</Label>
                      <p className="text-sm text-gray-500">Browser and mobile push notifications</p>
                    </div>
                    <Switch
                      id="push-notif"
                      checked={notifications.push}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, push: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="sms-notif" className="font-medium">SMS Notifications</Label>
                      <p className="text-sm text-gray-500">Receive important alerts via SMS</p>
                    </div>
                    <Switch
                      id="sms-notif"
                      checked={notifications.sms}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, sms: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Alert Types */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Alert Types</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="bid-alerts" className="font-medium">Bid Alerts</Label>
                      <p className="text-sm text-gray-500">Get notified when you receive new bids</p>
                    </div>
                    <Switch
                      id="bid-alerts"
                      checked={notifications.bidAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, bidAlerts: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="price-alerts" className="font-medium">Price Alerts</Label>
                      <p className="text-sm text-gray-500">AI-powered price change notifications</p>
                    </div>
                    <Switch
                      id="price-alerts"
                      checked={notifications.priceAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, priceAlerts: checked })
                      }
                    />
                  </div>
                  <Separator />
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="message-alerts" className="font-medium">Message Alerts</Label>
                      <p className="text-sm text-gray-500">Notify when you receive new messages</p>
                    </div>
                    <Switch
                      id="message-alerts"
                      checked={notifications.messageAlerts}
                      onCheckedChange={(checked) => 
                        setNotifications({ ...notifications, messageAlerts: checked })
                      }
                    />
                  </div>
                </div>
              </div>

              <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                toast({
                  title: "Preferences Saved",
                  description: "Your notification preferences have been updated.",
                });
              }}>
                Save Preferences
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>Choose your preferred language for the application</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {languages.map((lang) => (
                  <div
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      language === lang.code
                        ? "border-green-600 bg-green-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{lang.name}</p>
                        <p className="text-sm text-gray-500">{lang.nativeName}</p>
                      </div>
                      {language === lang.code && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>Note:</strong> Changing the language will translate the entire application interface. 
                  Some content may still appear in the original language if translations are not available.
                </p>
              </div>

              <Button className="bg-green-600 hover:bg-green-700" onClick={() => {
                // Here you would update i18n settings
                toast({
                  title: "Language Updated",
                  description: `Application language set to ${languages.find(l => l.code === language)?.name}.`,
                });
              }}>
                Apply Language
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          {/* Two-Factor Authentication */}
          <TwoFactorSettings />
          
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>Manage your account security and privacy</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Verification Status */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-4">
                <div className="bg-green-600 rounded-full p-3">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="font-medium text-green-900">Account Verified</p>
                  <p className="text-sm text-green-700">Your account has been verified via Google OAuth</p>
                </div>
              </div>

              {/* Connected Accounts */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Connected Accounts</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="bg-blue-100 p-2 rounded-lg">
                        <svg className="w-5 h-5 text-blue-600" viewBox="0 0 24 24">
                          <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                          <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                          <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                          <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Google</p>
                        <p className="text-sm text-gray-500">{session?.user?.email}</p>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-800 border-0">Connected</Badge>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Payment Methods */}
              <div>
                <h3 className="font-medium text-gray-900 mb-4">Payment Methods</h3>
                <div className="p-4 border border-dashed rounded-lg text-center">
                  <CreditCard className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-gray-500 mb-3">No payment methods added</p>
                  <Button variant="outline" size="sm">
                    Add Payment Method
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Danger Zone */}
              <div>
                <h3 className="font-medium text-red-600 mb-4">Danger Zone</h3>
                <div className="space-y-3">
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Download My Data
                  </Button>
                  <Button variant="outline" className="text-red-600 border-red-200 hover:bg-red-50">
                    Delete Account
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
