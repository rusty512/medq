"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PropsWithChildren } from "react";

interface Login05Props extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  footerText?: string;
  footerHref?: string;
  footerLinkText?: string;
}

export function Login05({
  children,
  title = "Se connecter",
  subtitle = "Entrez vos identifiants pour accéder à votre compte.",
  footerText = "Vous n'avez pas de compte?",
  footerHref = "/signup",
  footerLinkText = "Créer un compte",
}: Login05Props) {
  return (
    <div className="bg-background flex min-h-svh items-center justify-center px-6 py-10">
      <div className="w-full max-w-sm">
        <Card className="shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">{title}</CardTitle>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </CardHeader>
          <CardContent>
            {children}
          </CardContent>
          <CardFooter className="justify-center">
            <p className="text-sm text-muted-foreground">
              {footerText} {" "}
              <Link href={footerHref} className="font-medium underline underline-offset-4">
                {footerLinkText}
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}


