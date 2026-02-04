"use client";

import { useState, useEffect, ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Loader2,
  Shield,
  User,
  CreditCard,
  Bell,
  Link2,
  Palette,
  Users,
  FileCheck,
  AlertTriangle,
  Settings,
  ChevronRight,
  Check,
  X,
  Eye,
  EyeOff,
  Smartphone,
  Mail,
  MapPin,
  Building2,
  Clock,
  Globe,
  Key,
  MonitorSmartphone,
  History,
  Wallet,
  Banknote,
  RefreshCw,
  Percent,
  FileText,
  CheckCircle2,
  XCircle,
  Zap,
  Webhook,
  BellRing,
  MessageSquare,
  Phone,
  Image,
  ExternalLink,
  Copy,
  Trash2,
  Plus,
  Lock,
} from "lucide-react";
import { SessionsCard } from "../../../../components/settings/sessions";
import { TwoFA } from "../../../../components/settings/twofa";
import { IntegrationsSection } from "../../../../components/settings/integrations";
import { SectionHeader } from "../../../../components/settings/section-header";
import { BrandingSection } from "../../../../components/settings/branding";
import { LoanPreferenceSection } from "../../../../components/settings/loand-preference";
import { BankAccounts } from "../../../../components/settings/bank-accounts";
import { PaystackInt } from "../../../../components/settings/paystack-int";
import { PasswordCard } from "../../../../components/settings/password";

// =============================================
// SCHEMAS
// =============================================

const profileSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  phone: z.string().min(10, "Phone number is required"),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

const businessSchema = z.object({
  lenderType: z.string(),
  businessName: z.string().optional(),
  address: z.string().optional(),
  supportEmail: z.string().email().optional().or(z.literal("")),
});

