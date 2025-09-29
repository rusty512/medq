"use client";

import { HeaderRow } from "@/components/features/blocks/HeaderRow";
import { SectionHeader } from "@/components/features/blocks/SectionHeader";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/features/blocks/StatCard";
import { DataTable } from "@/components/features/blocks/DataTable";
import { Plus, RefreshCw } from "lucide-react";
import { getMockUser, fetchMockVisits, MockVisit } from "@/lib/mock-user";
import { StatsService, BillingStats } from "@/lib/stats-service";
import { useMemo, useEffect, useState } from "react";

export default function Home() {
  console.log('🏠 Home component rendering...');
  const user = getMockUser();
  const [visits, setVisits] = useState<MockVisit[]>([]);
  const [billingStats, setBillingStats] = useState<BillingStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 Loading data...');
      try {
        setLoading(true);
        
        // Load visits and billing stats in parallel
        const [visitData, statsData] = await Promise.all([
          fetchMockVisits(),
          StatsService.getBillingStats()
        ]);
        
        console.log('📊 Setting visits:', visitData.length);
        setVisits(visitData);
        
        console.log('📈 Setting stats:', statsData);
        setBillingStats(statsData);
        
      } catch (err) {
        console.error('❌ Error:', err);
        setError('Failed to load data');
      } finally {
        console.log('✅ Setting loading to false');
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Function to refresh data
  const refreshData = async () => {
    setRefreshing(true);
    try {
      // Load visits and billing stats in parallel
      const [visitData, statsData] = await Promise.all([
        fetchMockVisits(),
        StatsService.getBillingStats()
      ]);
      
      setVisits(visitData);
      setBillingStats(statsData);
    } catch (err) {
      console.error('❌ Error refreshing data:', err);
      setError('Failed to refresh data');
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

  // Use real billing stats from RAMQ or fallback to calculated stats
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

    // Fallback to calculated stats if billing stats not available
    const today = new Date().toISOString().split('T')[0];
    const todayVisits = visits.filter(visit => visit.date === today);
    const thisMonth = visits.filter(visit => 
      visit.date.startsWith(new Date().toISOString().substring(0, 7))
    );

    const totalToday = todayVisits.length;
    const totalThisMonth = thisMonth.length;
    const refusalRate = visits.length > 0 ? 
      (visits.filter(v => !v.validated).length / visits.length * 100) : 0;

    return {
      today: { amount: totalToday * 150, variation: 6.0 }, // Mock amounts
      month: { amount: totalThisMonth * 120, variation: 2.4 },
      refusal: { rate: refusalRate, variation: 1.4 }
    };
  }, [billingStats, visits]);

  console.log('🔄 Current state:', { loading, error, visits: visits.length, stats: billingStats ? 'loaded' : 'null' });

  if (loading) {
    return (
      <div className="p-2 sm:p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement...</div>
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
    <div className="p-2 sm:p-4">
      <HeaderRow
        title="Votre résumé"
        subtitle={`Dr. ${user.personal_info.firstName} ${user.personal_info.lastName}`}
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
          value={`$${stats.today.amount.toFixed(2)}`} 
          deltaText={`${stats.today.variation.toFixed(1)}% vs semaine dernière`} 
          deltaPositive={stats.today.variation > 0} 
        />
        <StatCard 
          title="Facturé ce mois ci" 
          value={`$${stats.month.amount.toFixed(2)}`} 
          deltaText={`${stats.month.variation.toFixed(1)}% vs dernier mois`} 
          deltaPositive={stats.month.variation > 0} 
        />
        <StatCard 
          title="Pourcentage de refus" 
          value={`${stats.refusal.rate.toFixed(1)}%`} 
          deltaText={`${stats.refusal.variation.toFixed(1)}% vs dernier mois`} 
          deltaPositive={stats.refusal.variation < 0} 
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