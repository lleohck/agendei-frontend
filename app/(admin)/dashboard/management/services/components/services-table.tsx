"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
import { ServiceDAO, ServiceResponse } from "@/dao/service-dao";
import {
  EstablishmentDAO,
  EstablishmentResponse,
} from "@/dao/establishment-dao";
import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Link from "next/link";

// Definição das Colunas da Tabela
export const columns: ColumnDef<ServiceResponse>[] = [
  {
    accessorKey: "name",
    header: "Service Name",
  },
  {
    accessorKey: "base_price",
    header: "Price",
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
    header: "Duration",
    cell: ({ row }) => {
      return <div>{row.getValue("base_duration_minutes")} min</div>;
    },
  },
  {
    id: "actions",
    header: "Actions",
    // O conteúdo desta célula será substituído dinamicamente na função principal
    cell: () => <div />,
  },
];

export default function ServicesTable() {
  const [data, setData] = useState<ServiceResponse[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentResponse[]>(
    []
  );
  const [selectedEstablishmentId, setSelectedEstablishmentId] =
    useState<string>("");
  const [loading, setLoading] = useState(true);
  const { accessToken } = useUserRole();

  // Função para carregar os serviços do estabelecimento selecionado
  const refreshData = () => {
    if (!accessToken || !selectedEstablishmentId) return;

    const fetchServices = async () => {
      try {
        setLoading(true);
        const services = await ServiceDAO.getAll(
          accessToken,
          selectedEstablishmentId
        );
        setData(services);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load services list.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  };

  // Effect para carregar os estabelecimentos na montagem
  useEffect(() => {
    if (!accessToken) return;

    const loadEstablishments = async () => {
      try {
        const estData = await EstablishmentDAO.getAll(accessToken);

        setEstablishments(estData);
        if (estData.length > 0) {
          setSelectedEstablishmentId(estData[0].id);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load establishments filter.");
      }
    };

    loadEstablishments();
  }, [accessToken]);

  // Effect para recarregar os serviços quando o ID do estabelecimento mudar
  useEffect(() => {
    if (selectedEstablishmentId) {
      refreshData();
    }
  }, [selectedEstablishmentId, accessToken]);

  // Handler de exclusão
  const handleDelete = async (serviceId: string) => {
    if (
      !accessToken ||
      !confirm("Are you sure you want to delete this service?")
    )
      return;

    try {
      await ServiceDAO.delete(serviceId, accessToken);
      toast.success("Service deleted successfully.");
      refreshData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete service.");
    }
  };

  // Mapeamento das colunas para injetar o handler de exclusão e o link de edição
  const columnsWithActions = columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }) => {
          return (
            <div className="flex space-x-2">
              <Link href={`/dashboard/management/services/${row.original.id}`}>
                <Button variant="outline" size="icon" title="Edit">
                  <Pencil className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="destructive"
                size="icon"
                title="Delete"
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

  if (loading && data.length === 0 && establishments.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-[250px]">
        <Select
          value={selectedEstablishmentId}
          onValueChange={setSelectedEstablishmentId}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Establishment" />
          </SelectTrigger>
          <SelectContent>
            {establishments.map((est) => (
              <SelectItem key={est.id} value={est.id.toString()}>
                {est.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <DataTable columns={columnsWithActions} data={data} />
      </div>
    </div>
  );
}
