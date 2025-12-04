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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  ServiceDAO,
  ServiceCreateData,
  ServiceUpdateData,
} from "@/dao/service-dao";
import { useUserRole } from "@/hooks/use-user-role";
import { Skeleton } from "@/components/ui/skeleton";

const formSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  description: z.string().optional(),
  basePrice: z
    .number()
    .min(0, { message: "O preço base não pode ser negativo." }),
  baseDurationMinutes: z
    .number()
    .min(5, { message: "A duração mínima é de 5 minutos." }),
});

type ServiceFormValues = z.infer<typeof formSchema>;

interface ServiceFormProps {
  serviceId?: string;
}

export function ServiceForm({ serviceId }: ServiceFormProps) {
  const router = useRouter();
  const { accessToken, establishmentId } = useUserRole();
  const [loadingInitial, setLoadingInitial] = useState(!!serviceId);

  const isEditing = !!serviceId;

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 10,
      baseDurationMinutes: 30,
    },
  });

  useEffect(() => {
    if (!accessToken || !serviceId) {
      setLoadingInitial(false);
      return;
    }

    const fetchServiceData = async () => {
      try {
        const data = await ServiceDAO.getOne(serviceId, accessToken);

        form.reset({
          name: data.name,
          description: data.description || "",
          basePrice: data.base_price,
          baseDurationMinutes: data.base_duration_minutes,
        });
      } catch (error) {
        console.error(error);
        toast.error("Falha ao carregar dados do serviço.");
        router.push("/admin/services");
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchServiceData();
  }, [accessToken, serviceId, form, router]);

  async function onSubmit(data: ServiceFormValues) {
    if (!accessToken || !establishmentId) {
      toast.error("Token de autenticação ou Estabelecimento ausente.");
      return;
    }

    try {
      if (isEditing) {
        const updatePayload: ServiceUpdateData = {
          name: data.name,
          description: data.description,
          base_price: data.basePrice,
          base_duration_minutes: data.baseDurationMinutes,
        };

        await ServiceDAO.update(
          serviceId!,
          updatePayload,
          accessToken
        );

        toast.success("Serviço atualizado com sucesso!");
      } else {
        const createPayload: ServiceCreateData = {
          name: data.name,
          description: data.description,
          base_price: data.basePrice,
          base_duration_minutes: data.baseDurationMinutes,
        };

        await ServiceDAO.create(createPayload, accessToken);

        toast.success("Serviço cadastrado com sucesso!");
      }

      router.push("/admin/services");
    } catch (error) {
      console.error("Falha na operação:", error);
      toast.error("Falha ao salvar o serviço.");
    }
  }

  if (loadingInitial) {
    return (
      <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Serviço</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Corte de Cabelo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Detalhes sobre o serviço..."
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preço (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value) || 0)
                      }
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="baseDurationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (Minutos)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseInt(e.target.value) || 0)
                      }
                    />
                  </FormControl>
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
                {isEditing ? "Atualizando..." : "Cadastrando..."}
              </>
            ) : isEditing ? (
              "Atualizar Serviço"
            ) : (
              "Cadastrar Serviço"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
