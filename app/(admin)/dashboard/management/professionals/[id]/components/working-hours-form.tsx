"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useUserRole } from "@/hooks/use-user-role";
import { WorkingHoursDAO, WorkingHourData } from "@/dao/working-hours-dao";

interface WorkingHoursFormProps {
  professionalId: string;
}

const DAYS_OF_WEEK = [
  { id: 1, name: "Segunda-feira" },
  { id: 2, name: "Terça-feira" },
  { id: 3, name: "Quarta-feira" },
  { id: 4, name: "Quinta-feira" },
  { id: 5, name: "Sexta-feira" },
  { id: 6, name: "Sábado" },
  { id: 7, name: "Domingo" },
];

export function WorkingHoursForm({ professionalId }: WorkingHoursFormProps) {
  const { accessToken } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [schedule, setSchedule] = useState<
    {
      dayId: number;
      isOpen: boolean;
      startTime: string;
      endTime: string;
    }[]
  >([]);

  useEffect(() => {
    if (!accessToken || !professionalId) return;

    const loadData = async () => {
      try {
        const data = await WorkingHoursDAO.get(professionalId, accessToken);

        const initialSchedule = DAYS_OF_WEEK.map((day) => {
          const existing = data.find((d) => d.day_of_week === day.id);
          return {
            dayId: day.id,
            isOpen: !!existing,
            startTime: existing?.start_time?.slice(0, 5) || "09:00",
            endTime: existing?.end_time?.slice(0, 5) || "18:00",
          };
        });

        setSchedule(initialSchedule);
      } catch (error) {
        toast.error("Erro ao carregar horários.");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [accessToken, professionalId]);

  const handleToggleDay = (dayId: number, isOpen: boolean) => {
    setSchedule((prev) =>
      prev.map((item) => (item.dayId === dayId ? { ...item, isOpen } : item))
    );
  };

  const handleTimeChange = (
    dayId: number,
    field: "startTime" | "endTime",
    value: string
  ) => {
    setSchedule((prev) =>
      prev.map((item) =>
        item.dayId === dayId ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSave = async () => {
    if (!accessToken) return;
    setSaving(true);

    const payload: WorkingHourData[] = schedule
      .filter((item) => item.isOpen)
      .map((item) => ({
        day_of_week: item.dayId,
        start_time: item.startTime + ":00",
        end_time: item.endTime + ":00",
      }));

    try {
      await WorkingHoursDAO.update(professionalId, payload, accessToken);
      toast.success("Horários atualizados com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar horários.");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return <div className="p-8 text-center">Carregando horários...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração de Horários</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {DAYS_OF_WEEK.map((day) => {
          const dayConfig = schedule.find((s) => s.dayId === day.id);
          if (!dayConfig) return null;

          return (
            <div
              key={day.id}
              className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-900"
            >
              <div className="flex items-center space-x-4 w-1/3">
                <Switch
                  checked={dayConfig.isOpen}
                  onCheckedChange={(checked) =>
                    handleToggleDay(day.id, checked)
                  }
                />
                <Label
                  className={dayConfig.isOpen ? "font-medium" : "text-gray-400"}
                >
                  {day.name}
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Início</span>
                  <Input
                    type="time"
                    value={dayConfig.startTime}
                    disabled={!dayConfig.isOpen}
                    onChange={(e) =>
                      handleTimeChange(day.id, "startTime", e.target.value)
                    }
                    className="w-32"
                  />
                </div>
                <span className="pt-5">-</span>
                <div className="flex flex-col">
                  <span className="text-xs text-gray-500 mb-1">Fim</span>
                  <Input
                    type="time"
                    value={dayConfig.endTime}
                    disabled={!dayConfig.isOpen}
                    onChange={(e) =>
                      handleTimeChange(day.id, "endTime", e.target.value)
                    }
                    className="w-32"
                  />
                </div>
              </div>
            </div>
          );
        })}

        <Button onClick={handleSave} className="w-full mt-4" disabled={saving}>
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
      </CardContent>
    </Card>
  );
}
