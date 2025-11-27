import { ServiceForm } from "../components/service-form";

export default async function ServiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Editar Serviço</h1>
      <p className="text-gray-500 dark:text-gray-400">
        Editar Informações do Serviço
      </p>

      <ServiceForm serviceId={id} />
    </div>
  );
}
