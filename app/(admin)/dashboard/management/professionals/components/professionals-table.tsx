"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
import { ProfessionalDAO, ProfessionalResponse } from "@/dao/professional-dao";
import {
  EstablishmentDAO,
  EstablishmentResponse,
} from "@/dao/establishment-dao";
import { useState, useEffect, useCallback } from "react";
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

export const columns: ColumnDef<ProfessionalResponse>[] = [
  {
    accessorKey: "name",
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
          {is_active ? "Active" : "Inactive"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => <div />,
  },
];

export default function ProfessionalsTable() {
  const [data, setData] = useState<ProfessionalResponse[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentResponse[]>(
    []
  );
  const [selectedEstablishmentId, setSelectedEstablishmentId] =
    useState<string>("");
  const [loading, setLoading] = useState(true);
  const { accessToken } = useUserRole();

  const refreshData = useCallback(() => {
    if (!accessToken || !selectedEstablishmentId) return;
    const fetchProfessionals = async () => {
      try {
        setLoading(true);
        const professionals = await ProfessionalDAO.getAll(
          accessToken,
          selectedEstablishmentId
        );
        setData(professionals);
      } catch (error) {
        console.error(error);
        toast.error("Failed to load professionals list.");
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProfessionals();
  }, [accessToken, selectedEstablishmentId]);

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

  useEffect(() => {
    if (selectedEstablishmentId) {
      refreshData();
    }
  }, [selectedEstablishmentId, accessToken, refreshData]);
  // Handler de exclusão
  const handleDelete = async (serviceId: string) => {
    if (
      !accessToken ||
      !confirm("Are you sure you want to delete this service?")
    )
      return;

    try {
      await ProfessionalDAO.delete(serviceId, accessToken);
      toast.success("Service deleted successfully.");
      refreshData();
    } catch (error) {
      console.error(error);
      toast.error("Failed to delete service.");
    }
  };

  const columnsWithActions = columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }) => {
          return (
            <div className="flex space-x-2">
              <Link
                href={`/dashboard/management/professionals/${row.original.id}`}
              >
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
