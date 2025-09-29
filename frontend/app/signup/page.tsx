import { SignupForm } from "@/components/forms/signup-form";

export default function SignupPage() {
  return (
    <div className="bg-background flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <SignupForm />
      </div>
    </div>
  );
}

