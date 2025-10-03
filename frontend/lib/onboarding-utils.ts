/**
 * Onboarding utilities for checking progress and completion status
 */

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

export interface OnboardingProgress {
  currentStep: number;
  completedSteps: number[];
  isComplete: boolean;
}

/**
 * Check if onboarding is complete based on user data
 */
export function isOnboardingComplete(userData: UserData | null): boolean {
  if (!userData) return false;
  
  // Check if all required fields are filled
  const hasBasicInfo = userData.first_name && userData.last_name;
  const hasProfessionalInfo = userData.professional_id && userData.specialty_code;
  
  return Boolean(hasBasicInfo && hasProfessionalInfo);
}

/**
 * Get onboarding progress based on user data
 */
export function getOnboardingProgress(userData: UserData | null): OnboardingProgress {
  if (!userData) {
    return {
      currentStep: 1,
      completedSteps: [],
      isComplete: false
    };
  }

  const completedSteps: number[] = [];
  let currentStep = 1;

  // Step 1: Basic identity (first_name, last_name)
  if (userData.first_name && userData.last_name) {
    completedSteps.push(1);
    currentStep = 2;
  }

  // Step 2: Professional info (professional_id, specialty_code)
  if (userData.professional_id && userData.specialty_code) {
    completedSteps.push(2);
    currentStep = 3;
  }

  // Step 3: Establishments (optional, but if user has establishments, they've completed this step)
  if (userData.default_establishment_id) {
    completedSteps.push(3);
    currentStep = 4;
  }

  // Step 4: Confirmation (if all previous steps are complete)
  if (completedSteps.length >= 2) { // At least basic info + professional info
    completedSteps.push(4);
    currentStep = 4;
  }

  return {
    currentStep,
    completedSteps,
    isComplete: isOnboardingComplete(userData)
  };
}

/**
 * Get the next incomplete step
 */
export function getNextIncompleteStep(userData: UserData | null): number {
  const progress = getOnboardingProgress(userData);
  return progress.currentStep;
}

/**
 * Check if a specific step is completed
 */
export function isStepCompleted(userData: UserData | null, step: number): boolean {
  const progress = getOnboardingProgress(userData);
  return progress.completedSteps.includes(step);
}
