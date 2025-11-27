import { ProfessionalForm } from "../components/professional-form";

export default function NewProfessionalPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Registrar Novo Profissional</h1>
      <p className="text-gray-500 dark:text-gray-400">
        Preencha com os detalhes do novo profissional do seu Estabelecimento.
      </p>
      <ProfessionalForm />
    </div>
  );
}
