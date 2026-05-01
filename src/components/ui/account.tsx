'use client';

import React, { useState } from 'react';
import { Library, LogInIcon, LogOut, Settings, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserAvatar } from '@/components/ui/user-avatar';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AuthPrompt from '@/modules/auth/components/AuthPrompt';
import { authClient } from '@/lib/auth/auth-client';

const Account = () => {
  const { useSession } = authClient;
  const { data: session, isPending } = useSession();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const router = useRouter();

  if (isPending) {
    return null;
  }

  if (session?.user?.id) {
    const avatarName = session.user.name || session.user.email || session.user.id;

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="size-8 rounded-full overflow-hidden ring-2 ring-transparent hover:ring-white/20 transition-all cursor-pointer">
            <UserAvatar size={32} name={avatarName} />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-48 bg-[#171717e0] backdrop-blur-md border-white/10"
        >
          <DropdownMenuItem asChild>
            <Link
              href="/library"
              className="flex items-center gap-2 cursor-pointer focus:bg-white/90 focus:text-black"
            >
              <Library className="size-4" />
              My Library
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/my-reviews"
              className="flex items-center gap-2 cursor-pointer focus:bg-white/90 focus:text-black"
            >
              <Star className="size-4" />
              My Reviews
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link
              href="/profile"
              className="flex items-center gap-2 cursor-pointer focus:bg-white/90 focus:text-black"
            >
              <Settings className="size-4" />
              Account Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="bg-white/10" />
          <DropdownMenuItem
            className="flex items-center gap-2 text-red-400 focus:bg-red-500/10 focus:text-red-300 cursor-pointer"
            onClick={async () => {
              await authClient.signOut();
              router.push('/');
              router.refresh();
            }}
          >
            <LogOut className="size-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
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
      <DialogContent className="sm:max-w-[425px] bg-black border-[#272727] p-0 rounded-3xl">
        <DialogTitle className="sr-only">Login</DialogTitle>
        <AuthPrompt
          promptMessage="Log in to view your reviews and submit new ones."
          className="p-6"
          magicLinkSent={magicLinkSent}
          onMagicLinkSent={() => setMagicLinkSent(true)}
        />
      </DialogContent>
    </Dialog>
  );
};

export default Account;