const securitySchema = z
  .object({
    currentPassword: z.string().min(6, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const paystackSchema = z.object({
  paystackPublicKey: z.string().optional(),
  paystackSecretKey: z.string().optional(),
});

// =============================================
// TYPES
// =============================================

type ProfileFormValues = z.infer<typeof profileSchema>;
type SecurityFormValues = z.infer<typeof securitySchema>;
type PaystackFormValues = z.infer<typeof paystackSchema>;

interface NavItem {
  id: string;
  label: string;
  icon: ReactNode;
  badge?: string;
}

// =============================================
// NAVIGATION DATA
// =============================================

const navItems: NavItem[] = [
  { id: "account", label: "Account", icon: <User size={18} /> },
  {
    id: "security",
    label: "Security",
    icon: <Shield size={18} />,
    badge: "Recommended",
  },
  {
    id: "payments",
    label: "Payments & Payouts",
    icon: <CreditCard size={18} />,
  },
  { id: "loans", label: "Loan Preferences", icon: <FileText size={18} /> },
  { id: "integrations", label: "Integrations", icon: <Zap size={18} /> },
  { id: "notifications", label: "Notifications", icon: <Bell size={18} /> },
  { id: "branding", label: "Branding & Links", icon: <Palette size={18} /> },
  { id: "compliance", label: "Compliance", icon: <FileCheck size={18} /> },
  { id: "danger", label: "Danger Zone", icon: <AlertTriangle size={18} /> },
];

// =============================================
// MAIN COMPONENT
// =============================================

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("account");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [payoutAccounts, setPayoutAccounts] = useState<any[]>([]);
  const [isAddingBank, setIsAddingBank] = useState(false);
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(false);
  const [isUpdating2FA, setIsUpdating2FA] = useState(false);

  // Image Upload State
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [brandLogoUrl, setBrandLogoUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Dynamic notification state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifyNewApplication: true,
    emailNotifyPaymentReceived: true,
    emailNotifyPaymentFailed: true,
    emailNotifyLoanOverdue: true,
    smsNotifyCriticalOnly: false,
  });

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: "",
      phone: "",
      timezone: "Africa/Lagos",
      language: "English",
    },
  });

  const securityForm = useForm<SecurityFormValues>({
    resolver: zodResolver(securitySchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const paystackForm = useForm<PaystackFormValues>({
    resolver: zodResolver(paystackSchema),
    defaultValues: {
      paystackPublicKey: "",
      paystackSecretKey: "",
    },
  });

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();

        // Populate Forms
        profileForm.reset({
          fullName: data.fullName || "",
          phone: data.phone || "",
          timezone: data.timezone || "Africa/Lagos",
          language: data.language || "English",
        });

        paystackForm.reset({
          paystackPublicKey: data.paystackPublicKey || "",
          paystackSecretKey: data.paystackSecretKey || "", // Ensure backed sends this if authorized, else keep empty
        });
        setIsTwoFactorEnabled(data.isTwoFactorEnabled);
        setPayoutAccounts(data.payoutAccounts || []);
        setAvatarUrl(data.avatarUrl || null);
        setBrandLogoUrl(data.brandLogoUrl || null);

        setNotificationSettings({
          emailNotifyNewApplication: data.emailNotifyNewApplication ?? true,
          emailNotifyPaymentReceived: data.emailNotifyPaymentReceived ?? true,
          emailNotifyPaymentFailed: data.emailNotifyPaymentFailed ?? true,
          emailNotifyLoanOverdue: data.emailNotifyLoanOverdue ?? true,
          smsNotifyCriticalOnly: data.smsNotifyCriticalOnly ?? false,
        });
      } catch (err) {
        toast.error("Failed to load settings");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchSettings();
  }, [profileForm, paystackForm]);

  async function handleFileUpload(
    e: React.ChangeEvent<HTMLInputElement>,
    type: "avatar" | "brand",
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) throw new Error("Upload failed");
      const { url } = await uploadRes.json();

      // Update User Profile/Settings with new URL
      const updateField =
        type === "avatar" ? { avatarUrl: url } : { brandLogoUrl: url };

      // Optimistic update
      if (type === "avatar") setAvatarUrl(url);
      else setBrandLogoUrl(url);

      await updateSettings(updateField);
    } catch (error) {
      toast.error("Failed to upload image");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  }

  // Generic Settings Update Handler
  async function updateSettings(values: any) {
    setIsSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update settings");
      toast.success("Settings updated successfully");
      return true;
    } catch (err: any) {
      toast.error(err.message);
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function onProfileSubmit(values: ProfileFormValues) {
    await updateSettings(values);
  }

  async function onPaystackSubmit(values: PaystackFormValues) {
    await updateSettings(values);
  }

  async function onSecuritySubmit(values: SecurityFormValues) {
    setIsChangingPassword(true);
    try {
      const res = await fetch("/api/auth/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password");
      toast.success("Password changed successfully");
      securityForm.reset();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsChangingPassword(false);
    }
  }

  async function handleNotificationToggle(key: string, value: boolean) {
    const newSettings = { ...notificationSettings, [key]: value };
    setNotificationSettings(newSettings); // Optimistic update
    const success = await updateSettings({ [key]: value });
    if (!success) setNotificationSettings(notificationSettings); // Revert on fail
  }

  // Payout Account Handlers
  async function addPayoutAccount(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsAddingBank(true);
    const formData = new FormData(e.currentTarget);
    const data = {
      bankName: formData.get("bankName"),
      accountNumber: formData.get("accountNumber"),
      accountName: formData.get("accountName"),
    };

    try {
      const res = await fetch("/api/settings/payout-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to add account");
      const newAccount = await res.json();
      setPayoutAccounts([...payoutAccounts, newAccount]);
      toast.success("Bank account added");
      // Close modal logic if we had one, but we'll implement inline or dialog later
    } catch (error) {
      toast.error("Failed to add bank account");
    } finally {
      setIsAddingBank(false);
    }
  }

  async function removePayoutAccount(id: string) {
    try {
      const res = await fetch(`/api/settings/payout-accounts/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed");
      setPayoutAccounts(payoutAccounts.filter((p) => p.id !== id));
      toast.success("Account removed");
    } catch (error) {
      toast.error("Failed to remove account");
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="h-8 w-8 animate-spin text-main-green" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-black text-main-green tracking-tight">
          Settings
        </h1>
        <p className="text-gray-500 font-medium">
          Manage your account, security, and platform preferences.
        </p>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar Navigation */}
        <aside className="w-full lg:w-72 shrink-0">
          <Card className="border-none shadow-sm rounded-[32px] overflow-hidden sticky top-28">
            <CardContent className="p-3">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-left transition-all duration-200 group",
                      activeSection === item.id
                        ? "bg-lemon-primary text-main-green font-black shadow-sm"
                        : "text-gray-500 hover:bg-gray-50 hover:text-main-green font-bold",
                    )}
                  >
                    <span
                      className={cn(
                        "transition-transform duration-200",
                        activeSection === item.id && "scale-110",
                      )}
                    >
                      {item.icon}
                    </span>
                    <span className="flex-1">{item.label}</span>
                    {item.badge && (
                      <Badge
                        className={cn(
                          "text-[9px] font-black uppercase tracking-widest border-none",
                          activeSection === item.id
                            ? "bg-main-green/10 text-main-green"
                            : "bg-orange-50 text-orange-600",
                        )}
                      >
                        {item.badge}
                      </Badge>
                    )}
                    <ChevronRight
                      size={16}
                      className={cn(
                        "opacity-0 -translate-x-2 transition-all duration-200",
                        activeSection === item.id &&
                        "opacity-100 translate-x-0",
                      )}
                    />
                  </button>
                ))}
              </nav>
            </CardContent>
          </Card>
        </aside>

        {/* Content Area */}
        <main className="flex-1 min-w-0">
          {/* Account Section */}
          {activeSection === "account" && (
            <div className="space-y-8">
              <SectionHeader
                icon={<User size={24} />}
                title="Account Settings"
                description="Manage your personal profile and business information."
              />

              {/* Profile Card */}
              <Form {...profileForm}>
                <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
                  <Card className="border-none shadow-sm rounded-[32px]">
                    <CardHeader className="p-8 pb-0">
                      <CardTitle className="text-lg font-black text-main-green">
                        Profile Information
                      </CardTitle>
                      <CardDescription className="text-gray-500">
                        Your personal and contact details visible to borrowers.
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-8 space-y-6">
                      <div className="flex items-center gap-6">
                        <div className="size-20 rounded-3xl bg-lemon-primary/20 flex items-center justify-center text-main-green font-black text-2xl border-4 border-lemon-primary/10 overflow-hidden relative">
                          {avatarUrl ? (
                            <img
                              src={avatarUrl}
                              alt="Profile"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            profileForm
                              .watch("fullName")
                              ?.charAt(0)
                              ?.toUpperCase() || "U"
                          )}
                        </div>
                        <div>
                          <div className="relative">
                            <input
                              type="file"
                              id="avatar-upload"
                              className="hidden"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, "avatar")}
                              disabled={isUploading}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="rounded-2xl font-bold border-gray-100 shadow-sm h-11"
                              onClick={() =>
                                document
                                  .getElementById("avatar-upload")
                                  ?.click()
                              }
                              disabled={isUploading}
                            >
                              {isUploading ? (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                <Image size={16} className="mr-2" />
                              )}
                              Upload Photo
                            </Button>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold mt-2 uppercase tracking-widest">
                            JPG, PNG. Max 2MB
                          </p>
                        </div>
                      </div>

                      <Separator className="bg-gray-50" />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                          control={profileForm.control}
                          name="fullName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Full Name
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="John Doe"
                                  className="h-12 rounded-2xl border-gray-100 shadow-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={profileForm.control}
                          name="phone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Phone Number
                              </FormLabel>
                              <FormControl>
                                <Input
                                  placeholder="+234 800 000 0000"
                                  className="h-12 rounded-2xl border-gray-100 shadow-sm"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                            Time Zone
                          </label>
                          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                            <Globe size={18} className="text-gray-400" />
                            <span className="font-bold text-main-green">
                              Africa/Lagos (GMT+1)
                            </span>
                          </div>
                        </div>
                        <div>
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">
                            Language
                          </label>
                          <div className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50/50 border border-gray-100">
                            <MessageSquare
                              size={18}
                              className="text-gray-400"
                            />
                            <span className="font-bold text-main-green">
                              English
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-8 pt-0 flex justify-end">
                      <Button
                        type="submit"
                        disabled={isSaving}
                        className="bg-lemon-primary text-main-green hover:bg-lemon-primary/90 font-black h-12 px-8 rounded-2xl shadow-lg shadow-lemon-primary/20"
                      >
                        {isSaving && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save Changes
                      </Button>
                    </CardFooter>
                  </Card>
                </form>
              </Form>

              {/* Account Status Card */}
              <Card className="border-none shadow-sm rounded-[32px]">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-lg font-black text-main-green">
                    Account Status
                  </CardTitle>
                  <CardDescription className="text-gray-500">
                    Your verification level and account standing.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatusCard
                      label="Verification Level"
                      value="Level 2"
                      status="verified"
                      icon={<CheckCircle2 size={20} />}
                    />
                    <StatusCard
                      label="Account Status"
                      value="Active"
                      status="verified"
                      icon={<Check size={20} />}
                    />
                    <StatusCard
                      label="Last Login"
                      value="Today, 2:30 PM"
                      status="neutral"
                      icon={<Clock size={20} />}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Security Section */}
          {activeSection === "security" && (
            <div className="space-y-8">
              <SectionHeader
                icon={<Shield size={24} />}
                title="Security Settings"
                description="Protect your account with strong authentication."
              />

              {/* Password Card */}
              <PasswordCard securityForm={securityForm} onSecuritySubmit={onSecuritySubmit} isChangingPassword={isChangingPassword} />

              {/* 2FA Card */}

              <TwoFA updateSettings={updateSettings} />
              {/* Sessions Card */}
              <SessionsCard />
            </div>
          )}

          {/* Payments Section */}
          {activeSection === "payments" && (
            <div className="space-y-8">
              <SectionHeader
                icon={<CreditCard size={24} />}
                title="Payments & Payouts"
                description="Configure payment providers and payout accounts."
              />

              {/* Paystack Integration */}

              <PaystackInt isSaving={isSaving} showSecretKey={showSecretKey} setShowSecretKey={setShowSecretKey} paystackForm={paystackForm} onPaystackSubmit={onPaystackSubmit} />
              {/* Bank Accounts */}
              <BankAccounts addPayoutAccount={addPayoutAccount} removePayoutAccount={removePayoutAccount} payoutAccounts={payoutAccounts} isAddingBank={isAddingBank} />
            </div>
          )}

          {/* Loan Preferences Section */}
          {activeSection === "loans" && (
            <LoanPreferenceSection />
          )}

          {/* Integrations Section */}
          {activeSection === "integrations" && (
            <IntegrationsSection />
          )}

          {/* Notifications Section */}
          {activeSection === "notifications" && (
            <div className="space-y-8">
              <SectionHeader
                icon={<Bell size={24} />}
                title="Notifications"
                description="Control how and when you receive alerts."
              />

              <Card className="border-none shadow-sm rounded-[32px]">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-lg font-black text-main-green">
                    Email Notifications
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  <NotificationToggle
                    label="New loan application"
                    description="When a borrower submits an application"
                    enabled={notificationSettings.emailNotifyNewApplication}
                    onToggle={(val) =>
                      handleNotificationToggle("emailNotifyNewApplication", val)
                    }
                  />
                  <NotificationToggle
                    label="Payment received"
                    description="When a repayment is successfully collected"
                    enabled={notificationSettings.emailNotifyPaymentReceived}
                    onToggle={(val) =>
                      handleNotificationToggle(
                        "emailNotifyPaymentReceived",
                        val,
                      )
                    }
                  />
                  <NotificationToggle
                    label="Payment failed"
                    description="When an auto-debit attempt fails"
                    enabled={notificationSettings.emailNotifyPaymentFailed}
                    onToggle={(val) =>
                      handleNotificationToggle("emailNotifyPaymentFailed", val)
                    }
                  />
                  <NotificationToggle
                    label="Loan overdue"
                    description="When a borrower misses a payment deadline"
                    enabled={notificationSettings.emailNotifyLoanOverdue}
                    onToggle={(val) =>
                      handleNotificationToggle("emailNotifyLoanOverdue", val)
                    }
                  />
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm rounded-[32px]">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-lg font-black text-main-green">
                    SMS Alerts
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8 space-y-4">
                  <NotificationToggle
                    label="Critical alerts only"
                    description="Security and high-priority notifications"
                    enabled={false}
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Branding Section */}
          {activeSection === "branding" && (
            <BrandingSection handleFileUpload={handleFileUpload} isUploading={isUploading} brandLogoUrl={brandLogoUrl} />
          )}

          {/* Compliance Section */}
          {activeSection === "compliance" && (
            <div className="space-y-8">
              <SectionHeader
                icon={<FileCheck size={24} />}
                title="Compliance & Verification"
                description="Your regulatory status and identity verification."
              />

              <Card className="border-none shadow-sm rounded-[32px]">
                <CardHeader className="p-8 pb-0">
                  <CardTitle className="text-lg font-black text-main-green">
                    Identity Verification
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-8">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatusCard
                      label="BVN Status"
                      value="Verified"
                      status="verified"
                      icon={<CheckCircle2 size={20} />}
                    />
                    <StatusCard
                      label="Business (CAC)"
                      value="Not Submitted"
                      status="pending"
                      icon={<Clock size={20} />}
                    />
                    <StatusCard
                      label="KYC Level"
                      value="Level 2"
                      status="verified"
                      icon={<Shield size={20} />}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Danger Zone Section */}
          {activeSection === "danger" && (
            <div className="space-y-8">
              <SectionHeader
                icon={<AlertTriangle size={24} />}
                title="Danger Zone"
                description="Irreversible actions. Proceed with caution."
              />

              <Card className="border-2 border-red-100 shadow-sm rounded-[32px] bg-red-50/30">
                <CardContent className="p-8 space-y-6">
                  <DangerItem
                    title="Disable Account"
                    description="Temporarily disable your account. You can re-enable it later."
                    buttonLabel="Disable"
                    variant="outline"
                  />
                  <Separator className="bg-red-100" />
                  <DangerItem
                    title="Revoke All API Keys"
                    description="Invalidate all active API keys immediately."
                    buttonLabel="Revoke Keys"
                    variant="outline"
                  />
                  <Separator className="bg-red-100" />
                  <DangerItem
                    title="Delete Account"
                    description="Permanently delete your account and all associated data. This cannot be undone."
                    buttonLabel="Delete Account"
                    variant="destructive"
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// =============================================
// SUB-COMPONENTS
// =============================================




function StatusCard({
  label,
  value,
  status,
  icon,
}: {
  label: string;
  value: string;
  status: "verified" | "pending" | "failed" | "neutral";
  icon: ReactNode;
}) {
  return (
    <div
      className={cn(
        "p-5 rounded-2xl border",
        status === "verified" && "bg-green-50/50 border-green-100",
        status === "pending" && "bg-orange-50/50 border-orange-100",
        status === "failed" && "bg-red-50/50 border-red-100",
        status === "neutral" && "bg-gray-50/50 border-gray-100",
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
          {label}
        </p>
        <span
          className={cn(
            status === "verified" && "text-green-600",
            status === "pending" && "text-orange-600",
            status === "failed" && "text-red-600",
            status === "neutral" && "text-gray-400",
          )}
        >
          {icon}
        </span>
      </div>
      <p
        className={cn(
          "font-black text-lg",
          status === "verified" && "text-green-700",
          status === "pending" && "text-orange-700",
          status === "failed" && "text-red-700",
          status === "neutral" && "text-main-green",
        )}
      >
        {value}
      </p>
    </div>
  );
}




function NotificationToggle({
  label,
  description,
  enabled,
  onToggle,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onToggle?: (val: boolean) => void;
}) {
  return (
    <div
      className="flex items-center justify-between p-4 rounded-2xl bg-gray-50/30 border border-gray-100 hover:bg-gray-50/50 transition-colors cursor-pointer"
      onClick={() => onToggle && onToggle(!enabled)}
    >
      <div>
        <p className="font-bold text-main-green">{label}</p>
        <p className="text-xs text-gray-400 font-medium">{description}</p>
      </div>
      <div
        className={cn(
          "size-6 rounded-full flex items-center justify-center transition-colors",
          enabled ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400",
        )}
      >
        {enabled ? <Check size={14} /> : <X size={14} />}
      </div>
    </div>
  );
}

function DangerItem({
  title,
  description,
  buttonLabel,
  variant,
}: {
  title: string;
  description: string;
  buttonLabel: string;
  variant: "outline" | "destructive";
}) {
  return (
    <div className="flex items-center justify-between gap-6">
      <div>
        <p className="font-black text-red-700">{title}</p>
        <p className="text-sm text-red-600/70 font-medium">{description}</p>
      </div>
      <Button
        variant={variant === "destructive" ? "destructive" : "outline"}
        className={cn(
          "rounded-2xl font-bold h-11 px-6 shrink-0",
          variant === "outline" &&
          "border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700",
        )}
      >
        {buttonLabel}
      </Button>
    </div>
  );
}
