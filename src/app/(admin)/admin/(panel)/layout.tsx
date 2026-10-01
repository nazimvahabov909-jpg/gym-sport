import { redirect } from "next/navigation";
import { getCurrentAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { AdminShell } from "@/components/admin/AdminShell";

export default async function AdminPanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const [orders, leads] = await Promise.all([
    db.order.count({ where: { status: "NEW" } }),
    db.lead.count({ where: { status: "NEW" } }),
  ]);

  return (
    <AdminShell
      admin={{ name: admin.name, email: admin.email, role: admin.role }}
      badges={{ orders, leads }}
    >
      {children}
    </AdminShell>
  );
}
