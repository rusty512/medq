"use client";

import { HeaderRow } from "@/components/features/blocks/HeaderRow";
import { SectionHeader } from "@/components/features/blocks/SectionHeader";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/features/blocks/StatCard";
import { DataTable } from "@/components/features/blocks/DataTable";
import { Plus, RefreshCw } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { UserService } from "@/lib/user-service";
import { useMemo, useState } from "react";

export default function Home() {
  const { user: authUser, userData, visits, billingStats, loading: authLoading, userDataLoading, dataLoading, refreshAllData } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Data is already loaded in AuthContext, no need for local loading state
  const loading = authLoading || userDataLoading || dataLoading;

  // Function to refresh data
  const refreshData = async () => {
    if (!authUser || !userData) return;
    
    setRefreshing(true);
    try {
      // Refresh all data through AuthContext
      await refreshAllData();
    } catch (err) {
      console.error('❌ Error refreshing data:', err);
      // Error handling could be improved with toast notifications
    } finally {
      setRefreshing(false);
    }
  };

  // Transform visits data to match DataTable schema
  const previewData = useMemo(() => {
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

    return Array.from(patientMap.values()).slice(0, 3); // Show first 3 patients
  }, [visits]);

  // Use real billing stats from RAMQ or show N/D when not available
  const stats = useMemo(() => {
    if (billingStats) {
      return {
        today: {
          amount: billingStats.today.amount,
          variation: billingStats.today.variation
        },
        month: {
          amount: billingStats.month.amount,
          variation: billingStats.month.variation
        },
        refusal: {
          rate: billingStats.refusal.rate,
          variation: 0 // Could calculate this if we had historical data
        }
      };
    }

    // Show N/D (Not Available) when no billing stats available
    return {
      today: { amount: null, variation: null },
      month: { amount: null, variation: null },
      refusal: { rate: null, variation: null }
    };
  }, [billingStats]);

  if (authLoading || userDataLoading || dataLoading || loading) {
    return (
      <div className="p-2 sm:p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="p-2 sm:p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Veuillez vous connecter pour accéder au tableau de bord.</div>
        </div>
      </div>
    );
  }

  // Error handling is now managed by the AuthContext

  return (
    <div className="p-2 sm:p-4">
      <HeaderRow
        title="Votre résumé"
        subtitle={userData ? UserService.getUserDisplayName(userData) : 'Chargement...'}
        actions={
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={refreshData} disabled={refreshing}>
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              {refreshing ? 'Actualisation...' : 'Actualiser'}
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4" />
              Facturer
            </Button>
          </div>
        }
      />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard 
          title="Aujourd'hui" 
          value={stats.today.amount !== null ? `$${stats.today.amount.toFixed(2)}` : 'N/D'} 
          deltaText={stats.today.variation !== null ? `${stats.today.variation.toFixed(1)}% vs semaine dernière` : 'Données non disponibles'} 
          deltaPositive={stats.today.variation !== null ? stats.today.variation > 0 : undefined} 
        />
        <StatCard 
          title="Facturé ce mois ci" 
          value={stats.month.amount !== null ? `$${stats.month.amount.toFixed(2)}` : 'N/D'} 
          deltaText={stats.month.variation !== null ? `${stats.month.variation.toFixed(1)}% vs dernier mois` : 'Données non disponibles'} 
          deltaPositive={stats.month.variation !== null ? stats.month.variation > 0 : undefined} 
        />
        <StatCard 
          title="Pourcentage de refus" 
          value={stats.refusal.rate !== null ? `${stats.refusal.rate.toFixed(1)}%` : 'N/D'} 
          deltaText={stats.refusal.variation !== null ? `${stats.refusal.variation.toFixed(1)}% vs dernier mois` : 'Données non disponibles'} 
          deltaPositive={stats.refusal.variation !== null ? stats.refusal.variation < 0 : undefined} 
        />
      </div>

      <div className="mt-8">
        <SectionHeader
          title="Aperçu de cette semaine"
          actions={
            <Button size="sm" variant="secondary">Voir tout</Button>
          }
        />
        <div className="mt-4">
          <DataTable data={previewData} />
        </div>
      </div>
    </div>
  );
}