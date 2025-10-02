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

// Return realistic mock visits data for development/demo
export async function fetchMockVisits(): Promise<MockVisit[]> {
  // Simulate async operation
  return new Promise((resolve) => {
    setTimeout(() => {
      const mockVisits: MockVisit[] = [
        {
          id: 1,
          user_id: "ab3a9e65-64f8-48a0-98ff-555bd36b256a",
          nam: "DUPONT1234567",
          patient_age: 45,
          establishment_code: "61",
          date: new Date().toISOString().split('T')[0], // Today
          heure: "09:30",
          acte_code: "02400", // Consultation ophtalmologique
          majoration_percent: 0,
          is_garde: false,
          validated: true,
          validated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 2,
          user_id: "ab3a9e65-64f8-48a0-98ff-555bd36b256a",
          nam: "MARTIN7654321",
          patient_age: 32,
          establishment_code: "61",
          date: new Date().toISOString().split('T')[0], // Today
          heure: "14:15",
          acte_code: "02401", // Examen de la vision
          majoration_percent: 0,
          is_garde: false,
          validated: false,
          validated_at: "",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 3,
          user_id: "ab3a9e65-64f8-48a0-98ff-555bd36b256a",
          nam: "BERNARD9876543",
          patient_age: 67,
          establishment_code: "61",
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
          heure: "11:00",
          acte_code: "02402", // Rétinographie
          majoration_percent: 50, // Garde de nuit
          is_garde: true,
          validated: true,
          validated_at: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 4,
          user_id: "ab3a9e65-64f8-48a0-98ff-555bd36b256a",
          nam: "TREMBLAY1111111",
          patient_age: 28,
          establishment_code: "61",
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
          heure: "16:30",
          acte_code: "02403", // Fond d'œil
          majoration_percent: 0,
          is_garde: false,
          validated: true,
          validated_at: new Date(Date.now() - 86400000).toISOString(),
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 5,
          user_id: "ab3a9e65-64f8-48a0-98ff-555bd36b256a",
          nam: "GAGNON2222222",
          patient_age: 55,
          establishment_code: "61",
          date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
          heure: "10:45",
          acte_code: "02404", // Prescription de verres
          majoration_percent: 0,
          is_garde: false,
          validated: false,
          validated_at: "",
          created_at: new Date(Date.now() - 172800000).toISOString(),
          updated_at: new Date(Date.now() - 172800000).toISOString()
        }
      ];
      resolve(mockVisits);
    }, 300); // Small delay to simulate network request
  });
}

// Get mock user (no API call needed)
export function getMockUser(): MockUser {
  return DEMO_USER;
}
