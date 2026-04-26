'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/modules/layout/components/Header';
import Footer from '@/modules/layout/components/Footer';
import { Container } from '@/components/ui/container';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { authClient } from '@/lib/auth/auth-client';

interface ProfileUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

export default function ProfileClient({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const [name, setName] = useState(user.name);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const handleSave = async () => {
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.name) return;

    setIsSaving(true);
    try {
      await authClient.updateUser({ name: trimmed });
      toast.success('Name updated');
      router.refresh();
    } catch {
      toast.error('Failed to update name');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setIsDeleting(true);
    try {
      await authClient.deleteUser();
      router.push('/');
      router.refresh();
    } catch {
      toast.error('Failed to delete account');
      setIsDeleting(false);
    }
  };

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

        <div className="flex justify-center">
          <div className="w-full max-w-md">
            <h1 className="text-2xl text-white font-semibold">
              Account Settings
            </h1>
            <Card className="shadow-lg mt-4 bg-primary-gradient">
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Email
                  </label>
                  <Input
                    value={user.email}
                    disabled
                    className="bg-gray-900/50 border-gray-700 text-gray-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-300">
                    Display Name
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your display name"
                    className="bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>

                <Button
                  onClick={handleSave}
                  disabled={
                    isSaving || !name.trim() || name.trim() === user.name
                  }
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
            <h1 className="text-2xl text-red-400 font-semibold mt-12">
              Danger Zone
            </h1>
            <Card className="shadow-lg mt-4 border border-red-500/20 bg-primary-gradient">
              <CardContent>
                <p className="text-white font-medium">Delete account</p>
                <p className="text-sm text-gray-400 mt-1">
                  Permanently delete your account and all associated data
                  including reviews. This action is irreversible.
                </p>
                <Button
                  variant="destructive"
                  className="mt-4"
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  Delete account
                </Button>
              </CardContent>
            </Card>

            <Dialog
              open={deleteDialogOpen}
              onOpenChange={(open) => {
                setDeleteDialogOpen(open);
                if (!open) setDeleteConfirm('');
              }}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Delete account</DialogTitle>
                  <DialogDescription>
                    This action is irreversible. All your data including
                    experience reports will be permanently deleted.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                  <p className="text-sm text-red-400 font-medium">
                    Are you sure you want to delete your account?
                  </p>
                  <p className="text-sm text-gray-400">
                    Type{' '}
                    <span className="font-mono font-semibold text-white bg-white/10 rounded px-1.5 py-0.5">
                      DELETE
                    </span>{' '}
                    to confirm.
                  </p>
                  <Input
                    value={deleteConfirm}
                    onChange={(e) => setDeleteConfirm(e.target.value)}
                    placeholder="DELETE"
                    className="bg-gray-900/50 border-gray-700 text-white"
                  />
                </div>

                <DialogFooter className="sm:justify-start">
                  <Button
                    variant="destructive"
                    onClick={handleDeleteAccount}
                    disabled={isDeleting || deleteConfirm !== 'DELETE'}
                  >
                    {isDeleting ? 'Deleting...' : 'Delete account'}
                  </Button>
                  <DialogClose asChild>
                    <Button variant="ghost">Cancel</Button>
                  </DialogClose>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </Container>
      <Footer />
    </div>
  );
}
