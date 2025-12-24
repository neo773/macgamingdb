'use client';
import React, { useState } from 'react';
import { LogInIcon, Star } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import AuthPrompt from '@/modules/auth/components/AuthPrompt';
import { authClient } from '@/lib/auth/auth-client';

const Acccount = () => {
  const { useSession } = authClient;
  const { data: session, isPending } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);

  if (!isPending && session?.user?.id) {
    return (
      <Link
        href="/my-reviews"
        className="text-gray-300 hover:text-white px-3 py-1 transition-colors flex items-center gap-2"
      >
        <Star className="size-4" />
        My Reviews
      </Link>
    );
  }

  if (isPending) {
    return null;
  }

  return (
    <Dialog
      open={isAuthModalOpen}
      onOpenChange={(open) => {
        setIsAuthModalOpen(open);
        if (!open) {
          setMagicLinkSent(false);
        }
      }}
    >
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
        <DialogTitle className="sr-only">Login</DialogTitle>
        <AuthPrompt
          promptMessage="Log in to view your reviews and submit new ones."
          className="relative p-6"
          containerClassName="bg-transparent border-none p-0"
          magicLinkSent={magicLinkSent}
          onMagicLinkSent={() => setMagicLinkSent(true)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Acccount;
