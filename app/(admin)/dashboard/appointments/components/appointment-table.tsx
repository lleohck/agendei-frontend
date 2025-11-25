"use client";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserRole } from "@/hooks/use-user-role";
import { useState, useEffect } from "react";
import { CheckCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AppointmentDAO } from "@/dao/appointment-dao";
import { AppointmentResponse, AppointmentStatus } from "@/lib/types";
import { ptBR } from "date-fns/locale/pt-BR";
import { format, parseISO } from "date-fns";
import StatusBadge from "./appointment-status";

// Definição das Colunas da Tabela
export const columns: ColumnDef<AppointmentResponse[]>[] = [
  {
    accessorKey: "date",
    header: "Date",
    cell: ({ row }) => {
      return format(parseISO(row.original.start_dt), "dd/MM/yyyy", {
        locale: ptBR,
      });
    },
  },
  {
    accessorKey: "time",
    header: "Time",
    cell: ({ row }) => {
      return (
        `${format(parseISO(row.original.start_dt), "HH:mm")} - ` +
        `${format(parseISO(row.original.end_dt), "HH:mm")}`
      );
    },
  },
  {
    accessorKey: "professional",
    header: "Professional",
    cell: ({ row }) => row.original.professional.name,
  },
  {
    accessorKey: "service",
    header: "Service",
    cell: ({ row }) => row.original.service.name,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Actions",
    // O conteúdo desta célula será substituído dinamicamente na função principal
    cell: () => <div />,
  },
];

export default function AppointmentTable() {
  const { accessToken } = useUserRole();
  const [data, setData] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        const data = await AppointmentDAO.getMyAppointments(accessToken);
        setData(data);
      } catch (error) {
        toast.error("Failed to load appointments.");
        console.error("Load appointments error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, [accessToken]);

  const handleCancel = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      // CHAMA O NOVO MÉTODO DO DAO
      await AppointmentDAO.updateStatus(
        appointmentId,
        AppointmentStatus.CANCELED,
        accessToken
      );

      // Atualiza o estado local para refletir o cancelamento
      setData((prev) =>
        prev.map((a) =>
          a.id === appointmentId
            ? { ...a, status: AppointmentStatus.CANCELED }
            : a
        )
      );

      toast.success("Appointment canceled successfully.");
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error("Failed to cancel appointment. Check permissions.");
    }
  };

  const handleComplete = async (appointmentId: string) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      // CHAMA O NOVO MÉTODO DO DAO
      await AppointmentDAO.updateStatus(
        appointmentId,
        AppointmentStatus.COMPLETED,
        accessToken
      );

      // Atualiza o estado local para refletir o cancelamento
      setData((prev) =>
        prev.map((a) =>
          a.id === appointmentId
            ? { ...a, status: AppointmentStatus.COMPLETED }
            : a
        )
      );

      toast.success("Appointment completed successfully.");
    } catch (error) {
      console.error("Cancellation error:", error);
      toast.error("Failed to complete appointment. Check permissions.");
    }
  };

  // Mapeamento das colunas para injetar o handler de exclusão e o link de edição
  const columnsWithActions = columns.map((col) => {
    if (col.id === "actions") {
      return {
        ...col,
        cell: ({ row }) => {
          const status = row.original.status;

          return (
            <div className="flex gap-2">
              {![
                AppointmentStatus.COMPLETED,
                AppointmentStatus.CANCELED,
              ].includes(status) && (
                <Button
                  variant="outline_destructive"
                  size="sm"
                  title="Cancel"
                  onClick={() => handleCancel(row.original.id)}
                >
                  <XCircle className="h-4 w-4" />
                  Cancelar
                </Button>
              )}
              {status === AppointmentStatus.CONFIRMED && (
                <Button
                  variant="outline_success"
                  size="sm"
                  title="Complete"
                  onClick={() => handleComplete(row.original.id)}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Concluir
                </Button>
              )}
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
        <Skeleton className="h-40 w-full" />
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
