/**
 * Stats Service - Handles billing statistics from backend
 */

const API_BASE_URL = 'http://localhost:3001/api';

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
  /**
   * Get billing statistics for dashboard
   */
  static async getBillingStats(): Promise<BillingStats> {
    try {
      const response = await fetch(`${API_BASE_URL}/stats/billing`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch billing stats');
      }
      
      return result.data;
    } catch (error) {
      console.error('Error fetching billing stats:', error);
      // Return default values on error
      return {
        today: { amount: 0, count: 0, variation: 0 },
        month: { amount: 0, count: 0, variation: 0 },
        refusal: { rate: 0, total: 0, refused: 0, approved: 0 }
      };
    }
  }
}
