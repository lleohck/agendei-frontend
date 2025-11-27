import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ProfessionalsTable from "./components/professionals-table";
import Link from "next/link";

export default function ProfessionalsPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Professionais</h1>
        <Link href="/admin/professionals/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Profissional
          </Button>
        </Link>
      </div>
      <ProfessionalsTable />
    </div>
  );
}
