"use client";

import { Button } from "@/components/ui/button";
import { Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import {
  EstablishmentDAO,
  EstablishmentResponse,
} from "@/dao/establishment-dao";
import { useUserRole } from "@/hooks/use-user-role";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

export const columns: ColumnDef<EstablishmentResponse>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "slug",
    header: "Slug (URL)",
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <Button variant="outline" size="icon" title="Edit">
        <Pencil className="h-4 w-4" />
      </Button>
    ),
  },
];

export default function EstablishmentsPage() {
  const [data, setData] = useState<EstablishmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const { accessToken } = useUserRole();

  useEffect(() => {
    if (!accessToken) return;

    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await EstablishmentDAO.getAll(accessToken);
        if (isMounted) setData(result);
      } catch (error) {
        console.error(error);
        if (isMounted) toast.error("Failed to load establishments");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Establishments</h1>
        <Link href="/dashboard/management/establishments/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Establishment
          </Button>
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <DataTable columns={columns} data={data} />
      </div>
    </div>
  );
}
