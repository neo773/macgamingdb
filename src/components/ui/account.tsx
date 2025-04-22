"use client";
import React, { useState } from "react";
import { LogInIcon, Star } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import AuthPrompt from "@/components/auth/AuthPrompt";
import { authClient } from "@/lib/auth-client";

const Acccount = () => {
  const { useSession } = authClient;
  const { data: session, isPending } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <div>
      {!isPending && (
        <>
          {session?.user?.id ? (
            <Link
              href="/my-reviews"
              className="text-gray-300 hover:text-white px-3 py-1 transition-colors flex items-center gap-2"
            >
              <Star className="size-4" />
              My Reviews
            </Link>
          ) : (
            <Dialog open={isAuthModalOpen} onOpenChange={setIsAuthModalOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 border-gray-600 text-white hover:bg-gray-800 hover:text-gray-200"
                >
                  <LogInIcon className="size-4" />
                  Login
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
        </>
      )}
    </div>
  );
};

export default Acccount;
