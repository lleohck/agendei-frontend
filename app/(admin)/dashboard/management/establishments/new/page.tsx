"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
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
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { EstablishmentDAO } from "@/dao/establishment-dao";
import { useUserRole } from "@/hooks/use-user-role";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  slug: z
    .string()
    .min(3)
    .regex(/^[a-z0-9-]+$/, {
      message:
        "Slug must contain only lowercase letters, numbers, and hyphens.",
    }),
});

type EstablishmentFormValues = z.infer<typeof formSchema>;

export default function NewEstablishmentPage() {
  const router = useRouter();
  const { accessToken } = useUserRole();

  const form = useForm<EstablishmentFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
    },
  });

  async function onSubmit(data: EstablishmentFormValues) {
    if (!accessToken) {
      toast.error("Authentication token missing.");
      return;
    }

    try {
      await EstablishmentDAO.create(data, accessToken);
      toast.success("Establishment created successfully!");
      router.push("/dashboard/management/establishments");
    } catch (error) {
      console.error(error);
      toast.error("Failed to create establishment. Slug might be taken.");
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Establishment</h1>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-lg">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Establishment Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Barbershop" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug (URL)</FormLabel>
                  <FormControl>
                    <Input placeholder="my-barbershop" {...field} />
                  </FormControl>
                  <FormDescription>
                    Unique identifier for the URL (e.g.,
                    agendei.com/my-barbershop)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                "Create Establishment"
              )}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}
