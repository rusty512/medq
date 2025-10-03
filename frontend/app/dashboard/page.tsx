"use client";

import { HeaderRow } from "@/components/features/blocks/HeaderRow";
import { DataTable } from "@/components/features/blocks/DataTable";
import { Button } from "@/components/ui/button";
import { getMockUser, fetchMockVisits, MockVisit } from "@/lib/mock-user";
import { useMemo, useEffect, useState } from "react";
import { Plus, Calendar, Users, DollarSign } from "lucide-react";

export default function Dashboard() {
  const user = getMockUser();
  const [visits, setVisits] = useState<MockVisit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVisits = async () => {
      try {
        setLoading(true);
        const visitData = await fetchMockVisits();
        setVisits(visitData);
      } catch (err) {
        setError('Failed to load visits');
      } finally {
        setLoading(false);
      }
    };
    
    loadVisits();
  }, []);

  // Transform visits data to match DataTable schema for dashboard view
  const dashboardData = useMemo(() => {
    if (!visits.length) return [];

    // Group visits by patient NAM and create weekly view
    const patientMap = new Map();

    visits.forEach(visit => {
      const nam = visit.nam;
      if (!patientMap.has(nam)) {
        patientMap.set(nam, {
          id: visit.id,
          patientName: nam, // Using NAM as display name for now
          nam: nam,
          establishment: visit.establishment_code === '55619' ? 'CENTRE MEDICAL FLEURY WILSON' : visit.establishment_code,
          lun: undefined,
          mar: undefined,
          mer: undefined,
          jeu: undefined,
          ven: undefined,
          sam: undefined,
          dim: undefined,
        });
      }

      // Map visit to day of week based on date
      const visitDate = new Date(visit.date);
      const dayOfWeek = visitDate.getDay(); // 0=Sunday, 1=Monday, etc.

      const actData = {
        code: visit.acte_code,
        status: visit.validated ? "approved" : "pending" as "pending" | "approved" | "error"
      };

      // Map to French day names (Monday=1 -> lun, Tuesday=2 -> mar, etc.)
      const dayMap = {
        1: 'lun', 2: 'mar', 3: 'mer', 4: 'jeu',
        5: 'ven', 6: 'sam', 0: 'dim'
      };

      const dayKey = dayMap[dayOfWeek as keyof typeof dayMap];
      if (dayKey && patientMap.get(nam)[dayKey] === undefined) {
        patientMap.get(nam)[dayKey] = actData;
      }
    });

    return Array.from(patientMap.values());
  }, [visits]);

  // Calculate dashboard stats
  const stats = useMemo(() => {
    const totalVisits = visits.length;
    const validatedVisits = visits.filter(v => v.validated).length;
    const pendingVisits = totalVisits - validatedVisits;
    const totalPatients = new Set(visits.map(v => v.nam)).size;

    return {
      totalVisits,
      validatedVisits,
      pendingVisits,
      totalPatients
    };
  }, [visits]);

  if (loading) {
    return (
      <div className="p-2 sm:p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement du tableau de bord...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-2 sm:p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Erreur: {error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeaderRow
        title="Tableau de bord"
        subtitle={`Vue d'ensemble de votre activité - ${user.professional_info.specialty}`}
        actions={
          <div className="flex gap-2">
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Nouvelle visite
            </Button>
          </div>
        }
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total des visites</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalVisits}</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Visites validées</p>
              <p className="text-2xl font-bold text-green-600">{stats.validatedVisits}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">En attente</p>
              <p className="text-2xl font-bold text-amber-600">{stats.pendingVisits}</p>
            </div>
            <Calendar className="h-8 w-8 text-amber-600" />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Patients uniques</p>
              <p className="text-2xl font-bold text-purple-600">{stats.totalPatients}</p>
            </div>
            <Users className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-lg border shadow-sm">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Vue hebdomadaire des visites</h3>
          <p className="text-sm text-gray-600">Gérez vos visites par patient et par jour de la semaine</p>
        </div>
        <div className="p-4">
          <DataTable data={dashboardData} />
        </div>
      </div>
    </div>
  );
}
