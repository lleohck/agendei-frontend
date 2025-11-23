import { EditServiceForm } from "./components/edit-service-form";

export default async function ServiceEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const {id} = await params;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Service</h1>
      <p className="text-gray-500 dark:text-gray-400">
        Update details for service ID: {id}
      </p>

      <EditServiceForm serviceId={id} />
    </div>
  );
}
