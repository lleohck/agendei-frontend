import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AppointmentDAO } from "@/dao/appointment-dao";
import { UpcomingAppointmentSummary } from "@/dao/dashboard-dao";
import { useUserRole } from "@/hooks/use-user-role";
import { AppointmentStatus } from "@/lib/types";
import { format, parseISO } from "date-fns";
import { CheckCheck, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AppointmentListItem({
  appointment,
  onSuccess,
}: {
  appointment: UpcomingAppointmentSummary;
  onSuccess: () => void;
}) {
  const { accessToken } = useUserRole();
  const time = format(parseISO(appointment.start_dt), "HH:mm");
  const [isCompleting, setIsCompleting] = useState<boolean>(false);

  const handleComplete = async () => {
    const appointmentId = appointment.id;
    try {
      setIsCompleting(true);
      await AppointmentDAO.updateStatus(
        appointmentId,
        AppointmentStatus.COMPLETED,
        accessToken
      );

      toast.success("Agendamento marcado como concluído!");
      onSuccess();
    } catch (error) {
      console.error("Completion error:", error);
      toast.error("Failed to mark appointment as completed.");
    } finally {
      setIsCompleting(false);
    }
  };

  const getStatusVariant = () => {
    switch (appointment.status) {
      case AppointmentStatus.CONFIRMED:
        return "success";
      case AppointmentStatus.PENDING_PAYMENT:
        return "warning";
      default:
        return "default";
    }
  };

  const isConfirmed =
    appointment.status === AppointmentStatus.CONFIRMED ||
    appointment.status === AppointmentStatus.PENDING_PAYMENT;
  return (
    <div className="flex items-center justify-between p-3 border-b hover:bg-gray-50 transition-colors">
      <div className="flex items-center space-x-4">
        <div className="text-lg font-bold text-gray-700">{time}</div>
        <div>
          <p className="font-semibold">{appointment.service_name}</p>
          <p className="text-sm text-gray-500">
            {appointment.client_name} com {appointment.professional_name}
          </p>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Badge variant={getStatusVariant()}>
          {appointment.status === AppointmentStatus.CONFIRMED
            ? "Confirmado"
            : "Pendente"}
        </Badge>

        {isConfirmed && (
          <Button
            variant="outline_success"
            size="sm"
            onClick={handleComplete}
            disabled={isCompleting}
          >
            {isCompleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <CheckCheck className="h-4 w-4 mr-1" />
                Concluir
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
