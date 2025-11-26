import { ColumnDef } from "@tanstack/react-table";
import { AppointmentResponse } from "@/lib/types";
import StatusBadge from "../appointment-status";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";

export const columns: ColumnDef<AppointmentResponse>[] = [
  {
    accessorKey: "date",
    header: "Data",
    cell: ({ row }) => {
      return format(parseISO(row.original.start_dt), "dd/MM/yyyy", {
        locale: ptBR,
      });
    },
  },
  {
    accessorKey: "time",
    header: "Hora",
    cell: ({ row }) => {
      return (
        `${format(parseISO(row.original.start_dt), "HH:mm")} - ` +
        `${format(parseISO(row.original.end_dt), "HH:mm")}`
      );
    },
  },
  {
    accessorKey: "professional.name",
    header: "Profissional",
  },
  {
    accessorKey: "service.name",
    header: "Serviço",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    id: "actions",
    header: "Ações",
    cell: () => <div />,
  },
];
