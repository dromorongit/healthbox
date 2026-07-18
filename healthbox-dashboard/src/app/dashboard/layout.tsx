"use client";

import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("adminToken");
    router.push("/login");
  };

  return (
    <>
      <header className="bg-white shadow-sm border-b border-[#E0E0E0]">
        <div className="px-8 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold text-[#0F5FCE]">HealthBox Admin</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm text-[#C62828] border border-[#C62828] rounded-md hover:bg-[#C62828] hover:text-white transition-colors"
          >
            Logout
          </button>
        </div>
      </header>
      {children}
    </>
  );
}