"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Building, Save, Loader2, Info } from "lucide-react";

import { useUserRole } from "@/hooks/use-user-role";
import {
  EstablishmentDAO,
  EstablishmentData,
  EstablishmentResponse,
} from "@/dao/establishment-dao";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

// --- ZOD SCHEMA ---
const formSchema = z.object({
  name: z.string().min(3, "O nome deve ter pelo menos 3 caracteres."),
  address: z.string().nullable().optional(),
  logo_url: z
    .string()
    .url("URL do Logo inválida.")
    .nullable()
    .optional()
    .or(z.literal("")),
});

type SettingsFormValues = z.infer<typeof formSchema>;

export default function EstablishmentSettingsPage() {
  const { accessToken, isLoading: isAuthLoading } = useUserRole();
  const [establishment, setEstablishment] =
    useState<EstablishmentResponse | null>(null);
  const [loadingState, setLoadingState] = useState<
    "loading" | "creating" | "editing" | "idle"
  >("loading");

  const isEditing = establishment !== null && establishment.id !== undefined;
  const pageTitle = isEditing
    ? "Editar Configurações"
    : "Primeiro Acesso: Criar Estabelecimento";

  // 1. Configuração do Formulário
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      address: "",
      logo_url: "",
    },
    mode: "onChange",
  });

  // 2. Carregar Dados na Inicialização
  useEffect(() => {
    if (isAuthLoading || !accessToken) return;

    const fetchEstablishment = async () => {
      setLoadingState("loading");
      try {
        const data = await EstablishmentDAO.getMe(accessToken);
        setEstablishment(data);
        // Preenche o formulário com os dados carregados
        form.reset({
          name: data.name,
          address: data.address || "",
          logo_url: data.logo_url || "",
        });
      } catch (error) {
        // Se retornar 404 (Estabelecimento não encontrado), significa que é o estado de criação.
        if (error instanceof Error && error.message.includes("404")) {
          setEstablishment(null);
          // O formulário mantém os valores padrão (defaultValues), pronto para criação.
        } else {
          toast.error("Erro ao carregar configurações do estabelecimento.");
        }
      } finally {
        setLoadingState("idle");
      }
    };

    fetchEstablishment();
  }, [accessToken, isAuthLoading, form]);

  // 3. Submissão do Formulário
  const onSubmit = async (data: SettingsFormValues) => {
    if (!accessToken) {
      toast.error("Erro de autenticação.");
      return;
    }

    const payload: EstablishmentData = {
      name: data.name,
      address: data.address || undefined,
      logo_url: data.logo_url || undefined,
      slug: undefined,
    };

    try {
      if (isEditing) {
        setLoadingState("editing");
        await EstablishmentDAO.update(payload, accessToken);
        toast.success("Configurações atualizadas com sucesso!");
      } else {
        setLoadingState("creating");
        const newEstablishment = await EstablishmentDAO.create(
          payload,
          accessToken
        );
        setEstablishment(newEstablishment); // Muda o estado para edição
        toast.success("Estabelecimento criado com sucesso!");
      }
    } catch (error) {
      toast.error("Falha ao salvar o estabelecimento.");
    } finally {
      setLoadingState("idle");
    }
  };

  if (loadingState === "loading") {
    return (
      <div className="p-6 space-y-4">
        <h1 className="text-3xl font-bold">{pageTitle}</h1>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-24" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold flex items-center gap-2">
        <Building className="h-7 w-7 text-indigo-600" />
        {pageTitle}
      </h1>

      <Alert variant="default">
        <Info className="h-4 w-4" />
        <AlertTitle>{isEditing ? "Modo Edição" : "Modo Criação"}</AlertTitle>
        <AlertDescription>
          {isEditing
            ? `Seu slug atual é: ${establishment?.slug}`
            : "Este é o primeiro passo! Crie seu estabelecimento para gerenciar a agenda."}
        </AlertDescription>
      </Alert>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Estabelecimento</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Barbearia do Zé" {...field} />
                    </FormControl>
                    <FormDescription>
                      Este nome será usado publicamente no seu link de
                      agendamento.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: Rua das Flores, 123"
                        {...field}
                        value={field.value ?? ""} // <-- AQUI 🔥
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      O endereço principal da sua empresa.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL da Imagem/Logo</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ex: [https://meuapp.com/logo.png](https://meuapp.com/logo.png)"
                        {...field}
                        value={field.value ?? ""} // <-- AQUI 🔥
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormDescription>
                      Link direto para a imagem do seu logo (opcional).
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={loadingState !== "idle" || !form.formState.isValid}
            >
              {loadingState === "creating" || loadingState === "editing" ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              {isEditing ? "Salvar Alterações" : "Criar Estabelecimento"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
