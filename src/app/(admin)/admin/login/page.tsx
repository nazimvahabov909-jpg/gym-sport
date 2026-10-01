import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { AdminLoginForm } from "@/components/admin/AdminLoginForm";

export const metadata = { title: "Вход" };

export default async function AdminLoginPage() {
  if (await getCurrentAdmin()) redirect("/admin");

  return (
    <div className="flex min-h-dvh items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm rounded-2xl border border-ink-200 bg-white p-8 shadow-card">
        <p className="font-display text-xs font-bold uppercase tracking-[0.22em] text-brand-600">
          United Sport
        </p>
        <h1 className="mt-2 text-2xl font-extrabold">Панель управления</h1>
        <p className="mt-1.5 text-sm text-ink-500">Войдите, чтобы продолжить</p>
        <div className="mt-6">
          <AdminLoginForm />
        </div>
      </div>
    </div>
  );
}
