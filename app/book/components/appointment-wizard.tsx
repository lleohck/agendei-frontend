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

// --- ESTADOS DO WIZARD ---
enum Step {
  SERVICE_PROFESSIONAL,
  DATE_TIME,
  CONFIRMATION,
}

export function AppointmentWizard({
  establishmentId,
}: {
  establishmentId: string;
}) {
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

  // 1. Efeito para carregar Serviços e Profissionais (início)
  useEffect(() => {
    if (!accessToken || !establishmentId) return;

    const loadInitialData = async () => {
      try {
        const [servicesData, professionalsData] = await Promise.all([
          ServiceDAO.getAll(accessToken, establishmentId),
          ProfessionalDAO.getAll(accessToken, establishmentId),
        ]);
        setAllServices(servicesData);
        setAllProfessionals(professionalsData);
      } catch (error) {
        toast.error("Failed to load essential data.");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, [accessToken, establishmentId]);

  // 2. Efeito para buscar Slots Disponíveis (ao mudar data/serviço/profissional)
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
      } catch (error) {
        toast.error("Failed to load available slots.");
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
      toast.error("Please ensure all fields are selected.");
      return;
    }

    const payload: AppointmentCreateData = {
      professional_id: selectedProfessionalId,
      service_id: selectedServiceId,
      start_dt: selectedSlot,
      establishment_id: establishmentId,
    };

    try {
      setLoading(true);
      await AppointmentDAO.create(payload, accessToken);
      toast.success("Appointment successfully booked!");
      setCurrentStep(Step.CONFIRMATION); // Mudar para tela final
    } catch (error: any) {
      console.error(error);
      const detail =
        error.response?.data?.detail || "Booking failed due to a server error.";
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
          No slots available for this date/selection.
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
          🎉 Success! Appointment Confirmed.
        </h2>
        <p>Your appointment has been successfully booked.</p>
        <Button onClick={() => window.location.reload()}>Book Another</Button>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Book Your Service</h1>

      {/* 1. SELEÇÃO DE SERVIÇO E PROFISSIONAL */}
      <div
        className={`space-y-4 ${
          currentStep !== Step.SERVICE_PROFESSIONAL
            ? "opacity-50 pointer-events-none"
            : ""
        }`}
      >
        <h2 className="text-xl font-semibold">
          Step 1: Service & Professional
        </h2>
        <Select onValueChange={setSelectedServiceId} value={selectedServiceId}>
          <SelectTrigger>
            <SelectValue placeholder="Select Service" />
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
            <SelectValue placeholder="Select Professional" />
          </SelectTrigger>
          <SelectContent>
            {allProfessionals.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          onClick={() => setCurrentStep(Step.DATE_TIME)}
          disabled={!selectedServiceId || !selectedProfessionalId}
          className="w-full"
        >
          Select Date & Time
        </Button>
      </div>

      {/* 2. SELEÇÃO DE DATA E HORÁRIO */}
      {currentStep === Step.DATE_TIME && (
        <div className="space-y-4 border-t pt-4">
          <h2 className="text-xl font-semibold">Step 2: Date & Time</h2>

          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/2">
              <h3 className="text-lg mb-2">Select Date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() && !isToday(date)} // Disable past dates
                initialFocus
                locale={ptBR}
              />
            </div>

            <div className="md:w-1/2">
              <h3 className="text-lg mb-2">
                Available Slots (
                {selectedDate ? format(selectedDate, "dd/MM") : "Select Date"})
              </h3>
              {renderSlots}

              <div className="mt-6">
                <Button
                  onClick={handleBookAppointment}
                  disabled={!selectedSlot || loading}
                  className="w-full"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                      Booking...
                    </>
                  ) : (
                    "Confirm Booking"
                  )}
                </Button>
                <Button
                  variant="link"
                  onClick={() => setCurrentStep(Step.SERVICE_PROFESSIONAL)}
                  className="w-full"
                >
                  Back
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
