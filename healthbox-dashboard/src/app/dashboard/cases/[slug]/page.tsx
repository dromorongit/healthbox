"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Cookies from "js-cookie";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

interface MalariaCase {
  id: string;
  patientFullName: string;
  age: number;
  sex: string;
  phoneNumber: string | null;
  community: string;
  isPregnant: boolean | null;
  visitDate: string;
  facilityName: string;
  healthWorkerId: string;
  healthWorkerName: string;
  symptoms: string | null;
  temperature: number | null;
  illnessDurationDays: number | null;
  testType: string;
  rdtResult: string;
  microscopyResult: string;
  parasiteSpecies: string | null;
  parasiteDensity: string | null;
  diagnosisConfirmed: boolean;
  treatmentGiven: string;
  dosageNotes: string | null;
  referredToHospital: boolean;
  followUpRequired: boolean;
  followUpDate: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function CaseDetailPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const [caseData, setCaseData] = useState<MalariaCase | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const extractSuffix = (slug: string): string => {
    const parts = slug.split("-");
    return parts.length > 1 ? parts[parts.length - 1] : slug.slice(-6);
  };

  useEffect(() => {
    const fetchCase = async () => {
      try {
        const token = Cookies.get("adminToken");
        const suffix = extractSuffix(params.slug);
        const response = await fetch(`${API_BASE_URL}/api/admin/cases/${suffix}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          setCaseData(data);
        } else {
          setError("Case not found");
        }
      } catch {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchCase();
  }, [params.slug]);

  if (loading) {
    return <div className="p-8 text-black">Loading...</div>;
  }

  if (error || caseData === null) {
    return <div className="p-8 text-[#C62828]">{error ?? "Case not found"}</div>;
  }

  return (
    <div className="p-8 bg-white min-h-screen">
      <button onClick={() => router.back()} className="mb-4 text-[#0F5FCE] hover:underline">
        ← Back
      </button>

      <h1 className="text-2xl font-bold text-[#1A1A1A] mb-6">Case: {caseData.patientFullName}</h1>

      <div className="space-y-6">
        <section>
          <h2 className="text-lg font-semibold text-[#0F5FCE] mb-3">Patient Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#5C5C5C]">Full Name</p>
              <p className="font-medium text-black">{caseData.patientFullName}</p>
            </div>
            <div>
              <p className="text-sm text-[#5C5C5C]">Age</p>
              <p className="font-medium text-black">{caseData.age}</p>
            </div>
            <div>
              <p className="text-sm text-[#5C5C5C]">Sex</p>
              <p className="font-medium text-black">{caseData.sex}</p>
            </div>
            {caseData.phoneNumber && (
              <div>
                <p className="text-sm text-[#5C5C5C]">Phone</p>
                <p className="font-medium text-black">{caseData.phoneNumber}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-[#5C5C5C]">Community</p>
              <p className="font-medium text-black">{caseData.community}</p>
            </div>
            {caseData.isPregnant !== null && (
              <div>
                <p className="text-sm text-[#5C5C5C]">Pregnant</p>
                <p className="font-medium text-black">{caseData.isPregnant ? "Yes" : "No"}</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#0F5FCE] mb-3">Visit Info</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#5C5C5C]">Visit Date</p>
              <p className="font-medium text-black">{caseData.visitDate}</p>
            </div>
            <div>
              <p className="text-sm text-[#5C5C5C]">Facility</p>
              <p className="font-medium text-black">{caseData.facilityName}</p>
            </div>
            <div>
              <p className="text-sm text-[#5C5C5C]">Health Worker</p>
              <p className="font-medium text-black">{caseData.healthWorkerName}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#0F5FCE] mb-3">Clinical Info</h2>
          {caseData.symptoms && (
            <div className="mb-2">
              <p className="text-sm text-[#5C5C5C]">Symptoms</p>
              <p className="font-medium text-black">{caseData.symptoms}</p>
            </div>
          )}
          {caseData.temperature !== null && (
            <div className="mb-2">
              <p className="text-sm text-[#5C5C5C]">Temperature</p>
              <p className="font-medium text-black">{caseData.temperature}°C</p>
            </div>
          )}
          {caseData.illnessDurationDays !== null && (
            <div>
              <p className="text-sm text-[#5C5C5C]">Illness Duration</p>
              <p className="font-medium text-black">{caseData.illnessDurationDays} days</p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#0F5FCE] mb-3">Test & Diagnosis</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#5C5C5C]">Test Type</p>
              <p className="font-medium text-black">{caseData.testType}</p>
            </div>
            <div>
              <p className="text-sm text-[#5C5C5C]">RDT Result</p>
              <p className="font-medium text-black">{caseData.rdtResult}</p>
            </div>
            <div>
              <p className="text-sm text-[#5C5C5C]">Microscopy Result</p>
              <p className="font-medium text-black">{caseData.microscopyResult}</p>
            </div>
            {caseData.parasiteSpecies && (
              <div>
                <p className="text-sm text-[#5C5C5C]">Parasite Species</p>
                <p className="font-medium text-black">{caseData.parasiteSpecies}</p>
              </div>
            )}
            {caseData.parasiteDensity && (
              <div>
                <p className="text-sm text-[#5C5C5C]">Parasite Density</p>
                <p className="font-medium text-black">{caseData.parasiteDensity}</p>
              </div>
            )}
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#0F5FCE] mb-3">Treatment</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#5C5C5C]">Treatment Given</p>
              <p className="font-medium text-black">{caseData.treatmentGiven}</p>
            </div>
            {caseData.dosageNotes && (
              <div>
                <p className="text-sm text-[#5C5C5C]">Dosage Notes</p>
                <p className="font-medium text-black">{caseData.dosageNotes}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-[#5C5C5C]">Referred to Hospital</p>
              <p className="font-medium text-black">{caseData.referredToHospital ? "Yes" : "No"}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-lg font-semibold text-[#0F5FCE] mb-3">Follow-up</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-[#5C5C5C]">Follow-up Required</p>
              <p className="font-medium text-black">{caseData.followUpRequired ? "Yes" : "No"}</p>
            </div>
            {caseData.followUpDate && (
              <div>
                <p className="text-sm text-[#5C5C5C]">Follow-up Date</p>
                <p className="font-medium text-black">{caseData.followUpDate}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-[#5C5C5C]">Status</p>
              <p className="font-medium capitalize text-black">{caseData.status}</p>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}