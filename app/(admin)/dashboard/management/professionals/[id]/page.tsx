import { ProfessionalForm } from "../components/professional-form";
import { ProfessionalServicesForm } from "./components/professional-service-form";

export default async function ProfessionalFormPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Professional Informations</h1>
      <p className="text-gray-500 dark:text-gray-400">
        Update the details for the new professional who will be part of your
        establishment.
      </p>
      <div className="flex flex-row justify- gap-4">
        <ProfessionalForm professionalId={id} />
        <ProfessionalServicesForm professionalId={id} />
      </div>
    </div>
  );
}
