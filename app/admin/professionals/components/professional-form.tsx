"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import {
  ProfessionalDAO,
  ProfessionalCreateData,
  ProfessionalUpdateData,
} from "@/dao/professional-dao";
import { useUserRole } from "@/hooks/use-user-role";
import * as z from "zod";

const baseProfessionalSchema = z.object({
  name: z
    .string()
    .min(2, { message: "O nome deve ter pelo menos 2 caracteres." }),
  email: z.string().email({ message: "Endereço de e-mail inválido." }),
  bio: z.string().nullable().optional(),
  schedulingType: z.enum(["EXACT_TIME", "FIXED_SLOTS"]),
  slotIntervalMinutes: z.coerce
    .number()
    .min(5, "O intervalo deve ser de no mínimo 5 minutos.")
    .max(120, "O intervalo máximo é de 120 minutos."),
});

interface ProfessionalFormValues
  extends z.infer<typeof baseProfessionalSchema> {
  password: string;
}

const getProfessionalFormSchema = (isEditing: boolean) => {
  const passwordSchema = isEditing
    ? z
        .string()
        .min(8, "A senha deve ter pelo menos 8 caracteres.")
        .or(z.literal(""))
        .optional()
        .transform((e) => (e === "" ? undefined : e))
    : z
        .string()
        .min(8, "A senha deve ser informada e ter pelo menos 8 caracteres.");

  return baseProfessionalSchema.extend({
    password: passwordSchema,
  });
};

export function ProfessionalForm({
  professionalId,
}: {
  professionalId?: string;
}) {
  const router = useRouter();
  const { accessToken } = useUserRole();
  const [loadingInitial, setLoadingInitial] = useState(true);

  const isEditing = !!professionalId;

  const formSchema = getProfessionalFormSchema(isEditing);

  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      bio: "",
      schedulingType: "EXACT_TIME",
      slotIntervalMinutes: 30,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (!accessToken || !professionalId) {
      setLoadingInitial(false);
      return;
    }

    const fetchProfessionalData = async () => {
      try {
        const data = await ProfessionalDAO.getOne(professionalId, accessToken);

        form.reset({
          name: data.name,
          email: data.email,
          password: "",
          bio: data.bio || "",
          schedulingType: data.scheduling_type,
          slotIntervalMinutes: data.slot_interval_minutes,
        });
      } catch (error) {
        toast.error("Falha ao carregar dados do profissional.");
        router.push("/admin/professionals");
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchProfessionalData();
  }, [accessToken, professionalId, form, router]);

  async function onSubmit(data: ProfessionalFormValues) {
    if (!accessToken) {
      toast.error("Token de autenticação ausente.");
      return;
    }

    const cleanData = Object.fromEntries(
      Object.entries(data).filter(
        ([_, v]) => v !== null && v !== "" && v !== undefined
      )
    ) as Partial<ProfessionalFormValues>;

    const payloadBase = {
      name: cleanData.name,
      email: cleanData.email,
      bio: cleanData.bio,
      scheduling_type: cleanData.schedulingType,
      slot_interval_minutes: cleanData.slotIntervalMinutes,
    };

    try {
      if (!professionalId) {
        if (!cleanData.password) {
          toast.error("A senha é obrigatória para o cadastro.");
          return;
        }
        const createPayload: ProfessionalCreateData = {
          ...payloadBase,
          password: cleanData.password!,
        } as ProfessionalCreateData;

        await ProfessionalDAO.create(createPayload, accessToken);
        toast.success("Profissional cadastrado com sucesso!");
      } else {
        const updatePayload: ProfessionalUpdateData = {
          ...payloadBase,
          ...(cleanData.password && { password: cleanData.password }),
        } as ProfessionalUpdateData;

        await ProfessionalDAO.update(
          professionalId,
          updatePayload,
          accessToken
        );
        toast.success("Profissional atualizado com sucesso!");
      }
      router.push("/admin/professionals");
    } catch (error) {
      console.error("Falha na operação:", error);
      toast.error("Falha na operação. Verifique seus dados.");
    }
  }

  if (loadingInitial) {
    return (
      <div className="space-y-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-2xl">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>E-mail</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="joao@agendei.com"
                      {...field}
                      disabled={isEditing && !form.formState.isDirty}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Senha {isEditing && "(Deixe em branco para não alterar)"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder={
                        isEditing ? "Manter senha atual" : "********"
                      }
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Biografia (Opcional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Breve biografia do profissional..."
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
              name="schedulingType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Agendamento</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EXACT_TIME">Horário Exato</SelectItem>
                      <SelectItem value="FIXED_SLOTS">Slots Fixos</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Define como os clientes podem agendar.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slotIntervalMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intervalo do Slot (Minutos)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value ? parseInt(e.target.value) : undefined
                        )
                      }
                    />
                  </FormControl>
                  <FormDescription>
                    Duração padrão para cálculo de disponibilidade.
                  </FormDescription>
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
                {isEditing ? "Atualizando ..." : "Cadastrando ..."}
              </>
            ) : isEditing ? (
              "Atualizar Profissional"
            ) : (
              "Cadastrar Profissional"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
