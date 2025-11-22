import { ReactNode } from "react";
import { Sidebar } from "@/components/shared/sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 1. Sidebar (Barra de Navegação Lateral) */}
      <Sidebar />

      {/* 2. Conteúdo Principal */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 sm:p-6 lg:p-8">
        {/* Aqui você pode adicionar um Header (que faremos a seguir) */}
        <div className="w-full">{children}</div>
      </main>
    </div>
  );
}
