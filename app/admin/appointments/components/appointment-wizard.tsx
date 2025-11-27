"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  AppointmentCreateData,
  AppointmentDAO,
  AvailableSlotsResponse,
} from "@/dao/appointment-dao";
import { useUserRole } from "@/hooks/use-user-role";
import { ServiceDAO, ServiceResponse } from "@/dao/service-dao";
import { ProfessionalDAO, ProfessionalResponse } from "@/dao/professional-dao";
import { Skeleton } from "@/components/ui/skeleton";
import { format, isToday } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Loader2 } from "lucide-react";

enum Step {
  SERVICE_PROFESSIONAL,
  DATE_TIME,
  CONFIRMATION,
}

export function AppointmentWizard() {
  const { accessToken } = useUserRole();
  const [currentStep, setCurrentStep] = useState<Step>(
    Step.SERVICE_PROFESSIONAL
  );
  const [loading, setLoading] = useState(true);

  // Dados de Seleção
  const [selectedServiceId, setSelectedServiceId] = useState<
    string | undefined
  >();
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<
    string | undefined
  >();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(
    new Date()
  );
  const [selectedSlot, setSelectedSlot] = useState<string | undefined>();

  // Dados Carregados
  const [allServices, setAllServices] = useState<ServiceResponse[]>([]);
  const [allProfessionals, setAllProfessionals] = useState<
    ProfessionalResponse[]
  >([]);
  const [availableSlots, setAvailableSlots] = useState<AvailableSlotsResponse>(
    []
  );

  useEffect(() => {
    if (!accessToken) return;

    const loadInitialData = async () => {
      try {
        const [servicesData, professionalsData] = await Promise.all([
          ServiceDAO.getAll(accessToken),
          ProfessionalDAO.getAll(accessToken),
        ]);
        setAllServices(servicesData);
        setAllProfessionals(professionalsData);
      } catch (error) {
        toast.error("Falha ao carregar dados essenciais.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [accessToken]);

  useEffect(() => {
    if (
      currentStep !== Step.DATE_TIME ||
      !selectedProfessionalId ||
      !selectedServiceId ||
      !selectedDate ||
      !accessToken
    ) {
      setAvailableSlots([]);
      return;
    }

    const fetchSlots = async () => {
      const formattedDate = format(selectedDate, "yyyy-MM-dd");
      try {
        setLoading(true);
        const slots = await AppointmentDAO.getAvailableSlots(
          selectedProfessionalId,
          selectedServiceId,
          formattedDate,
          accessToken
        );
        setAvailableSlots(slots);
        setSelectedSlot(undefined); // Limpa o slot selecionado ao mudar a data/seleção
      } catch (error) {
        toast.error("Falha ao carregar horários disponíveis.");
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [
    selectedProfessionalId,
    selectedServiceId,
    selectedDate,
    accessToken,
    currentStep,
  ]);

  // 3. Ação de Agendamento (Botão Final)
  const handleBookAppointment = async () => {
    if (
      !selectedProfessionalId ||
      !selectedServiceId ||
      !selectedSlot ||
      !accessToken
    ) {
      toast.error("Por favor, selecione todos os campos necessários.");
      return;
    }

    const payload: AppointmentCreateData = {
      professional_id: selectedProfessionalId,
      service_id: selectedServiceId,
      start_dt: selectedSlot,
    };

    try {
      setLoading(true);
      await AppointmentDAO.create(payload, accessToken);
      toast.success("Agendamento realizado com sucesso!");
      setCurrentStep(Step.CONFIRMATION); // Mudar para tela final
    } catch (error: any) {
      console.error(error);
      const detail =
        error.response?.data?.detail ||
        "O agendamento falhou devido a um erro no servidor.";
      toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  // --- Renderização de Slots ---
  const renderSlots = useMemo(() => {
    if (loading)
      return (
        <div className="grid grid-cols-3 gap-2">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      );
    if (availableSlots.length === 0)
      return (
        <p className="text-sm text-gray-500">
          Nenhum horário disponível para esta data/seleção.
        </p>
      );

    // Filtra slots passados se a data for hoje
    const now = new Date();
    const filteredSlots = availableSlots.filter((slotIso) => {
      const slotDate = new Date(slotIso);
      if (isToday(slotDate)) {
        // Permite agendamentos com pelo menos 15 minutos de antecedência
        return slotDate.getTime() > now.getTime() + 15 * 60 * 1000;
      }
      return true;
    });

    return (
      <div className="grid grid-cols-3 gap-3 max-h-60 overflow-y-auto pr-2">
        {filteredSlots.map((slotIso) => (
          <Button
            key={slotIso}
            variant={selectedSlot === slotIso ? "default" : "outline"}
            onClick={() => setSelectedSlot(slotIso)}
            size="sm"
          >
            {format(new Date(slotIso), "HH:mm")}
          </Button>
        ))}
      </div>
    );
  }, [availableSlots, selectedSlot, loading]);

  // --- RENDERIZAÇÃO PRINCIPAL DO WIZARD ---

  if (loading && currentStep === Step.SERVICE_PROFESSIONAL) {
    return (
      <div className="p-6">
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (currentStep === Step.CONFIRMATION) {
    return (
      <div className="text-center p-10 space-y-4">
        <h2 className="text-2xl font-bold text-green-600">
          🎉 Sucesso! Agendamento Confirmado.
        </h2>
        <p>Seu agendamento foi realizado com sucesso.</p>
        <Button onClick={() => window.location.reload()}>Agendar Outro</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Agende seu Serviço</h1>

      {/* 1. SELEÇÃO DE SERVIÇO E PROFISSIONAL */}
      <div
        className={`space-y-4 ${
          currentStep !== Step.SERVICE_PROFESSIONAL
            ? "opacity-50 pointer-events-none"
            : ""
        }`}
      >
        <h2 className="text-xl font-semibold">
          Passo 1: Serviço e Profissional
        </h2>
        <div className="flex items-center gap-5">
          <Select
            onValueChange={setSelectedServiceId}
            value={selectedServiceId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o Serviço" />
            </SelectTrigger>
            <SelectContent>
              {allServices.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name} (R${s.base_price.toFixed(2)})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            onValueChange={setSelectedProfessionalId}
            value={selectedProfessionalId}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o Profissional" />
            </SelectTrigger>
            <SelectContent>
              {allProfessionals.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          onClick={() => setCurrentStep(Step.DATE_TIME)}
          disabled={!selectedServiceId || !selectedProfessionalId}
          className="w-full"
        >
          Selecionar Data e Horário
        </Button>
      </div>

      {/* 2. SELEÇÃO DE DATA E HORÁRIO */}
      {currentStep === Step.DATE_TIME && (
        <div className="space-y-4 border-t pt-4">
          <h2 className="text-xl font-semibold">Passo 2: Data e Horário</h2>

          <div className="flex flex-col md:flex-row gap-6 h-full">
            <div className="md:w-1/2">
              <h3 className="text-lg mb-2">Selecione a Data</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                // Desabilita datas passadas (exceto hoje para horários futuros)
                disabled={(date) => date < new Date() && !isToday(date)}
                initialFocus
                locale={ptBR}
              />
            </div>

            {/* SELEÇÃO DE HORÁRIO E BOTÕES - Implementação da UX solicitada */}
            <div className="md:w-1/2 h-[350px] md:h-full">
              <div className="flex flex-col h-full justify-between">
                {/* 1. Conteúdo de Slots (Flex Grow) */}
                <div className="flex-grow overflow-hidden">
                  <h3 className="text-lg mb-2">
                    Horários Disponíveis (
                    {selectedDate
                      ? format(selectedDate, "dd/MM", { locale: ptBR }) // Formato ptBR
                      : "Selecione a Data"}
                    )
                  </h3>
                  {renderSlots}
                </div>

                {/* 2. Botões (Fixo no Bottom) */}
                <div className="space-y-2 mt-4 pt-4 border-t">
                  <Button
                    onClick={handleBookAppointment}
                    disabled={!selectedSlot || loading}
                    className="w-full"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Agendando...
                      </>
                    ) : (
                      "Confirmar Agendamento"
                    )}
                  </Button>
                  <Button
                    variant="link"
                    onClick={() => setCurrentStep(Step.SERVICE_PROFESSIONAL)}
                    className="w-full"
                  >
                    Voltar
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
