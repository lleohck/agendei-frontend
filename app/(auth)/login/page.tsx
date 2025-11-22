import { LoginForm } from "@/components/features/login/login-form"; // Path Corrigido

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
      <LoginForm />
    </div>
  );
}
