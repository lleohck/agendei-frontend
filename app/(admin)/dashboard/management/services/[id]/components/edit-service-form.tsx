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
import { ServiceDAO } from "@/dao/service-dao";
import { useUserRole } from "@/hooks/use-user-role";
import { Skeleton } from "@/components/ui/skeleton";

interface EditServiceFormProps {
  serviceId: string;
}

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  description: z.string().optional(),
  basePrice: z.coerce.number().min(0, { message: "Price cannot be negative." }),
  baseDurationMinutes: z.coerce
    .number()
    .min(5, { message: "Duration must be at least 5 minutes." }),
});

type EditServiceFormValues = z.infer<typeof formSchema>;

export function EditServiceForm({ serviceId }: EditServiceFormProps) {
  const router = useRouter();
  const { accessToken } = useUserRole();
  const [loadingInitial, setLoadingInitial] = useState(true);

  const form = useForm<EditServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      basePrice: 0,
      baseDurationMinutes: 30,
    },
  });

  // Efeito para carregar os dados iniciais do serviço
  useEffect(() => {
    if (!accessToken || !serviceId) return;

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
        toast.error("Failed to load service data.");
        router.push("/dashboard/management/services");
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchServiceData();
  }, [accessToken, serviceId, form, router]);

  async function onSubmit(data: EditServiceFormValues) {
    if (!accessToken) {
      toast.error("Authentication token missing.");
      return;
    }

    try {
      await ServiceDAO.update(
        serviceId,
        {
          name: data.name,
          description: data.description,
          base_price: data.basePrice,
          base_duration_minutes: data.baseDurationMinutes,
        },
        accessToken
      );

      toast.success("Service updated successfully!");
      router.push("/dashboard/management/services");
    } catch (error) {
      console.error("Update failed:", error);
      toast.error("Failed to update service.");
    }
  }

  if (loadingInitial) {
    return (
      <div className="space-y-6">
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
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price (R$)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      step="0.01"
                      {...field}
                      onChange={(e) =>
                        field.onChange(parseFloat(e.target.value))
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
                  <FormLabel>Duration (Minutes)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
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
                Updating...
              </>
            ) : (
              "Update Service"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
