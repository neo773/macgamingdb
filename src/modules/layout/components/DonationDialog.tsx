'use client';

import React from 'react';
import { Heart } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useMediaQuery } from '@uidotdev/usehooks';

interface DonationDialogProps {
  children: React.ReactNode;
}

export const DonationDialog: React.FC<DonationDialogProps> = ({ children }) => {
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const content = (
    <div className="flex flex-col gap-4">
      <p className="text-gray-300 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-2 text-center">
        Help keep MGDB ad-free and running! Your support helps us maintain and
        improve the platform.
      </p>
      <div className="flex flex-col gap-4 rounded-lg overflow-hidden">
        <iframe
          src="https://buymeacoffee.com/widget/page/huzef?color=%23FFDD00&description=Support%20me%20on%20Buy%20me%20a%20coffee%21"
          loading="eager"
          className="w-full h-140"
        />
      </div>
      <p className="text-sm text-gray-300 text-center">
        Every contribution, no matter how small, makes a difference! ❤️
      </p>
    </div>
  );

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="bg-primary-gradient overflow-y-scroll max-h-screen">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 w-full justify-center">
              <Heart className="size-5 text-red-500" />
              Support MacGamingDB
            </DialogTitle>
            <DialogDescription className="text-center"></DialogDescription>
          </DialogHeader>
          {content}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent className="bg-primary-gradient">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2 w-full justify-center">
            <Heart className="size-5 text-red-500" />
            Support MacGamingDB
          </DrawerTitle>
          <DrawerDescription className="text-center"></DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-4">{content}</div>
      </DrawerContent>
    </Drawer>
  );
};
