'use client';

import Link from 'next/link';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Account from '@/components/ui/account';
import { Map, Menu, Trophy, X, Heart, Github, Star, Settings, LogOut } from 'lucide-react';
import { LogoIcon } from './LogoIcon';
import { DonationDialog } from './DonationDialog';
import { authClient } from '@/lib/auth/auth-client';

const Header = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const router = useRouter();
  const { data: session } = authClient.useSession();

  return (
    <div className="relative w-full">
      <div className="relative z-50 mx-auto flex w-full max-w-7xl flex-col items-center justify-between px-4 md:flex-row ">
        <div className="w-full py-8 md:px-8 flex justify-center">
          <div className="max-w-7xl w-full">
            <nav className="bg-input/30 border-2 border-input/70 backdrop-blur-sm rounded-full px-5 py-3 grid grid-cols-[auto_1fr_auto] items-center shadow-lg">
              <Link href={'/'} className="flex items-center">
                <LogoIcon className="size-6 mr-2" />
                <h1 className="text-xl font-medium bg-clip-text text-transparent bg-gradient-to-b from-white to-gray-400">
                  MacGamingDB
                </h1>
              </Link>

              <div className="hidden sm:flex items-center justify-center space-x-4">
                <DonationDialog>
                  <button className="text-blue-400 hover:text-white px-3 py-1 transition-colors flex items-center gap-2 cursor-pointer">
                    <Heart className="size-4" />
                    Donate
                  </button>
                </DonationDialog>
                <Link
                  href="/contributors"
                  className="text-gray-300 hover:text-white px-3 py-1 transition-colors flex items-center gap-2"
                >
                  <Trophy className="size-4" />
                  Contributors
                </Link>
                <Link
                  href="https://macgamingdb.userjot.com/"
                  className="text-gray-300 hover:text-white px-3 py-1 transition-colors flex items-center gap-2"
                  target="_blank"
                >
                  <Map className="size-4" />
                  Roadmap
                </Link>
                <Link
                  href="https://github.com/neo773/macgamingdb"
                  className="text-gray-300 hover:text-white px-3 py-1 transition-colors flex items-center gap-2"
                  target="_blank"
                >
                  <Github className="size-4" />
                  GitHub
                </Link>
              </div>

              <div className="flex items-center justify-end">
                <button
                  className="sm:hidden text-gray-300 hover:text-white"
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  aria-label="Toggle mobile menu"
                >
                  {mobileMenuOpen ? (
                    <X className="size-6" />
                  ) : (
                    <Menu className="size-6" />
                  )}
                </button>
                <div className="hidden sm:flex">
                  <Account />
                </div>
              </div>
            </nav>

            {/* Mobile menu */}
            {mobileMenuOpen && (
              <div className="sm:hidden fixed top-[85px] left-0 right-0 mx-4 mt-4 bg-[#1B1B1D] border border-input/70 rounded-xl p-4 shadow-lg z-50">
                <div className="flex flex-col space-y-4">
                  <DonationDialog>
                    <button className="text-blue-400 hover:text-white px-3 py-2 transition-colors flex items-center gap-2 cursor-pointer w-full text-left">
                      <Heart className="size-4" />
                      Donate
                    </button>
                  </DonationDialog>
                  <Link
                    href="/contributors"
                    className="text-gray-300 hover:text-white px-3 py-2 transition-colors flex items-center gap-2"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Trophy className="size-4" />
                    Contributors
                  </Link>
                  <Link
                    href="https://macgamingdb.userjot.com/"
                    className="text-gray-300 hover:text-white px-3 py-2 transition-colors flex items-center gap-2"
                    target="_blank"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Map className="size-4" />
                    Roadmap
                  </Link>
                  <Link
                    href="https://github.com/neo773/macgamingdb"
                    className="text-gray-300 hover:text-white px-3 py-2 transition-colors flex items-center gap-2"
                    target="_blank"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Github className="size-4" />
                    GitHub
                  </Link>
                  {session?.user && (
                    <>
                      <div className="border-t border-white/10" />
                      <Link
                        href="/my-reviews"
                        className="text-gray-300 hover:text-white px-3 py-2 transition-colors flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Star className="size-4" />
                        My Reviews
                      </Link>
                      <Link
                        href="/profile"
                        className="text-gray-300 hover:text-white px-3 py-2 transition-colors flex items-center gap-2"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <Settings className="size-4" />
                        Account Settings
                      </Link>
                      <button
                        className="text-red-400 hover:text-red-300 px-3 py-2 transition-colors flex items-center gap-2 cursor-pointer w-full text-left"
                        onClick={async () => {
                          await authClient.signOut();
                          setMobileMenuOpen(false);
                          router.push('/');
                          router.refresh();
                        }}
                      >
                        <LogOut className="size-4" />
                        Sign Out
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
