"use client";

import { DataTable } from "@/components/shared/data-table/data-table";
import { columns } from "./columns";
import { useUserRole } from "@/hooks/use-user-role";
import { useEffect, useState } from "react";
import { AppointmentResponse, AppointmentStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { CheckCheck, XCircle } from "lucide-react";
import { toast } from "sonner";
import { AppointmentDAO } from "@/dao/appointment-dao";

export default function AppointmentTableV2() {
  const { accessToken } = useUserRole();
  const [data, setData] = useState<AppointmentResponse[]>([]);

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const fetchAppointments = async () => {
      try {
        const data = await AppointmentDAO.getMyAppointments(accessToken);
        setData(data);
      } catch (error) {
        toast.error("Failed to load appointments.");
        console.error("Load appointments error:", error);
      }
    };

    fetchAppointments();
  }, [accessToken]);

  const handleCancel = async (appointmentId: string) => {
    if (!accessToken) {
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
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
    if (!accessToken) {
      return;
    }
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      await AppointmentDAO.updateStatus(
        appointmentId,
        AppointmentStatus.COMPLETED,
        accessToken
      );

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
        cell: ({ row }: { row: { original: AppointmentResponse } }) => {
          const status = row.original.status;

          return (
            <div className="flex gap-2">
              {![
                AppointmentStatus.COMPLETED,
                AppointmentStatus.CANCELED,
              ].includes(status) && (
                <Button
                  variant="outline_destructive"
                  size="icon"
                  title="Cancel"
                  onClick={() => handleCancel(row.original.id)}
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              )}
              {status === AppointmentStatus.CONFIRMED && (
                <Button
                  variant="outline_success"
                  size="icon"
                  title="Complete"
                  onClick={() => handleComplete(row.original.id)}
                >
                  <CheckCheck className="h-4 w-4 mr-1" />
                </Button>
              )}
            </div>
          );
        },
      };
    }
    return col;
  });
  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <DataTable
          columns={columnsWithActions}
          data={data}
          filters={[{ columnId: "professional.name" }, { columnId: "status" }]}
        />
      </div>
    </div>
  );
}
