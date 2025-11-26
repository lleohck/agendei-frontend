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

import { ProfessionalDAO } from "@/dao/professional-dao";
import {
  EstablishmentDAO,
  EstablishmentResponse,
} from "@/dao/establishment-dao";
import { useUserRole } from "@/hooks/use-user-role";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Invalid email address." }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." }),
  establishmentId: z
    .string()
    .min(1, { message: "Please select an establishment." }),
  bio: z.string().optional(),
  schedulingType: z.enum(["EXACT_TIME", "FIXED_SLOTS"]),
  slotIntervalMinutes: z.coerce.number().min(5).max(120),
});

type ProfessionalFormValues = z.infer<typeof formSchema>;

export function ProfessionalForm() {
  const router = useRouter();
  const { accessToken } = useUserRole();
  const [establishments, setEstablishments] = useState<EstablishmentResponse[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  const form = useForm<ProfessionalFormValues>({
    resolver: zodResolver(formSchema),
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

  useEffect(() => {
    if (accessToken) {
      EstablishmentDAO.getAll(accessToken)
        .then((data) => setEstablishments(data))
        .catch(() => toast.error("Failed to load establishments."))
        .finally(() => setLoading(false));
    }
  }, [accessToken]);

  async function onSubmit(data: ProfessionalFormValues) {
    if (!accessToken) {
      toast.error("Authentication token missing.");
      return;
    }

    try {
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
      router.push("/dashboard/management/professionals");
    } catch (error) {
      console.error("Registration failed:", error);
      toast.error("Registration failed. Check your data.");
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
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Input type="number" {...field} />
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
