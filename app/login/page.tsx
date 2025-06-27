"use client";

import { signIn, useSession } from "next-auth/react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function LoginPage() {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/editor");
    }
  }, [router, status]);

  if (status !== "unauthenticated") {
    return (
      <main className="min-h-screen flex items-center justify-center bg-black text-white">
        <p className="text-lg animate-pulse">Checking session...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white px-4">
      <div className="max-w-sm bg-gray-900 rounded-xl p-8 shadow-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in to Dataflow</h1>

        <button
          onClick={() => signIn("google")}
          className="flex items-center justify-center gap-[10px] bg-[#131314] text-[#E3E3E3] font-medium px-[12px] rounded hover:bg-gray-700 transition mb-4"
        >
          <Image src="/google-icon.svg" alt="Google" width={40} height={40} />
          Continue with Google
        </button>

        <button
          onClick={() => signIn("github")}
          className="flex items-center justify-center gap-[10px] bg-[#131314] text-[#E3E3E3] border border-gray-700 font-medium px-[12px] rounded hover:bg-gray-700 transition"
        >
          <Image src="/github-mark-white.svg" alt="GitHub" width={40} height={40} />
          Continue with GitHub
        </button>
      </div>
    </main>
  );
}
