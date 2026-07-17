import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard - HealthBox",
  description: "Hospital staff dashboard for malaria case management",
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}