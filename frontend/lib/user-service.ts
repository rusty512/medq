"use client";

import { createClient } from './supabase/client';

export interface Establishment {
  id: number;
  code: string;
  name: string;
  address: string | null;
  category: string | null;
  establishment_type: string | null;
  region_code: string | null;
  region_name: string | null;
  municipality: string | null;
  postal_code: string | null;
  is_active: boolean;
  codes: string[];
  created_at: string;
  updated_at: string;
}

export interface UserEstablishment {
  id: number;
  user_id: number;
  establishment_id: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  establishment: Establishment;
}

export interface UserData {
  id: number;
  supabase_uid: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  professional_id: string | null;
  specialty_code: string | null;
  specialty_name: string | null;
  default_establishment_id: number | null;
  default_establishment: Establishment | null;
  establishments: UserEstablishment[];
  created_at: string;
  updated_at: string;
}

export class UserService {
  private static supabase = createClient();

  /**
   * Fetch current user data from the API
   */
  static async getCurrentUser(): Promise<UserData | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session?.access_token) {
        return null;
      }

      const response = await fetch('/api/me', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error('Failed to fetch user data:', response.statusText);
        return null;
      }

      const userData = await response.json();
      console.log('UserService.getCurrentUser() received:', userData);
      return userData;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  }

  /**
   * Update user data
   */
  static async updateUser(updates: Partial<UserData>): Promise<UserData | null> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      // Convert snake_case to camelCase for backend API
      const backendUpdates = {
        firstName: updates.first_name,
        lastName: updates.last_name,
        professionalId: updates.professional_id,
        specialtyCode: updates.specialty_code,
        specialtyName: updates.specialty_name,
        phone: updates.phone,
      };

      const response = await fetch('/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(backendUpdates),
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`Failed to update user: ${response.statusText}`);
      }

      const userData = await response.json();
      return userData;
    } catch (error) {
      console.error('Error updating user data:', error);
      return null;
    }
  }

  /**
   * Get user display name
   */
  static getUserDisplayName(user: UserData | null): string {
    if (!user) return 'User';
    
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name}`;
    }
    
    if (user.first_name) return user.first_name;
    if (user.last_name) return user.last_name;
    
    return 'User';
  }

  /**
   * Get user initials
   */
  static getUserInitials(user: UserData | null): string {
    if (!user) return 'U';
    
    const firstInitial = user.first_name?.charAt(0)?.toUpperCase() || '';
    const lastInitial = user.last_name?.charAt(0)?.toUpperCase() || '';
    
    return (firstInitial + lastInitial) || 'U';
  }

  /**
   * Add establishment to user
   */
  static async addEstablishment(establishmentId: number): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      console.log('UserService - Session check:', {
        hasSession: !!session,
        hasAccessToken: !!session?.access_token,
        tokenLength: session?.access_token?.length,
        establishmentId
      });
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch('/api/me/establishments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ establishmentId }),
        cache: 'no-store',
      });

      console.log('UserService - Response:', {
        ok: response.ok,
        status: response.status,
        statusText: response.statusText
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.log('UserService - Error response:', errorText);
      }

      return response.ok;
    } catch (error) {
      console.error('Error adding establishment:', error);
      return false;
    }
  }

  /**
   * Remove establishment from user
   */
  static async removeEstablishment(establishmentId: number): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch(`/api/me/establishments/${establishmentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
        cache: 'no-store',
      });

      return response.ok;
    } catch (error) {
      console.error('Error removing establishment:', error);
      return false;
    }
  }

  /**
   * Set default establishment for user
   */
  static async setDefaultEstablishment(establishmentId: number): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (!session?.access_token) {
        throw new Error('No active session');
      }

      const response = await fetch('/api/me/establishments/default', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ establishmentId }),
        cache: 'no-store',
      });

      return response.ok;
    } catch (error) {
      console.error('Error setting default establishment:', error);
      return false;
    }
  }
}
