// O DashboardLayout será aplicado via (admin)/layout.tsx
// O LogoutButton foi movido para a Sidebar
export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard Overview</h1>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <p className="text-gray-700 dark:text-gray-300">
          This is the central view. Content will vary based on user role (Owner,
          Professional).
        </p>
        <p className="mt-4 text-sm text-indigo-500">
          Click the links on the left sidebar to navigate.
        </p>
      </div>
    </div>
  );
}
