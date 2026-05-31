"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Pencil, Plus, Trash2, X } from "lucide-react";
import { Spinner } from "./ui/spinner";
import { Modal } from "./ui/modal";

export type CrudField = {
  name: string;
  label: string;
  type?: "checkbox" | "number" | "select" | "textarea" | "text";
  required?: boolean;
  placeholder?: string;
  options?: { label: string; value: string }[];
};

function formPayload(form: HTMLFormElement, fields: CrudField[]) {
  const data = new FormData(form);
  return Object.fromEntries(fields.map((field) => {
    const value = data.get(field.name);
    if (field.type === "checkbox") return [field.name, value === "on"];
    if (field.type === "number") return [field.name, value ? Number(value) : null];
    return [field.name, typeof value === "string" ? value : ""];
  }));
}

function Fields({
  fields,
  initial = {},
}: {
  fields: CrudField[];
  initial?: Record<string, boolean | number | string | null | undefined>;
}) {
  return fields.map((field) => {
    if (field.type === "checkbox") {
      return (
        <label className="flex items-center gap-3 text-sm font-semibold text-slate-700" key={field.name}>
          <input defaultChecked={Boolean(initial[field.name])} name={field.name} type="checkbox" />
          {field.label}
        </label>
      );
    }
    const className = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500";
    return (
      <label className="block text-sm font-semibold text-slate-700" key={field.name}>
        {field.label}
        {field.type === "select" ? (
          <select className={className} defaultValue={String(initial[field.name] ?? "")} name={field.name} required={field.required}>
            <option value="">Select...</option>
            {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
        ) : field.type === "textarea" ? (
          <textarea className={className} defaultValue={String(initial[field.name] ?? "")} name={field.name} placeholder={field.placeholder} required={field.required} rows={3} />
        ) : (
          <input className={className} defaultValue={String(initial[field.name] ?? "")} name={field.name} placeholder={field.placeholder} required={field.required} type={field.type ?? "text"} />
        )}
      </label>
    );
  });
}

export function CreatePanel({
  endpoint,
  fields,
  initial,
  title,
}: {
  endpoint: string;
  fields: CrudField[];
  initial?: Record<string, boolean | number | string | null | undefined>;
  title: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [pendingPayload, setPendingPayload] = useState<any>(null);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = formPayload(event.currentTarget, fields);
    setPendingPayload(payload);
    setIsConfirmModalOpen(true);
  }

  async function confirmSubmit() {
    setSaving(true);
    setError("");
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pendingPayload),
    });
    const body = await response.json();
    setSaving(false);
    setIsConfirmModalOpen(false);
    if (!response.ok) return setError(body.error);
    setPendingPayload(null);
    setOpen(false);
    router.refresh();
  }

  return (
    <>
      <Modal isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} title="ยืนยันการเพิ่มข้อมูล">
        <p className="text-gray-600 dark:text-gray-300">คุณต้องการเพิ่ม {title} ใช่หรือไม่?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setIsConfirmModalOpen(false)}
            className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition-colors dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
          >
            ยกเลิก
          </button>
          <button
            onClick={confirmSubmit}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 transition-colors"
          >
            {saving && <Spinner className="h-4 w-4 text-white" />}
            ยืนยัน
          </button>
        </div>
      </Modal>

      <div className="mb-6">
        <button className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-emerald-800" onClick={() => setOpen(true)}>
          <Plus size={17} /> {title}
        </button>
        {open && (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 sm:p-5">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-emerald-950">{title}</h2>
              <button className="text-emerald-800" onClick={() => setOpen(false)}><X size={18} /></button>
            </div>
            <form className="mt-4 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
              <Fields fields={fields} initial={initial} />
              {error && <p className="text-sm text-red-600 sm:col-span-2">{error}</p>}
              <button className="flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60 sm:col-span-2" disabled={saving}>
                {saving && <Spinner className="h-4 w-4 text-white" />}
                {saving ? "Saving..." : "Save"}
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}

export function EntityActions({
  endpoint,
  fields,
  initial,
  label,
}: {
  endpoint: string;
  fields: CrudField[];
  initial: Record<string, boolean | number | string | null | undefined>;
  label: string;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const response = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formPayload(event.currentTarget, fields)),
    });
    const body = await response.json();
    setSaving(false);
    if (!response.ok) return setError(body.error);
    setEditing(false);
    router.refresh();
  }

  async function confirmDelete() {
    setSaving(true);
    setError("");
    const response = await fetch(endpoint, { method: "DELETE" });
    const body = await response.json();
    setSaving(false);
    setIsDeleteModalOpen(false);
    if (!response.ok) return setError(body.error);
    router.refresh();
  }

  function remove() {
    setIsDeleteModalOpen(true);
  }

  return (
    <>
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="ยืนยันการลบ">
        <p className="text-gray-600 dark:text-gray-300">คุณต้องการลบ {label} ใช่หรือไม่?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setIsDeleteModalOpen(false)}
            className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition-colors dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
          >
            ยกเลิก
          </button>
          <button
            onClick={confirmDelete}
            disabled={saving}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
          >
            {saving && <Spinner className="h-4 w-4 text-white" />}
            ลบข้อมูล
          </button>
        </div>
      </Modal>

      <div className="min-w-[150px]">
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-bold text-slate-600 hover:border-emerald-400" onClick={() => setEditing(!editing)}>
            <Pencil size={13} /> Edit
          </button>
          <button className="inline-flex items-center gap-1 rounded-lg border border-red-100 px-2.5 py-1.5 text-xs font-bold text-red-600 hover:border-red-300 disabled:opacity-50" disabled={saving} onClick={remove}>
            <Trash2 size={13} /> Delete
          </button>
        </div>
        {editing && (
          <form className="mt-3 grid gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3" onSubmit={submit}>
            <Fields fields={fields} initial={initial} />
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button className="flex items-center justify-center gap-2 rounded-lg bg-emerald-700 px-3 py-2 text-xs font-bold text-white disabled:opacity-60" disabled={saving}>
              {saving && <Spinner className="h-3 w-3 text-white" />}
              {saving ? "Saving..." : "Update"}
            </button>
          </form>
        )}
        {!editing && error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>
    </>
  );
}
