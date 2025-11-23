import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ServicesTable from "./components/services-table";
import Link from "next/link";

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Services Management</h1>
        <Link href="/dashboard/management/services/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Service
          </Button>
        </Link>
      </div>

      <ServicesTable />
    </div>
  );
}
