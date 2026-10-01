import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/format";
import { EmptyState, PageHeader, Table } from "@/components/admin/ui";

export const metadata = { title: "Клиенты" };

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  const customers = await db.customer.findMany({
    where: query
      ? {
          OR: [
            { email: { contains: query } },
            { firstName: { contains: query } },
            { phone: { contains: query } },
          ],
        }
      : undefined,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      phone: true,
      locale: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });

  return (
    <>
      <PageHeader title="Клиенты" description={`Найдено: ${customers.length}`} />

      <form action="/admin/customers" className="mb-4 flex gap-2">
        <input
          name="q"
          defaultValue={query}
          placeholder="E-mail, имя или телефон"
          className="h-9 w-full max-w-xs rounded-lg border border-ink-200 px-3 text-sm outline-none transition focus:border-brand-500"
        />
        <button type="submit" className="h-9 rounded-lg bg-ink-900 px-4 text-sm font-semibold text-white">
          Найти
        </button>
      </form>

      {customers.length === 0 ? (
        <EmptyState title="Клиентов не найдено" />
      ) : (
        <Table
          head={
            <>
              <th>Имя</th>
              <th>E-mail</th>
              <th>Телефон</th>
              <th>Язык</th>
              <th>Заказов</th>
              <th>Регистрация</th>
            </>
          }
        >
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td className="font-medium">
                {customer.firstName} {customer.lastName ?? ""}
              </td>
              <td>
                <a href={`mailto:${customer.email}`} className="text-brand-600 hover:underline">
                  {customer.email}
                </a>
              </td>
              <td className="text-ink-600">{customer.phone ?? "—"}</td>
              <td className="uppercase text-ink-500">{customer.locale}</td>
              <td className="text-ink-600">{customer._count.orders}</td>
              <td className="whitespace-nowrap text-xs text-ink-400">
                {formatDateTime(customer.createdAt)}
              </td>
            </tr>
          ))}
        </Table>
      )}
    </>
  );
}
