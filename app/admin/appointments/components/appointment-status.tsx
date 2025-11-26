import { AppointmentStatus } from "@/lib/types";
import { Clock, CheckCheck, XCircle } from "lucide-react";

export default function StatusBadge({ status }: { status: AppointmentStatus }) {
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
