"use client";

import { useState } from "react";
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

export default function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues,
    mode: "onChange",
  });

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

  const onSubmit = (values: OnboardingValues) => {
    console.log("Onboarding completed with data:", values);
    alert("Onboarding terminé ! Voir la console pour les données.");
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
                <div className="w-full">
                  {currentStep < totalSteps ? (
                    currentStep === 3 ? (
                      <Button 
                        type="button" 
                        onClick={hasEstablishments ? handleNext : handleSkipEstablishments} 
                        className="w-full"
                        variant={hasEstablishments ? "default" : "secondary"}
                      >
                        {hasEstablishments ? "Continuer →" : "Passer pour l'instant"}
                      </Button>
                    ) : (
                      <Button type="button" onClick={handleNext} className="w-full">
                        Continuer <span className="ml-1">→</span>
                      </Button>
                    )
                  ) : (
                    <Button type="submit" disabled={!form.watch("termsAccepted")} className="w-full">
                      Terminer
                    </Button>
                  )}
                </div>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
}