"use client";

import { createClient } from './supabase/client';

export interface Visit {
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

export class VisitsService {
  private static supabase = createClient();

  /**
   * Fetch visits for the current user
   * TODO: This will be replaced when the visits API endpoint is implemented
   */
  static async getVisits(): Promise<Visit[]> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.warn('No active session for fetching visits');
        return [];
      }

      // TODO: Replace with real API call when visits endpoint is available
      // const response = await fetch('/api/visits', {
      //   headers: {
      //     Authorization: `Bearer ${session.access_token}`,
      //   },
      //   cache: 'no-store',
      // });

      // For now, return empty array until visits API is implemented
      console.log('Visits API not yet implemented, returning empty array');
      return [];
      
    } catch (error) {
      console.error('Error fetching visits:', error);
      return [];
    }
  }

  /**
   * Submit a visit to RAMQ
   */
  static async submitVisitToRAMQ(visitId: number): Promise<{ success: boolean; message: string }> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session?.access_token) {
        return { success: false, message: 'No active session' };
      }

      // TODO: Implement actual RAMQ submission
      console.log(`Submitting visit ${visitId} to RAMQ`);
      
      // Placeholder response
      return { success: true, message: 'Visit submitted successfully' };
      
    } catch (error) {
      console.error('Error submitting visit to RAMQ:', error);
      return { success: false, message: 'Failed to submit visit' };
    }
  }

  /**
   * Get visits statistics for dashboard
   */
  static async getVisitStats(): Promise<{
    today: number;
    thisWeek: number;
    thisMonth: number;
    pendingValidation: number;
  }> {
    try {
      const visits = await this.getVisits();
      
      const today = new Date().toISOString().split('T')[0];
      const thisWeekStart = new Date();
      thisWeekStart.setDate(thisWeekStart.getDate() - thisWeekStart.getDay());
      const thisMonthStart = new Date();
      thisMonthStart.setDate(1);
      
      return {
        today: visits.filter(v => v.date === today).length,
        thisWeek: visits.filter(v => new Date(v.date) >= thisWeekStart).length,
        thisMonth: visits.filter(v => new Date(v.date) >= thisMonthStart).length,
        pendingValidation: visits.filter(v => !v.validated).length,
      };
    } catch (error) {
      console.error('Error calculating visit stats:', error);
      return { today: 0, thisWeek: 0, thisMonth: 0, pendingValidation: 0 };
    }
  }
}
