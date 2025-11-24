import { ProfessionalForm } from "../components/professional-form";

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

      <ProfessionalForm professionalId={id} />
    </div>
  );
}
