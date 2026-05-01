'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, RefreshCw, Unlink } from 'lucide-react';
import { toast } from 'sonner';
import { STEAM_LIBRARY_PRIVATE_CODE } from '@macgamingdb/server/services/steam-api';
import Header from '@/modules/layout/components/Header';
import Footer from '@/modules/layout/components/Footer';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { trpc } from '@/lib/trpc/provider';
import { FLOW_ERROR } from '@/lib/steam-openid/flowError';
import { LibraryGameCard } from '@/modules/library/components/LibraryGameCard';
import { SteamIcon } from '@/modules/library/components/SteamIcon';

function formatRelative(iso: string | null): string {
  if (!iso) return 'never';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.round(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

export default function LibraryClient() {
  const searchParams = useSearchParams();
  const [unlinkOpen, setUnlinkOpen] = useState(false);

  const status = trpc.library.status.useQuery();
  const list = trpc.library.list.useQuery(undefined, {
    enabled: status.data?.linked === true,
  });

  const sync = trpc.library.sync.useMutation();
  const unlink = trpc.library.unlink.useMutation();

  useEffect(() => {
    const err = searchParams.get('error');
    if (!err) return;
    if (err === FLOW_ERROR.PrivateLibrary) {
      toast.error(
        'Could not read your Steam library. Set your library to public and try again.',
      );
    } else if (
      err === FLOW_ERROR.VerifyFailed ||
      err === FLOW_ERROR.StateMismatch
    ) {
      toast.error('Steam sign-in failed. Try again.');
    }
  }, [searchParams]);

  const handleResync = () => {
    const id = toast.loading('Syncing your Steam library...');
    sync.mutate(undefined, {
      onSuccess: (res) => toast.success(`Synced ${res.count} games`, { id }),
      onError: (err) => {
        if (err.message === STEAM_LIBRARY_PRIVATE_CODE) {
          toast.error('Set your Steam library to public and try again.', {
            id,
          });
        } else {
          toast.error('Sync failed. Try again.', { id });
        }
      },
    });
  };

  const handleUnlink = () => {
    unlink.mutate(undefined, {
      onSuccess: () => {
        setUnlinkOpen(false);
        toast.success('Steam account unlinked');
      },
      onError: () => toast.error('Failed to unlink'),
    });
  };

  const linked = status.data?.linked === true;
  const games = list.data ?? [];

  return (
    <div className="min-h-dvh flex flex-col">
      <Header />
      <Container>
        <div className="mb-4">
          <Link
            href="/"
            className="text-blue-400 hover:text-blue-300 inline-flex items-center"
          >
            <ChevronLeft className="text-blue-400" />
            Home
          </Link>
        </div>

        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white">My Library</h1>
            {linked && (
              <p className="text-sm text-gray-400 mt-1 inline-flex items-center gap-1.5">
                <SteamIcon className="size-3.5 text-gray-400" />
                {games.length} games · Synced{' '}
                {formatRelative(status.data?.lastSyncedAt ?? null)}
              </p>
            )}
          </div>
          {linked && (
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleResync}
                disabled={sync.isPending}
                className="text-blue-400 hover:text-blue-300"
              >
                <RefreshCw
                  className={`size-4 ${sync.isPending ? 'animate-spin' : ''}`}
                />
                Resync
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setUnlinkOpen(true)}
                className="text-red-400 hover:text-red-300"
              >
                <Unlink className="size-4" />
                Unlink
              </Button>
            </div>
          )}
        </div>

        {status.isLoading ? (
          <p className="text-gray-500 text-sm">Loading...</p>
        ) : !linked ? (
          <Card className="bg-primary-gradient max-w-lg mx-auto">
            <CardContent className="py-16 flex flex-col items-center text-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white/5 border border-white/10">
                <SteamIcon className="size-7 text-white" />
              </div>
              <h2 className="text-xl text-white font-medium">
                Connect your Steam account
              </h2>
              <p className="text-sm text-gray-400 max-w-md">
                See which games in your Steam library run on Apple Silicon and
                how well they perform. Your Steam library must be set to public.
              </p>
              <a href="/api/connections/steam/start">
                <Button className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-500 text-white p-5">
                  Connect Steam Account
                </Button>
              </a>
            </CardContent>
          </Card>
        ) : list.isLoading ? (
          <p className="text-gray-500 text-sm">Loading library...</p>
        ) : games.length === 0 ? (
          <Card className="bg-primary-gradient max-w-lg mx-auto">
            <CardContent className="py-12 text-center text-gray-400">
              No games found in your Steam library.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {games.map((entry) => (
              <LibraryGameCard
                key={entry.externalGameId}
                appId={entry.externalGameId}
                name={entry.name}
                rating={entry.aggregatedPerformance}
                playtimeMinutes={entry.playtimeMinutes}
              />
            ))}
          </div>
        )}

        <Dialog open={unlinkOpen} onOpenChange={setUnlinkOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Unlink Steam account?</DialogTitle>
              <DialogDescription>
                Your library data will be removed. Your reviews and account stay
                intact. You can reconnect anytime.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="sm:justify-start">
              <Button
                variant="destructive"
                onClick={handleUnlink}
                disabled={unlink.isPending}
              >
                {unlink.isPending ? 'Unlinking...' : 'Unlink'}
              </Button>
              <DialogClose asChild>
                <Button variant="ghost">Cancel</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Container>
      <Footer />
    </div>
  );
}
