import { ProfessionalForm } from "./components/professional-form";

export default function NewProfessionalPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Register New Professional</h1>
      <p className="text-gray-500 dark:text-gray-400">
        Fill in the details for the new professional who will be part of your
        establishment.
      </p>

      <ProfessionalForm />
    </div>
  );
}
