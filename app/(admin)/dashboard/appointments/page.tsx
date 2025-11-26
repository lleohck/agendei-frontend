import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AppointmentTableV2 from "./components/table/appointment-table-vs";

export default function AppointmentsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Appointments Management</h1>
        <Link href="/book">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Book New
          </Button>
        </Link>
      </div>
      <AppointmentTableV2 />
    </div>
  );
}
