"use client";

import {
  LayoutDashboard,
  Users,
  TrendingUp,
  FileText,
  Folder,
  Calendar,
  Building2,
  Settings,
  Plus,
  LogOut,
  Bell,
  MoreHorizontal,
  Rocket,
  User2,
  CreditCard,
  HandCoins,
  Search,
  Command,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import {
  useEffect,
  useState,
  useRef,
  createContext,
  useContext,
  SetStateAction,
  Dispatch,
} from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useUser } from "../../hooks/use-user";
import { logoutUser } from "../../lib/logout";
import { Skeleton } from "@/components/ui/skeleton";

interface DashboardSidebarProps {
  setUpgradeModal: Dispatch<SetStateAction<boolean>>;
  upgradeModal: boolean;
}

const navLinks = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/wallet", icon: Wallet, label: "Wallet" },
  { href: "/dashboard/apps", icon: CreditCard, label: "Loan Apps" },
  { href: "/dashboard/applications", icon: Users, label: "Applications" },
  { href: "/dashboard/loans", icon: HandCoins, label: "Active Loans" },
  { href: "/dashboard/notifications", icon: Bell, label: "Notifications" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

// Context for Sidebar State
type SidebarContextType = {
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
};

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
}

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <SidebarContext.Provider
      value={{
        isMobileOpen,
        setIsMobileOpen,
        isCollapsed,
        toggleCollapse: toggleCollapse,
      }}
    >
      {children}
    </SidebarContext.Provider>
  );
}

