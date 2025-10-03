"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Step1Identity } from "@/components/forms/onboarding/Step1Identity";
import { Step2Professional } from "@/components/forms/onboarding/Step2Professional";
import { Step3Establishments } from "@/components/forms/onboarding/Step3Establishments";
import { Step4Confirmation } from "@/components/forms/onboarding/Step4Confirmation";
import { Form } from "@/components/ui/form";
import { defaultValues, onboardingSchema, type OnboardingValues, stepFieldMap } from "@/components/forms/onboarding/schema";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getOnboardingProgress, isOnboardingComplete, type UserData } from "@/lib/onboarding-utils";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<UserData | null>(null);
  
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues,
    mode: "onChange",
  });

  // Check authentication status and onboarding progress
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          // User is not authenticated, redirect to login
          router.push('/login?message=Please login to access onboarding');
          return;
        }

        setIsAuthenticated(true);
        
        // Store token in localStorage for API calls
        if (typeof window !== 'undefined') {
          window.localStorage.setItem('auth_token', session.access_token);
        }
        
        // Get user data to check onboarding progress
        try {
          const userResponse = await fetch('/api/me', {
            headers: { Authorization: `Bearer ${session.access_token}` },
            cache: 'no-store',
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            setUserData(userData);
            
            // Check if onboarding is already complete
            if (isOnboardingComplete(userData)) {
              // User has completed onboarding, redirect to dashboard
              router.push('/dashboard');
              return;
            }
            
            // Determine the correct step based on user data
            const progress = getOnboardingProgress(userData);
            setCurrentStep(progress.currentStep);
            
            // Pre-fill form with existing data
            if (userData.first_name) form.setValue('firstName', userData.first_name);
            if (userData.last_name) form.setValue('lastName', userData.last_name);
            if (userData.phone) form.setValue('phone', userData.phone);
            if (userData.professional_id) form.setValue('ramqId', userData.professional_id);
            if (userData.specialty_code) form.setValue('speciality', userData.specialty_code);
            
          } else {
            console.error('Failed to fetch user data');
          }
        } catch (e) {
          console.error('Initial /api/me upsert failed:', e);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router, form]);

  const totalSteps = 4;

  const handleNext = async () => {
    const fields = stepFieldMap[currentStep];
    const valid = await form.trigger(fields as (keyof typeof form.formState.defaultValues)[], { shouldFocus: true });
    if (!valid) return;
    if (currentStep < totalSteps) setCurrentStep(currentStep + 1);
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkipEstablishments = () => {
    form.setValue("establishments", []);
    if (currentStep === 3) setCurrentStep(4);
  };

  const onSubmit = async (values: OnboardingValues) => {
    try {
      if (!isAuthenticated) {
        router.push('/login?message=Please login to complete your profile setup');
        return;
      }

      // Find the selected specialty name from the specialty code
      const selectedSpecialty = values.speciality ? 
        await fetch('/api/specialties')
          .then(res => res.json())
          .then(specialties => specialties.find((s: any) => s.code === values.speciality))
          .catch(() => null) : null;

      // Prepare the data to send to backend
      const userData = {
        firstName: values.firstName,
        lastName: values.lastName,
        phone: values.phone,
        professionalId: values.ramqId,
        specialtyCode: values.speciality,
        specialtyName: selectedSpecialty?.name || '',
        establishments: values.establishments || []
      };

      // Send data to backend
      const response = await fetch('/api/me', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        // Onboarding complete, redirect to dashboard
        router.push('/dashboard');
      } else {
        console.error('Failed to save user data');
      }
    } catch (error) {
      console.error('Error submitting onboarding data:', error);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading onboarding...</p>
        </div>
      </div>
    );
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
              <p className="text-muted-foreground mb-4">
                You need to be logged in to access the onboarding process.
              </p>
              <Button onClick={() => router.push('/login')} className="w-full">
                Go to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl">
        <CardContent className="p-6">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenue sur MedQ
            </h1>
            <p className="text-gray-600">
              Configurons votre profil professionnel
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Étape {currentStep} sur {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
          </div>

          {/* Form Content */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {currentStep === 1 && <Step1Identity />}
              {currentStep === 2 && <Step2Professional />}
              {currentStep === 3 && <Step3Establishments />}
               {currentStep === 4 && <Step4Confirmation />}

              {/* Navigation Buttons */}
              <CardFooter className="flex justify-between pt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                >
                  Précédent
                </Button>
                
                <div className="flex gap-2">
                  {currentStep === 3 && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleSkipEstablishments}
                    >
                      Passer
                    </Button>
                  )}
                  
                  {currentStep < totalSteps ? (
                    <Button type="button" onClick={handleNext}>
                      Suivant
                    </Button>
                  ) : (
                    <Button type="submit">
                      Terminer
                    </Button>
                  )}
                </div>
              </CardFooter>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}