"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import Papa from "papaparse";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface MalariaCase {
  id: string;
  patientFullName: string;
  facilityName: string;
  visitDate: string;
  testType: string;
  rdtResult: string;
  microscopyResult: string;
  status: string;
}

interface CasesResponse {
  cases: MalariaCase[];
  total: number;
  page: number;
}

export default function CasesPage() {
  const [cases, setCases] = useState<MalariaCase[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [page, setPage] = useState<number>(1);
  const [filters, setFilters] = useState({
    facility: "",
    status: "",
    dateFrom: "",
    dateTo: "",
    search: "",
  });

  const limit = 50;

  const fetchCases = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("adminToken");
      const params = new URLSearchParams({
        ...filters,
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(`${API_BASE_URL}/api/admin/cases?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data: CasesResponse = await response.json();
        setCases(data.cases);
        setTotal(data.total);
      } else {
        setError("Failed to load cases");
      }
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCases();
  }, [page, filters]);

  const handleExportCSV = async () => {
    const token = localStorage.getItem("adminToken");
    const params = new URLSearchParams({ ...filters, limit: "10000" });
    const response = await fetch(`${API_BASE_URL}/api/admin/cases?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data: CasesResponse = await response.json();

    const csv = Papa.unparse(data.cases);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `cases-${new Date().toISOString().split("T")[0]}.csv`);
  };

  const handleExportExcel = async () => {
    const token = localStorage.getItem("adminToken");
    const params = new URLSearchParams({ ...filters, limit: "10000" });
    const response = await fetch(`${API_BASE_URL}/api/admin/cases?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data: CasesResponse = await response.json();

    const worksheet = XLSX.utils.json_to_sheet(data.cases);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Cases");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(blob, `cases-${new Date().toISOString().split("T")[0]}.xlsx`);
  };

  return (
    <div className="p-8 bg-white min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Malaria Cases</h1>
        <div className="flex gap-2">
          <button onClick={handleExportCSV} className="px-4 py-2 bg-[#0F5FCE] text-white rounded-md hover:bg-[#0B478F]">
            Export CSV
          </button>
          <button onClick={handleExportExcel} className="px-4 py-2 bg-[#C9A227] text-white rounded-md hover:opacity-90">
            Export Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <input
          type="text"
          placeholder="Search by patient name"
          value={filters.search}
          onChange={(e) => { setPage(1); setFilters({ ...filters, search: e.target.value }); }}
          className="px-3 py-2 border border-[#E0E0E0] rounded-md"
        />
        <input
          type="text"
          placeholder="Facility"
          value={filters.facility}
          onChange={(e) => { setPage(1); setFilters({ ...filters, facility: e.target.value }); }}
          className="px-3 py-2 border border-[#E0E0E0] rounded-md"
        />
        <select
          value={filters.status}
          onChange={(e) => { setPage(1); setFilters({ ...filters, status: e.target.value }); }}
          className="px-3 py-2 border border-[#E0E0E0] rounded-md"
        >
          <option value="">All Status</option>
          <option value="draft">Draft</option>
          <option value="submitted">Submitted</option>
        </select>
        <input
          type="date"
          value={filters.dateFrom}
          onChange={(e) => { setPage(1); setFilters({ ...filters, dateFrom: e.target.value }); }}
          className="px-3 py-2 border border-[#E0E0E0] rounded-md"
        />
        <input
          type="date"
          value={filters.dateTo}
          onChange={(e) => { setPage(1); setFilters({ ...filters, dateTo: e.target.value }); }}
          className="px-3 py-2 border border-[#E0E0E0] rounded-md"
        />
      </div>

      {loading ? (
        <p className="text-center">Loading...</p>
      ) : error ? (
        <p className="text-center text-[#C62828]">{error}</p>
      ) : cases.length === 0 ? (
        <p className="text-center text-[#5C5C5C]">No cases found matching your filters</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-[#E0E0E0]">
              <thead className="bg-[#F5F6F8]">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5C5C5C] uppercase">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5C5C5C] uppercase">Facility</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5C5C5C] uppercase">Visit Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5C5C5C] uppercase">Test Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5C5C5C] uppercase">RDT Result</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5C5C5C] uppercase">Microscopy</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-[#5C5C5C] uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E0E0E0]">
                {cases.map((c) => (
                  <tr key={c.id} className="hover:bg-[#F5F6F8]">
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/cases/${c.id}`} className="text-[#0F5FCE] hover:underline">
                        {c.patientFullName}
                      </Link>
                    </td>
                    <td className="px-6 py-4">{c.facilityName}</td>
                    <td className="px-6 py-4">{c.visitDate}</td>
                    <td className="px-6 py-4">{c.testType}</td>
                    <td className="px-6 py-4">{c.rdtResult}</td>
                    <td className="px-6 py-4">{c.microscopyResult}</td>
                    <td className="px-6 py-4 capitalize">{c.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-[#5C5C5C]">
              Total: {total} | Page {page} of {Math.ceil(total / limit)}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 border border-[#E0E0E0] rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= Math.ceil(total / limit)}
                className="px-3 py-1 border border-[#E0E0E0] rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}