function SidebarContent({
  isCollapsed,
  setUpgradeModal,
  upgradeModal,
  setIsMobileOpen,
  isMobileOpen,
}: {
  isCollapsed: boolean;
  upgradeModal: boolean;
  setUpgradeModal: Dispatch<SetStateAction<boolean>>;
  setIsMobileOpen: (open: boolean) => void;
  isMobileOpen: boolean;
}) {
  const pathname = usePathname();
  const { user } = useUser();

  console.log(user, "USER")
  const showUpgrade = user?.plan !== "Enterprise";

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Navigation Menu */}
      <div
        className={cn(
          "flex-1 bg-white/60 backdrop-blur-xl border border-gray-100/80 rounded-3xl p-3 shadow-sm h-fit flex flex-col gap-1.5 overflow-y-auto scrollbar-hide transition-all duration-300",
          isCollapsed && "items-center px-2",
        )}
      >
        {navLinks.map((link) => {
          const isActive = pathname === link.href;
          return (
            <Link
              key={link.href}
              href={link.href}
              title={isCollapsed ? link.label : undefined}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-200 group relative",
                isActive
                  ? "text-black"
                  : "text-gray-500 hover:text-black hover:bg-gray-50/50",
                isCollapsed && "px-2 justify-center w-full",
              )}
            >
              <link.icon
                size={18}
                className={cn(
                  "transition-colors shrink-0 relative z-10",
                  isActive
                    ? "text-black"
                    : "text-gray-400 group-hover:text-black",
                )}
              />
              {!isCollapsed && (
                <span className="relative z-10 whitespace-nowrap">
                  {link.label}
                </span>
              )}
              {isActive && (
                <motion.div
                  layoutId="active-sidebar"
                  className="absolute inset-0 bg-lemon-primary shadow-[0_2px_10px_rgba(189,244,157,0.4)] border border-lemon-primary/50 rounded-2xl z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Upgrade CTA Card */}
      {showUpgrade && !isCollapsed && (
        <div
          onClick={() => {
            setUpgradeModal(true);
            setIsMobileOpen(false);
          }}
          className="relative my-2 bg-gradient-to-br from-lemon-primary to-[#aee68a] rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-lemon-primary/20 overflow-hidden group cursor-pointer"
        >
          <div className="absolute -right-8 -bottom-8 size-32 bg-white/20 rounded-full blur-2xl group-hover:bg-white/30 transition-all duration-500 group-hover:scale-110" />
          <div className="absolute -left-8 -top-8 size-24 bg-main-green/5 rounded-full blur-xl" />

          <div className="relative z-10 space-y-3">
            <div className="flex items-start gap-3">
              <div className="size-8 rounded-lg bg-white/40 flex items-center justify-center shrink-0 backdrop-blur-sm border border-white/50">
                <Rocket size={16} className="text-main-green" />
              </div>

              <p className="text-[13px] font-bold text-main-green leading-snug pt-0.5">
                Upgrade for additional features.
              </p>
            </div>
            <Button className="w-full bg-main-green text-white hover:bg-main-green/90 rounded-xl font-bold text-xs h-9 shadow-sm transition-transform active:scale-95 border border-transparent hover:border-white/10">
              Upgrade Now
            </Button>
          </div>
        </div>
      )}
      {showUpgrade && isCollapsed && (
        <div
          onClick={() => {
            setUpgradeModal(true);
            setIsMobileOpen(false);
          }}
          className="flex justify-center my-3"
        >
          <div
            className="size-10 bg-lemon-primary rounded-xl flex items-center justify-center cursor-pointer shadow-lg"
            title="Upgrade for additional features"
          >
            <Rocket size={20} className="text-black fill-white" />
          </div>
        </div>
      )}


      <form action={logoutUser} className={cn(
        "mt-auto bg-white border border-gray-100 cursor-pointer rounded-3xl p-3 shadow-sm hover:border-red-100 hover:bg-red-50/50 transition-all group",
        isCollapsed && "flex justify-center p-3",
      )}>
        <button className="flex gap-3 cursor-pointer items-center font-semibold text-[13px] text-gray-600 group-hover:text-red-600 w-full px-2 py-1.5">
          <LogOut className="text-gray-400 group-hover:text-red-500 transition-colors" size={18} />
          {!isCollapsed && "Log out"}
        </button>
      </form>

    </div>
  );
}

export function DashboardSidebar({
  setUpgradeModal,
  upgradeModal,
}: Readonly<DashboardSidebarProps>) {
  const { isMobileOpen, setIsMobileOpen, isCollapsed, toggleCollapse } =
    useSidebar();

  return (
    <>
      {/* Mobile Sheet */}
      <Sheet open={isMobileOpen} onOpenChange={setIsMobileOpen}>
        <SheetContent
          side="left"
          className="p-4 w-[280px] bg-white border-none"
        >
          <SidebarContent
            setUpgradeModal={setUpgradeModal}
            upgradeModal={upgradeModal}
            isCollapsed={false}
            setIsMobileOpen={setIsMobileOpen}
            isMobileOpen={isMobileOpen}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col justify-between sticky top-0 h-screen p-4 gap-4 transition-all duration-300",
          isCollapsed ? "w-[100px]" : "w-[280px]",
        )}
      >
        {/* Collapse Toggle */}
        <div className="flex justify-start">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapse}
            className="text-gray-500 hover:text-black"
          >
            {isCollapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
          </Button>
        </div>

        <SidebarContent
          setUpgradeModal={setUpgradeModal}
          upgradeModal={upgradeModal}
          isCollapsed={isCollapsed}
          setIsMobileOpen={setIsMobileOpen}
          isMobileOpen={isMobileOpen}
        />
      </aside>
    </>
  );
}

