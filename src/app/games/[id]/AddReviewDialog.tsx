"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { useMediaQuery } from "@/lib/hooks/useMediaQuery";
import ReviewContentWrapper from "./ReviewContentWrapper";
import { ScrollArea } from "@/components/ui/scroll-area";

type AddReviewDialogProps = {
  gameId: string;
  gameName: string;
};

export default function AddReviewDialog({
  gameId,
  gameName,
}: AddReviewDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { isLoading: isAuthLoading } = useAuth();

  // If loading auth, show a loading state
  if (isAuthLoading) {
    return <Button disabled>Loading...</Button>;
  }

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button size={"lg"}>
            <PlusIcon />
            Add Experience Report
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-0 pb-0 border border-[#272727]">
          <ScrollArea>
            <ReviewContentWrapper
              gameId={gameId}
              gameName={gameName}
              onOpenChange={setOpen}
              onClose={() => setOpen(false)}
              isDrawer
            />
          </ScrollArea>
          <DrawerClose className="sr-only">Close</DrawerClose>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size={"lg"}>
          <PlusIcon />
          Add Experience Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] rounded-3xl bg-black border border-[#272727]">
        <ReviewContentWrapper
          gameId={gameId}
          gameName={gameName}
          onOpenChange={setOpen}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
