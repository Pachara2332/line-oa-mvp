"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";
import { Modal } from "./ui/modal";
import { Spinner } from "./ui/spinner";

export function LogoutButton({ text }: { text: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="ยืนยันการออกจากระบบ">
        <p className="text-gray-600 dark:text-gray-300">คุณต้องการออกจากระบบใช่หรือไม่?</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300 transition-colors dark:bg-zinc-800 dark:text-gray-300 dark:hover:bg-zinc-700"
          >
            ยกเลิก
          </button>
          <form 
            action="/api/auth/logout" 
            method="post" 
            onSubmit={() => setIsLoggingOut(true)}
          >
            <button
              type="submit"
              disabled={isLoggingOut}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition-colors disabled:opacity-60"
            >
              {isLoggingOut && <Spinner className="h-4 w-4 text-white" />}
              ออกจากระบบ
            </button>
          </form>
        </div>
      </Modal>

      <button 
        onClick={() => setIsOpen(true)}
        className="mt-4 flex items-center gap-2 text-emerald-300 hover:text-white transition-colors"
      >
        <LogOut size={14} /> {text}
      </button>
    </>
  );
}
