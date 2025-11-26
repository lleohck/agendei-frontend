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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { ServiceDAO } from "@/dao/service-dao";
import {
  EstablishmentDAO,
  EstablishmentResponse,
} from "@/dao/establishment-dao";
import { useUserRole } from "@/hooks/use-user-role";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  base_price: z.coerce
    .number()
    .min(0, { message: "Price cannot be negative." }),
  base_duration_minutes: z.coerce
    .number()
    .min(5, { message: "Duration must be at least 5 minutes." }),
  establishmentId: z
    .string()
    .min(1, { message: "Please select an establishment." }),
});

type ServiceFormValues = z.infer<typeof formSchema>;

export function ServiceForm() {
  const router = useRouter();
  const { accessToken } = useUserRole();
  const [establishments, setEstablishments] = useState<EstablishmentResponse[]>(
    []
  );
  const [loadingEst, setLoadingEst] = useState(true);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      base_price: 0,
      base_duration_minutes: 30,
      establishmentId: "",
    },
  });

  useEffect(() => {
    if (accessToken) {
      EstablishmentDAO.getAll(accessToken)
        .then((data) => setEstablishments(data))
        .catch(() => toast.error("Failed to load establishments."))
        .finally(() => setLoadingEst(false));
    }
  }, [accessToken]);

  async function onSubmit(data: ServiceFormValues) {
    if (!accessToken) {
      toast.error("Authentication token missing.");
      return;
    }
    const payload = {
      name: data.name,
      description: data.description,
      base_price: data.base_price,
      base_duration_minutes: data.base_duration_minutes,
      establishment_id: data.establishmentId,
    };

    console.log("PAYLOAD SENT:", payload);
    try {
      await ServiceDAO.create(payload, accessToken);

      toast.success("Service created successfully!");
      router.push("/dashboard/management/services");
    } catch (error) {
      console.error("Creation failed:", error);
      toast.error("Failed to create service.");
    }
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
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="E.g., Haircut" {...field} />
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
                            loadingEst ? "Loading..." : "Select establishment"
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

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Details about the service..."
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
              name="base_price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (R$)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="base_duration_minutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (Minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} />
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
                Creating...
              </>
            ) : (
              "Create Service"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
