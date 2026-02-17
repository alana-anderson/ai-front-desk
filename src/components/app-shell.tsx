"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

type User = {
  id: string;
  name: string;
  role: string;
  organization: { name: string } | null;
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase();
}

const navItems = [
  { href: "/dashboard", icon: HomeIcon, label: "Home" },
  { href: "/chat", icon: ChatIcon, label: "Chat" },
];

const operatorNavItems = [
  { href: "/dashboard", icon: HomeIcon, label: "Home" },
  { href: "/chat", icon: ChatIcon, label: "Chat" },
  { href: "/knowledge", icon: BookIcon, label: "Knowledge" },
  { href: "/questions", icon: InboxIcon, label: "Questions" },
];

export function AppShell({
  children,
  user,
  isOperator,
}: {
  children: React.ReactNode;
  user: User;
  isOperator: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const items = isOperator ? operatorNavItems : navItems;
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    setMobileOpen(false);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      {/* ===== DESKTOP SIDEBAR (hidden on mobile) ===== */}
      <aside className="hidden md:flex w-16 bg-white border-r border-slate-100 flex-col items-center py-4 gap-2 shrink-0 fixed top-0 left-0 h-screen z-50">
        <div className="w-9 h-9 rounded-xl overflow-hidden mb-4">
          <Image src="/fav.png" alt="Logo" width={36} height={36} className="object-contain" />
        </div>
        <nav className="flex flex-col items-center gap-1 flex-1">
          {items.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Tooltip key={item.href}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon />
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" sideOffset={8}>
                  {item.label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </nav>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleLogout}
              className="mt-auto mb-2 cursor-pointer rounded-full transition-transform hover:scale-110 hover:ring-2 hover:ring-indigo-200 hover:ring-offset-2"
            >
              <Avatar className="h-9 w-9 bg-indigo-50 text-indigo-700">
                <AvatarFallback className="bg-indigo-50 text-indigo-700 text-xs font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
            </button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={8}>
            Choose account
          </TooltipContent>
        </Tooltip>
      </aside>

      {/* ===== MOBILE TOP BAR (hidden on desktop) ===== */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-14 bg-white border-b border-slate-100 flex items-center justify-between px-4 z-50">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
              <Menu className="w-5 h-5" />
            </button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0 [&>button]:hidden">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            {/* Drawer header */}
            <div className="p-5 border-b border-slate-100 bg-gradient-to-b from-indigo-50/50 to-white">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Avatar className="h-11 w-11 bg-indigo-100 text-indigo-700">
                    <AvatarFallback className="bg-indigo-100 text-indigo-700 text-sm font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="text-xs text-slate-400 capitalize">{user.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Drawer nav items */}
            <nav className="flex flex-col p-3 gap-1">
              {items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-colors ${
                      isActive
                        ? "bg-indigo-50 text-indigo-600"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    <item.icon />
                    <span className="text-sm font-medium">{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Drawer footer */}
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-100">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-3 rounded-xl text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                </svg>
                <span className="text-sm font-medium">Switch Account</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Center logo */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Image src="/logo.png" alt="Logo" width={32} height={32} className="object-contain" />
        </div>

        {/* Right avatar */}
        <button
          onClick={handleLogout}
          className="w-10 h-10 rounded-full flex items-center justify-center"
        >
          <Avatar className="h-8 w-8 bg-indigo-50 text-indigo-700">
            <AvatarFallback className="bg-indigo-50 text-indigo-700 text-[10px] font-semibold">
              {getInitials(user.name)}
            </AvatarFallback>
          </Avatar>
        </button>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 overflow-y-auto ml-0 md:ml-16 mt-14 md:mt-0">{children}</main>
    </div>
  );
}

function HomeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955a1.126 1.126 0 0 1 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    </svg>
  );
}

function BookIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function InboxIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 0 1 2.012 1.244l.256.512a2.25 2.25 0 0 0 2.013 1.244h3.218a2.25 2.25 0 0 0 2.013-1.244l.256-.512a2.25 2.25 0 0 1 2.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 0 0-2.15-1.588H6.911a2.25 2.25 0 0 0-2.15 1.588L2.35 13.177a2.25 2.25 0 0 0-.1.661Z" />
    </svg>
  );
}
