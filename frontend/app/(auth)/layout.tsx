'use client';

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePathname } from "next/navigation";

const authPaths = ["/login", "/register"] as const; // in future add forgotpassword
type AuthPath = (typeof authPaths)[number]; // List of valid auth paths


// meta data for title and description
const meta: Record<AuthPath, { title: string; description: string }> = {
  "/login": {
    title: "Login",
    description: "Enter your email and password to log in",
  },
  "/register": {
    title: "Registration Form",
    description: "Enter your details to register",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const currentTab: AuthPath = authPaths.includes(pathname as AuthPath)
    ? (pathname as AuthPath)
    : "/login"; // fallback

  const { title, description } = meta[currentTab];

  return (
    <main className="flex-1 p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-center min-h-screen">
      <Tabs value={currentTab} className="w-[400px]">
        <TabsList>
          <TabsTrigger value="/login" asChild>
            <Link href="/login">Login</Link>
          </TabsTrigger>
          <TabsTrigger value="/register" asChild>
            <Link href="/register">Register</Link>
          </TabsTrigger>
        </TabsList>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>
            <TabsContent value={currentTab} key={currentTab}>
              {children}
            </TabsContent>
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" size="sm">google auth</Button>
            <Button variant="outline" size="sm">git hub aut</Button>
            <Button variant="outline" size="sm">some diff auth</Button>
          </CardFooter>
        </Card>
      </Tabs>
    </main>
  )
}