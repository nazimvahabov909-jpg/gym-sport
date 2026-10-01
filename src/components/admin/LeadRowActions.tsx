"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { deleteLead, updateLeadStatus } from "@/app/actions/admin";
import type { LeadStatus } from "@/generated/prisma/enums";

export function LeadRowActions({
  leadId,
  status,
  labels,
  mode,
}: {
  leadId: number;
  status: LeadStatus;
  labels: Record<LeadStatus, string>;
  mode: "status" | "delete";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  if (mode === "delete") {
    return confirming ? (
      <span className="flex items-center justify-end gap-2 whitespace-nowrap">
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            startTransition(async () => {
              await deleteLead(leadId);
              router.refresh();
            })
          }
          className="text-xs font-bold text-brand-600 hover:underline"
        >
          Удалить
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="text-xs text-ink-500 hover:underline"
        >
          Отмена
        </button>
      </span>
    ) : (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label="Удалить заявку"
        className="grid size-8 place-items-center rounded-lg text-ink-400 transition hover:bg-brand-50 hover:text-brand-600"
      >
        <Trash2 className="size-4" aria-hidden />
      </button>
    );
  }

  return (
    <select
      value={status}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value as LeadStatus;
        startTransition(async () => {
          await updateLeadStatus({ leadId, status: next });
          router.refresh();
        });
      }}
      className="h-8 rounded-lg border border-ink-200 bg-white px-2 text-xs font-semibold outline-none transition focus:border-brand-500"
    >
      {(Object.keys(labels) as LeadStatus[]).map((value) => (
        <option key={value} value={value}>
          {labels[value]}
        </option>
      ))}
    </select>
  );
}
