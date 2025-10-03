"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { performLogout } from "@/lib/logout-utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

interface LogoutConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LogoutConfirmDialog({ open, onOpenChange }: LogoutConfirmDialogProps) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    
    setIsLoggingOut(true);
    
    try {
      console.log("🚪 Starting logout process...");
      
      // First, use AuthContext to clear local state
      await signOut();
      
      // Then use comprehensive logout utility
      const result = await performLogout({
        redirectTo: undefined, // We'll handle redirect manually
        clearStorage: true,
        showConfirmation: false
      });
      
      if (result.success) {
        console.log("✅ Logout successful");
        onOpenChange(false);
        router.push("/login");
      } else {
        throw new Error(result.error || "Logout failed");
      }
      
    } catch (error) {
      console.error("❌ Logout error:", error);
      
      // Even if logout fails, clear local state and redirect
      onOpenChange(false);
      router.push("/login");
      
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <LogOut className="h-5 w-5" />
            Confirmer la déconnexion
          </DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir vous déconnecter ? Vous devrez vous reconnecter pour accéder à votre compte.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoggingOut}
          >
            Annuler
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleLogout}
            disabled={isLoggingOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            {isLoggingOut ? "Déconnexion..." : "Se déconnecter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
