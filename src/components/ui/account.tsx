"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { UserIcon, LogInIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import AuthPrompt from "@/components/auth/AuthPrompt";


const Acccount = () => {
  const { user, isLoading: isAuthLoading, signIn } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div>
      {isAuthLoading ? (
        // Optional: Show a loading indicator while checking auth status
        <div className="text-white">Loading...</div>
      ) : user ? (
        <Link
          href="/my-reviews"
          className="flex items-center gap-2 text-white hover:text-gray-300 transition"
        >
          <UserIcon size={18} />
          <span>My Reviews</span>
        </Link>
      ) : (
        <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
          <DialogTrigger asChild>
            <Button
              variant="outline"
              className="flex items-center gap-2 border-gray-600 text-white hover:bg-gray-800 hover:text-gray-200"
            >
              <LogInIcon size={18} />
              <span>Login</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] bg-black border-[#272727] p-0">
            {/* Use AuthPrompt directly, remove its default overlay styles */}
            <AuthPrompt
              promptMessage="Log in to view your reviews and submit new ones."
              className="relative p-6" // Remove absolute positioning and background overlay
              containerClassName="bg-transparent border-none p-0" // Remove container styles
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Acccount;
