"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
import { ServiceDAO, ServiceResponse } from "@/dao/service-dao";
import { useState, useEffect, useCallback } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

export const columns: ColumnDef<ServiceResponse>[] = [
  {
    accessorKey: "name",
    header: "Nome do Serviço",
  },
  {
    accessorKey: "base_price",
    header: "Preço Base",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("base_price"));
      const formatted = new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(amount);
      return <div className="font-medium">{formatted}</div>;
    },
  },
  {
    accessorKey: "base_duration_minutes",
    header: "Duração",
    cell: ({ row }) => {
      return <div>{row.getValue("base_duration_minutes")} min</div>;
    },
  },
  {
    id: "actions",
    header: "Ações",
    cell: () => <div />,
  },
];

export default function ServicesTable() {
  const [data, setData] = useState<ServiceResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useUserRole();

  const refreshData = useCallback(() => {
    if (!accessToken) return;

    const fetchServices = async () => {
      try {
        setLoading(true);
        const services = await ServiceDAO.getAll(accessToken);
        setData(services);
      } catch (error) {
        console.error(error);
        toast.error("Falha ao carregar a lista de serviços.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [accessToken]);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const handleDelete = async (serviceId: string, serviceName: string) => {
    if (!accessToken) return;

    toast.warning(`Excluindo o serviço: ${serviceName}...`);

    try {
      await ServiceDAO.delete(serviceId, accessToken);
      toast.success(`Serviço "${serviceName}" excluído com sucesso.`);
      refreshData();
    } catch (error) {
      console.error(error);
      toast.error("Falha ao excluir o serviço. Verifique as dependências.");
    }
  };

  const columnsWithActions = columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }: {row: {original: ServiceResponse}}) => {
          return (
            <div className="flex space-x-2">
              <Link href={`/admin/services/${row.original.id}`}>
                <Button variant="outline" size="icon" title="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="icon"
                title="Excluir"
                onClick={() => handleDelete(row.original.id, row.original.name)}
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

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <DataTable columns={columnsWithActions} data={data} />
      </div>
    </div>
  );
}
