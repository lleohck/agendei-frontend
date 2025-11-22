"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";

// Tipagem dos dados do profissional (deve refletir o backend)
interface Professional {
  id: number;
  email: string;
  fullName: string;
  role: string; // ESTABLISHMENT_OWNER, PROFESSIONAL, etc.
  isActive: boolean;
}

// 1. Definição das Colunas
// Note que esta definição é exportada e será usada pelo DataTable
export const columns: ColumnDef<Professional>[] = [
  {
    accessorKey: "fullName",
    header: "Name",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Role",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive");
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            isActive
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {isActive ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  // Coluna de Ações (Edit/Delete)
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex space-x-2">
        <Button variant="outline" size="icon" title="Edit">
          <Pencil className="h-4 w-4" />
        </Button>
        <Button variant="destructive" size="icon" title="Delete">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    ),
  },
];

// 2. Componente Principal
export default function ProfessionalsTable() {
  const [data, setData] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useUserRole(); // Agora isso funciona!

  // Função para simular a chamada API (Substituir pela chamada real com 'api.get')
  const fetchProfessionals = async (token: string) => {
    // --- Substituir esta simulação pela chamada real à API ---
    // Ex: const response = await api.get('/v1/professionals', { headers: { Authorization: `Bearer ${token}` } })
    //     return response.data
    return new Promise<Professional[]>((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 1,
            email: "ana@agendei.com",
            fullName: "Ana Silva",
            role: "PROFESSIONAL",
            isActive: true,
          },
          {
            id: 2,
            email: "rui@agendei.com",
            fullName: "Rui Barbosa",
            role: "PROFESSIONAL",
            isActive: false,
          },
          {
            id: 3,
            email: "carlos@agendei.com",
            fullName: "Carlos Mota",
            role: "ESTABLISHMENT_OWNER",
            isActive: true,
          },
        ]);
      }, 1500);
    });
  };

  useEffect(() => {
    if (accessToken) {
      setLoading(true);
      fetchProfessionals(accessToken)
        .then((fetchedData) => {
          setData(fetchedData);
        })
        .finally(() => {
          setLoading(false);
        });
    }
    // Caso o accessToken mude (e.g., login/logout), a tabela recarrega
  }, [accessToken]);

  // Lógica de Skeleton Loading
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
      <DataTable columns={columns} data={data} />
    </div>
  );
}
