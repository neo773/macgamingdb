'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogTrigger } from 'macgamingdb-ui/feedback/Dialog';
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerClose,
} from 'macgamingdb-ui/feedback/Drawer';
import { Button } from 'macgamingdb-ui/input/Button';
import { PlusIcon } from 'lucide-react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import CreateReviewForm from './CreateReviewForm';
import { ScrollArea } from 'macgamingdb-ui/layout/ScrollArea';

type AddReviewDialogProps = {
  gameId: string;
  gameName: string;
};

export default function CreateReviewDialog({
  gameId,
  gameName,
}: AddReviewDialogProps) {
  const [open, setOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width: 768px)');

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          <Button size={'lg'}>
            <PlusIcon />
            Add Experience Report
          </Button>
        </DrawerTrigger>
        <DrawerContent className="px-0 pb-0 border border-[#272727]">
          <ScrollArea>
            <CreateReviewForm
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
        <Button size={'lg'}>
          <PlusIcon />
          Add Experience Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[calc(100vh-20px)] overflow-y-scroll rounded-3xl bg-primary-gradient border border-[#272727]">
        <CreateReviewForm
          gameId={gameId}
          gameName={gameName}
          onOpenChange={setOpen}
          onClose={() => setOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
