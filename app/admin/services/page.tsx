import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ServicesTable from "./components/services-table";
import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Serviços</h1>
        <Link href="/admin/services/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Serviço
          </Button>
        </Link>
      </div>

      <ServicesTable />
    </div>
  );
}
