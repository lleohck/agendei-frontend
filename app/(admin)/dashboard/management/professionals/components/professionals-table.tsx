"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
import { ProfessionalDAO } from "@/dao/professional-dao";
import { useState, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Professional {
  id: number;
  email: string;
  name: string;
  role: string;
  is_active: boolean;
}

export const columns: ColumnDef<Professional>[] = [
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
      const isActive = row.getValue("is_active");
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
  const [data, setData] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken, establishmentId } = useUserRole();
  console.log("Access Token:", accessToken);
  console.log("Establishment ID:", establishmentId);

  const fetchProfessionals = async (token: string, id: number) => {
    try {
      const professionals = await ProfessionalDAO.getProfessionals(token, id);
      setData(professionals);
    } catch (error) {
      console.error("Failed to fetch professionals:", error);
      toast.error("Failed to load professionals list. Check API connection.");
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken && establishmentId) {
      setLoading(true);
      fetchProfessionals(accessToken, establishmentId);
    } else if (!loading) {
      setData([]);
      toast.warning("Establishment ID not found in session. Cannot load list.");
    }
  }, [accessToken, establishmentId]);

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
