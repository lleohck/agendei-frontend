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

export default function ProfessionalsTable() {
  const [data, setData] = useState<ProfessionalResponse[]>([]);
  const [establishments, setEstablishments] = useState<EstablishmentResponse[]>(
    []
  );
  const [selectedEstablishmentId, setSelectedEstablishmentId] =
    useState<string>("");
  const [loading, setLoading] = useState(true);
  const { accessToken } = useUserRole();

  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;

    const loadEstablishments = async () => {
      try {
        const estData = await EstablishmentDAO.getAll(accessToken);

        if (isMounted) {
          setEstablishments(estData);
          if (estData.length > 0) {
            setSelectedEstablishmentId(estData[0].id);
          } else {
            setLoading(false);
          }
        }
      } catch (error) {
        console.error(error);
        if (isMounted) toast.error("Failed to load establishments filter.");
      }
    };

    loadEstablishments();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken || !selectedEstablishmentId) return;

    let isMounted = true;

    const fetchProfessionals = async () => {
      try {
        setLoading(true);
        const professionals = await ProfessionalDAO.getAll(
          accessToken,
          selectedEstablishmentId
        );

        if (isMounted) {
          setData(professionals);
        }
      } catch (error) {
        console.error(error);
        if (isMounted) {
          toast.error("Failed to load professionals list.");
          setData([]);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfessionals();

    return () => {
      isMounted = false;
    };
  }, [accessToken, selectedEstablishmentId]);

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
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
