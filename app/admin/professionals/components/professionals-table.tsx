"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
import { ProfessionalDAO, ProfessionalResponse } from "@/dao/professional-dao";
// EstabelecimentoDAO e EstablishmentResponse foram removidos
import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
// Selects de filtro de estabelecimento foram removidos
import Link from "next/link";

// --- COLUNAS DA TABELA ---
export const columns: ColumnDef<ProfessionalResponse>[] = [
  {
    accessorKey: "name",
    header: "Nome",
  },
  {
    accessorKey: "email",
    header: "E-mail",
  },
  {
    accessorKey: "is_active",
    header: "Status",
    cell: ({ row }) => {
      const is_active = row.getValue("is_active");
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            is_active
              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
              : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
          }`}
        >
          {is_active ? "Ativo" : "Inativo"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: () => <div />,
  },
];

export default function ProfessionalsTable() {
  const [data, setData] = useState<ProfessionalResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useUserRole();

  const refreshData = useCallback(() => {
    if (!accessToken) return;
    const fetchProfessionals = async () => {
      try {
        setLoading(true);
        const professionals = await ProfessionalDAO.getAll(accessToken);
        setData(professionals);
      } catch (error) {
        console.error(error);
        toast.error("Falha ao carregar a lista de profissionais.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessionals();
  }, [accessToken]);

  useEffect(() => {
    if (accessToken) {
      refreshData();
    }
  }, [accessToken, refreshData]);

  const handleDelete = async (professionalId: string) => {
    const confirmed = window.confirm(
      "Tem certeza que deseja deletar este profissional? Esta ação é irreversível."
    );
    if (!accessToken || !confirmed) return;

    try {
      await ProfessionalDAO.delete(professionalId, accessToken);
      toast.success("Profissional deletado com sucesso.");
      refreshData();
    } catch (error) {
      console.error(error);
      toast.error("Falha ao deletar o profissional.");
    }
  };

  const columnsWithActions = columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }: { row: ProfessionalResponse }) => {
          return (
            <div className="flex space-x-2">
              <Link href={`/admin/professionals/${row.original.id}`}>
                <Button variant="outline" size="icon" title="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="icon"
                title="Deletar"
                onClick={() => handleDelete(row.original.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      };
    }
    return col;
  });

  if (loading && data.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  // Aviso: Se a lista de profissionais estiver vazia, o carregamento deve ser 'false'
  if (data.length === 0 && !loading) {
    return (
      <div className="p-6 text-center border-2 border-dashed rounded-lg">
        <h3 className="text-lg font-semibold">
          Nenhum profissional encontrado.
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          Cadastre o primeiro profissional para começar a agendar.
        </p>
        <Link href="/dashboard/management/professionals/create">
          <Button>Cadastrar Profissional</Button>
        </Link>
      </div>
    );
  }

  // O Select de filtro de estabelecimento foi removido do JSX

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <DataTable columns={columnsWithActions} data={data} />
      </div>
    </div>
  );
}
