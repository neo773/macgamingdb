"use client";

import React, { SVGProps } from "react";
import { Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "../ui/drawer";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";

interface DonationDialogProps {
  children: React.ReactNode;
}
const PatreonLogo = (props: SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 749.3 227.1" {...props}>
    <path d="M222.8 85.4c0-3.4 2.5-5.6 6.4-5.6h18.6c16.9 0 28.3 9.3 28.3 22.9S264.8 126 247.8 126h-2.6c-6.5 0-9.8 3.4-9.8 8.8V150c0 4.3-2.5 7-6.3 7s-6.3-2.7-6.3-7V85.4Zm12.6 19.3c0 6.8 3.5 10.1 10.1 10.1h1.6c9.3 0 16.1-3.8 16.1-12.1s-6.8-12.1-16.1-12.1h-1.6c-6.6 0-10.1 3.2-10.1 10.1v4.1Zm40.7 46.4c0 3.6 2.5 5.9 6.3 5.9s4.8-1.6 6.1-5l2.3-6.1c1.8-4.9 5.1-7.1 8.6-7.1h20.5c3.6 0 6.8 2.3 8.6 7.1l2.3 6.1c1.3 3.4 3.6 5 6.1 5 3.8 0 6.3-2.4 6.3-5.9s-.2-2.2-.6-3.4l-24.5-63.8c-1.5-3.9-5-5.8-8.3-5.8s-6.8 1.9-8.3 5.8L277 147.7c-.4 1.2-.6 2.4-.6 3.4Zm23.9-29c0-1.2.3-2.3.9-3.9l4.6-12.9c.9-2.5 2.4-3.7 4.1-3.7s3.2 1.2 4.1 3.7l4.6 12.9c.5 1.6.9 2.7.9 3.9 0 3.2-1.8 5.5-6.7 5.5h-5.8c-4.9 0-6.7-2.3-6.7-5.5Zm39-36.5c0-3.5 2.5-5.8 6.5-5.8h49.7c4 0 6.5 2.4 6.5 5.8s-2.5 5.8-6.5 5.8h-8.3c-6.6 0-10.2 3.4-10.2 11v47.4c0 4.4-2.5 7.1-6.4 7.1s-6.4-2.7-6.4-7.1v-47.4c0-7.7-3.6-11-10.2-11h-8.3c-4 0-6.5-2.4-6.5-5.8Zm74.4 64.4c0 4.3 2.5 7 6.3 7s6.3-2.7 6.3-7v-17.2c0-4.9 2.8-6.9 6.3-6.9h.9c2.3 0 4.5 1.4 5.9 3.5l16.4 24.1c1.5 2.3 3.5 3.6 5.9 3.6s5.8-2.7 5.8-5.9-.4-2.7-1.4-4.1l-10.9-15.3c-1.3-1.8-1.8-3.4-1.8-4.6 0-2.7 2.4-4.6 5.2-6.7 5.1-3.8 10.6-8.8 10.6-18.3s-10.4-22.3-27.5-22.3h-21.7c-3.9 0-6.3 2.3-6.3 5.6v64.6Zm12.5-46.3v-3.2c0-7 3.7-9.9 9.3-9.9h5.4c9.3 0 15.2 3.5 15.2 11.5s-6.3 11.7-15.6 11.7h-5.1c-5.6 0-9.3-2.9-9.3-9.9Zm58.9 46.1V85.4c0-3.4 2.4-5.6 6.3-5.6H532c3.9 0 6.3 2.3 6.3 5.6S535.9 91 532 91h-25.8c-5.1 0-8.8 3-8.8 8.8v2.4c0 5.7 3.7 8.8 8.8 8.8h20c3.9 0 6.3 2.3 6.3 5.6s-2.4 5.6-6.3 5.6H507c-5.1 0-9.5 3.1-9.5 9.5v3c0 6.4 4.4 9.5 9.5 9.5h25.1c3.9 0 6.3 2.3 6.3 5.6s-2.4 5.6-6.3 5.6h-40.9c-3.9 0-6.3-2.3-6.3-5.6Zm60.9-32.2c0-23.3 17.5-39.4 38-39.4s38 16.1 38 39.4-17.5 39.4-38 39.4-38-16.1-38-39.4Zm14.2 0c0 16.4 9.7 26.9 23.8 26.9s23.8-10.5 23.8-26.9-9.7-26.9-23.8-26.9-23.8 10.4-23.8 26.9Zm76.9 32.4c0 4.3 2.5 7 6.3 7s6.3-2.7 6.3-7v-33.1c0-4 2.4-5.9 4.9-5.9s3.6 1.1 4.8 3l20.8 34.7c2.8 4.8 5.4 8.3 10.7 8.3s8.8-3.7 8.8-9.6V85.2c0-4.3-2.5-7-6.3-7s-6.3 2.7-6.3 7v33.1c0 4-2.4 5.9-4.9 5.9s-3.6-1.1-4.8-3l-20.8-34.7c-2.8-4.8-5.4-8.3-10.7-8.3s-8.8 3.7-8.8 9.6V150ZM169.2 87.5c0-16.7-13-30.3-28.2-35.2-18.9-6.1-43.8-5.2-61.9 3.3-21.9 10.3-28.7 32.9-29 55.5-.2 18.5 1.6 67.4 29.2 67.7 20.5.3 23.5-26.1 33-38.8 6.7-9 15.4-11.6 26.1-14.2 18.4-4.5 30.9-19 30.8-38.2Z" />
  </svg>
)

export const DonationDialog: React.FC<DonationDialogProps> = ({ children }) => {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  const content = (
    <div className="flex flex-col gap-4">
      <p className="text-gray-300 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/20 rounded-lg p-2 text-center">
        Help keep MGDB ad-free and running! Your support helps us maintain and
        improve the platform.
      </p>
      <div className="flex flex-col gap-4 rounded-lg overflow-hidden">
        <div className="flex items-center justify-center">
          <a
            href="https://www.patreon.com/huzef/membership"
            className="bg-white rounded-full p-1.5 w-[200px] flex items-center justify-center hover:bg-white/80 transition-all duration-300"
            target="_blank"
          >
            <PatreonLogo className="w-24" />
          </a>
        </div>
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
