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
import { supabase } from "@/lib/supabase-client";

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues,
    mode: "onChange",
  });

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setIsAuthenticated(true);
          // Store token in localStorage for API calls
          if (typeof window !== 'undefined') {
            window.localStorage.setItem('auth_token', session.access_token);
          }
          // Ensure the app DB has an upserted user row
          try {
            await fetch('/api/me', {
              headers: { Authorization: `Bearer ${session.access_token}` },
              cache: 'no-store',
            });
          } catch (e) {
            // eslint-disable-next-line no-console
            console.error('Initial /api/me upsert failed:', e);
          }
        } else {
          // Check if there's a pending onboarding from signup
          const pendingOnboarding = localStorage.getItem('pendingOnboarding');
          if (pendingOnboarding) {
            console.log('Pending onboarding data found, user may need to login');
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

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
        // If not authenticated, store data in localStorage and redirect to login
        const onboardingData = {
          firstName: values.firstName,
          lastName: values.lastName,
          professionalId: values.ramqId,
          specialtyCode: values.speciality,
          establishments: values.establishments || []
        };
        
        localStorage.setItem('pendingOnboarding', JSON.stringify(onboardingData));
        router.push('/login?message=onboarding-pending');
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
        specialtyName: selectedSpecialty?.name || null,
        establishments: values.establishments || []
      };

      // Save onboarding data to backend
      const response = await fetch('/api/me', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to save onboarding data:', errorData);
        alert('Erreur lors de la sauvegarde des données. Veuillez réessayer.');
        return;
      }

      // Success - move to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error('Error saving onboarding data:', error);
      alert('Une erreur inattendue s\'est produite. Veuillez réessayer.');
    }
  };

  const getStepInfo = () => {
    switch (currentStep) {
      case 1:
        return {
          title: "Bienvenue sur MedQ",
          subtitle: "Veuillez remplir vos informations personnelles."
        };
      case 2:
        return {
          title: "Informations professionnelles",
          subtitle: "Complétez vos informations liées à votre pratique."
        };
      case 3:
        return {
          title: "Établissements",
          subtitle: "Ajoutez vos établissements de travail."
        };
      case 4:
        return {
          title: "Confirmation",
          subtitle: "Vérifiez vos informations avant de terminer."
        };
      default:
        return { title: "", subtitle: "" };
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <Step1Identity />;
      case 2:
        return <Step2Professional />;
      case 3:
        return <Step3Establishments />;
      case 4:
        return (
          <Step4Confirmation
            formData={form.getValues()}
            setFormData={(d: Partial<OnboardingValues>)=>{Object.entries(d).forEach(([k,v])=>form.setValue(k as keyof OnboardingValues,v));}}
            goToStep={(step: number) => setCurrentStep(step)}
          />
        );
      default:
        return null;
    }
  };

  const stepInfo = getStepInfo();
  const establishments = form.watch("establishments");
  const hasEstablishments = establishments && establishments.length > 0;

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
        <div className="text-center">
          <div className="text-lg font-medium">Chargement...</div>
          <div className="text-sm text-muted-foreground mt-2">Vérification de votre session</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md flex flex-col">
        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight">{stepInfo.title}</h1>
        <p className="text-muted-foreground max-w-prose mt-1">{stepInfo.subtitle}</p>
        <div className="mt-8">
          <div className="text-xs text-muted-foreground">Étape {currentStep} sur {totalSteps}</div>
          <Progress value={(currentStep / totalSteps) * 100} className="mt-2" />
        </div>
      </div>

      <div className="flex w-full max-w-md flex-col mt-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="shadow-sm">
              <CardContent className="px-6">
                {renderStep()}
              </CardContent>
              <CardFooter className="flex flex-col gap-3">
                {/* Continue/Finish button */}
                <div className="w-full">
                  {currentStep < totalSteps ? (
                    currentStep === 3 ? (
                      <Button 
                        type="button" 
                        onClick={hasEstablishments ? handleNext : handleSkipEstablishments} 
                        className="w-full"
                        variant={hasEstablishments ? "default" : "secondary"}
                      >
                        {hasEstablishments ? "Continuer" : "Passer pour l'instant"}
                      </Button>
                    ) : (
                      <Button type="button" onClick={handleNext} className="w-full">
                        Continuer
                      </Button>
                    )
                  ) : (
                    <Button type="submit" disabled={!form.watch("termsAccepted")} className="w-full">
                      Terminer
                    </Button>
                  )}
                </div>
                
                {/* Back button for steps 2, 3, and 4 */}
                {currentStep > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={handlePrevious}
                    className="w-full"
                  >
                    Retour
                  </Button>
                )}
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}