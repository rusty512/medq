"use client";

import { HeaderRow } from "@/components/features/blocks/HeaderRow";
import { DataTable } from "@/components/features/blocks/DataTable";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth-context";
import { UserService, UserData } from "@/lib/user-service";
import { VisitsService, Visit } from "@/lib/visits-service";
import { RAMQService } from "@/lib/ramq-service";
import { useMemo, useEffect, useState } from "react";
import { Download, Loader2, CheckCircle, XCircle } from "lucide-react";

export default function FacturationPage() {
  const { user: authUser, userData, visits, loading: authLoading, userDataLoading, dataLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [exportResults, setExportResults] = useState<{ success: number; failed: number; details: string[] } | null>(null);

  useEffect(() => {
    // Data is already loaded in AuthContext, just set loading state
    if (authLoading || userDataLoading || dataLoading || !authUser || !userData) {
      setLoading(true);
    } else {
      console.log('📊 Facturation data ready:', { visits: visits.length });
      setLoading(false);
    }
  }, [authUser, authLoading, userDataLoading, dataLoading, userData, visits]);

  const handleExportToRAMQ = async () => {
    if (!visits.length) {
      setError('Aucune visite à exporter');
      return;
    }

    setExporting(true);
    setExportResults(null);
    setError(null);

    try {
      // Get only validated visits for submission
      const validatedVisits = visits.filter(visit => visit.validated);
      
      if (validatedVisits.length === 0) {
        setError('Aucune visite validée à exporter');
        setExporting(false);
        return;
      }

      const visitIds = validatedVisits.map(visit => visit.id);
      const results = await RAMQService.submitMultipleVisits(visitIds);

      // Process results
      const successCount = results.filter(r => r.success).length;
      const failedCount = results.filter(r => !r.success).length;
      const details = results.map((result, index) => {
        const visit = validatedVisits[index];
        if (result.success) {
          return `✅ ${visit.nam} (${visit.acte_code}) - Soumis avec succès`;
        } else {
          return `❌ ${visit.nam} (${visit.acte_code}) - ${result.error}`;
        }
      });

      setExportResults({
        success: successCount,
        failed: failedCount,
        details
      });

      // Refresh visits to get updated submission status
      if (successCount > 0) {
        const visitData = await VisitsService.getVisits();
        setVisits(visitData);
      }

    } catch (err) {
      setError('Erreur lors de l&apos;exportation vers RAMQ');
    } finally {
      setExporting(false);
    }
  };

  // Transform visits data to match DataTable schema for billing view
  const billingData = useMemo(() => {
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

    return Array.from(patientMap.values()); // Show all patients for billing
  }, [visits]);

  if (authLoading || loading) {
    return (
      <div className="p-2 sm:p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Chargement des données de facturation...</div>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return (
      <div className="p-2 sm:p-4">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Veuillez vous connecter pour accéder à la facturation.</div>
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
    <div>
      <HeaderRow
        title="Facturation"
        subtitle={`Gérez vos factures et codes de facturation${userData?.specialty_name ? ` - ${userData.specialty_name}` : ''}`}
        actions={
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExportToRAMQ}
              disabled={exporting || !visits.some(v => v.validated)}
            >
              {exporting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Export vers RAMQ...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4 mr-2" />
                  Exporter vers RAMQ
                </>
              )}
            </Button>
          </div>
        }
      />

      {exportResults && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg border">
          <div className="flex items-center gap-4 mb-3">
            <h3 className="font-semibold text-lg">Résultats de l&apos;export RAMQ</h3>
            <div className="flex items-center gap-2">
              {exportResults.success > 0 && (
                <div className="flex items-center gap-1 text-green-600">
                  <CheckCircle className="h-4 w-4" />
                  <span>{exportResults.success} réussis</span>
                </div>
              )}
              {exportResults.failed > 0 && (
                <div className="flex items-center gap-1 text-red-600">
                  <XCircle className="h-4 w-4" />
                  <span>{exportResults.failed} échoués</span>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-1">
            {exportResults.details.map((detail, index) => (
              <div key={index} className="text-sm font-mono">
                {detail}
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-600">
            <XCircle className="h-4 w-4" />
            <span className="font-medium">Erreur</span>
          </div>
          <p className="text-red-700 mt-1">{error}</p>
        </div>
      )}

      <div className="mt-8">
        <DataTable data={billingData} />
      </div>

    </div>
  );
}