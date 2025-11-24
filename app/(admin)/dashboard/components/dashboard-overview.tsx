"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DollarSign, CalendarCheck, Clock, XCircle } from "lucide-react";

import { useUserRole } from "@/hooks/use-user-role";
import { DashboardDAO, DashboardSummaryResponse } from "@/dao/dashboard-dao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import KpiCard from "./kpi-cards";
import AppointmentListItem from "./appointment-list-item";
import { PopularServicesChart } from "./popular-services-chart";

export function DashboardOverview() {
  const { accessToken } = useUserRole();
  const [summary, setSummary] = useState<DashboardSummaryResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = useCallback(() => {
    const fetchData = async () => {
      try {
        const data = await DashboardDAO.getSummary(accessToken);
        setSummary(data);
      } catch (error) {
        toast.error("Failed to load dashboard summary.");
        console.error("Dashboard load error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken]);

  useEffect(() => {
    if (!accessToken) {
      setLoading(false);
      return;
    }
    fetchSummary();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  if (!summary) return null;

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>

      {/* 1. Cartões de Métricas (KPIs) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KpiCard
          title="Próxima Receita Estimada (7D)"
          value={summary.estimated_revenue_next_7_days}
          icon={<DollarSign className="h-5 w-5 text-green-500" />}
          format="currency"
        />
        <KpiCard
          title="Agendamentos Confirmados (7D)"
          value={summary.total_confirmed_next_7_days}
          icon={<CalendarCheck className="h-5 w-5 text-blue-500" />}
          format="number"
        />
        <KpiCard
          title="Agendamentos de Hoje"
          value={summary.appointments_today_count}
          icon={<Clock className="h-5 w-5 text-yellow-500" />}
          format="number"
        />
        <KpiCard
          title="Taxa de Cancelamento (Mês)"
          value={summary.cancellation_rate_this_month}
          icon={<XCircle className="h-5 w-5 text-red-500" />}
          format="percent"
        />
      </div>

      {/* 2. Visão Rápida: Agenda de Hoje */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="h-5 w-5" />
              <span>
                Agenda de Hoje (
                {format(new Date(), "dd/MM/yyyy", { locale: ptBR })})
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {summary.today_appointments.length > 0 ? (
              <div className="divide-y">
                {summary.today_appointments.map((apt) => (
                  <AppointmentListItem
                    key={apt.id}
                    appointment={apt}
                    onSuccess={() => fetchSummary()}
                  />
                ))}
              </div>
            ) : (
              <p className="p-6 text-gray-500 text-center">
                Nenhum agendamento para hoje.
              </p>
            )}
          </CardContent>
        </Card>

        {/* 3. Gráficos de Tendência */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Tendência de Agendamentos (Últimas 4 Semanas)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex flex-col items-center">
              {summary.weekly_trend.map((point) => (
                <div
                  key={point.week_start_date}
                  className="flex justify-between w-full p-1 border-b"
                >
                  <span className="text-sm text-gray-600">
                    {format(parseISO(point.week_start_date), "dd MMM", {
                      locale: ptBR,
                    })}
                  </span>
                  <span className="font-semibold">
                    {point.appointment_count} Agendamentos
                  </span>
                </div>
              ))}

              {summary.weekly_trend.length === 0 && (
                <p className="text-gray-500 text-center">
                  Dados insuficientes para tendência.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
        <PopularServicesChart />
      </div>
    </div>
  );
}
