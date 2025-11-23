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
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { ProfessionalDAO } from "@/dao/professional-dao";
import { useUserRole } from "@/hooks/use-user-role";
import { Loader2 } from "lucide-react";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Full name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Invalid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
});

type ProfessionalFormValues = z.infer<typeof formSchema>;

export function ProfessionalForm() {
  const router = useRouter();
  const { accessToken } = useUserRole();

  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(data: ProfessionalFormValues) {
    if (!accessToken) {
      toast.error("Authentication token not found. Please log in again.");
      return;
    }

    try {
      await ProfessionalDAO.registerProfessional(
        {
          fullName: data.fullName,
          email: data.email,
          password: data.password,
        },
        accessToken
      );

      toast.success("Professional registered successfully!");
      router.push("/dashboard/management/professionals");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error(
        "Registration failed. Could not connect to API or data is invalid."
      );
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow max-w-lg">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name</FormLabel>
                <FormControl>
                  <Input placeholder="E.g., João Silva" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="email@agendei.com" {...field} />
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
                  <Input type="password" placeholder="********" {...field} />
                </FormControl>
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
                Registering...
              </>
            ) : (
              "Register Professional"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
