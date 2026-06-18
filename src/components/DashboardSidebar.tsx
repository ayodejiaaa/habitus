"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  ClipboardList, 
  FileText, 
  Settings, 
  Users, 
  LogOut
} from "lucide-react";

interface SidebarProps {
  role: "CLIENT" | "ADMIN";
}

export default function DashboardSidebar({ role }: SidebarProps) {
  const pathname = usePathname();
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
    <aside className="w-64 bg-white border-r border-border flex flex-col shrink-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-border flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-xl font-extrabold tracking-tight text-primary">Habitus</span>
          <span className="h-2 w-2 rounded-full bg-accent"></span>
        </Link>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
          {isAdmin ? "Admin" : "Client"}
        </span>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-4 space-y-1.5">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(link.href + "/");
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
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
            import("next-auth/react").then((mod) => mod.signOut({ callbackUrl: "/" }));
          }}
          className="w-full flex items-center space-x-3 px-4 py-3 rounded-md text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
