import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface KpiCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  format: "currency" | "percent" | "number";
}

export default function KpiCard({ title, value, icon, format: valueFormat }: KpiCardProps) {
  let formattedValue = "";

  if (valueFormat === "currency") {
    formattedValue = new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  } else if (valueFormat === "percent") {
    formattedValue = new Intl.NumberFormat("pt-BR", {
      style: "percent",
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    }).format(value);
  } else {
    formattedValue = value.toString();
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formattedValue}</div>
      </CardContent>
    </Card>
  );
}
