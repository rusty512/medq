/**
 * Stats Service - Handles billing statistics from backend
 */

import { createClient } from './supabase/client';

const API_BASE_URL = 'http://localhost:4000';

export interface BillingStats {
  today: {
    amount: number;
    count: number;
    variation: number;
  };
  month: {
    amount: number;
    count: number;
    variation: number;
  };
  refusal: {
    rate: number;
    total: number;
    refused: number;
    approved: number;
  };
}

export class StatsService {
  private static supabase = createClient();

  /**
   * Get billing statistics for dashboard
   */
  static async getBillingStats(): Promise<BillingStats | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session?.access_token) {
        console.warn('No active session for fetching billing stats');
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/stats/billing`, {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: 'no-store',
      });
      
      if (!response.ok) {
        console.warn(`Billing stats API returned ${response.status} - returning null`);
        return null;
      }
      
      const result = await response.json();
      
      if (!result.success) {
        console.warn('Billing stats API returned error:', result.error);
        return null;
      }
      
      return result.data;
    } catch (error) {
      console.warn('Error fetching billing stats:', error);
      return null;
    }
  }
}
