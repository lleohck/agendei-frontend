"use client";

import Link from "next/link";
import {
  Calendar,
  LayoutDashboard,
  Settings,
  Users,
  Briefcase,
} from "lucide-react";
import { LogoutButton } from "@/components/features/login/logout-button";
import { useUserRole } from "@/hooks/use-user-role";
import { UserRole } from "@/lib/types";

const navigationItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    roles: [
      UserRole.ADMIN,
      UserRole.ESTABLISHMENT_OWNER,
      UserRole.PROFESSIONAL,
    ],
  },
  {
    name: "Agenda",
    href: "/admin/appointments",
    icon: Calendar,
    roles: [
      UserRole.ADMIN,
      UserRole.ESTABLISHMENT_OWNER,
      UserRole.PROFESSIONAL,
    ],
  },
  {
    name: "Profissionais",
    href: "/admin/professionals",
    icon: Users,
    roles: [UserRole.ADMIN, UserRole.ESTABLISHMENT_OWNER],
  },
  {
    name: "Serviços",
    href: "/admin/services",
    icon: Briefcase,
    roles: [UserRole.ADMIN, UserRole.ESTABLISHMENT_OWNER],
  },
];

export function Sidebar() {
  const { userRole, isLoading } = useUserRole();

  // Se o hook está carregando, não renderiza a navegação
  if (isLoading) {
    return (
      <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen">
        <div className="flex items-center justify-center h-20 border-b">
          <p className="animate-pulse text-gray-400">Loading...</p>
        </div>
        <div className="p-4 flex-1"></div>
        <div className="p-4 border-t"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-center h-20 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400">
          AGENDEL
        </h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navigationItems
          .filter((item) => item.roles.includes(userRole))
          .map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition duration-150"
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </Link>
          ))}
      </nav>

      {[UserRole.ADMIN, UserRole.ESTABLISHMENT_OWNER].includes(userRole) && (
        <Link
          key="ajustes"
          href="/dashboard/management/establishment"
          className="flex items-center px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition duration-150"
        >
          <Settings className="h-5 w-5 mr-3" />
          Ajustes
        </Link>
      )}
      {/* Logout na parte inferior */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <LogoutButton />
      </div>
    </div>
  );
}
