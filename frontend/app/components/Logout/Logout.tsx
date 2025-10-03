"use client";

import { useState } from "react";
import { LogoutConfirmDialog } from "./LogoutConfirmDialog";

export function Logout({ children }: { children: React.ReactNode }) {
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const handleLogoutClick = () => {
    setShowConfirmDialog(true);
  };

  return (
    <>
      <button 
        onClick={handleLogoutClick}
        className="w-full text-left"
      >
        {children}
      </button>
      
      <LogoutConfirmDialog 
        open={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
      />
    </>
  );
}