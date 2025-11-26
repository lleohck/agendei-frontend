import { ServiceForm } from "./components/service-form";

export default function NewServicePage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">New Service</h1>
      <p className="text-gray-500 dark:text-gray-400">
        Add a new service to your establishment menu.
      </p>

      <ServiceForm />
    </div>
  );
}