export function DashboardHeader() {
  const { user, isLoading } = useUser();
  const { setIsMobileOpen } = useSidebar();
  const [isFocused, setIsFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsFocused(false);
      }
    };

    globalThis.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      globalThis.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredLinks = navLinks.filter((link) =>
    link.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <header className="h-[72px] bg-white/80 backdrop-blur-xl border-b border-gray-100/80 px-4 md:px-8 flex gap-4 md:gap-8 items-center justify-between sticky top-0 z-40">
      {/* Mobile Menu Button */}
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden shrink-0"
        onClick={() => setIsMobileOpen(true)}
      >
        <Menu className="h-6 w-6" />
        <span className="sr-only">Toggle menu</span>
      </Button>

      <div className="flex-1 _max-w-md relative" ref={searchRef}>
        <div className="relative group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-main-green transition-colors"
            size={16}
          />
          <Input
            ref={inputRef}
            placeholder="Search dashboard..."
            className="pl-11 pr-12 h-10 bg-gray-50/80 hover:bg-gray-50 border-gray-200/60 rounded-xl focus-visible:ring-1 focus-visible:ring-lemon-primary focus-visible:border-main-green focus-visible:bg-white transition-all text-[13px] font-medium placeholder:text-gray-400 w-full shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 md:flex hidden items-center gap-1 bg-white border border-gray-200 px-1.5 py-1 rounded-md shadow-sm pointer-events-none">
            <Command size={10} className="text-gray-400" />
            <span className="text-[10px] font-black text-gray-400">K</span>
          </div>
        </div>

        <AnimatePresence>
          {isFocused && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              className="md:absolute fixed w-[95%] mx-auto top-[10vh] md:top-full left-0 right-0 mt-3 bg-white rounded-3xl border border-gray-100 shadow-2xl p-2 z-50 overflow-hidden"
            >
              <div className="p-3">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">
                  Quick Links
                </p>
                <div className="space-y-1">
                  {filteredLinks.length > 0 ? (
                    filteredLinks.map((link) => (
                      <button
                        key={link.href}
                        onClick={() => {
                          router.push(link.href);
                          setIsFocused(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-lemon-primary/10 text-sm font-bold text-gray-600 hover:text-main-green transition-all text-left group"
                      >
                        <div className="size-8 rounded-lg bg-gray-50 flex items-center justify-center group-hover:bg-lemon-primary transition-colors">
                          <link.icon
                            size={16}
                            className="text-gray-400 group-hover:text-main-green"
                          />
                        </div>
                        {link.label}
                      </button>
                    ))
                  ) : (
                    <p className="p-4 text-sm text-gray-400 text-center font-medium italic">
                      No results found for "{searchQuery}"
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 md:gap-4 shrink-0">
        <div className="flex items-center bg-white border border-gray-100 rounded-xl p-1 shadow-sm hover:bg-gray-50 transition-colors">
          <Button
            size="icon"
            variant="ghost"
            className="rounded-lg text-gray-400 hover:text-gray-600 size-9"
          >
            <Bell size={18} />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-1 md:gap-3 bg-white border border-gray-100 rounded-2xl md:p-1.5 md:px-2 shadow-sm p-1 min-w-[140px]">
            <Skeleton className="size-8 md:size-10 rounded-full" />
            <div className="md:flex flex-col hidden gap-1.5">
              <Skeleton className="h-3 w-20 rounded-md" />
              <Skeleton className="h-2.5 w-24 rounded-md" />
            </div>
          </div>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-2 md:gap-3 bg-white border border-gray-100 rounded-2xl md:py-1.5 md:pl-1.5 md:pr-4 shadow-sm cursor-pointer hover:bg-gray-50 transition-all active:scale-[0.98]">
                <Avatar className="size-8 md:size-9 rounded-full border border-gray-200 shadow-sm">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-lemon-primary text-main-green font-bold text-xs">
                    {user?.fullName?.charAt(0) || <User2 className="size-4" />}
                  </AvatarFallback>
                </Avatar>
                <div className="md:flex flex-col hidden text-left">
                  <p className="font-bold text-[13px] leading-tight text-gray-800">{user?.fullName}</p>
                  <p className="text-[11px] text-gray-500 font-medium truncate max-w-[120px] mt-0.5">{user?.email}</p>
                </div>
              </div>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-[220px] rounded-[24px] p-2 shadow-2xl border-gray-100"
            >
              <div className="px-3 py-3 md:hidden">
                <p className="font-bold text-sm">{user?.fullName}</p>
                <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
              </div>
              <DropdownMenuSeparator className="md:hidden" />
              <DropdownMenuLabel className="px-3 pt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                My Account
              </DropdownMenuLabel>
              <DropdownMenuItem
                className="rounded-xl px-3 py-2.5 font-bold cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => router.push("/dashboard/settings")}
              >
                <Settings className="mr-3 h-4 w-4 text-gray-400" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2 bg-gray-100" />
              <form action={logoutUser} className="w-full">
                <DropdownMenuItem asChild className="rounded-xl px-0 py-0">
                  <button type="submit" className="w-full flex items-center px-3 py-2.5 text-red-600 font-bold hover:bg-red-50 transition-colors rounded-xl">
                    <LogOut className="mr-3 h-4 w-4 text-red-500" /> Logout
                  </button>
                </DropdownMenuItem>
              </form>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
