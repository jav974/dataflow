"use client";

import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";

export default function TopbarUserMenu() {
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setOpen((prev) => !prev)} className="focus:outline-none cursor-pointer">
        <img
          src={session.user.image || "/default-avatar.png"}
          alt="User avatar"
          width={36}
          height={36}
          className="rounded-full border border-gray-600"
        />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 bg-black text-white rounded shadow-md py-2 z-50">
          <div className="px-4 py-2 text-sm">{session.user.name}</div>
          <button
            onClick={() => signOut({callbackUrl: "/"})}
            className="cursor-pointer w-full text-left px-4 py-2 hover:bg-gray-700 text-sm"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
