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
import { Skeleton } from "@/components/ui/skeleton"; // Import do Skeleton

import { ProfessionalDAO } from "@/dao/professional-dao";
import {
  EstablishmentDAO,
  EstablishmentResponse,
} from "@/dao/establishment-dao";
import { useUserRole } from "@/hooks/use-user-role";
import { ProfessionalFormValues, professionalFormSchema } from "@/lib/types";

export function ProfessionalForm({
  professionalId,
}: {
  professionalId?: string;
}) {
  const router = useRouter();
  const { accessToken } = useUserRole();
  const [establishments, setEstablishments] = useState<EstablishmentResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(professionalFormSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      establishmentId: "",
      bio: "",
      schedulingType: "EXACT_TIME",
      slotIntervalMinutes: 30,
    },
  });

  // Efeito 1: Carregar todos os estabelecimentos disponíveis (para o Select)
  useEffect(() => {
    if (accessToken) {
      EstablishmentDAO.getAll(accessToken)
        .then((data) => setEstablishments(data))
        .catch(() => toast.error("Failed to load establishments."))
        // A flag de loading principal só é usada no Select, não bloqueia o formulário inteiro
        .finally(() => setLoading(false));
    }
  }, [accessToken]);

  // Efeito 2: Carregar dados do profissional se estiver no modo de edição
  useEffect(() => {
    // Se for um novo cadastro, não precisa carregar dados.
    if (!accessToken || !professionalId) {
      setLoadingInitial(false);
      return;
    }

    const fetchProfessionalData = async () => {
      try {
        const data = await ProfessionalDAO.getOne(professionalId, accessToken);

        // Reset do formulário com dados do backend
        form.reset({
          name: data.name,
          email: data.email,
          password: "", // Não preencher senha por segurança
          establishmentId: data.establishment_id,
          bio: data.bio || "",
          schedulingType: data.scheduling_type,
          slotIntervalMinutes: data.slot_interval_minutes,
        });
      } catch (error) {
        toast.error("Failed to load professional data.");
        router.push("/dashboard/management/professionals");
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchProfessionalData();
  }, [accessToken, professionalId, form, router]);

  async function onSubmit(data: ProfessionalFormValues) {
    if (!accessToken) {
      toast.error("Authentication token missing.");
      return;
    }

    try {
      if (!professionalId) {
        // --- CADASTRO (POST) ---
        await ProfessionalDAO.create(
          {
            name: data.name,
            email: data.email,
            password: data.password,
            establishment_id: data.establishmentId,
            bio: data.bio,
            scheduling_type: data.schedulingType,
            slot_interval_minutes: data.slotIntervalMinutes,
          },
          accessToken
        );
        toast.success("Professional registered successfully!");
      } else {
        // --- ATUALIZAÇÃO (PUT/PATCH) ---
        await ProfessionalDAO.update(
          professionalId,
          {
            name: data.name,
            email: data.email,
            establishment_id: data.establishmentId,
            bio: data.bio,
            scheduling_type: data.schedulingType,
            slot_interval_minutes: data.slotIntervalMinutes,
          },
          accessToken
        );
        toast.success("Professional updated successfully!");
      }
      router.push("/dashboard/management/professionals");
    } catch (error) {
      console.error("Operation failed:", error);
      toast.error("Operation failed. Check your data.");
    }
  }

  function onError(errors: any) {
    console.error("Zod Validation Errors:", errors);
    toast.error("Form validation failed. Check console for details.");
    // Force Zod to display field errors (optional, but helps confirm the issue)
    Object.keys(errors).forEach((key) => {
      // Encontra a primeira mensagem de erro e exibe
      const message = errors[key as keyof ProfessionalFormValues]?.message;
      if (message) {
        toast.error(`Error in ${key}: ${message}`);
      }
    });
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
        <form
          onSubmit={form.handleSubmit(onSubmit, onError)}
          className="space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="establishmentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Establishment</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue
                          placeholder={
                            loading ? "Loading..." : "Select establishment"
                          }
                        />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {establishments.map((est) => (
                        <SelectItem key={est.id} value={est.id}>
                          {est.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Campos de Email e Senha SÓ são mostrados no CADASTRO */}
          {!professionalId && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="john@agendei.com" {...field} />
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
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="********"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          {/* Email no modo de edição (o campo existe, mas é preenchido e talvez não editável se for chave única) */}
          {professionalId && (
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="john@agendei.com"
                      {...field}
                      disabled={true} // Sugestão: Desabilitar a edição do e-mail
                    />
                  </FormControl>
                  <FormDescription>
                    The email is typically the unique identifier and cannot be
                    changed here.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bio (Optional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Short biography..." {...field} />
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
                  <FormLabel>Scheduling Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="EXACT_TIME">Exact Time</SelectItem>
                      <SelectItem value="FIXED_SLOTS">Fixed Slots</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    How clients book this professional.
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
                  <FormLabel>Slot Interval (Minutes)</FormLabel>
                  <FormControl>
                    {/* Conversão para Number é importante aqui, garantindo que o input não envie string */}
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Standard duration of a session.
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
                {!professionalId ? "Registering ..." : "Updating ..."}
              </>
            ) : !professionalId ? (
              "Register Professional"
            ) : (
              "Update Professional"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
