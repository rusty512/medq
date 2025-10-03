"use client";

import { createClient } from './supabase/client';

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
}
