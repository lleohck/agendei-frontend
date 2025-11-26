"use client";

import { Column } from "@tanstack/react-table";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandInput,
} from "@/components/ui/command";

import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props<TData> {
  column: Column<TData, unknown>;
  options: string[];
  label?: string;
}

export function DataTableMultiSelectFilter<TData>({
  column,
  options,
  label,
}: Props<TData>) {
  const selected: string[] = (column.getFilterValue() as string[]) || [];

  const toggle = (value: string) => {
    let next = [...selected];
    if (next.includes(value)) next = next.filter((v) => v !== value);
    else next.push(value);

    column.setFilterValue(next.length ? next : undefined);
  };

  return (
    <Popover>
      <PopoverTrigger>
        <Badge variant="outline" className="cursor-pointer">
          {label || column.id}
        </Badge>
      </PopoverTrigger>

      <PopoverContent className="p-0 w-56">
        <Command>
          <CommandInput placeholder={`Filtrar ${label || column.id}...`} />

          <CommandGroup className="max-h-64 overflow-auto">
            {options.map((opt) => (
              <CommandItem
                key={opt}
                onSelect={() => toggle(opt)}
                className="flex items-center gap-2"
              >
                <Check
                  className={cn(
                    "h-4 w-4",
                    selected.includes(opt) ? "opacity-100" : "opacity-0"
                  )}
                />
                {opt}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
