"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

export default function RegisterPage() {
  const [fullName, setFullName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [facility, setFacility] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/admin/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fullName, email, password, facility }),
      });

      const data = await response.json();

      if (response.ok) {
        Cookies.set("adminToken", data.accessToken, { expires: 7, sameSite: "strict" });
        router.push("/dashboard");
      } else {
        setError(data.error ?? "Registration failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#0F5FCE]">HealthBox Admin</h1>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleRegister}>
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-[#1A1A1A]">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-[#E0E0E0] rounded-md shadow-sm focus:outline-none focus:ring-[#0F5FCE] focus:border-[#0F5FCE]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#1A1A1A]">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-[#E0E0E0] rounded-md shadow-sm focus:outline-none focus:ring-[#0F5FCE] focus:border-[#0F5FCE]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#1A1A1A]">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-[#E0E0E0] rounded-md shadow-sm focus:outline-none focus:ring-[#0F5FCE] focus:border-[#0F5FCE]"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#1A1A1A]">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-[#E0E0E0] rounded-md shadow-sm focus:outline-none focus:ring-[#0F5FCE] focus:border-[#0F5FCE]"
            />
          </div>
          <div>
            <label htmlFor="facility" className="block text-sm font-medium text-[#1A1A1A]">
              Facility
            </label>
            <input
              id="facility"
              type="text"
              value={facility}
              onChange={(e) => setFacility(e.target.value)}
              required
              disabled={loading}
              className="mt-1 block w-full px-3 py-2 border border-[#E0E0E0] rounded-md shadow-sm focus:outline-none focus:ring-[#0F5FCE] focus:border-[#0F5FCE]"
            />
          </div>
          {error && <p className="text-sm text-[#C62828] text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#0F5FCE] hover:bg-[#0B478F] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0F5FCE] disabled:opacity-50"
          >
            {loading ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="text-center text-sm text-[#1A1A1A]">
          Already have an account? <Link href="/login" className="text-[#0F5FCE] hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}