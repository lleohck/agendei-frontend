"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Star } from "lucide-react";

import { useUserRole } from "@/hooks/use-user-role";
import { DashboardDAO, PopularServicePoint } from "@/dao/dashboard-dao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function PopularServicesChart() {
  const { accessToken } = useUserRole();
  const [services, setServices] = useState<PopularServicePoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }

    const fetchServices = async () => {
      try {
        const data = await DashboardDAO.getPopularServices(accessToken);
        setServices(data);
      } catch (error) {
        toast.error("Failed to load popular services data.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [accessToken]);

  if (loading) {
    return <Skeleton className="h-[350px] w-full rounded-xl" />;
  }

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="h-5 w-5 text-yellow-500" />
          Serviços Mais Populares
        </CardTitle>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[300px] w-full">
          {services.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={services}
                margin={{ top: 0, right: 30, left: 20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="service_name"
                  type="category"
                  width={120}
                  tick={{ fontSize: 12 }}
                  interval={0}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    border: "1px solid #e5e7eb",
                  }}
                />
                <Bar
                  dataKey="appointment_count"
                  fill="#10b981"
                  radius={[0, 4, 4, 0]}
                  name="Agendamentos"
                  barSize={32}
                >
                  <LabelList
                    dataKey="appointment_count"
                    position="right"
                    style={{ fill: "#333", fontSize: 12, fontWeight: 600 }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              Sem dados de serviços.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
