import { DataTableSelectFilter } from "@/components/shared/data-table/data-table-select-filter";

export function filters() {
  return (
    <div className="flex gap-4 mb-4">
      <DataTableSelectFilter
        table={table}
        columnId="professional.name"
        label="Profissional"
        options={professionalNames}
      />

      <DataTableSelectFilter
        table={table}
        columnId="service.name"
        label="Serviço"
        options={serviceNames}
      />

      <DataTableSelectFilter
        table={table}
        columnId="status"
        label="Status"
        options={statuses}
      />
    </div>
  );
}
