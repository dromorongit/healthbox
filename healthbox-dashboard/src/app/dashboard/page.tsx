"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface AnalyticsSummary {
  totalCases: number;
  casesByStatus: { draft: number; submitted: number };
  rdtResults: { positive: number; negative: number };
  microscopyResults: { positive: number; negative: number };
  casesByFacility: { facility: string; count: number }[];
  trendData: { date: string; count: number }[];
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const token = localStorage.getItem("adminToken");
        const response = await fetch(`${API_BASE_URL}/api/admin/analytics/summary`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setAnalytics(data);
        } else {
          setError("Failed to load analytics");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <p className="text-center">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <p className="text-center text-[#C62828]">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <p className="text-sm text-[#5C5C5C]">Total Cases</p>
          <p className="text-3xl font-bold text-[#0F5FCE]">{analytics?.totalCases ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <p className="text-sm text-[#5C5C5C]">Draft Cases</p>
          <p className="text-3xl font-bold text-[#1A1A1A]">{analytics?.casesByStatus.draft ?? 0}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <p className="text-sm text-[#5C5C5C]">Submitted Cases</p>
          <p className="text-3xl font-bold text-[#2E7D32]">{analytics?.casesByStatus.submitted ?? 0}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">RDT Results</h2>
          <div className="flex gap-4">
            <div>
              <span className="text-sm text-[#5C5C5C]">Positive: </span>
              <span className="text-xl font-bold text-[#C62828]">{analytics?.rdtResults.positive ?? 0}</span>
            </div>
            <div>
              <span className="text-sm text-[#5C5C5C]">Negative: </span>
              <span className="text-xl font-bold text-[#2E7D32]">{analytics?.rdtResults.negative ?? 0}</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow border">
          <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">Microscopy Results</h2>
          <div className="flex gap-4">
            <div>
              <span className="text-sm text-[#5C5C5C]">Positive: </span>
              <span className="text-xl font-bold text-[#C62828]">{analytics?.microscopyResults.positive ?? 0}</span>
            </div>
            <div>
              <span className="text-sm text-[#5C5C5C]">Negative: </span>
              <span className="text-xl font-bold text-[#2E7D32]">{analytics?.microscopyResults.negative ?? 0}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow border mb-8">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-3">Cases by Facility</h2>
        {analytics?.casesByFacility.length === 0 ? (
          <p className="text-[#5C5C5C]">No data available</p>
        ) : (
          <ul className="space-y-2">
            {analytics?.casesByFacility.map((facility) => (
              <li key={facility.facility} className="flex justify-between">
                <span>{facility.facility}</span>
                <span className="font-bold">{facility.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow border mb-8">
        <h2 className="text-lg font-semibold text-[#1A1A1A] mb-4">Case Trends (Last 30 Days)</h2>
        {analytics?.trendData.length === 0 ? (
          <p className="text-[#5C5C5C]">No trend data available</p>
        ) : (
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.trendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="count" stroke="#0F5FCE" fill="#0F5FCE" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <Link href="/dashboard/cases" className="inline-block text-center w-full py-2 px-4 bg-[#0F5FCE] text-white rounded-md hover:bg-[#0B478F]">
        View All Cases
      </Link>
    </div>
  );
}