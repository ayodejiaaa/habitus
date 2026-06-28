"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  ClipboardList, 
  FileText, 
  Settings, 
  Users, 
  LogOut,
  Menu,
  X
} from "lucide-react";

interface SidebarProps {
  role: "CLIENT" | "ADMIN";
}

export default function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isAdmin = role === "ADMIN";

  const clientLinks = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Inspection Requests", href: "/dashboard/requests", icon: ClipboardList },
    { name: "Reports", href: "/dashboard/reports", icon: FileText },
    { name: "Settings", href: "/dashboard/settings", icon: Settings },
  ];

  const adminLinks = [
    { name: "Requests Manager", href: "/admin/requests", icon: ClipboardList },
    { name: "Report Builder", href: "/admin/reports", icon: FileText },
    { name: "Manage Services", href: "/admin/services", icon: Settings },
    { name: "Manage Users", href: "/admin/users", icon: Users },
  ];

  const links = isAdmin ? adminLinks : clientLinks;

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-border sticky top-0 z-40 w-full shrink-0">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-black tracking-tight text-primary">Habitus</span>
          <span className="h-2 w-2 rounded-full bg-accent"></span>
        </Link>
        <button
          onClick={() => setIsOpen(true)}
          className="p-2 rounded-lg border border-border bg-white text-charcoal hover:bg-gray-50 focus:outline-none cursor-pointer"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Backdrop for Mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-45 md:hidden animate-in fade-in duration-200"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar aside */}
      <aside 
        className={cn(
          "bg-white border-r border-border flex flex-col shrink-0 transition-transform duration-250 ease-in-out z-50 w-64",
          // Mobile state
          "fixed inset-y-0 left-0 shadow-2xl md:shadow-none",
          isOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop state
          "md:translate-x-0 md:static md:flex md:h-screen md:sticky md:top-0"
        )}
      >
        {/* Brand Header */}
        <div className="p-6 border-b border-border flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2" onClick={() => setIsOpen(false)}>
            <span className="text-xl font-extrabold tracking-tight text-primary">Habitus</span>
            <span className="h-2 w-2 rounded-full bg-accent"></span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
              {isAdmin ? "Admin" : "Client"}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-charcoal cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {links.map((link) => {
            const isActive = link.href === "/dashboard" || link.href === "/admin"
              ? pathname === link.href
              : pathname === link.href || pathname.startsWith(link.href + "/");
            const Icon = link.icon;
            return (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={cn(
                  "flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-semibold transition-all duration-150",
                  isActive 
                    ? "bg-primary text-white shadow-sm" 
                    : "text-gray-600 hover:bg-gray-50 hover:text-charcoal"
                )}
              >
                <Icon className="h-5 w-5" />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer / Sign Out */}
        <div className="p-4 border-t border-border">
          <button
            onClick={() => {
              setIsOpen(false);
              signOut({ callbackUrl: "/" });
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
