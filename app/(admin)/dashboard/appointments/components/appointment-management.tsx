"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, CalendarX, CheckCheck, Clock, XCircle } from "lucide-react";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

import { AppointmentDAO, AppointmentResponse } from "@/dao/appointment-dao";
import { useUserRole } from "@/hooks/use-user-role";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AppointmentStatus } from "@/lib/types"; // Garanta que AppointmentStatus está importado

// --- Componente Status Badge (Auxiliar) ---

function StatusBadge({ status }: { status: AppointmentStatus }) {
  let colorClass = "";
  let icon: React.ReactNode;
  let text = "";

  switch (status) {
    case AppointmentStatus.PENDING_PAYMENT:
      colorClass = "bg-yellow-100 text-yellow-700 border-yellow-300";
      icon = <Clock className="h-4 w-4" />;
      text = "Pagamento Pendente";
      break;
    case AppointmentStatus.CONFIRMED:
      colorClass = "bg-green-100 text-green-700 border-green-300";
      icon = <CheckCheck className="h-4 w-4" />;
      text = "Confirmado";
      break;
    case AppointmentStatus.CANCELED:
      colorClass = "bg-red-100 text-red-700 border-red-300";
      icon = <XCircle className="h-4 w-4" />;
      text = "Cancelado";
      break;
    case AppointmentStatus.COMPLETED:
      colorClass = "bg-gray-100 text-gray-700 border-gray-300";
      icon = <CheckCheck className="h-4 w-4" />;
      text = "Concluído";
      break;
    default:
      colorClass = "bg-gray-50 text-gray-500 border-gray-200";
      text = "Desconhecido";
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-full border ${colorClass}`}
    >
      {icon}
      {text}
    </span>
  );
}

// --- Componente Principal ---

export function AppointmentManagement() {
  const { accessToken, userRole } = useUserRole();
  const [appointments, setAppointments] = useState<AppointmentResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  // 1. Efeito para carregar agendamentos
  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        const data = await AppointmentDAO.getMyAppointments(accessToken);
        setAppointments(data);
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
    if (!accessToken) {
      toast.error("Authentication required to cancel.");
      return;
    }

    // Confirmação (Opcional, mas recomendado para UX)
    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    try {
      setCancellingId(appointmentId);

      // CHAMA O NOVO MÉTODO DO DAO
      await AppointmentDAO.updateStatus(
        appointmentId,
        AppointmentStatus.CANCELED,
        accessToken
      );

      // Atualiza o estado local para refletir o cancelamento
      setAppointments((prev) =>
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
    } finally {
      setCancellingId(null);
    }
  };

  if (loading && appointments.length === 0) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        {userRole === "CLIENT"
          ? "Your Appointments"
          : "Appointments Management"}
      </h1>

      {appointments.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">
          You have no recorded appointments yet.
        </p>
      ) : (
        <div className="border rounded-lg overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Professional</TableHead>
                <TableHead>Service/Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {appointments.map((appointment) => (
                <TableRow key={appointment.id}>
                  <TableCell className="font-medium">
                    {/* Usando start_dt agora */}
                    {format(parseISO(appointment.start_dt), "dd/MM/yyyy", {
                      locale: ptBR,
                    })}
                  </TableCell>
                  <TableCell>
                    {format(parseISO(appointment.start_dt), "HH:mm")}
                    {" - "}
                    {/* Exibe a hora de fim também */}
                    {format(parseISO(appointment.end_dt), "HH:mm")}
                  </TableCell>
                  <TableCell>
                    {/* AGORA EXIBE O NOME DO PROFISSIONAL com fallback 'N/A' */}
                    {appointment.professional?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    {/* Exibe o nome do Serviço ou o nome do Cliente com fallback 'N/A' */}
                    {userRole === "CLIENT"
                      ? appointment.service?.name || "N/A"
                      : appointment.client?.name || "N/A"}
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={appointment.status} />
                  </TableCell>
                  {/* ... (Actions) ... */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
