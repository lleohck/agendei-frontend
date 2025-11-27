"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ProfessionalServiceDAO,
  ServiceAssociationRequest,
} from "@/dao/professional-service-dao";
import { ServiceDAO, ServiceResponse } from "@/dao/service-dao";
import { useUserRole } from "@/hooks/use-user-role";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  selectedServices: z
    .array(z.string())
    .refine((value) => value.some((item) => item), {
      message:
        "Você deve selecionar pelo menos um serviço para o profissional.",
    }),
});

type ProfessionalServicesFormValues = z.infer<typeof formSchema>;

export function ProfessionalServicesForm({
  professionalId,
}: {
  professionalId: string;
}) {
  const { accessToken, establishmentId } = useUserRole();
  const [loading, setLoading] = useState(true);
  const [allServices, setAllServices] = useState<ServiceResponse[]>([]);

  const form = useForm<ProfessionalServicesFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      selectedServices: [],
    },
  });

  // Efeito para carregar todos os serviços e os serviços associados
  useEffect(() => {
    if (!accessToken || !establishmentId || !professionalId) return;

    const fetchData = async () => {
      try {
        // 1. Buscar todos os serviços do estabelecimento
        const all = await ServiceDAO.getAll(accessToken, establishmentId);
        setAllServices(all);

        // 2. Buscar serviços atualmente associados ao profissional
        const associated =
          await ProfessionalServiceDAO.getServicesByProfessional(
            professionalId,
            accessToken
          );

        // 3. Preencher o formulário com os IDs dos serviços associados
        const associatedIds = associated.map((s) => s.service_id);
        form.reset({
          selectedServices: associatedIds,
        });
      } catch (error) {
        console.error(error);
        toast.error("Falha ao carregar dados de associação de serviços.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [accessToken, establishmentId, professionalId, form]);

  async function onSubmit(data: ProfessionalServicesFormValues) {
    if (!accessToken) {
      toast.error("Token de autenticação ausente.");
      return;
    }

    try {
      const updateData: ServiceAssociationRequest = {
        service_ids: data.selectedServices,
      };

      await ProfessionalServiceDAO.updateProfessionalServices(
        professionalId,
        updateData,
        accessToken
      );

      toast.success("Serviços do profissional atualizados com sucesso!");
    } catch (error) {
      console.error("Falha na atualização:", error);
      toast.error("Falha ao atualizar os serviços.");
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  const servicesOptions = allServices.map((service) => ({
    id: service.id,
    label: `${service.name} (R$${service.base_price.toFixed(2)}) - ${
      service.base_duration_minutes
    } min`,
  }));

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-col justify-between h-full space-y-6"
        >
          <div>
            <h2 className="text-xl font-semibold border-b pb-2">
              Serviços Associados
            </h2>

            <FormField
              control={form.control}
              name="selectedServices"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">
                      Selecione os serviços que este profissional oferece:
                    </FormLabel>
                    <FormDescription>
                      Apenas os serviços marcados estarão disponíveis para este
                      profissional.
                    </FormDescription>
                  </div>
                  <div className="max-h-80 overflow-y-auto pr-4 space-y-2">
                    {servicesOptions.map((item) => (
                      <FormField
                        key={item.id}
                        control={form.control}
                        name="selectedServices"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={item.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(item.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([
                                          ...field.value,
                                          item.id,
                                        ])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== item.id
                                          )
                                        );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {item.label}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Serviços"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
