/**
 * RAMQ Service - Handles RAMQ bill submission
 * Connects to backend RAMQ integration services
 */

const API_BASE_URL = 'http://localhost:3001/api';

export interface RAMQSubmissionResult {
  success: boolean;
  message: string;
  data?: {
    submissionId?: string;
    token?: string;
    response?: any;
  };
  error?: string;
}

// Demo user credentials for authentication
const DEMO_CREDENTIALS = {
  email: 'demo.anesthesiologist@ramq-scan.com',
  password: 'DemoAnesth2025!'
};

// Cache for authentication token
let authToken: string | null = null;

export interface VisitForSubmission {
  id: number;
  nam: string;
  patient_age: number;
  establishment_code: string;
  date: string;
  heure: string;
  acte_code: string;
  majoration_percent: number;
  is_garde: boolean;
  validated: boolean;
}

export class RAMQService {
  /**
   * Authenticate with the backend to get a token
   */
  private static async authenticate(): Promise<string | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(DEMO_CREDENTIALS),
      });

      if (!response.ok) {
        console.error('Authentication failed:', response.statusText);
        return null;
      }

      const result = await response.json();
      return result.token || null;
    } catch (error) {
      console.error('Authentication error:', error);
      return null;
    }
  }

  /**
   * Get authentication token (cached or fresh)
   */
  private static async getAuthToken(): Promise<string | null> {
    if (!authToken) {
      authToken = await this.authenticate();
    }
    return authToken;
  }

  /**
   * Submit a single visit to RAMQ using real endpoint
   */
  static async submitVisit(visitId: number): Promise<RAMQSubmissionResult> {
    try {
      // Get authentication token
      const token = await this.getAuthToken();
      if (!token) {
        return {
          success: false,
          message: 'Authentication failed - unable to get token'
        };
      }

          const response = await fetch(`${API_BASE_URL}/visits/submit-to-ramq`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          visitId: visitId.toString(),
          userId: '05a1490c-d9df-4293-9935-a66b2834aea6' // Demo user ID
        }),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          message: result.error || 'Failed to submit to RAMQ',
          data: result.data
        };
      }

      return {
        success: true,
        message: result.message || 'Successfully submitted to RAMQ',
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Network error'
      };
    }
  }

  /**
   * Submit multiple visits to RAMQ
   */
  static async submitMultipleVisits(visitIds: number[]): Promise<RAMQSubmissionResult[]> {
    const results = await Promise.all(
      visitIds.map(visitId => this.submitVisit(visitId))
    );
    return results;
  }

  /**
   * Get RAMQ service status
   */
  static async getStatus(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/rfp/status`);
      const result = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: result.error || 'Failed to get RAMQ status'
        };
      }

      return {
        success: true,
        data: result.data
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error'
      };
    }
  }
}
