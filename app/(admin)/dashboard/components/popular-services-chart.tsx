"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { TrendingUp, CheckCircle } from "lucide-react";

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
        console.error("Popular Services error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [accessToken]);

  if (loading) {
    return <Skeleton className="h-64 w-full" />;
  }

  // Calcula o total para a barra de progresso (útil para gráficos de barra/donut)
  const totalAppointments = services.reduce(
    (sum, service) => sum + service.appointment_count,
    0
  );

  return (
    <Card className="lg:col-span-1">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Serviços Mais Populares (Mês)</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {services.length > 0 ? (
          <div className="divide-y">
            {services.map((service, index) => (
              <div
                key={service.service_name}
                className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-bold text-lg text-primary">
                    {index + 1}.
                  </span>
                  <p className="font-medium">{service.service_name}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-xl">
                    {service.appointment_count}
                  </p>
                  <p className="text-sm text-gray-500">Agendamentos</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="p-6 text-gray-500 text-center">
            Nenhum serviço agendado no último mês.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
