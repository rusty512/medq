/**
 * Mock User Service - Direct access to demo user data
 * Bypasses authentication for testing purposes
 */

export interface MockUser {
  id: string;
  email: string;
  personal_info: {
    firstName: string;
    lastName: string;
    phone: string;
  };
  professional_info: {
    specialty: string;
    ramqId: string;
    establishments: Array<{
      name: string;
      code: string;
      isPrimary: boolean;
    }>;
  };
  shortcuts: Array<{
    letter: string;
    actType: string;
    description: string;
  }>;
}

export interface MockVisit {
  id: number;
  user_id: string;
  nam: string;
  patient_age: number;
  establishment_code: string;
  date: string;
  heure: string;
  acte_code: string;
  majoration_percent: number;
  is_garde: boolean;
  validated: boolean;
  validated_at: string;
  created_at: string;
  updated_at: string;
}

// Demo user data (matches what's in the database) - USING SUCCESSFUL RAMQ DATA
export const DEMO_USER: MockUser = {
  id: "ab3a9e65-64f8-48a0-98ff-555bd36b256a", // Will be updated by recreate script
  email: "demo.anesthesiologist@ramq-scan.com",
  personal_info: {
    firstName: "Dr. Julie",
    lastName: "Ophtalmologue",
    phone: "514-555-0240"
  },
  professional_info: {
    specialty: "024-OPHTALMOLOGIE", // SUCCESSFUL SPECIALTY
    ramqId: "110287", // SUCCESSFUL PROFESSIONAL ID
    establishments: [
      {
        name: "Établissement RAMQ Test (Ophtalmologie)",
        code: "61", // SUCCESSFUL ESTABLISHMENT ID
        isPrimary: true
      }
    ]
  },
  shortcuts: [
    { letter: "C", actType: "consultation_ophtalmo", description: "Consultation ophtalmologique" },
    { letter: "E", actType: "examen_vision", description: "Examen de la vision" },
    { letter: "R", actType: "retinographie", description: "Rétinographie" },
    { letter: "F", actType: "fond_oeil", description: "Fond d'œil" },
    { letter: "P", actType: "prescription_verres", description: "Prescription de verres" },
    { letter: "S", actType: "suivi_glaucom", description: "Suivi glaucome" }
  ]
};

// Fetch visits directly from backend using demo endpoint
export async function fetchMockVisits(): Promise<MockVisit[]> {
  try {
    const response = await fetch('http://localhost:3001/api/visits/demo');
    if (!response.ok) {
      throw new Error('Failed to fetch visits');
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('Error fetching visits:', error);
    return [];
  }
}

// Get mock user (no API call needed)
export function getMockUser(): MockUser {
  return DEMO_USER;
}
